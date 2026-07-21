const path = require('path');
const {
  assert,
  launch,
  openPage,
  createResultCollector,
  cleanRuntimeErrors
} = require('./plan-test-harness.cjs');

const OUTPUT = process.env.PMS_RESULT_FILE || path.resolve(
  __dirname, '..', '..', 'outputs', 'full-plan-20260719', '104-functional-operations.json'
);

async function withPage(browser, route, callback, options = {}) {
  const state = await openPage(browser, route, { language: 'ko', ...options });
  state.page.setDefaultTimeout(15000);
  try { return await callback(state); } finally { await state.context.close(); }
}

async function confirm(page) {
  const modal = page.locator('#pms-confirm-modal.active');
  if (await modal.isVisible().catch(() => false)) {
    await page.locator('#pms-confirm-ok').click();
    await modal.waitFor({ state: 'hidden' });
  }
}

async function waitForGlobal(page, expression) {
  await page.waitForFunction(expression, null, { timeout: 15000 });
}

async function runCases(browser, collector) {
  await collector.run('HK-001', 'Create housekeeping task', 'Create a cleaning task for a room and verify the task is persisted.', () =>
    withPage(browser, 'dashboard/operations/housekeeping.html', async state => {
      const { page } = state;
      await waitForGlobal(page, () => Array.isArray(tasks) && Array.isArray(allRooms) && allRooms.length > 0);
      const saved = await page.evaluate(async () => {
        const room = allRooms.find(item => !findActiveTaskForRoom(item));
        if (!room) throw new Error('No room without an active housekeeping task');
        const task = createRoomCleanTask(room, 'stayover');
        await window.PmsAPI?.saveTasks?.(tasks);
        const stored = await window.PmsAPI?.getTasks?.();
        return { id: task.id, room: displayRoomNo(room), stored: stored?.some(item => item.id === task.id) };
      });
      assert(saved.stored, 'The new housekeeping task was not persisted.', saved);
      cleanRuntimeErrors(state);
      return saved;
    })
  );

  await collector.run('HK-002', 'Start housekeeping task', 'Move a pending task into inspection and verify persisted state.', () =>
    withPage(browser, 'dashboard/operations/housekeeping.html', async state => {
      const { page } = state;
      await waitForGlobal(page, () => Array.isArray(tasks) && tasks.length > 0);
      const changed = await page.evaluate(async () => {
        let task = tasks.find(item => !['inspect', 'clean'].includes(normalizeHousekeepingStatus(item.status)));
        if (!task) {
          const room = allRooms[0];
          task = createRoomCleanTask(room, 'stayover');
        }
        completeTask(task.id, 'inspect');
        await new Promise(resolve => setTimeout(resolve, 250));
        const stored = await window.PmsAPI?.getTasks?.();
        return { id: task.id, status: task.status, storedStatus: stored?.find(item => item.id === task.id)?.status };
      });
      assert(normalize(changed.status) === 'inspect' && normalize(changed.storedStatus) === 'inspect', 'Housekeeping task did not persist inspection state.', changed);
      cleanRuntimeErrors(state);
      return changed;
    })
  );

  await collector.run('HK-003', 'Complete housekeeping inspection', 'Complete an inspection through maintenance and verify task and room are clean.', () =>
    withPage(browser, 'dashboard/operations/maintenance.html', async state => {
      const { page } = state;
      await waitForGlobal(page, () => Array.isArray(requests));
      const result = await page.evaluate(async () => {
        const room = (await window.PmsAPI.getAllRooms()).find(item => item.status !== 'occupied') || (await window.PmsAPI.getAllRooms())[0];
        const task = {
          id: `HK-QA-${Date.now()}`, roomId: room.id, room: room.id, roomNo: room.id,
          type: 'checkout', status: 'inspect', assignee: 'QA', priority: 'normal', note: 'QA inspection'
        };
        const current = await window.PmsAPI.getTasks();
        await window.PmsAPI.saveTasks([task, ...current]);
        await loadMaintenanceRequests();
        const request = requests.find(item => item.id === `HK-INSPECT-${task.id}` || item.taskId === task.id);
        if (!request) throw new Error('Inspection request was not generated');
        await changeStatus(request.id, 'done');
        const storedTasks = await window.PmsAPI.getTasks();
        const storedRooms = await window.PmsAPI.getAllRooms();
        return {
          requestId: request.id,
          taskStatus: storedTasks.find(item => item.id === task.id)?.status,
          roomStatus: storedRooms.find(item => String(item.id) === String(room.id))?.status
        };
      });
      assert(normalize(result.taskStatus) === 'clean', 'Inspection completion did not mark the housekeeping task clean.', result);
      assert(/clean|vacantclean/.test(normalize(result.roomStatus)), 'Inspection completion did not restore a clean room status.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('HK-007', 'Housekeeping view parity', 'Switch between Kanban and table and verify task counts stay equal.', () =>
    withPage(browser, 'dashboard/operations/housekeeping.html', async state => {
      const { page } = state;
      await waitForGlobal(page, () => Array.isArray(tasks));
      const result = await page.evaluate(() => {
        renderAllViews();
        const before = tasks.length;
        switchView('list');
        const listRows = document.querySelectorAll('#taskList .hk-task').length;
        switchView('grid');
        return { tasks: before, listRows, view: currentView };
      });
      assert(result.listRows === result.tasks, 'Housekeeping list and source task counts differ.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('MAINT-001', 'Create maintenance request', 'Register a request and verify all form values in persistent storage.', () =>
    withPage(browser, 'dashboard/operations/maintenance.html', async state => {
      const { page } = state;
      await waitForGlobal(page, () => Array.isArray(requests));
      await page.evaluate(() => openMaintModal());
      await page.locator('#newRequestModal.active').waitFor({ state: 'visible' });
      await page.locator('#newRoom').selectOption({ index: 1 });
      await page.locator('#newType').selectOption({ index: 1 });
      await page.locator('#newPriority').selectOption('high');
      await page.locator('#newAssignee').selectOption({ index: 1 });
      await page.locator('#newDesc').fill('QA maintenance registration');
      await page.evaluate(() => addTicket());
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pms_maintenance') || '[]').find(item => item.desc === 'QA maintenance registration'));
      assert(saved?.room && saved.priority === 'high' && saved.status === 'open', 'Maintenance request fields did not persist.', saved);
      cleanRuntimeErrors(state);
      return saved;
    })
  );

  await collector.run('MAINT-003', 'Maintenance start state', 'Start a stored maintenance request and verify persisted state.', () =>
    withPage(browser, 'dashboard/operations/maintenance.html', async state => {
      const { page } = state;
      await waitForGlobal(page, () => Array.isArray(requests) && requests.length > 0);
      const result = await page.evaluate(async () => {
        const request = requests.find(item => item.status === 'open' && !isHousekeepingInspectionRequest(item));
        if (!request) throw new Error('No open maintenance request');
        await changeStatus(request.id, 'in-progress');
        const stored = JSON.parse(localStorage.getItem('pms_maintenance') || '[]').find(item => item.id === request.id);
        return { id: request.id, status: request.status, storedStatus: stored?.status, startedAt: stored?.startedAt };
      });
      assert(result.status === 'in-progress' && result.storedStatus === 'in-progress' && result.startedAt, 'Maintenance start state was not persisted.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('MAINT-004', 'Maintenance completion state', 'Complete an in-progress request and verify completion timestamp and persistence.', () =>
    withPage(browser, 'dashboard/operations/maintenance.html', async state => {
      const { page } = state;
      await waitForGlobal(page, () => Array.isArray(requests) && requests.length > 0);
      const result = await page.evaluate(async () => {
        let request = requests.find(item => item.status === 'in-progress' && !isHousekeepingInspectionRequest(item));
        if (!request) {
          request = requests.find(item => !isHousekeepingInspectionRequest(item));
          request.status = 'in-progress';
        }
        await changeStatus(request.id, 'done');
        const stored = JSON.parse(localStorage.getItem('pms_maintenance') || '[]').find(item => item.id === request.id);
        return { id: request.id, status: request.status, storedStatus: stored?.status, completedAt: stored?.completedAt };
      });
      assert(result.status === 'done' && result.storedStatus === 'done' && result.completedAt, 'Maintenance completion did not persist.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('ANC-001', 'Ancillary in-house room guard', 'Verify every displayed room has an assigned in-house guest.', () =>
    withPage(browser, 'dashboard/operations/ancillary.html', async state => {
      const { page } = state;
      await waitForGlobal(page, () => Array.isArray(rooms) && Array.isArray(reservations) && rooms.length > 0);
      const result = await page.evaluate(() => {
        renderAncillaryBoard();
        const shown = [...document.querySelectorAll('.service-room-card')].map(card => card.getAttribute('onclick') || '');
        const invalid = rooms.filter(room => shown.some(text => text.includes(String(room.id)))).filter(room => !canRegisterServiceForRoom(room));
        return { shown: shown.length, invalid: invalid.map(room => room.id) };
      });
      assert(result.invalid.length === 0, 'Ancillary board displayed rooms without a valid in-house guest.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('ANC-005', 'Create ancillary POS order', 'Register a POS item for an in-house guest and verify persisted order fields.', () =>
    withPage(browser, 'dashboard/operations/ancillary.html', async state => {
      const { page } = state;
      await waitForGlobal(page, () => Array.isArray(rooms) && rooms.some(canRegisterServiceForRoom));
      const result = await page.evaluate(() => {
        const room = rooms.find(canRegisterServiceForRoom);
        prepareServiceRegistration(room.id);
        selectServiceType('pos');
        const vendor = document.getElementById('serviceVendor');
        const item = document.getElementById('serviceItem');
        if (!vendor.value) vendor.value = [...vendor.options].find(option => option.value)?.value || '';
        renderServiceItems();
        item.value = [...item.options].find(option => option.value)?.value || '';
        handleServiceItemChange();
        document.getElementById('serviceQty').value = '2';
        document.getElementById('serviceUnitPrice').value = '123';
        document.getElementById('serviceMemo').value = 'QA POS order';
        saveServiceOrder();
        const order = serviceOrders.find(row => row.memo === 'QA POS order');
        return { id: order?.id, roomId: order?.roomId, service: order?.service, qty: order?.qty, total: order?.total, status: order?.status };
      });
      assert(result.id && result.service === 'pos' && Number(result.qty) === 2 && Number(result.total) > 0, 'POS ancillary order did not persist correctly.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('ANC-011', 'Ancillary status lifecycle', 'Move a pending order through accepted and completed states.', () =>
    withPage(browser, 'dashboard/operations/ancillary.html', async state => {
      const { page } = state;
      await waitForGlobal(page, () => Array.isArray(serviceOrders) && serviceOrders.length > 0);
      const result = await page.evaluate(() => {
        const order = serviceOrders.find(item => effectiveOrderStatus(item) === 'pending') || serviceOrders[0];
        order.status = 'pending'; persistOrders();
        updateServiceOrderStatus(order.id, 'accepted');
        const accepted = effectiveOrderStatus(order);
        updateServiceOrderStatus(order.id, 'completed');
        return { id: order.id, accepted, completed: effectiveOrderStatus(order), stored: JSON.parse(localStorage.getItem(ORDER_STORAGE) || '[]').find(item => item.id === order.id)?.status };
      });
      assert(result.accepted === 'accepted' && result.completed === 'completed' && result.stored === 'completed', 'Ancillary status lifecycle did not persist.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('ANC-012', 'Reopen ancillary order', 'Reopen a completed order and verify accepted state, action and audit log survive storage reload.', () =>
    withPage(browser, 'dashboard/operations/ancillary.html', async state => {
      const { page } = state;
      const result = await page.evaluate(() => {
        localStorage.setItem('currentUserRole', 'sys_admin');
        window.currentUserRole = 'sys_admin';
        const order = serviceOrders[0];
        order.status = 'completed'; persistOrders();
        updateServiceOrderStatus(order.id, 'accepted');
        const stored = JSON.parse(localStorage.getItem(ORDER_STORAGE) || '[]').find(item => item.id === order.id);
        const audits = JSON.parse(localStorage.getItem('pms_privacy_audit_logs') || '[]');
        return {
          id: order.id,
          status: effectiveOrderStatus(order),
          storedStatus: stored?.status,
          actionText: serviceOrderActionButtons(order),
          audit: audits.find(item => item.action === 'ancillary.order.reopen' && String(item.details?.orderId || '') === String(order.id)) || null
        };
      });
      assert(result.status === 'accepted' && result.storedStatus === 'accepted', 'Reopened ancillary status was not persisted.', result);
      assert(/completed|완료/.test(result.actionText), 'Reopened order did not return to a complete action.', result.actionText);
      assert(result.audit, 'Ancillary reopen audit log was not written.', result);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await waitForGlobal(page, () => Array.isArray(serviceOrders) && serviceOrders.length > 0);
      const reloaded = await page.evaluate(id => effectiveOrderStatus(serviceOrders.find(item => item.id === id)), result.id);
      assert(reloaded === 'accepted', 'Ancillary reopen state was lost after reload.', { reloaded, result });
      cleanRuntimeErrors(state);
      return { ...result, reloaded };
    })
  );

  await collector.run('SETTLE-STATUS-004', 'Complete settlement without opening detail', 'Complete a zero-balance folio from the list path and verify no modal opens.', () =>
    withPage(browser, 'dashboard/operations/settlement-status.html', async state => {
      const { page } = state;
      await waitForGlobal(page, () => Array.isArray(settlementState.folios) && settlementState.folios.length > 0);
      const result = await page.evaluate(async () => {
        const folio = settlementState.folios.find(item => Number(item.balance || 0) <= 0 && !item.settlementCompleted);
        if (!folio) throw new Error('No incomplete zero-balance folio');
        const id = folio.folioId || folio.id;
        const ok = await completeSettlementStatusFolio(id, { skipConfirm: true, openDetail: false });
        return { id, ok, modalOpen: document.getElementById('settlementStatusDetailModal').classList.contains('active'), stored: settlementCompletionRecords().some(item => item.folioId === id) };
      });
      assert(result.ok && result.stored && !result.modalOpen, 'List completion opened detail or failed to persist.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('SETTLE-STATUS-007', 'Reopen settlement with audit', 'Reopen a completed folio and verify completion removal, reopened state and audit record.', () =>
    withPage(browser, 'dashboard/operations/settlement-status.html', async state => {
      const { page } = state;
      await waitForGlobal(page, () => Array.isArray(settlementState.folios) && settlementState.folios.length > 0);
      const result = await page.evaluate(async () => {
        localStorage.setItem('currentUserRole', 'sys_admin'); window.currentUserRole = 'sys_admin';
        const folio = settlementState.folios.find(item => Number(item.balance || 0) <= 0) || settlementState.folios[0];
        const id = folio.folioId || folio.id;
        if (!settlementCompletionRecords().some(item => item.folioId === id)) {
          await completeSettlementStatusFolio(id, { skipConfirm: true, openDetail: false });
        }
        window.showConfirm = async () => true;
        await reopenSettlementStatusFolio(id);
        const audits = JSON.parse(localStorage.getItem('pms_privacy_audit_logs') || '[]');
        return {
          id,
          completionExists: settlementCompletionRecords().some(item => item.folioId === id),
          reopenExists: settlementReopenRecords().some(item => item.folioId === id),
          audit: audits.find(item => item.action === 'folio.settlement.reopen' && String(item.details?.folioId || '') === String(id)) || null
        };
      });
      assert(!result.completionExists && result.reopenExists && result.audit, 'Settlement reopen state or audit did not persist.', result);
      cleanRuntimeErrors(state);
      return result;
    })
  );

  await collector.run('EXP-004', 'Cash expense lifecycle', 'Create, edit and delete a cash expense and verify list and cash-session synchronization.', () =>
    withPage(browser, 'dashboard/operations/expense-purchases.html', async state => {
      const { page } = state;
      await waitForGlobal(page, () => typeof openExpenseFormModal === 'function');
      const created = await page.evaluate(() => {
        openExpenseFormModal();
        document.getElementById('expenseItem').value = 'QA Cash Expense';
        document.getElementById('expenseVendor').value = 'QA Vendor';
        document.getElementById('expenseAmount').value = '321';
        document.getElementById('expenseMethod').value = 'cash';
        document.getElementById('expenseCurrency').value = 'PHP';
        document.getElementById('expenseNote').value = 'create';
        saveExpensePurchase();
        const row = expenses().find(item => item.item === 'QA Cash Expense');
        const sessions = readJson(CASH_SESSION_KEY, []);
        return { row, cash: sessions.flatMap(item => item.withdrawals || []).find(item => item.expenseId === row?.id) };
      });
      assert(created.row?.id && created.cash && Number(created.cash.amount) === 321, 'Cash expense creation did not synchronize cash withdrawal.', created);
      const edited = await page.evaluate(id => {
        openExpenseFormModal(id);
        document.getElementById('expenseAmount').value = '654';
        document.getElementById('expenseNote').value = 'updated';
        saveExpensePurchase();
        const sessions = readJson(CASH_SESSION_KEY, []);
        return { row: expenses().find(item => item.id === id), cash: sessions.flatMap(item => item.withdrawals || []).find(item => item.expenseId === id) };
      }, created.row.id);
      assert(Number(edited.row?.amount) === 654 && edited.row?.note === 'updated' && Number(edited.cash?.amount) === 654, 'Expense edit did not persist or resync cash.', edited);
      await page.evaluate(() => { window.showConfirm = async () => true; });
      await page.evaluate(id => deleteExpensePurchase(id), created.row.id);
      await page.waitForTimeout(150);
      const deleted = await page.evaluate(id => ({
        row: expenses().find(item => item.id === id),
        cash: readJson(CASH_SESSION_KEY, []).flatMap(item => item.withdrawals || []).find(item => item.expenseId === id)
      }), created.row.id);
      assert(!deleted.row && !deleted.cash, 'Expense delete did not remove list/cash records.', deleted);
      cleanRuntimeErrors(state);
      return { created: created.row.id, editedAmount: edited.row.amount, deleted: true };
    })
  );
}

function normalize(value) {
  return String(value || '').replace(/[-_\s]/g, '').toLowerCase();
}

async function main() {
  const { browser, server } = await launch();
  const collector = createResultCollector(OUTPUT);
  try { await runCases(browser, collector); }
  finally {
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
  const report = collector.write({ suite: 'functional-operations' });
  console.log(JSON.stringify(report.summary));
  if (report.summary.failed) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
