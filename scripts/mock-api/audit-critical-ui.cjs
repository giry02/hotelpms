const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const base = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';

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

  await runCase(results, 'EXP-006-PARTIAL', 'Existing expense values load in edit mode', async () => {
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
    await modal.locator('.modal-close').click();
    return values;
  });

  await runCase(results, 'EXP-CRUD-TRACE', 'Expense create, currency, update, and delete persist in the list', async () => {
    await page.locator('button[onclick="openExpenseFormModal()"]' ).click();
    const modal = page.locator('#expenseFormModal.active');
    await modal.waitFor({ state: 'visible' });
    const currencyOptions = await modal.locator('#expenseCurrency option').evaluateAll(options => options.map(option => option.value));
    assert(currencyOptions.includes('PHP') && currencyOptions.includes('USD') && currencyOptions.includes('KRW'), 'Expected currencies are not selectable', currencyOptions);
    assert(!currencyOptions.includes('VND'), 'VND should not be shown when the hotel base currency is PHP', currencyOptions);
    await modal.locator('#expenseItem').fill('QA Expense Test');
    await modal.locator('#expenseVendor').fill('QA Vendor');
    await modal.locator('#expenseAmount').fill('1234');
    await modal.locator('#expenseNote').fill('Created by critical UI regression');
    await modal.locator('#expenseCurrency').selectOption('PHP');
    await modal.locator('button[onclick="saveExpensePurchase()"]' ).click();
    await page.waitForFunction(() => document.body.innerText.includes('QA Expense Test'));

    let row = page.locator('#expenseBody tr').filter({ hasText: 'QA Expense Test' }).first();
    assert(await row.count() === 1, 'Created expense is not visible in the list');
    await row.locator('[data-expense-action="edit"]').click();
    await page.locator('#expenseFormModal.active #expenseItem').fill('QA Expense Test Updated');
    await page.locator('#expenseFormModal.active button[onclick="saveExpensePurchase()"]' ).click();
    await page.waitForFunction(() => document.body.innerText.includes('QA Expense Test Updated'));

    row = page.locator('#expenseBody tr').filter({ hasText: 'QA Expense Test Updated' }).first();
    await row.locator('[data-expense-action="delete"]').click();
    await page.locator('#pms-confirm-modal').waitFor({ state: 'visible' });
    await page.locator('#pms-confirm-ok').click();
    await page.waitForFunction(() => !document.body.innerText.includes('QA Expense Test Updated'));
    assert(pageErrors.length === 0, 'Expense page raised a JavaScript error', pageErrors);
    return { currencies: currencyOptions, create: true, update: true, delete: true };
  });

  await runCase(results, 'EXP-009-PARTIAL', 'Expense custom date range retains both selected dates', async () => {
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
  await runCase(results, 'RES-BOARD-002-PARTIAL', 'Clicked room stays selected in the new booking modal', async () => {
    selectedRoomId = await prepareBookableRoom(page, 'dirty');
    await clickRoomCard(page, selectedRoomId);
    const selected = await page.locator('#unifiedRoom').inputValue();
    assert(selected === selectedRoomId, 'The booking modal selected a different room', { clicked: selectedRoomId, selected });
    return { clicked: selectedRoomId, selected };
  });

  await runCase(results, 'RES-BOARD-003-PARTIAL', 'Dirty room requires confirmation and cancel prevents save', async () => {
    await addExistingGuest(page);
    const before = await page.evaluate(roomId => (window.reservations || []).filter(item => String(item.room || item.fullRoom || '') === roomId).length, selectedRoomId);
    await page.locator('#unifiedResModal.active button[onclick="saveUnifiedRes()"]' ).click();
    const confirm = page.locator('#pms-confirm-modal');
    await confirm.waitFor({ state: 'visible' });
    const message = await page.locator('#pms-confirm-message').innerText();
    assert(/청소|clean/i.test(message), 'Dirty-room confirmation does not explain the cleaning state', message);
    await page.locator('#pms-confirm-cancel').click();
    const after = await page.evaluate(roomId => (window.reservations || []).filter(item => String(item.room || item.fullRoom || '') === roomId).length, selectedRoomId);
    assert(after === before, 'Cancelling the dirty-room confirmation still saved a reservation', { before, after });
    return { room: selectedRoomId, warning: message.replace(/\s+/g, ' ').trim() };
  });

  await runCase(results, 'RES-BOARD-005', 'Room 1203 remains selected and saves as room 1203', async () => {
    await page.locator('#unifiedResModal.active .modal-close').click();
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
    assert(pageErrors.length === 0, 'Reservation Board raised a JavaScript error', pageErrors);
    return { clicked: selectedRoomId, selected, saved: saved[0] };
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
    await staffModalFlow(browser, results);
    await expenseCrudFlow(browser, results);
    await reservationBookingFlow(browser, results);
  } finally {
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }

  const failed = results.filter(result => result.status !== 'PASS');
  console.log(JSON.stringify({
    suite: 'critical-ui-workflows',
    base,
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
