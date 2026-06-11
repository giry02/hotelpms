const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DASH_API = path.join(ROOT, 'dashboard', 'data', 'api', 'v1');
const ADMIN_API = path.join(ROOT, 'admin', 'data', 'api', 'v1', 'admin');
const TENANT_ID = 'TENANT-GRAND-SAIGON';
const CURRENCY = 'PHP';
const CURRENCY_SYMBOL = '₱';
const MONETARY_KEYS = new Set(['amount', 'value', 'room', 'fnb', 'spa', 'other', 'lastYear', 'thisYear', 'amt', 'v', 'minSpend']);
const NOW = '2026-05-28T09:00:00+09:00';

function page(total, page = 1, pageSize = 50) {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

function envelope(data, requestId) {
  return {
    success: true,
    data,
    meta: {
      requestId,
      tenantId: TENANT_ID,
      apiVersion: 'v8',
      generatedAt: NOW,
      timezone: 'Asia/Seoul',
      currency: CURRENCY
    }
  };
}

function listEnvelope(items, requestId, pageSize = 50) {
  return envelope({ items, page: page(items.length, 1, pageSize) }, requestId);
}

function normalizeCurrencyPayload(value, key = '') {
  if (Array.isArray(value)) return value.map(item => normalizeCurrencyPayload(item, key));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalizeCurrencyPayload(v, k)]));
  }
  if (typeof value === 'string') {
    if (value === 'KRW') return CURRENCY;
    if (value === '₩') return CURRENCY_SYMBOL;
    return value;
  }
  if (typeof value === 'number' && MONETARY_KEYS.has(key)) {
    return value === 0 ? value : Math.round(value / 1000);
  }
  return value;
}

function writeJson(base, rel, payload) {
  const file = path.join(base, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(normalizeCurrencyPayload(payload), null, 2)}\n`, 'utf8');
}

const buildings = [
  { id: 'OT', name: 'Ocean Tower', shortCode: 'Ocean', floors: 20, sortOrder: 1 },
  { id: 'FT', name: 'Forest Tower', shortCode: 'Forest', floors: 12, sortOrder: 2 },
  { id: 'LV', name: 'Lakeside Villa', shortCode: 'Villa', floors: 2, sortOrder: 3 }
];

const roomTypes = [
  { id: 'STD', code: 'STD', name: 'Standard', baseRate: { amount: 100000, currency: CURRENCY }, capacity: 2, active: true },
  { id: 'DLX', code: 'DLX', name: 'Deluxe', baseRate: { amount: 140000, currency: CURRENCY }, capacity: 3, active: true },
  { id: 'PRM', code: 'PRM', name: 'Premier', baseRate: { amount: 100000, currency: CURRENCY }, capacity: 3, active: true },
  { id: 'PTH', code: 'PTH', name: 'Penthouse', baseRate: { amount: 650000, currency: CURRENCY }, capacity: 4, active: true },
  { id: 'VIL', code: 'VIL', name: 'Pool Villa', baseRate: { amount: 380000, currency: CURRENCY }, capacity: 4, active: true }
];

const typeName = Object.fromEntries(roomTypes.map(item => [item.id, item.name]));
const typeRate = Object.fromEntries(roomTypes.map(item => [item.id, item.baseRate.amount]));
const buildingName = Object.fromEntries(buildings.map(item => [item.id, item.name]));

const rooms = [
  room('OT-PH01', 'PH01', 'OT', 20, 'PTH', 'in-house', 'dnd'),
  room('OT-PH02', 'PH02', 'OT', 20, 'PTH', 'in-house'),
  room('OT-1401', '1401', 'OT', 14, 'PRM', 'in-house'),
  room('OT-1402', '1402', 'OT', 14, 'PRM', 'in-house', 'mur'),
  room('OT-1403', '1403', 'OT', 14, 'PRM', 'in-house', 'away'),
  room('OT-1405', '1405', 'OT', 14, 'PRM', 'out-of-service'),
  room('FT-1201', '1201', 'FT', 12, 'DLX', 'in-house'),
  room('FT-1202', '1202', 'FT', 12, 'DLX', 'vacant-clean'),
  room('FT-1203', '1203', 'FT', 12, 'DLX', 'vacant-clean'),
  room('FT-1205', '1205', 'FT', 12, 'DLX', 'in-house'),
  room('FT-1206', '1206', 'FT', 12, 'DLX', 'vacant-dirty'),
  room('FT-0801', '0801', 'FT', 8, 'STD', 'in-house'),
  room('FT-0802', '0802', 'FT', 8, 'STD', 'in-house'),
  room('FT-0803', '0803', 'FT', 8, 'STD', 'vacant-clean'),
  room('LV-V01', 'V-01', 'LV', 1, 'VIL', 'in-house'),
  room('LV-V02', 'V-02', 'LV', 1, 'VIL', 'vacant-clean')
];

function room(id, roomNo, buildingId, floor, roomTypeId, status, guestFlag = 'none') {
  return {
    id,
    roomId: id,
    roomNo,
    displayName: `${buildingName[buildingId]} ${roomNo}`,
    buildingId,
    buildingName: buildingName[buildingId],
    floor,
    roomTypeId,
    roomTypeName: typeName[roomTypeId],
    status,
    housekeepingStatus: status === 'vacant-dirty' ? 'dirty' : status === 'vacant-clean' ? 'clean' : 'occupied',
    frontStatus: status,
    guestFlag,
    baseRate: { amount: typeRate[roomTypeId], currency: CURRENCY },
    active: true
  };
}

const companies = [
  {
    id: 'COMP-1001',
    name: '삼성전자',
    displayName: '삼성전자 (Samsung) (기업)',
    type: 'corporate',
    status: 'active',
    discountPercent: 15,
    currency: CURRENCY,
    contact: { name: '김지연', phone: '+82 10 1234 5678', email: 'event@samsung.example' },
    billing: { paymentTerm: 'master-folio', taxInvoice: true },
    notes: '컨퍼런스 행사 우선 배정'
  },
  {
    id: 'COMP-1002',
    name: '하나투어',
    displayName: '하나투어 (Hana Tour) (여행사)',
    type: 'agency',
    status: 'active',
    discountPercent: 12,
    currency: CURRENCY,
    contact: { name: '박서준', phone: '+82 2 1544 0000', email: 'groups@hanatour.example' },
    billing: { paymentTerm: 'agency-credit', taxInvoice: true },
    notes: '월말 일괄 정산'
  },
  {
    id: 'COMP-1003',
    name: '롯데푸드',
    displayName: '롯데푸드 (기업)',
    type: 'corporate',
    status: 'active',
    discountPercent: 10,
    currency: CURRENCY,
    contact: { name: '이현우', phone: '+82 10 5555 2200', email: 'admin@lottefood.example' },
    billing: { paymentTerm: 'company-card', taxInvoice: false },
    notes: '소규모 임원 방문'
  }
];

const roomAllocations = [
  allocation('ALLOC-260527-1401', 'GRP-260527-01', 'OT-1401', 'COMP-1001', 15),
  allocation('ALLOC-260527-0801', 'GRP-260527-01', 'FT-0801', 'COMP-1001', 15),
  allocation('ALLOC-260527-0802', 'GRP-260527-01', 'FT-0802', 'COMP-1001', 15),
  allocation('ALLOC-260527-0803', 'GRP-260527-01', 'FT-0803', 'COMP-1001', 15)
];

function allocation(id, groupId, roomId, companyId, discountPercent) {
  const rm = rooms.find(item => item.id === roomId);
  const baseRate = rm.baseRate.amount;
  return {
    id,
    groupId,
    companyId,
    roomId,
    roomNo: rm.roomNo,
    roomLabel: `${rm.buildingName} ${rm.roomNo}`,
    buildingId: rm.buildingId,
    buildingName: rm.buildingName,
    roomTypeId: rm.roomTypeId,
    roomTypeName: rm.roomTypeName,
    baseRate: { amount: baseRate, currency: CURRENCY },
    discountPercent,
    finalRate: { amount: Math.round(baseRate * (100 - discountPercent) / 100), currency: CURRENCY },
    status: 'reserved',
    createdAt: '2026-05-27T16:10:00+09:00'
  };
}

const roomingList = [
  {
    id: 'RMG-260527-1401-A',
    groupId: 'GRP-260527-01',
    guestId: 'G-9001',
    roomId: 'OT-1401',
    roomNo: '1401',
    name: 'Alexander Kim',
    role: 'primary',
    phone: '+82 10 9900 1401',
    email: 'alexander.kim@example.com',
    nationality: 'Korea',
    docType: 'passport',
    docMasked: 'M****123',
    docStatus: 'verified',
    specialNotes: '견과류 알러지, 저자극 베개 요청',
    registeredAt: '2026-05-27T17:20:00+09:00'
  },
  {
    id: 'RMG-260527-0801-A',
    groupId: 'GRP-260527-01',
    guestId: 'G-9002',
    roomId: 'FT-0801',
    roomNo: '0801',
    name: 'Lee Hannah',
    role: 'primary',
    phone: '+82 10 9900 0801',
    email: 'hannah.lee@example.com',
    nationality: 'Korea',
    docType: 'id-card',
    docMasked: '******-2******',
    docStatus: 'verified',
    specialNotes: '',
    registeredAt: '2026-05-27T17:28:00+09:00'
  }
];

const groups = [
  {
    id: 'GRP-260527-01',
    name: 'Samsung Tech Conference 2026',
    companyId: 'COMP-1001',
    companyName: '삼성전자',
    type: 'corporate-conference',
    status: 'in-house',
    checkInDate: '2026-05-27',
    checkOutDate: '2026-05-30',
    blockedRooms: 4,
    pickedUpRooms: 2,
    pax: 70,
    eventDiscountPercent: 15,
    currency: CURRENCY,
    routing: 'Master Folio (단체 일괄)',
    salesManagerId: 's3',
    salesManagerName: '김지연',
    contact: { name: '김지연', phone: '+82 10 1234 5678', email: 'event@samsung.example' },
    note: 'VIP 동선 및 조식 쿠폰 별도 전달',
    roomAllocations,
    roomingList
  },
  {
    id: 'GRP-260610-01',
    name: 'Global Partner Summit 2026',
    companyId: 'COMP-1003',
    companyName: '롯데푸드',
    type: 'corporate-meeting',
    status: 'confirmed',
    checkInDate: '2026-06-10',
    checkOutDate: '2026-06-12',
    blockedRooms: 6,
    pickedUpRooms: 0,
    pax: 12,
    eventDiscountPercent: 8,
    currency: CURRENCY,
    routing: 'Company Card',
    salesManagerId: 's2',
    salesManagerName: 'Robert Ford',
    contact: { name: '이현우', phone: '+82 10 5555 2200', email: 'admin@lottefood.example' },
    note: '아직 투숙객 명단 미수령',
    roomAllocations: [],
    roomingList: []
  },
  {
    id: 'GRP-260518-01',
    name: 'Hana Tour Spring Package',
    companyId: 'COMP-1002',
    companyName: '하나투어',
    type: 'travel-agency',
    status: 'departed',
    checkInDate: '2026-05-18',
    checkOutDate: '2026-05-20',
    blockedRooms: 10,
    pickedUpRooms: 10,
    pax: 20,
    eventDiscountPercent: 15,
    currency: CURRENCY,
    routing: 'Travel Agency Account',
    salesManagerId: 's4',
    salesManagerName: 'Sarah Connor',
    contact: { name: '박서준', phone: '+82 2 1544 0000', email: 'groups@hanatour.example' },
    note: '미정산 금액 확인 필요',
    roomAllocations: [],
    roomingList: []
  }
];

const reservations = [
  reservation('RSV-0001', 'OT-PH01', 'G-1001', 'Nguyen Michael', 'Direct', 'checked-in', '2026-05-27', '2026-05-29', 650000),
  reservation('RSV-0002', 'OT-PH02', 'G-1002', 'Kim Thi', 'OTA', 'checked-in', '2026-05-27', '2026-05-29', 650000),
  reservation('RSV-0003', 'OT-1402', 'G-1003', 'Pham David', 'Corporate', 'confirmed', '2026-05-28', '2026-05-30', 100000),
  reservation('RSV-0004', 'OT-1403', 'G-1004', 'Martinez Charles', 'Direct', 'confirmed', '2026-05-29', '2026-06-01', 100000, { vip: 'Gold', isVip: true }),
  groupReservation('RSV-GRP-260527-01-1401', 'OT-1401', 'ALLOC-260527-1401', 'RMG-260527-1401-A', 'Alexander Kim'),
  groupReservation('RSV-GRP-260527-01-0801', 'FT-0801', 'ALLOC-260527-0801', 'RMG-260527-0801-A', 'Lee Hannah'),
  groupReservation('RSV-GRP-260527-01-0802', 'FT-0802', 'ALLOC-260527-0802', '', ''),
  groupReservation('RSV-GRP-260527-01-0803', 'FT-0803', 'ALLOC-260527-0803', '', '')
];

function reservation(id, roomId, guestId, guestName, channel, status, checkInDate, checkOutDate, rate, extra = {}) {
  const rm = rooms.find(item => item.id === roomId);
  return {
    id,
    reservationId: id,
    tenantId: TENANT_ID,
    roomId,
    roomNo: rm.roomNo,
    roomLabel: `${rm.buildingName} ${rm.roomNo}`,
    roomTypeId: rm.roomTypeId,
    roomTypeName: rm.roomTypeName,
    guestId,
    guestName,
    channel,
    status,
    checkInDate,
    checkOutDate,
    start: Math.round((new Date(checkInDate) - new Date('2026-05-12')) / 86400000),
    len: Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / 86400000)),
    rate: { amount: rate, currency: CURRENCY },
    totalAmount: { amount: rate * Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / 86400000)), currency: CURRENCY },
    isB2B: false,
    isGroupPlaceholder: false,
    ...extra
  };
}

function groupReservation(id, roomId, allocationId, roomingGuestId, roomingGuestName) {
  const alloc = roomAllocations.find(item => item.id === allocationId);
  const assigned = !!roomingGuestName;
  return {
    id,
    reservationId: id,
    tenantId: TENANT_ID,
    groupId: 'GRP-260527-01',
    companyId: 'COMP-1001',
    groupName: 'Samsung Tech Conference 2026',
    companyName: '삼성전자',
    roomId,
    roomNo: alloc.roomNo,
    roomLabel: alloc.roomLabel,
    roomTypeId: alloc.roomTypeId,
    roomTypeName: alloc.roomTypeName,
    allocationId,
    roomingGuestId,
    roomingGuestName,
    guestId: roomingGuestId ? roomingGuestId.replace('RMG', 'GUEST') : '',
    guestName: roomingGuestName,
    channel: 'Group',
    status: assigned ? 'confirmed' : 'blocked',
    checkInDate: '2026-05-27',
    checkOutDate: '2026-05-30',
    start: 15,
    len: 3,
    rate: alloc.finalRate,
    totalAmount: { amount: alloc.finalRate.amount * 3, currency: CURRENCY },
    isB2B: true,
    isGroupPlaceholder: !assigned,
    discountPercent: alloc.discountPercent,
    specialNotes: roomingGuestName === 'Alexander Kim' ? '견과류 알러지, 저자극 베개 요청' : ''
  };
}

const guests = [
  guest('G-1001', 'Nguyen Michael', 'Vietnam', 'Gold', '+84 90 000 1001', 'michael.nguyen@example.com', 'verified', ''),
  guest('G-1002', 'Kim Thi', 'Vietnam', 'Silver', '+84 90 000 1002', 'kim.thi@example.com', 'verified', 'Late checkout 선호'),
  guest('G-1003', 'Pham David', 'Vietnam', 'Standard', '+84 90 000 1003', 'david.pham@example.com', 'pending', ''),
  guest('G-1004', 'Martinez Charles', 'USA', 'Gold', '+1 415 000 1004', 'charles.martinez@example.com', 'verified', 'VIP welcome amenity'),
  guest('G-0015', 'Robert Ford', 'USA', 'Gold', '+1 415 000 0015', 'g-0015@example.com', 'pending', ''),
  guest('G-9001', 'Alexander Kim', 'Korea', 'Group', '+82 10 9900 1401', 'alexander.kim@example.com', 'verified', '견과류 알러지, 저자극 베개 요청'),
  guest('G-9002', 'Lee Hannah', 'Korea', 'Group', '+82 10 9900 0801', 'hannah.lee@example.com', 'verified', '')
];

const membershipTiers = [
  { id: 'standard', name: 'Standard', minSpend: 0 },
  { id: 'silver', name: 'Silver', minSpend: 300000 },
  { id: 'gold', name: 'Gold', minSpend: 800000 },
  { id: 'group', name: 'Group', minSpend: 0 }
];

function guest(id, name, nationality, tier, phone, email, docStatus, specialNotes) {
  return {
    id,
    name,
    nationality,
    tier,
    phone,
    email,
    status: 'active',
    document: { type: nationality === 'Korea' ? 'id-card' : 'passport', maskedNumber: nationality === 'Korea' ? '******-*******' : 'P****789', status: docStatus },
    specialNotes,
    lastStayDate: '2026-05-27',
    totalSpend: { amount: tier === 'Group' ? 0 : 480000, currency: CURRENCY },
    tags: tier === 'Group' ? ['group-guest'] : []
  };
}

const rateCalendar = [
  ...['2026-05-27', '2026-05-28', '2026-05-29', '2026-05-30'].flatMap(date =>
    roomTypes.map(rt => ({
      id: `RATE-${date}-${rt.id}`,
      date,
      roomTypeId: rt.id,
      roomTypeName: rt.name,
      baseRate: rt.baseRate,
      publicRate: { amount: Math.round(rt.baseRate.amount * (date === '2026-05-29' ? 1.15 : 1)), currency: CURRENCY },
      vipDiscountPercent: 8,
      companyDiscountPercent: 15,
      companyRate: { amount: Math.round(rt.baseRate.amount * 0.85), currency: CURRENCY },
      closed: false
    }))
  )
];

const tasks = [
  { id: 'TASK-1001', roomId: 'OT-1401', roomNo: '1401', type: 'stayover', status: 'dirty', priority: true, note: '단체 VIP 객실, 알러지 베개 확인', assigneeId: 's5' },
  { id: 'TASK-1002', roomId: 'FT-1206', roomNo: '1206', type: 'checkout', status: 'dirty', priority: false, note: '체크아웃 후 청소', assigneeId: 's5' },
  { id: 'TASK-1003', roomId: 'OT-1405', roomNo: '1405', type: 'maintenance', status: 'progress', priority: true, note: '욕실 배수 점검', assigneeId: 's7' }
];

const maintenanceRequests = [
  { id: 'REQ-1001', roomId: 'OT-1405', roomNo: '1405', type: 'plumbing', desc: '욕실 배수 점검', status: 'progress', priority: 'high', assigneeId: 's7', createdAt: NOW },
  { id: 'REQ-1002', roomId: 'FT-0803', roomNo: '0803', type: 'amenity', desc: '추가 타월 요청', status: 'pending', priority: 'normal', assigneeId: '', createdAt: NOW }
];

const staff = [
  { id: 's1', name: 'Nguyen Kim', init: 'NK', email: 'kim@hotel.example', roleId: 'sys_admin', status: 'online', last: '방금 전', color: '#6D28D9' },
  { id: 's2', name: 'Robert Ford', init: 'RF', email: 'gm@hotel.example', roleId: 'sys_gm', status: 'online', last: '10분 전', color: '#111827' },
  { id: 's3', name: '김지연', init: 'JK', email: 'sales@hotel.example', roleId: 'sys_desk', status: 'online', last: '방금 전', color: '#2563EB' },
  { id: 's4', name: 'Sarah Connor', init: 'SC', email: 'desk@hotel.example', roleId: 'sys_desk', status: 'offline', last: '2시간 전', color: '#2563EB' },
  { id: 's5', name: 'Maria Garcia', init: 'MG', email: 'housekeeping@hotel.example', roleId: 'sys_housekeeping', status: 'online', last: '30분 전', color: '#059669' },
  { id: 's7', name: '김철수', init: 'CS', email: 'maintenance@hotel.example', roleId: 'sys_maintenance', status: 'online', last: '방금 전', color: '#D97706' }
];

const menus = [
  { key: 'dashboard', icon: 'fa-gauge-high', label: '대시보드' },
  { key: 'reservation', icon: 'fa-calendar-days', label: '예약 관리' },
  { key: 'checkin', icon: 'fa-right-to-bracket', label: '체크인/아웃' },
  { key: 'crm', icon: 'fa-users', label: '투숙객 CRM' },
  { key: 'groups', icon: 'fa-users-line', label: '단체 관리' },
  { key: 'rooms', icon: 'fa-bed', label: '객실 관리' },
  { key: 'rates', icon: 'fa-tags', label: '요금 캘린더' },
  { key: 'housekeeping', icon: 'fa-broom', label: '하우스키핑' },
  { key: 'maintenance', icon: 'fa-toolbox', label: '시설 보수' },
  { key: 'folio', icon: 'fa-file-invoice-dollar', label: '정산/청구' },
  { key: 'ancillary', icon: 'fa-concierge-bell', label: '부가서비스' },
  { key: 'settings', icon: 'fa-gear', label: '호텔 설정' },
  { key: 'staff', icon: 'fa-users-gear', label: '직원 관리' },
  { key: 'billing', icon: 'fa-credit-card', label: '요금 및 결제' }
];

const roles = [
  { id: 'sys_admin', name: 'Admin', color: '#6D28D9', desc: '전체 접근', isSystem: true, perms: menus.map(m => m.key) },
  { id: 'sys_gm', name: 'General Manager', color: '#111827', desc: '총괄 매니저', isSystem: true, perms: menus.map(m => m.key).filter(k => k !== 'billing') },
  { id: 'sys_desk', name: 'Front Desk', color: '#2563EB', desc: '프런트 데스크', isSystem: true, perms: ['dashboard', 'reservation', 'checkin', 'crm', 'groups', 'rooms', 'folio', 'ancillary'] },
  { id: 'sys_housekeeping', name: 'Housekeeping', color: '#059669', desc: '하우스키핑', isSystem: true, perms: ['housekeeping', 'rooms'] },
  { id: 'sys_maintenance', name: 'Maintenance', color: '#D97706', desc: '시설 보수', isSystem: true, perms: ['maintenance', 'rooms'] },
  { id: 'custom_sales', name: 'Sales Coordinator', color: '#0EA5E9', desc: '단체 행사/업체 관리', isSystem: false, perms: ['groups', 'reservation', 'rates'] }
];

const folios = [
  {
    id: 'FOL-1001',
    groupId: 'GRP-260527-01',
    companyId: 'COMP-1001',
    ownerName: 'Samsung Tech Conference 2026',
    status: 'open',
    balance: { amount: 867000, currency: CURRENCY },
    charges: [
      { id: 'CHG-1', type: 'room', desc: 'OT 1401 room charge', amount: { amount: 255000, currency: CURRENCY } },
      { id: 'CHG-2', type: 'room', desc: 'FT 0801 room charge', amount: { amount: 255000, currency: CURRENCY } },
      { id: 'CHG-3', type: 'fnb', desc: '조식 쿠폰', amount: { amount: 357000, currency: CURRENCY } }
    ],
    payments: []
  }
];

const dailyReport = [
  { date: '2026-05-22', room: 18500000, fnb: 3200000, spa: 1900000, other: 1400000 },
  { date: '2026-05-23', room: 17600000, fnb: 3150000, spa: 1940000, other: 1340000 },
  { date: '2026-05-24', room: 17800000, fnb: 3160000, spa: 1880000, other: 1320000 },
  { date: '2026-05-25', room: 17350000, fnb: 3120000, spa: 1910000, other: 1310000 },
  { date: '2026-05-26', room: 16650000, fnb: 3030000, spa: 1810000, other: 1280000 },
  { date: '2026-05-27', room: 17250000, fnb: 3160000, spa: 1930000, other: 1300000 },
  { date: '2026-05-28', room: 15950000, fnb: 2970000, spa: 1720000, other: 1240000 }
];

const adminTenantApplications = [
  { id: 'APP-20260528-001', hotelName: 'Seoul Tower Hotel', rooms: 180, country: 'South Korea', city: 'Seoul', plan: 'Standard', currency: CURRENCY, contactName: '정민호', phone: '+82 10 1111 2222', email: 'admin@seoultower.example', status: 'reviewing', submittedAt: '2026-05-28' },
  { id: 'APP-20260526-002', hotelName: 'Da Nang Boutique', rooms: 96, country: 'Vietnam', city: 'Da Nang', plan: 'Free', currency: 'VND', contactName: 'Tran Linh', phone: '+84 90 333 4444', email: 'owner@danangboutique.example', status: 'approved', submittedAt: '2026-05-26' }
];

const adminTenants = [
  { id: TENANT_ID, hotelName: 'The Grand Saigon', country: 'Vietnam', city: 'Ho Chi Minh', plan: 'Premium', rooms: 320, status: 'active', contractStart: '2025-01-01', contractEnd: '2027-12-31', currency: CURRENCY },
  { id: 'TENANT-HANOI-LAKE', hotelName: 'Hanoi Lakeside', country: 'Vietnam', city: 'Hanoi', plan: 'Standard', rooms: 180, status: 'active', contractStart: '2025-06-01', contractEnd: '2027-05-31', currency: 'VND' },
  { id: 'TENANT-JEJU-BAY', hotelName: 'Jeju Bay Resort', country: 'South Korea', city: 'Jeju', plan: 'Standard', rooms: 210, status: 'trial', contractStart: '2026-05-01', contractEnd: '2026-06-30', currency: CURRENCY }
];

const adminUsers = [
  { id: 'ADM-1', name: 'Super Admin', email: 'superadmin@platform.example', role: 'Platform Owner', status: 'active', lastLogin: NOW },
  { id: 'ADM-2', name: 'Ops Manager', email: 'ops@platform.example', role: 'Operations', status: 'active', lastLogin: '2026-05-27T18:40:00+09:00' }
];

const adminBilling = [
  { id: 'INV-202605-001', tenantId: TENANT_ID, hotelName: 'The Grand Saigon', plan: 'Premium', amount: 1250000, currency: CURRENCY, status: 'paid', issuedAt: '2026-05-01', dueAt: '2026-05-10' },
  { id: 'INV-202605-002', tenantId: 'TENANT-HANOI-LAKE', hotelName: 'Hanoi Lakeside', plan: 'Standard', amount: 650000, currency: CURRENCY, status: 'open', issuedAt: '2026-05-01', dueAt: '2026-05-10' }
];

const auditLogs = [
  { id: 'AUD-1001', actor: 'Super Admin', action: 'tenant.approve', target: 'APP-20260526-002', ip: '10.0.0.12', createdAt: '2026-05-26T15:10:00+09:00' },
  { id: 'AUD-1002', actor: 'Ops Manager', action: 'user.password_reset', target: TENANT_ID, ip: '10.0.0.14', createdAt: '2026-05-27T12:00:00+09:00' }
];

const supportTickets = [
  { id: 'TCK-1001', tenantId: TENANT_ID, hotelName: 'The Grand Saigon', title: '요금 캘린더 저장 확인 요청', status: 'open', priority: 'normal', createdAt: NOW },
  { id: 'TCK-1002', tenantId: 'TENANT-HANOI-LAKE', hotelName: 'Hanoi Lakeside', title: '관리자 비밀번호 초기화', status: 'pending', priority: 'high', createdAt: '2026-05-27T10:15:00+09:00' }
];

function writeDashboardData() {
  writeJson(DASH_API, 'auth/me.json', envelope({ user: staff[0], tenantId: TENANT_ID, hotelName: 'The Grand Saigon' }, 'REQ-AUTH-ME'));
  writeJson(DASH_API, 'buildings/index.json', listEnvelope(buildings, 'REQ-BUILDINGS-LIST'));
  writeJson(DASH_API, 'room-types/index.json', listEnvelope(roomTypes, 'REQ-ROOM-TYPES-LIST'));
  writeJson(DASH_API, 'rooms/index.json', listEnvelope(rooms, 'REQ-ROOMS-LIST'));
  writeJson(DASH_API, 'rooms/availability.json', listEnvelope(rooms.filter(item => item.status.startsWith('vacant')), 'REQ-ROOMS-AVAILABILITY'));
  writeJson(DASH_API, 'reservations/index.json', listEnvelope(reservations, 'REQ-RESERVATIONS-LIST'));
  writeJson(DASH_API, 'reservations/timeline.json', listEnvelope(reservations, 'REQ-RESERVATIONS-TIMELINE'));
  reservations.forEach(item => writeJson(DASH_API, `reservations/detail/${item.id}.json`, envelope(item, `REQ-RESERVATION-${item.id}`)));
  writeJson(DASH_API, 'reservations/create.sample.json', envelope({ id: 'RSV-NEW-SAMPLE', status: 'confirmed', message: 'Mock reservation created' }, 'REQ-RESERVATION-CREATE'));
  writeJson(DASH_API, 'reservations/update.sample.json', envelope({ status: 'updated' }, 'REQ-RESERVATION-UPDATE'));
  writeJson(DASH_API, 'reservations/cancel.sample.json', envelope({ status: 'cancelled' }, 'REQ-RESERVATION-CANCEL'));
  writeJson(DASH_API, 'reservations/check-in.sample.json', envelope({ status: 'checked-in' }, 'REQ-RESERVATION-CHECKIN'));
  writeJson(DASH_API, 'reservations/check-out.sample.json', envelope({ status: 'checked-out' }, 'REQ-RESERVATION-CHECKOUT'));
  writeJson(DASH_API, 'b2b/companies.json', listEnvelope(companies, 'REQ-COMPANIES-LIST'));
  writeJson(DASH_API, 'b2b/company-create.sample.json', envelope({ id: 'COMP-NEW-SAMPLE', status: 'active' }, 'REQ-COMPANY-CREATE'));
  writeJson(DASH_API, 'b2b/company-update.sample.json', envelope({ status: 'updated' }, 'REQ-COMPANY-UPDATE'));
  writeJson(DASH_API, 'b2b/rate-policy.sample.json', envelope({ companyId: 'COMP-1001', discountPercent: 15 }, 'REQ-COMPANY-RATE-POLICY'));
  writeJson(DASH_API, 'groups/events.json', listEnvelope(groups, 'REQ-GROUPS-EVENTS'));
  groups.forEach(item => writeJson(DASH_API, `groups/events/detail/${item.id}.json`, envelope(item, `REQ-GROUP-${item.id}`)));
  writeJson(DASH_API, 'groups/room-allocations/GRP-260527-01.json', listEnvelope(roomAllocations, 'REQ-GROUP-ALLOCATIONS'));
  writeJson(DASH_API, 'groups/rooming-list/GRP-260527-01.json', listEnvelope(roomingList, 'REQ-GROUP-ROOMING'));
  writeJson(DASH_API, 'groups/sync-reservations.sample.json', envelope({ createdReservations: reservations.filter(item => item.groupId).length }, 'REQ-GROUP-SYNC'));
  writeJson(DASH_API, 'groups/room-allocations-save.sample.json', envelope({ status: 'saved' }, 'REQ-GROUP-ALLOCATIONS-SAVE'));
  writeJson(DASH_API, 'groups/rooming-list-create.sample.json', envelope({ status: 'saved' }, 'REQ-GROUP-ROOMING-CREATE'));
  writeJson(DASH_API, 'crm/guests.json', listEnvelope(guests, 'REQ-GUESTS-LIST'));
  writeJson(DASH_API, 'crm/membership-tiers.json', listEnvelope(membershipTiers, 'REQ-MEMBERSHIP-TIERS'));
  writeJson(DASH_API, 'crm/tier-history.json', listEnvelope([
    { id: 'TH-1', guestId: 'G-1004', guestName: 'Martinez Charles', beforeTier: 'Silver', afterTier: 'Gold', reason: '누적 매출 기준 도달', changedAt: '2026-05-27' }
  ], 'REQ-TIER-HISTORY'));
  writeJson(DASH_API, 'crm/documents.sample.json', envelope({ status: 'uploaded', maskedNumber: 'P****789' }, 'REQ-GUEST-DOCUMENT'));
  writeJson(DASH_API, 'crm/notes.sample.json', envelope({ status: 'saved' }, 'REQ-GUEST-NOTE'));
  writeJson(DASH_API, 'rates/calendar.json', listEnvelope(rateCalendar, 'REQ-RATES-CALENDAR', 200));
  writeJson(DASH_API, 'rates/quote.sample.json', envelope({ roomTypeId: 'STD', baseRate: { amount: 100000, currency: CURRENCY }, discountPercent: 15, finalRate: { amount: 85000, currency: CURRENCY } }, 'REQ-RATE-QUOTE'));
  writeJson(DASH_API, 'operations/tasks.json', listEnvelope(tasks, 'REQ-OPS-TASKS'));
  writeJson(DASH_API, 'operations/housekeeping-rooms.json', listEnvelope(rooms.map(item => ({ roomId: item.id, roomNo: item.roomNo, status: item.housekeepingStatus, guestFlag: item.guestFlag })), 'REQ-HOUSEKEEPING-ROOMS'));
  writeJson(DASH_API, 'operations/maintenance-requests.json', listEnvelope(maintenanceRequests, 'REQ-MAINTENANCE-REQUESTS'));
  writeJson(DASH_API, 'operations/task-update.sample.json', envelope({ status: 'updated' }, 'REQ-TASK-UPDATE'));
  writeJson(DASH_API, 'pos/orders.json', listEnvelope([
    { id: 'ORD-5001', roomId: 'OT-1401', roomNo: '1401', items: ['클럽 샌드위치', '아메리카노 2'], total: { amount: 45000, currency: CURRENCY }, status: 'preparing', time: '11:05' },
    { id: 'ORD-5002', roomId: 'OT-PH01', roomNo: 'PH01', items: ['조식 세트 A'], total: { amount: 85000, currency: CURRENCY }, status: 'done', time: '07:30' }
  ], 'REQ-POS-ORDERS'));
  writeJson(DASH_API, 'ancillaries/golf-orders.json', listEnvelope([
    { id: 'GLF-P001', roomId: 'OT-1401', roomNo: '1401', guest: 'Alexander Kim', type: 'club_a', items: '18홀 / 4인', total: { amount: 450000, currency: CURRENCY }, status: 'new', time: '14:00' }
  ], 'REQ-GOLF-ORDERS'));
  writeJson(DASH_API, 'ancillaries/rentacar-orders.json', listEnvelope([
    { id: 'RNT-P001', roomId: 'OT-PH01', roomNo: 'PH01', guest: 'Nguyen Michael', type: 'lotte', items: '그랜저 / 2일', total: { amount: 180000, currency: CURRENCY }, status: 'new', time: '10:00' }
  ], 'REQ-RENTACAR-ORDERS'));
  writeJson(DASH_API, 'folios/index.json', listEnvelope(folios, 'REQ-FOLIOS-LIST'));
  folios.forEach(item => writeJson(DASH_API, `folios/detail/${item.id}.json`, envelope(item, `REQ-FOLIO-${item.id}`)));
  writeJson(DASH_API, 'reports/revenue-daily.json', listEnvelope(dailyReport, 'REQ-REPORT-DAILY'));
  writeJson(DASH_API, 'reports/revenue-monthly.json', listEnvelope(Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value: i < 5 ? 580000000 + i * 24000000 : 0 })), 'REQ-REPORT-MONTHLY'));
  writeJson(DASH_API, 'reports/revenue-yoy.json', listEnvelope(Array.from({ length: 12 }, (_, i) => ({ month: i + 1, lastYear: 550000000 + i * 12000000, thisYear: i < 5 ? 580000000 + i * 24000000 : 0 })), 'REQ-REPORT-YOY'));
  writeJson(DASH_API, 'reports/revenue-departments.json', listEnvelope([
    { name: '객실', sub: 'Room Revenue', pct: 72, amt: 118260000, icon: 'fa-bed', color: 'var(--primary)', lt: 'var(--primary-lt)' },
    { name: '통합 POS', sub: 'F&B, Retail', pct: 15, amt: 24630000, icon: 'fa-cash-register', color: 'var(--success)', lt: 'rgba(16,185,129,0.15)' },
    { name: '골프', sub: 'Green Fee, Cart', pct: 8, amt: 13140000, icon: 'fa-golf-ball-tee', color: 'var(--purple)', lt: 'rgba(139,92,246,0.15)' },
    { name: '렌터카', sub: 'Car Rentals', pct: 5, amt: 8220000, icon: 'fa-car', color: 'var(--orange)', lt: 'rgba(245,158,11,0.15)' }
  ], 'REQ-REPORT-DEPARTMENTS'));
  writeJson(DASH_API, 'reports/revenue-trend.json', listEnvelope(dailyReport.map(item => ({
    date: item.date,
    room: { v: item.room, d: 2.1 },
    pos: { v: item.fnb, d: 1.4 },
    golf: { v: item.spa, d: -0.8 },
    car: { v: item.other, d: 0.9 }
  })), 'REQ-REPORT-TREND'));
  writeJson(DASH_API, 'night-audit/preview.json', envelope({ businessDate: '2026-05-28', openFolios: 3, unsettledGroups: 1, expectedRevenue: { amount: 22890000, currency: CURRENCY } }, 'REQ-NIGHT-AUDIT-PREVIEW'));
  writeJson(DASH_API, 'dashboard/summary.json', envelope({
    occupancy: 78,
    arrivals: reservations.filter(item => item.checkInDate === '2026-05-28').length,
    departures: reservations.filter(item => item.checkOutDate === '2026-05-28').length,
    inHouse: reservations.filter(item => item.status === 'checked-in' || item.status === 'blocked').length,
    revenueToday: { amount: 22890000, currency: CURRENCY }
  }, 'REQ-DASHBOARD-SUMMARY'));
  writeJson(DASH_API, 'dashboard/kpis.json', envelope({ rooms: rooms.length, groups: groups.length, companies: companies.length, openTasks: tasks.length }, 'REQ-DASHBOARD-KPIS'));
  writeJson(DASH_API, 'dashboard/revenue-chart.json', listEnvelope(dailyReport, 'REQ-DASHBOARD-REVENUE'));
  writeJson(DASH_API, 'dashboard/today-activities.json', listEnvelope([
    { id: 'ACT-1', type: 'group', label: 'Samsung Tech Conference rooming update', time: '09:20' },
    { id: 'ACT-2', type: 'task', label: 'OT-1405 maintenance in progress', time: '10:10' }
  ], 'REQ-DASHBOARD-ACTIVITIES'));
  writeJson(DASH_API, 'settings/hotel.json', envelope({ id: TENANT_ID, name: 'The Grand Saigon', country: 'Vietnam', city: 'Ho Chi Minh', timezone: 'Asia/Seoul', defaultCurrency: CURRENCY }, 'REQ-SETTINGS-HOTEL'));
  writeJson(DASH_API, 'settings/currency.json', envelope({ defaultCurrency: CURRENCY, supported: ['USD', 'PHP', 'VND', 'THB', 'JPY', 'KRW'], display: { symbol: CURRENCY_SYMBOL, decimals: 2 } }, 'REQ-SETTINGS-CURRENCY'));
  writeJson(DASH_API, 'settings/menus.json', listEnvelope(menus, 'REQ-SETTINGS-MENUS'));
  writeJson(DASH_API, 'settings/roles.json', listEnvelope(roles, 'REQ-SETTINGS-ROLES'));
  writeJson(DASH_API, 'settings/staff.json', listEnvelope(staff, 'REQ-SETTINGS-STAFF'));
  writeJson(DASH_API, 'settings/maintenance-types.json', listEnvelope([
    { id: 'mt1', name: '전기/조명' },
    { id: 'mt2', name: '배관/수도' },
    { id: 'mt3', name: '에어컨/난방' },
    { id: 'mt4', name: '가구/비품' },
    { id: 'mt5', name: '도어/잠금장치' },
    { id: 'mt6', name: '엘리베이터' },
    { id: 'mt7', name: '기타' }
  ], 'REQ-SETTINGS-MAINTENANCE-TYPES'));
  writeJson(DASH_API, 'settings/billing.json', envelope({ plan: 'Premium', nextInvoiceAt: '2026-06-01', paymentMethod: 'corporate-card' }, 'REQ-SETTINGS-BILLING'));
}

function writeAdminData() {
  writeJson(ADMIN_API, 'dashboard/summary.json', envelope({ tenants: adminTenants.length, applications: adminTenantApplications.length, monthlyRecurringRevenue: { amount: 1900000, currency: CURRENCY }, openTickets: supportTickets.filter(item => item.status !== 'closed').length }, 'REQ-ADMIN-DASHBOARD'));
  writeJson(ADMIN_API, 'tenant-applications.json', listEnvelope(adminTenantApplications, 'REQ-ADMIN-TENANT-APPLICATIONS'));
  writeJson(ADMIN_API, 'tenants.json', listEnvelope(adminTenants, 'REQ-ADMIN-TENANTS'));
  adminTenants.forEach(item => writeJson(ADMIN_API, `tenants/detail/${item.id}.json`, envelope(item, `REQ-ADMIN-TENANT-${item.id}`)));
  writeJson(ADMIN_API, `tenants/users/${TENANT_ID}.json`, listEnvelope(staff.map(item => ({ ...item, tenantId: TENANT_ID })), 'REQ-ADMIN-TENANT-USERS'));
  writeJson(ADMIN_API, 'users.json', listEnvelope(adminUsers, 'REQ-ADMIN-USERS'));
  writeJson(ADMIN_API, 'billing-summary.json', envelope({ open: 1, paid: 1, overdue: 0, mrr: { amount: 1900000, currency: CURRENCY } }, 'REQ-ADMIN-BILLING-SUMMARY'));
  writeJson(ADMIN_API, 'billing.json', listEnvelope(adminBilling, 'REQ-ADMIN-BILLING'));
  writeJson(ADMIN_API, 'audit-logs.json', listEnvelope(auditLogs, 'REQ-ADMIN-AUDIT-LOGS'));
  writeJson(ADMIN_API, 'support-tickets.json', listEnvelope(supportTickets, 'REQ-ADMIN-SUPPORT-TICKETS'));
  writeJson(ADMIN_API, 'notices.json', listEnvelope([
    { id: 'NOT-1', title: 'v8 API mock 연동 안내', status: 'published', publishedAt: '2026-05-28' }
  ], 'REQ-ADMIN-NOTICES'));
  writeJson(ADMIN_API, 'integrations.json', listEnvelope([
    { id: 'INT-EMAIL', name: 'Email Reset Link', status: 'active' },
    { id: 'INT-PAYMENT', name: 'Billing Gateway', status: 'active' }
  ], 'REQ-ADMIN-INTEGRATIONS'));
  writeJson(ADMIN_API, 'ads/campaigns.json', listEnvelope([
    { id: 'ADS-1001', name: 'Summer PMS Upgrade', status: 'active', budget: { amount: 500000, currency: CURRENCY } }
  ], 'REQ-ADMIN-ADS-CAMPAIGNS'));
}

writeDashboardData();
writeAdminData();

console.log(`Mock API data generated under:\n- ${path.relative(ROOT, DASH_API)}\n- ${path.relative(ROOT, ADMIN_API)}`);
