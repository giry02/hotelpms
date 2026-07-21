const path = require('path');
const {
  assert,
  launch,
  openPage,
  createResultCollector,
  cleanRuntimeErrors
} = require('./plan-test-harness.cjs');

const OUTPUT = process.env.PMS_RESULT_FILE || path.resolve(
  __dirname, '..', '..', 'outputs', 'full-plan-20260719', '103-functional-groups-rooms.json'
);

async function withPage(browser, route, callback, options = {}) {
  const state = await openPage(browser, route, { language: 'ko', ...options });
  state.page.setDefaultTimeout(12000);
  try { return await callback(state); } finally { await state.context.close(); }
}

async function acceptConfirm(page) {
  const modal = page.locator('#pms-confirm-modal.active');
  await modal.waitFor({ state: 'visible' });
  const message = (await page.locator('#pms-confirm-message').innerText()).trim();
  await page.locator('#pms-confirm-ok').click();
  await modal.waitFor({ state: 'hidden' });
  return message;
}

async function waitGroup(page) {
  await page.waitForFunction(() => typeof group === 'object' && group && group.id && typeof window.saveBasicInfo === 'function');
  await page.waitForSelector('#detailName');
}

async function runCases(browser, collector) {
  await collector.run('GRP-DETAIL-002', 'Group basic information persistence', 'Edit the event name, dates, headcount and discount; save and verify the stored group.', () =>
    withPage(browser, 'dashboard/frontdesk/groups_block_detail.html?id=GRP-DEMO-0708-SAMSUNG', async state => {
      const { page } = state;
      await waitGroup(page);
      const companyId = await page.locator('#detailAgencyId').inputValue();
      assert(companyId, 'The linked company was not loaded.');
      await page.locator('#detailName').fill('Samsung QA Event');
      await page.locator('#detailCheckin').fill('2026-07-20');
      await page.locator('#detailCheckout').fill('2026-07-23');
      await page.locator('#detailPax').fill('18');
      await page.locator('#detailEventDiscount').fill('12');
      await page.evaluate(() => window.saveBasicInfo());
      const saved = await page.evaluate(() => ({
        name: group.name, checkin: group.checkin, checkout: group.checkout,
        pax: group.pax, discount: group.eventDiscountPercent,
        stored: JSON.parse(localStorage.getItem('pms_groups') || '[]').find(item => item.id === group.id)
      }));
      assert(saved.name === 'Samsung QA Event' && saved.checkin === '2026-07-20' && saved.checkout === '2026-07-23', 'Edited group fields did not persist.', saved);
      assert(saved.pax === 18 && saved.discount === 12, 'Headcount or discount did not persist.', saved);
      assert(saved.stored?.name === 'Samsung QA Event', 'Stored group was not updated.', saved.stored);
      cleanRuntimeErrors(state);
      return saved;
    })
  );

  await collector.run('GRP-COMP-011', 'Group date validation', 'Enter a checkout date before check-in and verify that saving is rejected.', () =>
    withPage(browser, 'dashboard/frontdesk/groups_block_detail.html?id=GRP-DEMO-0708-SAMSUNG', async state => {
      const { page } = state;
      await waitGroup(page);
      const before = await page.evaluate(() => ({ checkin: group.checkin, checkout: group.checkout }));
      await page.locator('#detailCheckin').fill('2026-07-25');
      await page.locator('#detailCheckout').fill('2026-07-24');
      await page.evaluate(() => window.saveBasicInfo());
      const after = await page.evaluate(() => ({ checkin: group.checkin, checkout: group.checkout }));
      assert(after.checkin === before.checkin && after.checkout === before.checkout, 'Reversed dates changed the group.', { before, after });
      cleanRuntimeErrors(state);
      return { before, after };
    })
  );

  await collector.run('GRP-DETAIL-005', 'Room allocation persistence', 'Add two available rooms, save the allocation, and verify rates and storage.', () =>
    withPage(browser, 'dashboard/frontdesk/groups_block_detail.html?id=GRP-DEMO-0708-SAMSUNG', async state => {
      const { page } = state;
      await waitGroup(page);
      await page.evaluate(() => {
        group.roomAllocations = [];
        group.allocations = [];
        renderAll();
        switchTabById('rooms');
        window.addDetailAllocationRow();
        window.addDetailAllocationRow();
      });
      const selects = () => page.locator('.allocation-editor-row .detail-room');
      assert(await selects().count() === 2, 'Allocation rows were not added.');
      const firstChoice = await selects().nth(0).locator('option:not([disabled])').evaluateAll(options =>
        options.map(option => option.value).find(Boolean) || ''
      );
      assert(firstChoice, 'The first allocation row has no available room.');
      await selects().nth(0).selectOption(firstChoice);
      await page.waitForTimeout(100);
      const secondChoice = await selects().nth(1).locator('option:not([disabled])').evaluateAll((options, excluded) =>
        options.map(option => option.value).find(value => value && value !== excluded) || '',
        firstChoice
      );
      assert(secondChoice, 'The second allocation row has no available room after the first selection.', { firstChoice });
      await selects().nth(1).selectOption(secondChoice);
      await page.locator('.allocation-editor-row .detail-final-rate').nth(0).fill('500');
      await page.locator('.allocation-editor-row .detail-final-rate').nth(1).fill('600');
      await page.evaluate(() => window.saveRoomAllocationsFromDetail());
      if (await page.locator('#pms-confirm-modal.active').count()) await acceptConfirm(page);
      await page.waitForTimeout(250);
      const saved = await page.evaluate(() => ({
        allocations: (group.roomAllocations || []).map(item => ({ roomId: item.roomId, rate: Number(item.rate || item.finalRate || 0) })),
        stored: (JSON.parse(localStorage.getItem('pms_groups') || '[]').find(item => item.id === group.id)?.roomAllocations || []).length
      }));
      assert(saved.allocations.length === 2 && saved.stored === 2, 'Room allocations did not persist.', saved);
      assert(saved.allocations.map(item => item.roomId).every((id, index, list) => id && list.indexOf(id) === index), 'Duplicate/empty room allocation was saved.', saved);
      cleanRuntimeErrors(state);
      return saved;
    })
  );

  for (const [id, role, name] of [
    ['GRP-DETAIL-007', 'primary', 'QA Primary Guest'],
    ['GRP-DETAIL-008', 'companion', 'QA Companion Guest']
  ]) {
    await collector.run(id, `${role} rooming guest persistence`, 'Open the rooming guest modal, enter a guest, save, and verify the group rooming list.', () =>
      withPage(browser, 'dashboard/frontdesk/groups_block_detail.html?id=GRP-DEMO-0708-SAMSUNG', async state => {
        const { page } = state;
        await waitGroup(page);
        const roomId = await page.evaluate(() => {
          const allocation = (group.roomAllocations || group.allocations || [])[0];
          if (allocation) return allocation.roomId;
          const room = (rooms || []).find(item => item.status !== 'maintenance' && item.status !== 'out-of-service');
          group.roomAllocations = [{ roomId: room.id, rate: 500, baseRate: 500, discountPercent: 0 }];
          group.allocations = group.roomAllocations;
          saveGroup(); renderAll();
          return room.id;
        });
        await page.evaluate(({ roomId, role }) => window.openRoomingModal(roomId, '', role), { roomId, role });
        await page.locator('#roomingModal.active').waitFor({ state: 'visible' });
        await page.evaluate(({ name }) => {
          const nameInput = document.getElementById('nrGuestRooming') || document.getElementById('guestNameInput');
          const phoneInput = document.getElementById('nrPhoneRooming');
          if (nameInput) nameInput.value = name;
          if (phoneInput) phoneInput.value = '+84 90 7777 1000';
        }, { name });
        await page.locator('#guestRoleInput').selectOption(role);
        await page.evaluate(() => window.saveRoomingGuest());
        await page.waitForFunction(expected => (group.roomingList || []).some(item => item.name === expected), name);
        const saved = await page.evaluate(expected => (group.roomingList || []).find(item => item.name === expected), name);
        assert(saved?.role === role && saved.roomId === roomId, 'Rooming guest role/room did not persist.', saved);
        cleanRuntimeErrors(state);
        return saved;
      })
    );
  }

  await collector.run('GRP-DETAIL-009', 'Rooming guest edit and delete', 'Edit a stored companion and then delete it after confirmation.', () =>
    withPage(browser, 'dashboard/frontdesk/groups_block_detail.html?id=GRP-DEMO-0708-SAMSUNG', async state => {
      const { page } = state;
      await waitGroup(page);
      const seed = await page.evaluate(() => {
        let roomId = (group.roomAllocations || group.allocations || [])[0]?.roomId || '';
        if (!roomId) {
          roomId = rooms[0].id;
          group.roomAllocations = [{ roomId, baseRate: 500, rate: 500, finalRate: 500, discountPercent: 0 }];
          group.allocations = group.roomAllocations;
        }
        const guest = { id: 'QA-RM-EDIT', guestId: 'QA-RM-EDIT', name: 'Before Edit', phone: '+84 90 1111 2222', roomId, role: 'companion', docStatus: 'pending' };
        group.roomingList = [guest]; saveGroup(); renderAll(); return guest;
      });
      await page.evaluate(guest => window.openRoomingModal(guest.roomId, guest.id, 'companion'), seed);
      await page.locator('#roomingModal.active').waitFor({ state: 'visible' });
      const editState = await page.evaluate(() => {
        const noteInput = document.getElementById('guestNoteInput');
        if (noteInput) noteInput.value = 'QA edited note';
        return {
          editId: document.getElementById('guestEditId')?.value || '',
          roomId: document.getElementById('guestRoomInput')?.value || '',
          role: document.getElementById('guestRoleInput')?.value || '',
          name: document.getElementById('nrGuestRooming')?.value || ''
        };
      });
      assert(editState.editId === 'QA-RM-EDIT', 'The rooming edit modal did not retain the guest identifier.', editState);
      await page.evaluate(() => window.saveRoomingGuest());
      const edited = await page.evaluate(() => (group.roomingList || []).find(item => item.id === 'QA-RM-EDIT'));
      assert(edited?.note === 'QA edited note', 'The edited rooming guest note did not persist.', { editState, edited });
      const removing = page.evaluate(() => window.removeRoomingGuest('QA-RM-EDIT'));
      await acceptConfirm(page);
      await removing;
      const remaining = await page.evaluate(() => (group.roomingList || []).filter(item => item.id === 'QA-RM-EDIT'));
      assert(remaining.length === 0, 'Deleted rooming guest remained in storage.', remaining);
      cleanRuntimeErrors(state);
      return { edited: true, deleted: true };
    })
  );

  await collector.run('GRP-COMP-005', 'Linked company deletion guard', 'Attempt to delete a company with linked events and verify the company remains.', () =>
    withPage(browser, 'dashboard/frontdesk/groups_companies.html', async state => {
      const { page } = state;
      await page.waitForFunction(() => Array.isArray(companies) && companies.length > 0);
      const linked = await page.evaluate(() => companies.find(company => window.companyDeleteGuard?.(company)?.locked)?.id || companies[0].id);
      const before = await page.evaluate(id => companies.some(item => item.id === id), linked);
      await page.evaluate(id => window.deleteCompany(id), linked);
      await page.waitForTimeout(150);
      if (await page.locator('#pms-confirm-modal.active').count()) await acceptConfirm(page);
      const after = await page.evaluate(id => companies.some(item => item.id === id), linked);
      assert(before && after, 'A linked company was deleted.', { linked, before, after });
      cleanRuntimeErrors(state);
      return { linked, guarded: true };
    })
  );

  await collector.run('ROOM-SETUP-003', 'In-use room type deletion guard', 'Attempt to delete an in-use room type and verify no deletion.', () =>
    withPage(browser, 'dashboard/operations/room-setup.html', async state => {
      const { page } = state;
      await page.waitForFunction(() => Array.isArray(allRoomTypes) && allRoomTypes.length > 0 && Array.isArray(allRooms));
      const index = await page.evaluate(() => allRoomTypes.findIndex(type => allRooms.some(room => room.type === type.id || room.type === type.name)));
      assert(index >= 0, 'No in-use room type fixture exists.');
      const before = await page.evaluate(() => allRoomTypes.length);
      await page.evaluate(index => window.deleteRoomType(index), index);
      await page.waitForTimeout(150);
      const after = await page.evaluate(() => allRoomTypes.length);
      assert(after === before, 'An in-use room type was deleted.', { before, after, index });
      cleanRuntimeErrors(state);
      return { index, before, after };
    })
  );

  await collector.run('ROOM-SETUP-005', 'Duplicate room number validation', 'Try to register an existing room number and verify no duplicate is created.', () =>
    withPage(browser, 'dashboard/operations/room-setup.html', async state => {
      const { page } = state;
      await page.waitForFunction(() => Array.isArray(allRooms) && allRooms.length > 0);
      const existing = await page.evaluate(() => allRooms[0]);
      await page.evaluate(room => {
        editingIdx = -1;
        document.getElementById('addRoomId').value = room.id;
        document.getElementById('addRoomFloor').value = String(room.floor || 1);
        setRoomTypeSelectValue(room.type);
        document.getElementById('addRoomBuilding').value = room.building || '';
      }, existing);
      const before = await page.evaluate(id => allRooms.filter(room => room.id === id).length, existing.id);
      await page.evaluate(() => window.saveRoom());
      await page.waitForTimeout(200);
      const after = await page.evaluate(id => allRooms.filter(room => room.id === id).length, existing.id);
      assert(after === before, 'Duplicate room number was created.', { room: existing.id, before, after });
      cleanRuntimeErrors(state);
      return { room: existing.id, before, after };
    })
  );

  await collector.run('ROOMS-003', 'Room operational status persistence', 'Change a vacant room to maintenance and back, checking storage and UI.', () =>
    withPage(browser, 'dashboard/operations/rooms.html', async state => {
      const { page } = state;
      await page.waitForFunction(() => Array.isArray(allRooms) && allRooms.length > 0);
      const room = await page.evaluate(() => allRooms.find(item => item.status !== 'occupied') || allRooms[0]);
      await page.evaluate(room => window.openStatusModal(room.id, room.status), room);
      await page.locator('#statusChangeModal.active').waitFor({ state: 'visible' });
      await page.locator('input[name="newRoomStatus"][value="oos"]').check();
      await page.evaluate(() => window.saveStatusChange());
      const maintenance = await page.evaluate(id => allRooms.find(item => item.id === id)?.status, room.id);
      assert(maintenance === 'oos', 'Out-of-service status was not saved.', maintenance);
      await page.evaluate(id => window.openStatusModal(id, 'oos'), room.id);
      await page.locator('input[name="newRoomStatus"][value="vacant-clean"]').check();
      await page.evaluate(() => window.saveStatusChange());
      const restored = await page.evaluate(id => allRooms.find(item => item.id === id)?.status, room.id);
      assert(restored === 'vacant-clean', 'Room sale status was not restored.', restored);
      cleanRuntimeErrors(state);
      return { room: room.id, maintenance, restored };
    })
  );

  await collector.run('RATE-001', 'Rate calendar month navigation', 'Change month and verify the selector, calendar rows and data month stay aligned.', () =>
    withPage(browser, 'dashboard/operations/rates.html', async state => {
      const { page } = state;
      await page.waitForFunction(() => typeof currentYearMonth === 'string' && document.querySelectorAll('.rate-input').length > 0);
      const next = await page.evaluate(() => {
        const [year, month] = currentYearMonth.split('-').map(Number);
        return new Date(year, month, 1).toISOString().slice(0, 7);
      });
      await page.locator('#monthSelector').selectOption(next);
      await page.evaluate(() => window.changeMonth());
      const stateValue = await page.evaluate(() => ({ month: currentYearMonth, count: document.querySelectorAll('.rate-input').length, dates: [...document.querySelectorAll('.rate-input')].slice(0, 3).map(input => input.dataset.date) }));
      assert(stateValue.month === next && stateValue.count > 0 && stateValue.dates.every(date => date.startsWith(next)), 'Rate month navigation is inconsistent.', stateValue);
      cleanRuntimeErrors(state);
      return stateValue;
    })
  );

  await collector.run('RATE-002', 'Daily rate persistence', 'Edit one visible rate, save, reload, and verify local storage.', () =>
    withPage(browser, 'dashboard/operations/rates.html', async state => {
      const { page } = state;
      await page.waitForSelector('.rate-input');
      const input = page.locator('.rate-input').first();
      const meta = await input.evaluate(node => ({ date: node.dataset.date, type: node.dataset.type }));
      await input.fill('777');
      await page.evaluate(() => window.saveRates());
      const saved = await page.evaluate(meta => JSON.parse(localStorage.getItem('pms_daily_rates') || '{}')?.[meta.date]?.[meta.type], meta);
      assert(Number(saved) === 777, 'Edited daily rate was not persisted.', { meta, saved });
      cleanRuntimeErrors(state);
      return { meta, saved };
    })
  );

  await collector.run('RATE-003', 'Date-specific rate isolation', 'Edit one date and confirm the adjacent date remains unchanged.', () =>
    withPage(browser, 'dashboard/operations/rates.html', async state => {
      const { page } = state;
      await page.waitForFunction(() => document.querySelectorAll('.rate-input').length > 2);
      const data = await page.evaluate(() => {
        const first = document.querySelectorAll('.rate-input')[0];
        const adjacent = [...document.querySelectorAll('.rate-input')].find(input => input.dataset.type === first.dataset.type && input.dataset.date !== first.dataset.date);
        return { first: { date: first.dataset.date, type: first.dataset.type }, adjacent: { date: adjacent.dataset.date, type: adjacent.dataset.type, value: adjacent.value } };
      });
      await page.locator(`.rate-input[data-date="${data.first.date}"][data-type="${data.first.type}"]`).fill('888');
      await page.evaluate(() => window.saveRates());
      const after = await page.evaluate(data => ({ edited: dailyRates[data.first.date][data.first.type], adjacent: dailyRates[data.adjacent.date][data.adjacent.type] }), data);
      assert(Number(after.edited) === 888 && Number(after.adjacent) === Number(String(data.adjacent.value).replace(/[^0-9.]/g, '')), 'Date-specific change leaked to another date.', { data, after });
      cleanRuntimeErrors(state);
      return { data, after };
    })
  );

  await collector.run('RATE-004', 'Batch rate range application', 'Apply a rate to a two-day inclusive range and verify both boundary dates.', () =>
    withPage(browser, 'dashboard/operations/rates.html', async state => {
      const { page } = state;
      await page.waitForFunction(() => Array.isArray(roomTypes) && roomTypes.length > 0);
      const meta = await page.evaluate(() => {
        const [year, month] = currentYearMonth.split('-');
        return { start: `${year}-${month}-10`, end: `${year}-${month}-11`, type: roomTypes[0].id };
      });
      await page.locator('button[onclick="openModal(\'batchEditModal\')"]').click();
      await page.locator('#batchEditModal.active').waitFor({ state: 'visible' });
      await page.locator('#batchStartDate').fill(meta.start);
      await page.locator('#batchEndDate').fill(meta.end);
      await page.locator('#batchRoomType').selectOption(meta.type);
      await page.locator('#batchPrice').fill('999');
      await page.evaluate(() => window.applyBatchRates());
      const applied = await page.evaluate(meta => ({ start: dailyRates[meta.start]?.[meta.type], end: dailyRates[meta.end]?.[meta.type] }), meta);
      assert(Number(applied.start) === 999 && Number(applied.end) === 999, 'Inclusive batch range was not applied.', { meta, applied });
      cleanRuntimeErrors(state);
      return { meta, applied };
    })
  );

  await collector.run('RATE-007', 'Rate reset confirmation', 'Change a rate, reset the current month after confirmation, and verify the room-type base rate.', () =>
    withPage(browser, 'dashboard/operations/rates.html', async state => {
      const { page } = state;
      await page.waitForSelector('.rate-input');
      const meta = await page.locator('.rate-input').first().evaluate(node => ({ date: node.dataset.date, type: node.dataset.type }));
      await page.locator('.rate-input').first().fill('1234');
      await page.evaluate(() => window.saveRates());
      const resetting = page.evaluate(() => window.resetToDefault());
      await acceptConfirm(page);
      await resetting;
      const value = await page.evaluate(meta => ({ value: dailyRates[meta.date][meta.type], base: roomTypes.find(type => type.id === meta.type)?.basePrice }), meta);
      assert(Number(value.value) === Number(value.base), 'Rate reset did not restore the base rate.', value);
      cleanRuntimeErrors(state);
      return value;
    })
  );
}

(async () => {
  const collector = createResultCollector(OUTPUT);
  const { browser, server } = await launch();
  try { await runCases(browser, collector); }
  finally {
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
  const payload = collector.write({ suite: 'functional-groups-rooms' });
  process.stdout.write(`${JSON.stringify(payload.summary)}\n`);
  if (payload.summary.failed) process.exitCode = 1;
})();
