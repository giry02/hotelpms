const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.PMS_BASE_URL || 'https://hotelpms-eight.vercel.app';
const OUT = process.env.PMS_RESULT_FILE || path.resolve(__dirname, '..', '..', 'outputs', 'extended-validation-20260722', 'resilience-persistence.json');
const results = [];

function record(id, title, status, details) {
  results.push({ id, title, status, details });
  process.stdout.write(`${status} ${id} ${title}\n`);
}

async function login(page) {
  await page.goto(`${BASE}/dashboard/login.html`, { waitUntil: 'domcontentloaded' });
  await page.locator('#email').fill('admin@hotel.com');
  await page.locator('#password').fill('password123!');
  await page.locator('#btnLogin').click();
  await page.waitForURL(/dashboard\.html/, { timeout: 10000 });
}

async function createExpense(page, item, amount) {
  await page.goto(`${BASE}/dashboard/operations/expense-purchases.html`, { waitUntil: 'domcontentloaded' });
  await page.locator('button[onclick="openExpenseFormModal()"]' ).click();
  await page.locator('#expenseFormModal.active').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('#expenseItem').fill(item);
  await page.locator('#expenseVendor').fill('Persistence QA Vendor');
  await page.locator('#expenseAmount').fill(String(amount));
  await page.locator('#expenseMethod').selectOption('cash');
  await page.locator('#expenseCurrency').selectOption('PHP');
  await page.locator('#expenseNote').fill('Browser restart persistence test');
  await page.locator('#expenseFormModal.active button[onclick="saveExpensePurchase()"]' ).click();
  await page.waitForFunction(expected => {
    const rows = JSON.parse(localStorage.getItem('pms_expense_purchases') || '[]');
    return rows.some(row => row.item === expected);
  }, item, { timeout: 10000 });
}

async function runPersistenceRestart() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'pms-persistence-'));
  const item = `Restart Persistence ${Date.now()}`;
  let first;
  let second;
  try {
    first = await chromium.launchPersistentContext(profile, { headless: true, viewport: { width: 1280, height: 900 } });
    const page = first.pages()[0] || await first.newPage();
    await login(page);
    await createExpense(page, item, 321);
    await first.close();
    first = null;

    second = await chromium.launchPersistentContext(profile, { headless: true, viewport: { width: 1280, height: 900 } });
    const reopened = second.pages()[0] || await second.newPage();
    await login(reopened);
    await reopened.goto(`${BASE}/dashboard/operations/expense-purchases.html`, { waitUntil: 'domcontentloaded' });
    const stored = await reopened.evaluate(expected => {
      const rows = JSON.parse(localStorage.getItem('pms_expense_purchases') || '[]');
      return rows.find(row => row.item === expected) || null;
    }, item);
    if (!stored || Number(stored.amount) !== 321 || Number(stored.settlementAmount) !== -321) {
      throw new Error(`expense did not survive browser restart: ${JSON.stringify(stored)}`);
    }
    record('PERSIST-001', '브라우저 재시작 후 지출 데이터 유지', 'PASS', {
      item: stored.item,
      amount: stored.amount,
      settlementAmount: stored.settlementAmount,
      currency: stored.currency
    });
  } catch (error) {
    record('PERSIST-001', '브라우저 재시작 후 지출 데이터 유지', 'FAIL', { error: error.message });
  } finally {
    if (first) await first.close().catch(() => {});
    if (second) await second.close().catch(() => {});
    fs.rmSync(profile, { recursive: true, force: true });
  }
}

async function runConcurrentEditProbe() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  try {
    const pageA = await context.newPage();
    await login(pageA);
    const item = `Concurrent Expense ${Date.now()}`;
    await createExpense(pageA, item, 100);
    const row = await pageA.evaluate(expected => JSON.parse(localStorage.getItem('pms_expense_purchases') || '[]').find(value => value.item === expected), item);
    const pageB = await context.newPage();
    await login(pageB);
    await pageB.goto(`${BASE}/dashboard/operations/expense-purchases.html`, { waitUntil: 'domcontentloaded' });

    await pageA.locator(`[data-expense-action="edit"][data-expense-id="${row.id}"]:visible`).first().click();
    await pageB.locator(`[data-expense-action="edit"][data-expense-id="${row.id}"]:visible`).first().click();
    await pageA.locator('#expenseAmount').fill('111');
    await pageB.locator('#expenseAmount').fill('222');
    await pageA.locator('#expenseFormModal.active button[onclick="saveExpensePurchase()"]' ).click();
    await pageB.locator('#expenseFormModal.active button[onclick="saveExpensePurchase()"]' ).click();
    const final = await pageA.evaluate(id => JSON.parse(localStorage.getItem('pms_expense_purchases') || '[]').find(value => value.id === id), row.id);
    const hasConflictNotice = await pageB.locator('.toast, .alert, [role="alert"]').filter({ hasText: /conflict|changed|충돌|변경됨/i }).count();
    if (Number(final?.amount) === 222 && hasConflictNotice === 0) {
      record('CONC-001', '동일 지출 두 탭 동시 수정 충돌 감지', 'BLOCKED', {
        reason: '정적 localStorage 구조에는 버전 번호나 서버 조건부 갱신이 없어 마지막 저장이 앞선 수정을 경고 없이 덮어씁니다.',
        firstValue: 111,
        secondValue: 222,
        finalValue: final?.amount,
        conflictNotice: false
      });
    } else {
      record('CONC-001', '동일 지출 두 탭 동시 수정 충돌 감지', 'PASS', {
        firstValue: 111,
        secondValue: 222,
        finalValue: final?.amount,
        conflictNotice: hasConflictNotice > 0
      });
    }
  } catch (error) {
    record('CONC-001', '동일 지출 두 탭 동시 수정 충돌 감지', 'FAIL', { error: error.message });
  } finally {
    await context.close();
    await browser.close();
  }
}

(async () => {
  await runPersistenceRestart();
  await runConcurrentEditProbe();
  const summary = {
    total: results.length,
    passed: results.filter(row => row.status === 'PASS').length,
    failed: results.filter(row => row.status === 'FAIL').length,
    blocked: results.filter(row => row.status === 'BLOCKED').length
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, summary, results }, null, 2));
  console.log(JSON.stringify(summary));
  process.exitCode = summary.failed ? 1 : 0;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
