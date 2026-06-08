const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const JSON_ROOTS = [
  path.join(ROOT, 'dashboard', 'data', 'api', 'v1'),
  path.join(ROOT, 'admin', 'data', 'api', 'v1')
];

const enumRules = {
  reservationStatus: new Set(['confirmed', 'checked-in', 'checked-out', 'cancelled', 'blocked', 'pending', 'no-show']),
  groupStatus: new Set(['confirmed', 'in-house', 'pending', 'departed', 'cancelled']),
  roomStatus: new Set(['vacant-clean', 'vacant-dirty', 'in-house', 'out-of-service', 'occupied', 'checked-in']),
  docStatus: new Set(['pending', 'verified', 'expired', 'rejected']),
  invoiceStatus: new Set(['open', 'paid', 'overdue', 'void']),
  ticketStatus: new Set(['open', 'pending', 'closed'])
};

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.json') ? [full] : [];
  });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, '/');
}

const files = JSON_ROOTS.flatMap(walk);
const errors = [];
const payloads = new Map();

for (const file of files) {
  let json;
  try {
    json = readJson(file);
    payloads.set(rel(file), json);
  } catch (error) {
    errors.push(`${rel(file)}: JSON parse failed - ${error.message}`);
    continue;
  }
  if (json.success !== true) errors.push(`${rel(file)}: missing success=true`);
  if (!json.data) errors.push(`${rel(file)}: missing data`);
  if (!json.meta?.requestId) errors.push(`${rel(file)}: missing meta.requestId`);
  if (Array.isArray(json.data?.items) && !json.data.page) errors.push(`${rel(file)}: list missing data.page`);
}

function items(key) {
  return payloads.get(key)?.data?.items || [];
}

const rooms = new Set(items('dashboard/data/api/v1/rooms/index.json').map(item => item.id));
const reservations = items('dashboard/data/api/v1/reservations/index.json');
const timeline = items('dashboard/data/api/v1/reservations/timeline.json');
const groups = items('dashboard/data/api/v1/groups/events.json');
const allocations = items('dashboard/data/api/v1/groups/room-allocations/GRP-260527-01.json');
const rooming = items('dashboard/data/api/v1/groups/rooming-list/GRP-260527-01.json');
const guests = items('dashboard/data/api/v1/crm/guests.json');
const adminBilling = items('admin/data/api/v1/admin/billing.json');
const tickets = items('admin/data/api/v1/admin/support-tickets.json');

items('dashboard/data/api/v1/rooms/index.json').forEach(room => {
  if (!enumRules.roomStatus.has(room.status)) errors.push(`rooms/${room.id}: invalid status ${room.status}`);
});

reservations.forEach(res => {
  if (!enumRules.reservationStatus.has(res.status)) errors.push(`reservation/${res.id}: invalid status ${res.status}`);
  if (res.roomId && !rooms.has(res.roomId)) errors.push(`reservation/${res.id}: missing roomId ${res.roomId}`);
});

timeline.forEach(res => {
  if (res.roomId && !rooms.has(res.roomId)) errors.push(`timeline/${res.id}: missing roomId ${res.roomId}`);
});

groups.forEach(group => {
  if (!enumRules.groupStatus.has(group.status)) errors.push(`group/${group.id}: invalid status ${group.status}`);
  (group.roomAllocations || []).forEach(allocation => {
    if (!rooms.has(allocation.roomId)) errors.push(`group/${group.id}/allocation/${allocation.id}: missing roomId ${allocation.roomId}`);
  });
  (group.roomingList || []).forEach(guest => {
    if (!rooms.has(guest.roomId)) errors.push(`group/${group.id}/rooming/${guest.id}: missing roomId ${guest.roomId}`);
    if (guest.docStatus && !enumRules.docStatus.has(guest.docStatus)) errors.push(`group/${group.id}/rooming/${guest.id}: invalid docStatus ${guest.docStatus}`);
  });
});

allocations.forEach(allocation => {
  if (!rooms.has(allocation.roomId)) errors.push(`allocation/${allocation.id}: missing roomId ${allocation.roomId}`);
});

rooming.forEach(guest => {
  if (!rooms.has(guest.roomId)) errors.push(`rooming/${guest.id}: missing roomId ${guest.roomId}`);
  if (guest.docStatus && !enumRules.docStatus.has(guest.docStatus)) errors.push(`rooming/${guest.id}: invalid docStatus ${guest.docStatus}`);
});

guests.forEach(guest => {
  const status = guest.document?.status;
  if (status && !enumRules.docStatus.has(status)) errors.push(`guest/${guest.id}: invalid document.status ${status}`);
  const rawDoc = guest.document?.number || guest.document?.passportNumber || '';
  if (rawDoc && !String(rawDoc).includes('*')) errors.push(`guest/${guest.id}: document number must be masked`);
});

const robertFord = guests.find(guest => guest.name === 'Robert Ford');
if (robertFord && !String(robertFord.nationality || robertFord.nation || '').trim()) {
  errors.push('guest/Robert Ford: nationality is required for demo list display');
}

adminBilling.forEach(invoice => {
  if (invoice.status && !enumRules.invoiceStatus.has(invoice.status)) errors.push(`invoice/${invoice.id}: invalid status ${invoice.status}`);
});

tickets.forEach(ticket => {
  if (ticket.status && !enumRules.ticketStatus.has(ticket.status)) errors.push(`ticket/${ticket.id}: invalid status ${ticket.status}`);
});

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated ${files.length} mock API JSON files.`);
