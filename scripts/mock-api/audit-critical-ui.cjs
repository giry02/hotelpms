const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const base = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';
const resultFile = process.env.PMS_RESULT_FILE || '';
const scope = process.env.PMS_CRITICAL_SCOPE || 'all';

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

function httpOk(url) {
  return new Promise(resolve => {
    const req = http.get(url, response => {
      response.resume();
      resolve(response.statusCode < 400);
    });
    req.setTimeout(2500, () => {
      req.destroy();
      resolve(false);
    });
    req.on('error', () => resolve(false));
  });
}

function serveStatic(port) {
  const server = http.createServer((req, res) => {
    const requestUrl = new URL(req.url, `http://127.0.0.1:${port}`);
    const safePath = path.normalize(decodeURIComponent(requestUrl.pathname)).replace(/^(\.\.[/\\])+/, '');
    const file = path.join(ROOT, safePath === path.sep ? 'index.html' : safePath);
    if (!file.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    fs.readFile(file, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType(file) });
      res.end(data);
    });
  });
  return new Promise(resolve => {
    server.listen(port, '127.0.0.1', () => resolve(server));
    server.on('error', () => resolve(null));
  });
}

function assert(condition, message, details) {
  if (condition) return;
  const error = new Error(message);
  error.details = details;
  throw error;
}

async function waitForPage(page, selector) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => document.readyState === 'complete' && document.body.offsetHeight > 0, null, { timeout: 20000 });
  if (selector) await page.waitForSelector(selector, { state: 'visible', timeout: 20000 });
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

async function runCase(results, id, title, callback) {
  const started = Date.now();
  try {
    const details = await callback();
    results.push({ id, title, status: 'PASS', durationMs: Date.now() - started, details });
  } catch (error) {
    results.push({
      id,
      title,
      status: 'FAIL',
      durationMs: Date.now() - started,
      error: error.message,
      details: error.details || null
    });
  }
}

async function loginGuardFlow(browser, results) {
  async function openLogin(staff) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await context.addInitScript(payload => {
      localStorage.setItem('pms_lang', 'en');
      localStorage.setItem('pms_staff', JSON.stringify(payload));
      sessionStorage.clear();
    }, staff ? [staff] : []);
    const page = await context.newPage();
    await page.goto(`${base}/dashboard/login.html?critical-ui=login-guard`);
    await waitForPage(page, '#btnLogin');
    return { context, page };
  }

  for (const scenario of [
    { id: 'AUTH-003', status: 'leave', email: 'leave.qa@hotel.test', expected: 'on leave' },
    { id: 'AUTH-004', status: 'retired', email: 'retired.qa@hotel.test', expected: 'Retired' }
  ]) {
    await runCase(results, scenario.id, `${scenario.status} staff cannot log in`, async () => {
      const { context, page } = await openLogin({
        id: `QA-${scenario.status}`,
        name: `QA ${scenario.status}`,
        email: scenario.email,
        password: 'ValidPassword1!',
        status: scenario.status
      });
      try {
        await page.locator('#email').fill(scenario.email);
        await page.locator('#password').fill('ValidPassword1!');
        await page.locator('#btnLogin').click();
        await page.locator('#loginError.show').waitFor({ state: 'visible', timeout: 4000 });
        const message = (await page.locator('#loginError').innerText()).trim();
        const state = await page.evaluate(() => ({
          path: location.pathname,
          loggedIn: sessionStorage.getItem('pms_logged_in')
        }));
        assert(message.includes(scenario.expected), 'Status-specific login error was not shown', { message, scenario });
        assert(state.path.endsWith('/login.html') && state.loggedIn !== 'true', 'Inactive staff was logged in', state);
        return { status: scenario.status, message, blocked: true };
      } finally {
        await context.close();
      }
    });
  }

  await runCase(results, 'AUTH-005', 'Empty and malformed credentials are rejected before login', async () => {
    const { context, page } = await openLogin(null);
    try {
      await page.locator('#email').fill('');
      await page.locator('#password').fill('');
      await page.locator('#btnLogin').click();
      let message = (await page.locator('#loginError.show').innerText()).trim();
      assert(message === 'Enter email and password.', 'Empty credential validation failed', message);

      await page.locator('#email').fill('not-an-email');
      await page.locator('#password').fill('ValidPassword1!');
      await page.locator('#btnLogin').click();
      message = (await page.locator('#loginError.show').innerText()).trim();
      const state = await page.evaluate(() => ({
        path: location.pathname,
        loggedIn: sessionStorage.getItem('pms_logged_in')
      }));
      assert(message === 'Enter a valid email address.', 'Malformed email validation failed', message);
      assert(state.path.endsWith('/login.html') && state.loggedIn !== 'true', 'Malformed email was accepted', state);
      return { empty: 'blocked', malformed: 'blocked', message };
    } finally {
      await context.close();
    }
  });
}

async function staffModalFlow(browser, results) {
  const context = await createContext(browser, 'en');
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await runCase(results, 'STAFF-002', 'Staff edit opens once and uses English labels', async () => {
    await page.goto(`${base}/dashboard/settings/staff.html?critical-ui=staff-edit`);
    await waitForPage(page, '[data-staff-edit]');
    await page.locator('[data-staff-edit]').first().click();
    const modal = page.locator('#editStaffModal.active');
    await modal.waitFor({ state: 'visible' });
    const text = (await modal.innerText()).replace(/\s+/g, ' ').trim();
    const fields = await modal.locator('#editName,#editEmpId,#editEmail,#editPhone,#editAddress,#editHireDate,#editTerminationDate,#editRole,#editStatus').count();
    assert(fields === 9, 'Edit Staff modal is missing required fields', { fields, text });
    assert(text.includes('Edit Staff'), 'Edit Staff title is not translated', text);
    assert(!/[가-힣]/.test(text), 'Korean text remains in the English Edit Staff modal', text);
    assert(pageErrors.length === 0, 'Staff page raised a JavaScript error', pageErrors);
    await modal.locator('.modal-close').click();
    return { fields, title: 'Edit Staff' };
  });

  await runCase(results, 'STAFF-004', 'Add Staff matches edit form and uses English labels', async () => {
    await page.locator('button[onclick="openModal(\'addStaffModal\')"]').click();
    const modal = page.locator('#addStaffModal.active');
    await modal.waitFor({ state: 'visible' });
    const text = (await modal.innerText()).replace(/\s+/g, ' ').trim();
    const fields = await modal.locator('#newName,#newEmpId,#newEmail,#newPhone,#newAddress,#newHireDate,#newTerminationDate,#newRole,#newStatus,#newPw,#newPwConfirm').count();
    assert(fields === 11, 'Add Staff modal is missing required fields', { fields, text });
    assert(text.includes('Add Staff'), 'Add Staff title is not translated', text);
    assert(!/[가-힣]/.test(text), 'Korean text remains in the English Add Staff modal', text);
    return { fields, title: 'Add Staff' };
  });

  await context.close();
}

async function expenseCrudFlow(browser, results) {
  const context = await createContext(browser, 'ko');
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(`${base}/dashboard/operations/expense-purchases.html?critical-ui=expense-crud`);
  await waitForPage(page, '[data-expense-action="edit"]');

  await runCase(results, 'EXP-003', 'Expense currency follows the PHP hotel currency policy', async () => {
    await page.locator('button[onclick="openExpenseFormModal()"]' ).click();
    const modal = page.locator('#expenseFormModal.active');
    await modal.waitFor({ state: 'visible' });
    const currencyOptions = await modal.locator('#expenseCurrency option').evaluateAll(options => options.map(option => option.value));
    const selected = await modal.locator('#expenseCurrency').inputValue();
    assert(selected === 'PHP', 'The hotel base currency is not selected by default', { selected, currencyOptions });
    assert(currencyOptions.includes('PHP') && currencyOptions.includes('USD') && currencyOptions.includes('KRW'), 'Expected currencies are not selectable', currencyOptions);
    assert(!currencyOptions.includes('VND'), 'VND should not be shown when the hotel base currency is PHP', currencyOptions);
    await modal.locator('.modal-close').click();
    return { selected, currencyOptions };
  });

  await runCase(results, 'EXP-006', 'Existing expense values load and persist after edit', async () => {
    await page.locator('[data-expense-action="edit"]').first().click();
    const modal = page.locator('#expenseFormModal.active');
    await modal.waitFor({ state: 'visible' });
    const values = await modal.evaluate(root => ({
      id: root.querySelector('#expenseEditId')?.value,
      date: root.querySelector('#expenseDate')?.value,
      item: root.querySelector('#expenseItem')?.value,
      buyer: root.querySelector('#expenseBuyer')?.value
    }));
    assert(values.id && values.date && values.item && values.buyer, 'Expense edit form was not populated', values);
    const updatedItem = `${values.item} QA`;
    await modal.locator('#expenseItem').fill(updatedItem);
    await modal.locator('button[onclick="saveExpensePurchase()"]' ).click();
    await page.waitForFunction(item => document.body.innerText.includes(item), updatedItem);
    const updatedRow = page.locator('#expenseBody tr').filter({ hasText: updatedItem }).first();
    assert(await updatedRow.count() === 1, 'Edited expense is not visible in the list', { values, updatedItem });
    return { ...values, updatedItem, persisted: true };
  });

  await runCase(results, 'EXP-007', 'Expense deletion removes the record after confirmation', async () => {
    await page.locator('button[onclick="openExpenseFormModal()"]' ).click();
    const modal = page.locator('#expenseFormModal.active');
    await modal.waitFor({ state: 'visible' });
    await modal.locator('#expenseItem').fill('QA Expense Delete Test');
    await modal.locator('#expenseVendor').fill('QA Vendor');
    await modal.locator('#expenseAmount').fill('1234');
    await modal.locator('#expenseNote').fill('Delete regression record');
    await modal.locator('#expenseCurrency').selectOption('PHP');
    await modal.locator('button[onclick="saveExpensePurchase()"]' ).click();
    await page.waitForFunction(() => document.body.innerText.includes('QA Expense Delete Test'));

    const row = page.locator('#expenseBody tr').filter({ hasText: 'QA Expense Delete Test' }).first();
    assert(await row.count() === 1, 'Created expense is not visible in the list');
    await row.locator('[data-expense-action="delete"]').click();
    await page.locator('#pms-confirm-modal').waitFor({ state: 'visible' });
    await page.locator('#pms-confirm-ok').click();
    await page.waitForFunction(() => !document.body.innerText.includes('QA Expense Delete Test'));
    assert(pageErrors.length === 0, 'Expense page raised a JavaScript error', pageErrors);
    return { created: true, confirmed: true, removed: true };
  });

  await runCase(results, 'EXP-009', 'Expense custom date range retains both selected dates', async () => {
    await page.locator('#expensePeriodFilter').selectOption('custom');
    await page.locator('#expenseStartDate').fill('2026-07-01');
    await page.locator('#expenseEndDate').fill('2026-07-31');
    await page.locator('#expenseEndDate').dispatchEvent('change');
    const values = await page.evaluate(() => ({
      start: document.getElementById('expenseStartDate')?.value,
      end: document.getElementById('expenseEndDate')?.value,
      mode: document.getElementById('expensePeriodFilter')?.value
    }));
    assert(values.mode === 'custom' && values.start === '2026-07-01' && values.end === '2026-07-31', 'Expense date range did not retain the selected values', values);
    return values;
  });

  await context.close();
}

async function addExistingGuest(page) {
  const search = page.locator('#nrSearchGuestEdit');
  await search.fill('Wong');
  await page.locator('#nrSearchBtnEdit').click();
  const result = page.locator('#guestSearchResultsEdit ._gs-result-row').first();
  await result.waitFor({ state: 'visible' });
  await result.click();
  const addPrimary = page.locator('#unifiedGuestCandidateActions button[onclick="addUnifiedSelectedGuest(\'primary\')"]');
  await addPrimary.waitFor({ state: 'visible' });
  await addPrimary.click();
  await page.waitForFunction(() => Number((document.getElementById('unifiedStayGuestCount')?.textContent || '').match(/\d+/)?.[0] || 0) >= 1);
}

async function prepareBookableRoom(page, housekeepingStatus, preferredRoomId = '') {
  return page.evaluate(({ status, preferred }) => {
    const matchesPreferred = item => [item?.id, item?.roomNo, item?.number, item?.room]
      .filter(Boolean)
      .map(String)
      .some(value => value === preferred || value.endsWith(`-${preferred}`));
    const room = (window.rooms || []).find(item => preferred && matchesPreferred(item))
      || (window.rooms || []).find(item => item && (item.id || item.roomNo));
    if (!room) throw new Error('No room fixture is available');
    const roomId = String(room.roomNo || room.number || room.room || room.id);
    window.reservations = (window.reservations || []).filter(reservation => {
      const value = String(reservation.room || reservation.fullRoom || reservation.roomId || reservation.roomNo || '');
      return value !== roomId && !value.endsWith(`-${roomId}`);
    });
    if (typeof reservations !== 'undefined') reservations = window.reservations;
    Object.assign(room, {
      status: 'vacant-clean',
      frontStatus: 'vacant-clean',
      housekeepingStatus: status,
      cleaningStatus: status,
      maintenanceStatus: '',
      isOutOfService: false,
      outOfService: false
    });
    window.renderReservationBoard();
    return roomId;
  }, { status: housekeepingStatus, preferred: preferredRoomId });
}

async function clickRoomCard(page, roomId) {
  const card = page.locator('.reservation-board-box.is-bookable').filter({ has: page.locator('.room-box-num > span:first-child', { hasText: roomId }) }).first();
  await card.waitFor({ state: 'visible' });
  await card.click({ position: { x: 80, y: 80 } });
  await page.locator('#unifiedResModal.active').waitFor({ state: 'visible' });
}

async function reservationBookingFlow(browser, results) {
  const context = await createContext(browser, 'ko');
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?critical-ui=room-booking`);
  await waitForPage(page, '.reservation-board-box');

  let selectedRoomId = '';
  await runCase(results, 'RES-BOARD-002', 'Clean vacant room saves the reservation to the clicked room', async () => {
    selectedRoomId = await prepareBookableRoom(page, 'clean');
    await clickRoomCard(page, selectedRoomId);
    const selected = await page.locator('#unifiedRoom').inputValue();
    assert(selected === selectedRoomId, 'The booking modal selected a different room', { clicked: selectedRoomId, selected });
    await addExistingGuest(page);
    await page.locator('#unifiedResModal.active button[onclick="saveUnifiedRes()"]' ).click();
    await page.waitForFunction(() => !document.getElementById('unifiedResModal')?.classList.contains('active'));
    const saved = await page.evaluate(roomId => (window.reservations || []).filter(item => {
      const value = String(item.room || item.fullRoom || item.roomId || item.roomNo || '');
      return value === roomId || value.endsWith(`-${roomId}`);
    }).map(item => ({ id: item.id, room: item.room || item.fullRoom, status: item.status })), selectedRoomId);
    assert(saved.length === 1, 'The saved reservation is not displayed on the clicked room', { selectedRoomId, saved });
    return { clicked: selectedRoomId, selected, saved: saved[0] };
  });

  await runCase(results, 'RES-BOARD-003', 'Dirty room cancel blocks save and continue saves the reservation', async () => {
    selectedRoomId = await prepareBookableRoom(page, 'dirty');
    await clickRoomCard(page, selectedRoomId);
    const selected = await page.locator('#unifiedRoom').inputValue();
    assert(selected === selectedRoomId, 'The dirty-room booking modal selected a different room', { clicked: selectedRoomId, selected });
    await addExistingGuest(page);
    const before = await page.evaluate(roomId => (window.reservations || []).filter(item => String(item.room || item.fullRoom || '') === roomId).length, selectedRoomId);
    await page.locator('#unifiedResModal.active button[onclick="saveUnifiedRes()"]' ).click();
    const confirm = page.locator('#pms-confirm-modal');
    await confirm.waitFor({ state: 'visible' });
    const message = await page.locator('#pms-confirm-message').innerText();
    assert(/청소|clean/i.test(message), 'Dirty-room confirmation does not explain the cleaning state', message);
    await page.locator('#pms-confirm-cancel').click();
    const afterCancel = await page.evaluate(roomId => (window.reservations || []).filter(item => String(item.room || item.fullRoom || '') === roomId).length, selectedRoomId);
    assert(afterCancel === before, 'Cancelling the dirty-room confirmation still saved a reservation', { before, afterCancel });
    assert(await page.locator('#unifiedResModal.active').isVisible(), 'Cancelling the warning unexpectedly closed the reservation modal');
    await page.locator('#unifiedResModal.active button[onclick="saveUnifiedRes()"]' ).click();
    await confirm.waitFor({ state: 'visible' });
    await page.locator('#pms-confirm-ok').click();
    await page.waitForFunction(() => !document.getElementById('unifiedResModal')?.classList.contains('active'));
    const afterContinue = await page.evaluate(roomId => (window.reservations || []).filter(item => String(item.room || item.fullRoom || '') === roomId).length, selectedRoomId);
    assert(afterContinue === before + 1, 'Continuing after the dirty-room warning did not save the reservation', { before, afterCancel, afterContinue });
    return { room: selectedRoomId, selected, warning: message.replace(/\s+/g, ' ').trim(), before, afterCancel, afterContinue };
  });

  await runCase(results, 'RES-BOARD-005', 'Room 1203 remains selected and saves as room 1203', async () => {
    selectedRoomId = await prepareBookableRoom(page, 'clean', '1203');
    assert(selectedRoomId === '1203', 'The preferred 1203 fixture was not selected', { selectedRoomId });
    await clickRoomCard(page, selectedRoomId);
    const selected = await page.locator('#unifiedRoom').inputValue();
    assert(selected === '1203', 'The booking modal did not retain room 1203', { selected });
    await addExistingGuest(page);
    await page.locator('#unifiedResModal.active button[onclick="saveUnifiedRes()"]' ).click();
    await page.waitForFunction(() => !document.getElementById('unifiedResModal')?.classList.contains('active'));
    const saved = await page.evaluate(roomId => {
      const matches = (window.reservations || []).filter(item => String(item.room || item.fullRoom || '') === roomId);
      return matches.map(item => ({ id: item.id, room: item.room || item.fullRoom, guest: item.guest || item.name, status: item.status }));
    }, selectedRoomId);
    assert(saved.length === 1 && String(saved[0].room) === selectedRoomId, 'The reservation was not saved to the clicked room', { selectedRoomId, saved });
    await page.reload();
    await waitForPage(page, '.reservation-board-box');
    const persisted = await page.evaluate(({ roomId, reservationId }) => {
      const match = (window.reservations || []).find(item => item.id === reservationId);
      return match ? { id: match.id, room: match.room || match.fullRoom, status: match.status } : null;
    }, { roomId: selectedRoomId, reservationId: saved[0].id });
    assert(persisted && String(persisted.room) === selectedRoomId, 'The room 1203 reservation did not persist after reload', { selectedRoomId, saved: saved[0], persisted });
    assert(pageErrors.length === 0, 'Reservation Board raised a JavaScript error', pageErrors);
    return { clicked: selectedRoomId, selected, saved: saved[0], persisted };
  });

  await context.close();
}

(async () => {
  let server = null;
  if (!(await httpOk(base))) {
    const port = Number(new URL(base).port || 8765);
    server = await serveStatic(port);
  }
  assert(await httpOk(base), `Test server is unavailable at ${base}`);

  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    if (scope === 'all' || scope === 'login') await loginGuardFlow(browser, results);
    if (scope === 'all' || scope === 'staff') await staffModalFlow(browser, results);
    if (scope === 'all' || scope === 'expense') await expenseCrudFlow(browser, results);
    if (scope === 'all' || scope === 'reservation') await reservationBookingFlow(browser, results);
  } finally {
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }

  const failed = results.filter(result => result.status !== 'PASS');
  const summary = {
    suite: 'critical-ui-workflows',
    base,
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    results
  };
  if (resultFile) {
    fs.mkdirSync(path.dirname(path.resolve(resultFile)), { recursive: true });
    fs.writeFileSync(path.resolve(resultFile), JSON.stringify(summary, null, 2));
  }
  console.log(JSON.stringify(summary, null, 2));
  process.exitCode = failed.length ? 1 : 0;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
