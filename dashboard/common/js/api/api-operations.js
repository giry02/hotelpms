// api-operations.js
window.PmsAPI = window.PmsAPI || {};

const _fallbackRooms = [];
const _fallbackRoomTypes = [];

Object.assign(window.PmsAPI, {

    getTasks: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/operations/tasks');
                const tasks = window.PmsMockApi.items(env).map(window.PmsMockApi.toLegacyTask);
                if (tasks.length) return tasks;
            }
        } catch(e) {
            console.warn('Mock tasks fallback', e);
        }
        return [];
    },

    saveTasks: async (tasks) => {
        try {
            if (window.PmsMockApi) await window.PmsMockApi.request('PUT', '/operations/tasks', { body: tasks || [] });
        } catch(e) {
            console.warn('Mock tasks save fallback', e);
        }
        localStorage.setItem('pms_tasks', JSON.stringify(tasks));
        return true;
    },

    syncRoomStatusToTask: async (roomId, newStatus, context = {}) => {
        let tasks = [];
        try { tasks = await window.PmsAPI.getTasks(); } catch(e) {}

        const roomKeySet = (value) => {
            const text = String(value || '').trim();
            const upper = text.toUpperCase();
            const tail = upper.includes('-') ? upper.split('-').pop() : upper;
            const digits = (upper.match(/\d+/g) || []).join('');
            return new Set([upper, tail, digits].filter(Boolean));
        };
        const targetKeys = roomKeySet(roomId);
        const taskMatchesRoom = (task) => {
            const taskKeys = roomKeySet(task.roomId || task.roomNo || task.room);
            return [...taskKeys].some(key => targetKeys.has(key));
        };
        const displayRoom = String(roomId || '').split('-').pop() || String(roomId || '');
        const status = String(newStatus || '').replace(/[_\s]/g, '-').toLowerCase();
        const openTaskIndexes = tasks
            .map((task, index) => ({ task, index }))
            .filter(({ task }) => taskMatchesRoom(task) && task.status !== 'clean')
            .map(({ index }) => index);
        const existingTaskIndex = openTaskIndexes[0] ?? -1;
        let changed = false;

        const completeOpenTasks = (note) => {
            openTaskIndexes.forEach(index => {
                tasks[index].status = 'clean';
                tasks[index].completedAt = new Date().toISOString();
                tasks[index].inspectedBy = tasks[index].inspectedBy || 'Front Desk';
                tasks[index].note = tasks[index].note || note;
                changed = true;
            });
        };

        if (['vacant-clean', 'clean'].includes(status)) {
            completeOpenTasks('객실 정비 완료');
        } else if (['occupied', 'in-house', 'inhouse', 'checkedin', 'checked-in'].includes(status)) {
            return true;
        } else if (['vacant-dirty', 'dirty'].includes(status)) {
            const note = context?.guestName ? `${context.guestName} 체크아웃 후 청소 필요` : '체크아웃 후 청소 필요';
            if (existingTaskIndex === -1) {
                tasks.push({
                    id: 't' + Date.now(),
                    room: displayRoom,
                    roomId,
                    type: 'checkout',
                    status: 'dirty',
                    priority: false,
                    note,
                    reservationId: context?.reservationId || null
                });
            } else {
                tasks[existingTaskIndex].type = 'checkout';
                tasks[existingTaskIndex].status = 'dirty';
                tasks[existingTaskIndex].note = note;
                tasks[existingTaskIndex].reservationId = context?.reservationId || tasks[existingTaskIndex].reservationId;
            }
            changed = true;
        } else if (['oos', 'out-of-service', 'outofservice'].includes(status)) {
            if (existingTaskIndex === -1) {
                tasks.push({ id: 't' + Date.now(), room: displayRoom, roomId, type: 'maintenance', status: 'dirty', priority: true, note: '점검/수리 필요' });
            } else {
                tasks[existingTaskIndex].type = 'maintenance';
                tasks[existingTaskIndex].status = 'dirty';
                tasks[existingTaskIndex].priority = true;
            }
            changed = true;
        }
        if (changed) await window.PmsAPI.saveTasks(tasks);
        return true;
    },

    getGolfOrders: async () => { 
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/ancillaries/golf-orders');
                const orders = window.PmsMockApi.items(env).map(item => ({
                    ...item,
                    room: item.roomNo || window.PmsMockApi.roomNoFromId(item.roomId),
                    total: window.PmsMockApi.amountValue(item.total),
                    currency: window.PmsMockApi.currencyOf(item.total, env?.meta?.currency || 'PHP')
                }));
                if (orders.length) return orders;
            }
        } catch(e) {
            console.warn('Mock golf orders fallback', e);
        }
        try {
            let res = await fetch('../data/api/v1/ancillaries/golf-orders.json', { cache: 'no-store' });
            if (res.ok) {
                const env = await res.json();
                const items = Array.isArray(env?.data?.items) ? env.data.items : [];
                return items.map(item => ({
                    ...item,
                    room: item.roomNo || String(item.roomId || '').split('-').pop(),
                    total: item.total && typeof item.total === 'object' ? Number(item.total.amount || 0) : Number(item.total || 0),
                    currency: item.currency || item.total?.currency || env?.meta?.currency || 'PHP'
                }));
            }
        } catch(e) {}
        
        let cached = localStorage.getItem('pms_golf_orders');
        if (cached) return JSON.parse(cached);
        return [];
    },

    getRentacarOrders: async () => { 
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/ancillaries/rentacar-orders');
                const orders = window.PmsMockApi.items(env).map(item => ({
                    ...item,
                    room: item.roomNo || window.PmsMockApi.roomNoFromId(item.roomId),
                    total: window.PmsMockApi.amountValue(item.total),
                    currency: window.PmsMockApi.currencyOf(item.total, env?.meta?.currency || 'PHP')
                }));
                if (orders.length) return orders;
            }
        } catch(e) {
            console.warn('Mock rentacar orders fallback', e);
        }
        try {
            let res = await fetch('../data/api/v1/ancillaries/rentacar-orders.json', { cache: 'no-store' });
            if (res.ok) {
                const env = await res.json();
                const items = Array.isArray(env?.data?.items) ? env.data.items : [];
                return items.map(item => ({
                    ...item,
                    room: item.roomNo || String(item.roomId || '').split('-').pop(),
                    total: item.total && typeof item.total === 'object' ? Number(item.total.amount || 0) : Number(item.total || 0),
                    currency: item.currency || item.total?.currency || env?.meta?.currency || 'PHP'
                }));
            }
        } catch(e) {}
        
        let cached = localStorage.getItem('pms_rentacar_orders');
        if (cached) return JSON.parse(cached);
        return [];
    },

    getRequests: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/operations/maintenance-requests');
                const requests = window.PmsMockApi.items(env).map(item => ({
                    ...item,
                    room: item.roomNo || window.PmsMockApi.roomNoFromId(item.roomId),
                    time: item.time || (item.createdAt ? item.createdAt.slice(11, 16) : ''),
                    type: item.type || 'maintenance'
                }));
                if (requests.length) return requests;
            }
        } catch(e) {
            console.warn('Mock requests fallback', e);
        }
        try {
            let res = await fetch('../data/api/v1/operations/maintenance-requests.json', { cache: 'no-store' });
            if (res.ok) {
                const env = await res.json();
                const items = Array.isArray(env?.data?.items) ? env.data.items : [];
                if (items.length) return items.map(item => ({
                    ...item,
                    room: item.roomNo || String(item.roomId || '').split('-').pop(),
                    time: item.time || (item.createdAt ? item.createdAt.slice(11, 16) : ''),
                    type: item.type || 'maintenance'
                }));
            }
        } catch(e) {}
        return [];
    },

    getOrders: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/pos/orders');
                const orders = window.PmsMockApi.items(env).map(item => ({
                    ...item,
                    room: item.roomNo || window.PmsMockApi.roomNoFromId(item.roomId),
                    total: window.PmsMockApi.amountValue(item.total),
                    currency: window.PmsMockApi.currencyOf(item.total, env?.meta?.currency || 'PHP')
                }));
                if (orders.length) return orders;
            }
        } catch(e) {
            console.warn('Mock POS orders fallback', e);
        }
        try {
            let res = await fetch('../data/api/v1/pos/orders.json', { cache: 'no-store' });
            if (res.ok) {
                const env = await res.json();
                const items = Array.isArray(env?.data?.items) ? env.data.items : [];
                return items.map(item => ({
                    ...item,
                    room: item.roomNo || String(item.roomId || '').split('-').pop(),
                    total: item.total && typeof item.total === 'object' ? Number(item.total.amount || 0) : Number(item.total || 0),
                    currency: item.currency || item.total?.currency || env?.meta?.currency || 'PHP'
                }));
            }
        } catch(e) {}
        return [];
    },

    getDailyData: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/reports/revenue-daily');
                const rows = window.PmsMockApi.items(env).map(item => ({
                    rawDate: item.date,
                    date: item.date ? item.date.slice(5).replace('-', '.') : item.date,
                    room: Math.round(Number(item.room || 0)),
                    fnb: Math.round(Number(item.fnb || 0)),
                    spa: Math.round(Number(item.spa || 0)),
                    other: Math.round(Number(item.other || 0))
                }));
                if (rows.length) return rows;
            }
        } catch(e) {
            console.warn('Mock daily report fallback', e);
        }
        return [];
    },
    getMonthlyData: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/reports/revenue-monthly');
                const rows = window.PmsMockApi.items(env).map(item => ({
                    m: `${item.month}월`,
                    v: Math.round(Number(item.value || 0)),
                    room: Math.round(Number(item.room || 0)),
                    fnb: Math.round(Number(item.fnb || 0)),
                    spa: Math.round(Number(item.spa || 0)),
                    other: Math.round(Number(item.other || 0))
                }));
                if (rows.length) return rows;
            }
        } catch(e) {
            console.warn('Mock monthly report fallback', e);
        }
        return [];
    },
    getYoyData: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/reports/revenue-yoy');
                const rows = window.PmsMockApi.items(env).map(item => {
                    const lyBy = item.lastYearByCategory || {};
                    const tyBy = item.thisYearByCategory || {};
                    return {
                        m: item.month,
                        ly: Math.round(Number(item.lastYear || 0)),
                        ty: Math.round(Number(item.thisYear || 0)),
                        lyRoom: Math.round(Number(lyBy.room || 0)),
                        lyFnb: Math.round(Number(lyBy.fnb || 0)),
                        lySpa: Math.round(Number(lyBy.spa || 0)),
                        lyOther: Math.round(Number(lyBy.other || 0)),
                        tyRoom: Math.round(Number(tyBy.room || 0)),
                        tyFnb: Math.round(Number(tyBy.fnb || 0)),
                        tySpa: Math.round(Number(tyBy.spa || 0)),
                        tyOther: Math.round(Number(tyBy.other || 0))
                    };
                });
                if (rows.length) return rows;
            }
        } catch(e) {
            console.warn('Mock yoy report fallback', e);
        }
        return [];
    },
    getDepts: async () => { 
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/reports/revenue-departments');
                const rows = window.PmsMockApi.items(env).map(item => ({
                    ...item,
                    name: item.name || item.department,
                    sub: item.sub || item.subtitle || item.description || '',
                    pct: Number(item.pct ?? item.percent ?? item.share ?? 0),
                    amt: Math.round(Number(item.amt ?? item.value ?? item.amount ?? 0)),
                    icon: item.icon || 'fa-circle-dollar-to-slot',
                    color: item.color || 'var(--primary)',
                    lt: item.lt || item.lightColor || 'var(--primary-lt)'
                }));
                if (rows.length) return rows;
            }
        } catch(e) {
            console.warn('Mock departments report fallback', e);
        }
        return [];
    },
    getTrendData: async () => { 
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/reports/revenue-trend');
                const rows = window.PmsMockApi.items(env).map(item => ({
                    rawDate: item.date,
                    date: item.date,
                    room: { v: Math.round(Number(item.room?.v || 0)), d: item.room?.d || 0 },
                    pos: { v: Math.round(Number(item.pos?.v || 0)), d: item.pos?.d || 0 },
                    golf: { v: Math.round(Number(item.golf?.v || 0)), d: item.golf?.d || 0 },
                    car: { v: Math.round(Number(item.car?.v || 0)), d: item.car?.d || 0 }
                }));
                if (rows.length) return rows;
            }
        } catch(e) {
            console.warn('Mock trend report fallback', e);
        }
        return [];
    },

    setGuestFlag: async (roomId, flag) => {
        const sameRoomKey = (left, right) => {
            const normalize = value => {
                const text = String(value || '').trim().toLowerCase();
                const digits = (text.match(/\d+/g) || []).join('').replace(/^0+(?=\d)/, '');
                return { text, digits };
            };
            const a = normalize(left);
            const b = normalize(right);
            return !!(a.text && b.text && (a.text === b.text || (a.digits && a.digits === b.digits)));
        };
        let rooms = JSON.parse(localStorage.getItem('pms_rooms') || '[]');
        let room = rooms.find(r => sameRoomKey(r.id, roomId) || sameRoomKey(r.roomId, roomId) || sameRoomKey(r.fullRoom, roomId) || sameRoomKey(r.number, roomId) || sameRoomKey(r.display, roomId));
        const apiRoomId = room?.roomId || room?.fullRoom || room?.id || roomId;
        try {
            if (window.PmsMockApi) await window.PmsMockApi.request('PATCH', `/rooms/${encodeURIComponent(apiRoomId)}/guest-flag`, { body: { flag } });
        } catch(e) {
            console.warn('Mock guest flag save fallback', e);
        }
        if (room) {
            room.guestFlag = flag;
            localStorage.setItem('pms_rooms', JSON.stringify(rooms));
        }
        return true;
    },

    getAllRooms: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/rooms');
                const rooms = window.PmsMockApi.items(env).map(window.PmsMockApi.toLegacyRoom);
                if (rooms.length) return rooms;
            }
        } catch(e) {
            console.warn('Mock operation rooms fallback', e);
        }
        return [];
    },

    saveRooms: async (rooms) => {
        try {
            if (window.PmsMockApi) await window.PmsMockApi.request('PUT', '/rooms', { body: rooms || [] });
        } catch(e) {
            console.warn('Mock rooms save fallback', e);
        }
        localStorage.setItem('pms_rooms', JSON.stringify(rooms || []));
        return true;
    },

    getAllRoomTypes: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/room-types');
                const roomTypes = window.PmsMockApi.items(env).map(window.PmsMockApi.toLegacyRoomType);
                if (roomTypes.length) return roomTypes;
            }
        } catch(e) {
            console.warn('Mock room types fallback', e);
        }
        return [];
    },
    getDEFAULT_ROOM_TYPES: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/room-types');
                const roomTypes = window.PmsMockApi.items(env).map(window.PmsMockApi.toLegacyRoomType);
                if (roomTypes.length) return roomTypes;
            }
        } catch(e) {
            console.warn('Mock default room types fallback', e);
        }
        return JSON.parse(JSON.stringify(_fallbackRoomTypes));
    },

    saveRoom: async (roomData) => {
        try {
            if (window.PmsMockApi) await window.PmsMockApi.request('PATCH', `/rooms/${encodeURIComponent(roomData.id)}`, { body: roomData });
        } catch(e) {
            console.warn('Mock room save fallback', e);
        }
        let rooms = JSON.parse(localStorage.getItem('pms_rooms') || '[]');
        const existing = rooms.findIndex(r => r.id === roomData.id);
        if(existing >= 0) rooms[existing] = roomData;
        else rooms.push(roomData);
        localStorage.setItem('pms_rooms', JSON.stringify(rooms));
        return true;
    },

    saveRoomType: async (typeData) => {
        try {
            if (window.PmsMockApi) await window.PmsMockApi.request('PATCH', `/room-types/${encodeURIComponent(typeData.typeId || typeData.id)}`, { body: typeData });
        } catch(e) {
            console.warn('Mock room type save fallback', e);
        }
        let types = JSON.parse(localStorage.getItem('pms_room_types') || '[]');
        const existing = types.findIndex(t => t.id === typeData.id);
        if(existing >= 0) types[existing] = typeData;
        else types.push(typeData);
        localStorage.setItem('pms_room_types', JSON.stringify(types));
        localStorage.setItem('pms_room_types_config', JSON.stringify(types));
        return true;
    },

    saveRoomTypes: async (types) => {
        try {
            if (window.PmsMockApi) await window.PmsMockApi.request('PUT', '/room-types', { body: types || [] });
        } catch(e) {
            console.warn('Mock room types save fallback', e);
        }
        localStorage.setItem('pms_room_types', JSON.stringify(types || []));
        localStorage.setItem('pms_room_types_config', JSON.stringify(types || []));
        return true;
    },


    deleteRoom: async (roomId) => {
        try {
            if (window.PmsMockApi) await window.PmsMockApi.request('DELETE', `/rooms/${encodeURIComponent(roomId)}`);
        } catch(e) {
            console.warn('Mock room delete fallback', e);
        }
        let rooms = JSON.parse(localStorage.getItem('pms_rooms') || '[]');
        rooms = rooms.filter(r => r.id !== roomId);
        localStorage.setItem('pms_rooms', JSON.stringify(rooms));
        return true;
    }
});
