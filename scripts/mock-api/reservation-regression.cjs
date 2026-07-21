const fs = require('fs');
const http = require('http');
const https = require('https');
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
    const client = new URL(url).protocol === 'https:' ? https : http;
    const req = client.get(url, res => {
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

  const boardState = await page.evaluate(async () => {
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
    }, {
      id: 'T-906',
      roomNo: 'T-906',
      fullRoom: 'T-906',
      number: '906',
      type: 'Standard',
      building: 'Test Tower',
      frontStatus: 'oos',
      status: 'oos',
      housekeepingStatus: 'oos',
      cleaningStatus: 'oos',
      maintenanceStatus: 'oos',
      isOutOfService: true
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
    const oosCard = Array.from(document.querySelectorAll('.reservation-board-box')).find(el => el.innerText.includes('T-906'));
    const oosSelect = oosCard?.querySelector('.board-clean-select');
    const dirtySnapshot = {
      text: dirtyCard?.innerText || '',
      value: dirtySelect?.value || '',
      className: dirtySelect?.className || '',
      tone: dirtySelect?.dataset?.cleanTone || '',
      background: dirtySelect ? getComputedStyle(dirtySelect).backgroundColor : ''
    };
    const originalAudit = window.PmsPrivacyAudit;
    const originalPmsApi = window.PmsAPI;
    const originalMockApi = window.PmsMockApi;
    localStorage.removeItem('pms_privacy_audit_logs');
    window.PmsPrivacyAudit = undefined;
    window.PmsAPI = {
      saveRooms: async () => {},
      setGuestFlag: async () => {},
      syncRoomStatusToTask: async () => {}
    };
    window.PmsMockApi = null;
    dirtySelect.value = 'dnd';
    await window.setBoardStayState({ preventDefault() {}, stopPropagation() {} }, dirtySelect);
    const fallbackLogs = JSON.parse(localStorage.getItem('pms_privacy_audit_logs') || '[]')
      .filter(entry => entry.action === 'room.cleaning.status' && entry.details?.room === 'T-905');
    window.PmsPrivacyAudit = originalAudit;
    window.PmsAPI = originalPmsApi;
    window.PmsMockApi = originalMockApi;
    return {
      cardText: card?.innerText || '',
      cleanValue: cleanSelect?.value || '',
      cleanLabel: selectedOption?.textContent?.trim() || '',
      cleanClass: cleanSelect?.className || '',
      readinessText: card?.querySelector('.board-readiness')?.innerText.trim() || '',
      statusText: card?.querySelector('.board-status')?.innerText.trim() || '',
      dirtyText: dirtySnapshot.text,
      dirtyValue: dirtySnapshot.value,
      dirtyClass: dirtySnapshot.className,
      dirtyTone: dirtySnapshot.tone,
      dirtyBackground: dirtySnapshot.background,
      oosOptionValues: Array.from(oosSelect?.options || []).map(option => option.value),
      oosOptionLabels: Array.from(oosSelect?.options || []).map(option => option.textContent.trim()),
      fallbackAuditCount: fallbackLogs.length,
      fallbackAuditStatus: fallbackLogs[0]?.details?.status || ''
    };
  });

  assert(boardState.cardText.includes('Board Clean Guest'), 'Reservation board test card did not render.', boardState);
  assert(boardState.statusText.includes('미도착'), 'Reservation board test card must exercise the overdue check-in state.', boardState);
  assert(boardState.readinessText.includes('체크인 가능'), 'Reservation board must keep check-in readiness visible for a clean overdue arrival.', boardState);
  assert(boardState.cleanValue === 'clean' && boardState.cleanLabel === '청소완료' && boardState.cleanClass.includes('clean'), 'Reservation board must show cleaning status even when check-in readiness is visible.', boardState);

  assert(boardState.dirtyText.includes('Board Dirty Arrival') && boardState.dirtyValue === 'mur' && boardState.dirtyClass.includes('mur') && boardState.dirtyTone === 'mur' && boardState.dirtyBackground !== 'rgb(255, 255, 255)', 'Reservation board must render a dirty arrival cleaning select with the orange MUR tone.', boardState);
  assert(JSON.stringify(boardState.oosOptionValues) === JSON.stringify(['dirty', 'clean', 'dnd', 'oos']), 'Out-of-service room status menu must expose exactly dirty, clean, DND, and maintenance.', boardState);
  assert(JSON.stringify(boardState.oosOptionLabels) === JSON.stringify(['청소필요', '청소완료', '방해금지', '점검중']), 'Out-of-service room status menu labels must match the approved four statuses.', boardState);
  assert(boardState.fallbackAuditCount === 1 && boardState.fallbackAuditStatus === 'dnd', 'Reservation board cleaning changes must write one audit row when the shared audit module is unavailable.', boardState);

  return boardState;
}

async function todayCheckinRoomMasterRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?filter=checkin&test=today-checkin-room-master`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => (
    typeof openUnifiedResModal === 'function' &&
    typeof processUnifiedReservationFlow === 'function' &&
    Array.isArray(window.rooms) &&
    window.rooms.some(item => ['1210', 'FT-1210'].includes(String(item.roomNo || item.number || item.id || item.roomId || item.fullRoom || ''))) &&
    Array.isArray(window.reservations) &&
    window.reservations.some(item => ['1210', 'FT-1210'].includes(String(item.roomNo || item.room || item.roomId || item.fullRoom || '')))
  ), null, { timeout: 15000 });

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

    const reservation = (window.reservations || []).find(item => ['1210', 'FT-1210'].includes(String(item.roomNo || item.room || item.roomId || item.fullRoom || '')));
    if (!reservation) throw new Error('Room 1210 today check-in reservation was not found.');
    const beforeRoom = clone((window.rooms || []).find(item => ['1210', 'FT-1210'].includes(String(item.roomNo || item.number || item.id || item.roomId || item.fullRoom || ''))));
    const liveRoom = (window.rooms || []).find(item => ['1210', 'FT-1210'].includes(String(item.roomNo || item.number || item.id || item.roomId || item.fullRoom || '')));
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
    const auditLogs = window.PmsPrivacyAudit?.list?.() || [];
    const audit = [...auditLogs].reverse().find(item => item.action === 'reservation.checkin' && item.details?.reservationId === reservation.id);
    const result = {
      captured,
      actionText,
      beforeRoom,
      beforeRoomBlocked: roomBlocksCheckIn(beforeRoom),
      staleRoom,
      staleRoomBlocked: roomBlocksCheckIn(staleRoom),
      afterReservation: clone(afterReservation),
      afterRoom: clone(afterRoom),
      audit: clone(audit)
    };
    if (liveRoom && beforeRoom) Object.assign(liveRoom, beforeRoom);
    return result;
  });

  assert(result.beforeRoom?.status === 'vacant-clean', 'Room adapter must preserve the canonical vacant-clean status.', result);
  assert(result.beforeRoom && !result.beforeRoomBlocked, 'Room 1210 today check-in must not be assigned to a blocked room master status.', result);
  assert(result.staleRoom && result.staleRoomBlocked, 'Regression must simulate a stale blocked room master status.', result);
  assert(result.captured.alerts.length > 0, 'An out-of-service room must show a blocking alert.', result);
  assert(result.captured.confirms.length === 0, 'An out-of-service room must stop before check-in confirmation.', result);
  assert(['confirmed', 'pending'].includes(String(result.afterReservation?.status || '').toLowerCase()), 'Blocked check-in must preserve the reservation status.', result);
  assert(!result.audit, 'Blocked check-in must not write a successful check-in audit row.', result);

  return result;
}

async function reservationBoardFilterColorRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?test=board-filter-color`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => typeof setBoardFilter === 'function' && typeof renderReservationBoard === 'function' && Array.isArray(window.reservations), null, { timeout: 15000 });

  const result = await page.evaluate(async () => {
    const isoDate = offset => {
      const date = window.PmsDate?.today ? window.PmsDate.today() : new Date();
      date.setDate(date.getDate() + offset);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    let room = (window.rooms || []).find(item => item.roomNo === '1203' || item.id === '1203' || item.roomId === 'FT-1203');
    if (!room) {
      room = { id: 'FT-1203', roomId: 'FT-1203', roomNo: '1203', number: '1203', type: 'Deluxe', building: 'Forest Tower' };
      window.rooms.push(room);
    }
    for (let index = window.reservations.length - 1; index >= 0; index -= 1) {
      const item = window.reservations[index];
      if (['1203', 'FT-1203'].includes(String(item.roomNo || item.room || item.roomId || item.fullRoom || ''))) {
        window.reservations.splice(index, 1);
      }
    }
    let targetCheckout = (window.reservations || []).find(item => item.id === 'QA-BOARD-1203-CHECKOUT');
    if (!targetCheckout) {
      targetCheckout = {
        id: 'QA-BOARD-1203-CHECKOUT', reservationId: 'QA-BOARD-1203-CHECKOUT', room: '1203', roomNo: '1203', roomId: 'FT-1203', fullRoom: 'FT-1203',
        guest: 'Board Checkout Guest', guestName: 'Board Checkout Guest', status: 'completed', settlementStatus: 'settled',
        checkInDate: isoDate(-2), checkOutDate: isoDate(0), checkin: isoDate(-2), checkout: isoDate(0), amount: 140
      };
      window.reservations.push(targetCheckout);
    }
    let activeLate = (window.reservations || []).find(item => item.id === 'QA-BOARD-1203-LATE');
    if (!activeLate) {
      activeLate = {
        id: 'QA-BOARD-1203-LATE', reservationId: 'QA-BOARD-1203-LATE', room: '1203', roomNo: '1203', roomId: 'FT-1203', fullRoom: 'FT-1203',
        guest: 'Stale Late Guest', guestName: 'Stale Late Guest', status: 'confirmed',
        checkInDate: isoDate(-3), checkOutDate: isoDate(-1), checkin: isoDate(-3), checkout: isoDate(-1), amount: 140
      };
      window.reservations.push(activeLate);
    }

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

async function reservationBoardSettlementAndGroupInvariantRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?test=board-settlement-group-invariant`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => typeof renderReservationBoard === 'function' && typeof setBoardFilter === 'function', null, { timeout: 15000 });

  const result = await page.evaluate(() => {
    const today = window.__qaIsoDate(0);
    const yesterday = window.__qaIsoDate(-1);
    const tomorrow = window.__qaIsoDate(1);
    localStorage.setItem('pms_lang', 'ko');
    localStorage.removeItem('pms_settlement_completions');
    localStorage.removeItem('pms_settlement_reopens');
    currentLang = 'ko';
    window.currentLang = 'ko';
    boardFilter = 'all';
    boardPeriod = 'today';
    groups = [{ id: 'P1-GROUP-INVARIANT', name: 'P1 Group Invariant' }];
    rooms = [
      { id: 'T-GROUP', roomNo: 'T-GROUP', fullRoom: 'T-GROUP', type: 'Standard', building: 'Test Tower', floor: 1, status: 'occupied', frontStatus: 'in-house', housekeepingStatus: 'clean' },
      { id: 'T-SETTLE', roomNo: 'T-SETTLE', fullRoom: 'T-SETTLE', type: 'Standard', building: 'Test Tower', floor: 1, status: 'occupied', frontStatus: 'in-house', housekeepingStatus: 'dirty' }
    ];
    reservations = [
      {
        id: 'RSV-P1-GROUP-INVARIANT', room: 'T-GROUP', roomNo: 'T-GROUP', fullRoom: 'T-GROUP', status: 'checkedin',
        guest: 'Group Invariant Guest', guestName: 'Group Invariant Guest', groupId: 'P1-GROUP-INVARIANT', groupName: 'P1 Group Invariant', isB2B: true,
        checkInDate: yesterday, checkOutDate: tomorrow, checkin: yesterday, checkout: tomorrow, amount: 100, balanceDue: 0
      },
      {
        id: 'RSV-P1-SETTLEMENT', room: 'T-SETTLE', roomNo: 'T-SETTLE', fullRoom: 'T-SETTLE', status: 'checkout',
        guest: 'Settlement Invariant Guest', guestName: 'Settlement Invariant Guest',
        checkInDate: yesterday, checkOutDate: today, checkin: yesterday, checkout: today, amount: 100, balanceDue: 0
      }
    ];
    window.rooms = rooms;
    window.reservations = reservations;
    const container = document.getElementById('reservationBoardContainer');
    const capture = (filter, roomId) => {
      setBoardFilter(filter);
      const card = Array.from(document.querySelectorAll('.reservation-board-box')).find(element => element.querySelector('.room-box-num span')?.textContent.trim() === roomId);
      const style = card ? getComputedStyle(card) : null;
      return {
        found: !!card,
        className: card?.className || '',
        status: card?.querySelector('.board-status')?.innerText.trim() || '',
        borderColor: style?.borderColor || '',
        boxShadow: style?.boxShadow || '',
        settlement: card?.querySelector('.board-settlement-summary')?.innerText.trim() || ''
      };
    };

    container.dataset.renderSignature = '';
    renderReservationBoard();
    const groupAll = capture('all', 'T-GROUP');
    const groupFiltered = capture('group', 'T-GROUP');

    localStorage.setItem('pms_settlement_completions', JSON.stringify([{
      id: 'DONE-P1-SETTLEMENT', reservationId: 'RSV-P1-SETTLEMENT', room: 'T-SETTLE', businessDate: today,
      completedAt: `${today}T10:00:00+09:00`
    }]));
    window.dispatchEvent(new CustomEvent('pms:settlement-completions-updated'));
    const settlementCompleted = capture('all', 'T-SETTLE');

    localStorage.setItem('pms_settlement_reopens', JSON.stringify([{
      id: 'REOPEN-P1-SETTLEMENT', reservationId: 'RSV-P1-SETTLEMENT', room: 'T-SETTLE', businessDate: today,
      reopenedAt: `${today}T10:01:00+09:00`
    }]));
    window.dispatchEvent(new CustomEvent('pms:settlement-completions-updated'));
    const settlementReopened = capture('all', 'T-SETTLE');
    const legendText = document.querySelector('.board-status-legend')?.innerText || '';
    localStorage.removeItem('pms_settlement_completions');
    localStorage.removeItem('pms_settlement_reopens');
    return { groupAll, groupFiltered, settlementCompleted, settlementReopened, legendText };
  });

  assert(result.groupAll.found && result.groupFiltered.found, 'Group reservation must render in both all and group filters.', result);
  assert(result.groupAll.className === result.groupFiltered.className && result.groupAll.status === result.groupFiltered.status && result.groupAll.borderColor === result.groupFiltered.borderColor && result.groupAll.boxShadow === result.groupFiltered.boxShadow, 'Group reservation card state and color must remain identical across all and group filters.', result);
  assert(result.settlementCompleted.settlement.includes('정산 완료'), 'Reservation board must reflect a settlement completion record immediately.', result);
  assert(result.settlementReopened.settlement.includes('정산 필요'), 'Reservation board must reflect a newer settlement reopen record immediately.', result);
  assert(!result.legendText.includes('예약 예정') && !result.legendText.includes('단체 배정'), 'Today reservation board legend must not expose reserved or group-block colors.', result);
  return result;
}

async function maintenanceRoomBookingGuardRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?test=maintenance-booking-guard`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => typeof renderReservationBoard === 'function' && typeof openBoardRoomBooking === 'function', null, { timeout: 15000 });

  const result = await page.evaluate(async () => {
    const testRoom = (window.rooms || []).find(item => String(item.roomNo || item.number || item.id || '').includes('1215'))
      || { id: 'FT-1215', roomNo: '1215', number: '1215', type: 'Deluxe' };
    testRoom.status = 'out-of-service';
    testRoom.frontStatus = 'out-of-service';
    testRoom.housekeepingStatus = 'maintenance';
    testRoom.maintenanceStatus = 'maintenance';
    if (!(window.rooms || []).includes(testRoom)) window.rooms.push(testRoom);
    for (let index = window.reservations.length - 1; index >= 0; index -= 1) {
      const item = window.reservations[index];
      if (String(item.roomNo || item.room || item.roomId || '').replace(/\D/g, '') === '1215') {
        window.reservations.splice(index, 1);
      }
    }
    boardFilter = 'all';

    let alertMessage = '';
    const previousAlert = window.showAlert;
    window.showAlert = message => { alertMessage = String(message || ''); };
    renderReservationBoard();
    const card = Array.from(document.querySelectorAll('.reservation-board-box')).find(el => (el.innerText || '').includes('1215'));
    const clickHandler = card?.getAttribute('onclick') || '';
    card?.click();
    window.showAlert = previousAlert;

    return {
      cardFound: Boolean(card),
      clickHandler,
      alertMessage,
      modalVisible: Boolean(document.querySelector('#unifiedReservationModal.show, #unifiedReservationModal[style*="display: block"]'))
    };
  });

  assert(result.cardFound, 'Maintenance room card must be rendered.', result);
  assert(result.clickHandler.includes('openBoardRoomBooking'), 'Maintenance room card must route clicks through the booking guard.', result);
  assert(/점검|수리|inspection|maintenance/i.test(result.alertMessage), 'Maintenance room click must explain why booking is blocked.', result);
  assert(!result.modalVisible, 'Maintenance room click must not open the reservation form.', result);
  return result;
}

async function overlappingReservationGuardRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?test=overlap-booking-guard`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => typeof openUnifiedResModal === 'function' && typeof saveUnifiedRes === 'function', null, { timeout: 15000 });

  const result = await page.evaluate(async () => {
    const target = (window.reservations || []).find(item => String(item.roomNo || item.room || item.roomId || '').replace(/\D/g, '') === '1210');
    if (!target) return { missingFixture: true };
    const checkin = target.checkInDate || target.checkin || window.__qaIsoDate(0);
    const checkout = target.checkOutDate || target.checkout || window.__qaIsoDate(1);
    const beforeCount = window.reservations.length;
    let alertMessage = '';
    const previousAlert = window.showAlert;
    window.showAlert = message => { alertMessage = String(message || ''); };

    await window.openUnifiedResModal({
      roomNo: '1210', room: '1210', checkInDate: checkin, checkOutDate: checkout,
      guestId: 'G-OVERLAP-REGRESSION', guestName: 'Overlap Regression Guest', guest: 'Overlap Regression Guest',
      amount: 140
    });
    const roomSelect = document.getElementById('unifiedRoom');
    const option = Array.from(roomSelect?.options || []).find(item => String(item.value || '').replace(/\D/g, '') === '1210');
    if (option) roomSelect.value = option.value;
    await window.saveUnifiedRes();
    window.showAlert = previousAlert;

    return {
      missingFixture: false,
      optionDisabled: option?.disabled,
      optionText: option?.textContent || '',
      alertMessage,
      beforeCount,
      afterCount: window.reservations.length,
      modalOpen: document.getElementById('unifiedResModal')?.classList.contains('active') || false
    };
  });

  assert(!result.missingFixture, 'Overlap fixture for room 1210 must exist.', result);
  assert(result.optionDisabled === false, 'A conflicting room must be selectable so the user can receive conflict details.', result);
  assert(/1210|booked|예약/i.test(result.optionText), 'Conflicting room option must be visibly identified.', result);
  assert(/RSV-|Overlap|Anh Nguyen|2026-|예약|booked/i.test(result.alertMessage), 'Overlap warning must include conflict details.', result);
  assert(result.afterCount === result.beforeCount, 'Overlap attempt must not create a reservation.', result);
  assert(result.modalOpen, 'Overlap warning must keep the reservation form open.', result);
  return result;
}

async function reservationStayValidationRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?test=stay-validation`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => typeof openUnifiedResModal === 'function' && typeof saveUnifiedRes === 'function', null, { timeout: 15000 });

  const result = await page.evaluate(async () => {
    const today = window.__qaIsoDate(0);
    const yesterday = window.__qaIsoDate(-1);
    const tomorrow = window.__qaIsoDate(1);
    const beforeCount = (window.reservations || []).length;
    const alerts = [];
    const previousAlert = window.showAlert;
    if (window.PmsAPI) window.PmsAPI.getAllRoomTypes = async () => [{ id: 'RT-DELUXE', name: 'Deluxe', baseRate: 140 }];
    window.showAlert = message => { alerts.push(String(message || '')); };
    await window.openUnifiedResModal({
      roomNo: '1402', room: '1402', checkInDate: today, checkOutDate: tomorrow,
      guestId: 'G-STAY-VALIDATION', guestName: 'Stay Validation Guest', guest: 'Stay Validation Guest', amount: 140
    });

    const setValue = (id, value) => {
      const input = document.getElementById(id);
      if (input) input.value = value;
    };
    const branch = async ({ cin, cout, checkInTime, checkOutTime, lateCheckout, lateCheckoutTime, errorId }) => {
      setValue('unifiedCin', cin);
      setValue('unifiedCout', cout);
      setValue('unifiedCheckInTime', checkInTime);
      setValue('unifiedCheckOutTime', checkOutTime);
      const lateToggle = document.getElementById('unifiedLateCheckout');
      if (lateToggle) lateToggle.checked = lateCheckout;
      if (lateCheckout) setValue('unifiedLateCheckoutTime', lateCheckoutTime);
      await window.saveUnifiedRes();
      const input = document.getElementById(errorId);
      const error = document.getElementById(`${errorId}Error`);
      return {
        value: input?.value || '',
        invalid: input?.getAttribute('aria-invalid') === 'true',
        error: error?.textContent || '',
        count: (window.reservations || []).length
      };
    };

    const checkoutBeforeCheckin = await branch({
      cin: today, cout: yesterday, checkInTime: '14:00', checkOutTime: '12:00',
      lateCheckout: false, lateCheckoutTime: '', errorId: 'unifiedCout'
    });
    const sameDayTimeReversal = await branch({
      cin: today, cout: today, checkInTime: '14:00', checkOutTime: '12:00',
      lateCheckout: false, lateCheckoutTime: '', errorId: 'unifiedCheckOutTime'
    });
    const lateCheckoutReversal = await branch({
      cin: today, cout: tomorrow, checkInTime: '14:00', checkOutTime: '12:00',
      lateCheckout: true, lateCheckoutTime: '11:00', errorId: 'unifiedLateCheckoutTime'
    });
    window.showAlert = previousAlert;
    return { beforeCount, alerts, yesterday, checkoutBeforeCheckin, sameDayTimeReversal, lateCheckoutReversal };
  });

  assert(result.checkoutBeforeCheckin.value === result.yesterday, 'Invalid checkout date must not be silently rewritten.', result);
  assert(result.checkoutBeforeCheckin.invalid && result.checkoutBeforeCheckin.error, 'Checkout-before-checkin must show an adjacent checkout-date error.', result);
  assert(result.sameDayTimeReversal.invalid && result.sameDayTimeReversal.error, 'Same-day reversed times must show an adjacent checkout-time error.', result);
  assert(result.lateCheckoutReversal.invalid && result.lateCheckoutReversal.error, 'Reversed late checkout must show an adjacent late-time error.', result);
  assert([
    result.checkoutBeforeCheckin.count,
    result.sameDayTimeReversal.count,
    result.lateCheckoutReversal.count
  ].every(count => count === result.beforeCount), 'Invalid stay schedules must not create a reservation.', result);
  return result;
}

async function reservationEditPersistenceRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?test=edit-persistence`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => typeof openUnifiedResModal === 'function' && typeof saveUnifiedRes === 'function', null, { timeout: 15000 });

  const result = await page.evaluate(async () => {
    const today = window.__qaIsoDate(0);
    if (window.PmsAPI) window.PmsAPI.getAllRoomTypes = async () => [
      { id: 'RT-STANDARD', name: 'Standard', baseRate: 140 },
      { id: 'RT-DELUXE', name: 'Deluxe', baseRate: 140 },
      { id: 'RT-PREMIER', name: 'Premier', baseRate: 300 },
      { id: 'RT-PENTHOUSE', name: 'Penthouse', baseRate: 650 }
    ];
    const target = (window.reservations || []).find(item => {
      const status = String(item.status || '').toLowerCase().replace(/[^a-z]/g, '');
      const checkin = String(item.checkInDate || item.checkin || '');
      return ['confirmed', 'reserved'].includes(status) && checkin >= today && item.room;
    });
    if (!target) return { missingFixture: true };
    const id = target.id || target.reservationId;
    await window.openUnifiedResModal(id);
    const note = document.getElementById('unifiedReservationNote');
    const nightly = document.getElementById('unifiedNightlyRate');
    if (note) note.value = 'P1 late arrival';
    if (nightly) {
      nightly.value = '560';
      nightly.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await window.saveUnifiedRes();
    const saved = (window.reservations || []).find(item => (item.id || item.reservationId) === id);
    await window.openUnifiedResModal(id);
    const reopenedNote = document.getElementById('unifiedReservationNote');
    return {
      missingFixture: false,
      id,
      noteVisible: Boolean(note && getComputedStyle(note).display !== 'none'),
      savedNote: saved?.specialNotes || saved?.notes || saved?.note || '',
      reopenedNote: reopenedNote?.value || '',
      savedRate: Number(saved?.rate?.amount || 0)
    };
  });

  assert(!result.missingFixture, 'Editable reservation fixture must exist.', result);
  assert(result.noteVisible, 'Reservation note field must be visible in the edit form.', result);
  assert(result.savedNote === 'P1 late arrival', 'Reservation note must persist on save.', result);
  assert(result.reopenedNote === 'P1 late arrival', 'Reservation note must reload in the detail modal.', result);
  assert(result.savedRate === 560, 'Edited nightly rate must persist.', result);
  return result;
}

async function reservationTimelineShadowRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-timeline.html?test=timeline-shadow`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => window.PmsMockApi && typeof buildTimeline === 'function', null, { timeout: 15000 });

  const backup = await page.evaluate(async () => {
    const today = window.__qaIsoDate(0);
    const yesterday = window.__qaIsoDate(-1);
    const tomorrow = window.__qaIsoDate(1);
    const overlayKey = 'mockapi:v1:TENANT-GRAND-SAIGON:reservations';
    const storedKey = 'pms_reservations';
    const previousOverlay = localStorage.getItem(overlayKey);
    const previousStored = localStorage.getItem(storedKey);
    const env = await window.PmsMockApi.request('GET', '/reservations');
    const items = window.PmsMockApi.items(env).filter(item => String(item.roomNo || item.room || '').trim() !== '1212' && !String(item.roomId || '').endsWith('1212'));
    items.unshift(
      {
        id: 'RSV-TL-NEW-1212', reservationId: 'RSV-TL-NEW-1212', roomId: 'FT-1212', roomNo: '1212',
        guestName: 'Timeline New Guest', guest: 'Timeline New Guest', status: 'confirmed',
        checkInDate: today, checkOutDate: tomorrow, checkInTime: '14:00', checkOutTime: '12:00'
      },
      {
        id: 'RSV-TL-STALE-1212', reservationId: 'RSV-TL-STALE-1212', roomId: 'FT-1212', roomNo: '1212',
        guestName: 'Timeline Shadow Guest', guest: 'Timeline Shadow Guest', status: 'checked-in',
        checkInDate: today, checkOutDate: tomorrow, checkInTime: '14:00', checkOutTime: '12:00'
      },
      {
        id: 'RSV-TL-COMPLETED-1212', reservationId: 'RSV-TL-COMPLETED-1212', roomId: 'FT-1212', roomNo: '1212',
        guestName: 'Timeline Shadow Guest', guest: 'Timeline Shadow Guest', status: 'completed',
        checkInDate: yesterday, checkOutDate: today, checkInTime: '14:00', checkOutTime: '12:00'
      }
    );
    const overlay = { items, page: { page: 1, pageSize: Math.max(items.length, 50), total: items.length, totalPages: 1 } };
    localStorage.setItem(overlayKey, JSON.stringify(overlay));
    localStorage.setItem(storedKey, JSON.stringify(items));
    return { overlayKey, storedKey, previousOverlay, previousStored };
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => document.body.innerText.includes('Timeline New Guest'), null, { timeout: 15000 });
  const result = await page.evaluate(() => ({
    hasNewGuest: document.body.innerText.includes('Timeline New Guest'),
    shadowGuestOccurrences: (document.body.innerText.match(/Timeline Shadow Guest/g) || []).length,
    roomText: Array.from(document.querySelectorAll('.tl-row')).find(row => row.innerText.includes('1212'))?.innerText || ''
  }));

  if (backup.previousOverlay === null) await page.evaluate(key => localStorage.removeItem(key), backup.overlayKey);
  else await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: backup.overlayKey, value: backup.previousOverlay });
  if (backup.previousStored === null) await page.evaluate(key => localStorage.removeItem(key), backup.storedKey);
  else await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: backup.storedKey, value: backup.previousStored });

  assert(result.hasNewGuest, 'Timeline must render a newly saved reservation for the selected room.', result);
  assert(result.shadowGuestOccurrences === 1, 'Timeline must keep the completed stay but hide its stale same-guest handoff duplicate.', result);
  return result;
}

async function reservationBoardDynamicEnglishRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?test=board-dynamic-english`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => typeof renderReservationBoard === 'function' && document.querySelector('#reservationBoardContainer'), null, { timeout: 15000 });

  const result = await page.evaluate(async () => {
    const today = window.__qaIsoDate(0);
    const yesterday = window.__qaIsoDate(-1);
    const tomorrow = window.__qaIsoDate(1);
    localStorage.setItem('pms_lang', 'en');
    currentLang = 'en';
    window.currentLang = 'en';
    boardFilter = 'all';
    boardPeriod = 'today';
    groups = [{ id: 'P1-GROUP-I18N', name: 'P1 Test Group' }];
    rooms = [
      { id: 'T-EN-1', roomNo: 'T-EN-1', fullRoom: 'T-EN-1', type: 'Standard', building: 'Test Tower', floor: 1, status: 'occupied', frontStatus: 'in-house', housekeepingStatus: 'dirty' },
      { id: 'T-EN-2', roomNo: 'T-EN-2', fullRoom: 'T-EN-2', type: 'Standard', building: 'Test Tower', floor: 1, status: 'occupied', frontStatus: 'in-house', housekeepingStatus: 'dirty' }
    ];
    reservations = [
      {
        id: 'RSV-P1-DYNAMIC-EN-1', room: 'T-EN-1', roomNo: 'T-EN-1', fullRoom: 'T-EN-1', type: 'Standard', status: 'checkedin',
        guest: 'Dynamic English Guest', guestName: 'Dynamic English Guest', checkInDate: yesterday, checkOutDate: tomorrow,
        checkin: yesterday, checkout: tomorrow, cin: window.__qaMonthDay(-1), cout: window.__qaMonthDay(1), amount: 100, balanceDue: 25,
        lateCheckout: true, lateCheckoutTime: '14:00', roomChangeHistory: [{ fromRoom: 'T-EN-0', toRoom: 'T-EN-1', changedAt: `${today}T09:00:00+09:00` }]
      },
      {
        id: 'RSV-P1-DYNAMIC-EN-2', room: 'T-EN-2', roomNo: 'T-EN-2', fullRoom: 'T-EN-2', type: 'Standard', status: 'checkedin',
        guest: 'Group English Guest', guestName: 'Group English Guest', groupId: 'P1-GROUP-I18N', groupName: 'P1 Test Group', isB2B: true,
        checkInDate: yesterday, checkOutDate: tomorrow, checkin: yesterday, checkout: tomorrow, cin: window.__qaMonthDay(-1), cout: window.__qaMonthDay(1), amount: 100
      }
    ];
    const container = document.querySelector('#reservationBoardContainer');
    container.dataset.renderSignature = '';
    renderReservationBoard();
    const boardSearchPlaceholder = document.getElementById('boardSearch')?.getAttribute('placeholder') || '';
    await openUnifiedResModal();
    const modal = document.getElementById('unifiedResModal');
    const timeFields = ['unifiedCheckInTime', 'unifiedCheckOutTime', 'unifiedLateCheckoutTime'].map(id => {
      const input = document.getElementById(id);
      return { id, type: input?.type || '', value: input?.value || '', lang: input?.lang || '', placeholder: input?.placeholder || '' };
    });
    modal?.remove();
    return {
      text: container.innerText,
      legendAria: document.querySelector('.board-status-legend')?.getAttribute('aria-label') || '',
      boardSearchPlaceholder,
      timeFields
    };
  });

  const required = ['Check-in 14:00', 'Check-out 12:00', 'Late 14:00', 'Balance Due', 'Moved T-EN-0 → T-EN-1', 'Group', 'P1 Test Group'];
  required.forEach(label => assert(result.text.includes(label), `Dynamic English board must render ${label}.`, result));
  assert(result.legendAria === 'Room status color guide', 'Dynamic English legend aria-label must be translated.', result);
  assert(result.boardSearchPlaceholder === 'Search room, name, or group...', 'English reservation board search placeholder must not contain Korean text.', result);
  assert(result.timeFields.every(field => field.type === 'text' && field.lang === 'en' && /^\d{2}:\d{2}$/.test(field.value) && field.placeholder === 'HH:MM'), 'English reservation time controls must use locale-neutral 24-hour text values.', result);
  assert(!/[가-힣]/.test(result.text), 'Dynamic English board must not render Korean labels after rerender.', result);
  return result;
}

async function boardRoomDateChangePreservationRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?test=board-room-date-preservation`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => typeof openUnifiedResModal === 'function' && typeof updateUnifiedStayAndRooms === 'function', null, { timeout: 15000 });

  const result = await page.evaluate(async () => {
    const firstRoom = { id: 'T-PRESERVE-1', roomNo: 'T-PRESERVE-1', fullRoom: 'T-PRESERVE-1', type: 'Standard', building: 'Test Tower', status: 'vacant', frontStatus: 'vacant', housekeepingStatus: 'clean' };
    const secondRoom = { id: 'T-PRESERVE-2', roomNo: 'T-PRESERVE-2', fullRoom: 'T-PRESERVE-2', type: 'Standard', building: 'Test Tower', status: 'vacant', frontStatus: 'vacant', housekeepingStatus: 'clean' };
    window.rooms = [secondRoom, firstRoom];
    window.reservations = [];
    rooms = window.rooms;
    reservations = window.reservations;
    const dispatchDate = (id, value) => {
      const input = document.getElementById(id);
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };

    await openUnifiedResModal({
      room: firstRoom.id,
      roomNo: firstRoom.roomNo,
      checkInDate: window.__qaIsoDate(0),
      checkOutDate: window.__qaIsoDate(1),
      preserveRoomOnDateChange: true
    });
    const roomSelect = document.getElementById('unifiedRoom');
    const boardInitial = roomSelect.value;
    dispatchDate('unifiedCin', window.__qaIsoDate(2));
    const boardDuringInvalidRange = roomSelect.value;
    dispatchDate('unifiedCout', window.__qaIsoDate(3));
    const boardAfterValidRange = roomSelect.value;

    await openUnifiedResModal({
      room: firstRoom.id,
      roomNo: firstRoom.roomNo,
      checkInDate: window.__qaIsoDate(0),
      checkOutDate: window.__qaIsoDate(1)
    });
    const standardSelect = document.getElementById('unifiedRoom');
    dispatchDate('unifiedCin', window.__qaIsoDate(2));
    dispatchDate('unifiedCout', window.__qaIsoDate(3));
    const standardAfterValidRange = standardSelect.value;

    return { boardInitial, boardDuringInvalidRange, boardAfterValidRange, standardAfterValidRange };
  });

  assert(result.boardInitial === 'T-PRESERVE-1', 'Board card booking must initially select the clicked room.', result);
  assert(result.boardDuringInvalidRange === 'T-PRESERVE-1', 'Board card booking must retain its room while the date range is temporarily invalid.', result);
  assert(result.boardAfterValidRange === 'T-PRESERVE-1', 'Board card booking must retain its room after both dates are changed.', result);
  assert(result.standardAfterValidRange === 'T-PRESERVE-2', 'Standard new booking must continue recalculating the first available room.', result);
  return result;
}

async function reservationWindowQueryRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?test=reservation-window-query`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => window.PmsAPI?.getOperationalReservations && window.PmsAPI?.getTimelineReservations, null, { timeout: 15000 });

  const result = await page.evaluate(async () => {
    const storageKey = 'pms_reservations';
    const previous = localStorage.getItem(storageKey);
    const fixture = [
      { id: 'QA-WINDOW-TODAY', room: 'QA-1', status: 'confirmed', checkInDate: window.__qaIsoDate(0), checkOutDate: window.__qaIsoDate(1) },
      { id: 'QA-WINDOW-WEEK', room: 'QA-2', status: 'confirmed', checkInDate: window.__qaIsoDate(10), checkOutDate: window.__qaIsoDate(11) },
      { id: 'QA-WINDOW-OUTSIDE', room: 'QA-3', status: 'confirmed', checkInDate: window.__qaIsoDate(30), checkOutDate: window.__qaIsoDate(31) }
    ];
    localStorage.setItem(storageKey, JSON.stringify(fixture));
    try {
      const operational = await window.PmsAPI.getOperationalReservations({ date: window.__qaIsoDate(0), pageSize: 500 });
      const timeline = await window.PmsAPI.getTimelineReservations({ from: window.__qaIsoDate(0), to: window.__qaIsoDate(13), pageSize: 1000 });
      return {
        operationalIds: operational.map(item => item.id),
        timelineIds: timeline.map(item => item.id)
      };
    } finally {
      if (previous === null) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, previous);
    }
  });

  assert(result.operationalIds.includes('QA-WINDOW-TODAY'), 'Operational board query must include a stay overlapping the selected day.', result);
  assert(!result.operationalIds.includes('QA-WINDOW-WEEK') && !result.operationalIds.includes('QA-WINDOW-OUTSIDE'), 'Operational board query must exclude reservations outside the selected day.', result);
  assert(result.timelineIds.includes('QA-WINDOW-TODAY') && result.timelineIds.includes('QA-WINDOW-WEEK'), 'Timeline query must include reservations overlapping its visible range.', result);
  assert(!result.timelineIds.includes('QA-WINDOW-OUTSIDE'), 'Timeline query must exclude reservations outside its visible range.', result);
  return result;
}

async function successfulFlowClosesModalRegression(page, base) {
  await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?test=successful-flow-closes-modal`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => typeof openUnifiedResModal === 'function' && typeof processUnifiedReservationFlow === 'function', null, { timeout: 15000 });

  const result = await page.evaluate(async () => {
    const room = { id: 'T-FLOW-CLOSE', roomId: 'T-FLOW-CLOSE', roomNo: 'T-FLOW-CLOSE', fullRoom: 'T-FLOW-CLOSE', type: 'Standard', status: 'vacant-clean', frontStatus: 'vacant', housekeepingStatus: 'clean' };
    const reservation = {
      id: 'RSV-FLOW-CLOSE', reservationId: 'RSV-FLOW-CLOSE', room: room.id, roomId: room.id, roomNo: room.roomNo, fullRoom: room.id,
      guest: 'Flow Close Guest', guestName: 'Flow Close Guest', status: 'confirmed',
      checkInDate: window.__qaIsoDate(0), checkOutDate: window.__qaIsoDate(1), checkin: window.__qaIsoDate(0), checkout: window.__qaIsoDate(1),
      checkInTime: '14:00', checkOutTime: '12:00', amount: 140, balanceDue: 0
    };
    window.rooms = [room];
    window.reservations = [reservation];
    rooms = window.rooms;
    reservations = window.reservations;
    const originalConfirm = window.showConfirm;
    window.showConfirm = async () => true;
    try {
      await window.openUnifiedResModal(reservation.id);
      await window.processUnifiedReservationFlow('checkin');
    } finally {
      window.showConfirm = originalConfirm;
    }
    const modal = document.getElementById('unifiedResModal');
    return {
      status: reservation.status,
      modalActive: modal?.classList.contains('active') || false,
      modalDisplay: modal?.style.display || ''
    };
  });

  assert(result.status === 'checkedin', 'Successful check-in must update the reservation status.', result);
  assert(!result.modalActive && result.modalDisplay === 'none', 'Successful check-in must close the reservation modal.', result);
  return result;
}

async function dateBoundaryRegression(browser, base) {
  const scenarios = [
    '2026-07-21',
    '2026-07-31',
    '2026-12-31',
    '2028-02-29'
  ];
  const results = [];

  for (const frozenIso of scenarios) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(({ iso }) => {
      const NativeDate = Date;
      const fixedNow = new NativeDate(`${iso}T12:00:00+09:00`).getTime();
      class FixedDate extends NativeDate {
        constructor(...args) {
          super(...(args.length ? args : [fixedNow]));
        }
        static now() { return fixedNow; }
      }
      FixedDate.parse = NativeDate.parse;
      FixedDate.UTC = NativeDate.UTC;
      window.Date = FixedDate;
      sessionStorage.setItem('pms_logged_in', 'true');
      sessionStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('pms_lang', 'ko');
    }, { iso: frozenIso });
    const page = await context.newPage();
    try {
      await page.goto(`${base}/dashboard/frontdesk/reservation-board.html?date-boundary=${frozenIso}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.PmsDate && Array.isArray(window.reservations) && window.reservations.length > 0, null, { timeout: 15000 });
      const board = await page.evaluate(async expected => {
        const iso = value => boardDateKey(value);
        const range = boardRange();
        await openUnifiedResModal();
        const modalDates = {
          checkin: document.getElementById('unifiedCin')?.value || '',
          checkout: document.getElementById('unifiedCout')?.value || ''
        };
        closeUnifiedResModal();
        const queried = await window.PmsAPI.getOperationalReservations({ date: expected, page: 1, pageSize: 1000 });
        const parse = (value, anchor, minimum = null) => {
          const text = String(value || '').trim();
          const md = text.match(/^(\d{1,2})\/(\d{1,2})$/);
          if (!md) return new Date(`${text.slice(0, 10)}T00:00:00`);
          const candidates = [-1, 0, 1].map(offset => new Date(anchor.getFullYear() + offset, Number(md[1]) - 1, Number(md[2])));
          const eligible = minimum ? candidates.filter(date => date >= minimum) : candidates;
          return (eligible.length ? eligible : candidates).sort((left, right) => Math.abs(left - anchor) - Math.abs(right - anchor))[0];
        };
        const overlaps = item => {
          const anchor = new Date(`${expected}T00:00:00`);
          const start = parse(item.checkInDate || item.checkin || item.cin, anchor);
          const end = parse(item.checkOutDate || item.checkout || item.cout, start || anchor, start);
          return start <= anchor && end >= anchor;
        };
        return {
          today: window.PmsDate.todayIso(),
          range: { start: iso(range.start), end: iso(range.end), mode: range.mode },
          modalDates,
          queriedCount: queried.length,
          outsideIds: queried.filter(item => !overlaps(item)).map(item => item.id)
        };
      }, frozenIso);

      await page.goto(`${base}/dashboard/frontdesk/reservation-timeline.html?date-boundary=${frozenIso}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.PmsDate && Array.isArray(window.reservations) && window.reservations.length > 0 && document.querySelector('.tl-grid'), null, { timeout: 15000 });
      const timeline = await page.evaluate(async expected => {
        const initial = timelineWindowQuery();
        await shiftWeek(1);
        const shifted = timelineWindowQuery();
        await goToday();
        const reset = timelineWindowQuery();
        const parse = (value, anchor, minimum = null) => {
          const text = String(value || '').trim();
          const md = text.match(/^(\d{1,2})\/(\d{1,2})$/);
          if (!md) return new Date(`${text.slice(0, 10)}T00:00:00`);
          const candidates = [-1, 0, 1].map(offset => new Date(anchor.getFullYear() + offset, Number(md[1]) - 1, Number(md[2])));
          const eligible = minimum ? candidates.filter(date => date >= minimum) : candidates;
          return (eligible.length ? eligible : candidates).sort((left, right) => Math.abs(left - anchor) - Math.abs(right - anchor))[0];
        };
        const overlaps = (item, windowRange) => {
          const windowStart = new Date(`${windowRange.from}T00:00:00`);
          const windowEnd = new Date(`${windowRange.to}T00:00:00`);
          const start = parse(item.checkInDate || item.checkin || item.cin, windowStart);
          const end = parse(item.checkOutDate || item.checkout || item.cout, start || windowEnd, start);
          return start <= windowEnd && end >= windowStart;
        };
        return {
          today: window.PmsDate.todayIso(),
          initial,
          shifted,
          reset,
          outsideIds: (window.reservations || []).filter(item => !overlaps(item, reset)).map(item => ({
            id: item.id,
            checkInDate: item.checkInDate,
            checkOutDate: item.checkOutDate,
            checkin: item.checkin,
            checkout: item.checkout,
            cin: item.cin,
            cout: item.cout
          })),
          expected
        };
      }, frozenIso);

      const nextDate = new Date(`${frozenIso}T00:00:00`);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextIso = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
      const plusSeven = new Date(`${frozenIso}T00:00:00`);
      plusSeven.setDate(plusSeven.getDate() + 7);
      const plusSevenIso = `${plusSeven.getFullYear()}-${String(plusSeven.getMonth() + 1).padStart(2, '0')}-${String(plusSeven.getDate()).padStart(2, '0')}`;

      assert(board.today === frozenIso, 'Board did not use the frozen business date.', { frozenIso, board });
      assert(board.range.start === frozenIso && board.range.end === frozenIso, 'Board default range did not stay on the business date.', { frozenIso, board });
      assert(board.modalDates.checkin === frozenIso && board.modalDates.checkout === nextIso, 'New reservation defaults did not cross the date boundary correctly.', { frozenIso, board, nextIso });
      assert(board.outsideIds.length === 0, 'Operational reservation query returned records outside its date.', { frozenIso, board });
      assert(timeline.today === frozenIso && timeline.initial.from === frozenIso, 'Timeline did not start on the business date.', { frozenIso, timeline });
      assert(timeline.shifted.from === plusSevenIso, 'Timeline week navigation did not cross the date boundary correctly.', { frozenIso, timeline, plusSevenIso });
      assert(timeline.reset.from === frozenIso, 'Timeline Today did not reset to the business date.', { frozenIso, timeline });
      assert(timeline.outsideIds.length === 0, 'Timeline query returned records outside the visible range.', { frozenIso, timeline });
      results.push({ frozenIso, nextIso, plusSevenIso, board, timeline });
    } finally {
      await context.close();
    }
  }

  return results;
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
    if (/ERR_NETWORK_ACCESS_DENIED|Failed to load resource|Rate calendar lookup failed|Mock room types fallback|favicon|googleapis|gstatic|cdnjs|cdn\.jsdelivr/i.test(text)) return;
    consoleIssues.push(`${msg.type()}: ${text}`);
  });
  page.on('pageerror', err => consoleIssues.push(`pageerror: ${err.message}`));

  try {
    await page.addInitScript(() => {
      sessionStorage.setItem('pms_logged_in', 'true');
      sessionStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('pms_lang', 'ko');
      window.__qaIsoDate = (offset = 0) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + Number(offset || 0));
        const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return shifted.toISOString().slice(0, 10);
      };
      window.__qaMonthDay = (offset = 0) => {
        const [year, month, day] = window.__qaIsoDate(offset).split('-').map(Number);
        return `${month}/${day}`;
      };
    });

    const dashboardCountResult = await dashboardCheckinCountRegression(page, base);
    const boardCleaningVisibilityResult = await reservationBoardCleaningVisibilityRegression(page, base);
    const boardDynamicEnglishResult = await reservationBoardDynamicEnglishRegression(page, base);
    const boardRoomDatePreservationResult = await boardRoomDateChangePreservationRegression(page, base);
    const reservationWindowQueryResult = await reservationWindowQueryRegression(page, base);
    const todayCheckinRoomMasterResult = await todayCheckinRoomMasterRegression(page, base);
    const dateBoundaryResult = await dateBoundaryRegression(browser, base);
    console.log('[reservation-regression] date boundaries passed');
    const boardFilterColorResult = await reservationBoardFilterColorRegression(page, base);
    console.log('[reservation-regression] board filter colors passed');
    const boardSettlementAndGroupInvariantResult = await reservationBoardSettlementAndGroupInvariantRegression(page, base);
    console.log('[reservation-regression] board settlement and group filter invariants passed');
    const maintenanceBookingGuardResult = await maintenanceRoomBookingGuardRegression(page, base);
    console.log('[reservation-regression] maintenance booking guard passed');
    const overlappingReservationGuardResult = await overlappingReservationGuardRegression(page, base);
    console.log('[reservation-regression] overlapping reservation guard passed');
    const stayValidationResult = await reservationStayValidationRegression(page, base);
    console.log('[reservation-regression] stay validation passed');
    const editPersistenceResult = await reservationEditPersistenceRegression(page, base);
    console.log('[reservation-regression] edit persistence passed');
    const timelineShadowResult = await reservationTimelineShadowRegression(page, base);
    console.log('[reservation-regression] timeline shadow passed');
    const successfulFlowClosesModalResult = await successfulFlowClosesModalRegression(page, base);
    console.log('[reservation-regression] modal close passed');

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
    assert(koList.mobileBadges.length === 0, 'Retired mobile reservation cards must not render.', koList.mobileBadges);
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

    const duplicateRosterState = await page.evaluate(async () => {
      const today = window.__qaIsoDate(0);
      const afterTomorrow = window.__qaIsoDate(2);
      window.rooms = [{ id: 'T-902', number: '902', fullRoom: 'T-902', type: 'Standard', building: 'Test Tower', status: 'occupied', housekeepingStatus: 'clean', frontStatus: 'occupied' }];
      window.reservations = [{
        id: 'RSV-DUPLICATE-ROSTER',
        room: 'T-902',
        fullRoom: 'T-902',
        type: 'Standard',
        status: 'checkedin',
        guest: 'P1 Companion',
        guestName: 'P1 Companion',
        roomingGuestName: 'P1 Companion',
        guestId: 'G-P1-COMPANION',
        roomingGuestId: 'G-P1-COMPANION',
        companionGuestNames: ['Grace Miller'],
        companionGuestIds: ['G-GRACE-MILLER'],
        roomingGuestNames: ['P1 Companion', 'Grace Miller'],
        roomingGuests: [
          { guestId: 'G-P1-COMPANION', id: 'G-P1-COMPANION', name: 'P1 Companion', role: 'primary' },
          { guestId: 'G-GRACE-MILLER', id: 'G-GRACE-MILLER', name: 'Grace Miller', role: 'companion' }
        ],
        companions: [{ name: 'Grace Miller', role: 'companion' }],
        cin: window.__qaMonthDay(0),
        cout: window.__qaMonthDay(2),
        checkin: today,
        checkout: afterTomorrow,
        checkInDate: today,
        checkOutDate: afterTomorrow,
        nights: 2,
        len: 2
      }];
      reservations = window.reservations;
      await openUnifiedResModal('RSV-DUPLICATE-ROSTER');
      const rosterText = document.getElementById('unifiedStayGuestList')?.innerText || '';
      return {
        rosterText,
        graceOccurrences: (rosterText.match(/Grace Miller/g) || []).length,
        countText: document.getElementById('unifiedStayGuestCount')?.innerText || ''
      };
    });

    assert(duplicateRosterState.graceOccurrences === 1, 'Reservation guest roster must merge the same companion when one compatibility field omits the guest ID.', duplicateRosterState);
    assert(duplicateRosterState.countText.includes('2'), 'Reservation guest roster count must exclude compatibility-field duplicates.', duplicateRosterState);

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

    const cancellationReasonResult = await page.evaluate(async () => {
      const today = window.PmsDate?.todayIso ? window.PmsDate.todayIso() : new Date().toISOString().slice(0, 10);
      const tomorrowDate = new Date(`${today}T00:00:00`);
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrow = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;
      const reservation = {
        id: 'RSV-CANCEL-REASON-TEST',
        room: 'T-902',
        fullRoom: 'T-902',
        roomNo: 'T-902',
        type: 'Standard',
        status: 'confirmed',
        guest: 'Cancellation Reason Guest',
        guestName: 'Cancellation Reason Guest',
        cin: today,
        cout: tomorrow,
        checkin: today,
        checkout: tomorrow,
        checkInDate: today,
        checkOutDate: tomorrow,
        nights: 1,
        len: 1
      };
      window.reservations = [reservation];
      reservations = window.reservations;
      window.rooms = [{ roomNo: 'T-902', status: 'available', frontStatus: 'vacant', housekeepingStatus: 'clean' }];
      const promptCalls = [];
      window.showConfirm = async () => true;
      window.showPrompt = async (message, options) => {
        promptCalls.push({ message, options });
        return 'P1 process cancellation';
      };
      await cancelResAction(reservation.id);
      const auditLogs = window.PmsPrivacyAudit?.list?.() || [];
      const audit = [...auditLogs].reverse().find(item => item.action === 'reservation.cancel' && item.details?.reservationId === reservation.id);
      return { reservation, promptCalls, audit };
    });

    assert(cancellationReasonResult.promptCalls.length === 1, 'Cancellation must request a reason after confirmation.', cancellationReasonResult);
    assert(cancellationReasonResult.promptCalls[0]?.options?.required === true, 'Cancellation reason must be required.', cancellationReasonResult);
    assert(cancellationReasonResult.reservation.status === 'cancelled', 'Confirmed cancellation must change the reservation status.', cancellationReasonResult);
    assert(cancellationReasonResult.reservation.cancelReason === 'P1 process cancellation', 'Cancellation reason must persist on the reservation.', cancellationReasonResult);
    assert(cancellationReasonResult.audit?.details?.cancelReason === 'P1 process cancellation', 'Cancellation reason must be recorded in the audit log.', cancellationReasonResult);

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
        'reservation guest roster merges compatibility-field duplicates',
        'occupied rooms render checkout action instead of check-in',
        'reservation board keeps cleaning status visible beside check-in readiness',
        'reservation board dynamic rerender stays fully English',
        'today check-in is blocked when the room master is out of service',
        'reservation board keeps card status colors stable across filters and hover',
        'reservation board settlement and group filter state stays synchronized',
        'maintenance room cards explain the booking block without opening the form',
        'overlapping bookings show conflict details and do not save',
        'invalid dates and times stay visible, show adjacent errors, and do not save',
        'reservation cancellation requires and audits a reason',
        'reservation date, rate, and note edits persist after reopening',
        'reservation timeline prefers the saved booking over a stale same-guest handoff',
        'representative/companion buttons only show for active guest candidates',
        'group block timeline modal allows guest entry without forcing conversion',
        'dashboard today check-in KPI matches reservation board after rooms become in-house',
        'date-sensitive reservation flows cross day, month, year, and leap-day boundaries'
      ],
      dashboardCountResult,
      duplicateRosterState,
      boardCleaningVisibilityResult,
      boardDynamicEnglishResult,
      boardRoomDatePreservationResult,
      reservationWindowQueryResult,
      successfulFlowClosesModalResult,
      dateBoundaryResult,
      todayCheckinRoomMasterResult,
      boardFilterColorResult,
      boardSettlementAndGroupInvariantResult,
      maintenanceBookingGuardResult,
      overlappingReservationGuardResult,
      stayValidationResult,
      cancellationReasonResult,
      editPersistenceResult,
      timelineShadowResult
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({
      ok: false,
      error: error.message,
      stack: error.stack || null,
      url: page.url(),
      details: error.details || null,
      consoleIssues
    }, null, 2));
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (server) server.close();
  }
})();
