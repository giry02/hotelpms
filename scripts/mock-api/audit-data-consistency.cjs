const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dashboardApiRoot = path.join(root, 'dashboard', 'data', 'api', 'v1');
const adminApiRoot = path.join(root, 'admin', 'data', 'api', 'v1');
const MOCK_ANCHOR_DATE = '2026-06-10';
const AUDIT_DATE = process.env.PMS_AUDIT_DATE || new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(new Date());
const AUDIT_DATE_SHIFT_DAYS = dateDiffDays(MOCK_ANCHOR_DATE, AUDIT_DATE);

const errors = [];
const warnings = [];

function walk(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, predicate);
    return predicate(full) ? [full] : [];
  });
}

function rel(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

function readJson(relativePath) {
  const full = path.join(root, relativePath);
  try {
    return shiftMockDates(JSON.parse(fs.readFileSync(full, 'utf8')), AUDIT_DATE_SHIFT_DAYS);
  } catch (error) {
    errors.push(`${relativePath}: JSON parse failed (${error.message})`);
    return null;
  }
}

function items(env, label) {
  if (!env) return [];
  if (Array.isArray(env.data?.items)) return env.data.items;
  if (Array.isArray(env.data)) return env.data;
  warnings.push(`${label}: data.items list not found`);
  return [];
}

function amountValue(value) {
  if (value && typeof value === 'object' && 'amount' in value) return Number(value.amount) || 0;
  return Number(value) || 0;
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

function parseDate(value) {
  const date = new Date(`${value}T00:00:00+09:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateDiffDays(fromIso, toIso) {
  const from = parseDate(fromIso);
  const to = parseDate(toIso);
  if (!from || !to) return 0;
  return Math.round((to - from) / 86400000);
}

function shiftIsoDateString(text, days) {
  return String(text).replace(/\b(2026-\d{2}-\d{2})(T[0-9:.+-]+)?\b/g, (match, isoDate, suffix = '') => {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    const shifted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return `${shifted}${suffix}`;
  });
}

function shiftMonthDayString(text, days) {
  const match = String(text || '').match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!match) return text;
  const date = new Date(2026, Number(match[1]) - 1, Number(match[2]));
  date.setDate(date.getDate() + days);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function shiftMockDates(value, days, key = '') {
  if (!days) return value;
  if (Array.isArray(value)) return value.map(item => shiftMockDates(item, days, key));
  if (value && typeof value === 'object') {
    const next = {};
    Object.entries(value).forEach(([childKey, childValue]) => {
      next[childKey] = shiftMockDates(childValue, days, childKey);
    });
    return next;
  }
  if (typeof value !== 'string') return value;
  let text = shiftIsoDateString(value, days);
  if (['cin', 'cout', 'in', 'out'].includes(key)) text = shiftMonthDayString(text, days);
  return text;
}

function isTodayInStay(reservation) {
  const today = parseDate(AUDIT_DATE);
  const checkIn = parseDate(reservation.checkInDate);
  const checkOut = parseDate(reservation.checkOutDate);
  return !!(today && checkIn && checkOut && checkIn <= today && today <= checkOut);
}

function isTodayCheckIn(reservation) {
  const today = parseDate(AUDIT_DATE);
  const checkIn = parseDate(reservation.checkInDate);
  return !!(today && checkIn && checkIn.getTime() === today.getTime());
}

function normalizedStatus(value) {
  return String(value || '').replace(/[-_\s]/g, '').toLowerCase();
}

function roomBlocksCheckIn(room) {
  return [room?.frontStatus, room?.status, room?.housekeepingStatus]
    .map(normalizedStatus)
    .some(status => ['oos', 'outofservice', 'outoforder', 'maintenance'].includes(status));
}

function hasAny(text, patterns) {
  return patterns.some(pattern => pattern.test(text));
}

function auditJsonFiles() {
  const files = [
    ...walk(dashboardApiRoot, file => file.endsWith('.json')),
    ...walk(adminApiRoot, file => file.endsWith('.json'))
  ];
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    let env;
    try {
      env = JSON.parse(raw);
    } catch (error) {
      errors.push(`${rel(file)}: JSON parse failed (${error.message})`);
      continue;
    }

    assert(env && env.success !== undefined, `${rel(file)}: missing success`);
    assert(env && env.data !== undefined, `${rel(file)}: missing data`);
    assert(env && env.meta && env.meta.requestId, `${rel(file)}: missing meta.requestId`);

    const isList = env?.data && Object.prototype.hasOwnProperty.call(env.data, 'page');
    if (isList) {
      assert(Array.isArray(env.data.items), `${rel(file)}: list response missing data.items`);
      assert(env.data.page && Number.isFinite(Number(env.data.page.total)), `${rel(file)}: list response missing data.page.total`);
      if (Array.isArray(env.data.items)) {
        assert(
          Number(env.data.page.total) === env.data.items.length,
          `${rel(file)}: page.total ${env.data.page.total} does not match items ${env.data.items.length}`
        );
      }
    }
  }
  return files.length;
}

function auditCoreRelations() {
  const rooms = items(readJson('dashboard/data/api/v1/rooms/index.json'), 'rooms');
  const roomTypes = items(readJson('dashboard/data/api/v1/room-types/index.json'), 'room-types');
  const reservations = items(readJson('dashboard/data/api/v1/reservations/index.json'), 'reservations');
  const timeline = items(readJson('dashboard/data/api/v1/reservations/timeline.json'), 'timeline');
  const groups = items(readJson('dashboard/data/api/v1/groups/events.json'), 'groups');
  const companies = items(readJson('dashboard/data/api/v1/b2b/companies.json'), 'companies');
  const allocations = items(readJson('dashboard/data/api/v1/groups/room-allocations/GRP-260527-01.json'), 'group room allocations');
  const rooming = items(readJson('dashboard/data/api/v1/groups/rooming-list/GRP-260527-01.json'), 'rooming list');
  const hkRooms = items(readJson('dashboard/data/api/v1/operations/housekeeping-rooms.json'), 'housekeeping rooms');
  const folios = items(readJson('dashboard/data/api/v1/folios/index.json'), 'folios');
  const currencySettings = readJson('dashboard/data/api/v1/settings/currency.json')?.data || {};
  const defaultCurrency = currencySettings.defaultCurrency || 'PHP';

  const roomIds = new Set(rooms.map(room => room.roomId || room.id));
  const roomTypeIds = new Set(roomTypes.map(type => type.id || type.code));
  const reservationIds = new Set(reservations.map(reservation => reservation.reservationId || reservation.id));
  const companyIds = new Set(companies.map(company => company.id || company.companyId));
  const groupIds = new Set(groups.map(group => group.id || group.groupId));

  rooms.forEach(room => {
    const id = room.roomId || room.id;
    assert(id, 'rooms: room missing roomId/id');
    assert(roomTypeIds.has(room.roomTypeId), `rooms/${id}: unknown roomTypeId ${room.roomTypeId}`);
    warn(
      !(room.status === 'out-of-service' && room.housekeepingStatus === 'occupied'),
      `rooms/${id}: out-of-service room is marked housekeepingStatus=occupied`
    );
  });

  reservations.forEach(reservation => {
    const id = reservation.reservationId || reservation.id;
    const room = rooms.find(item => (item.roomId || item.id) === reservation.roomId);
    assert(roomIds.has(reservation.roomId), `reservations/${id}: unknown roomId ${reservation.roomId}`);
    assert(roomTypeIds.has(reservation.roomTypeId), `reservations/${id}: unknown roomTypeId ${reservation.roomTypeId}`);
    if (reservation.companyId) assert(companyIds.has(reservation.companyId), `reservations/${id}: unknown companyId ${reservation.companyId}`);
    if (reservation.groupId) assert(groupIds.has(reservation.groupId), `reservations/${id}: unknown groupId ${reservation.groupId}`);
    if (reservation.status === 'confirmed' && isTodayCheckIn(reservation)) {
      assert(!roomBlocksCheckIn(room), `reservations/${id}: today check-in is assigned to blocked room ${reservation.roomId}`);
    }
    if (reservation.status === 'checked-in') {
      warn(isTodayInStay(reservation), `reservations/${id}: checked-in but ${AUDIT_DATE} is outside stay window`);
    }
    if (reservation.isGroupPlaceholder) {
      warn(
        reservation.channel === 'Group' && reservation.groupId,
        `reservations/${id}: group placeholder missing Group channel/groupId`
      );
    }
  });

  timeline.forEach(item => {
    const id = item.reservationId || item.id;
    assert(reservationIds.has(id), `timeline/${id}: no matching reservation`);
    assert(roomIds.has(item.roomId), `timeline/${id}: unknown roomId ${item.roomId}`);
  });

  allocations.forEach(allocation => {
    const id = allocation.id || allocation.allocationId;
    assert(roomIds.has(allocation.roomId), `group-allocations/${id}: unknown roomId ${allocation.roomId}`);
    assert(groupIds.has(allocation.groupId), `group-allocations/${id}: unknown groupId ${allocation.groupId}`);
  });

  rooming.forEach(entry => {
    const id = entry.id || entry.roomingGuestId;
    assert(roomIds.has(entry.roomId), `rooming-list/${id}: unknown roomId ${entry.roomId}`);
    assert(groupIds.has(entry.groupId), `rooming-list/${id}: unknown groupId ${entry.groupId}`);
  });

  hkRooms.forEach(hkRoom => {
    assert(roomIds.has(hkRoom.roomId), `housekeeping-rooms/${hkRoom.roomId}: unknown roomId`);
    const room = rooms.find(item => (item.roomId || item.id) === hkRoom.roomId);
    if (room) {
      const expectedByRoomStatus = {
        'in-house': 'occupied',
        'vacant-clean': 'clean',
        'vacant-dirty': 'dirty',
        'out-of-service': 'oos'
      }[room.status];
      warn(
        !expectedByRoomStatus || hkRoom.status === expectedByRoomStatus,
        `housekeeping-rooms/${hkRoom.roomId}: status ${hkRoom.status} does not align with room status ${room.status}`
      );
    }
  });

  folios.forEach(folio => {
    if (folio.groupId) assert(groupIds.has(folio.groupId), `folios/${folio.id}: unknown groupId ${folio.groupId}`);
    if (folio.companyId) assert(companyIds.has(folio.companyId), `folios/${folio.id}: unknown companyId ${folio.companyId}`);
    assert(folio.balance?.currency === defaultCurrency, `folios/${folio.id}: balance currency is not ${defaultCurrency}`);
    warn(!(folio.status === 'open' && folio.closedAt), `folios/${folio.id}: open folio should not have closedAt`);
    warn(!(folio.status === 'closed' && amountValue(folio.balance) !== 0), `folios/${folio.id}: closed folio should have zero balance`);
  });

  const inHouseRoomIds = rooms
    .filter(room => room.status === 'in-house')
    .map(room => room.roomId || room.id);
  const activeCheckedInRoomIds = new Set(
    reservations
      .filter(reservation => reservation.status === 'checked-in' && isTodayInStay(reservation))
      .map(reservation => reservation.roomId)
  );
  inHouseRoomIds.forEach(roomId => {
    warn(activeCheckedInRoomIds.has(roomId), `rooms/${roomId}: marked in-house without a checked-in reservation for ${AUDIT_DATE}`);
  });

  const statusCounts = rooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {});

  return {
    rooms: rooms.length,
    roomTypes: roomTypes.length,
    reservations: reservations.length,
    timeline: timeline.length,
    groups: groups.length,
    companies: companies.length,
    allocations: allocations.length,
    rooming: rooming.length,
    housekeepingRooms: hkRooms.length,
    folios: folios.length,
    statusCounts
  };
}

function auditStaticRisks() {
  const files = walk(path.join(root, 'dashboard'), file => file.endsWith('.html') || file.endsWith('.js'));
  const risky = [];
  const patterns = [
    /localStorage\.removeItem\(['"]pms_/,
    /localStorage\.setItem\(['"]pms_/,
    /\bconst\s+foliosData\b/,
    /\bconst\s+kpiData\b/,
    /\bDEFAULT_ROOM_TYPES\b/,
    /\$[0-9][0-9,.]*/,
    /\bUSD\b/
  ];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    if (hasAny(text, patterns)) risky.push(rel(file));
  }
  return risky.sort();
}

const jsonFileCount = auditJsonFiles();
const relationSummary = auditCoreRelations();
const staticRiskFiles = auditStaticRisks();

const result = {
  ok: errors.length === 0,
  auditDate: AUDIT_DATE,
  mockAnchorDate: MOCK_ANCHOR_DATE,
  dateShiftDays: AUDIT_DATE_SHIFT_DAYS,
  jsonFileCount,
  relationSummary,
  errors,
  warnings,
  staticRiskFiles
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
