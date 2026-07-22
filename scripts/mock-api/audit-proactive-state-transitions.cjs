const path = require('path');
const {
  assert,
  launch,
  openPage,
  createResultCollector,
  cleanRuntimeErrors
} = require('./plan-test-harness.cjs');

const OUTPUT = process.env.PMS_RESULT_FILE || path.resolve(
  __dirname, '..', '..', 'outputs', 'proactive-validation-20260722', 'state-transitions.json'
);

async function withPage(browser, route, callback, options = {}) {
  const state = await openPage(browser, route, { language: 'ko', ...options });
  state.page.setDefaultTimeout(12000);
  try { return await callback(state); } finally { await state.context.close(); }
}

async function waitForBoard(page) {
  await page.waitForFunction(() => Array.isArray(window.rooms) && window.rooms.length > 0 && Array.isArray(window.reservations));
  await page.waitForSelector('#reservationBoardContainer');
}

async function seedMoveScenario(page) {
  await page.evaluate(() => {
    const today = window.PmsDate?.todayIso?.() || new Date().toISOString().slice(0, 10);
    const addDays = days => {
      const [year, month, day] = today.split('-').map(Number);
      const date = new Date(year, month - 1, day + days);
      return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    };
    const values = room => [room?.id, room?.roomId, room?.fullRoom, room?.roomNo, room?.number].filter(Boolean).map(String);
    const findRoom = number => window.rooms.find(room => values(room).some(value => value === number || value.endsWith(number)));
    const source = findRoom('1201');
    const middle = findRoom('1202');
    const target = findRoom('1203');
    if (!source || !middle || !target) throw new Error('Move fixture rooms 1201/1202/1203 were not found');
    const normalizeRoom = (room, status, housekeepingStatus, guest = '') => Object.assign(room, {
      status,
      frontStatus: status === 'occupied' ? 'in-house' : status,
      housekeepingStatus,
      cleaningStatus: housekeepingStatus,
      maintenanceStatus: '',
      isOutOfService: false,
      outOfService: false,
      guest
    });
    normalizeRoom(source, 'occupied', 'occupied', 'Chain Move Guest');
    normalizeRoom(middle, 'vacant-clean', 'clean');
    normalizeRoom(target, 'vacant-clean', 'clean');
    const sourceId = String(source.id || source.roomId || source.fullRoom || '1201');
    window.reservations = window.reservations.filter(item => {
      const assigned = String(item.room || item.fullRoom || item.roomId || item.roomNo || '');
      return !['1201', '1202', '1203'].some(number => assigned.endsWith(number));
    });
    window.reservations.push({
      id: 'QA-CHAIN-MOVE', reservationId: 'QA-CHAIN-MOVE',
      guest: 'Chain Move Guest', guestName: 'Chain Move Guest', guestPhone: '+84 90 1111 2222',
      room: sourceId, fullRoom: sourceId, roomId: sourceId, roomNo: '1201',
      type: source.type || 'Deluxe', status: 'checkedin', channel: 'Walk-in',
      checkInDate: addDays(-1), checkOutDate: addDays(2), checkin: addDays(-1), checkout: addDays(2),
      cin: addDays(-1), cout: addDays(2), checkInTime: '14:00', checkOutTime: '12:00',
      amount: 420, totalAmount: { currency: 'PHP', amount: 420 }, balanceDue: 0,
      roomingGuests: [{ id: 'QA-CHAIN-P', name: 'Chain Move Guest', role: 'primary', isPrimary: true }],
      roomMoveHistory: [], roomChangeHistory: []
    });
    try { reservations = window.reservations; rooms = window.rooms; } catch (_) {}
    localStorage.setItem('pms_reservations', JSON.stringify(window.reservations));
    localStorage.setItem('pms_rooms', JSON.stringify(window.rooms));
    localStorage.setItem('pms_privacy_audit_logs', '[]');
    window.renderReservationBoard();
  });
}

async function moveReservation(page, roomNumber) {
  await page.evaluate(() => window.openUnifiedResModal('QA-CHAIN-MOVE'));
  await page.locator('#unifiedResModal.active').waitFor({ state: 'visible' });
  const option = page.locator('#unifiedRoom option').filter({ hasText: roomNumber }).first();
  const value = await option.getAttribute('value');
  assert(value, `Room ${roomNumber} is missing from move options.`);
  await page.locator('#unifiedRoom').selectOption(value);
  await page.locator('#unifiedResModal.active button[onclick="saveUnifiedRes()"]' ).click();
  await page.locator('#unifiedResModal.active').waitFor({ state: 'hidden' });
}

async function seedLinkedAncillaryOrder(page) {
  return page.evaluate(() => {
    const reservation = window.reservations.find(item => item.id === 'QA-CHAIN-MOVE');
    const source = window.rooms.find(room => [room?.id, room?.roomId, room?.fullRoom, room?.roomNo, room?.number]
      .filter(Boolean).some(value => String(value).endsWith('1201')));
    if (!reservation || !source) throw new Error('Linked ancillary fixture source was not found');
    const order = {
      id: 'QA-MOVE-ORDER',
      reservationId: reservation.id,
      room: '1201',
      roomId: source.id || source.roomId || source.fullRoom || '1201',
      guest: 'Chain Move Guest',
      service: 'pos',
      serviceLabel: 'Integrated POS',
      item: 'QA Linked Order',
      qty: 1,
      unitPrice: 100,
      total: 100,
      status: 'accepted',
      dateTime: window.PmsDate?.nowIso?.() || new Date().toISOString()
    };
    localStorage.setItem('pms_ancillary_room_orders', JSON.stringify([order]));
    return order;
  });
}

async function runCases(browser, collector) {
  await collector.run('STATE-001', 'Chained in-house room moves', 'Move one in-house reservation 1201 -> 1202 -> 1203 and verify identifiers, room states, history and audits.', () =>
    withPage(browser, 'dashboard/frontdesk/reservation-board.html?proactive=chain-move', async state => {
      const { page } = state;
      await waitForBoard(page);
      await seedMoveScenario(page);
      await moveReservation(page, '1202');
      await moveReservation(page, '1203');
      const result = await page.evaluate(() => {
        const reservation = window.reservations.find(item => item.id === 'QA-CHAIN-MOVE');
        const stored = JSON.parse(localStorage.getItem('pms_reservations') || '[]').find(item => item.id === 'QA-CHAIN-MOVE');
        const room = number => window.rooms.find(item => [item.id, item.roomId, item.fullRoom, item.roomNo, item.number].filter(Boolean).some(value => String(value).endsWith(number)));
        const audits = JSON.parse(localStorage.getItem('pms_privacy_audit_logs') || '[]');
        return {
          reservation,
          stored,
          rooms: ['1201', '1202', '1203'].map(number => ({ number, status: room(number)?.status, housekeepingStatus: room(number)?.housekeepingStatus })),
          auditCount: audits.filter(item => item.action === 'reservation.room.move' && item.details?.reservationId === 'QA-CHAIN-MOVE').length
        };
      });
      const identifiers = ['room', 'fullRoom', 'roomId', 'roomNo', 'roomNumber', 'roomLabel'];
      assert(identifiers.every(key => !result.stored[key] || String(result.stored[key]).endsWith('1203')), 'A stale room identifier remained after the second move.', result);
      assert(result.reservation.roomMoveHistory?.length === 2 && result.reservation.roomChangeHistory?.length === 2, 'Two room moves were not retained in history.', result);
      assert(result.auditCount === 2, 'Room move audit count is not exactly two.', result);
      assert(/dirty/.test(`${result.rooms[0].status} ${result.rooms[0].housekeepingStatus}`) && /dirty/.test(`${result.rooms[1].status} ${result.rooms[1].housekeepingStatus}`), 'Previous rooms were not left dirty.', result.rooms);
      assert(/occupied/.test(`${result.rooms[2].status} ${result.rooms[2].housekeepingStatus}`), 'Final room is not occupied.', result.rooms);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('STATE-002', 'Repeated settlement complete/reopen cycle', 'Complete, reopen, complete, reopen and verify records, state and audit counts remain consistent.', () =>
    withPage(browser, 'dashboard/operations/settlement-status.html?proactive=repeat-cycle', async state => {
      const { page } = state;
      await page.waitForFunction(() => Array.isArray(settlementState.folios) && settlementState.folios.length > 0);
      const result = await page.evaluate(async () => {
        localStorage.setItem('currentUserRole', 'sys_admin'); window.currentUserRole = 'sys_admin';
        const folio = settlementState.folios.find(item => Number(item.balance || 0) <= 0 && !item.settlementCompleted) || settlementState.folios.find(item => Number(item.balance || 0) <= 0);
        if (!folio) throw new Error('No zero-balance folio fixture');
        const id = folio.folioId || folio.id;
        localStorage.setItem(SETTLEMENT_COMPLETIONS_KEY, '[]');
        localStorage.setItem(SETTLEMENT_REOPENS_KEY, '[]');
        localStorage.setItem('pms_privacy_audit_logs', '[]');
        window.showConfirm = async () => true;
        await loadSettlementData(); renderSettlementSections();
        await completeSettlementStatusFolio(id, { skipConfirm: true, openDetail: false });
        await reopenSettlementStatusFolio(id);
        await completeSettlementStatusFolio(id, { skipConfirm: true, openDetail: false });
        await reopenSettlementStatusFolio(id);
        const audits = JSON.parse(localStorage.getItem('pms_privacy_audit_logs') || '[]');
        return {
          id,
          completions: settlementCompletionRecords().filter(item => String(item.folioId) === String(id)).length,
          reopens: settlementReopenRecords().filter(item => String(item.folioId) === String(id)).length,
          reopenAudits: audits.filter(item => item.action === 'folio.settlement.reopen' && String(item.details?.folioId) === String(id)).length,
          final: settlementFolioById(id)
        };
      });
      assert(result.completions === 0 && result.reopens === 2 && result.reopenAudits === 2, 'Repeated settlement cycle left inconsistent records or audits.', result);
      assert(!result.final?.settlementCompleted, 'Final settlement state should be reopened.', result.final);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('STATE-003', 'Repeated ancillary complete/reopen cycle', 'Complete and reopen the same ancillary order twice; verify final state, storage and one audit per reopen.', () =>
    withPage(browser, 'dashboard/operations/ancillary.html?proactive=repeat-cycle', async state => {
      const { page } = state;
      await page.waitForFunction(() => Array.isArray(serviceOrders) && serviceOrders.length > 0);
      const result = await page.evaluate(() => {
        localStorage.setItem('currentUserRole', 'sys_admin'); window.currentUserRole = 'sys_admin';
        localStorage.setItem('pms_privacy_audit_logs', '[]');
        const order = serviceOrders[0];
        order.status = 'accepted'; persistOrders();
        updateServiceOrderStatus(order.id, 'completed');
        updateServiceOrderStatus(order.id, 'accepted');
        updateServiceOrderStatus(order.id, 'completed');
        updateServiceOrderStatus(order.id, 'accepted');
        const stored = JSON.parse(localStorage.getItem(ORDER_STORAGE) || '[]').find(item => item.id === order.id);
        const audits = JSON.parse(localStorage.getItem('pms_privacy_audit_logs') || '[]');
        return {
          id: order.id,
          finalStatus: effectiveOrderStatus(order),
          storedStatus: stored?.status,
          reopenAudits: audits.filter(item => item.action === 'ancillary.order.reopen' && String(item.details?.orderId) === String(order.id)).length
        };
      });
      assert(result.finalStatus === 'accepted' && result.storedStatus === 'accepted' && result.reopenAudits === 2, 'Repeated ancillary cycle is inconsistent.', result);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => Array.isArray(serviceOrders) && serviceOrders.length > 0);
      const reloaded = await page.evaluate(id => effectiveOrderStatus(serviceOrders.find(item => item.id === id)), result.id);
      assert(reloaded === 'accepted', 'Repeated ancillary final state was lost after reload.', { result, reloaded });
      cleanRuntimeErrors(state);
      return { ...result, reloaded };
    })
  );

  await collector.run('STATE-004', 'Expense payment-method resynchronization', 'Create a cash expense, edit it to card, then back to cash with a new amount and verify cash-session withdrawal synchronization.', () =>
    withPage(browser, 'dashboard/operations/expense-purchases.html?proactive=payment-method', async state => {
      const { page } = state;
      await page.waitForFunction(() => typeof openExpenseFormModal === 'function');
      const result = await page.evaluate(() => {
        openExpenseFormModal();
        document.getElementById('expenseItem').value = 'QA Method Transition';
        document.getElementById('expenseVendor').value = 'QA Vendor';
        document.getElementById('expenseAmount').value = '111';
        document.getElementById('expenseMethod').value = 'cash';
        document.getElementById('expenseCurrency').value = 'PHP';
        saveExpensePurchase();
        const row = expenses().find(item => item.item === 'QA Method Transition');
        const withdrawal = () => readJson(CASH_SESSION_KEY, []).flatMap(item => item.withdrawals || []).filter(item => item.expenseId === row.id);
        const cashCreated = withdrawal().map(item => item.amount);
        openExpenseFormModal(row.id);
        document.getElementById('expenseMethod').value = 'card';
        saveExpensePurchase();
        const afterCard = withdrawal().map(item => item.amount);
        openExpenseFormModal(row.id);
        document.getElementById('expenseMethod').value = 'cash';
        document.getElementById('expenseAmount').value = '222';
        saveExpensePurchase();
        const afterCash = withdrawal().map(item => item.amount);
        const stored = expenses().find(item => item.id === row.id);
        return { id: row.id, cashCreated, afterCard, afterCash, stored };
      });
      assert(result.cashCreated.length === 1 && Number(result.cashCreated[0]) === 111, 'Initial cash withdrawal is missing.', result);
      assert(result.afterCard.length === 0, 'Changing cash expense to card left a stale cash withdrawal.', result);
      assert(result.afterCash.length === 1 && Number(result.afterCash[0]) === 222, 'Changing back to cash did not create exactly one updated withdrawal.', result);
      assert(result.stored.method === 'cash' && Number(result.stored.amount) === 222 && Number(result.stored.settlementAmount) === -222, 'Final expense row is inconsistent.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('STATE-005', 'Language switch preserves active reservation form', 'Open a reservation, enter an unsaved note, switch Korean to English and verify the value remains while labels update.', () =>
    withPage(browser, 'dashboard/frontdesk/reservation-board.html?proactive=language-form', async state => {
      const { page } = state;
      await waitForBoard(page);
      const reservationId = await page.evaluate(() => window.reservations.find(item => !['cancelled', 'completed'].includes(String(item.status || '').toLowerCase()))?.id || '');
      assert(reservationId, 'No reservation fixture for language-switch test.');
      await page.evaluate(id => window.openUnifiedResModal(id), reservationId);
      await page.locator('#unifiedResModal.active').waitFor({ state: 'visible' });
      const note = page.locator('#unifiedReservationNote');
      await note.fill('Unsaved language transition note');
      await page.locator('#langSelect').selectOption('en');
      await page.waitForTimeout(250);
      const result = {
        note: await note.inputValue(),
        language: await page.evaluate(() => localStorage.getItem('pms_lang')),
        saveText: (await page.locator('#unifiedResModal.active button[onclick="saveUnifiedRes()"]' ).innerText()).trim(),
        modalOpen: await page.locator('#unifiedResModal.active').count() === 1
      };
      assert(result.note === 'Unsaved language transition note' && result.modalOpen, 'Language switch closed or reset the active reservation form.', result);
      assert(result.language === 'en' && /save/i.test(result.saveText), 'Reservation modal did not translate to English immediately.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('STATE-006', 'Ancillary reopen permission and audit', 'Reject a completed-order reopen without permission, then grant permission and verify one persisted reopen audit.', () =>
    withPage(browser, 'dashboard/operations/ancillary.html?proactive=permission', async state => {
      const { page } = state;
      await page.waitForFunction(() => Array.isArray(serviceOrders) && serviceOrders.length > 0);
      const result = await page.evaluate(() => {
        const order = serviceOrders[0];
        order.status = 'completed';
        persistOrders();
        localStorage.setItem('pms_privacy_audit_logs', '[]');
        localStorage.setItem('pms_role_feature_permissions', '{}');
        localStorage.setItem('currentUserRole', 'sys_desk');
        window.currentUserRole = 'sys_desk';
        updateServiceOrderStatus(order.id, 'accepted');
        const deniedStatus = effectiveOrderStatus(order);
        const deniedAudits = JSON.parse(localStorage.getItem('pms_privacy_audit_logs') || '[]');
        window.PMS_FeaturePermissions.set('sys_desk', 'ancillary.reopen', true);
        updateServiceOrderStatus(order.id, 'accepted');
        const stored = JSON.parse(localStorage.getItem(ORDER_STORAGE) || '[]').find(item => item.id === order.id);
        const audits = JSON.parse(localStorage.getItem('pms_privacy_audit_logs') || '[]');
        return {
          id: order.id,
          deniedStatus,
          deniedAuditCount: deniedAudits.filter(item => item.action === 'ancillary.order.reopen').length,
          allowedStatus: effectiveOrderStatus(order),
          storedStatus: stored?.status,
          allowedAuditCount: audits.filter(item => item.action === 'ancillary.order.reopen' && String(item.details?.orderId) === String(order.id)).length
        };
      });
      assert(result.deniedStatus === 'completed' && result.deniedAuditCount === 0, 'Ancillary reopen bypassed the feature permission.', result);
      assert(result.allowedStatus === 'accepted' && result.storedStatus === 'accepted' && result.allowedAuditCount === 1, 'Authorized ancillary reopen did not persist exactly one audit.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('STATE-007', 'Settlement reopen permission and audit', 'Reject settlement reopen without permission, then grant permission and verify state persistence and one audit.', () =>
    withPage(browser, 'dashboard/operations/settlement-status.html?proactive=permission', async state => {
      const { page } = state;
      await page.waitForFunction(() => Array.isArray(settlementState.folios) && settlementState.folios.length > 0);
      const result = await page.evaluate(async () => {
        localStorage.setItem('currentUserRole', 'sys_admin');
        window.currentUserRole = 'sys_admin';
        const folio = settlementState.folios.find(item => Number(item.balance || 0) <= 0 && !item.settlementCompleted)
          || settlementState.folios.find(item => Number(item.balance || 0) <= 0);
        if (!folio) throw new Error('No zero-balance folio fixture');
        const id = folio.folioId || folio.id;
        localStorage.setItem(SETTLEMENT_COMPLETIONS_KEY, '[]');
        localStorage.setItem(SETTLEMENT_REOPENS_KEY, '[]');
        localStorage.setItem('pms_privacy_audit_logs', '[]');
        await loadSettlementData();
        await completeSettlementStatusFolio(id, { skipConfirm: true, openDetail: false });
        localStorage.setItem('pms_role_feature_permissions', '{}');
        localStorage.setItem('currentUserRole', 'sys_desk');
        window.currentUserRole = 'sys_desk';
        window.showConfirm = async () => true;
        await window.reopenSettlementStatusFolio(id);
        const deniedCompletionPresent = settlementCompletionRecords().some(item => String(item.folioId) === String(id));
        const deniedAudits = JSON.parse(localStorage.getItem('pms_privacy_audit_logs') || '[]');
        window.PMS_FeaturePermissions.set('sys_desk', 'settlement.reopen', true);
        await window.reopenSettlementStatusFolio(id);
        const allowedCompletionPresent = settlementCompletionRecords().some(item => String(item.folioId) === String(id));
        const audits = JSON.parse(localStorage.getItem('pms_privacy_audit_logs') || '[]');
        return {
          id,
          deniedCompletionPresent,
          deniedAuditCount: deniedAudits.filter(item => item.action === 'folio.settlement.reopen').length,
          allowedCompletionPresent,
          reopenRecords: settlementReopenRecords().filter(item => String(item.folioId) === String(id)).length,
          allowedAuditCount: audits.filter(item => item.action === 'folio.settlement.reopen' && String(item.details?.folioId) === String(id)).length
        };
      });
      assert(result.deniedCompletionPresent === true && result.deniedAuditCount === 0, 'Settlement reopen bypassed the feature permission.', result);
      assert(result.allowedCompletionPresent === false && result.reopenRecords === 1 && result.allowedAuditCount === 1, 'Authorized settlement reopen did not persist exactly one state change and audit.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('STATE-008', 'Placard live preview and landscape print', 'Verify check-in-only placard availability, live flight preview, persistence and A4 landscape output.', () =>
    withPage(browser, 'dashboard/frontdesk/reservation-board.html?proactive=placard', async state => {
      const { page } = state;
      await waitForBoard(page);
      await seedMoveScenario(page);
      await page.evaluate(() => {
        const today = window.PmsDate?.todayIso?.() || new Date().toISOString().slice(0, 10);
        const addDays = days => {
          const [year, month, day] = today.split('-').map(Number);
          const date = new Date(year, month - 1, day + days);
          return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
        };
        const reservation = window.reservations.find(item => item.id === 'QA-CHAIN-MOVE');
        reservation.status = 'confirmed';
        reservation.pax = 4;
        reservation.guest = 'Alexandria Montgomery';
        reservation.guestName = 'Alexandria Montgomery';
        reservation.checkInDate = today;
        reservation.checkin = today;
        reservation.cin = today;
        reservation.checkOutDate = addDays(2);
        reservation.checkout = addDays(2);
        reservation.cout = addDays(2);
        const room = window.rooms.find(item => [item?.id, item?.roomId, item?.fullRoom, item?.roomNo, item?.number]
          .filter(Boolean).some(value => String(value).endsWith('1201')));
        Object.assign(room, { status: 'vacant-clean', frontStatus: 'vacant', housekeepingStatus: 'clean', cleaningStatus: 'clean', guest: '' });
        localStorage.setItem('pms_reservations', JSON.stringify(window.reservations));
        localStorage.setItem('pms_rooms', JSON.stringify(window.rooms));
        window.openUnifiedResModal(reservation.id);
      });
      await page.locator('#unifiedResModal.active').waitFor({ state: 'visible' });
      const placardVisible = await page.locator('#unifiedBtnPlacard').evaluate(element => getComputedStyle(element).display !== 'none');
      assert(placardVisible, 'Placard button is not available for an eligible check-in reservation.');
      await page.locator('#unifiedBtnPlacard').click();
      await page.locator('#reservationPlacardModal.active').waitFor({ state: 'visible' });
      await page.locator('#placardFlightInput').fill('Korean Air KE641');
      const preview = await page.locator('#placardPreviewCanvas').innerText();
      assert(preview.includes('Korean Air KE641') && preview.includes('Alexandria Montgomery'), 'Placard live preview did not update.', { preview });
      const result = await page.evaluate(async () => {
        const capture = { html: '', printed: false, focused: false };
        const fakeWindow = {
          document: {
            write(value) { capture.html += value; },
            close() {}
          },
          focus() { capture.focused = true; },
          print() { capture.printed = true; }
        };
        const originalOpen = window.open;
        window.open = () => fakeWindow;
        try {
          await window.printReservationPlacardFromPreview();
          await new Promise(resolve => setTimeout(resolve, 350));
        } finally {
          window.open = originalOpen;
        }
        const stored = JSON.parse(localStorage.getItem('pms_reservations') || '[]').find(item => item.id === 'QA-CHAIN-MOVE');
        const canvas = document.getElementById('placardPreviewCanvas');
        return {
          ...capture,
          savedFlight: stored?.placardFlight,
          previewFits: canvas.scrollWidth <= canvas.clientWidth + 1
        };
      });
      assert(result.html.includes('size:A4 landscape') && result.html.includes('width:297mm') && result.html.includes('height:210mm'), 'Placard print document is not A4 landscape.', result);
      assert(result.html.includes('Korean Air KE641') && result.html.includes('Alexandria Montgomery') && result.printed && result.focused, 'Placard print output missed content or print invocation.', result);
      assert(result.savedFlight === 'Korean Air KE641' && result.previewFits, 'Placard value persistence or preview sizing failed.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('STATE-009', 'Reservation filter count and state invariance', 'Open every board filter and verify the active count equals rendered cards and shared reservations keep the same state class.', () =>
    withPage(browser, 'dashboard/frontdesk/reservation-board.html?proactive=filters', async state => {
      const { page } = state;
      await waitForBoard(page);
      const result = await page.evaluate(() => {
        setBoardFilter('all');
        const snapshot = new Map(Array.from(document.querySelectorAll('.reservation-board-box')).map(card => [
          card.querySelector('.room-box-num > span')?.textContent?.trim(),
          Array.from(card.classList).filter(name => !['room-box', 'reservation-board-box', 'room-moved', 'is-bookable'].includes(name)).sort().join('|')
        ]));
        const rows = [];
        document.querySelectorAll('#boardChips .chip').forEach(chip => {
          const filter = chip.dataset.filter;
          setBoardFilter(filter);
          const active = document.querySelector(`#boardChips .chip[data-filter="${filter}"]`);
          const renderedCards = Array.from(document.querySelectorAll('.reservation-board-box'));
          const count = Number(active?.querySelector('.chip-count')?.textContent || 0);
          const stateMismatches = ['group', 'late', 'roommove'].includes(filter)
            ? renderedCards.map(card => {
                const room = card.querySelector('.room-box-num > span')?.textContent?.trim();
                const current = Array.from(card.classList).filter(name => !['room-box', 'reservation-board-box', 'room-moved', 'is-bookable'].includes(name)).sort().join('|');
                return snapshot.has(room) && snapshot.get(room) !== current ? { room, before: snapshot.get(room), current } : null;
              }).filter(Boolean)
            : [];
          rows.push({ filter, count, rendered: renderedCards.length, stateMismatches });
        });
        setBoardFilter('all');
        return rows;
      });
      const countMismatches = result.filter(row => row.count !== row.rendered);
      const stateMismatches = result.flatMap(row => row.stateMismatches.map(item => ({ filter: row.filter, ...item })));
      assert(countMismatches.length === 0, 'At least one reservation filter count differs from rendered cards.', countMismatches);
      assert(stateMismatches.length === 0, 'A reservation changed state class only because a filter was selected.', stateMismatches);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('STATE-010', 'Ancillary reference follows room move', 'Move an in-house reservation and verify its linked ancillary order follows the new room without changing reservation identity.', () =>
    withPage(browser, 'dashboard/frontdesk/reservation-board.html?proactive=linked-order', async state => {
      const { page } = state;
      await waitForBoard(page);
      await seedMoveScenario(page);
      const before = await seedLinkedAncillaryOrder(page);
      await moveReservation(page, '1202');
      const result = await page.evaluate(() => {
        const order = JSON.parse(localStorage.getItem('pms_ancillary_room_orders') || '[]').find(item => item.id === 'QA-MOVE-ORDER');
        const target = window.rooms.find(room => [room?.id, room?.roomId, room?.fullRoom, room?.roomNo, room?.number]
          .filter(Boolean).some(value => String(value).endsWith('1202')));
        return { order, targetId: target?.id || target?.roomId || target?.fullRoom || '', targetNo: target?.roomNo || target?.number || '1202' };
      });
      assert(result.order?.reservationId === 'QA-CHAIN-MOVE', 'Room move changed the linked order reservation identity.', { before, result });
      assert(String(result.order?.room || '').endsWith('1202') && String(result.order?.roomId || '').endsWith('1202'), 'Linked ancillary order remained on the previous room.', { before, result });
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('STATE-011', 'Folio reference follows room move', 'Move an in-house reservation and verify the directly linked folio points to the new room while keeping its folio and reservation identities.', () =>
    withPage(browser, 'dashboard/frontdesk/reservation-board.html?proactive=linked-folio', async state => {
      const { page } = state;
      await waitForBoard(page);
      await seedMoveScenario(page);
      await page.evaluate(async () => {
        await window.PmsMockApi.request('POST', '/folios', { body: {
          id: 'QA-MOVE-FOLIO',
          folioId: 'QA-MOVE-FOLIO',
          reservationId: 'QA-CHAIN-MOVE',
          room: '1201',
          roomNo: '1201',
          roomId: '1201',
          ownerName: 'Chain Move Guest',
          status: 'open',
          charges: [],
          payments: []
        } });
      });
      await moveReservation(page, '1202');
      const result = await page.evaluate(async () => {
        const envelope = await window.PmsMockApi.request('GET', '/folios');
        const folio = window.PmsMockApi.items(envelope).find(item => item.id === 'QA-MOVE-FOLIO' || item.folioId === 'QA-MOVE-FOLIO');
        return { folio };
      });
      assert(result.folio?.reservationId === 'QA-CHAIN-MOVE' && (result.folio?.folioId === 'QA-MOVE-FOLIO' || result.folio?.id === 'QA-MOVE-FOLIO'), 'Room move changed the linked folio identity.', result);
      assert(String(result.folio?.roomNo || '').endsWith('1202') && String(result.folio?.roomId || '').endsWith('1202'), 'Linked folio remained on the previous room.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('STATE-012', 'Expense deletion reverses cash withdrawal', 'Create a cash expense, delete it, and verify both the expense and its linked cash withdrawal are removed.', () =>
    withPage(browser, 'dashboard/operations/expense-purchases.html?proactive=delete-cash', async state => {
      const { page } = state;
      await page.waitForFunction(() => typeof openExpenseFormModal === 'function');
      const result = await page.evaluate(async () => {
        localStorage.setItem('pms_expense_purchases', '[]');
        localStorage.setItem('pms_expense_purchases_demo_version', '2026-07-demo-v2');
        localStorage.setItem('pms_night_audit_cash_sessions', '[]');
        renderExpenses();
        openExpenseFormModal();
        document.getElementById('expenseItem').value = 'QA Delete Cash Expense';
        document.getElementById('expenseVendor').value = 'QA Vendor';
        document.getElementById('expenseAmount').value = '333';
        document.getElementById('expenseMethod').value = 'cash';
        document.getElementById('expenseCurrency').value = 'PHP';
        saveExpensePurchase();
        const created = expenses().find(item => item.item === 'QA Delete Cash Expense');
        const withdrawalsBefore = readJson(CASH_SESSION_KEY, []).flatMap(item => item.withdrawals || []).filter(item => item.expenseId === created?.id);
        window.showConfirm = async () => true;
        await deleteExpensePurchase(created?.id);
        const withdrawalsAfter = readJson(CASH_SESSION_KEY, []).flatMap(item => item.withdrawals || []).filter(item => item.expenseId === created?.id);
        return {
          id: created?.id,
          rowsAfter: expenses().filter(item => item.id === created?.id).length,
          withdrawalsBefore,
          withdrawalsAfter,
          renderedRows: document.querySelectorAll('#expenseRows tr[data-expense-id]').length
        };
      });
      assert(result.id && result.withdrawalsBefore.length === 1, 'Cash expense did not create exactly one withdrawal before deletion.', result);
      assert(result.rowsAfter === 0 && result.withdrawalsAfter.length === 0, 'Deleting a cash expense left stale expense or withdrawal data.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('STATE-013', 'Expense currency edit clears previous bucket', 'Create a PHP expense, edit it to USD, and verify storage and KPI buckets no longer retain the previous PHP amount.', () =>
    withPage(browser, 'dashboard/operations/expense-purchases.html?proactive=currency-edit', async state => {
      const { page } = state;
      await page.waitForFunction(() => typeof openExpenseFormModal === 'function');
      const result = await page.evaluate(() => {
        localStorage.setItem('pms_expense_purchases', '[]');
        localStorage.setItem('pms_expense_purchases_demo_version', '2026-07-demo-v2');
        localStorage.setItem('pms_night_audit_cash_sessions', '[]');
        renderExpenses();
        openExpenseFormModal();
        document.getElementById('expenseItem').value = 'QA Currency Edit';
        document.getElementById('expenseVendor').value = 'QA Vendor';
        document.getElementById('expenseAmount').value = '444';
        document.getElementById('expenseMethod').value = 'card';
        document.getElementById('expenseCurrency').value = 'PHP';
        saveExpensePurchase();
        const created = expenses().find(item => item.item === 'QA Currency Edit');
        openExpenseFormModal(created.id);
        document.getElementById('expenseCurrency').value = 'USD';
        document.getElementById('expenseAmount').value = '55';
        saveExpensePurchase();
        const stored = expenses().find(item => item.id === created.id);
        const totals = expenses().reduce((map, item) => {
          const currency = String(item.currency || '').toUpperCase();
          map[currency] = (map[currency] || 0) + Number(item.amount || 0);
          return map;
        }, {});
        return { stored, totals, kpi: document.getElementById('expenseTotal')?.innerText || '' };
      });
      assert(result.stored?.currency === 'USD' && Number(result.stored?.amount) === 55 && Number(result.stored?.settlementAmount) === -55, 'Edited expense did not persist the new currency and amount.', result);
      assert(!result.totals.PHP && result.totals.USD === 55, 'The previous currency bucket retained the edited amount.', result);
      assert(/55/.test(result.kpi) && !/444/.test(result.kpi), 'Expense KPI retained the previous currency amount after edit.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('STATE-014', 'Malformed expense storage recovery', 'Open the expense page with malformed expense and cash-session storage and verify it recovers without runtime errors or destructive writes.', () =>
    withPage(browser, 'dashboard/operations/expense-purchases.html?proactive=malformed-storage', async state => {
      const { page } = state;
      const result = await page.evaluate(() => {
        localStorage.setItem('pms_expense_purchases', '{broken-json');
        localStorage.setItem('pms_night_audit_cash_sessions', '[broken-json');
        renderExpenses();
        return {
          rows: document.querySelectorAll('#expenseRows tr[data-expense-id]').length,
          expenseRaw: localStorage.getItem('pms_expense_purchases'),
          cashRaw: localStorage.getItem('pms_night_audit_cash_sessions')
        };
      });
      assert(result.rows === 0, 'Malformed expense storage rendered invalid rows.', result);
      assert(result.expenseRaw === '{broken-json' && result.cashRaw === '[broken-json', 'Read-only recovery silently overwrote malformed source data.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );
}

async function main() {
  const { browser, server } = await launch();
  const collector = createResultCollector(OUTPUT);
  try { await runCases(browser, collector); }
  finally {
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
  const report = collector.write({ suite: 'proactive-state-transitions' });
  console.log(JSON.stringify(report.summary));
  if (report.summary.failed) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
