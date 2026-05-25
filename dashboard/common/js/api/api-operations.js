// api-operations.js
window.PmsAPI = window.PmsAPI || {};

const _fallbackRooms = [
    {id:'PH01', floor:20, type:'Penthouse', status:'occupied', building:'Ocean Tower'},
    {id:'PH02', floor:20, type:'Penthouse', status:'vacant-clean', building:'Ocean Tower'},
    
    {id:'1401', floor:14, type:'Premier', status:'vacant-dirty', building:'Ocean Tower'},
    {id:'1402', floor:14, type:'Premier', status:'occupied', building:'Ocean Tower'},
    {id:'1403', floor:14, type:'Premier', status:'occupied', building:'Ocean Tower'},
    {id:'1405', floor:14, type:'Premier', status:'oos', building:'Ocean Tower'},
    
    {id:'1201', floor:12, type:'Deluxe', status:'occupied', building:'Forest Tower'},
    {id:'1202', floor:12, type:'Deluxe', status:'vacant-clean', building:'Forest Tower'},
    {id:'1203', floor:12, type:'Deluxe', status:'vacant-clean', building:'Forest Tower'},
    {id:'1205', floor:12, type:'Deluxe', status:'occupied', building:'Forest Tower'},
    {id:'1206', floor:12, type:'Deluxe', status:'vacant-dirty', building:'Forest Tower'},
    
    {id:'0801', floor:8, type:'Standard', status:'occupied', building:'Forest Tower'},
    {id:'0802', floor:8, type:'Standard', status:'occupied', building:'Forest Tower'},
    {id:'0803', floor:8, type:'Standard', status:'oos', building:'Forest Tower'},
    
    {id:'V-01', floor:1, type:'Pool Villa', status:'occupied', building:'Lakeside Villa'},
    {id:'V-02', floor:1, type:'Pool Villa', status:'vacant-clean', building:'Lakeside Villa'}
];

const _fallbackRoomTypes = [
    { id: 'Standard',    name: 'Standard',    code: 'STD', count: 45 },
    { id: 'Deluxe',      name: 'Deluxe',      code: 'DLX', count: 32 },
    { id: 'Premier',     name: 'Premier',     code: 'PRM', count: 18 },
    { id: 'Penthouse',   name: 'Penthouse',   code: 'PTH', count: 2 },
    { id: 'Pool Villa',  name: 'Pool Villa',  code: 'VIL', count: 5 }
];

Object.assign(window.PmsAPI, {

    getTasks: async () => {
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
        localStorage.setItem('pms_tasks', JSON.stringify(tasks));
        return true;
    },

    syncRoomStatusToTask: async (roomId, newStatus) => {
        let tasks = [];
        try { tasks = await window.PmsAPI.getTasks(); } catch(e) {}
        
        let existingTaskIndex = tasks.findIndex(t => t.room === roomId && t.status !== 'clean');
        
        if (newStatus === 'vacant-clean') {
            if (existingTaskIndex > -1) {
                tasks[existingTaskIndex].status = 'clean';
                window.PmsAPI.saveTasks(tasks);
            }
        } else if (newStatus === 'vacant-dirty') {
            if (existingTaskIndex === -1) {
                tasks.push({ id: 't' + Date.now(), room: roomId, type: 'checkout', status: 'dirty', priority: false, note: 'System generated' });
                window.PmsAPI.saveTasks(tasks);
            } else {
                tasks[existingTaskIndex].status = 'dirty';
                window.PmsAPI.saveTasks(tasks);
            }
        } else if (newStatus === 'oos') {
            if (existingTaskIndex === -1) {
                tasks.push({ id: 't' + Date.now(), room: roomId, type: 'maintenance', status: 'dirty', priority: true, note: 'System generated OOS' });
                window.PmsAPI.saveTasks(tasks);
            } else {
                tasks[existingTaskIndex].type = 'maintenance';
                tasks[existingTaskIndex].status = 'dirty';
                window.PmsAPI.saveTasks(tasks);
            }
        }
    },

    getGolfOrders: async () => { 
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
            let res = await fetch('../data/operations/orders.json');
            if (res.ok) return await res.json();
        } catch(e) {}
        return initStorage('pms_orders', [
            { "id": "ORD-5001", "room": "1002", "items": ["클럽 샌드위치", "아이스 아메리카노 2"], "total": 45000, "status": "preparing", "time": "11:05" },
            { "id": "ORD-5002", "room": "0501", "items": ["해물 파스타", "화이트 와인 1잔"], "total": 68000, "status": "delivering", "time": "10:40" },
            { "id": "ORD-5003", "room": "1401", "items": ["조식 세트 A", "과일 플래터"], "total": 85000, "status": "done", "time": "07:30" }
        ]);
    },

    getDailyData: async () => { return [{date:'5.16',room:18000,fnb:2000,spa:1500,other:800},{date:'5.17',room:19000,fnb:2200,spa:1600,other:900},{date:'5.18',room:21000,fnb:2500,spa:1800,other:1100},{date:'5.19',room:24000,fnb:3000,spa:2000,other:1200},{date:'5.20',room:25000,fnb:3200,spa:2100,other:1300},{date:'5.21',room:22000,fnb:2800,spa:1900,other:1000},{date:'5.22',room:20000,fnb:2400,spa:1700,other:900}]; },
    getMonthlyData: async () => { return [{m:'1월',v:650000},{m:'2월',v:580000},{m:'3월',v:620000},{m:'4월',v:670000},{m:'5월',v:690000},{m:'6월',v:0},{m:'7월',v:0},{m:'8월',v:0},{m:'9월',v:0},{m:'10월',v:0},{m:'11월',v:0},{m:'12월',v:0}]; },
    getYoyData: async () => { return [{m:1,ly:620000,ty:650000},{m:2,ly:550000,ty:580000},{m:3,ly:600000,ty:620000},{m:4,ly:630000,ty:670000},{m:5,ly:650000,ty:690000},{m:6,ly:680000,ty:0},{m:7,ly:720000,ty:0},{m:8,ly:750000,ty:0},{m:9,ly:610000,ty:0},{m:10,ly:640000,ty:0},{m:11,ly:620000,ty:0},{m:12,ly:700000,ty:0}]; },
    getDepts: async () => { 
        return [
            {name:'객실 (Rooms)',sub:'Room Revenue',pct:72,amt:118260,icon:'fa-bed',color:'var(--primary)',lt:'var(--primary-lt)'},
            {name:'통합 POS',sub:'F&B, Retail',pct:15,amt:24630,icon:'fa-cash-register',color:'var(--success)',lt:'rgba(16,185,129,0.15)'},
            {name:'골프장 (Golf)',sub:'Green Fee, Cart',pct:8,amt:13140,icon:'fa-golf-ball-tee',color:'var(--purple)',lt:'rgba(139,92,246,0.15)'},
            {name:'렌트카 (Rent-a-car)',sub:'Car Rentals',pct:5,amt:8220,icon:'fa-car',color:'var(--orange)',lt:'rgba(245,158,11,0.15)'}
        ]; 
    },
    getTrendData: async () => { 
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

    getAllRooms: async () => { return window.initStorage ? window.initStorage('pms_rooms', _fallbackRooms) : _fallbackRooms; },
    getAllRoomTypes: async () => { return window.initStorage ? window.initStorage('pms_room_types', _fallbackRoomTypes) : _fallbackRoomTypes; },
    getDEFAULT_ROOM_TYPES: async () => { return JSON.parse(JSON.stringify(_fallbackRoomTypes)); },

    saveRoom: async (roomData) => {
        let rooms = window.initStorage ? window.initStorage('pms_rooms', _fallbackRooms) : [];
        const existing = rooms.findIndex(r => r.id === roomData.id);
        if(existing >= 0) rooms[existing] = roomData;
        else rooms.push(roomData);
        localStorage.setItem('pms_rooms', JSON.stringify(rooms));
        return true;
    },

    saveRoomType: async (typeData) => {
        let types = window.initStorage ? window.initStorage('pms_room_types', _fallbackRoomTypes) : [];
        const existing = types.findIndex(t => t.id === typeData.id);
        if(existing >= 0) types[existing] = typeData;
        else types.push(typeData);
        localStorage.setItem('pms_room_types', JSON.stringify(types));
        return true;
    },

    deleteRoom: async (roomId) => {
        let rooms = window.initStorage ? window.initStorage('pms_rooms', _fallbackRooms) : [];
        rooms = rooms.filter(r => r.id !== roomId);
        localStorage.setItem('pms_rooms', JSON.stringify(rooms));
        return true;
    }
});
