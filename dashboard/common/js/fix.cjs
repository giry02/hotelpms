const fs = require('fs');
const lines = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/api-store.js', 'utf8').split('\n');
const idx = lines.findIndex(l => l.startsWith('const _orders ='));
const topHalf = lines.slice(0, idx).join('\n');

const bottomHalf = `const _orders = [
    { id:'ORD-502', room:'1401', type:'breakfast', guest:'Tran Linh', items:'아메리칸 브렉퍼스트 x2, 오렌지 주스', total:45.00, status:'new', time:'14:02' },
    { id:'ORD-501', room:'0807', type:'drink', guest:'John Smith', items:'화이트 와인 1병, 치즈 플래터', total:120.00, status:'new', time:'13:50' },
    { id:'ORD-500', room:'1205', type:'dining', guest:'Park Soo', items:'시그니처 버거, 트러플 감자튀김', total:32.00, status:'prep', time:'13:15' },
    { id:'ORD-499', room:'1403', type:'dining', guest:'Smith J.', items:'클럽 샌드위치, 감자튀김, 콜라', total:28.50, status:'prep', time:'12:40' },
    { id:'ORD-498', room:'0502', type:'dining', guest:'Garcia M.', items:'마가리타 피자, 콜라 2잔', total:45.00, status:'done', time:'11:30' },
];

const _tasks = [
    {id:'0301', room:'0301', status:'dirty', type:'checkout'}, 
    {id:'0702', room:'0702', status:'inspect', type:'stayover'},
    {id:'1105', room:'1105', status:'dirty', type:'checkout'},
    {id:'1203', room:'1203', status:'clean', type:'stayover'},
    {id:'0202', room:'0202', status:'inspect', type:'checkout'}
];

const _requests = [
    { id:'MT-001', room:'1205', type:'에어컨/냉난방', desc:'에어컨 소음 심각, 냉방 불량', priority:'urgent', assignee:'이영호', status:'open', date:'2025-05-21' },
    { id:'MT-002', room:'0803', type:'배관/수도', desc:'세면대 배수 막힘', priority:'high', assignee:'박미래', status:'in-progress', date:'2025-05-20' },
];

const _fallbackRoomTypes = [
    { id: 'RT-1', name: 'Standard Double', desc: '최대 2인 · 킹베드 1개 · 25m²' },
    { id: 'RT-2', name: 'Deluxe King',     desc: '최대 2인 · 킹베드 1개 · 35m² · 시티뷰' },
    { id: 'RT-3', name: 'Executive Suite', desc: '최대 4인 · 킹베드 1개, 소파베드 1개 · 60m² · 오션뷰' },
    { id: 'RT-4', name: 'Penthouse',       desc: '최대 4인 · 킹베드 2개 · 120m² · 파노라마뷰' },
    { id: 'RT-5', name: 'Pool Villa',      desc: '최대 4인 · 프라이빗 풀 · 오션뷰' },
];

const _fallbackRooms = [
    {id:'101', floor:1, type:'Standard Double', status:'vacant-clean', guest:'', building:'Main'},
    {id:'102', floor:1, type:'Standard Double', status:'occupied', guest:'John Smith', building:'Main'},
    {id:'201', floor:2, type:'Deluxe King', status:'occupied', guest:'Tran Linh', building:'Main'},
    {id:'V-01', floor:1, type:'Pool Villa', status:'vacant-clean', guest:'', building:'Lakeside'},
];

// Initialize LocalStorage Data if not present
function initStorage(key, fallback) {
    if (typeof localStorage === 'undefined') return fallback;
    const data = localStorage.getItem(key);
    if(data) return JSON.parse(data);
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
}

const _ALL_MENUS = [
    { key:'dashboard',    icon:'fa-gauge-high',          label:'대시보드' },
    { key:'reservation',  icon:'fa-calendar-days',       label:'예약 관리' },
    { key:'checkin',      icon:'fa-right-to-bracket',    label:'체크인/아웃' },
    { key:'crm',          icon:'fa-users',               label:'고객 CRM' },
    { key:'rooms',        icon:'fa-bed',                 label:'객실 관리' },
    { key:'rates',        icon:'fa-tags',                label:'요금 캘린더' },
    { key:'housekeeping', icon:'fa-broom',               label:'하우스키핑' },
    { key:'folio',        icon:'fa-file-invoice-dollar', label:'정산/청구' },
    { key:'ancillary',    icon:'fa-concierge-bell',      label:'부가서비스' },
    { key:'settings',     icon:'fa-gear',                label:'호텔 설정' },
    { key:'staff',        icon:'fa-users-gear',          label:'직원 관리' },
    { key:'billing',      icon:'fa-credit-card',         label:'요금 및 결제' },
];

const _SYSTEM_ROLES = [
    { id:'sys_admin',       name:'Admin',       color:'#6D28D9', desc:'전체 접근',          perms:_ALL_MENUS.map(m=>m.key) }
];

const _DEFAULT_CUSTOM_ROLES = [
    { id:'sys_manager',     name:'Manager',     color:'#1D4ED8', desc:'프론트+운영 관리',   perms:['dashboard','reservation','checkin','crm','rooms','rates','housekeeping','folio','ancillary'] },
    { id:'sys_housekeeper', name:'Housekeeper', color:'#065F46', desc:'하우스키핑 전용',    perms:['dashboard','housekeeping','rooms'] },
];

const _DEFAULT_STAFF = [
    { id:'s1', name:'Nguyen Kim',     init:'NK', email:'nkim@grandsaigon.com',  phone:'+84 90 123 4444', roleId:'sys_admin',       status:'online',  last:'방금 전',    color:'#8B5CF6' },
    { id:'s2', name:'Lee Min Ho',     init:'LM', email:'lmh@grandsaigon.com',   phone:'+84 91 222 3333', roleId:'sys_manager',     status:'online',  last:'10분 전',   color:'#3B82F6' },
    { id:'s3', name:'Mai Thi',        init:'MT', email:'mai@grandsaigon.com',   phone:'+84 92 444 5555', roleId:'sys_housekeeper', status:'online',  last:'1시간 전',  color:'#10B981' }
];

window.PmsAPI = {
    getWeekData: async () => { return JSON.parse(JSON.stringify(_weekData)); },
    getMonthData: async () => { return JSON.parse(JSON.stringify(_monthData)); },
    getHistory: async () => { return JSON.parse(JSON.stringify(_history)); },
    getGroups: async () => { return JSON.parse(JSON.stringify(_groups)); },
    getDailyData: async () => { return JSON.parse(JSON.stringify(_dailyData)); },
    getMonthlyData: async () => { return JSON.parse(JSON.stringify(_monthlyData)); },
    getYoyData: async () => { return JSON.parse(JSON.stringify(_yoyData)); },
    getDepts: async () => { return JSON.parse(JSON.stringify(_depts)); },
    getTrendData: async () => { return JSON.parse(JSON.stringify(_trendData)); },
    getOrders: async () => { return JSON.parse(JSON.stringify(_orders)); },
    getTasks: async () => { return JSON.parse(JSON.stringify(_tasks)); },
    getRequests: async () => { return JSON.parse(JSON.stringify(_requests)); },
    
    getALL_MENUS: async () => { return JSON.parse(JSON.stringify(_ALL_MENUS)); },
    getSYSTEM_ROLES: async () => { return JSON.parse(JSON.stringify(_SYSTEM_ROLES)); },
    getDEFAULT_CUSTOM_ROLES: async () => { return JSON.parse(JSON.stringify(_DEFAULT_CUSTOM_ROLES)); },
    getDEFAULT_STAFF: async () => { return JSON.parse(JSON.stringify(_DEFAULT_STAFF)); },
    
    getGuests: async () => { 
        try {
            let res = await fetch('../common/data/guests.json');
            if(!res.ok) res = await fetch('./common/data/guests.json');
            if(res.ok) return await res.json();
        } catch(e) { console.warn('Fetch failed for guests'); }
        return [];
    },
    getReservations: async () => { 
        try {
            let res = await fetch('../common/data/reservations.json');
            if(!res.ok) res = await fetch('./common/data/reservations.json');
            if(res.ok) {
                const data = await res.json();
                if(data.length > 10) return data; 
            }
        } catch(e) { console.warn('Fetch failed for reservations'); }
        return [];
    },
    getGolfOrders: async () => { 
        const items = [];
        for(let i=1; i<=8; i++) items.push({ id:\`GLF-P\${i.toString().padStart(3,'0')}\`, room:\`\${1000+i}\`, type: i%2===0?'club_a':'club_b', guest:'Guest '+i, items:'18홀 / 4인', total:450000, status:'new', time:'14:00' });
        for(let i=1; i<=12; i++) items.push({ id:\`GLF-C\${i.toString().padStart(3,'0')}\`, room:\`\${800+i}\`, type: i%2===0?'club_b':'club_a', guest:'Guest '+(i+8), items:'9홀 / 2인', total:150000, status:'done', time:'09:00' });
        return items;
    },
    getRentacarOrders: async () => { 
        const items = [];
        for(let i=1; i<=5; i++) items.push({ id:\`RNT-P\${i.toString().padStart(3,'0')}\`, room:\`\${1200+i}\`, type:'lotte', guest:'Guest '+i, items:'그랜저 IG / 2일', total:180000, status:'new', time:'10:00' });
        for(let i=1; i<=8; i++) items.push({ id:\`RNT-C\${i.toString().padStart(3,'0')}\`, room:\`\${300+i}\`, type:'sk', guest:'Guest '+(i+5), items:'아반떼 / 1일', total:60000, status:'done', time:'08:30' });
        return items;
    },

    // Unified Room Data Methods
    getAllRooms: async () => { return initStorage('pms_rooms', _fallbackRooms); },
    getAllRoomTypes: async () => { return initStorage('pms_room_types', _fallbackRoomTypes); },
    saveRoom: async (roomData) => {
        const rooms = initStorage('pms_rooms', _fallbackRooms);
        const existing = rooms.findIndex(r => r.id === roomData.id);
        if(existing >= 0) rooms[existing] = roomData;
        else rooms.push(roomData);
        localStorage.setItem('pms_rooms', JSON.stringify(rooms));
        return true;
    },
    saveRoomType: async (typeData) => {
        const types = initStorage('pms_room_types', _fallbackRoomTypes);
        const existing = types.findIndex(t => t.id === typeData.id);
        if(existing >= 0) types[existing] = typeData;
        else types.push(typeData);
        localStorage.setItem('pms_room_types', JSON.stringify(types));
        return true;
    },
    deleteRoom: async (roomId) => {
        let rooms = initStorage('pms_rooms', _fallbackRooms);
        rooms = rooms.filter(r => r.id !== roomId);
        localStorage.setItem('pms_rooms', JSON.stringify(rooms));
        return true;
    }
};
`;

fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/api-store.js', topHalf + '\n' + bottomHalf);
