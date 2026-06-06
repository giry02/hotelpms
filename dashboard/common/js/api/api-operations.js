// api-operations.js
window.PmsAPI = window.PmsAPI || {};

const _fallbackRooms = [
    {id:'PH01', floor:20, type:'Penthouse', status:'occupied', building:'Ocean Tower', guestFlag:'mur'},
    {id:'PH02', floor:20, type:'Penthouse', status:'occupied', building:'Ocean Tower'},
    
    {id:'1401', floor:14, type:'Premier', status:'vacant-clean', building:'Ocean Tower'},
    {id:'1402', floor:14, type:'Premier', status:'vacant-clean', building:'Ocean Tower'},
    {id:'1403', floor:14, type:'Premier', status:'vacant-clean', building:'Ocean Tower'},
    {id:'1405', floor:14, type:'Premier', status:'oos', building:'Ocean Tower'},
    
    {id:'1201', floor:12, type:'Deluxe', status:'vacant-clean', building:'Forest Tower'},
    {id:'1202', floor:12, type:'Deluxe', status:'vacant-clean', building:'Forest Tower'},
    {id:'1203', floor:12, type:'Deluxe', status:'vacant-clean', building:'Forest Tower'},
    {id:'1205', floor:12, type:'Deluxe', status:'vacant-clean', building:'Forest Tower'},
    {id:'1206', floor:12, type:'Deluxe', status:'vacant-dirty', building:'Forest Tower'},
    
    {id:'0801', floor:8, type:'Standard', status:'vacant-clean', building:'Forest Tower'},
    {id:'0802', floor:8, type:'Standard', status:'vacant-clean', building:'Forest Tower'},
    {id:'0803', floor:8, type:'Standard', status:'vacant-clean', building:'Forest Tower'},
    
    {id:'V-01', floor:1, type:'Pool Villa', status:'vacant-clean', building:'Lakeside Villa'},
    {id:'V-02', floor:1, type:'Pool Villa', status:'vacant-clean', building:'Lakeside Villa'}
];

const _fallbackRoomTypes = [
    { id: 'STD', name: 'Standard', code: 'STD', view: 'City View', basePrice: 100, baseRate: 100, currency: 'USD', capacity: 2, count: 3 },
    { id: 'DLX-CITY', name: 'Deluxe', code: 'DLX-CITY', view: 'City View', basePrice: 140, baseRate: 140, currency: 'USD', capacity: 3, count: 3 },
    { id: 'DLX-OCEAN', name: 'Deluxe', code: 'DLX-OCEAN', view: 'Ocean View', basePrice: 180, baseRate: 180, currency: 'USD', capacity: 3, count: 2 },
    { id: 'PRM', name: 'Premier', code: 'PRM', view: 'Ocean View', basePrice: 220, baseRate: 220, currency: 'USD', capacity: 3, count: 4 },
    { id: 'PTH', name: 'Penthouse', code: 'PTH', view: 'Panoramic View', basePrice: 650, baseRate: 650, currency: 'USD', capacity: 4, count: 2 },
    { id: 'VIL', name: 'Pool Villa', code: 'VIL', view: 'Poolside', basePrice: 380, baseRate: 380, currency: 'USD', capacity: 4, count: 2 }
];

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
        try {
            let res = await fetch('../data/operations/tasks.json');
            if (res.ok) return await res.json();
        } catch(e) {}
        return initStorage('pms_tasks', [
            { "id": "t1", "room": "1401", "type": "checkout", "status": "dirty", "priority": true, "note": "VIP 체크인 예정 (14:00)" },
            { "id": "t2", "room": "1206", "type": "checkout", "status": "dirty", "priority": false, "note": "" },
            { "id": "t3", "room": "0807", "type": "stayover", "status": "dirty", "priority": false, "note": "수건 교체 요청" },
            { "id": "t4", "room": "0505", "type": "stayover", "status": "dirty", "priority": false, "note": "" },
            { "id": "t5", "room": "0904", "type": "checkout", "status": "inspect", "priority": false, "note": "" },
            { "id": "t6", "room": "PH01", "type": "deep", "status": "clean", "priority": false, "note": "" }
        ]);
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
                    total: window.PmsMockApi.amountValue(item.total)
                }));
                if (orders.length) return orders;
            }
        } catch(e) {
            console.warn('Mock golf orders fallback', e);
        }
        try {
            let res = await fetch('../data/operations/golf.json');
            if (res.ok) return await res.json();
        } catch(e) {}
        
        let cached = localStorage.getItem('pms_golf_orders');
        if (cached) return JSON.parse(cached);

        const items = [];
        for(let i=1; i<=8; i++) items.push({ id:`GLF-P${i.toString().padStart(3,'0')}`, room:`${1000+i}`, type: i%2===0?'club_a':'club_b', guest:'Guest '+i, items:'18홀 / 4인', total:450000, status:'new', time:'14:00' });
        for(let i=1; i<=12; i++) items.push({ id:`GLF-C${i.toString().padStart(3,'0')}`, room:`${800+i}`, type: i%2===0?'club_b':'club_a', guest:'Guest '+(i+8), items:'9홀 / 2인', total:150000, status:'done', time:'09:00' });
        
        localStorage.setItem('pms_golf_orders', JSON.stringify(items));
        return items;
    },

    getRentacarOrders: async () => { 
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/ancillaries/rentacar-orders');
                const orders = window.PmsMockApi.items(env).map(item => ({
                    ...item,
                    room: item.roomNo || window.PmsMockApi.roomNoFromId(item.roomId),
                    total: window.PmsMockApi.amountValue(item.total)
                }));
                if (orders.length) return orders;
            }
        } catch(e) {
            console.warn('Mock rentacar orders fallback', e);
        }
        try {
            let res = await fetch('../data/operations/rentacar.json');
            if (res.ok) return await res.json();
        } catch(e) {}
        
        let cached = localStorage.getItem('pms_rentacar_orders');
        if (cached) return JSON.parse(cached);

        const items = [];
        for(let i=1; i<=5; i++) items.push({ id:`RNT-P${i.toString().padStart(3,'0')}`, room:`${1200+i}`, type:'lotte', guest:'Guest '+i, items:'그랜저 IG / 2일', total:180000, status:'new', time:'10:00' });
        for(let i=1; i<=8; i++) items.push({ id:`RNT-C${i.toString().padStart(3,'0')}`, room:`${300+i}`, type:'sk', guest:'Guest '+(i+5), items:'아반떼 / 1일', total:60000, status:'done', time:'08:30' });
        
        localStorage.setItem('pms_rentacar_orders', JSON.stringify(items));
        return items;
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
            let res = await fetch('../data/operations/requests.json');
            if (res.ok) return await res.json();
        } catch(e) {}
        return initStorage('pms_requests', [
            { "id": "REQ-1001", "room": "0807", "type": "amenity", "desc": "수건 2장, 생수 2병 추가", "status": "pending", "time": "10:15", "assignee": "" },
            { "id": "REQ-1002", "room": "1205", "type": "maintenance", "desc": "에어컨 온도 조절기 불량", "status": "progress", "time": "09:30", "assignee": "엔지니어 김" },
            { "id": "REQ-1003", "room": "PH01", "type": "cleaning", "desc": "와인잔 파손으로 인한 긴급 청소", "status": "done", "time": "08:45", "assignee": "하우스키핑 박" }
        ]);
    },

    getOrders: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/pos/orders');
                const orders = window.PmsMockApi.items(env).map(item => ({
                    ...item,
                    room: item.roomNo || window.PmsMockApi.roomNoFromId(item.roomId),
                    total: window.PmsMockApi.amountValue(item.total)
                }));
                if (orders.length) return orders;
            }
        } catch(e) {
            console.warn('Mock POS orders fallback', e);
        }
        try {
            let res = await fetch('../data/operations/orders.json');
            if (res.ok) return await res.json();
        } catch(e) {}
        return initStorage('pms_orders', [
            { "id": "ORD-5001", "room": "1002", "items": ["클럽 샌드위치", "아이스 아메리카노 2"], "total": 45000, "status": "preparing", "time": "11:05" },
            { "id": "ORD-5002", "room": "0501", "items": ["해물 파스타", "화이트 와인 1잔"], "total": 68000, "status": "delivering", "time": "10:40" },
            { "id": "ORD-5003", "room": "1401", "items": ["조식 세트 A", "과일 플래터"], "total": 85000, "status": "done", "time": "07:30" }
        ]);
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
        return [{date:'5.16',room:18000,fnb:2000,spa:1500,other:800},{date:'5.17',room:19000,fnb:2200,spa:1600,other:900},{date:'5.18',room:21000,fnb:2500,spa:1800,other:1100},{date:'5.19',room:24000,fnb:3000,spa:2000,other:1200},{date:'5.20',room:25000,fnb:3200,spa:2100,other:1300},{date:'5.21',room:22000,fnb:2800,spa:1900,other:1000},{date:'5.22',room:20000,fnb:2400,spa:1700,other:900}];
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
        return [{m:'1월',v:650000},{m:'2월',v:580000},{m:'3월',v:620000},{m:'4월',v:670000},{m:'5월',v:690000},{m:'6월',v:0},{m:'7월',v:0},{m:'8월',v:0},{m:'9월',v:0},{m:'10월',v:0},{m:'11월',v:0},{m:'12월',v:0}];
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
        return [{m:1,ly:620000,ty:650000},{m:2,ly:550000,ty:580000},{m:3,ly:600000,ty:620000},{m:4,ly:630000,ty:670000},{m:5,ly:650000,ty:690000},{m:6,ly:680000,ty:0},{m:7,ly:720000,ty:0},{m:8,ly:750000,ty:0},{m:9,ly:610000,ty:0},{m:10,ly:640000,ty:0},{m:11,ly:620000,ty:0},{m:12,ly:700000,ty:0}];
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
        return [
            {name:'객실 (Rooms)',sub:'Room Revenue',pct:72,amt:118260,icon:'fa-bed',color:'var(--primary)',lt:'var(--primary-lt)'},
            {name:'통합 POS',sub:'F&B, Retail',pct:15,amt:24630,icon:'fa-cash-register',color:'var(--success)',lt:'rgba(16,185,129,0.15)'},
            {name:'골프장 (Golf)',sub:'Green Fee, Cart',pct:8,amt:13140,icon:'fa-golf-ball-tee',color:'var(--purple)',lt:'rgba(139,92,246,0.15)'},
            {name:'렌트카 (Rent-a-car)',sub:'Car Rentals',pct:5,amt:8220,icon:'fa-car',color:'var(--orange)',lt:'rgba(245,158,11,0.15)'}
        ]; 
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
        return [
            {date:'2026-05-22', room:{v:18500, d:5.2}, pos:{v:3200, d:1.5}, golf:{v:1900, d:-2.1}, car:{v:1400, d:4.0}},
            {date:'2026-05-21', room:{v:17600, d:-1.2}, pos:{v:3150, d:-0.5}, golf:{v:1940, d:3.1}, car:{v:1340, d:1.2}},
            {date:'2026-05-20', room:{v:17800, d:2.5}, pos:{v:3160, d:1.2}, golf:{v:1880, d:-1.5}, car:{v:1320, d:0.5}},
            {date:'2026-05-19', room:{v:17350, d:4.1}, pos:{v:3120, d:2.8}, golf:{v:1910, d:5.5}, car:{v:1310, d:2.2}},
            {date:'2026-05-18', room:{v:16650, d:-3.5}, pos:{v:3030, d:-4.1}, golf:{v:1810, d:-6.2}, car:{v:1280, d:-1.5}},
            {date:'2026-05-17', room:{v:17250, d:8.2}, pos:{v:3160, d:6.5}, golf:{v:1930, d:12.4}, car:{v:1300, d:5.1}},
            {date:'2026-05-16', room:{v:15950, d:0}, pos:{v:2970, d:0}, golf:{v:1720, d:0}, car:{v:1240, d:0}}
        ]; 
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
        let rooms = window.initStorage ? window.initStorage('pms_rooms', _fallbackRooms) : _fallbackRooms;
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
        return window.initStorage ? window.initStorage('pms_rooms', _fallbackRooms) : _fallbackRooms;
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
        return window.initStorage ? window.initStorage('pms_room_types', _fallbackRoomTypes) : _fallbackRoomTypes;
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
        let rooms = window.initStorage ? window.initStorage('pms_rooms', _fallbackRooms) : [];
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
        let types = window.initStorage ? window.initStorage('pms_room_types', _fallbackRoomTypes) : [];
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
        let rooms = window.initStorage ? window.initStorage('pms_rooms', _fallbackRooms) : [];
        rooms = rooms.filter(r => r.id !== roomId);
        localStorage.setItem('pms_rooms', JSON.stringify(rooms));
        return true;
    }
});
