const path = require('path');
const {
  assert,
  launch,
  openPage,
  createResultCollector,
  cleanRuntimeErrors
} = require('./plan-test-harness.cjs');

const OUTPUT = process.env.PMS_RESULT_FILE || path.resolve(
  __dirname,
  '..',
  '..',
  'outputs',
  'full-plan-20260719',
  '102-functional-frontdesk.json'
);

async function withPage(browser, route, callback, options = {}) {
  const state = await openPage(browser, route, { language: 'ko', ...options });
  state.page.setDefaultTimeout(10000);
  try {
    return await callback(state);
  } finally {
    await state.context.close();
  }
}

async function waitForBoard(page) {
  await page.waitForFunction(() => Array.isArray(window.rooms) && window.rooms.length > 0 && Array.isArray(window.reservations));
  await page.waitForSelector('#reservationBoardContainer');
}

async function acceptDialog(page) {
  const modal = page.locator('#pms-confirm-modal.active');
  await modal.waitFor({ state: 'visible' });
  const message = (await page.locator('#pms-confirm-message').innerText()).trim();
  await page.locator('#pms-confirm-ok').click();
  await modal.waitFor({ state: 'hidden' });
  return message;
}

async function addExistingGuest(page) {
  await page.locator('#nrSearchGuestEdit').fill('Wong');
  await page.locator('#nrSearchBtnEdit').click();
  const result = page.locator('#guestSearchResultsEdit ._gs-result-row').first();
  await result.waitFor({ state: 'visible' });
  await result.click();
  const add = page.locator('#unifiedGuestCandidateActions button').filter({ hasText: /primary|대표/i }).first();
  await add.waitFor({ state: 'visible' });
  await add.click();
  await page.waitForFunction(() => Number((document.getElementById('unifiedStayGuestCount')?.textContent || '').match(/\d+/)?.[0] || 0) > 0);
}

async function seedBoard(page, options) {
  return page.evaluate(({ roomId, roomStatus = 'vacant-clean', housekeepingStatus = 'clean', reservation = null, targetRoomId = null }) => {
    const roomValues = value => [value?.id, value?.roomId, value?.fullRoom, value?.roomNo, value?.number]
      .filter(Boolean)
      .map(String);
    const room = window.rooms.find(item => roomValues(item).some(value => value === roomId || value.endsWith(roomId)));
    if (!room) throw new Error(`Room fixture ${roomId} was not found`);
    const assignedRoomId = String(room.id || room.roomId || room.fullRoom || room.roomNo || roomId);
    Object.assign(room, {
      status: roomStatus,
      frontStatus: roomStatus,
      housekeepingStatus,
      cleaningStatus: housekeepingStatus,
      maintenanceStatus: roomStatus === 'maintenance' ? 'maintenance' : '',
      isOutOfService: roomStatus === 'maintenance',
      outOfService: roomStatus === 'maintenance',
      guest: reservation?.guest || ''
    });
    if (targetRoomId) {
      const target = window.rooms.find(item => roomValues(item).some(value => value === targetRoomId || value.endsWith(targetRoomId)));
      if (!target) throw new Error(`Target room fixture ${targetRoomId} was not found`);
      Object.assign(target, {
        status: 'vacant-clean',
        frontStatus: 'vacant-clean',
        housekeepingStatus: 'clean',
        cleaningStatus: 'clean',
        maintenanceStatus: '',
        isOutOfService: false,
        outOfService: false,
        guest: ''
      });
    }
    window.reservations = window.reservations.filter(item => {
      const assigned = String(item.room || item.fullRoom || item.roomId || item.roomNo || '');
      return !assigned.endsWith(roomId) && !(targetRoomId && assigned.endsWith(targetRoomId));
    });
    if (reservation) {
      window.reservations.push({
        id: reservation.id,
        reservationId: reservation.id,
        guest: reservation.guest || 'QA Guest',
        guestName: reservation.guest || 'QA Guest',
        guestPhone: '+84 90 1234 5678',
        phone: '+84 90 1234 5678',
        room: assignedRoomId,
        fullRoom: assignedRoomId,
        roomId: assignedRoomId,
        roomNo: roomId,
        type: room.type || 'Deluxe',
        checkInDate: reservation.checkInDate,
        checkOutDate: reservation.checkOutDate,
        checkin: reservation.checkInDate,
        checkout: reservation.checkOutDate,
        cin: reservation.checkInDate,
        cout: reservation.checkOutDate,
        checkInTime: '14:00',
        checkOutTime: '12:00',
        amount: 280,
        totalAmount: { currency: 'PHP', amount: 280 },
        status: reservation.status,
        channel: 'Walk-in',
        roomingGuests: [{ id: `${reservation.id}-P`, name: reservation.guest || 'QA Guest', phone: '+84 90 1234 5678', role: 'primary', isPrimary: true }],
        roomMoveHistory: []
      });
    }
    try { reservations = window.reservations; rooms = window.rooms; } catch (_) {}
    localStorage.setItem('pms_reservations', JSON.stringify(window.reservations));
    localStorage.setItem('pms_rooms', JSON.stringify(window.rooms));
    window.renderReservationBoard();
    return { assignedRoomId, displayRoom: roomId };
  }, options);
}

async function runCases(browser, collector) {
  await collector.run('DASH-004', 'Today check-in list pagination', 'Render seven arrivals and verify next/previous paging.', () =>
    withPage(browser, 'dashboard/dashboard.html?plan-functional=dashboard', async state => {
      const { page } = state;
      await page.waitForSelector('#todayCheckinTable tbody', { state: 'attached' });
      await page.waitForFunction(() => document.getElementById('checkinPageLabel')?.textContent.trim() === '1 / 2');
      const initial = await page.evaluate(() => ({
        visible: document.querySelectorAll('#todayCheckinTable tbody tr:not(.ops-filler-row)').length,
        label: document.getElementById('checkinPageLabel')?.textContent.trim(),
        nextVisible: getComputedStyle(document.getElementById('checkinNextBtn')).display !== 'none'
      }));
      assert(initial.visible === 5 && initial.label === '1 / 2' && initial.nextVisible, 'Initial check-in page is incorrect.', initial);
      await page.locator('#checkinNextBtn').click();
      const next = await page.evaluate(() => ({
        visible: document.querySelectorAll('#todayCheckinTable tbody tr:not(.ops-filler-row)').length,
        label: document.getElementById('checkinPageLabel')?.textContent.trim()
      }));
      assert(next.visible === 2 && next.label === '2 / 2', 'Next check-in page is incorrect.', next);
      await page.locator('#checkinPrevBtn').click();
      const previous = await page.locator('#checkinPageLabel').innerText();
      assert(previous === '1 / 2', 'Previous check-in page was not restored.', previous);
      cleanRuntimeErrors(state);
      return { initial, next, previous };
    }, {
      routes: [{
        url: '**/data/api/v1/reservations/index.json',
        handler: async route => {
          const items = Array.from({ length: 7 }, (_, index) => ({
            id: `QA-DASH-${index + 1}`,
            reservationId: `QA-DASH-${index + 1}`,
            guest: `Dashboard Guest ${index + 1}`,
            guestName: `Dashboard Guest ${index + 1}`,
            room: `QA${String(index + 1).padStart(2, '0')}`,
            roomNo: `QA${String(index + 1).padStart(2, '0')}`,
            roomTypeName: 'Deluxe',
            type: 'Deluxe',
            checkInDate: '2026-06-10',
            checkOutDate: '2026-06-11',
            checkin: '2026-06-10',
            checkout: '2026-06-11',
            status: 'confirmed'
          }));
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { items, page: { page: 1, pageSize: 50, total: items.length, totalPages: 1 } },
              meta: { generatedAt: '2026-06-10T00:00:00+09:00', demoDate: '2026-06-10' }
            })
          });
        }
      }]
    })
  );

  await collector.run('NOTI-003', 'Notification target validation', 'Open a valid target and reject an invalid target.', () =>
    withPage(browser, 'dashboard/notifications.html?plan-functional=notifications', async state => {
      const { page } = state;
      await page.waitForSelector('#timelineContainer');
      await page.evaluate(() => {
        activities = [{ id: 'QA-NOTI-OK', date: '2026-07-10', time: '10:00', title: 'Valid target', target: 'frontdesk/reservation-board.html' }];
        renderActivities();
      });
      await page.locator('#timelineContainer .timeline-link').click();
      await page.waitForURL(/frontdesk\/reservation-board\.html/);
      await page.goto(`${locationOrigin(page.url())}/dashboard/notifications.html?plan-functional=invalid-notification`);
      await page.waitForSelector('#timelineContainer');
      await page.evaluate(() => {
        activities = [{ id: 'QA-NOTI-BAD', date: '2026-07-10', time: '10:01', title: 'Invalid target', target: 'frontdesk/not-found-qa.html' }];
        renderActivities();
      });
      await page.locator('#timelineContainer .timeline-link').click();
      const message = await acceptDialog(page);
      assert(page.url().includes('notifications.html'), 'Invalid notification target changed the page.', page.url());
      assert(/찾을 수|cannot be found|대상/i.test(message), 'Invalid target message is unclear.', message);
      return { validTarget: true, invalidMessage: message, stayedOnPage: true };
    })
  );

  await collector.run('RES-BOARD-004', 'Maintenance room booking guard', 'Block maintenance room booking and save a clean room booking to the clicked room.', () =>
    withPage(browser, 'dashboard/frontdesk/reservation-board.html?plan-functional=maintenance-booking', async state => {
      const { page } = state;
      await waitForBoard(page);
      await seedBoard(page, { roomId: '1203', roomStatus: 'maintenance', housekeepingStatus: 'clean' });
      await page.evaluate(() => { openBoardRoomBooking(encodeURIComponent('1203')); });
      const blockedMessage = await acceptDialog(page);
      assert(await page.locator('#unifiedResModal.active').count() === 0, 'Booking modal opened for a maintenance room.');
      const blockedCount = await page.evaluate(() => window.reservations.filter(item => String(item.room || item.fullRoom).endsWith('1203')).length);
      assert(blockedCount === 0, 'A maintenance-room reservation was created.', blockedCount);

      await seedBoard(page, { roomId: '1203', roomStatus: 'vacant-clean', housekeepingStatus: 'clean' });
      await page.evaluate(() => { openBoardRoomBooking(encodeURIComponent('1203')); });
      await page.locator('#unifiedResModal.active').waitFor({ state: 'visible' });
      const selectedRoom = await page.locator('#unifiedRoom').inputValue();
      assert(String(selectedRoom).endsWith('1203'), 'Clicked room was replaced by another room.', selectedRoom);
      await addExistingGuest(page);
      await page.locator('#unifiedResModal.active button[onclick="saveUnifiedRes()"]' ).click();
      await page.waitForFunction(() => !document.getElementById('unifiedResModal')?.classList.contains('active'));
      const saved = await page.evaluate(() => window.reservations.filter(item => String(item.room || item.fullRoom).endsWith('1203')).map(item => item.id));
      assert(saved.length === 1, 'Clean-room booking did not persist to room 1203.', saved);
      cleanRuntimeErrors(state);
      return { blockedMessage, maintenanceSaved: blockedCount, selectedRoom, saved };
    })
  );

  await collector.run('RES-BOARD-008', 'Overdue reservation check-in', 'Check in an overdue confirmed reservation and verify storage and room state.', () =>
    withPage(browser, 'dashboard/frontdesk/reservation-board.html?plan-functional=overdue-checkin', async state => {
      const { page } = state;
      await waitForBoard(page);
      await seedBoard(page, { roomId: '1203', reservation: { id: 'QA-OVERDUE', guest: 'Overdue Guest', status: 'confirmed', checkInDate: '2026-07-08', checkOutDate: '2026-07-09' } });
      await page.evaluate(() => openUnifiedResModal('QA-OVERDUE'));
      await page.locator('#unifiedResModal.active').waitFor({ state: 'visible' });
      assert(await page.locator('#unifiedFlowActions button').count() === 1, 'Check-in action is missing for an overdue reservation.');
      await page.evaluate(() => { void processUnifiedReservationFlow('checkin'); });
      const message = await acceptDialog(page);
      await page.waitForFunction(() => window.reservations.find(item => item.id === 'QA-OVERDUE')?.status === 'checkedin');
      const result = await page.evaluate(() => ({
        status: window.reservations.find(item => item.id === 'QA-OVERDUE')?.status,
        stored: JSON.parse(localStorage.getItem('pms_reservations') || '[]').find(item => item.id === 'QA-OVERDUE')?.status,
        room: window.rooms.find(item => String(item.id || item.roomId || item.roomNo).endsWith('1203'))
      }));
      assert(result.status === 'checkedin' && result.stored === 'checkedin', 'Overdue check-in did not persist.', result);
      assert(/occupied|in-house/.test(`${result.room.status} ${result.room.frontStatus}`), 'Room was not occupied after check-in.', result.room);
      return { message, status: result.status, stored: result.stored, roomStatus: result.room.status };
    })
  );

  await collector.run('RES-BOARD-009', 'Future reservation early check-in guard', 'Attempt check-in before the reservation date and verify no state change.', () =>
    withPage(browser, 'dashboard/frontdesk/reservation-board.html?plan-functional=future-checkin', async state => {
      const { page } = state;
      await waitForBoard(page);
      const futureDates = await page.evaluate(() => {
        const today = window.PmsDate?.todayIso?.() || new Date().toISOString().slice(0, 10);
        const addDays = days => {
          const [year, month, day] = today.split('-').map(Number);
          const date = new Date(year, month - 1, day + days);
          return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
        };
        return { checkInDate: addDays(1), checkOutDate: addDays(2) };
      });
      await seedBoard(page, {
        roomId: '1203',
        reservation: { id: 'QA-FUTURE', guest: 'Future Guest', status: 'confirmed', ...futureDates }
      });
      await page.evaluate(() => openUnifiedResModal('QA-FUTURE'));
      await page.locator('#unifiedResModal.active').waitFor({ state: 'visible' });
      assert(await page.locator('#unifiedFlowActions button').count() === 0, 'Early check-in button is visible for a future reservation.');
      await page.evaluate(() => { void processUnifiedReservationFlow('checkin'); });
      const message = await acceptDialog(page);
      const status = await page.evaluate(() => window.reservations.find(item => item.id === 'QA-FUTURE')?.status);
      assert(status === 'confirmed', 'Future reservation status changed after blocked check-in.', status);
      return { message, status };
    })
  );

  await collector.run('RES-BOARD-012', 'In-house room move persistence', 'Move an in-house reservation and verify history and room states.', () =>
    withPage(browser, 'dashboard/frontdesk/reservation-board.html?plan-functional=room-move', async state => {
      const { page } = state;
      await waitForBoard(page);
      await seedBoard(page, { roomId: '1201', roomStatus: 'occupied', housekeepingStatus: 'occupied', targetRoomId: '1202', reservation: { id: 'QA-MOVE', guest: 'Move Guest', status: 'checkedin', checkInDate: '2026-07-10', checkOutDate: '2026-07-14' } });
      await page.evaluate(() => openUnifiedResModal('QA-MOVE'));
      await page.locator('#unifiedResModal.active').waitFor({ state: 'visible' });
      const targetValue = await page.locator('#unifiedRoom option').filter({ hasText: '1202' }).first().getAttribute('value');
      assert(targetValue, 'Target room 1202 is missing from room move options.');
      await page.locator('#unifiedRoom').selectOption(targetValue);
      await page.locator('#unifiedResModal.active button[onclick="saveUnifiedRes()"]' ).click();
      await page.waitForTimeout(750);
      const saveState = await page.evaluate(() => ({
        modalActive: document.getElementById('unifiedResModal')?.classList.contains('active'),
        dialogActive: document.getElementById('pms-confirm-modal')?.classList.contains('active'),
        dialogMessage: document.getElementById('pms-confirm-message')?.textContent.trim(),
        selectedRoom: document.getElementById('unifiedRoom')?.value,
        reservationRoom: window.reservations.find(item => item.id === 'QA-MOVE')?.room
      }));
      assert(!saveState.dialogActive, 'Room move save opened an unexpected validation dialog.', saveState);
      assert(!saveState.modalActive, 'Room move modal remained open after save.', saveState);
      const result = await page.evaluate(() => {
        const res = window.reservations.find(item => item.id === 'QA-MOVE');
        const oldRoom = window.rooms.find(item => String(item.id || item.roomId || item.roomNo).endsWith('1201'));
        const newRoom = window.rooms.find(item => String(item.id || item.roomId || item.roomNo).endsWith('1202'));
        const stored = JSON.parse(localStorage.getItem('pms_reservations') || '[]').find(item => item.id === 'QA-MOVE');
        return {
          res,
          oldRoom,
          newRoom,
          storedRoom: stored?.room,
          storedRoomId: stored?.roomId,
          storedFullRoom: stored?.fullRoom,
          storedRoomNo: stored?.roomNo,
          storedRoomNumber: stored?.roomNumber,
          storedRoomLabel: stored?.roomLabel
        };
      });
      assert(String(result.res.room).endsWith('1202') && String(result.storedRoom).endsWith('1202'), 'Room move did not persist.', result);
      assert(
        [result.storedRoomId, result.storedFullRoom, result.storedRoomNo, result.storedRoomNumber, result.storedRoomLabel]
          .filter(value => value !== undefined && value !== null && value !== '')
          .every(value => String(value).endsWith('1202')),
        'Room move left a stale source-room identifier on the reservation.',
        result
      );
      assert(result.res.roomMoveHistory?.some(item => String(item.fromRoom).includes('1201') && String(item.toRoom).includes('1202')), 'Room move history was not created.', result.res.roomMoveHistory);
      assert(/dirty/.test(`${result.oldRoom.status} ${result.oldRoom.housekeepingStatus}`), 'Previous room was not marked dirty.', result.oldRoom);
      assert(/occupied|in-house/.test(`${result.newRoom.status} ${result.newRoom.frontStatus}`), 'New room was not marked occupied.', result.newRoom);
      return { room: result.res.room, history: result.res.roomMoveHistory, oldStatus: result.oldRoom.status, newStatus: result.newRoom.status };
    })
  );

  await collector.run('RES-BOARD-015', 'Cancellation and room release', 'Cancel a confirmed reservation and verify persistent status and released room.', () =>
    withPage(browser, 'dashboard/frontdesk/reservation-board.html?plan-functional=cancel', async state => {
      const { page } = state;
      await waitForBoard(page);
      await seedBoard(page, { roomId: '1203', reservation: { id: 'QA-CANCEL', guest: 'Cancel Guest', status: 'confirmed', checkInDate: '2026-07-10', checkOutDate: '2026-07-12' } });
      await page.evaluate(() => { void cancelResAction('QA-CANCEL'); });
      const modal = page.locator('#pms-confirm-modal.active');
      await modal.waitFor({ state: 'visible' });
      const message = (await page.locator('#pms-confirm-message').innerText()).trim();
      await page.locator('#pms-confirm-ok').click();
      const reason = page.locator('#pms-confirm-modal.active .pms-dialog-input');
      await reason.waitFor({ state: 'visible' });
      await reason.fill('QA cancellation reason');
      await page.locator('#pms-confirm-ok').click();
      await modal.waitFor({ state: 'hidden' });
      await page.waitForFunction(() => window.reservations.find(item => item.id === 'QA-CANCEL')?.status === 'cancelled');
      const result = await page.evaluate(() => ({
        status: window.reservations.find(item => item.id === 'QA-CANCEL')?.status,
        stored: JSON.parse(localStorage.getItem('pms_reservations') || '[]').find(item => item.id === 'QA-CANCEL')?.status,
        room: window.rooms.find(item => String(item.id || item.roomId || item.roomNo).endsWith('1203'))
      }));
      assert(result.status === 'cancelled' && result.stored === 'cancelled', 'Cancellation did not persist.', result);
      assert(!/occupied|in-house/.test(`${result.room.status} ${result.room.frontStatus}`), 'Cancelled reservation did not release the room.', result.room);
      return { message, status: result.status, stored: result.stored, roomStatus: result.room.status };
    })
  );
}

function locationOrigin(url) {
  return new URL(url).origin;
}

(async () => {
  const { browser, server } = await launch();
  const collector = createResultCollector(OUTPUT);
  try {
    await runCases(browser, collector);
  } finally {
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
  const payload = collector.write({ suite: 'functional-frontdesk-direct' });
  process.stdout.write(`${JSON.stringify(payload.summary)}\n`);
  process.exitCode = payload.summary.failed ? 1 : 0;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
