const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const API_ROOT = path.join(ROOT, 'dashboard', 'data', 'api', 'v1');
const TENANT_ID = 'TENANT-GRAND-SAIGON';
const CURRENCY = 'PHP';
const DEMO_BASE_DATE = '2026-06-10'; // Displays as 2026-07-08 after mock date shifting.
const DAY_BEFORE = '2026-06-09';
const TWO_DAYS_BEFORE = '2026-06-08';
const DAY_AFTER = '2026-06-11';
const TWO_DAYS_AFTER = '2026-06-12';

function apiPath(rel) {
  return path.join(API_ROOT, rel);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(apiPath(rel), 'utf8'));
}

function writeJson(rel, payload) {
  const file = apiPath(rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function items(env) {
  return env.data.items;
}

function updatePage(env) {
  if (!env.data.page) return env;
  env.data.page.total = env.data.items.length;
  env.data.page.pageSize = Math.max(env.data.page.pageSize || 50, env.data.items.length);
  env.data.page.totalPages = Math.max(1, Math.ceil(env.data.items.length / env.data.page.pageSize));
  return env;
}

function upsert(list, item, key = 'id') {
  const idx = list.findIndex(row => String(row[key] || row.id || '') === String(item[key] || item.id || ''));
  if (idx >= 0) list[idx] = { ...list[idx], ...item };
  else list.push(item);
}

function initials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || 'G';
}

function monthDay(iso) {
  const [, month, day] = String(iso).slice(0, 10).split('-');
  return `${Number(month)}/${Number(day)}`;
}

function nights(checkInDate, checkOutDate) {
  return Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / 86400000));
}

function amountValue(value) {
  if (value && typeof value === 'object') return Number(value.amount || 0);
  return Number(value || 0);
}

function roomNoFromId(roomId) {
  return String(roomId || '').split('-').pop();
}

function roomRecord(rooms, roomId) {
  const room = rooms.find(item => item.id === roomId || item.roomId === roomId);
  if (!room) throw new Error(`Missing room ${roomId}`);
  return room;
}

function setRoomState(rooms, roomId, status, housekeepingStatus = 'occupied', guestFlag = 'none') {
  const room = roomRecord(rooms, roomId);
  room.status = status;
  room.frontStatus = status;
  room.housekeepingStatus = housekeepingStatus;
  room.guestFlag = guestFlag;
  if (status === 'in-house') room.occupancyStatus = 'occupied';
  if (status.startsWith('vacant')) room.occupancyStatus = 'vacant';
  return room;
}

function syncHousekeeping(hkItems, room, status, guestFlag = room.guestFlag || 'none') {
  const mappedStatus = status === 'in-house'
    ? 'occupied'
    : status === 'out-of-service'
      ? 'oos'
      : status === 'vacant-dirty'
        ? 'dirty'
        : 'clean';
  upsert(hkItems, {
    roomId: room.id || room.roomId,
    roomNo: room.roomNo || roomNoFromId(room.id || room.roomId),
    status: mappedStatus,
    guestFlag,
    roomTypeName: room.roomTypeName,
    housekeepingStatus: mappedStatus,
    frontStatus: status
  }, 'roomId');
}

function makeReservation(rooms, config) {
  const room = roomRecord(rooms, config.roomId);
  const stayNights = nights(config.checkInDate, config.checkOutDate);
  const rate = config.rate ?? amountValue(room.baseRate);
  const total = config.total ?? Math.round(rate * stayNights);
  const guestName = config.guestName || config.roomingGuestName || 'Guest';
  const roomNo = room.roomNo || roomNoFromId(room.id);
  const reservation = {
    id: config.id,
    reservationId: config.id,
    tenantId: TENANT_ID,
    roomId: room.id,
    roomNo,
    room: roomNo,
    fullRoom: room.id,
    roomLabel: room.displayName || `${room.buildingName || ''} ${roomNo}`.trim(),
    roomTypeId: room.roomTypeId,
    roomTypeName: room.roomTypeName,
    type: room.roomTypeName,
    guestId: config.guestId || `G-DEMO-${config.id}`,
    guestName,
    guest: guestName,
    initials: initials(guestName),
    channel: config.channel || (config.groupId ? 'Group' : 'Direct'),
    status: config.status,
    checkInDate: config.checkInDate,
    checkOutDate: config.checkOutDate,
    checkInTime: config.checkInTime || '14:00',
    checkOutTime: config.checkOutTime || '12:00',
    cin: monthDay(config.checkInDate),
    cout: monthDay(config.checkOutDate),
    start: config.start ?? 0,
    len: stayNights,
    nights: stayNights,
    rate: { amount: rate, currency: CURRENCY },
    nightlyRate: { amount: rate, currency: CURRENCY },
    totalAmount: { amount: total, currency: CURRENCY },
    amount: total,
    vip: config.vip || '',
    tier: config.tier || config.vip || 'General',
    isVip: !!config.vip && config.vip !== 'General',
    isB2B: !!(config.groupId || config.companyId),
    isGroupPlaceholder: !!config.isGroupPlaceholder,
    groupId: config.groupId || '',
    groupName: config.groupName || '',
    companyId: config.companyId || '',
    companyName: config.companyName || '',
    color: config.color || '#3b82f6',
    roomingGuestId: config.roomingGuestId || `RMG-${config.id}-P`,
    roomingGuestName: config.roomingGuestName || guestName,
    companionGuestNames: config.companionGuestNames || [],
    roomingGuestNames: [guestName, ...(config.companionGuestNames || [])],
    roomingGuests: [
      {
        id: config.roomingGuestId || `RMG-${config.id}-P`,
        guestId: config.guestId || `G-DEMO-${config.id}`,
        name: guestName,
        role: 'primary',
        docStatus: config.docStatus || 'verified',
        nationality: config.nationality || 'Vietnam'
      },
      ...(config.companionGuestNames || []).map((name, index) => ({
        id: `RMG-${config.id}-C${index + 1}`,
        guestId: `G-DEMO-${config.id}-C${index + 1}`,
        name,
        role: 'companion',
        docStatus: index % 2 ? 'pending' : 'verified',
        nationality: config.nationality || 'Vietnam'
      }))
    ],
    paymentPlan: config.paymentPlan || {
      prepaidAmount: config.prepaidAmount || 0,
      currency: CURRENCY
    },
    housekeepingState: config.housekeepingState || (config.status === 'checked-in' ? 'mur' : 'clean'),
    specialRequests: config.specialRequests || '',
    createdAt: `${DEMO_BASE_DATE}T08:00:00+09:00`,
    updatedAt: `${DEMO_BASE_DATE}T10:30:00+09:00`
  };
  if (config.roomChangeHistory) reservation.roomChangeHistory = config.roomChangeHistory;
  return reservation;
}

function money(amount) {
  return { amount, currency: CURRENCY };
}

function makeCharge(id, type, desc, amount, roomId, reservationId, extra = {}) {
  return {
    id,
    type,
    desc,
    amount: money(amount),
    roomId,
    reservationId,
    ...extra
  };
}

function makePayment(id, method, amount, paidAt, note, extra = {}) {
  return {
    id,
    method,
    amount: money(amount),
    paidAt,
    note,
    operator: extra.operator || 'Nguyen Kim',
    ...extra
  };
}

function makeFolio(rooms, config) {
  const room = config.roomId ? roomRecord(rooms, config.roomId) : null;
  const roomNo = config.roomNo || room?.roomNo || 'Group';
  const total = config.charges.reduce((sum, charge) => sum + amountValue(charge.amount), 0);
  const paid = config.payments.reduce((sum, payment) => sum + amountValue(payment.amount), 0);
  const balance = config.balance ?? Math.max(total - paid, 0);
  const folio = {
    id: config.id,
    folioId: config.id,
    folioType: config.folioType || 'individual',
    ownerName: config.ownerName,
    guestName: config.guestName || config.ownerName,
    roomNo,
    status: config.status || (balance > 0 ? 'unpaid' : 'open'),
    issuedAt: config.issuedAt || `${DEMO_BASE_DATE}T${config.issueTime || '09:00'}:00+09:00`,
    checkOutDate: config.checkOutDate || DEMO_BASE_DATE,
    checkoutDate: config.checkOutDate || DEMO_BASE_DATE,
    balance: money(balance),
    charges: config.charges,
    payments: config.payments,
    reservationId: config.reservationId || '',
    reservationIds: config.reservationIds || undefined,
    guestId: config.guestId || '',
    roomId: config.roomId || '',
    roomIds: config.roomIds || undefined,
    companyId: config.companyId || '',
    groupId: config.groupId || '',
    companyName: config.companyName || '',
    settlementStatus: config.settlementStatus || (balance > 0 ? 'unpaid' : 'ready')
  };
  if (config.closedAt) folio.closedAt = config.closedAt;
  if (config.settlementCompleted) {
    folio.settlementCompleted = true;
    folio.settlementCompletedAt = config.settlementCompletedAt || config.closedAt || `${DEMO_BASE_DATE}T${config.issueTime || '09:00'}:00+09:00`;
    folio.settlementCompletedBy = config.settlementCompletedBy || 'Nguyen Kim';
    folio.checkoutCompleted = true;
  }
  if (config.depositAmount) folio.depositAmount = config.depositAmount;
  return folio;
}

function makeOrder(config) {
  return {
    id: config.id,
    room: config.room,
    roomNo: config.room,
    guestName: config.guestName,
    date: config.date || DEMO_BASE_DATE,
    time: config.time,
    status: config.status,
    type: config.type,
    serviceType: config.serviceType || config.type,
    item: config.item,
    itemName: config.item,
    qty: config.qty || 1,
    amount: money(config.amount),
    total: money(config.amount),
    source: config.source,
    service: config.source,
    operator: config.operator || 'Front Desk Kim',
    createdAt: `${config.date || DEMO_BASE_DATE}T${config.time || '10:00'}:00+09:00`
  };
}

function eventItem(config) {
  return {
    id: config.id,
    type: config.type,
    category: config.category,
    severity: config.severity || 'info',
    icon: config.icon,
    title: config.title,
    label: config.label,
    desc: config.desc,
    time: config.time,
    eventDate: DEMO_BASE_DATE,
    serviceDate: config.serviceDate,
    actor: config.actor,
    roomNo: config.roomNo,
    groupId: config.groupId,
    folioId: config.folioId,
    target: config.target
  };
}

function simpleEnvelope(data, requestId) {
  return {
    success: true,
    data,
    meta: {
      requestId,
      tenantId: TENANT_ID,
      apiVersion: 'v8',
      generatedAt: `${DEMO_BASE_DATE}T09:00:00+09:00`,
      timezone: 'Asia/Seoul',
      currency: CURRENCY
    }
  };
}

function listEnvelope(list, requestId) {
  return simpleEnvelope({
    items: list,
    page: {
      page: 1,
      pageSize: Math.max(50, list.length),
      total: list.length,
      totalPages: 1
    }
  }, requestId);
}

function buildGroupDetail(group) {
  return simpleEnvelope({ item: group }, `REQ-${group.id}-DETAIL`);
}

const roomsEnv = readJson('rooms/index.json');
const reservationsEnv = readJson('reservations/index.json');
const timelineEnv = readJson('reservations/timeline.json');
const foliosEnv = readJson('folios/index.json');
const hkEnv = readJson('operations/housekeeping-rooms.json');
const posEnv = readJson('pos/orders.json');
const golfEnv = readJson('ancillaries/golf-orders.json');
const carEnv = readJson('ancillaries/rentacar-orders.json');
const activitiesEnv = readJson('dashboard/today-activities.json');
const groupsEnv = readJson('groups/events.json');
const summaryEnv = readJson('dashboard/summary.json');
const kpisEnv = readJson('dashboard/kpis.json');

const rooms = items(roomsEnv);
const reservations = items(reservationsEnv);
const timeline = items(timelineEnv);
const folios = items(foliosEnv);
const hkItems = items(hkEnv);
const posOrders = items(posEnv);
const golfOrders = items(golfEnv);
const carOrders = items(carEnv);
const activities = items(activitiesEnv);
const groups = items(groupsEnv);

['OT-1402', 'LV-V02', 'FT-1218', 'FT-1226', 'FT-1228'].forEach(roomId => {
  const room = setRoomState(rooms, roomId, 'in-house', 'occupied', roomId === 'FT-1206' ? 'mur' : 'none');
  syncHousekeeping(hkItems, room, 'in-house', room.guestFlag);
});

['FT-1205', 'FT-1206'].forEach(roomId => {
  const room = setRoomState(rooms, roomId, 'vacant-clean', 'clean', 'none');
  syncHousekeeping(hkItems, room, 'vacant-clean', room.guestFlag);
});

[
  ['FT-1213', 'vacant-dirty', 'dirty'],
  ['FT-1222', 'vacant-dirty', 'dirty']
].forEach(([roomId, status, hk]) => {
  const room = setRoomState(rooms, roomId, status, hk, 'none');
  syncHousekeeping(hkItems, room, status);
});

const checkinReservations = [
  ['RSV-DEMO-0708-1208', 'FT-1208', 'Chen Wei', 'Gold', '2026-06-10', '2026-06-12', 140],
  ['RSV-DEMO-0708-1211', 'FT-1211', 'Maria Santos', 'Gold', '2026-06-10', '2026-06-13', 140],
  ['RSV-DEMO-0708-1212', 'FT-1212', 'Olivia Smith', 'General', '2026-06-10', '2026-06-11', 140],
  ['RSV-DEMO-0708-1213', 'FT-1213', 'Park Minji', 'VIP', '2026-06-10', '2026-06-12', 140],
  ['RSV-DEMO-0708-1220', 'FT-1220', 'Robert Ford', 'Diamond', '2026-06-10', '2026-06-13', 140],
  ['RSV-DEMO-0708-1221', 'FT-1221', 'Grace Miller', 'Platinum', '2026-06-10', '2026-06-11', 140]
].map(([id, roomId, guestName, vip, checkInDate, checkOutDate, rate]) => makeReservation(rooms, {
  id,
  roomId,
  guestName,
  vip,
  status: 'confirmed',
  checkInDate,
  checkOutDate,
  rate,
  color: '#3b82f6',
  housekeepingState: roomId === 'FT-1213' ? 'mur' : 'clean',
  paymentPlan: { prepaidAmount: roomId === 'FT-1220' ? 100 : 0, currency: CURRENCY }
}));

const checkoutReservations = [
  ['RSV-DEMO-0708-1402-OUT', 'OT-1402', 'Yamamoto K.', 'General', DAY_BEFORE, DEMO_BASE_DATE, 100, '11:00'],
  ['RSV-DEMO-0708-1205-OUT', 'FT-1205', 'Maria Santos', 'Gold', TWO_DAYS_BEFORE, DEMO_BASE_DATE, 140, '12:00'],
  ['RSV-DEMO-0708-1206-OUT', 'FT-1206', 'Robert Ford', 'VIP', DAY_BEFORE, DEMO_BASE_DATE, 140, '13:00'],
  ['RSV-DEMO-0708-V02-OUT', 'LV-V02', 'Tanaka Yuki', 'Platinum', DAY_BEFORE, DEMO_BASE_DATE, 380, '12:00'],
  ['RSV-DEMO-0708-1218-OUT', 'FT-1218', 'Pham David', 'General', TWO_DAYS_BEFORE, DEMO_BASE_DATE, 140, '12:00'],
  ['RSV-DEMO-0708-1226-OUT', 'FT-1226', 'Lee Hannah', 'Gold', DAY_BEFORE, DEMO_BASE_DATE, 140, '15:00'],
  ['RSV-DEMO-0708-1228-OUT', 'FT-1228', 'Garcia Miguel', 'Diamond', DAY_BEFORE, DEMO_BASE_DATE, 140, '12:00']
].map(([id, roomId, guestName, vip, checkInDate, checkOutDate, rate, checkOutTime]) => makeReservation(rooms, {
  id,
  roomId,
  guestName,
  vip,
  status: 'checked-in',
  checkInDate,
  checkOutDate,
  checkOutTime,
  rate,
  color: '#10b981',
  housekeepingState: roomId === 'FT-1206' ? 'mur' : 'clean'
}));

const missedArrival = makeReservation(rooms, {
  id: 'RSV-DEMO-0708-MISSED-1222',
  roomId: 'FT-1222',
  guestName: 'No Show Pending Guest',
  vip: 'General',
  status: 'confirmed',
  checkInDate: DAY_BEFORE,
  checkOutDate: TWO_DAYS_AFTER,
  rate: 140,
  color: '#64748b',
  housekeepingState: 'mur',
  specialRequests: '입실 예정 시간이 지났으나 아직 도착하지 않은 미도착 케이스'
});

[...checkinReservations, ...checkoutReservations, missedArrival].forEach(reservation => {
  upsert(reservations, reservation);
  upsert(timeline, reservation);
});

reservations
  .filter(reservation => reservation.groupId === 'GRP-260527-01' || reservation.groupName === 'Samsung Tech Conference 2026')
  .forEach((reservation, index) => {
    reservation.createdAt = `${DEMO_BASE_DATE}T15:${String(40 - index).padStart(2, '0')}:00+09:00`;
    reservation.updatedAt = `${DEMO_BASE_DATE}T15:${String(45 - index).padStart(2, '0')}:00+09:00`;
    upsert(timeline, reservation);
  });

const folioConfigs = [
  {
    id: 'FOL-DEMO-0708-1402-COMPLETE',
    reservationId: 'RSV-DEMO-0708-1402-OUT',
    roomId: 'OT-1402',
    ownerName: 'Yamamoto K.',
    status: 'closed',
    issueTime: '09:10',
    closedAt: `${DEMO_BASE_DATE}T09:45:00+09:00`,
    settlementCompleted: true,
    charges: [
      makeCharge('FOL-DEMO-0708-1402-CHG-ROOM', 'room', 'Premier 1박 객실 요금', 2300, 'OT-1402', 'RSV-DEMO-0708-1402-OUT')
    ],
    payments: [
      makePayment('FOL-DEMO-0708-1402-PAY-CARD', 'card', 2300, `${DEMO_BASE_DATE}T09:35:00+09:00`, '카드 수납 및 체크아웃 완료')
    ],
    balance: 0
  },
  {
    id: 'FOL-DEMO-0708-1205-UNPAID',
    reservationId: 'RSV-DEMO-0708-1205-OUT',
    roomId: 'FT-1205',
    ownerName: 'Maria Santos',
    status: 'unpaid',
    issueTime: '10:00',
    closedAt: `${DEMO_BASE_DATE}T10:20:00+09:00`,
    charges: [
      makeCharge('FOL-DEMO-0708-1205-CHG-ROOM', 'room', 'Deluxe 2박 객실 요금', 2800, 'FT-1205', 'RSV-DEMO-0708-1205-OUT'),
      makeCharge('FOL-DEMO-0708-1205-CHG-POS', 'fnb', '룸서비스 및 미니바', 780, 'FT-1205', 'RSV-DEMO-0708-1205-OUT')
    ],
    payments: [
      makePayment('FOL-DEMO-0708-1205-PAY-CASH', 'cash', 1500, `${DEMO_BASE_DATE}T10:10:00+09:00`, '현금 일부 수납')
    ],
    balance: 2080
  },
  {
    id: 'FOL-DEMO-0708-1206-DEPOSIT',
    reservationId: 'RSV-DEMO-0708-1206-OUT',
    roomId: 'FT-1206',
    ownerName: 'Robert Ford',
    status: 'unpaid',
    issueTime: '10:35',
    closedAt: `${DEMO_BASE_DATE}T11:00:00+09:00`,
    charges: [
      makeCharge('FOL-DEMO-0708-1206-CHG-ROOM', 'room', 'Deluxe 1박 객실 요금', 1400, 'FT-1206', 'RSV-DEMO-0708-1206-OUT'),
      makeCharge('FOL-DEMO-0708-1206-CHG-CAR', 'rentacar', '공항 샌딩 렌터카', 420, 'FT-1206', 'RSV-DEMO-0708-1206-OUT')
    ],
    payments: [
      makePayment('FOL-DEMO-0708-1206-PAY-DEP', 'deposit', 1000, `${DEMO_BASE_DATE}T09:00:00+09:00`, '키 보증/추가 숙박 보관금', { kind: 'deposit' })
    ],
    depositAmount: 1000,
    balance: 820
  },
  {
    id: 'FOL-DEMO-0708-V02-REFUND',
    reservationId: 'RSV-DEMO-0708-V02-OUT',
    roomId: 'LV-V02',
    ownerName: 'Tanaka Yuki',
    status: 'closed',
    issueTime: '11:15',
    closedAt: `${DEMO_BASE_DATE}T11:45:00+09:00`,
    charges: [
      makeCharge('FOL-DEMO-0708-V02-CHG-ROOM', 'room', 'Pool Villa 1박 객실 요금', 3800, 'LV-V02', 'RSV-DEMO-0708-V02-OUT')
    ],
    payments: [
      makePayment('FOL-DEMO-0708-V02-PAY-DEP', 'deposit', 4500, `${DAY_BEFORE}T16:30:00+09:00`, '예약 예치금 선수납', { kind: 'deposit' })
    ],
    depositAmount: 4500,
    balance: 0
  },
  {
    id: 'FOL-DEMO-0708-1218-READY',
    reservationId: 'RSV-DEMO-0708-1218-OUT',
    roomId: 'FT-1218',
    ownerName: 'Pham David',
    status: 'open',
    issueTime: '12:05',
    charges: [
      makeCharge('FOL-DEMO-0708-1218-CHG-ROOM', 'room', 'Deluxe 2박 객실 요금', 2800, 'FT-1218', 'RSV-DEMO-0708-1218-OUT'),
      makeCharge('FOL-DEMO-0708-1218-CHG-GOLF', 'golf', '18홀 그린피 / 2인', 900, 'FT-1218', 'RSV-DEMO-0708-1218-OUT')
    ],
    payments: [
      makePayment('FOL-DEMO-0708-1218-PAY-TRANSFER', 'transfer', 3700, `${DEMO_BASE_DATE}T12:10:00+09:00`, '계좌이체 입금 확인, 정산 완료 대기')
    ],
    balance: 0
  },
  {
    id: 'FOL-DEMO-0708-1226-MIXED',
    reservationId: 'RSV-DEMO-0708-1226-OUT',
    roomId: 'FT-1226',
    ownerName: 'Lee Hannah',
    status: 'unpaid',
    issueTime: '13:20',
    closedAt: `${DEMO_BASE_DATE}T13:45:00+09:00`,
    charges: [
      makeCharge('FOL-DEMO-0708-1226-CHG-ROOM', 'room', 'Deluxe 1박 객실 요금', 1400, 'FT-1226', 'RSV-DEMO-0708-1226-OUT'),
      makeCharge('FOL-DEMO-0708-1226-CHG-FNB', 'fnb', '조식/세탁 서비스', 360, 'FT-1226', 'RSV-DEMO-0708-1226-OUT')
    ],
    payments: [
      makePayment('FOL-DEMO-0708-1226-PAY-CASH', 'cash', 900, `${DEMO_BASE_DATE}T13:30:00+09:00`, '페소 현금 일부 수납', { receivedCurrency: 'PHP', receivedAmount: 900 }),
      makePayment('FOL-DEMO-0708-1226-PAY-USD', 'cash', 300, `${DEMO_BASE_DATE}T13:32:00+09:00`, '달러 현금 일부 수납', { receivedCurrency: 'USD', receivedAmount: 6 })
    ],
    balance: 560
  },
  {
    id: 'FOL-DEMO-0708-1228-COMPLETE',
    reservationId: 'RSV-DEMO-0708-1228-OUT',
    roomId: 'FT-1228',
    ownerName: 'Garcia Miguel',
    status: 'closed',
    issueTime: '14:10',
    closedAt: `${DEMO_BASE_DATE}T14:35:00+09:00`,
    settlementCompleted: true,
    charges: [
      makeCharge('FOL-DEMO-0708-1228-CHG-ROOM', 'room', 'Deluxe 1박 객실 요금', 1400, 'FT-1228', 'RSV-DEMO-0708-1228-OUT'),
      makeCharge('FOL-DEMO-0708-1228-CHG-CAR', 'rentacar', '시내 투어 렌터카', 260, 'FT-1228', 'RSV-DEMO-0708-1228-OUT')
    ],
    payments: [
      makePayment('FOL-DEMO-0708-1228-PAY-CARD', 'card', 1660, `${DEMO_BASE_DATE}T14:25:00+09:00`, '카드 일괄 수납')
    ],
    balance: 0
  }
];

folioConfigs.forEach(config => upsert(folios, makeFolio(rooms, config)));

folios.forEach(folio => {
  if (['FOL-260625-DEMO-KANG-ROOM', 'FOL-260625-DEMO-PARK-DEPOSIT', 'FOL-260625-DEMO-DAVID-GOLF'].includes(folio.id)) {
    folio.status = 'unpaid';
  }
});

[
  makeOrder({ id: 'ORD-DEMO-0708-1206-01', room: '1206', guestName: 'Robert Ford', time: '09:30', status: 'new', type: 'roomservice', source: 'pos', item: '아메리카노 2잔 / 조식 세트', amount: 72 }),
  makeOrder({ id: 'ORD-DEMO-0708-V02-01', room: 'V-02', guestName: 'Tanaka Yuki', time: '10:15', status: 'preparing', type: 'dining', source: 'pos', item: '프라이빗 다이닝 준비', amount: 380 }),
  makeOrder({ id: 'ORD-DEMO-0708-1218-01', room: '1218', guestName: 'Pham David', time: '11:45', status: 'done', type: 'laundry', source: 'pos', item: '셔츠 세탁 3벌', amount: 54 }),
  makeOrder({ id: 'ORD-DEMO-0708-1226-01', room: '1226', guestName: 'Lee Hannah', time: '13:10', status: 'done', type: 'minibar', source: 'pos', item: '미니바 정산', amount: 86 })
].forEach(order => upsert(posOrders, order));

[
  makeOrder({ id: 'GLF-DEMO-0708-1218-01', room: '1218', guestName: 'Pham David', time: '07:20', status: 'new', type: 'club_a', source: 'golf', item: '18홀 그린피 / 2인', amount: 900 }),
  makeOrder({ id: 'GLF-DEMO-0708-1228-01', room: '1228', guestName: 'Garcia Miguel', time: '08:10', status: 'done', type: 'club_b', source: 'golf', item: '카트 이용권 / 클럽 대여', amount: 210 })
].forEach(order => upsert(golfOrders, order));

[
  makeOrder({ id: 'RNT-DEMO-0708-1206-01', room: '1206', guestName: 'Robert Ford', time: '09:50', status: 'prep', type: 'lotte', source: 'rentacar', item: '공항 샌딩 / 밴', amount: 420 }),
  makeOrder({ id: 'RNT-DEMO-0708-1228-01', room: '1228', guestName: 'Garcia Miguel', time: '14:00', status: 'done', type: 'sk', source: 'rentacar', item: '시내 투어 / 4시간', amount: 260 })
].forEach(order => upsert(carOrders, order));

[
  eventItem({
    id: 'EVT-DEMO-0708-001',
    type: 'frontdesk.arrival-delay',
    category: 'frontdesk',
    severity: 'warning',
    icon: 'fa-user-clock',
    title: { ko: '미도착 예약 확인', en: 'Not-arrived booking review' },
    label: { ko: '1222호 예약이 입실 예정일을 지났지만 아직 도착하지 않았습니다.', en: 'Room 1222 booking has not arrived after its check-in date.' },
    desc: { ko: '예약현황에서 미도착 배지와 체크인 가능 여부를 확인합니다.', en: 'Review the Not Arrived badge and check-in availability on the room board.' },
    time: '09:10',
    actor: 'Front Desk Kim',
    roomNo: '1222',
    target: 'frontdesk/reservation-board.html?query=1222'
  }),
  eventItem({
    id: 'EVT-DEMO-0708-002',
    type: 'billing.settlement-needed',
    category: 'billing',
    severity: 'urgent',
    icon: 'fa-file-invoice-dollar',
    title: { ko: '체크아웃 정산 필요', en: 'Checkout settlement needed' },
    label: { ko: '1205호 Maria Santos 체크아웃 정산에 미수금이 남아 있습니다.', en: 'Room 1205 Maria Santos has an outstanding checkout balance.' },
    desc: { ko: '정산현황에서 수납 후 정산 완료 처리해야 합니다.', en: 'Collect payment and complete settlement in Settlement Status.' },
    time: '10:20',
    actor: 'Cashier Mina',
    roomNo: '1205',
    folioId: 'FOL-DEMO-0708-1205-UNPAID',
    target: 'operations/settlement-status.html?query=1205'
  }),
  eventItem({
    id: 'EVT-DEMO-0708-003',
    type: 'ancillary.golf',
    category: 'ancillary',
    icon: 'fa-golf-ball-tee',
    title: { ko: '골프 바우처 출력 대기', en: 'Golf voucher pending' },
    label: { ko: '1218호 고객의 18홀 그린피 바우처 출력이 필요합니다.', en: 'Room 1218 guest needs an 18-hole golf voucher.' },
    desc: { ko: '부가서비스 상세에서 골프장 바우처를 확인하고 출력합니다.', en: 'Open ancillary detail to review and print the golf voucher.' },
    time: '11:45',
    actor: 'Concierge Park',
    roomNo: '1218',
    serviceDate: DEMO_BASE_DATE,
    target: 'operations/ancillary.html?service=golf&query=1218'
  }),
  eventItem({
    id: 'EVT-DEMO-0708-004',
    type: 'group.arrival',
    category: 'group',
    icon: 'fa-users-line',
    title: { ko: '단체 도착 준비', en: 'Group arrival preparation' },
    label: { ko: 'Nguyen 가족 모임 2실이 금일 도착 예정입니다.', en: 'Nguyen family group has two rooms arriving today.' },
    desc: { ko: '일반인 대표 단체 케이스로 객실 배정과 투숙객 명단을 확인합니다.', en: 'Review room allocation and rooming list for the private group leader case.' },
    time: '12:30',
    actor: 'Sales Nguyen',
    groupId: 'GRP-DEMO-THU-PRIVATE',
    target: 'frontdesk/groups_block_detail.html?id=GRP-DEMO-THU-PRIVATE'
  }),
  eventItem({
    id: 'EVT-DEMO-0708-005',
    type: 'housekeeping.cleaning',
    category: 'housekeeping',
    icon: 'fa-broom',
    title: { ko: '체크인 전 청소 확인', en: 'Pre-check-in cleaning check' },
    label: { ko: '1213호 VIP 체크인 전 청소 필요 상태입니다.', en: 'Room 1213 needs cleaning before VIP check-in.' },
    desc: { ko: '예약현황에서 청소 상태를 확인 후 체크인 가능 여부를 판단합니다.', en: 'Check cleaning status on the room board before check-in.' },
    time: '13:05',
    actor: 'HK Tran',
    roomNo: '1213',
    target: 'frontdesk/reservation-board.html?query=1213'
  })
].forEach(event => upsert(activities, event));

function expandDemoGroup(groupId) {
  const group = groups.find(item => item.id === groupId);
  if (!group) return null;
  group.history = group.history && group.history.length ? group.history : [
    { at: `${DEMO_BASE_DATE} 15:10`, action: '투숙객 명단 확인', note: '대표자와 동반 투숙객 신분증 확인 상태를 업데이트했습니다.' },
    { at: `${DEMO_BASE_DATE} 13:20`, action: '객실 배정 확정', note: `${(group.roomAllocations || []).map(item => item.roomNo).join(', ')} 객실 배정 확정` },
    { at: `${DAY_BEFORE} 17:00`, action: '행사 기본 정보 등록', note: `${group.name} 행사 등록 및 정산 방식 확인` }
  ];
  return group;
}

['GRP-DEMO-THU-CORP', 'GRP-DEMO-THU-PRIVATE'].forEach(groupId => {
  const group = expandDemoGroup(groupId);
  if (!group) return;
  writeJson(`groups/events/detail/${groupId}.json`, buildGroupDetail(group));
  writeJson(`groups/room-allocations/${groupId}.json`, listEnvelope(group.roomAllocations || [], `REQ-${groupId}-ALLOC`));
  writeJson(`groups/rooming-list/${groupId}.json`, listEnvelope(group.roomingList || [], `REQ-${groupId}-ROOMING`));
});

const todayCheckins = reservations.filter(res => res.checkInDate === DEMO_BASE_DATE && ['confirmed', 'pending'].includes(String(res.status || '').toLowerCase()));
const todayCheckouts = reservations.filter(res => res.checkOutDate === DEMO_BASE_DATE && ['checked-in', 'checkedin', 'checkout'].includes(String(res.status || '').toLowerCase().replace(/[-_\s]/g, '')));
const todayFolios = folios.filter(folio => (folio.checkOutDate || folio.checkoutDate || '').slice(0, 10) === DEMO_BASE_DATE || String(folio.closedAt || '').slice(0, 10) === DEMO_BASE_DATE);
const inHouse = rooms.filter(room => room.status === 'in-house').length;
const revenue = todayFolios.reduce((sum, folio) => sum + (folio.charges || []).reduce((acc, charge) => acc + amountValue(charge.amount), 0), 0);

summaryEnv.data.occupancy = Math.round((inHouse / rooms.length) * 1000) / 10;
summaryEnv.data.arrivals = todayCheckins.length;
summaryEnv.data.departures = todayCheckouts.length;
summaryEnv.data.inHouse = inHouse;
summaryEnv.data.revenueToday = money(revenue);
kpisEnv.data.rooms = rooms.length;
kpisEnv.data.groups = groups.length;
kpisEnv.data.companies = readJson('b2b/companies.json').data.items.length;
kpisEnv.data.openTasks = Math.max(6, activities.filter(item => ['urgent', 'warning'].includes(item.severity)).length);

updatePage(reservationsEnv);
timelineEnv.data.items = reservationsEnv.data.items;
updatePage(timelineEnv);
updatePage(foliosEnv);
updatePage(hkEnv);
updatePage(posEnv);
updatePage(golfEnv);
updatePage(carEnv);
updatePage(activitiesEnv);
updatePage(groupsEnv);

writeJson('rooms/index.json', updatePage(roomsEnv));
writeJson('operations/housekeeping-rooms.json', hkEnv);
writeJson('reservations/index.json', reservationsEnv);
writeJson('reservations/timeline.json', timelineEnv);
writeJson('folios/index.json', foliosEnv);
writeJson('pos/orders.json', posEnv);
writeJson('ancillaries/golf-orders.json', golfEnv);
writeJson('ancillaries/rentacar-orders.json', carEnv);
writeJson('dashboard/today-activities.json', activitiesEnv);
writeJson('groups/events.json', groupsEnv);
writeJson('dashboard/summary.json', summaryEnv);
writeJson('dashboard/kpis.json', kpisEnv);

console.log(JSON.stringify({
  demoBaseDate: DEMO_BASE_DATE,
  displaysAs: '2026-07-08',
  rooms: rooms.length,
  reservations: reservations.length,
  todayCheckins: todayCheckins.length,
  todayCheckouts: todayCheckouts.length,
  inHouse,
  todayFolios: todayFolios.length,
  posOrders: posOrders.length,
  golfOrders: golfOrders.length,
  carOrders: carOrders.length,
  activities: activities.length,
  groups: groups.length
}, null, 2));
