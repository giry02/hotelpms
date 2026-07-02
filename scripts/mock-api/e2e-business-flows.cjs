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

async function firstVisibleLocator(page, selector) {
  const scopes = ['#unifiedResModal.active', '#roomingModal.active', '#newRequestModal.active', '.modal.active', 'body'];
  let firstMatch = null;
  for (const scope of scopes) {
    const locator = scope === 'body' ? page.locator(selector) : page.locator(`${scope} ${selector}`);
    const count = await locator.count();
    if (!firstMatch && count) firstMatch = locator.first();
    for (let index = 0; index < count; index += 1) {
      const candidate = locator.nth(index);
      if (await candidate.isVisible().catch(() => false)) return candidate;
    }
  }
  return firstMatch;
}

async function fillIfPresent(page, selector, value) {
  const locator = await firstVisibleLocator(page, selector);
  if (!locator) return false;
  const tagName = await locator.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
  if (tagName === 'select') {
    return selectIfPresent(page, selector, value);
  }
  await locator.fill(value);
  return true;
}

async function selectIfPresent(page, selector, valueOrOptions) {
  const locator = await firstVisibleLocator(page, selector);
  if (!locator) return false;
  await locator.selectOption(valueOrOptions).catch(async () => {
    await locator.selectOption({ index: 1 }).catch(() => {});
  });
  return true;
}

async function clickConfirmOk(page) {
  const customConfirm = page.locator('#pms-confirm-modal.active');
  await customConfirm.waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('#pms-confirm-ok').click();
}

async function setUnifiedStayDates(page, nights = 1) {
  await page.evaluate(nightsCount => {
    const formatDate = date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const today = new Date();
    const checkout = new Date(today);
    checkout.setDate(today.getDate() + nightsCount);
    const cin = document.getElementById('unifiedCin');
    const cout = document.getElementById('unifiedCout');
    if (cin) {
      cin.value = formatDate(today);
      cin.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (cout) {
      cout.value = formatDate(checkout);
      cout.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (typeof window.updateUnifiedStayAndRooms === 'function') window.updateUnifiedStayAndRooms();
  }, nights);
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
  await page.evaluate(roomId => window.openRoomingModal(roomId, '', 'primary'), targetRoom);
  await page.locator('#roomingModal.active').waitFor({ state: 'visible', timeout: 5000 });
  const newRoomingGuestButton = await firstVisibleLocator(page, '#nrNewGuestBtnRooming');
  if (newRoomingGuestButton && await newRoomingGuestButton.isVisible().catch(() => false)) {
    await newRoomingGuestButton.click();
    await page.waitForTimeout(200);
  } else {
    await page.evaluate(() => window._roomingGuestWidget?.showNewForm?.());
  }
  await page.waitForFunction(() => {
    const input = document.getElementById('nrGuestRooming');
    return !!input && getComputedStyle(input).display !== 'none' && input.getClientRects().length > 0;
  }, null, { timeout: 5000 });
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
  await page.locator('#unifiedResModal.active #nrNewGuestBtnEdit').click();
  await fillIfPresent(page, '#nrGuestEdit', guestName);
  await fillIfPresent(page, '#nrPhoneEdit', '+82 10 0000 1202');
  await fillIfPresent(page, '#nrEmailEdit', `individual-${runId}@example.com`);
  await fillIfPresent(page, '#nrNationEdit', 'Korea');
  await setUnifiedStayDates(page, 1);
  await page.evaluate(() => {
    const select = document.getElementById('unifiedRoom');
    if (!select) return;
    const preferredValues = ['FT-1205', '1205'];
    const preferred = Array.from(select.options).find(option =>
      !option.disabled && (preferredValues.includes(option.value) || /1205/.test(option.textContent || ''))
    );
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
  await page.locator('#unifiedResModal.active #nrNewGuestBtnEdit').click();
  await fillIfPresent(page, '#nrGuestEdit', guestName);
  await fillIfPresent(page, '#nrPhoneEdit', '+82 10 0000 2201');
  await fillIfPresent(page, '#nrEmailEdit', `ops-${runId}@example.com`);
  await fillIfPresent(page, '#nrNationEdit', 'Korea');
  await setUnifiedStayDates(page, 1);
  await page.evaluate(() => {
    const select = document.getElementById('unifiedRoom');
    if (!select) return;
    const preferredValues = ['FT-1206', '1206'];
    const preferred = Array.from(select.options).find(option =>
      !option.disabled && (preferredValues.includes(option.value) || /1206/.test(option.textContent || ''))
    );
    const openOption = Array.from(select.options).find(option => !option.disabled && option.value);
    select.value = (preferred || openOption)?.value || '';
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

async function dashboardCheckinKpiNavigationFlow(page) {
  await goto(page, '/dashboard/dashboard.html?test=e2e-checkin-count');
  await page.waitForFunction(() => window.PmsMockApi && document.querySelectorAll('.ops-kpi-card').length >= 4, null, { timeout: 15000 });

  const setup = await page.evaluate(async () => {
    const today = window.PmsDate?.todayIso ? window.PmsDate.todayIso() : new Date().toISOString().slice(0, 10);
    const reservationsEnv = await window.PmsMockApi.request('GET', '/reservations');
    const roomsEnv = await window.PmsMockApi.request('GET', '/rooms');
    const reservations = window.PmsMockApi.items(reservationsEnv).map(window.PmsMockApi.toLegacyReservation);
    const rooms = window.PmsMockApi.items(roomsEnv);
    const statusKey = value => String(value || '').replace(/[-_\s]/g, '').toLowerCase();
    const closed = new Set(['cancelled', 'canceled', 'completed', 'checkedout', 'checkoutcompleted', 'noshow', 'no_show', 'checkedin', 'checked-in', 'inhouse', 'in-house']);
    const todayCheckins = reservations
      .filter(res => String(res.checkInDate || res.checkin || '').slice(0, 10) === today && !closed.has(statusKey(res.status)))
      .sort((a, b) => String(a.room || '').localeCompare(String(b.room || ''), 'ko', { numeric: true }));
    const targetRooms = todayCheckins
      .filter(res => ['confirmed', 'pending'].includes(statusKey(res.status)))
      .slice(0, 2)
      .map(res => String(res.roomNo || res.room || '').trim())
      .filter(Boolean);
    if (targetRooms.length < 2) return { today, targetRooms, before: todayCheckins.length, skipped: true };
    const nextRooms = rooms.map(room => targetRooms.includes(String(room.roomNo || '').trim())
      ? { ...room, frontStatus: 'in-house', status: 'occupied' }
      : room);
    localStorage.setItem('mockapi:v1:TENANT-GRAND-SAIGON:rooms', JSON.stringify({
      items: nextRooms,
      page: { page: 1, pageSize: Math.max(nextRooms.length, 50), total: nextRooms.length, totalPages: 1 }
    }));
    return { today, targetRooms, before: todayCheckins.length, expectedAfter: todayCheckins.length - targetRooms.length };
  });

  assert(!setup.skipped, 'dashboard check-in KPI regression needs at least two due check-in reservations');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => /\d+/.test(document.querySelector('.ops-kpi-card')?.innerText || ''), null, { timeout: 15000 });

  const dashboard = await page.evaluate(() => {
    const card = document.querySelector('.ops-kpi-card');
    const text = card?.innerText.trim() || '';
    return {
      text,
      count: Number((text.match(/(\d+)\s*$/) || [])[1]),
      topText: Array.from(document.querySelectorAll('.kpi-card')).map(item => item.innerText.trim()).find(textValue => /체크인|Check-in/.test(textValue)) || ''
    };
  });
  assert(dashboard.count === setup.expectedAfter, `dashboard check-in count did not reflect in-house room state: expected ${setup.expectedAfter}, got ${dashboard.count}`);

  await page.locator('.ops-kpi-card').first().click();
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelector('.ops-tab.active') && document.querySelector('#pageInfo'), null, { timeout: 15000 });
  const list = await page.evaluate(() => {
    const active = document.querySelector('.ops-tab.active')?.innerText.trim() || '';
    const pageInfo = document.querySelector('#pageInfo')?.innerText.trim() || '';
    return {
      url: location.href,
      active,
      tabCount: Number((active.match(/(\d+)\s*$/) || [])[1]),
      pageTotal: Number((pageInfo.match(/총\s*([0-9]+)건/) || [])[1]),
      rowCount: document.querySelectorAll('#resBody tr.res-click-row').length,
      period: document.querySelector('#periodFilterSelect')?.value
    };
  });
  assert(list.url.includes('reservation-list.html') && list.url.includes('tab=checkin') && list.url.includes('period=today'), 'dashboard check-in KPI did not navigate to reservation list today check-in filter');
  assert(list.period === 'today', 'reservation list period was not today after dashboard check-in KPI navigation');
  assert(list.tabCount === dashboard.count && list.pageTotal === dashboard.count, `dashboard/list check-in counts diverged: dashboard ${dashboard.count}, tab ${list.tabCount}, total ${list.pageTotal}`);
  return { setup, dashboard, list };
}

async function nightAuditClosedHandoverFlow(page) {
  await goto(page, '/dashboard/operations/night-audit.html?test=e2e-night-audit-closed');
  const setup = await page.evaluate(() => {
    const businessDate = document.getElementById('currentDate')?.textContent || '2026-07-02';
    localStorage.setItem('pms_night_audit_cash_sessions', JSON.stringify([{
      id: `TEST-CLOSED-${businessDate}`,
      businessDate,
      opening: { PHP: 30000, USD: 200, KRW: 500000 },
      openedAt: `${businessDate}T08:00:00+09:00`,
      openedBy: 'Nguyen Kim',
      withdrawals: [{
        id: 'WD-TEST',
        currency: 'PHP',
        amount: 10000,
        currencyBreakdown: { PHP: 10000, USD: 150, KRW: 100000 },
        phpEquivalent: 10000,
        receiver: 'Manager',
        note: 'Envelope A-13',
        createdAt: `${businessDate}T18:00:00+09:00`,
        operator: 'Nguyen Kim'
      }],
      closing: { PHP: 84200, USD: 260, KRW: 650000 },
      closingPhpEquivalent: 84200,
      closingNote: 'Count complete',
      closedAt: `${businessDate}T23:45:00+09:00`,
      closedBy: 'Nguyen Kim',
      handoverMemo: 'No special notes. Check 1206 deposit envelope.',
      nightAuditClosed: true,
      nightAuditClosedAt: `${businessDate}T23:50:00+09:00`,
      nightAuditClosedBy: 'Nguyen Kim',
      sampleData: true
    }]));
    return { businessDate };
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.locator('#closedAuditSummary:not([hidden])').waitFor({ state: 'visible', timeout: 15000 });
  const state = await page.evaluate(() => ({
    bodyClosed: document.body.classList.contains('night-audit-closed'),
    closedVisible: !document.getElementById('closedAuditSummary')?.hidden,
    memo: document.getElementById('closedAuditMemo')?.textContent?.trim() || '',
    closeTabDisplay: getComputedStyle(document.getElementById('auditTabBtnClose')).display,
    cashActive: document.getElementById('auditTabCash')?.classList.contains('active'),
    actionDisabled: Array.from(document.querySelectorAll('.cash-action-card')).every(button => button.disabled),
    logHref: document.getElementById('closedAuditLogLink')?.getAttribute('href') || '',
    session: JSON.parse(localStorage.getItem('pms_night_audit_cash_sessions') || '[]')[0] || null
  }));
  assert(state.bodyClosed && state.closedVisible, 'closed night audit summary was not shown');
  assert(state.memo.includes('1206'), 'closed night audit handover memo was not visible');
  assert(state.closeTabDisplay === 'none' && state.cashActive, 'closed night audit did not switch away from close input mode');
  assert(state.actionDisabled, 'closed night audit cash action buttons were still editable');
  assert(state.logHref.includes(`date=${setup.businessDate}`), 'closed night audit log link did not preserve business date');
  assert(state.session?.nightAuditClosed === true, 'closed night audit state was overwritten by sample data');
  return { setup, state };
}

async function ancillaryInhouseOnlyFlow(page) {
  await goto(page, '/dashboard/operations/ancillary.html?test=e2e-ancillary-inhouse-only');
  await page.waitForFunction(() => document.querySelector('#ancillaryBoardContainer'), null, { timeout: 10000 });
  await page.waitForFunction(() => document.querySelectorAll('.service-room-card').length > 0 || document.querySelector('.service-empty-state'), null, { timeout: 15000 });
  const state = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.service-room-card'));
    const activeCards = cards.filter(card => card.classList.contains('inhouse'));
    const blockedCards = cards.filter(card => card.classList.contains('arrival') || card.classList.contains('empty'));
    const kpiText = document.getElementById('kpiInhouse')?.textContent || '0';
    return {
      cardCount: cards.length,
      inhouseCardCount: activeCards.length,
      blockedCardCount: blockedCards.length,
      kpiInhouse: Number((kpiText.match(/\d+/) || ['0'])[0]),
      boardText: document.getElementById('ancillaryBoardContainer')?.innerText || ''
    };
  });
  assert(state.cardCount > 0, 'ancillary board did not render any in-house service rooms');
  assert(state.blockedCardCount === 0, 'ancillary board rendered vacant or future check-in rooms');
  assert(state.cardCount === state.inhouseCardCount, 'ancillary board rendered non-in-house cards');
  assert(state.cardCount === state.kpiInhouse, `ancillary board card count diverged from in-house KPI: cards ${state.cardCount}, KPI ${state.kpiInhouse}`);
  assert(!/공실|체크인 예정/.test(state.boardText), 'ancillary board still displayed vacant or future check-in labels');
  return state;
}

async function ancillaryVendorVoucherFlow(page) {
  await goto(page, '/dashboard/operations/ancillary-vendors.html?test=e2e-ancillary-vendors');
  await page.waitForFunction(() => document.querySelectorAll('.vendor-tab').length >= 3 && document.querySelector('#voucherPreview'), null, { timeout: 15000 });
  const initial = await page.evaluate(() => ({
    tabs: Array.from(document.querySelectorAll('.vendor-tab')).map(item => item.innerText.trim()),
    selectedMeta: document.getElementById('selectedVendorMeta')?.innerText || '',
    preview: document.getElementById('voucherPreview')?.innerText || '',
    itemCount: document.querySelectorAll('.item-card').length
  }));
  assert(initial.tabs.some(text => /통합 POS/.test(text)), 'ancillary vendor management did not expose POS item management');
  assert(/호텔 통합 POS|POS/.test(initial.selectedMeta), 'POS vendor was not selected by default');
  assert(initial.itemCount >= 1, 'POS items were not rendered in vendor management');
  assert(/객실 전표|전표/.test(initial.preview), 'POS receipt preview was not rendered');

  await page.locator('.vendor-tab[data-type="golf"]').click();
  await page.waitForFunction(() => /골프장 이용권|절취용/.test(document.getElementById('voucherPreview')?.innerText || ''), null, { timeout: 10000 });
  const golf = await page.evaluate(() => ({
    sectionTitles: Array.from(document.querySelectorAll('.voucher-field-section-title')).map(item => item.innerText.trim()),
    preview: document.getElementById('voucherPreview')?.innerText || '',
    hasLogoButton: !!Array.from(document.querySelectorAll('button')).find(button => /로고 등록/.test(button.innerText || ''))
  }));
  assert(golf.sectionTitles.some(text => /골프장 이용권/.test(text)), 'golf voucher fields were not grouped separately');
  assert(/업체 주소/.test(golf.preview) && /Clark Freeport Zone/.test(golf.preview), 'golf voucher preview did not include vendor address');
  assert(/절취용 이용 확인/.test(golf.preview), 'golf voucher preview did not include a tear-off confirmation area');
  assert(golf.hasLogoButton, 'vendor logo upload action was not available');

  await page.locator('.vendor-tab[data-type="rentacar"]').click();
  await page.waitForFunction(() => /차량 인수 확인/.test(document.getElementById('voucherPreview')?.innerText || ''), null, { timeout: 10000 });
  const rentacar = await page.evaluate(() => ({
    sectionTitles: Array.from(document.querySelectorAll('.voucher-field-section-title')).map(item => item.innerText.trim()),
    preview: document.getElementById('voucherPreview')?.innerText || ''
  }));
  assert(rentacar.sectionTitles.some(text => /렌터카 인수 정보/.test(text)), 'rent-a-car voucher fields were not grouped separately');
  assert(/업체 주소/.test(rentacar.preview) && /NAIA Terminal 3/.test(rentacar.preview), 'rent-a-car voucher preview did not include vendor address');
  assert(/차량 인수 확인/.test(rentacar.preview), 'rent-a-car voucher preview did not include handover confirmation');
  return { initial, golf, rentacar };
}

async function readonlyCheckedInReservationFlow(page) {
  await goto(page, '/dashboard/frontdesk/reservation-timeline.html');
  await page.waitForFunction(() => Array.isArray(window.reservations) && window.reservations.length > 0, null, { timeout: 10000 });
  await page.evaluate(() => window.openUnifiedResModal('RSV-0016'));
  await page.locator('#unifiedResModal.active').waitFor({ state: 'visible', timeout: 10000 });

  const state = await page.evaluate(() => {
    const modal = document.querySelector('#unifiedResModal.active') || document.getElementById('unifiedResModal');
    const byId = id => modal?.querySelector(`#${id}`) || document.getElementById(id);
    const bySelector = selector => modal?.querySelector(selector) || document.querySelector(selector);
    const visible = el => !!el && getComputedStyle(el).display !== 'none' && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    return {
      readonly: modal?.dataset.readonlyReservation,
      guestSectionVisible: visible(byId('unifiedGuestSection')),
      noticeVisible: visible(byId('unifiedReadonlyNotice')),
      newGuestVisible: visible(byId('nrNewGuestBtnEdit')),
      saveVisible: visible(bySelector('button[onclick="saveUnifiedRes()"]')),
      cancelVisible: visible(byId('unifiedBtnCancel')),
      cinDisabled: byId('unifiedCin')?.disabled,
      coutDisabled: byId('unifiedCout')?.disabled,
      roomDisabled: byId('unifiedRoom')?.disabled,
      statusDisabled: byId('unifiedStatus')?.disabled,
      statusValue: byId('unifiedStatus')?.value,
      flowHtml: byId('unifiedFlowActions')?.innerHTML || ''
    };
  });

  assert(state.readonly === 'true', 'checked-in reservation modal was not marked readonly');
  assert(state.noticeVisible, 'checked-in readonly notice was not visible');
  assert(!state.cancelVisible, 'cancel button remained visible for checked-in reservation');
  assert(state.cinDisabled && state.coutDisabled, 'locked reservation base stay dates were not disabled');
  assert(['checkedin', 'checkout'].includes(state.statusValue), 'checked-in status was not normalized in the modal');
  assert(!state.flowHtml.includes("processUnifiedReservationFlow('checkin')"), 'checked-in reservation still showed check-in action');
  assert(state.flowHtml.includes("processUnifiedReservationFlow('checkout')"), 'checked-in reservation did not show checkout action');
  const beforeCancelStatus = await page.evaluate(() => {
    const res = window.reservations.find(item => item.id === 'RSV-0016');
    return res?.status;
  });
  await page.evaluate(() => window.processUnifiedReservationFlow('checkin'));
  await page.waitForTimeout(300);
  const afterDirectCheckinStatus = await page.evaluate(() => {
    const res = window.reservations.find(item => item.id === 'RSV-0016');
    return res?.status;
  });
  assert(afterDirectCheckinStatus === beforeCancelStatus, 'checked-in reservation was re-checked-in through the shared flow action');
  await page.evaluate(() => window.cancelResAction('RSV-0016'));
  await page.waitForTimeout(300);
  const afterCancelStatus = await page.evaluate(() => {
    const res = window.reservations.find(item => item.id === 'RSV-0016');
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
  return { reservationId: 'RSV-0016', status: state.statusValue, newModalRestored: true };
}

async function housekeepingMaintenanceFlow(page) {
  const room = `E2E-${String(runId).slice(-4)}`;
  const description = `E2E maintenance request ${runId}`;
  await goto(page, '/dashboard/operations/housekeeping.html');
  await page.locator('button[onclick="openMaintModal()"]').click();
  await page.locator('#newRequestModal.active').waitFor({ state: 'visible', timeout: 5000 });
  let expectedRoom = room;
  const roomField = await firstVisibleLocator(page, '#newRoom');
  const roomFieldTag = await roomField?.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
  if (roomFieldTag === 'select') {
    await selectIfPresent(page, '#newRoom', { index: 1 });
    expectedRoom = await roomField.inputValue();
  } else {
    await fillIfPresent(page, '#newRoom', room);
  }
  await fillIfPresent(page, '#newDesc', description);
  await selectIfPresent(page, '#newPriority', 'high');
  await selectIfPresent(page, '#newAssignee', { index: 1 });
  await page.locator('button[onclick="addTicketFromHK()"]').click();
  await page.waitForFunction(() => !document.querySelector('#newRequestModal.active'), null, { timeout: 7000 });
  const saved = await page.evaluate(desc => {
    const list = JSON.parse(localStorage.getItem('pms_maintenance') || '[]');
    return list.find(item => item.desc === desc) || null;
  }, description);
  assert(saved && saved.room === expectedRoom, 'housekeeping maintenance request was not saved');

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
  await selectIfPresent(page, '#currency', { label: 'USD' });
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
    ['dashboard check-in KPI -> reservation list count', dashboardCheckinKpiNavigationFlow],
    ['night audit closed handover view', nightAuditClosedHandoverFlow],
    ['ancillary board only shows in-house rooms', ancillaryInhouseOnlyFlow],
    ['ancillary vendor voucher management', ancillaryVendorVoucherFlow],
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
