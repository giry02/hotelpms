const fs = require('fs');
const path = require('path');

const root = process.cwd();
const apiRoot = path.join(root, 'dashboard', 'data', 'api', 'v1');
const errors = [];
const warnings = [];

function absolute(rel) {
  return path.join(apiRoot, rel.replace(/\//g, path.sep));
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(absolute(rel), 'utf8'));
}

function unwrapItem(doc) {
  if (!doc || !doc.data) return {};
  return doc.data.item || doc.data;
}

function listFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, acc);
    else if (entry.name.endsWith('.json')) acc.push(full);
  }
  return acc;
}

function rel(file) {
  return path.relative(apiRoot, file).replace(/\\/g, '/');
}

function addError(code, message, detail = {}) {
  errors.push({ code, message, ...detail });
}

function addWarning(code, message, detail = {}) {
  warnings.push({ code, message, ...detail });
}

function listItems(doc) {
  return Array.isArray(doc?.data?.items) ? doc.data.items : [];
}

function itemId(item) {
  return item?.id || item?.key || item?.code || item?.reservationId || item?.roomId || item?.companyId || item?.groupId || item?.staffId || '';
}

function indexBy(items, key) {
  const map = new Map();
  for (const item of items) map.set(item[key] || itemId(item), item);
  return map;
}

function same(left, right) {
  return String(left ?? '') === String(right ?? '');
}

function checkEnvelopeFiles() {
  const idRequiredPrefixes = [
    'ancillaries/',
    'auth/',
    'b2b/',
    'crm/',
    'folios/',
    'groups/',
    'operations/',
    'pos/',
    'reservations/',
    'rooms/',
    'room-types/',
    'settings/'
  ];
  for (const file of listFiles(apiRoot)) {
    const relative = rel(file);
    if (relative.endsWith('.sample.json')) continue;
    let doc;
    try {
      doc = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
      addError('json-parse', 'JSON parsing failed.', { file: relative, error: error.message });
      continue;
    }
    if (doc.success !== true) addError('envelope-success', 'API JSON must use success: true.', { file: relative });
    if (!doc.data) addError('envelope-data', 'API JSON must include data.', { file: relative });
    if (!doc.meta?.requestId) addError('envelope-meta', 'API JSON must include meta.requestId.', { file: relative });

    if (Array.isArray(doc.data?.items)) {
      const requireStableIds = idRequiredPrefixes.some(prefix => relative.startsWith(prefix));
      const seen = new Set();
      for (const item of doc.data.items) {
        const id = itemId(item);
        if (!id && requireStableIds) addError('list-item-id', 'List item is missing a stable id field.', { file: relative });
        else if (seen.has(id)) addError('duplicate-id', 'List contains duplicate item id.', { file: relative, id });
        if (id) seen.add(id);
      }
      if (doc.data.page && Number(doc.data.page.total) !== doc.data.items.length) {
        addError('page-total', 'Static list page.total must match data.items length.', {
          file: relative,
          total: doc.data.page.total,
          actual: doc.data.items.length
        });
      }
    }
  }
}

function checkRoomsAndHousekeeping() {
  const rooms = listItems(readJson('rooms/index.json'));
  const hk = listItems(readJson('operations/housekeeping-rooms.json'));
  const roomsById = indexBy(rooms, 'roomId');
  const roomNos = new Set();
  for (const room of rooms) {
    const id = room.roomId || room.id;
    if (!id) addError('room-id', 'Room is missing roomId/id.', { room });
    if (!room.roomNo) addError('room-number', 'Room is missing roomNo.', { roomId: id });
    if (room.roomNo && roomNos.has(room.roomNo)) addError('room-number-duplicate', 'Duplicate roomNo in rooms index.', { roomNo: room.roomNo });
    if (room.roomNo) roomNos.add(room.roomNo);
  }

  const hkByRoom = indexBy(hk, 'roomId');
  for (const room of rooms) {
    const id = room.roomId || room.id;
    if (!hkByRoom.has(id)) addError('housekeeping-missing-room', 'Housekeeping read-model is missing a room.', { roomId: id });
  }
  for (const room of hk) {
    if (!roomsById.has(room.roomId)) addError('housekeeping-orphan-room', 'Housekeeping room references a room not in rooms/index.', { roomId: room.roomId });
  }
}

function checkReservations() {
  const reservations = listItems(readJson('reservations/index.json'));
  const timeline = listItems(readJson('reservations/timeline.json'));
  const rooms = listItems(readJson('rooms/index.json'));
  const archivedReservationIds = new Set();
  for (const folio of listItems(readJson('folios/index.json'))) {
    if (folio.reservationId) archivedReservationIds.add(folio.reservationId);
    if (Array.isArray(folio.reservationIds)) folio.reservationIds.forEach(id => archivedReservationIds.add(id));
  }
  for (const guest of listItems(readJson('crm/guests.json'))) {
    if (Array.isArray(guest.stayHistory)) {
      guest.stayHistory.forEach(stay => {
        if (stay.reservationId) archivedReservationIds.add(stay.reservationId);
      });
    }
  }
  const roomsById = indexBy(rooms, 'roomId');
  const reservationsById = indexBy(reservations, 'id');
  const timelineById = indexBy(timeline, 'id');
  const coreKeys = ['roomId', 'roomNo', 'guestName', 'status', 'checkInDate', 'checkOutDate', 'groupId', 'groupName', 'roomTypeId', 'roomTypeName'];

  for (const reservation of reservations) {
    if (reservation.roomId && !roomsById.has(reservation.roomId)) {
      addError('reservation-room', 'Reservation references a room not in rooms/index.', { id: reservation.id, roomId: reservation.roomId });
    }
    if (!timelineById.has(reservation.id)) {
      addError('timeline-missing-reservation', 'Reservation is missing from reservations/timeline.', { id: reservation.id });
      continue;
    }
    const mirror = timelineById.get(reservation.id);
    for (const key of coreKeys) {
      if (!same(reservation[key], mirror[key])) {
        addError('timeline-mismatch', 'Reservation timeline core field does not match index.', {
          id: reservation.id,
          key,
          indexValue: reservation[key],
          timelineValue: mirror[key]
        });
      }
    }
  }
  for (const item of timeline) {
    if (!reservationsById.has(item.id)) addError('timeline-orphan', 'Timeline has an item not in reservations/index.', { id: item.id });
  }

  for (const file of listFiles(absolute('reservations/detail'))) {
    const detail = unwrapItem(JSON.parse(fs.readFileSync(file, 'utf8')));
    const id = detail.id || detail.reservationId || path.basename(file, '.json');
    const indexItem = reservationsById.get(id);
    if (!indexItem) {
      if (!archivedReservationIds.has(id)) {
        addWarning('reservation-detail-orphan', 'Reservation detail exists without an active reservation index row or archived folio/CRM reference.', { file: rel(file), id });
      }
      continue;
    }
    for (const key of coreKeys) {
      if (detail[key] !== undefined && !same(indexItem[key], detail[key])) {
        addError('reservation-detail-mismatch', 'Reservation detail core field does not match index.', {
          file: rel(file),
          id,
          key,
          indexValue: indexItem[key],
          detailValue: detail[key]
        });
      }
    }
  }
}

function checkGroups() {
  const groups = listItems(readJson('groups/events.json'));
  const groupsById = indexBy(groups, 'id');
  const coreKeys = [
    'name',
    'companyId',
    'companyName',
    'type',
    'status',
    'checkInDate',
    'checkOutDate',
    'blockedRooms',
    'pickedUpRooms',
    'pax',
    'eventDiscountPercent',
    'routing',
    'salesManagerId',
    'salesManagerName'
  ];

  for (const file of listFiles(absolute('groups/events/detail'))) {
    const id = path.basename(file, '.json');
    if (!groupsById.has(id)) addError('group-detail-orphan', 'Group detail exists without a groups/events row.', { file: rel(file), id });
  }

  for (const group of groups) {
    const detailPath = `groups/events/detail/${group.id}.json`;
    const allocationsPath = `groups/room-allocations/${group.id}.json`;
    const roomingPath = `groups/rooming-list/${group.id}.json`;
    if (!fs.existsSync(absolute(detailPath))) addError('group-detail-missing', 'Group is missing its detail endpoint JSON.', { id: group.id });
    if (!fs.existsSync(absolute(allocationsPath))) addError('group-allocations-missing', 'Group is missing its room allocation endpoint JSON.', { id: group.id });
    if (!fs.existsSync(absolute(roomingPath))) addError('group-rooming-missing', 'Group is missing its rooming-list endpoint JSON.', { id: group.id });
    if (!fs.existsSync(absolute(detailPath))) continue;

    const detail = unwrapItem(readJson(detailPath));
    for (const key of coreKeys) {
      if (!same(group[key], detail[key])) {
        addError('group-detail-mismatch', 'Group detail core field does not match groups/events.', {
          id: group.id,
          key,
          listValue: group[key],
          detailValue: detail[key]
        });
      }
    }
    const detailAllocations = Array.isArray(detail.roomAllocations) ? detail.roomAllocations : [];
    const detailRooming = Array.isArray(detail.roomingList) ? detail.roomingList : [];
    const allocations = fs.existsSync(absolute(allocationsPath)) ? listItems(readJson(allocationsPath)) : [];
    const rooming = fs.existsSync(absolute(roomingPath)) ? listItems(readJson(roomingPath)) : [];
    if (detailAllocations.length !== allocations.length) {
      addError('group-allocations-count', 'Group detail roomAllocations count differs from allocation endpoint.', {
        id: group.id,
        detail: detailAllocations.length,
        endpoint: allocations.length
      });
    }
    if (detailRooming.length !== rooming.length) {
      addError('group-rooming-count', 'Group detail roomingList count differs from rooming endpoint.', {
        id: group.id,
        detail: detailRooming.length,
        endpoint: rooming.length
      });
    }
  }
}

function checkFolios() {
  const folios = listItems(readJson('folios/index.json'));
  const rooms = listItems(readJson('rooms/index.json'));
  const roomsById = indexBy(rooms, 'roomId');
  const roomNos = new Set(rooms.map(room => room.roomNo).filter(Boolean));
  const groups = indexBy(listItems(readJson('groups/events.json')), 'id');

  for (const folio of folios) {
    if (folio.roomId && !roomsById.has(folio.roomId)) addError('folio-room', 'Folio references a room not in rooms/index.', { id: folio.id, roomId: folio.roomId });
    if (folio.roomNo && !roomNos.has(String(folio.roomNo))) addError('folio-room-no', 'Folio references a roomNo not in rooms/index.', { id: folio.id, roomNo: folio.roomNo });
    if (folio.groupId && !groups.has(folio.groupId)) addError('folio-group', 'Folio references a group not in groups/events.', { id: folio.id, groupId: folio.groupId });
  }
}

function checkDashboardSummary() {
  const summary = readJson('dashboard/summary.json').data;
  for (const key of ['arrivals', 'departures', 'inHouse', 'occupancy']) {
    if (!Number.isFinite(Number(summary[key]))) {
      addError('dashboard-summary-number', 'Dashboard summary metric must be numeric.', { key, value: summary[key] });
    }
  }
  if (!Number.isFinite(Number(summary.revenueToday?.amount)) || !summary.revenueToday?.currency) {
    addError('dashboard-summary-money', 'Dashboard revenueToday must include amount and currency.', { value: summary.revenueToday });
  }
}

function main() {
  checkEnvelopeFiles();
  checkRoomsAndHousekeeping();
  checkReservations();
  checkGroups();
  checkFolios();
  checkDashboardSummary();

  if (warnings.length) {
    console.log(`API contract audit warnings: ${warnings.length}`);
    warnings.slice(0, 10).forEach(item => console.log(`warning ${JSON.stringify(item)}`));
    if (warnings.length > 10) console.log(`warning ... ${warnings.length - 10} more`);
  }

  if (errors.length) {
    console.error(`API contract audit failed: ${errors.length} error(s).`);
    errors.slice(0, 50).forEach(item => console.error(`error ${JSON.stringify(item)}`));
    if (errors.length > 50) console.error(`error ... ${errors.length - 50} more`);
    process.exitCode = 1;
    return;
  }

  console.log(`API contract audit passed: 0 errors, ${warnings.length} warnings.`);
}

main();
