// api-core.js
const API_VERSION = 'v2.11';

window.PmsDate = window.PmsDate || (function() {
    function todayIsoDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function fromCurrentIso(isoDate) {
        const [year, month, day] = String(isoDate || todayIsoDate()).slice(0, 10).split('-').map(Number);
        const date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    function fromIso(isoDate) {
        const isoTarget = String(isoDate || todayIsoDate());
        return fromCurrentIso(isoTarget);
    }

    function localIso(date) {
        if (!date) return todayIsoDate();
        const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return shifted.toISOString().slice(0, 10);
    }

    function now() {
        const clock = new Date();
        const date = fromIso(todayIsoDate());
        date.setHours(clock.getHours(), clock.getMinutes(), clock.getSeconds(), clock.getMilliseconds());
        return date;
    }

    function pad(value, size = 2) {
        return String(value).padStart(size, '0');
    }

    function nowIso() {
        const clock = new Date();
        return `${todayIsoDate()}T${pad(clock.getHours())}:${pad(clock.getMinutes())}:${pad(clock.getSeconds())}+09:00`;
    }

    return {
        demoIsoDate: todayIsoDate(),
        todayIso: todayIsoDate,
        today: () => fromIso(todayIsoDate()),
        now,
        nowIso,
        localIso
    };
})();

if (localStorage.getItem('pms_api_version') !== API_VERSION) {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('pms_') || key.startsWith('mockapi:v1:')) localStorage.removeItem(key);
    });
    localStorage.setItem('pms_api_version', API_VERSION);
}

function initStorage(key, fallbackData) {
    let data = localStorage.getItem(key);
    if (!data) {
        localStorage.setItem(key, JSON.stringify(fallbackData));
        return fallbackData;
    }
    return JSON.parse(data);
}

window.PmsMockApi = window.PmsMockApi || (function() {
    const TENANT_ID = 'TENANT-GRAND-SAIGON';
    const API_VERSION = 'v10';
    const scriptUrl = document.currentScript ? document.currentScript.src : location.href;
    const dashboardRoot = new URL('../../../', scriptUrl);
    const apiRoot = new URL('data/api/v1/', dashboardRoot);

    function cleanPath(path) {
        const raw = String(path || '').replace(/^https?:\/\/[^/]+/i, '');
        const [pathname] = raw.split('?');
        return pathname
            .replace(/^\/?api\/v1\//, '')
            .replace(/^\/+/, '')
            .replace(/\/+$/, '');
    }

    function paramsFrom(path, options = {}) {
        const params = new URLSearchParams();
        const queryString = String(path || '').split('?')[1] || '';
        new URLSearchParams(queryString).forEach((value, key) => params.set(key, value));
        Object.entries(options.query || options.params || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
        });
        return params;
    }

    function routeFor(path) {
        const p = cleanPath(path);
        const staticRoutes = {
            'auth/me': { file: 'auth/me.json' },
            'dashboard/summary': { file: 'dashboard/summary.json' },
            'dashboard/kpis': { file: 'dashboard/kpis.json' },
            'dashboard/revenue-chart': { file: 'dashboard/revenue-chart.json', resource: 'dashboard-revenue' },
            'dashboard/today-activities': { file: 'dashboard/today-activities.json', resource: 'dashboard-activities' },
            buildings: { file: 'buildings/index.json', resource: 'buildings' },
            'room-types': { file: 'room-types/index.json', resource: 'room-types' },
            rooms: { file: 'rooms/index.json', resource: 'rooms' },
            'rooms/availability': { file: 'rooms/availability.json', resource: 'rooms' },
            reservations: { file: 'reservations/index.json', resource: 'reservations' },
            'reservations/timeline': { file: 'reservations/timeline.json', resource: 'reservations' },
            'b2b/companies': { file: 'b2b/companies.json', resource: 'companies' },
            'groups/events': { file: 'groups/events.json', resource: 'groups-events' },
            'crm/guests': { file: 'crm/guests.json', resource: 'crm-guests' },
            'crm/membership-tiers': { file: 'crm/membership-tiers.json', resource: 'crm-membership-tiers' },
            'crm/tier-history': { file: 'crm/tier-history.json', resource: 'crm-tier-history' },
            'rates/calendar': { file: 'rates/calendar.json', resource: 'rates-calendar' },
            'operations/tasks': { file: 'operations/tasks.json', resource: 'operations-tasks' },
            'operations/housekeeping-rooms': { file: 'operations/housekeeping-rooms.json', resource: 'housekeeping-rooms' },
            'operations/maintenance-requests': { file: 'operations/maintenance-requests.json', resource: 'maintenance-requests' },
            'pos/orders': { file: 'pos/orders.json', resource: 'pos-orders' },
            'ancillaries/golf-orders': { file: 'ancillaries/golf-orders.json', resource: 'golf-orders' },
            'ancillaries/rentacar-orders': { file: 'ancillaries/rentacar-orders.json', resource: 'rentacar-orders' },
            folios: { file: 'folios/index.json', resource: 'folios' },
            'reports/revenue-daily': { file: 'reports/revenue-daily.json', resource: 'reports-revenue-daily' },
            'reports/revenue-monthly': { file: 'reports/revenue-monthly.json', resource: 'reports-revenue-monthly' },
            'reports/revenue-yoy': { file: 'reports/revenue-yoy.json', resource: 'reports-revenue-yoy' },
            'reports/revenue-departments': { file: 'reports/revenue-departments.json', resource: 'reports-revenue-departments' },
            'reports/revenue-trend': { file: 'reports/revenue-trend.json', resource: 'reports-revenue-trend' },
            'night-audit/preview': { file: 'night-audit/preview.json' },
            'settings/hotel': { file: 'settings/hotel.json', resource: 'settings-hotel' },
            'settings/currency': { file: 'settings/currency.json', resource: 'settings-currency' },
            'settings/menus': { file: 'settings/menus.json', resource: 'settings-menus' },
            'settings/roles': { file: 'settings/roles.json', resource: 'settings-roles' },
            'settings/staff': { file: 'settings/staff.json', resource: 'settings-staff' },
            'settings/maintenance-types': { file: 'settings/maintenance-types.json', resource: 'settings-maintenance-types' },
            'settings/billing': { file: 'settings/billing.json', resource: 'settings-billing' }
        };
        if (staticRoutes[p]) return { path: p, ...staticRoutes[p] };

        let match = p.match(/^reservations\/([^/]+)$/);
        if (match) return { path: p, file: `reservations/detail/${match[1]}.json`, resource: 'reservations', itemId: match[1] };
        match = p.match(/^b2b\/companies\/([^/]+)$/);
        if (match) return { path: p, file: 'b2b/companies.json', resource: 'companies', itemId: match[1] };
        match = p.match(/^groups\/events\/([^/]+)$/);
        if (match) return { path: p, file: `groups/events/detail/${match[1]}.json`, resource: 'groups-events', itemId: match[1] };
        match = p.match(/^groups\/events\/([^/]+)\/room-allocations$/);
        if (match) return { path: p, file: `groups/room-allocations/${match[1]}.json`, resource: `group-room-allocations:${match[1]}` };
        match = p.match(/^groups\/events\/([^/]+)\/rooming-list$/);
        if (match) return { path: p, file: `groups/rooming-list/${match[1]}.json`, resource: `group-rooming-list:${match[1]}` };
        match = p.match(/^rooms\/([^/]+)$/);
        if (match) return { path: p, file: 'rooms/index.json', resource: 'rooms', itemId: match[1] };
        match = p.match(/^rooms\/([^/]+)\/guest-flag$/);
        if (match) return { path: p, file: 'rooms/index.json', resource: 'rooms', itemId: match[1], action: 'guest-flag' };
        match = p.match(/^room-types\/([^/]+)$/);
        if (match) return { path: p, file: 'room-types/index.json', resource: 'room-types', itemId: match[1] };
        match = p.match(/^folios\/([^/]+)$/);
        if (match) return { path: p, file: `folios/detail/${match[1]}.json`, resource: 'folios', itemId: match[1] };

        return { path: p, file: `${p || 'index'}.json` };
    }

    function overlayKey(resource) {
        return `mockapi:v1:${TENANT_ID}:${resource}`;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function mockToday() {
        return window.PmsDate?.today ? window.PmsDate.today() : new Date();
    }

    function dateShiftDays() {
        const today = mockToday();
        today.setHours(0, 0, 0, 0);
        const anchor = new Date(2026, 5, 10);
        anchor.setHours(0, 0, 0, 0);
        return Math.round((today - anchor) / 86400000);
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

    function overlayData(resource) {
        if (!resource) return null;
        try {
            const stored = localStorage.getItem(overlayKey(resource));
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.warn('Mock API overlay parse failed', resource, error);
            return null;
        }
    }

    function saveOverlay(resource, data) {
        if (!resource) return;
        localStorage.setItem(overlayKey(resource), JSON.stringify(data));
    }

    async function fetchEnvelope(route) {
        const res = await fetch(new URL(route.file, apiRoot).href, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Mock API JSON not found: ${route.file}`);
        const payload = await res.json();
        if (!payload || payload.success !== true || !payload.data || !payload.meta) {
            throw new Error(`Mock API invalid envelope: ${route.file}`);
        }
        return shiftMockDates(payload, dateShiftDays());
    }

    function isListPayload(payload) {
        return Array.isArray(payload?.data?.items);
    }

    function items(payload) {
        if (Array.isArray(payload?.data?.items)) return payload.data.items;
        if (Array.isArray(payload?.data)) return payload.data;
        return [];
    }

    function data(payload) {
        return payload?.data?.items || payload?.data?.item || payload?.data || null;
    }

    function applyOverlay(payload, route) {
        const overlay = overlayData(route.resource);
        if (!overlay) return payload;
        const next = clone(payload);
        if (isListPayload(next)) {
            next.data.items = Array.isArray(overlay.items) ? overlay.items : [];
            next.data.page = overlay.page || {
                page: 1,
                pageSize: next.data.items.length || 50,
                total: next.data.items.length,
                totalPages: 1
            };
        } else if (overlay.item) {
            next.data = overlay.item;
        }
        return next;
    }

    function fieldValue(item, key) {
        return key.split('.').reduce((acc, part) => acc && acc[part], item);
    }

    function applyQuery(payload, params) {
        if (!isListPayload(payload) || !params || Array.from(params.keys()).length === 0) return payload;
        const next = clone(payload);
        let list = next.data.items.slice();
        const search = (params.get('q') || params.get('search') || '').trim().toLowerCase();
        if (search) {
            list = list.filter(item => JSON.stringify(item).toLowerCase().includes(search));
        }
        params.forEach((value, key) => {
            if (['q', 'search', 'page', 'pageSize', 'limit', 'offset', 'sort', 'from', 'to', 'startDate', 'endDate'].includes(key)) return;
            list = list.filter(item => String(fieldValue(item, key) ?? '') === value);
        });
        const pageNo = Math.max(1, Number(params.get('page') || 1));
        const pageSize = Math.max(1, Number(params.get('pageSize') || params.get('limit') || list.length || 50));
        const total = list.length;
        next.data.items = list.slice((pageNo - 1) * pageSize, pageNo * pageSize);
        next.data.page = { page: pageNo, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
        return next;
    }

    function makeEnvelope(data, route, ok = true) {
        return {
            success: ok,
            data,
            meta: {
                requestId: `MOCK-${Date.now()}`,
                tenantId: TENANT_ID,
                apiVersion: API_VERSION,
                route: route.path,
                generatedAt: window.PmsDate?.nowIso ? window.PmsDate.nowIso() : new Date().toISOString()
            }
        };
    }

    function idOf(item) {
        return item?.id || item?.reservationId || item?.roomId || item?.companyId || item?.groupId || item?.staffId;
    }

    function collectionRoute(route) {
        const files = {
            reservations: 'reservations/index.json',
            companies: 'b2b/companies.json',
            'groups-events': 'groups/events.json',
            rooms: 'rooms/index.json',
            'room-types': 'room-types/index.json',
            folios: 'folios/index.json'
        };
        return files[route.resource] ? { ...route, file: files[route.resource] } : route;
    }

    async function writeCollection(method, route, options) {
        const body = options.body || options.data || {};
        let base;
        const readRoute = collectionRoute(route);
        try {
            base = applyOverlay(await fetchEnvelope(readRoute), readRoute);
        } catch (error) {
            base = makeEnvelope({ items: [], page: { page: 1, pageSize: 50, total: 0, totalPages: 1 } }, route);
        }
        const listEnvelope = isListPayload(base);
        let list = listEnvelope ? base.data.items.slice() : [];

        if (method === 'POST') {
            const item = { ...body };
            if (!idOf(item)) item.id = `${route.resource || 'MOCK'}-${Date.now()}`;
            list.unshift(item);
            const page = { page: 1, pageSize: Math.max(list.length, 50), total: list.length, totalPages: 1 };
            saveOverlay(route.resource, { items: list, page });
            return makeEnvelope({ item, items: list, page }, route);
        }

        if (method === 'PUT' && !route.itemId && Array.isArray(body)) {
            const page = { page: 1, pageSize: Math.max(body.length, 50), total: body.length, totalPages: 1 };
            saveOverlay(route.resource, { items: body, page });
            return makeEnvelope({ items: body, page }, route);
        }

        if (method === 'PUT' && !route.itemId && body && typeof body === 'object' && !Array.isArray(body) && !listEnvelope) {
            saveOverlay(route.resource, { item: body });
            return makeEnvelope(body, route);
        }

        const itemId = route.itemId || body.id || body.roomId || body.reservationId || body.companyId || body.groupId;
        const idx = list.findIndex(item => [item.id, item.roomId, item.reservationId, item.companyId, item.groupId].includes(itemId));
        if (method === 'DELETE') {
            if (idx >= 0) list.splice(idx, 1);
        } else if (idx >= 0) {
            if (route.action === 'guest-flag') list[idx] = { ...list[idx], guestFlag: body.flag || body.guestFlag || 'none' };
            else list[idx] = { ...list[idx], ...body };
        } else {
            list.unshift({ id: itemId || `${route.resource || 'MOCK'}-${Date.now()}`, ...body });
        }
        const page = { page: 1, pageSize: Math.max(list.length, 50), total: list.length, totalPages: 1 };
        saveOverlay(route.resource, { items: list, page });
        return makeEnvelope({ item: idx >= 0 ? list[idx] : list[0], items: list, page }, route);
    }

    async function request(method, path, options = {}) {
        const upper = String(method || 'GET').toUpperCase();
        const route = routeFor(path);
        if (upper !== 'GET') return writeCollection(upper, route, options);
        const payload = applyOverlay(await fetchEnvelope(route), route);
        return applyQuery(payload, paramsFrom(path, options));
    }

    function amountValue(value) {
        if (value && typeof value === 'object') return Number(value.amount || 0);
        return Number(value || 0);
    }

    function currencyOf(value, fallback = 'PHP') {
        return (value && typeof value === 'object' && value.currency) || fallback;
    }

    function roomNoFromId(id) {
        return String(id || '').split('-').pop();
    }

    function legacyDate(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    function roomStatus(status, housekeepingStatus = '') {
        const value = String(status || '').toLowerCase();
        if (['in-house', 'checked-in', 'occupied'].includes(value)) return 'occupied';
        if (value === 'out-of-service') return 'oos';
        if (value === 'vacant') {
            const housekeeping = String(housekeepingStatus || '').toLowerCase();
            if (['dirty', 'vacant-dirty', 'pending-clean', 'needs-cleaning', 'inspect'].includes(housekeeping)) return 'vacant-dirty';
            return 'vacant-clean';
        }
        return value || 'vacant-clean';
    }

    function toLegacyRoom(item) {
        const roomNo = item.roomNo || roomNoFromId(item.roomId || item.id);
        return {
            ...item,
            id: roomNo,
            roomId: item.roomId || item.id,
            fullRoom: item.roomId || item.id,
            number: roomNo,
            display: roomNo,
            floor: item.floor,
            type: item.roomTypeName || item.type || item.roomTypeId,
            typeId: item.roomTypeId,
            status: roomStatus(item.frontStatus || item.status, item.housekeepingStatus || item.status),
            building: item.buildingName || item.building || item.buildingId,
            bldgCode: item.buildingId,
            baseRate: amountValue(item.baseRate),
            currency: currencyOf(item.baseRate),
            guestFlag: item.guestFlag || 'none'
        };
    }

    function toLegacyReservation(item) {
        const roomNo = item.roomNo || roomNoFromId(item.roomId || item.fullRoom || item.room);
        const nights = item.nights || item.len || Math.max(1, Math.round((new Date(item.checkOutDate || item.checkout) - new Date(item.checkInDate || item.checkin)) / 86400000)) || 1;
        const currency = currencyOf(item.totalAmount || item.amount || item.rate);
        const explicitTotal = amountValue(item.totalAmount || item.amount);
        const explicitRate = amountValue(item.rate || item.nightlyRate || item.roomRate);
        const nightlyRate = explicitRate || (nights ? Math.round((explicitTotal / nights) * 100) / 100 : explicitTotal);
        const computedTotal = explicitRate ? Math.round(explicitRate * nights * 100) / 100 : explicitTotal;
        const roomingName = item.roomingGuestName || '';
        const guestName = roomingName || item.guestName || item.guest || '';
        return {
            ...item,
            id: item.id || item.reservationId,
            room: roomNo,
            fullRoom: item.roomId || item.fullRoom || item.room,
            type: item.roomTypeName || item.type || item.roomTypeId,
            guestId: item.guestId || item.roomingGuestId || '',
            guest: guestName,
            guestName,
            roomingGuestId: item.roomingGuestId || '',
            roomingGuestName: roomingName,
            groupId: item.groupId || '',
            groupName: item.groupName || '',
            agencyId: item.companyId || item.agencyId || '',
            agency: item.companyName || item.agency || '',
            companyName: item.companyName || '',
            channel: item.channel || (item.groupId ? 'Group' : 'Direct'),
            status: item.status || 'confirmed',
            cin: legacyDate(item.checkInDate || item.cin),
            cout: legacyDate(item.checkOutDate || item.cout),
            checkin: item.checkInDate || item.checkin,
            checkout: item.checkOutDate || item.checkout,
            start: Number.isFinite(item.start) ? item.start : 0,
            len: nights,
            nights,
            amount: computedTotal,
            rate: nightlyRate,
            totalAmount: { amount: computedTotal, currency },
            nightlyRate: { amount: nightlyRate, currency },
            currency,
            isB2B: !!(item.isB2B || item.groupId || item.companyId),
            isGroupPlaceholder: !!item.isGroupPlaceholder,
            isVip: !!item.isVip,
            vip: item.vip || ''
        };
    }

    function toLegacyAllocation(item) {
        const roomNo = item.roomNo || roomNoFromId(item.roomId || item.room);
        return {
            ...item,
            roomId: roomNo,
            fullRoom: item.roomId || item.fullRoom,
            apiRoomId: item.roomId || item.fullRoom,
            roomLabel: item.roomLabel || roomNo,
            type: item.roomTypeName || item.type || item.roomTypeId,
            building: item.buildingName || item.building || item.buildingId,
            baseRate: amountValue(item.baseRate),
            discountPercent: item.discountPercent !== undefined && item.discountPercent !== null ? Number(item.discountPercent || 0) : undefined,
            rate: amountValue(item.finalRate || item.rate),
            currency: currencyOf(item.finalRate || item.baseRate)
        };
    }

    function groupStatus(status) {
        const value = String(status || '').toLowerCase();
        if (value === 'in-house') return 'inhouse';
        if (value === 'checked-out') return 'departed';
        return value || 'confirmed';
    }

    function toLegacyGroup(item) {
        const roomAllocations = (item.roomAllocations || []).map(toLegacyAllocation);
        const allocationDiscounts = roomAllocations
            .map(allocation => Number(allocation.discountPercent))
            .filter(value => Number.isFinite(value) && value >= 0);
        const allocationDiscount = allocationDiscounts.length
            ? Math.round(allocationDiscounts.reduce((sum, value) => sum + value, 0) / allocationDiscounts.length * 10) / 10
            : undefined;
        const eventDiscount = item.eventDiscountPercent ?? item.appliedDiscountPercent ?? allocationDiscount;
        const roomingList = (item.roomingList || []).map(guest => ({
            ...guest,
            roomId: guest.roomNo || roomNoFromId(guest.roomId),
            fullRoom: guest.roomId,
            nation: guest.nationality || guest.nation || '',
            docStatus: guest.docStatus || guest.documentStatus || 'pending',
            note: guest.specialNotes || guest.note || ''
        }));
        return {
            ...item,
            status: groupStatus(item.status),
            agencyId: item.companyId || item.agencyId || '',
            agency: item.companyName || item.agency || '',
            checkin: item.checkInDate || item.checkin,
            checkout: item.checkOutDate || item.checkout,
            block: item.blockedRooms || roomAllocations.length || item.block || 0,
            pickup: item.pickedUpRooms || roomingList.length || item.pickup || 0,
            pax: item.pax || 0,
            ...(eventDiscount !== undefined ? { eventDiscountPercent: Number(eventDiscount || 0) } : {}),
            routing: item.routing || '단체 일괄 정산',
            sales: item.salesManagerName || item.sales || '',
            contact: item.contact?.phone ? `${item.contact.phone} (${item.contact.name || ''})` : (item.contact || ''),
            note: item.note || '',
            roomAllocations,
            allocations: roomAllocations,
            roomingList
        };
    }

    function toLegacyCompany(item) {
        const discountPercent = Number(item.discountPercent || item.groupDiscount || 0);
        const billingTerm = item.billing && typeof item.billing === 'object'
            ? (item.billing.paymentTerm || '')
            : (item.billing || '');
        const billingLabel = {
            'master-folio': '단체 일괄 정산',
            'agency-credit': '단체 후불',
            'company-card': '법인카드',
            individual: '개별 결제'
        }[billingTerm] || String(billingTerm || '').replace(/업체 후불/g, '단체 후불');
        return {
            ...item,
            label: item.displayName || item.name,
            contactName: item.contact?.name || item.contactName || '',
            phone: item.contact?.phone || item.phone || '',
            email: item.contact?.email || item.email || '',
            billing: billingLabel,
            rate: item.rate || (discountPercent ? `객실 ${discountPercent}% 할인` : ''),
            groupDiscount: item.groupDiscount ?? discountPercent,
            discountPercent
        };
    }

    function toLegacyTask(item) {
        return {
            ...item,
            room: item.roomNo || roomNoFromId(item.roomId || item.room),
            assignee: item.assignee || item.assigneeId || '',
            priority: item.priority === true || item.priority === 'high'
        };
    }

    function toLegacyRoomType(item) {
        const typeId = item.id || item.typeId || item.code || item.name;
        const base = item.baseRate ?? item.basePrice ?? item.rate;
        return {
            ...item,
            id: typeId,
            typeId,
            name: item.name,
            code: item.code,
            view: item.view || item.viewType || '',
            desc: item.desc || item.description || '',
            basePrice: amountValue(base),
            baseRate: amountValue(base),
            currency: currencyOf(base)
        };
    }

    return {
        request,
        items,
        data,
        toLegacyRoom,
        toLegacyReservation,
        toLegacyGroup,
        toLegacyAllocation,
        toLegacyCompany,
        toLegacyTask,
        toLegacyRoomType,
        amountValue,
        currencyOf,
        roomNoFromId
    };
})();

window.PmsAPI = window.PmsAPI || {};

Object.assign(window.PmsAPI, {
    // Session Mock: Change to 's5' (housekeeping) or 's1' (admin) for testing
    getCurrentUser: async () => {
        // Defaults to Admin if not explicitly set in localStorage for testing
        const override = localStorage.getItem('mock_user_id') || 's1'; 
        const staffList = await window.PmsAPI.getDEFAULT_STAFF();
        return staffList.find(s => s.id === override) || staffList[0];
    }
});
