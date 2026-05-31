const { chromium } = require('playwright');

const base = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';
const runId = Date.now();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function compactUrl(url) {
  return url.startsWith(base) ? url.slice(base.length) || '/' : url;
}

function ignoredConsole(text) {
  return /favicon|ERR_NETWORK_ACCESS_DENIED|ERR_BLOCKED_BY_CLIENT|googleapis|gstatic|cdnjs|cdn\.jsdelivr|fonts\.googleapis|fonts\.gstatic|Failed to load resource/i.test(text);
}

async function newContext(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  });
  await context.addInitScript(() => {
    sessionStorage.setItem('admin_logged_in', 'true');
    localStorage.setItem('pms_lang', 'ko');
  });
  return context;
}

function watchPage(page, issues, dialogs) {
  page.on('pageerror', error => issues.push(`pageerror: ${error.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error' && !ignoredConsole(msg.text())) {
      issues.push(`console error: ${msg.text()}`);
    }
  });
  page.on('response', response => {
    const url = response.url();
    if (url.startsWith(base) && response.status() >= 400 && !/favicon/i.test(url)) {
      issues.push(`http ${response.status()}: ${compactUrl(url)}`);
    }
  });
  page.on('dialog', async dialog => {
    dialogs.push({ type: dialog.type(), message: dialog.message() });
    await dialog.accept().catch(() => {});
  });
}

async function goto(page, path) {
  await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(400);
}

async function fillIfPresent(page, selector, value) {
  const locator = page.locator(selector).first();
  if (await locator.count()) {
    await locator.fill(value);
    return true;
  }
  return false;
}

async function selectIfPresent(page, selector, valueOrOptions) {
  const locator = page.locator(selector).first();
  if (await locator.count()) {
    await locator.selectOption(valueOrOptions).catch(async () => {
      await locator.selectOption({ index: 1 }).catch(() => {});
    });
    return true;
  }
  return false;
}

async function clickConfirmOk(page) {
  const customConfirm = page.locator('#pms-confirm-modal.active');
  await customConfirm.waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('#pms-confirm-ok').click();
}

async function runFlow(browser, name, flow) {
  const context = await newContext(browser);
  const page = await context.newPage();
  const issues = [];
  const dialogs = [];
  watchPage(page, issues, dialogs);
  const started = Date.now();
  try {
    const details = await flow(page, context, dialogs);
    assert(!issues.length, `${name} reported page issues:\n${issues.join('\n')}`);
    return { name, ok: true, ms: Date.now() - started, details: details || {}, dialogs: dialogs.length };
  } catch (error) {
    return { name, ok: false, ms: Date.now() - started, error: error.stack || error.message, issues, dialogs };
  } finally {
    await context.close().catch(() => {});
  }
}

async function groupRoomingTimelineFlow(page) {
  const guestName = `E2E Group Guest ${runId}`;
  await goto(page, '/dashboard/frontdesk/groups_block_detail.html?id=GRP-260527-01');
  await page.waitForFunction(() => document.body.innerText.includes('Samsung Tech Conference 2026'), null, { timeout: 10000 });
  await page.evaluate(() => {
    if (typeof window.switchTabById === 'function') window.switchTabById('rooms');
    else if (typeof window.switchTab === 'function') window.switchTab('rooms');
  });
  const targetRoom = '0802';
  const registerButton = page.locator(`button[onclick*="openRoomingModal('${targetRoom}"]`).first();
  await registerButton.waitFor({ state: 'visible', timeout: 10000 });
  await registerButton.click();
  await page.locator('#roomingModal.active').waitFor({ state: 'visible', timeout: 5000 });
  await fillIfPresent(page, '#nrGuestRooming', guestName);
  await fillIfPresent(page, '#nrPhoneRooming', '+82 10 0000 0802');
  await fillIfPresent(page, '#nrEmailRooming', `group-${runId}@example.com`);
  await selectIfPresent(page, '#nrNationRooming', { index: 1 });
  await selectIfPresent(page, '#guestRoomInput', targetRoom);
  await selectIfPresent(page, '#guestDocInput', 'verified');
  await fillIfPresent(page, '#guestNoteInput', 'E2E allergy note');
  await page.locator('#roomingModal button[onclick*="saveRoomingGuest"]').first().click();
  await page.waitForFunction(() => !document.querySelector('#roomingModal.active'), null, { timeout: 7000 });
  await page.waitForTimeout(800);

  const stored = await page.evaluate(name => {
    const groups = JSON.parse(localStorage.getItem('pms_groups') || '[]');
    const reservations = JSON.parse(localStorage.getItem('pms_reservations') || '[]');
    const group = groups.find(item => item.id === 'GRP-260527-01');
    const rooming = (group?.roomingList || []).find(item => item.name === name && item.roomId === '0802');
    const res = reservations.find(item => item.id === 'RSV-GRP-260527-01-0802' || item.room === '0802' || item.fullRoom === '0802' || item.roomId === '0802');
    return {
      hasRooming: !!rooming,
      reservationGuest: res?.roomingGuestName || res?.guestName || res?.guest || '',
      reservationStatus: res?.status || '',
      placeholder: res?.isGroupPlaceholder
    };
  }, guestName);
  assert(stored.hasRooming, 'rooming list guest was not saved to the group');
  assert(stored.reservationGuest === guestName, 'group reservation was not linked to the rooming guest');
  assert(stored.placeholder === false, 'group reservation remained a placeholder after guest registration');

  await goto(page, '/dashboard/frontdesk/reservation-timeline.html');
  await page.waitForFunction(name => document.body.innerText.includes(name), guestName, { timeout: 12000 });
  return { guestName, roomId: targetRoom, status: stored.reservationStatus };
}

async function individualReservationFlow(page) {
  const guestName = `E2E Individual ${runId}`;
  await goto(page, '/dashboard/frontdesk/reservation-list.html');
  await page.locator('button[onclick="openUnifiedResModal()"]').click();
  await page.locator('#unifiedResModal.active').waitFor({ state: 'visible', timeout: 10000 });
  await fillIfPresent(page, '#nrGuestEdit', guestName);
  await fillIfPresent(page, '#nrPhoneEdit', '+82 10 0000 1202');
  await fillIfPresent(page, '#nrEmailEdit', `individual-${runId}@example.com`);
  await selectIfPresent(page, '#nrNationEdit', { index: 1 });
  await page.evaluate(() => {
    const select = document.getElementById('unifiedRoom');
    if (!select) return;
    const preferred = Array.from(select.options).find(option => !option.disabled && option.value === 'FT-1202');
    const firstOpen = Array.from(select.options).find(option => !option.disabled && option.value);
    select.value = (preferred || firstOpen || select.options[0])?.value || '';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  const roomId = await page.locator('#unifiedRoom').inputValue();
  assert(roomId, 'new reservation room select did not produce a room id');
  await page.locator('#unifiedResModal button[onclick="saveUnifiedRes()"]').click();
  await page.waitForFunction(() => !document.querySelector('#unifiedResModal.active'), null, { timeout: 10000 });
  await page.waitForFunction(name => document.body.innerText.includes(name), guestName, { timeout: 10000 });
  const stored = await page.evaluate(name => {
    const reservations = JSON.parse(localStorage.getItem('pms_reservations') || '[]');
    return reservations.find(item => item.guest === name || item.guestName === name || item.roomingGuestName === name) || null;
  }, guestName);
  assert(stored, 'new individual reservation was not saved');

  await goto(page, '/dashboard/frontdesk/reservation-timeline.html');
  await page.waitForFunction(name => document.body.innerText.includes(name), guestName, { timeout: 12000 });
  await page.evaluate(id => window.openUnifiedResModal(id), stored.id);
  await page.locator('#unifiedResModal.active').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('#unifiedFlowActions button', { hasText: '체크인' }).click();
  await clickConfirmOk(page);
  await page.waitForFunction(id => {
    const reservations = JSON.parse(localStorage.getItem('pms_reservations') || '[]');
    return reservations.find(item => item.id === id)?.status === 'checkedin';
  }, stored.id, { timeout: 10000 });
  await page.waitForFunction(name => {
    const block = Array.from(document.querySelectorAll('.tl-block')).find(item => item.innerText.includes(name));
    return !!block && block.classList.contains('checkedin');
  }, guestName, { timeout: 10000 });
  const checkedInState = await page.evaluate(id => {
    const reservations = JSON.parse(localStorage.getItem('pms_reservations') || '[]');
    const res = reservations.find(item => item.id === id);
    const block = Array.from(document.querySelectorAll('.tl-block')).find(item => item.innerText.includes(res?.guest || ''));
    return {
      status: res?.status,
      blockClass: block?.className || '',
      checkoutActionVisible: !!Array.from(document.querySelectorAll('#unifiedFlowActions button')).find(item => item.innerText.includes('체크아웃'))
    };
  }, stored.id);
  assert(checkedInState.checkoutActionVisible, 'checkout action did not appear after timeline check-in');
  await page.locator('#unifiedFlowActions button', { hasText: '체크아웃' }).click();
  await clickConfirmOk(page);
  await page.waitForFunction(id => {
    const reservations = JSON.parse(localStorage.getItem('pms_reservations') || '[]');
    return reservations.find(item => item.id === id)?.status === 'completed';
  }, stored.id, { timeout: 10000 });
  await page.waitForFunction(name => {
    const block = Array.from(document.querySelectorAll('.tl-block')).find(item => item.innerText.includes(name));
    return !!block && block.classList.contains('completed');
  }, guestName, { timeout: 10000 });
  const completedState = await page.evaluate(id => {
    const reservations = JSON.parse(localStorage.getItem('pms_reservations') || '[]');
    const res = reservations.find(item => item.id === id);
    const block = Array.from(document.querySelectorAll('.tl-block')).find(item => item.innerText.includes(res?.guest || ''));
    return { status: res?.status, blockClass: block?.className || '', flowActions: document.getElementById('unifiedFlowActions')?.innerText || '' };
  }, stored.id);
  assert(!completedState.flowActions.trim(), 'completed reservation still showed a check-in/out action');
  return {
    guestName,
    roomId,
    statusAfterTimelineCheckin: checkedInState.status,
    checkinBlockClass: checkedInState.blockClass,
    statusAfterTimelineCheckout: completedState.status,
    checkoutBlockClass: completedState.blockClass
  };
}

async function checkinCheckoutFlow(page) {
  const guestName = `E2E Ops Guest ${runId}`;
  await goto(page, '/dashboard/frontdesk/reservation-list.html?tab=checkin');
  await page.waitForFunction(() => typeof reservations !== 'undefined' && Array.isArray(reservations) && reservations.length > 0, null, { timeout: 10000 });

  await page.locator('button[onclick="openUnifiedResModal()"]').click();
  await page.locator('#unifiedResModal.active').waitFor({ state: 'visible', timeout: 10000 });
  await fillIfPresent(page, '#nrGuestEdit', guestName);
  await fillIfPresent(page, '#nrPhoneEdit', '+82 10 0000 2201');
  await fillIfPresent(page, '#nrEmailEdit', `ops-${runId}@example.com`);
  await selectIfPresent(page, '#nrNationEdit', { index: 1 });
  await page.evaluate(() => {
    const select = document.getElementById('unifiedRoom');
    if (!select) return;
    const openOption = Array.from(select.options).find(option => !option.disabled && option.value);
    select.value = openOption?.value || '';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.locator('#unifiedResModal button[onclick="saveUnifiedRes()"]').click();
  await page.waitForFunction(() => !document.querySelector('#unifiedResModal.active'), null, { timeout: 10000 });
  await page.waitForFunction(name => document.body.innerText.includes(name), guestName, { timeout: 10000 });

  await page.evaluate(() => {
    const tab = document.querySelector('.ops-tab[data-filter="checkin"]');
    window.setFilter(tab, 'checkin');
  });
  const checkinRowButton = page.locator('tr', { hasText: guestName }).locator('.res-work-action.checkin');
  await checkinRowButton.waitFor({ state: 'visible', timeout: 10000 });
  await checkinRowButton.click();
  await clickConfirmOk(page);
  await page.waitForFunction(name => {
    const reservations = JSON.parse(localStorage.getItem('pms_reservations') || '[]');
    return reservations.find(item => item.guest === name || item.guestName === name)?.status === 'checkedin';
  }, guestName, { timeout: 10000 });

  await page.evaluate(() => {
    const tab = document.querySelector('.ops-tab[data-filter="inhouse"]');
    window.setFilter(tab, 'inhouse');
  });
  const checkoutRowButton = page.locator('tr', { hasText: guestName }).locator('.res-work-action.checkout');
  await checkoutRowButton.waitFor({ state: 'visible', timeout: 10000 });
  await checkoutRowButton.click();
  await clickConfirmOk(page);
  await page.waitForFunction(name => {
    const reservations = JSON.parse(localStorage.getItem('pms_reservations') || '[]');
    return reservations.find(item => item.guest === name || item.guestName === name)?.status === 'completed';
  }, guestName, { timeout: 10000 });
  return { checkedIn: guestName, checkedOut: guestName };
}

async function readonlyCheckedInReservationFlow(page) {
  await goto(page, '/dashboard/frontdesk/reservation-timeline.html');
  await page.waitForFunction(() => Array.isArray(window.reservations) && window.reservations.length > 0, null, { timeout: 10000 });
  await page.evaluate(() => window.openUnifiedResModal('RSV-0001'));
  await page.locator('#unifiedResModal.active').waitFor({ state: 'visible', timeout: 10000 });

  const state = await page.evaluate(() => {
    const visible = el => !!el && getComputedStyle(el).display !== 'none' && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    return {
      readonly: document.getElementById('unifiedResModal')?.dataset.readonlyReservation,
      guestSectionVisible: visible(document.getElementById('unifiedGuestSection')),
      noticeVisible: visible(document.getElementById('unifiedReadonlyNotice')),
      newGuestVisible: visible(document.getElementById('nrNewGuestBtnEdit')),
      saveVisible: visible(document.querySelector('#unifiedResModal button[onclick="saveUnifiedRes()"]')),
      cancelVisible: visible(document.getElementById('unifiedBtnCancel')),
      roomDisabled: document.getElementById('unifiedRoom')?.disabled,
      statusDisabled: document.getElementById('unifiedStatus')?.disabled,
      statusValue: document.getElementById('unifiedStatus')?.value,
      flowHtml: document.getElementById('unifiedFlowActions')?.innerHTML || ''
    };
  });

  assert(state.readonly === 'true', 'checked-in reservation modal was not marked readonly');
  assert(state.noticeVisible, 'checked-in readonly notice was not visible');
  assert(!state.guestSectionVisible, 'guest edit section remained visible for checked-in reservation');
  assert(!state.newGuestVisible, 'new guest button remained visible for checked-in reservation');
  assert(!state.saveVisible, 'save button remained visible for checked-in reservation');
  assert(!state.cancelVisible, 'cancel button remained visible for checked-in reservation');
  assert(state.roomDisabled && state.statusDisabled, 'locked reservation core fields were not disabled');
  assert(['checkedin', 'checkout'].includes(state.statusValue), 'checked-in status was not normalized in the modal');
  assert(!state.flowHtml.includes("processUnifiedReservationFlow('checkin')"), 'checked-in reservation still showed check-in action');
  assert(state.flowHtml.includes("processUnifiedReservationFlow('checkout')"), 'checked-in reservation did not show checkout action');
  const beforeCancelStatus = await page.evaluate(() => {
    const res = window.reservations.find(item => item.id === 'RSV-0001');
    return res?.status;
  });
  await page.evaluate(() => window.processUnifiedReservationFlow('checkin'));
  await page.waitForTimeout(300);
  const afterDirectCheckinStatus = await page.evaluate(() => {
    const res = window.reservations.find(item => item.id === 'RSV-0001');
    return res?.status;
  });
  assert(afterDirectCheckinStatus === beforeCancelStatus, 'checked-in reservation was re-checked-in through the shared flow action');
  await page.evaluate(() => window.cancelResAction('RSV-0001'));
  await page.waitForTimeout(300);
  const afterCancelStatus = await page.evaluate(() => {
    const res = window.reservations.find(item => item.id === 'RSV-0001');
    return res?.status;
  });
  assert(afterCancelStatus === beforeCancelStatus, 'checked-in reservation was cancelled through the shared cancel action');

  await page.evaluate(() => window.closeUnifiedResModal());
  await page.evaluate(() => window.openUnifiedResModal('RSV-0004'));
  await page.locator('#unifiedResModal.active').waitFor({ state: 'visible', timeout: 10000 });
  const inferredInHouseState = await page.evaluate(() => {
    const res = window.reservations.find(item => item.id === 'RSV-0004');
    const block = Array.from(document.querySelectorAll('.tl-block')).find(item => item.innerText.includes('Martinez Charles'));
    return {
      rawStatus: res?.status,
      readonly: document.getElementById('unifiedResModal')?.dataset.readonlyReservation,
      statusValue: document.getElementById('unifiedStatus')?.value,
      flowText: document.getElementById('unifiedFlowActions')?.innerText || '',
      blockClass: block?.className || ''
    };
  });
  assert(inferredInHouseState.rawStatus === 'confirmed', 'confirmed reservation fixture changed unexpectedly');
  assert(inferredInHouseState.readonly === 'false', 'confirmed reservation was incorrectly locked');
  assert(inferredInHouseState.statusValue === 'confirmed', 'confirmed reservation status was overridden by room inventory state');
  assert(inferredInHouseState.blockClass.includes('confirmed'), 'timeline did not keep confirmed reservation styling');

  await page.evaluate(() => window.closeUnifiedResModal());
  await page.evaluate(() => window.openUnifiedResModal());
  await page.locator('#unifiedResModal.active').waitFor({ state: 'visible', timeout: 10000 });
  const newState = await page.evaluate(() => {
    const visible = el => !!el && getComputedStyle(el).display !== 'none' && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    return {
      readonly: document.getElementById('unifiedResModal')?.dataset.readonlyReservation,
      guestSectionVisible: visible(document.getElementById('unifiedGuestSection')),
      saveVisible: visible(document.querySelector('#unifiedResModal button[onclick="saveUnifiedRes()"]')),
      roomDisabled: document.getElementById('unifiedRoom')?.disabled
    };
  });
  assert(newState.readonly === 'false', 'new reservation modal kept readonly state after opening a locked reservation');
  assert(newState.guestSectionVisible && newState.saveVisible && !newState.roomDisabled, 'new reservation modal did not restore editable controls');
  return { reservationId: 'RSV-0001', status: state.statusValue, newModalRestored: true };
}

async function housekeepingMaintenanceFlow(page) {
  const room = `E2E-${String(runId).slice(-4)}`;
  const description = `E2E maintenance request ${runId}`;
  await goto(page, '/dashboard/operations/housekeeping.html');
  await page.locator('button[onclick="openMaintModal()"]').click();
  await page.locator('#newRequestModal.active').waitFor({ state: 'visible', timeout: 5000 });
  await fillIfPresent(page, '#newRoom', room);
  await fillIfPresent(page, '#newDesc', description);
  await selectIfPresent(page, '#newPriority', 'high');
  await selectIfPresent(page, '#newAssignee', { index: 1 });
  await page.locator('button[onclick="addTicketFromHK()"]').click();
  await page.waitForFunction(() => !document.querySelector('#newRequestModal.active'), null, { timeout: 7000 });
  const saved = await page.evaluate(desc => {
    const list = JSON.parse(localStorage.getItem('pms_maintenance') || '[]');
    return list.find(item => item.desc === desc) || null;
  }, description);
  assert(saved && saved.room === room, 'housekeeping maintenance request was not saved');

  await goto(page, '/dashboard/operations/maintenance.html');
  await page.waitForFunction(desc => document.body.innerText.includes(desc), description, { timeout: 10000 });
  return { requestId: saved.id, room };
}

async function adminTenantApplicationFlow(page) {
  const hotelName = `E2E Hotel ${runId}`;
  await goto(page, '/admin/tenants/apply.html');
  await fillIfPresent(page, '#hotelName', hotelName);
  await fillIfPresent(page, '#rooms', '77');
  await selectIfPresent(page, '#country', { label: 'South Korea' });
  await fillIfPresent(page, '#city', 'Seoul');
  await selectIfPresent(page, '#plan', { label: 'Standard' });
  await selectIfPresent(page, '#currency', { label: 'KRW' });
  await fillIfPresent(page, '#contactName', 'E2E Manager');
  await fillIfPresent(page, '#phone', '+82 10 1111 2222');
  await fillIfPresent(page, '#email', `tenant-${runId}@example.com`);
  await fillIfPresent(page, '#password', 'TestPass!2026');
  await fillIfPresent(page, '#passwordConfirm', 'TestPass!2026');
  await fillIfPresent(page, '#memo', 'E2E tenant application');
  await page.locator('form.apply-card button[type="submit"]').click();
  await page.waitForURL(/\/admin\/login\.html$/, { timeout: 10000 });
  await goto(page, '/admin/tenants/list.html');
  await page.waitForFunction(name => document.body.innerText.includes(name), hotelName, { timeout: 10000 });
  return { hotelName };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const flows = [
    ['group rooming -> timeline', groupRoomingTimelineFlow],
    ['individual reservation -> timeline', individualReservationFlow],
    ['check-in and check-out', checkinCheckoutFlow],
    ['checked-in reservation readonly modal', readonlyCheckedInReservationFlow],
    ['housekeeping -> maintenance', housekeepingMaintenanceFlow],
    ['admin tenant application -> list', adminTenantApplicationFlow]
  ];

  const results = [];
  try {
    for (const [name, flow] of flows) {
      results.push(await runFlow(browser, name, flow));
    }
  } finally {
    await browser.close();
  }

  const failed = results.filter(result => !result.ok);
  const summary = {
    base,
    runId,
    passed: results.length - failed.length,
    failed: failed.length,
    results
  };
  console.log(JSON.stringify(summary, null, 2));
  if (failed.length) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
