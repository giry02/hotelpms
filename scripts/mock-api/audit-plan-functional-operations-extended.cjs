const path = require('path');
const { assert, launch, openPage, createResultCollector, cleanRuntimeErrors } = require('./plan-test-harness.cjs');

const OUTPUT = process.env.PMS_RESULT_FILE || path.resolve(__dirname, '..', '..', 'outputs', 'full-plan-20260719', '105-functional-operations-extended.json');

async function withPage(browser, route, callback, options = {}) {
  const state = await openPage(browser, route, { language: 'ko', ...options });
  state.page.setDefaultTimeout(15000);
  try { return await callback(state); } finally { await state.context.close(); }
}

async function wait(page, expression) {
  await page.waitForFunction(expression, null, { timeout: 15000 });
}

async function createMaintenance(page, marker) {
  await page.evaluate(() => openMaintModal());
  await page.locator('#newRequestModal.active').waitFor({ state: 'visible' });
  await page.locator('#newRoom').selectOption({ index: 1 });
  await page.locator('#newType').selectOption({ index: 1 });
  await page.locator('#newPriority').selectOption('high');
  await page.locator('#newAssignee').selectOption({ index: 1 });
  await page.locator('#newDesc').fill(marker);
  await page.locator('#maintenanceFormSubmit').click();
  await page.waitForTimeout(200);
  return page.evaluate(text => JSON.parse(localStorage.getItem('pms_maintenance') || '[]').find(item => item.desc === text), marker);
}

async function runCases(browser, collector) {
  await collector.run('HK-004', 'Reopen completed housekeeping task', 'Reopen a completed task and verify task/room/audit persistence.', () =>
    withPage(browser, 'dashboard/operations/housekeeping.html', async state => {
      const { page } = state;
      await wait(page, () => Array.isArray(tasks) && allRooms.length > 0);
      const result = await page.evaluate(async () => {
        window.confirm = () => true;
        const room = allRooms.find(item => item.status !== 'occupied') || allRooms[0];
        const task = createRoomCleanTask(room, 'checkout');
        task.status = 'clean';
        await window.PmsAPI.saveTasks(tasks);
        await reopenHousekeepingTask(task.id);
        const storedTasks = await window.PmsAPI.getTasks();
        const storedRooms = await window.PmsAPI.getAllRooms();
        const logs = JSON.parse(localStorage.getItem('pms_privacy_audit_logs') || '[]');
        const audit = logs.findLast?.(item => item.action === 'housekeeping.task.reopen');
        return {
          id: task.id,
          status: storedTasks.find(item => item.id === task.id)?.status,
          roomStatus: storedRooms.find(item => taskMatchesRoom(task, item))?.status,
          audit: Boolean(audit && audit.details?.room === task.room && audit.details?.status === 'dirty')
        };
      });
      assert(result.status === 'dirty' && /dirty/.test(result.roomStatus) && result.audit, 'Completed housekeeping task was not reopened consistently.', result);
      cleanRuntimeErrors(state); return result;
    })
  );

  await collector.run('HK-005', 'Edit housekeeping task', 'Open the task editor, change assignee/priority/note, save, and re-read storage.', () =>
    withPage(browser, 'dashboard/operations/housekeeping.html', async state => {
      const { page } = state;
      await wait(page, () => Array.isArray(tasks) && allRooms.length > 0);
      const id = await page.evaluate(() => createRoomCleanTask(allRooms[0], 'stayover').id);
      await page.evaluate(taskId => { switchView('list'); openHousekeepingTaskEditor(taskId); }, id);
      await page.locator('#hkTaskEditModal.active').waitFor({ state: 'visible' });
      await page.locator('#hkTaskAssignee').fill('QA Housekeeper');
      await page.locator('#hkTaskPriority').selectOption('urgent');
      await page.locator('#hkTaskNote').fill('QA edited note');
      await page.locator('#hkTaskEditSave').click();
      const stored = await page.evaluate(async taskId => (await window.PmsAPI.getTasks()).find(item => item.id === taskId), id);
      assert(stored?.assignee === 'QA Housekeeper' && stored.priority === true && stored.note === 'QA edited note', 'Housekeeping edit values were not persisted.', stored);
      cleanRuntimeErrors(state); return stored;
    })
  );

  await collector.run('HK-006', 'Delete housekeeping task with lifecycle guard', 'Delete pending task and verify active task deletion is blocked.', () =>
    withPage(browser, 'dashboard/operations/housekeeping.html', async state => {
      const { page } = state;
      await wait(page, () => allRooms.length > 0);
      const ids = await page.evaluate(() => {
        const pending = createRoomCleanTask(allRooms[0], 'checkout');
        const active = createRoomCleanTask(allRooms[1] || allRooms[0], 'stayover');
        active.status = 'inspect';
        return { pending: pending.id, active: active.id };
      });
      await page.evaluate(() => { window.confirm = () => true; });
      await page.evaluate(id => deleteHousekeepingTask(id), ids.pending);
      await page.evaluate(id => deleteHousekeepingTask(id), ids.active);
      const result = await page.evaluate(async ids => {
        const stored = await window.PmsAPI.getTasks();
        return { pendingExists: stored.some(item => item.id === ids.pending), activeExists: stored.some(item => item.id === ids.active) };
      }, ids);
      assert(!result.pendingExists && result.activeExists, 'Housekeeping delete guard or persistence failed.', result);
      cleanRuntimeErrors(state); return result;
    })
  );

  await collector.run('HK-008', 'Housekeeping filters and counts', 'Apply every status filter and compare rendered rows with task source.', () =>
    withPage(browser, 'dashboard/operations/housekeeping.html', async state => {
      const { page } = state;
      await wait(page, () => Array.isArray(tasks));
      const result = await page.evaluate(() => {
        switchView('list');
        return ['all', 'dirty', 'inspect', 'clean'].map(status => {
          const chip = document.querySelector(`.chip[data-status="${status}"]`) || document.querySelector('.chip');
          setFilter(chip, status);
          const expected = status === 'all' ? tasks.length : tasks.filter(item => item.status === status).length;
          return { status, expected, rendered: document.querySelectorAll('#taskList .hk-task').length };
        });
      });
      assert(result.every(row => row.expected === row.rendered), 'Housekeeping filter rendered counts do not match source.', result);
      cleanRuntimeErrors(state); return result;
    })
  );

  await collector.run('HK-009', 'Housekeeping priority localization and mobile stability', 'Open editor in KO/EN at mobile width and verify stable options and dimensions.', () =>
    withPage(browser, 'dashboard/operations/housekeeping.html', async state => {
      const { page } = state;
      await wait(page, () => allRooms.length > 0);
      const id = await page.evaluate(() => createRoomCleanTask(allRooms[0], 'checkout').id);
      await page.evaluate(id => openHousekeepingTaskEditor(id), id);
      const ko = await page.locator('#hkTaskPriority option').allTextContents();
      const before = await page.locator('#hkTaskPriority').boundingBox();
      await page.evaluate(() => { currentLang = 'en'; applyHousekeepingTaskEditorI18n(); });
      const en = await page.locator('#hkTaskPriority option').allTextContents();
      const after = await page.locator('#hkTaskPriority').boundingBox();
      assert(ko.join('|') === '일반|긴급' && en.join('|') === 'Normal|Urgent' && before.width === after.width, 'Priority select localization or stable sizing failed.', { ko, en, before, after });
      cleanRuntimeErrors(state); return { ko, en, width: before.width };
    }, { viewport: { width: 390, height: 844 } })
  );

  await collector.run('MAINT-002', 'Maintenance request blocks room sales', 'Register request and verify selected room becomes out of service.', () =>
    withPage(browser, 'dashboard/operations/maintenance.html', async state => {
      const { page } = state;
      await wait(page, () => Array.isArray(requests));
      const saved = await createMaintenance(page, 'QA room block');
      const room = await page.evaluate(async request => (await window.PmsAPI.getAllRooms()).find(item => String(item.id) === String(request.roomId) || String(item.roomNo) === String(request.room)), saved);
      assert(/out-of-service|oos|maintenance/.test(String(room?.status)), 'Maintenance registration did not block room sales.', { saved, room });
      cleanRuntimeErrors(state); return { requestId: saved.id, roomStatus: room.status };
    })
  );

  await collector.run('MAINT-005', 'Maintenance completion restores room', 'Complete request and verify prior room state is restored.', () =>
    withPage(browser, 'dashboard/operations/maintenance.html', async state => {
      const { page } = state;
      await wait(page, () => Array.isArray(requests));
      const saved = await createMaintenance(page, 'QA room restore');
      await page.evaluate(async id => { await changeStatus(id, 'in-progress'); await changeStatus(id, 'done'); }, saved.id);
      const result = await page.evaluate(async request => {
        const row = (await window.PmsAPI.getAllRooms()).find(item => String(item.id) === String(request.roomId) || String(item.roomNo) === String(request.room));
        return { status: row?.status, request: JSON.parse(localStorage.getItem('pms_maintenance') || '[]').find(item => item.id === request.id) };
      }, saved);
      assert(result.request?.status === 'done' && !/out-of-service|oos|maintenance/.test(String(result.status)), 'Maintenance completion did not restore room sale state.', result);
      cleanRuntimeErrors(state); return result;
    })
  );

  await collector.run('MAINT-006', 'Edit maintenance request', 'Edit open request through modal and verify fields persist.', () =>
    withPage(browser, 'dashboard/operations/maintenance.html', async state => {
      const { page } = state;
      await wait(page, () => Array.isArray(requests));
      const saved = await createMaintenance(page, 'QA before edit');
      await page.evaluate(id => openMaintenanceEditor(id), saved.id);
      await page.locator('#newRequestModal.active').waitFor({ state: 'visible' });
      await page.locator('#newDesc').fill('QA after edit');
      await page.locator('#newPriority').selectOption('urgent');
      await page.locator('#maintenanceFormSubmit').click();
      const stored = await page.evaluate(id => JSON.parse(localStorage.getItem('pms_maintenance') || '[]').find(item => item.id === id), saved.id);
      assert(stored?.desc === 'QA after edit' && stored.priority === 'urgent', 'Maintenance edit values were not persisted.', stored);
      cleanRuntimeErrors(state); return stored;
    })
  );

  await collector.run('MAINT-007', 'Delete maintenance request with lifecycle guard', 'Delete open request; verify active request cannot be deleted.', () =>
    withPage(browser, 'dashboard/operations/maintenance.html', async state => {
      const { page } = state;
      await wait(page, () => Array.isArray(requests));
      const removable = await createMaintenance(page, 'QA removable');
      const guarded = await createMaintenance(page, 'QA guarded');
      await page.evaluate(id => changeStatus(id, 'in-progress'), guarded.id);
      await page.evaluate(() => { window.confirm = () => true; });
      await page.evaluate(id => deleteMaintenanceRequest(id), removable.id);
      await page.evaluate(id => deleteMaintenanceRequest(id), guarded.id);
      const result = await page.evaluate(ids => {
        const stored = JSON.parse(localStorage.getItem('pms_maintenance') || '[]');
        return { removableExists: stored.some(item => item.id === ids.removable), guardedExists: stored.some(item => item.id === ids.guarded) };
      }, { removable: removable.id, guarded: guarded.id });
      assert(!result.removableExists && result.guardedExists, 'Maintenance delete guard or persistence failed.', result);
      cleanRuntimeErrors(state); return result;
    })
  );

  await collector.run('MAINT-008', 'Maintenance view parity', 'Compare Kanban and table rows/counts from same filtered source.', () =>
    withPage(browser, 'dashboard/operations/maintenance.html', async state => {
      const { page } = state;
      await wait(page, () => Array.isArray(requests));
      const result = await page.evaluate(() => {
        render();
        return { source: getFiltered().length, cards: document.querySelectorAll('.mt-ticket').length, rows: document.querySelectorAll('#mtTableBody tr').length };
      });
      assert(result.source === result.cards && result.source === result.rows, 'Maintenance Kanban/table counts differ.', result);
      cleanRuntimeErrors(state); return result;
    })
  );

  await collector.run('MAINT-009', 'Maintenance status and priority filters', 'Apply each status and urgent priority filter and compare source results.', () =>
    withPage(browser, 'dashboard/operations/maintenance.html', async state => {
      const { page } = state;
      await wait(page, () => Array.isArray(requests));
      const result = await page.evaluate(() => ['all', 'open', 'in-progress', 'done'].map(status => {
        currentStatusFilter = status; document.getElementById('priorityFilter').value = ''; render();
        return { status, expected: requests.filter(item => status === 'all' || item.status === status).length, actual: getFiltered().length };
      }));
      assert(result.every(row => row.expected === row.actual), 'Maintenance status filter counts differ.', result);
      cleanRuntimeErrors(state); return result;
    })
  );

  await collector.run('MAINT-011', 'Non-maintenance room regression', 'Block one room and verify another normal room remains available.', () =>
    withPage(browser, 'dashboard/operations/maintenance.html', async state => {
      const { page } = state;
      await wait(page, () => Array.isArray(requests));
      const before = await page.evaluate(async () => (await window.PmsAPI.getAllRooms()).map(item => ({ id: item.id, status: item.status })));
      const saved = await createMaintenance(page, 'QA isolated block');
      const after = await page.evaluate(async () => (await window.PmsAPI.getAllRooms()).map(item => ({ id: item.id, status: item.status })));
      const changed = after.filter(row => before.find(old => String(old.id) === String(row.id))?.status !== row.status);
      assert(changed.length === 1 && (String(changed[0].id) === String(saved.roomId) || String(changed[0].id).endsWith(String(saved.room))), 'Maintenance request changed unrelated rooms.', { saved, changed });
      cleanRuntimeErrors(state); return { requestId: saved.id, changed };
    })
  );
}

async function main() {
  const { browser, server } = await launch();
  const collector = createResultCollector(OUTPUT);
  try { await runCases(browser, collector); }
  finally {
    const report = collector.write({ suite: 'functional-operations-extended' });
    await browser.close(); if (server) await new Promise(resolve => server.close(resolve));
    process.stdout.write(`${JSON.stringify(report.summary)}\n`);
    if (report.summary.failed) process.exitCode = 1;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
