const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_BASE = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';
const PORT = Number(new URL(DEFAULT_BASE).port || 8765);

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  }[ext] || 'application/octet-stream';
}

function serveStatic(port) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    const decoded = decodeURIComponent(url.pathname);
    const safePath = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
    const file = path.join(ROOT, safePath === path.sep ? 'index.html' : safePath);
    if (!file.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
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

function httpOk(url) {
  return new Promise(resolve => {
    const req = http.get(url, res => {
      res.resume();
      resolve(res.statusCode && res.statusCode < 400);
    });
    req.setTimeout(2500, () => {
      req.destroy();
      resolve(false);
    });
    req.on('error', () => resolve(false));
  });
}

function assert(condition, message, details = null) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

function countValues(values) {
  return values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

async function dashboardCheckinCountRegression(page, base) {
  await page.goto(`${base}/dashboard/dashboard.html?test=reservation-count-regression`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => window.PmsMockApi && document.querySelectorAll('.ops-kpi-card').length >= 4, null, { timeout: 15000 });

  const setup = await page.evaluate(async () => {
    const today = window.PmsDate?.todayIso ? window.PmsDate.todayIso() : new Date().toISOString().slice(0, 10);
    const reservationsEnv = await window.PmsMockApi.request('GET', '/reservations');
    const roomsEnv = await window.PmsMockApi.request('GET', '/rooms');
    const reservations = window.PmsMockApi.items(reservationsEnv).map(window.PmsMockApi.toLegacyReservation);
    const rooms = window.PmsMockApi.items(roomsEnv);
    const closed = new Set(['cancelled', 'canceled', 'completed', 'checkedout', 'checkoutcompleted', 'noshow', 'no_show', 'checkedin', 'checked-in', 'inhouse', 'in-house']);
    const statusKey = value => String(value || '').replace(/[-_\s]/g, '').toLowerCase();
    const todayCheckins = reservations
      .filter(res => String(res.checkInDate || res.checkin || '').slice(0, 10) === today && !closed.has(statusKey(res.status)))
      .sort((a, b) => String(a.room || '').localeCompare(String(b.room || ''), 'ko', { numeric: true }));
    const roomIsInHouse = res => {
      const roomNo = String(res.roomNo || res.room || '').trim();
      const room = rooms.find(item => String(item.roomNo || '').trim() === roomNo || item.id === res.roomId || item.roomId === res.roomId);
      return [room?.frontStatus, room?.occupancyStatus, room?.status, room?.housekeepingStatus]
        .map(statusKey)
        .some(status => ['checkedin', 'inhouse', 'occupied'].includes(status));
    };
    const beforeDashboardCount = Number((document.querySelector('.ops-kpi-card')?.innerText.match(/(\d+)\s*$/) || [])[1] || todayCheckins.length);
    const targetRooms = todayCheckins
      .filter(res => ['confirmed', 'pending'].includes(statusKey(res.status)) && !roomIsInHouse(res))
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
    return { today, targetRooms, before: todayCheckins.length, beforeDashboardCount, expectedAfter: beforeDashboardCount - targetRooms.length };
  });

  assert(!setup.skipped, 'Dashboard check-in count regression needs at least two due check-in reservations.', setup);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => {
    const first = document.querySelector('.ops-kpi-card');
    return first && /\d+/.test(first.innerText || '');
  }, null, { timeout: 15000 });

  const dashboardState = await page.evaluate(() => {
    const opsCard = document.querySelector('.ops-kpi-card');
    const opsText = opsCard?.innerText.trim() || '';
    const opsCount = Number((opsText.match(/(\d+)\s*$/) || [])[1]);
    const topText = Array.from(document.querySelectorAll('.kpi-card')).map(card => card.innerText.trim()).find(text => /체크인|Check-in/.test(text)) || '';
    return { opsText, opsCount, topText };
  });

  assert(dashboardState.opsCount === setup.expectedAfter, 'Dashboard check-in KPI did not subtract rooms already marked in-house.', { setup, dashboardState });

  await page.locator('.ops-kpi-card').first().click();
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => location.href.includes('reservation-board.html') && typeof renderReservationBoard === 'function' && document.querySelector('#boardChips .chip.active[data-filter="checkin"]'), null, { timeout: 15000 });

  const boardState = await page.evaluate(() => {
    const active = document.querySelector('#boardChips .chip.active[data-filter="checkin"]')?.innerText.trim() || '';
    const tabCount = Number((active.match(/(\d+)\s*$/) || [])[1]);
    const pageInfo = document.querySelector('#pageInfo')?.innerText.trim() || '';
    const pageTotal = Number((pageInfo.match(/총\s*([0-9]+)건/) || [])[1] || tabCount);
    return {
      url: location.href,
      active,
      tabCount,
      isCheckinActive: !!document.querySelector('#boardChips .chip.active[data-filter="checkin"]'),
      cardCount: document.querySelectorAll('.reservation-board-box').length,
      pageInfo,
      pageTotal,
      rowCount: document.querySelectorAll('#resBody tr.res-click-row').length,
      period: document.querySelector('#periodFilterSelect')?.value
    };
  });

  assert(boardState.url.includes('reservation-board.html') && boardState.url.includes('filter=checkin'), 'Dashboard check-in KPI must navigate to reservation board check-in filter.', boardState);
  assert(boardState.isCheckinActive, 'Reservation board filter must stay checkin after dashboard check-in navigation.', boardState);
  assert(boardState.tabCount === dashboardState.opsCount && boardState.pageTotal === dashboardState.opsCount, 'Dashboard and reservation board check-in counts diverged.', { setup, dashboardState, boardState });

  await page.evaluate(() => localStorage.removeItem('mockapi:v1:TENANT-GRAND-SAIGON:rooms'));
  return { setup, dashboardState, boardState };
}

async function reservationBoardCleaningVisibilityRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?test=board-cleaning-visibility`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => typeof renderReservationBoard === 'function' && document.querySelector('#reservationBoardContainer'), null, { timeout: 15000 });

  const boardState = await page.evaluate(() => {
    const toIso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const toMd = date => `${date.getMonth() + 1}/${date.getDate()}`;
    const today = window.PmsDate?.today ? window.PmsDate.today() : new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    currentLang = 'ko';
    window.currentLang = 'ko';
    boardFilter = 'all';
    boardPeriod = 'today';
    groups = [];
    rooms = [{
      id: 'T-904',
      roomNo: 'T-904',
      fullRoom: 'T-904',
      number: '904',
      type: 'Standard',
      building: 'Test Tower',
      frontStatus: 'vacant',
      status: 'vacant-clean',
      housekeepingStatus: 'clean',
      cleaningStatus: 'clean'
    }, {
      id: 'T-905',
      roomNo: 'T-905',
      fullRoom: 'T-905',
      number: '905',
      type: 'Standard',
      building: 'Test Tower',
      frontStatus: 'vacant',
      status: 'vacant-dirty',
      housekeepingStatus: 'dirty',
      cleaningStatus: 'dirty'
    }];
    reservations = [{
      id: 'RSV-BOARD-CLEANING-VISIBLE',
      room: 'T-904',
      roomNo: 'T-904',
      fullRoom: 'T-904',
      type: 'Standard',
      status: 'confirmed',
      guest: 'Board Clean Guest',
      guestName: 'Board Clean Guest',
      roomingGuestName: 'Board Clean Guest',
      checkInDate: toIso(yesterday),
      checkOutDate: toIso(tomorrow),
      checkin: toIso(yesterday),
      checkout: toIso(tomorrow),
      cin: toMd(yesterday),
      cout: toMd(tomorrow),
      nights: 2,
      len: 2,
      amount: 100
    }, {
      id: 'RSV-BOARD-DIRTY-ARRIVAL',
      room: 'T-905',
      roomNo: 'T-905',
      fullRoom: 'T-905',
      type: 'Standard',
      status: 'confirmed',
      guest: 'Board Dirty Arrival',
      guestName: 'Board Dirty Arrival',
      roomingGuestName: 'Board Dirty Arrival',
      checkInDate: toIso(today),
      checkOutDate: toIso(tomorrow),
      checkin: toIso(today),
      checkout: toIso(tomorrow),
      cin: toMd(today),
      cout: toMd(tomorrow),
      nights: 1,
      len: 1,
      amount: 100
    }];
    window.rooms = rooms;
    window.reservations = reservations;
    const search = document.getElementById('boardSearch');
    if (search) search.value = '';
    renderReservationBoard();

    const card = Array.from(document.querySelectorAll('.reservation-board-box')).find(el => el.innerText.includes('Board Clean Guest'));
    const cleanSelect = card?.querySelector('.board-clean-select');
    const selectedOption = cleanSelect?.selectedOptions?.[0];
    const dirtyCard = Array.from(document.querySelectorAll('.reservation-board-box')).find(el => el.innerText.includes('Board Dirty Arrival'));
    const dirtySelect = dirtyCard?.querySelector('.board-clean-select');
    return {
      cardText: card?.innerText || '',
      cleanValue: cleanSelect?.value || '',
      cleanLabel: selectedOption?.textContent?.trim() || '',
      cleanClass: cleanSelect?.className || '',
      readinessText: card?.querySelector('.board-readiness')?.innerText.trim() || '',
      statusText: card?.querySelector('.board-status')?.innerText.trim() || '',
      dirtyText: dirtyCard?.innerText || '',
      dirtyValue: dirtySelect?.value || '',
      dirtyClass: dirtySelect?.className || ''
    };
  });

  assert(boardState.cardText.includes('Board Clean Guest'), 'Reservation board test card did not render.', boardState);
  assert(boardState.statusText.includes('미도착'), 'Reservation board test card must exercise the overdue check-in state.', boardState);
  assert(boardState.readinessText.includes('체크인 가능'), 'Reservation board must keep check-in readiness visible for a clean overdue arrival.', boardState);
  assert(boardState.cleanValue === 'clean' && boardState.cleanLabel === '청소완료' && boardState.cleanClass.includes('clean'), 'Reservation board must show cleaning status even when check-in readiness is visible.', boardState);

  assert(boardState.dirtyText.includes('Board Dirty Arrival') && boardState.dirtyValue === 'mur' && boardState.dirtyClass.includes('mur'), 'Reservation board must render a dirty arrival cleaning select with the orange MUR tone.', boardState);

  return boardState;
}

async function todayCheckinRoomMasterRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?filter=checkin&test=today-checkin-room-master`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => typeof openUnifiedResModal === 'function' && typeof processUnifiedReservationFlow === 'function', null, { timeout: 15000 });

  const result = await page.evaluate(async () => {
    const blockedStatuses = new Set(['oos', 'outofservice', 'outoforder', 'maintenance']);
    const normalizedStatus = value => String(value || '').replace(/[-_\s]/g, '').toLowerCase();
    const roomBlocksCheckIn = room => [room?.frontStatus, room?.status, room?.housekeepingStatus]
      .map(normalizedStatus)
      .some(status => blockedStatuses.has(status));
    const clone = value => JSON.parse(JSON.stringify(value || null));
    const captured = { alerts: [], confirms: [] };
    window.showAlert = async message => {
      captured.alerts.push(String(message || ''));
      return true;
    };
    window.showConfirm = async message => {
      captured.confirms.push(String(message || ''));
      return true;
    };

    const reservation = (window.reservations || []).find(item => item.roomNo === '1210' || item.roomId === 'FT-1210');
    if (!reservation) throw new Error('Room 1210 today check-in reservation was not found.');
    const beforeRoom = clone((window.rooms || []).find(item => item.roomNo === '1210' || item.roomId === 'FT-1210'));
    const liveRoom = (window.rooms || []).find(item => item.roomNo === '1210' || item.roomId === 'FT-1210');
    if (liveRoom) {
      liveRoom.status = 'out-of-service';
      liveRoom.housekeepingStatus = 'maintenance';
      liveRoom.frontStatus = 'out-of-service';
    }
    const staleRoom = clone(liveRoom);

    await window.openUnifiedResModal(reservation.id || reservation.reservationId);
    const actionText = document.getElementById('unifiedFlowActions')?.innerText || '';
    await window.processUnifiedReservationFlow('checkin');

    const afterReservation = (window.reservations || []).find(item => item.id === reservation.id || item.reservationId === reservation.reservationId);
    const afterRoom = (window.rooms || []).find(item => item.roomNo === '1210' || item.roomId === 'FT-1210');
    return {
      captured,
      actionText,
      beforeRoom,
      beforeRoomBlocked: roomBlocksCheckIn(beforeRoom),
      staleRoom,
      staleRoomBlocked: roomBlocksCheckIn(staleRoom),
      afterReservation: clone(afterReservation),
      afterRoom: clone(afterRoom)
    };
  });

  assert(result.beforeRoom && !result.beforeRoomBlocked, 'Room 1210 today check-in must not be assigned to a blocked room master status.', result);
  assert(result.staleRoom && result.staleRoomBlocked, 'Regression must simulate a stale blocked room master status.', result);
  assert(result.captured.alerts.length === 0, 'Room 1210 today check-in must not show a blocking alert.', result);
  assert(result.captured.confirms.length > 0, 'Room 1210 today check-in must ask for confirmation before changing status.', result);
  assert(['checkedin', 'checked-in', 'inhouse', 'in-house'].includes(String(result.afterReservation?.status || '').toLowerCase()), 'Room 1210 today check-in must complete to an in-house state.', result);

  return result;
}

async function reservationBoardFilterColorRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?test=board-filter-color`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => typeof setBoardFilter === 'function' && typeof renderReservationBoard === 'function' && Array.isArray(window.reservations), null, { timeout: 15000 });

  const result = await page.evaluate(async () => {
    const targetCheckout = (window.reservations || []).find(item => item.id === 'RSV-DEMO-0708-1203-CHECKOUT');
    const activeLate = (window.reservations || []).find(item => item.id === 'RSV-0010');
    const room = (window.rooms || []).find(item => item.roomNo === '1203' || item.id === '1203' || item.roomId === 'FT-1203');
    if (!targetCheckout || !activeLate || !room) throw new Error('Room 1203 regression fixtures were not found.');

    targetCheckout.status = 'completed';
    targetCheckout.settlementStatus = 'settled';
    room.housekeepingStatus = 'dirty';
    room.cleaningStatus = 'dirty';
    room.guestFlag = 'mur';

    const capture1203 = filter => {
      window.setBoardFilter(filter);
      const card = Array.from(document.querySelectorAll('.reservation-board-box')).find(el => (el.innerText || '').includes('1203'));
      const style = card ? getComputedStyle(card) : null;
      const status = card?.querySelector('.board-status');
      return {
        filter,
        found: !!card,
        className: card?.className || '',
        text: (card?.innerText || '').replace(/\s+/g, ' ').trim(),
        borderColor: style?.borderColor || '',
        boxShadow: style?.boxShadow || '',
        statusClass: status?.className || '',
        statusText: (status?.innerText || '').trim()
      };
    };

    const all = capture1203('all');
    const dirty = capture1203('dirty');
    const vacant = capture1203('vacant');
    const late = capture1203('late');
    const inhouse = capture1203('inhouse');
    const lateLegendVisible = !!document.querySelector('.board-legend-swatch.late');
    const completedChipVisible = !!document.querySelector('#boardChips .chip[data-filter="completed"]');
    const chipCardCounts = Array.from(document.querySelectorAll('#boardChips .chip')).map(chip => {
      const filter = chip.dataset.filter;
      window.setBoardFilter(filter);
      return {
        filter,
        chip: Number(chip.querySelector('.chip-count')?.textContent?.trim() || 0),
        cardCount: document.querySelectorAll('.reservation-board-box').length
      };
    });

    window.setBoardFilter('all');
    const hoverCard = Array.from(document.querySelectorAll('.reservation-board-box')).find(el => (el.innerText || '').includes('1203'));
    const before = hoverCard ? getComputedStyle(hoverCard) : null;
    return {
      all,
      dirty,
      vacant,
      late,
      inhouse,
      lateLegendVisible,
      completedChipVisible,
      chipCardCounts,
      hoverTarget: hoverCard ? {
        left: hoverCard.getBoundingClientRect().left + 10,
        top: hoverCard.getBoundingClientRect().top + 10,
        borderColor: before?.borderColor || '',
        boxShadow: before?.boxShadow || ''
      } : null
    };
  });

  assert(result.all.found && result.all.className.includes('vacant') && !result.all.className.includes('completed') && !result.all.className.includes('late') && !result.all.statusClass.includes('late'), 'Room 1203 all filter must treat a completed checkout as vacant instead of stale late/completed reservation state.', result);
  assert(!result.completedChipVisible, 'Reservation board must not expose a separate completed checkout filter chip.', result);
  assert(result.chipCardCounts.every(item => item.chip === item.cardCount), 'Reservation board filter chip counts must match the visible room card count.', result);
  assert(!result.lateLegendVisible, 'Reservation board legend must not expose late as a main card color.', result);
  assert(result.vacant.found && result.vacant.className.includes('vacant'), 'Room 1203 vacant filter must include a room after completed checkout.', result);
  assert(result.dirty.found && result.dirty.className.includes('vacant'), 'Room 1203 dirty filter must show the room as vacant with cleaning needed after completed checkout.', result);
  assert(result.all.borderColor === result.dirty.borderColor && result.all.boxShadow === result.dirty.boxShadow, 'Room 1203 all and dirty filters must keep the same vacant status color.', result);
  assert(!result.late.found && !result.inhouse.found, 'Room 1203 stale late/in-house stay must be hidden once the same room has a completed checkout today.', result);

  if (result.hoverTarget) {
    await page.mouse.move(result.hoverTarget.left, result.hoverTarget.top);
    await page.waitForTimeout(250);
    const hoverAfter = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('.reservation-board-box')).find(el => (el.innerText || '').includes('1203'));
      const style = card ? getComputedStyle(card) : null;
      return {
        borderColor: style?.borderColor || '',
        boxShadow: style?.boxShadow || '',
        transform: style?.transform || ''
      };
    });
    result.hoverAfter = hoverAfter;
    assert(hoverAfter.borderColor === result.hoverTarget.borderColor && hoverAfter.boxShadow === result.hoverTarget.boxShadow && hoverAfter.transform === 'none', 'Room 1203 hover must not change status color or move the card.', result);
  }

  return result;
}

(async () => {
  let base = DEFAULT_BASE;
  let server = null;
  if (!(await httpOk(`${base}/dashboard/frontdesk/reservation-list.html`))) {
    server = await serveStatic(PORT);
    if (!server) {
      server = await serveStatic(0);
      base = `http://127.0.0.1:${server.address().port}`;
    }
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleIssues = [];

  page.on('console', msg => {
    if (!['error', 'warning'].includes(msg.type())) return;
    const text = msg.text();
    if (/ERR_NETWORK_ACCESS_DENIED|Failed to load resource|favicon|googleapis|gstatic|cdnjs|cdn\.jsdelivr/i.test(text)) return;
    consoleIssues.push(`${msg.type()}: ${text}`);
  });
  page.on('pageerror', err => consoleIssues.push(`pageerror: ${err.message}`));

  try {
    await page.addInitScript(() => {
      sessionStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('pms_lang', 'ko');
    });

    const dashboardCountResult = await dashboardCheckinCountRegression(page, base);
    const boardCleaningVisibilityResult = await reservationBoardCleaningVisibilityRegression(page, base);
    const todayCheckinRoomMasterResult = await todayCheckinRoomMasterRegression(page, base);
    const boardFilterColorResult = await reservationBoardFilterColorRegression(page, base);

    await page.goto(`${base}/dashboard/frontdesk/reservation-list.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForFunction(() => typeof renderTable === 'function' && typeof openUnifiedResModal === 'function', null, { timeout: 15000 });

    const koList = await page.evaluate(() => {
      currentLang = 'ko';
      window.currentLang = 'ko';
      reservations = [
        { id: 'RSV-001', room: '1201', type: 'Deluxe', channel: 'Direct', guest: 'Kim One', cin: '6/8', cout: '6/9', nights: 1, status: 'confirmed', amount: 100 },
        { id: 'RSV-002', room: '1202', type: 'Deluxe', channel: 'OTA', guest: 'Lee Two', cin: '6/8', cout: '6/9', nights: 1, status: 'confirmed', amount: 100 },
        { id: 'RSV-003', room: '1203', type: 'Deluxe', channel: 'Agoda', guest: 'Park Three', groupId: 'GRP-1', groupName: 'Conference A', cin: '6/8', cout: '6/9', nights: 1, status: 'confirmed', amount: 100 }
      ];
      currentPeriodFilter = 'all';
      currentFilter = 'all';
      currentPage = 1;
      document.getElementById('searchInput').value = '';
      renderTable();
      const tableText = document.querySelector('#resTable')?.innerText || '';
      const mobileText = document.querySelector('#resMobileCards')?.innerText || '';
      const desktopBadges = Array.from(document.querySelectorAll('#resBody .reservation-kind-tag')).map(el => el.innerText.trim());
      const mobileBadges = Array.from(document.querySelectorAll('#resMobileCards .reservation-kind-tag')).map(el => el.innerText.trim());
      document.getElementById('searchInput').value = 'OTA';
      renderTable();
      return {
        headers: Array.from(document.querySelectorAll('#resTable thead th')).map(th => th.innerText.trim()),
        sortLabels: Array.from(document.querySelectorAll('.reservation-sort-group .sort-label')).map(el => el.innerText.trim()),
        desktopBadges,
        mobileBadges,
        channelLeaks: ['Direct', 'OTA', 'Agoda', 'Booking.com', 'Walk-in', 'Channel', '채널', '직접', '방문'].filter(word => tableText.includes(word) || mobileText.includes(word)),
        otaSearchText: document.querySelector('#resBody')?.innerText || ''
      };
    });

    assert(koList.headers.includes('구분'), 'Reservation list must show 구분 header in Korean.', koList.headers);
    assert(!koList.headers.includes('채널'), 'Reservation list must not show 채널 header.', koList.headers);
    assert(koList.channelLeaks.length === 0, 'Reservation list leaked channel labels.', koList.channelLeaks);
    assert(!koList.otaSearchText.includes('RSV-002'), 'Reservation search must not match hidden channel values.');
    assert(JSON.stringify(countValues(koList.desktopBadges)) === JSON.stringify({ '단체': 1, '개인': 2 }), 'Desktop reservation kind badges are wrong.', koList.desktopBadges);
    assert(JSON.stringify(countValues(koList.mobileBadges)) === JSON.stringify({ '단체': 1, '개인': 2 }), 'Mobile reservation kind badges are wrong.', koList.mobileBadges);
    assert(koList.sortLabels.includes('레이트 우선') && !koList.sortLabels.includes('레이트 체크아웃'), 'Late checkout sort button must not duplicate the filter label in Korean.', koList.sortLabels);

    const enList = await page.evaluate(() => {
      document.getElementById('searchInput').value = '';
      changeLang('en');
      renderTable();
      return {
        headers: Array.from(document.querySelectorAll('#resTable thead th')).map(th => th.innerText.trim()),
        sortLabels: Array.from(document.querySelectorAll('.reservation-sort-group .sort-label')).map(el => el.innerText.trim()),
        badges: Array.from(document.querySelectorAll('#resBody .reservation-kind-tag')).map(el => el.innerText.trim())
      };
    });

    const enHeaders = enList.headers.map(header => header.toLowerCase());
    assert(enHeaders.includes('guest type'), 'Reservation list must show Guest Type header in English.', enList.headers);
    assert(!enHeaders.includes('channel'), 'Reservation list must not show Channel header in English.', enList.headers);
    assert(JSON.stringify(countValues(enList.badges)) === JSON.stringify({ Group: 1, Individual: 2 }), 'English reservation kind badges are wrong.', enList.badges);
    assert(enList.sortLabels.includes('Late first') && !enList.sortLabels.includes('Late checkout'), 'Late checkout sort button must not duplicate the filter label in English.', enList.sortLabels);

    const modalResult = await page.evaluate(async () => {
      currentLang = 'ko';
      window.currentLang = 'ko';
      window.rooms = [{ id: 'T-901', number: '901', fullRoom: 'T-901', type: 'Standard', building: 'Test Tower', status: 'vacant-clean', housekeepingStatus: 'clean', frontStatus: 'vacant' }];
      window.reservations = [];
      reservations = window.reservations;
      window.PmsMockApi = { request: async () => ({ data: { items: [] } }), items: () => [], toLegacyGroup: item => item };
      await openUnifiedResModal();
      const statusEl = document.getElementById('unifiedStatus');
      const statusSelectExists = !!document.querySelector('#unifiedResModal select#unifiedStatus');
      const groupCheckboxExists = !!document.getElementById('unifiedIsB2B');
      const groupSelectExists = !!document.getElementById('unifiedGroupSelect');
      const initialActionBarDisplay = getComputedStyle(document.getElementById('unifiedGuestCandidateActions')).display;
      await window._editGuestWidget.showNewForm();
      const newFormActionBarDisplay = getComputedStyle(document.getElementById('unifiedGuestCandidateActions')).display;
      document.getElementById('nrGuestEdit').value = 'Direct Test Guest';
      document.getElementById('nrPhoneEdit').value = '+84 90 000 0901';
      document.getElementById('unifiedRoom').value = 'T-901';
      await saveUnifiedRes();
      return {
        statusType: statusEl?.getAttribute('type') || null,
        statusVisible: statusEl ? !!(statusEl.offsetWidth || statusEl.offsetHeight || statusEl.getClientRects().length) : null,
        statusSelectExists,
        groupCheckboxExists,
        groupSelectExists,
        initialActionBarDisplay,
        newFormActionBarDisplay,
        created: window.reservations[0]
      };
    });

    assert(modalResult.statusType === 'hidden' && modalResult.statusVisible === false, 'Reservation status must be hidden in the modal.', modalResult);
    assert(!modalResult.statusSelectExists, 'Reservation modal must not expose a status select.', modalResult);
    assert(!modalResult.groupCheckboxExists && !modalResult.groupSelectExists, 'Reservation modal must not expose group conversion controls.', modalResult);
    assert(modalResult.initialActionBarDisplay === 'none', 'New reservation must keep representative/companion action buttons hidden before a guest candidate is active.', modalResult);
    assert(modalResult.newFormActionBarDisplay === 'flex', 'New reservation must show representative/companion action buttons after opening a guest candidate form.', modalResult);
    assert(modalResult.created?.status === 'confirmed', 'New reservation must default to confirmed.', modalResult.created);
    assert(!modalResult.created?.groupId && modalResult.created?.isB2B === false, 'New reservation must default to individual.', modalResult.created);

    const editSearchState = await page.evaluate(async () => {
      window.rooms = [{ id: 'T-902', number: '902', fullRoom: 'T-902', type: 'Standard', building: 'Test Tower', status: 'vacant-clean', housekeepingStatus: 'clean', frontStatus: 'vacant' }];
      window.reservations = [{
        id: 'RSV-DETAIL',
        room: 'T-902',
        fullRoom: 'T-902',
        type: 'Standard',
        status: 'confirmed',
        guest: 'Alexander Kim',
        guestName: 'Alexander Kim',
        roomingGuestName: 'Alexander Kim',
        guestId: 'G-DETAIL',
        roomingGuestId: 'G-DETAIL',
        phone: '+82 10 9900 1401',
        email: 'alexander.kim@example.com',
        cin: '6/8',
        cout: '6/9',
        checkin: '2026-06-08',
        checkout: '2026-06-09',
        checkInDate: '2026-06-08',
        checkOutDate: '2026-06-09',
        nights: 1,
        len: 1
      }];
      reservations = window.reservations;
      await openUnifiedResModal('RSV-DETAIL');
      return {
        selectedCardDisplay: getComputedStyle(document.getElementById('selectedGuestCardEdit')).display,
        searchResultsDisplay: getComputedStyle(document.getElementById('guestSearchResultsEdit')).display,
        actionBarDisplay: getComputedStyle(document.getElementById('unifiedGuestCandidateActions')).display,
        rosterText: document.getElementById('unifiedStayGuestList')?.innerText || '',
        privacyText: document.getElementById('unifiedGuestPrivacyBody')?.innerText || ''
      };
    });

    assert(editSearchState.selectedCardDisplay === 'none', 'Edit detail must not show the selected guest search card until a search result is chosen.', editSearchState);
    assert(editSearchState.searchResultsDisplay === 'none', 'Edit detail must keep guest search results hidden until searching.', editSearchState);
    assert(editSearchState.actionBarDisplay === 'none', 'Edit detail must keep representative/companion action buttons hidden until a guest candidate is active.', editSearchState);
    assert(editSearchState.rosterText.includes('Alexander Kim'), 'Edit detail must still show the reservation guest roster.', editSearchState);
    assert(editSearchState.privacyText.includes('Alexander Kim'), 'Edit detail must still show guest detail information below.', editSearchState);

    const occupiedRoomFlowState = await page.evaluate(async () => {
      const today = window.PmsDate?.todayIso ? window.PmsDate.todayIso() : new Date().toISOString().slice(0, 10);
      const tomorrowDate = new Date(`${today}T00:00:00`);
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrow = tomorrowDate.toISOString().slice(0, 10);
      window.rooms = [{
        id: 'T-903',
        number: '903',
        fullRoom: 'T-903',
        roomNo: 'T-903',
        type: 'Standard',
        building: 'Test Tower',
        frontStatus: 'vacant',
        status: 'occupied',
        housekeepingStatus: 'clean'
      }];
      window.reservations = [{
        id: 'RSV-OCCUPIED-ROOM',
        room: 'T-903',
        fullRoom: 'T-903',
        roomNo: 'T-903',
        type: 'Standard',
        status: 'confirmed',
        guest: 'Occupied Room Guest',
        guestName: 'Occupied Room Guest',
        cin: today,
        cout: tomorrow,
        checkin: today,
        checkout: tomorrow,
        checkInDate: today,
        checkOutDate: tomorrow,
        nights: 1,
        len: 1
      }];
      reservations = window.reservations;
      await openUnifiedResModal('RSV-OCCUPIED-ROOM');
      const actionText = document.getElementById('unifiedFlowActions')?.innerText.trim() || '';
      return {
        actionText,
        readonly: document.getElementById('unifiedResModal')?.dataset.readonlyReservation,
        roomStatuses: window.rooms.map(room => [room.frontStatus, room.status, room.housekeepingStatus])
      };
    });

    assert(/체크아웃|check-?out/i.test(occupiedRoomFlowState.actionText) && !/체크인|check-?in/i.test(occupiedRoomFlowState.actionText.replace(/check-?out/ig, '')), 'Occupied room reservation detail must render checkout action, not check-in.', occupiedRoomFlowState);
    assert(occupiedRoomFlowState.readonly === 'true', 'Occupied room reservation detail must be treated as post-check-in readonly.', occupiedRoomFlowState);

    const blockResult = await page.evaluate(async () => {
      window.reservations = [{
        id: 'BLK-901',
        room: 'T-901',
        fullRoom: 'T-901',
        type: 'Standard',
        status: 'confirmed',
        isGroupPlaceholder: true,
        guest: 'Preserved Block Name',
        groupId: 'GRP-1',
        groupName: 'Test Group',
        channel: 'Agoda',
        cin: '6/8',
        cout: '6/9',
        checkin: '2026-06-08',
        checkout: '2026-06-09',
        checkInDate: '2026-06-08',
        checkOutDate: '2026-06-09',
        nights: 1,
        len: 1
      }];
      reservations = window.reservations;
      await openUnifiedResModal('BLK-901');
      const before = {
        hiddenStatus: document.getElementById('unifiedStatus')?.value,
        guestSectionDisplay: getComputedStyle(document.getElementById('unifiedGuestSection')).display,
        blockNoticeDisplay: getComputedStyle(document.getElementById('unifiedBlockNotice')).display
      };
      await saveUnifiedRes();
      return { before, after: window.reservations[0] };
    });

    assert(blockResult.before.hiddenStatus === 'blocked', 'Group block modal must keep blocked status internally.', blockResult);
    assert(blockResult.before.guestSectionDisplay === 'block', 'Group block modal must allow guest entry from the timeline.', blockResult);
    assert(blockResult.before.blockNoticeDisplay === 'block', 'Group block modal must show block notice.', blockResult);
    assert(blockResult.after.status === 'blocked', 'Saving a group block must preserve blocked status.', blockResult.after);
    assert(blockResult.after.guest === 'Preserved Block Name', 'Saving a group block must preserve the existing guest/group label.', blockResult.after);

    assert(consoleIssues.length === 0, 'Console warnings/errors during reservation regression.', consoleIssues);

    console.log(JSON.stringify({
      ok: true,
      checks: [
        'reservation list uses personal/group only',
        'channel labels do not render or search',
        'Korean/English headers stay consistent',
        'late checkout filter and sort labels stay distinct',
        'new reservation has no manual status/group conversion controls',
        'edit detail keeps guest search idle until user searches',
        'occupied rooms render checkout action instead of check-in',
        'reservation board keeps cleaning status visible beside check-in readiness',
        'today check-in rooms are not blocked by stale room master status',
        'reservation board keeps card status colors stable across filters and hover',
        'representative/companion buttons only show for active guest candidates',
        'group block timeline modal allows guest entry without forcing conversion',
        'dashboard today check-in KPI matches reservation board after rooms become in-house'
      ],
      dashboardCountResult,
      boardCleaningVisibilityResult,
      todayCheckinRoomMasterResult,
      boardFilterColorResult
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: error.message, details: error.details || null, consoleIssues }, null, 2));
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (server) server.close();
  }
})();
