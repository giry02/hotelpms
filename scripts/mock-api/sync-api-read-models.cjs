const fs = require('fs');
const path = require('path');

const root = process.cwd();
const apiRoot = path.join(root, 'dashboard', 'data', 'api', 'v1');
const tenantId = 'TENANT-GRAND-SAIGON';
const apiVersion = 'v9';
const generatedAt = '2026-06-10T09:00:00+09:00';

const changed = [];
const removed = [];

function absolute(rel) {
  return path.join(apiRoot, rel.replace(/\//g, path.sep));
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(absolute(rel), 'utf8'));
}

function writeJson(rel, value) {
  const file = absolute(rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const next = `${JSON.stringify(value, null, 2)}\n`;
  const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (prev !== next) {
    fs.writeFileSync(file, next, 'utf8');
    changed.push(rel);
  }
}

function removeFile(rel) {
  const file = absolute(rel);
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    removed.push(rel);
  }
}

function meta(requestId, existing = {}) {
  return {
    requestId,
    tenantId,
    apiVersion,
    generatedAt,
    timezone: existing.timezone || 'Asia/Seoul',
    currency: existing.currency || 'PHP'
  };
}

function pageFor(items) {
  return {
    page: 1,
    pageSize: Math.max(items.length, 50),
    total: items.length,
    totalPages: 1
  };
}

function listEnvelope(items, requestId, existingMeta = {}) {
  return {
    success: true,
    data: {
      items,
      page: pageFor(items)
    },
    meta: meta(requestId, existingMeta)
  };
}

function itemEnvelope(item, requestId, existingMeta = {}) {
  return {
    success: true,
    data: { item },
    meta: meta(requestId, existingMeta)
  };
}

function unwrapItem(doc) {
  if (!doc || !doc.data) return {};
  return doc.data.item || doc.data;
}

function listFiles(relDir) {
  const dir = absolute(relDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(name => name.endsWith('.json'));
}

function roomNumberFromId(value) {
  return String(value || '').split('-').pop();
}

function normalizeHousekeepingStatus(room) {
  const hk = String(room.housekeepingStatus || '').trim();
  if (hk) {
    if (hk === 'vacant-dirty') return 'dirty';
    if (hk === 'out-of-service') return 'oos';
    return hk;
  }
  const front = String(room.frontStatus || room.status || '').toLowerCase();
  if (['in-house', 'checked-in', 'occupied'].includes(front)) return 'occupied';
  if (['out-of-service', 'oos', 'maintenance'].includes(front)) return 'oos';
  if (['vacant-dirty', 'dirty', 'pending-clean', 'needs-cleaning'].includes(front)) return 'dirty';
  return 'clean';
}

function syncSingleItemDetails(relDir) {
  for (const file of listFiles(relDir)) {
    const rel = `${relDir}/${file}`;
    const doc = readJson(rel);
    const item = unwrapItem(doc);
    if (!doc.data || doc.data.item) continue;
    writeJson(rel, itemEnvelope(item, doc.meta?.requestId || `REQ-${path.basename(file, '.json')}`, doc.meta || {}));
  }
}

function syncReservationDetails() {
  const reservations = readJson('reservations/index.json').data.items;
  const byId = new Map(reservations.map(item => [item.id || item.reservationId, item]));
  const coreKeys = [
    'id',
    'reservationId',
    'tenantId',
    'roomId',
    'roomNo',
    'roomLabel',
    'roomTypeId',
    'roomTypeName',
    'guestId',
    'guestName',
    'channel',
    'status',
    'checkInDate',
    'checkOutDate',
    'nights',
    'groupId',
    'groupName',
    'rate',
    'totalAmount',
    'amount',
    'vip',
    'isVip',
    'isB2B',
    'guestFlag'
  ];
  for (const file of listFiles('reservations/detail')) {
    const rel = `reservations/detail/${file}`;
    const doc = readJson(rel);
    const item = unwrapItem(doc);
    const id = item.id || item.reservationId || path.basename(file, '.json');
    const source = byId.get(id);
    if (!source) continue;
    const synced = { ...item };
    for (const key of coreKeys) {
      if (source[key] !== undefined) synced[key] = source[key];
    }
    synced.reservationId = source.reservationId || source.id;
    writeJson(rel, itemEnvelope(synced, doc.meta?.requestId || `REQ-${id}`, doc.meta || {}));
  }
}

function pruneInvalidFolios() {
  const rooms = readJson('rooms/index.json').data.items;
  const validRoomIds = new Set(rooms.map(room => room.roomId || room.id).filter(Boolean));
  const validRoomNos = new Set(rooms.map(room => room.roomNo || room.number || roomNumberFromId(room.roomId || room.id)).filter(Boolean));
  const folioDoc = readJson('folios/index.json');
  const before = folioDoc.data.items;
  const after = before.filter(folio => {
    const roomIdOk = !folio.roomId || validRoomIds.has(folio.roomId);
    const roomNoOk = !folio.roomNo || validRoomNos.has(String(folio.roomNo));
    return roomIdOk && roomNoOk;
  });
  if (after.length !== before.length) {
    folioDoc.data.items = after;
    folioDoc.data.page = pageFor(after);
    writeJson('folios/index.json', folioDoc);
  }
}

function syncGroupEndpoints() {
  const events = readJson('groups/events.json');
  const groups = events.data.items;
  const groupIds = new Set(groups.map(group => group.id));

  for (const file of listFiles('groups/events/detail')) {
    const id = path.basename(file, '.json');
    if (!groupIds.has(id)) removeFile(`groups/events/detail/${file}`);
  }
  for (const file of listFiles('groups/room-allocations')) {
    const id = path.basename(file, '.json');
    if (!groupIds.has(id)) removeFile(`groups/room-allocations/${file}`);
  }
  for (const file of listFiles('groups/rooming-list')) {
    const id = path.basename(file, '.json');
    if (!groupIds.has(id)) removeFile(`groups/rooming-list/${file}`);
  }

  for (const group of groups) {
    const detailRel = `groups/events/detail/${group.id}.json`;
    const existingDetail = fs.existsSync(absolute(detailRel)) ? readJson(detailRel) : null;
    const existingItem = existingDetail ? unwrapItem(existingDetail) : {};
    const groupAllocations = Array.isArray(group.roomAllocations) ? group.roomAllocations : [];
    const groupRooming = Array.isArray(group.roomingList) ? group.roomingList : [];
    const allocations = groupAllocations.length ? groupAllocations : (Array.isArray(existingItem.roomAllocations) ? existingItem.roomAllocations : []);
    const roomingList = groupRooming.length ? groupRooming : (Array.isArray(existingItem.roomingList) ? existingItem.roomingList : []);
    const item = {
      ...existingItem,
      ...group,
      roomAllocations: allocations,
      roomingList,
      history: Array.isArray(existingItem.history) ? existingItem.history : []
    };
    writeJson(detailRel, itemEnvelope(item, `REQ-GROUP-${group.id}`, existingDetail?.meta || {}));
    writeJson(
      `groups/room-allocations/${group.id}.json`,
      listEnvelope(allocations, `REQ-GROUP-ALLOCATIONS-${group.id}`, existingDetail?.meta || {})
    );
    writeJson(
      `groups/rooming-list/${group.id}.json`,
      listEnvelope(roomingList, `REQ-GROUP-ROOMING-${group.id}`, existingDetail?.meta || {})
    );
  }
}

function syncHousekeepingRooms() {
  const roomDoc = readJson('rooms/index.json');
  const existingDoc = readJson('operations/housekeeping-rooms.json');
  const existingByRoom = new Map(existingDoc.data.items.map(item => [item.roomId, item]));
  const items = roomDoc.data.items.map(room => {
    const roomId = room.roomId || room.id;
    const existing = existingByRoom.get(roomId) || {};
    const housekeepingStatus = normalizeHousekeepingStatus(room);
    return {
      ...existing,
      roomId,
      roomNo: room.roomNo || room.number || roomNumberFromId(roomId),
      displayName: room.displayName,
      buildingId: room.buildingId,
      buildingName: room.buildingName,
      floor: room.floor,
      roomTypeId: room.roomTypeId,
      roomTypeName: room.roomTypeName,
      status: housekeepingStatus,
      guestFlag: room.guestFlag || existing.guestFlag || 'none',
      housekeepingStatus,
      frontStatus: room.frontStatus || room.status || existing.frontStatus || 'vacant-clean'
    };
  });
  writeJson('operations/housekeeping-rooms.json', listEnvelope(items, 'REQ-HOUSEKEEPING-ROOMS', existingDoc.meta || {}));
}

function main() {
  syncSingleItemDetails('reservations/detail');
  syncReservationDetails();
  syncSingleItemDetails('folios/detail');
  pruneInvalidFolios();
  syncGroupEndpoints();
  syncHousekeepingRooms();

  console.log(`API read-model sync complete: ${changed.length} changed, ${removed.length} removed.`);
  for (const rel of changed) console.log(`changed ${rel}`);
  for (const rel of removed) console.log(`removed ${rel}`);
}

main();
