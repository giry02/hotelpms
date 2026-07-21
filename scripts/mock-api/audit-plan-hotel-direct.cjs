const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';
const RESULT_FILE = process.env.PMS_RESULT_FILE || path.join(ROOT, 'outputs', 'full-plan-20260719', '17-hotel-plan-direct.json');
const CASE_FILTER = new Set((process.env.PMS_CASES || '').split(',').map(value => value.trim()).filter(Boolean));
const CASE_TIMEOUT_MS = Number(process.env.PMS_CASE_TIMEOUT_MS || 25000);

function assert(condition, message, details = null) {
  if (condition) return;
  const error = new Error(message);
  error.details = details;
  throw error;
}

function httpOk(url) {
  return new Promise(resolve => {
    const client = new URL(url).protocol === 'https:' ? https : http;
    const request = client.get(url, response => {
      response.resume();
      resolve(response.statusCode < 400);
    });
    request.setTimeout(2500, () => {
      request.destroy();
      resolve(false);
    });
    request.on('error', () => resolve(false));
  });
}

function contentType(file) {
  return {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg'
  }[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

function serveStatic(port) {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, `http://127.0.0.1:${port}`);
    const safePath = path.normalize(decodeURIComponent(requestUrl.pathname)).replace(/^(\.\.[/\\])+/, '');
    const file = path.join(ROOT, safePath === path.sep ? 'index.html' : safePath);
    if (!file.startsWith(ROOT)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }
    fs.readFile(file, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end('Not found');
        return;
      }
      response.writeHead(200, { 'Content-Type': contentType(file) });
      response.end(data);
    });
  });
  return new Promise(resolve => {
    server.listen(port, '127.0.0.1', () => resolve(server));
    server.on('error', () => resolve(null));
  });
}

async function createContext(browser, language = 'ko') {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(lang => {
    sessionStorage.setItem('pms_logged_in', 'true');
    sessionStorage.setItem('admin_logged_in', 'true');
    localStorage.setItem('pms_lang', lang);
    localStorage.setItem('pms_admin_lang', lang);
    localStorage.setItem('pms_default_currency', 'PHP');
    localStorage.setItem('pms_currency', 'PHP');
  }, language);
  return context;
}

async function authenticationCases(browser, results) {
  for (const account of [
    { id: 'AUTH-003', status: 'leave', email: 'leave.qa@hotel.test', expected: /휴직|on leave/i },
    { id: 'AUTH-004', status: 'retired', email: 'retired.qa@hotel.test', expected: /퇴직|retired/i }
  ]) {
    await runCase(results, account.id, `${account.status} staff login is rejected with status guidance`, async () => {
      const { context, page, pageErrors } = await openPage(browser, 'dashboard/login.html', 'ko');
      try {
        await page.evaluate(data => {
          sessionStorage.removeItem('pms_logged_in');
          localStorage.setItem('pms_staff', JSON.stringify([{
            id: `QA-${data.status}`,
            name: `QA ${data.status}`,
            email: data.email,
            status: data.status,
            roleId: 'sys_desk'
          }]));
        }, account);
        await page.locator('#email').fill(account.email);
        await page.locator('#password').fill('ValidPassword1!');
        await page.locator('#btnLogin').click();
        await page.locator('#loginError.show').waitFor({ state: 'visible', timeout: 5000 });
        const evidence = await page.evaluate(() => ({
          message: document.querySelector('#loginError span')?.textContent?.trim() || '',
          session: sessionStorage.getItem('pms_logged_in'),
          path: location.pathname
        }));
        assert(account.expected.test(evidence.message), 'Staff status guidance is missing', evidence);
        assert(evidence.session !== 'true' && /login\.html$/.test(evidence.path), 'Inactive staff obtained a PMS session', evidence);
        assert(pageErrors.length === 0, 'Login validation raised JavaScript errors', pageErrors);
        return evidence;
      } finally {
        await context.close();
      }
    });
  }

  await runCase(results, 'AUTH-005', 'Required and malformed email validation stops login submission', async () => {
    const { context, page, pageErrors } = await openPage(browser, 'dashboard/login.html');
    try {
      await page.evaluate(() => sessionStorage.removeItem('pms_logged_in'));
      await page.locator('#email').fill('');
      await page.locator('#password').fill('');
      await page.locator('#btnLogin').click();
      const requiredMessage = await page.locator('#loginError span').textContent();
      await page.locator('#email').fill('invalid-email');
      await page.locator('#password').fill('ValidPassword1!');
      await page.locator('#btnLogin').click();
      const malformedMessage = await page.locator('#loginError span').textContent();
      const evidence = await page.evaluate(() => ({
        session: sessionStorage.getItem('pms_logged_in'),
        loading: document.getElementById('btnLogin')?.classList.contains('loading') || false,
        path: location.pathname
      }));
      assert(/이메일|email/i.test(requiredMessage || ''), 'Required-field guidance is missing', { requiredMessage });
      assert(/형식|valid email/i.test(malformedMessage || ''), 'Malformed-email guidance is missing', { malformedMessage });
      assert(evidence.session !== 'true' && !evidence.loading && /login\.html$/.test(evidence.path), 'Invalid login triggered a session or request state', evidence);
      assert(pageErrors.length === 0, 'Login validation raised JavaScript errors', pageErrors);
      return { requiredMessage, malformedMessage, ...evidence };
    } finally {
      await context.close();
    }
  });
}

async function expenseValidationCase(browser, results) {
  await runCase(results, 'EXP-008', 'Expense date is selectable and invalid amount values are rejected', async () => {
    const { context, page, pageErrors } = await openPage(browser, 'dashboard/operations/expense-purchases.html');
    try {
      await page.waitForFunction(() => typeof window.saveExpensePurchase === 'function');
      await page.evaluate(() => {
        window.showToast = message => { window.__qaExpenseToast = String(message || ''); };
        window.openExpenseFormModal();
      });
      await page.locator('#expenseDate').fill('2026-07-19');
      const buyerValue = await page.locator('#expenseBuyer option').first().getAttribute('value');
      assert(buyerValue, 'Expense buyer list has no registered staff');
      await page.locator('#expenseBuyer').selectOption(buyerValue);
      await page.locator('#expenseItem').fill('QA validation item');
      const before = await page.evaluate(() => JSON.parse(localStorage.getItem('pms_expense_purchases') || '[]').length);
      const attempts = [];
      for (const value of ['0', '-1']) {
        await page.locator('#expenseAmount').fill(value);
        await page.evaluate(() => window.saveExpensePurchase());
        attempts.push(await page.evaluate(input => ({
          input,
          count: JSON.parse(localStorage.getItem('pms_expense_purchases') || '[]').length,
          toast: window.__qaExpenseToast || ''
        }), value));
      }
      const textAccepted = await page.locator('#expenseAmount').evaluate(element => {
        element.value = 'abc';
        element.dispatchEvent(new Event('input', { bubbles: true }));
        return element.value;
      });
      await page.evaluate(() => window.saveExpensePurchase());
      attempts.push(await page.evaluate(input => ({
        input,
        count: JSON.parse(localStorage.getItem('pms_expense_purchases') || '[]').length,
        toast: window.__qaExpenseToast || ''
      }), 'abc'));
      assert(attempts.every(item => item.count === before), 'Invalid expense amount was persisted', { before, attempts });
      assert(textAccepted === '', 'Number input accepted alphabetic amount text', { textAccepted });
      assert(await page.locator('#expenseDate').inputValue() === '2026-07-19', 'Selected expense date was not retained');
      assert(pageErrors.length === 0, 'Expense validation raised JavaScript errors', pageErrors);
      return { before, attempts, selectedDate: '2026-07-19', textAccepted };
    } finally {
      await context.close();
    }
  });
}

async function openPage(browser, route, language = 'ko', init = null) {
  const context = await createContext(browser, language);
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('dialog', dialog => dialog.dismiss().catch(() => {}));
  const separator = route.includes('?') ? '&' : '?';
  await page.goto(`${BASE}/${route}${separator}plan-direct=${Date.now()}`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => document.readyState === 'complete' && document.body.offsetHeight > 0, null, { timeout: 20000 });
  return { context, page, pageErrors };
}

async function runCase(results, id, title, callback) {
  if (CASE_FILTER.size && !CASE_FILTER.has(id)) return;
  const startedAt = Date.now();
  try {
    let timer;
    const evidence = await Promise.race([
      callback(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Case timed out after ${CASE_TIMEOUT_MS}ms: ${id}`)), CASE_TIMEOUT_MS);
      })
    ]).finally(() => clearTimeout(timer));
    results.push({ id, title, status: 'PASS', durationMs: Date.now() - startedAt, evidence });
  } catch (error) {
    results.push({
      id,
      title,
      status: 'FAIL',
      durationMs: Date.now() - startedAt,
      error: error.message,
      evidence: error.details || null
    });
  }
  fs.mkdirSync(path.dirname(RESULT_FILE), { recursive: true });
  fs.writeFileSync(RESULT_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), results }, null, 2));
  process.stderr.write(`[${results.at(-1).status}] ${id} (${results.at(-1).durationMs}ms)\n`);
}

async function timelineCase(browser, results) {
  await runCase(results, 'RES-TIME-004', 'Timeline click opens the exact reservation and room', async () => {
    const { context, page, pageErrors } = await openPage(browser, 'dashboard/frontdesk/reservation-timeline.html');
    try {
      await page.locator('.tl-block[data-res-key]').first().waitFor({ state: 'visible' });
      const before = await page.locator('.tl-block[data-res-key]').first().evaluate(element => ({
        key: element.dataset.resKey,
        room: element.closest('.tl-row')?.querySelector('.tl-room-num')?.textContent?.trim() || '',
        text: element.textContent.replace(/\s+/g, ' ').trim()
      }));
      await page.locator('.tl-block[data-res-key]').first().click();
      await page.locator('#unifiedResModal.active').waitFor({ state: 'visible', timeout: 5000 });
      const after = await page.evaluate(() => ({
        room: document.getElementById('unifiedRoom')?.value || '',
        reservationId: document.getElementById('unifiedResId')?.value || '',
        title: document.querySelector('#unifiedResModal .modal-title')?.textContent?.trim() || ''
      }));
      assert(after.reservationId || after.room, 'Timeline click opened an empty reservation modal', { before, after });
      assert(!before.room || after.room.includes(before.room.replace(/[^0-9A-Za-z-]/g, '')), 'Timeline room and modal room differ', { before, after });
      assert(pageErrors.length === 0, 'Timeline raised JavaScript errors', pageErrors);
      return { before, after };
    } finally {
      await context.close();
    }
  });
}

async function groupCases(browser, results) {
  await runCase(results, 'GRP-DETAIL-004', 'Room base rate, discount, and final rate recalculate together', async () => {
    const { context, page, pageErrors } = await openPage(browser, 'dashboard/frontdesk/groups_block_detail.html?id=GRP-DEMO-0708-SAMSUNG&tab=rooms');
    try {
      await page.waitForFunction(() => typeof window.addDetailAllocationRow === 'function');
      await page.evaluate(() => {
        window.showAlert = () => Promise.resolve();
        if (typeof window.renderRooms === 'function') window.renderRooms();
        document.getElementById('detailAllocationEditor')?.replaceChildren();
        window.addDetailAllocationRow();
        return null;
      });
      const row = page.locator('.allocation-editor-row').first();
      await row.waitFor({ state: 'visible' });
      const roomSelect = row.locator('.detail-room');
      const option = await roomSelect.locator('option').evaluateAll(options => (
        options.find(item => item.value && !item.disabled)?.value || ''
      ));
      assert(option, 'No room is available for group allocation');
      await roomSelect.selectOption(option);
      await row.locator('.detail-discount').fill('15');
      await row.locator('.detail-discount').dispatchEvent('input');
      const values = await row.evaluate(element => ({
        base: Number(element.querySelector('.detail-base-rate')?.value || 0),
        discount: Number(element.querySelector('.detail-discount')?.value || 0),
        final: Number(element.querySelector('.detail-final-rate')?.value || 0)
      }));
      assert(values.base > 0, 'Selected room has no base rate', values);
      assert(values.discount === 15, 'Discount input was not retained', values);
      assert(values.final === Math.round(values.base * 0.85), 'Final group rate is not base less discount', values);
      assert(pageErrors.length === 0, 'Group detail raised JavaScript errors', pageErrors);
      return values;
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'GRP-COMP-003', 'User-entered group name remains unchanged after language switching', async () => {
    const marker = `한나투어 QA ${Date.now()}`;
    const { context, page } = await openPage(browser, 'dashboard/frontdesk/groups_companies.html', 'ko');
    try {
      await page.waitForFunction(() => typeof window.openNewCompanyModal === 'function');
      await page.evaluate(() => window.openNewCompanyModal());
      await page.locator('#compName').fill(marker);
      await page.evaluate(() => {
        const select = document.querySelector('select[onchange*="changeLang"],#langSelect');
        if (select) {
          select.value = 'en';
          select.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          localStorage.setItem('pms_lang', 'en');
          window.dispatchEvent(new CustomEvent('pms:languagechange', { detail: { lang: 'en' } }));
        }
      });
      await page.waitForTimeout(250);
      const actual = await page.locator('#compName').inputValue();
      assert(actual === marker, 'Language switch changed user-entered group name', { marker, actual });
      return { marker, actual };
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'GRP-COMP-008', 'Performance period controls update summary and history together', async () => {
    const { context, page, pageErrors } = await openPage(browser, 'dashboard/frontdesk/groups_companies.html');
    try {
      await page.waitForFunction(() => typeof window.openCompanyPerformanceModal === 'function');
      const companyId = await page.evaluate(() => (window.companies || [])[0]?.id || 'COMP-1001');
      await page.evaluate(id => window.openCompanyPerformanceModal(id), companyId);
      await page.locator('#companyPerformanceModal.active').waitFor({ state: 'visible' });
      const period = page.locator('#performancePeriodSelect');
      const modes = await period.locator('option').evaluateAll(options => options.map(option => option.value));
      assert(modes.includes('all') && modes.includes('year') && modes.includes('custom'), 'Performance period options are incomplete', modes);
      const snapshots = [];
      for (const mode of ['all', 'year', 'custom']) {
        await period.selectOption(mode);
        if (mode === 'custom') {
          await page.locator('#performanceStartDate').fill('2026-07-01');
          await page.locator('#performanceEndDate').fill('2026-07-31');
          await page.locator('#performanceEndDate').dispatchEvent('change');
        }
        await page.waitForTimeout(120);
        snapshots.push(await page.evaluate(value => ({
          mode: value,
          summary: document.getElementById('performanceSummaryGrid')?.innerText.trim() || '',
          monthly: document.getElementById('performanceMonthlyBody')?.innerText.trim() || '',
          details: document.getElementById('performanceEventBody')?.innerText.trim() || '',
          start: document.getElementById('performanceStartDate')?.value || '',
          end: document.getElementById('performanceEndDate')?.value || ''
        }), mode));
      }
      assert(snapshots.every(item => item.summary && item.details), 'Performance summary or details did not render for every period', snapshots);
      assert(snapshots[2].start === '2026-07-01' && snapshots[2].end === '2026-07-31', 'Custom performance dates were not retained', snapshots[2]);
      assert(pageErrors.length === 0, 'Company performance modal raised JavaScript errors', pageErrors);
      return snapshots.map(item => ({ mode: item.mode, start: item.start, end: item.end, hasSummary: !!item.summary, hasDetails: !!item.details }));
    } finally {
      await context.close();
    }
  });
}

async function roomSetupCase(browser, results) {
  await runCase(results, 'ROOM-SETUP-008', 'Room type rejects zero, negative, excessive price and capacity', async () => {
    const { context, page } = await openPage(browser, 'dashboard/operations/room-setup.html');
    try {
      await page.evaluate(() => { window.showAlert = () => Promise.resolve(); });
      await page.evaluate(() => window.openModal('roomTypeModal'));
      await page.locator('#roomTypeModal.active').waitFor({ state: 'visible' });
      await page.locator('#newRtName').fill(`QA Type ${Date.now()}`);
      const attempts = [
        { price: '0', capacity: '2' },
        { price: '-1', capacity: '2' },
        { price: '100000001', capacity: '2' },
        { price: '1000', capacity: '0' },
        { price: '1000', capacity: '-1' },
        { price: '1000', capacity: '21' }
      ];
      const resultsByValue = [];
      for (const attempt of attempts) {
        await page.locator('#newRtBasePrice').fill(attempt.price);
        await page.locator('#newRtCapacity').fill(attempt.capacity);
        const before = await page.locator('#roomTypeListContainer > *').count();
        await page.evaluate(() => { window.addRoomType(); return null; });
        await page.waitForTimeout(30);
        const after = await page.locator('#roomTypeListContainer > *').count();
        resultsByValue.push({ ...attempt, before, after });
      }
      assert(resultsByValue.every(item => item.before === item.after), 'Invalid room type values were saved', resultsByValue);
      return resultsByValue;
    } finally {
      await context.close();
    }
  });
}

async function ancillaryVendorCases(browser, results) {
  await runCase(results, 'ANC-VND-005', 'Item price respects configured currency and rejects invalid amounts', async () => {
    const { context, page } = await openPage(browser, 'dashboard/operations/ancillary-vendors.html?type=golf');
    try {
      await page.waitForFunction(() => typeof window.openItemModal === 'function');
      await page.evaluate(() => { window.showAlert = () => Promise.resolve(); });
      await page.evaluate(() => window.openItemModal());
      await page.locator('#itemName').fill(`QA item ${Date.now()}`);
      const attempts = ['0', '-1', '100000001', 'not-a-number'];
      const state = [];
      for (const amount of attempts) {
        await page.locator('#itemPrice').fill(amount === 'not-a-number' ? '' : amount);
        const before = await page.evaluate(() => window.selectedVendor()?.items?.length || 0);
        await page.evaluate(() => { window.saveItem(); return null; });
        await page.waitForTimeout(30);
        const after = await page.evaluate(() => window.selectedVendor()?.items?.length || 0);
        state.push({ amount, before, after });
      }
      const input = await page.locator('#itemPrice').evaluate(element => ({ min: element.min, max: element.max, step: element.step }));
      const currency = await page.evaluate(() => localStorage.getItem('pms_default_currency'));
      assert(state.every(item => item.before === item.after), 'Invalid ancillary item amount was saved', state);
      assert(input.min === '1' && input.max === '100000000', 'Item amount input bounds are incorrect', input);
      assert(currency === 'PHP', 'Configured currency was not retained', currency);
      return { state, input, currency };
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'ANC-VND-006', 'Golf holes and people accept numeric values only within range', async () => {
    const { context, page } = await openPage(browser, 'dashboard/operations/ancillary-vendors.html?type=golf');
    try {
      await page.waitForFunction(() => typeof window.openItemModal === 'function');
      await page.evaluate(() => window.openItemModal());
      const controls = await page.evaluate(() => ({
        holes: { type: itemHoles?.type, min: itemHoles?.min, max: itemHoles?.max },
        people: { type: itemBasePeople?.type, min: itemBasePeople?.min, max: itemBasePeople?.max }
      }));
      assert(controls.holes.type === 'number' && controls.holes.min === '1' && controls.holes.max === '72', 'Golf holes control is not bounded numeric input', controls);
      assert(controls.people.type === 'number' && controls.people.min === '1' && controls.people.max === '100', 'Golf people control is not bounded numeric input', controls);
      return controls;
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'ANC-VND-008', 'Other category vendor and item can be created dynamically', async () => {
    const vendorName = `QA Other Vendor ${Date.now()}`;
    const itemName = `QA Other Item ${Date.now()}`;
    const { context, page, pageErrors } = await openPage(browser, 'dashboard/operations/ancillary-vendors.html?type=other');
    try {
      await page.waitForFunction(() => typeof window.openVendorModal === 'function');
      await page.evaluate(() => window.openVendorModal());
      await page.locator('#vendorType').selectOption('other');
      await page.locator('#vendorName').fill(vendorName);
      await page.locator('#vendorContact').fill('QA Manager');
      await page.locator('#vendorCommission').fill('10');
      await page.evaluate(() => window.saveVendor());
      await page.waitForFunction(name => document.body.innerText.includes(name), vendorName);
      await page.evaluate(() => window.openItemModal());
      await page.locator('#itemName').fill(itemName);
      await page.locator('#itemPrice').fill('250');
      await page.locator('#itemDesc').fill('Flexible QA service');
      await page.evaluate(() => window.saveItem());
      const persisted = await page.evaluate(({ vendor, item }) => {
        const rows = JSON.parse(localStorage.getItem('pms_ancillary_vendors') || '[]');
        const match = rows.find(row => row.name === vendor);
        return { vendor: !!match, item: !!match?.items?.some(entry => entry.name === item), type: match?.type };
      }, { vendor: vendorName, item: itemName });
      assert(persisted.vendor && persisted.item && persisted.type === 'other', 'Dynamic Other vendor/item did not persist', persisted);
      assert(pageErrors.length === 0, 'Ancillary vendor page raised JavaScript errors', pageErrors);
      return persisted;
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'ANC-VND-013', 'Restaurant voucher includes vendor, location, menu, benefit, and terms', async () => {
    const { context, page } = await openPage(browser, 'dashboard/operations/ancillary-vendors.html?type=restaurant');
    try {
      await page.waitForFunction(() => typeof window.openVoucherPreviewModal === 'function');
      await page.evaluate(() => window.openVoucherPreviewModal());
      await page.locator('#voucherPreviewModal.active').waitFor({ state: 'visible' });
      const preview = (await page.locator('#voucherPreviewModalBody').innerText()).replace(/\s+/g, ' ').trim();
      const vendor = await page.evaluate(() => window.selectedVendor());
      assert(vendor?.type === 'restaurant', 'Restaurant vendor fixture is missing', vendor);
      const item = vendor?.items?.[0];
      const required = [vendor?.name, vendor?.location || vendor?.address, item?.name, item?.benefit || item?.desc, item?.terms || vendor?.terms];
      const missing = required.filter(value => !value || !preview.includes(String(value)));
      assert(missing.length === 0, 'Restaurant voucher is missing required content', { preview, required, missing });
      return { preview, required };
    } finally {
      await context.close();
    }
  });
}

async function legacyAncillaryCases(browser, results) {
  await runCase(results, 'ANC-LEG-002', 'Unified POS has no voucher preview or print controls', async () => {
    const { context, page } = await openPage(browser, 'dashboard/operations/unified-pos.html');
    try {
      const findings = await page.evaluate(() => ({
        controls: Array.from(document.querySelectorAll('button,a')).filter(element => /voucher|바우처|미리보기|print|인쇄/i.test(element.textContent || '')).map(element => element.textContent.trim()),
        functions: ['openVoucherPreviewModal', 'printVoucher', 'printAncillaryVoucher'].filter(name => typeof window[name] === 'function')
      }));
      assert(findings.controls.length === 0 && findings.functions.length === 0, 'Unified POS still exposes voucher/print behavior', findings);
      return findings;
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'ANC-LEG-003', 'Unified POS order is linked to an in-house guest and Folio', async () => {
    const { context, page, pageErrors } = await openPage(browser, 'dashboard/operations/unified-pos.html');
    try {
      await page.waitForFunction(() => typeof openModal === 'function' && Array.isArray(inHouseReservations));
      const beforeIds = await page.evaluate(() => allOrders.map(item => item.id));
      await page.evaluate(() => openModal('addOrderModal'));
      await page.locator('#addOrderModal.active').waitFor({ state: 'visible' });
      const selected = await page.locator('#orderStaySelect option[data-folio-id]:not([data-folio-id=""])').first().evaluate(option => ({
        value: option.value,
        reservationId: option.value,
        roomNo: option.dataset.room,
        guestName: option.dataset.guest,
        guestId: option.dataset.guestId,
        folioId: option.dataset.folioId
      }));
      assert(selected.reservationId && selected.roomNo && selected.guestName && selected.folioId, 'No in-house reservation with a linked Folio is selectable', selected);
      await page.locator('#orderStaySelect').selectOption(selected.value);
      await page.locator('#itemSelect').selectOption({ index: 1 });
      await page.locator('#itemQty').fill('2');
      await page.locator('#itemQty').dispatchEvent('input');
      await page.evaluate(() => submitManualOrder());
      await page.waitForFunction(ids => allOrders.some(item => item.id && !ids.includes(item.id)), beforeIds);
      const saved = await page.evaluate(ids => {
        const item = allOrders.find(order => order.id && !ids.includes(order.id));
        return item ? { id: item.id, reservationId: item.reservationId, folioId: item.folioId, roomNo: item.roomNo || item.room, guestId: item.guestId, guestName: item.guestName || item.guest } : null;
      }, beforeIds);
      assert(saved && saved.reservationId === selected.reservationId && saved.folioId === selected.folioId && saved.roomNo === selected.roomNo && saved.guestName === selected.guestName, 'Saved order lost reservation, Folio, room, or guest linkage', { selected, saved });
      await page.reload();
      await page.waitForFunction(id => Array.isArray(allOrders) && allOrders.some(item => item.id === id), saved.id);
      const afterReload = await page.evaluate(id => {
        const item = allOrders.find(order => order.id === id);
        return item ? { id: item.id, reservationId: item.reservationId, folioId: item.folioId, roomNo: item.roomNo || item.room, guestId: item.guestId, guestName: item.guestName || item.guest } : null;
      }, saved.id);
      assert(afterReload?.reservationId === selected.reservationId && afterReload?.folioId === selected.folioId, 'Order linkage did not persist after reload', { selected, afterReload });
      assert(pageErrors.length === 0, 'Unified POS raised JavaScript errors', pageErrors);
      return { selected, saved, afterReload };
    } finally {
      await context.close();
    }
  });

  for (const [id, route, type, requiredPattern] of [
    ['ANC-LEG-005', 'dashboard/operations/golf.html', 'golf', /tee|course|holes|티오프|코스|홀/i],
    ['ANC-LEG-007', 'dashboard/operations/rentacar.html', 'rentacar', /pickup|vehicle|차량|픽업/i]
  ]) {
    await runCase(results, id, `${type} screen retains type-specific voucher data`, async () => {
      const { context, page } = await openPage(browser, route);
      try {
        const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
        const source = fs.readFileSync(path.join(ROOT, route), 'utf8');
        const vendorSource = fs.readFileSync(path.join(ROOT, 'dashboard/operations/ancillary-vendors.html'), 'utf8');
        const evidence = {
          pageTypeFields: requiredPattern.test(text) || requiredPattern.test(source),
          vendorTemplateFields: requiredPattern.test(vendorSource),
          configuredVendorData: new RegExp(type, 'i').test(vendorSource)
        };
        assert(Object.values(evidence).every(Boolean), `${type} voucher-specific data is missing`, evidence);
        return evidence;
      } finally {
        await context.close();
      }
    });
  }
}

async function settlementAndReportCases(browser, results) {
  await runCase(results, 'SETTLE-STATUS-016', 'Settlement floor and group counts match rendered actionable cards', async () => {
    const { context, page, pageErrors } = await openPage(browser, 'dashboard/operations/settlement-status.html');
    try {
      await page.waitForSelector('#settlementSections .settlement-card');
      const counts = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('#settlementSections .settlement-card'));
        const sections = Array.from(document.querySelectorAll('#settlementSections [data-floor-group],#settlementSections .settlement-section')).map(section => ({
          label: section.querySelector('h2,h3,.section-title')?.textContent?.trim() || '',
          cards: section.querySelectorAll('.settlement-card').length
        }));
        return { cards: cards.length, sections, chipCounts: Array.from(document.querySelectorAll('[data-settlement-filter-count]')).map(element => Number(element.textContent || 0)) };
      });
      assert(counts.cards > 0, 'No settlement cards rendered', counts);
      assert(counts.sections.length > 0 && counts.sections.reduce((sum, item) => sum + item.cards, 0) === counts.cards, 'Settlement section counts do not match rendered cards', counts);
      assert(pageErrors.length === 0, 'Settlement status raised JavaScript errors', pageErrors);
      return counts;
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'FOLIO-014', 'Group Folio exposes room, ancillary, discount, and billing terms', async () => {
    const { context, page } = await openPage(browser, 'dashboard/operations/folio.html');
    try {
      await page.waitForSelector('[data-folio-id],#folioBody tr');
      const groupRow = page.locator('[data-folio-id],#folioBody tr').filter({ hasText: /group|단체/i }).first();
      assert(await groupRow.count() > 0, 'No group Folio fixture is visible');
      await groupRow.click();
      await page.locator('#settlementDetailModal.active').waitFor({ state: 'visible' });
      const text = (await page.locator('#settlementDetailModal').innerText()).replace(/\s+/g, ' ');
      const evidence = {
        groupVisible: /group|단체/i.test(text),
        room: /room|객실/i.test(text),
        ancillary: /ancillary|부가서비스|통합 POS|골프|렌터카|음식점/i.test(text),
        discount: /discount|할인/i.test(text),
        billingTerms: /billing|routing|청구 조건|정산 방식|결제 조건/i.test(text)
      };
      assert(Object.values(evidence).every(Boolean), 'Group Folio is missing required billing components', { evidence, text });
      return { evidence, row: text };
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'AUDIT-006', 'Night audit shows expected, actual, and variance by currency', async () => {
    const { context, page } = await openPage(browser, 'dashboard/operations/night-audit.html');
    try {
      await page.waitForFunction(() => typeof window.diffCurrencyValues === 'function');
      const values = await page.evaluate(() => {
        const expected = { PHP: 100, USD: 20, KRW: 3000 };
        const actual = { PHP: 90, USD: 25, KRW: 3000 };
        return { expected, actual, difference: window.diffCurrencyValues(actual, expected) };
      });
      assert(values.difference.PHP === -10 && values.difference.USD === 5 && values.difference.KRW === 0, 'Currency variance calculation is incorrect', values);
      const source = fs.readFileSync(path.join(ROOT, 'dashboard/operations/night-audit.html'), 'utf8');
      assert(/Expected balances|이론 잔액/i.test(source) && /Actual currency|실제 화폐/i.test(source), 'Night audit lacks expected/actual currency labels');
      return values;
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'REPORT-004', 'Revenue report does not add mixed currencies without conversion', async () => {
    const { context, page } = await openPage(browser, 'dashboard/operations/reports.html');
    try {
      const state = await page.evaluate(() => ({
        currency: localStorage.getItem('pms_default_currency') || '',
        kpis: ['kpiTotal', 'kpiRoom', 'kpiAnc', 'kpiDiff'].map(id => document.getElementById(id)?.textContent?.trim() || '')
      }));
      const mixed = state.kpis.some(text => /₱.*\$|\$.*₱|₩.*₱|₱.*₩/.test(text));
      assert(!mixed, 'Revenue KPI combines multiple currencies into one total', state);
      assert(state.currency === 'PHP', 'Report base currency is not explicit', state);
      return state;
    } finally {
      await context.close();
    }
  });
}

async function crmAndSettingsCases(browser, results) {
  await runCase(results, 'CRM-GUEST-008', 'Guest tier change persists and synchronizes on re-entry', async () => {
    const { context, page } = await openPage(browser, 'dashboard/crm/guests.html');
    try {
      await page.waitForSelector('#guestBody tr,.guest-card');
      await page.waitForFunction(() => typeof guests !== 'undefined' && guests.length > 0);
      const target = await page.evaluate(() => ({ id: guests[0]?.id || '', email: guests[0]?.email || '' }));
      assert(target.id && target.email, 'Guest fixture is missing', target);
      await page.evaluate(email => openGuestDetail(email), target.email);
      await page.locator('#guestDetailOverlay.active,#guestDetailPanel.active').first().waitFor({ state: 'visible' });
      const tierSelect = page.locator('#gdInputTier');
      const original = await tierSelect.inputValue();
      const options = await tierSelect.locator('option').evaluateAll(items => items.map(item => item.value).filter(Boolean));
      const next = options.find(value => value !== original);
      assert(next, 'No alternate guest tier is available', { original, options });
      await tierSelect.selectOption(next);
      const reason = page.locator('#gdTierChangeReason');
      if (await reason.isVisible()) await reason.fill('Direct integration test');
      await page.evaluate(() => window.saveGuestDetail());
      const memory = await page.evaluate(id => guests.find(item => item.id === id)?.tier, target.id);
      await page.reload();
      await page.waitForFunction(id => typeof guests !== 'undefined' && guests.some(item => item.id === id), target.id);
      const reloaded = await page.evaluate(id => guests.find(item => item.id === id)?.tier, target.id);
      const persisted = { id: target.id, expected: next, memory, reloaded };
      assert(memory === next && reloaded === next, 'Guest tier did not persist after reload', persisted);
      return persisted;
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'CRM-GUEST-009', 'Privacy detail view creates actor/time/target/field audit evidence', async () => {
    const { context, page } = await openPage(browser, 'dashboard/crm/guests.html');
    try {
      await page.waitForFunction(() => typeof guests !== 'undefined' && guests.length > 0);
      const target = await page.evaluate(() => ({ id: guests[0]?.id || '', email: guests[0]?.email || '' }));
      await page.evaluate(email => openGuestDetail(email), target.email);
      const logs = await page.evaluate(id => {
        const records = JSON.parse(localStorage.getItem('pms_privacy_audit_logs') || '[]');
        return records.filter(item => item?.details?.guestId === id).slice(-3);
      }, target.id);
      const valid = logs.some(item => item.actor?.id && item.createdAt && item.details?.guestId === target.id && Array.isArray(item.details?.fields) && item.details.fields.length > 0);
      assert(valid, 'Guest privacy view audit log is missing actor/time/target/fields', logs);
      return logs;
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'CRM-MEM-005', 'Automatic tier calculation uses the configured source thresholds', async () => {
    const { context, page } = await openPage(browser, 'dashboard/crm/membership.html');
    try {
      await page.waitForFunction(() => typeof window.thresholdFor === 'function');
      const evidence = await page.evaluate(() => {
        const config = currentConfig();
        const gold = thresholdFor('gold');
        return {
          gold,
          platinum: thresholdFor('platinum'),
          diamond: thresholdFor('diamond'),
          guestCount: membershipGuests.length,
          below: window.PMS_VIP_CRITERIA.calculateTier({ visits: Math.max(0, gold.stays - 1), spend: Math.max(0, gold.spend - 1) }, config),
          equal: window.PMS_VIP_CRITERIA.calculateTier({ visits: gold.stays, spend: gold.spend }, config),
          above: window.PMS_VIP_CRITERIA.calculateTier({ visits: gold.stays + 1, spend: gold.spend + 1 }, config)
        };
      });
      assert(evidence.gold && evidence.platinum && evidence.diamond, 'Configured membership thresholds are missing', evidence);
      assert(evidence.guestCount > 0, 'Membership page has no guest source for automatic calculation', evidence);
      assert(evidence.below === 'standard' && evidence.equal === 'gold' && evidence.above === 'gold', 'Automatic tier calculation does not honor configured boundaries', evidence);
      return evidence;
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'CRM-MEM-007', 'Tier boundaries classify below, equal, and above values consistently', async () => {
    const { context, page } = await openPage(browser, 'dashboard/crm/membership.html');
    try {
      const result = await page.evaluate(() => {
        const gold = window.thresholdFor('gold');
        const stays = Number(gold?.stays || gold?.visitCount || 0);
        const spend = Number(gold?.spend || gold?.amount || 0);
        const qualifies = (value, amount) => value >= stays || amount >= spend;
        return {
          stays,
          spend,
          below: qualifies(Math.max(0, stays - 1), Math.max(0, spend - 1)),
          equal: qualifies(stays, spend),
          above: qualifies(stays + 1, spend + 1)
        };
      });
      assert(result.stays > 0 || result.spend > 0, 'Gold threshold is not configured', result);
      assert(result.below === false && result.equal === true && result.above === true, 'Tier boundary logic is inconsistent', result);
      return result;
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'SETTING-006', 'Invalid image type and oversized logo are rejected', async () => {
    const { context, page } = await openPage(browser, 'dashboard/settings/settings.html');
    try {
      await page.waitForFunction(() => typeof window.validateHotelLogoFile === 'function');
      const evidence = await page.evaluate(() => ({
        invalidType: window.validateHotelLogoFile(new File(['text'], 'logo.txt', { type: 'text/plain' })),
        oversized: window.validateHotelLogoFile(new File([new Uint8Array((2 * 1024 * 1024) + 1)], 'logo.png', { type: 'image/png' })),
        validPng: window.validateHotelLogoFile(new File([new Uint8Array(128)], 'logo.png', { type: 'image/png' })),
        accept: document.getElementById('hotelLogoFile')?.accept || '',
        hasDelete: !!document.getElementById('hotelLogoDeleteBtn')
      }));
      assert(evidence.invalidType === false && evidence.oversized === false && evidence.validPng === true, 'Hotel logo file validation accepted invalid input or rejected valid PNG', evidence);
      assert(/image\/png/.test(evidence.accept) && evidence.hasDelete, 'Hotel logo upload/delete controls are incomplete', evidence);
      return evidence;
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'STAFF-014', 'Termination date before hire date is rejected', async () => {
    const { context, page } = await openPage(browser, 'dashboard/settings/staff.html');
    try {
      await page.locator('button[onclick="openModal(\'addStaffModal\')"]').click();
      await page.locator('#newName').fill('QA Invalid Dates');
      await page.locator('#newEmail').fill(`qa.invalid.${Date.now()}@hotel.test`);
      await page.locator('#newPhone').fill('+82 10 0000 0000');
      await page.locator('#newHireDate').fill('2026-07-20');
      await page.locator('#newTerminationDate').fill('2026-07-19');
      await page.locator('#newPw').fill('ValidPassword1!');
      await page.locator('#newPwConfirm').fill('ValidPassword1!');
      const before = await page.locator('#staffBody tr').count();
      await page.evaluate(() => window.saveStaff());
      const after = await page.locator('#staffBody tr').count();
      assert(before === after, 'Staff with termination before hire date was saved', { before, after });
      return { before, after };
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'ROLE-010', 'Final administrator role cannot be removed', async () => {
    const { context, page } = await openPage(browser, 'dashboard/settings/roles.html');
    try {
      const evidence = await page.evaluate(() => {
        if (typeof window.selectRole === 'function') window.selectRole('sys_admin');
        const deleteButtons = Array.from(document.querySelectorAll('button')).filter(button => /delete role|역할 삭제|삭제/i.test(button.textContent || ''));
        const activeDelete = deleteButtons.find(button => button.offsetParent !== null && !button.disabled);
        const guidance = document.body.innerText;
        return {
          systemRoleVisible: /system role|시스템 역할|총괄 관리자/i.test(guidance),
          protected: !activeDelete,
          protectionGuidance: /cannot be edited or deleted|수정하거나 삭제할 수 없습니다|시스템 역할/i.test(guidance)
        };
      });
      assert(evidence.systemRoleVisible && evidence.protected && evidence.protectionGuidance, 'Final administrator role can still be removed or lacks protection guidance', evidence);
      return evidence;
    } finally {
      await context.close();
    }
  });

  await runCase(results, 'NOTICE-006', 'Notice attachment/link has safe handling and failure guidance', async () => {
    const { context, page } = await openPage(browser, 'dashboard/settings/notices.html');
    try {
      const evidence = await page.evaluate(() => {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem('pms_admin_store:platformNotices', JSON.stringify([{
          id: 'NTC-SAFE-LINK-TEST',
          titleKo: '안전 링크 테스트',
          titleEn: 'Safe link test',
          contentKo: '링크 안전성 검증',
          contentEn: 'Link safety verification',
          audience: 'all',
          hotelIds: [],
          startDate: today,
          endDate: today,
          publicationStatus: 'published',
          resourceUrl: 'support.html',
          resourceLabelKo: '관련 안내',
          resourceLabelEn: 'Related guidance'
        }]));
        window.renderPlatformNotices();
        let message = '';
        window.showToast = value => { message = String(value || ''); };
        const unsafeResult = window.openNoticeResource({ preventDefault(){}, stopPropagation(){} }, 'javascript:alert(1)');
        const link = document.querySelector('.notice-resource-link');
        return {
          unsafeBlocked: unsafeResult === false,
          guidance: message,
          safeLink: !!link && link.target === '_blank' && /noopener/.test(link.rel),
          href: link?.getAttribute('href') || ''
        };
      });
      assert(evidence.unsafeBlocked && evidence.guidance && evidence.safeLink && evidence.href, 'Notice link safety or failure guidance is incomplete', evidence);
      return evidence;
    } finally {
      await context.close();
    }
  });
}

(async () => {
  let server = null;
  if (!(await httpOk(BASE))) {
    server = await serveStatic(Number(new URL(BASE).port || 8765));
  }
  assert(await httpOk(BASE), `Test server is unavailable at ${BASE}`);

  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    await authenticationCases(browser, results);
    await expenseValidationCase(browser, results);
    await timelineCase(browser, results);
    await groupCases(browser, results);
    await roomSetupCase(browser, results);
    await ancillaryVendorCases(browser, results);
    await legacyAncillaryCases(browser, results);
    await settlementAndReportCases(browser, results);
    await crmAndSettingsCases(browser, results);
  } finally {
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }

  const failed = results.filter(item => item.status !== 'PASS');
  console.log(JSON.stringify({
    suite: 'hotel-plan-direct-gaps',
    base: BASE,
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    results
  }, null, 2));
  process.exitCode = failed.length ? 1 : 0;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
