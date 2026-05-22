const fs = require('fs');
const path = require('path');

const apiStoreStr = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/api_store_backup.txt', 'utf8');

const apiDir = 'E:/AI_Project/Hotel_PMS/dashboard/common/js/api';
if(!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, {recursive: true});

// 1. api-core.js
const coreCode = `// api-core.js
function initStorage(key, fallbackData) {
    let data = localStorage.getItem(key);
    if (!data) {
        localStorage.setItem(key, JSON.stringify(fallbackData));
        return fallbackData;
    }
    return JSON.parse(data);
}
window.PmsAPI = window.PmsAPI || {};
`;
fs.writeFileSync(path.join(apiDir, 'api-core.js'), coreCode);

// 2. api-dashboard.js
const dashboardCode = `// api-dashboard.js
window.PmsAPI = window.PmsAPI || {};
Object.assign(window.PmsAPI, {
    getWeekData: async () => {
        try {
            let res = await fetch('../data/dashboard/dashboard.json');
            if(res.ok) {
                const data = await res.json();
                if(data.weekData) return data.weekData;
            }
        } catch(e) { console.warn('Fetch failed for dashboard'); }
        // Fallback
        return initStorage('pms_week', [
            {day:'Mon', label:'월', occ:102, prev:96},
            {day:'Tue', label:'화', occ:94,  prev:88},
            {day:'Wed', label:'수', occ:110, prev:101},
            {day:'Thu', label:'목', occ:106, prev:99},
            {day:'Fri', label:'금', occ:114, prev:105},
            {day:'Sat', label:'토', occ:118, prev:112},
            {day:'Sun', label:'일', occ:98,  prev:95}
        ]);
    },
    getMonthData: async () => {
        try {
            let res = await fetch('../data/dashboard/dashboard.json');
            if(res.ok) {
                const data = await res.json();
                if(data.monthData) return data.monthData;
            }
        } catch(e) { }
        return initStorage('pms_month', [
            {day:'5/1',occ:88},{day:'5/2',occ:91},{day:'5/3',occ:95},{day:'5/4',occ:105},
            {day:'5/5',occ:108},{day:'5/6',occ:112},{day:'5/7',occ:98},{day:'5/8',occ:90},
            {day:'5/9',occ:93},{day:'5/10',occ:97},{day:'5/11',occ:102},{day:'5/12',occ:106},
            {day:'5/13',occ:114},{day:'5/14',occ:118},{day:'5/15',occ:98},{day:'5/16',occ:85},
            {day:'5/17',occ:89},{day:'5/18',occ:94},{day:'5/19',occ:100},{day:'5/20',occ:107},
            {day:'5/21',occ:115},{day:'5/22',occ:119},{day:'5/23',occ:96},{day:'5/24',occ:88},
            {day:'5/25',occ:92},{day:'5/26',occ:97},{day:'5/27',occ:103},{day:'5/28',occ:112},
            {day:'5/29',occ:120},{day:'5/30',occ:115},{day:'5/31',occ:98}
        ]);
    }
});
`;
fs.writeFileSync(path.join(apiDir, 'api-dashboard.js'), dashboardCode);

// 3. api-crm.js
// Extract _fallbackGuests
const guestMatch = apiStoreStr.match(/const _fallbackGuests = (\[[\s\S]*?\]);/);
let guestFallback = "[]";
if(guestMatch) guestFallback = guestMatch[1];
const crmCode = `// api-crm.js
window.PmsAPI = window.PmsAPI || {};
Object.assign(window.PmsAPI, {
    getGuests: async () => {
        try {
            let res = await fetch('../data/crm/guests.json');
            if(res.ok) {
                const data = await res.json();
                if(data && data.length) return data;
            }
        } catch(e) {}
        return initStorage('pms_guests', ${guestFallback});
    }
});
`;
fs.writeFileSync(path.join(apiDir, 'api-crm.js'), crmCode);

// 4. api-operations.js
const opsCode = `// api-operations.js
window.PmsAPI = window.PmsAPI || {};
Object.assign(window.PmsAPI, {
    getTasks: async () => {
        try {
            let res = await fetch('../data/operations/tasks.json');
            if(res.ok) return await res.json();
        } catch(e) {}
        return initStorage('pms_tasks', [
            { id: 'T-1001', room: '1205', type: '청소 요청', status: 'pending', time: '10:30', req: '수건 2장 추가' },
            { id: 'T-1002', room: '0904', type: '에코 스킵', status: 'completed', time: '09:15', req: '' },
            { id: 'T-1003', room: '0807', type: '긴급 정비', status: 'in-progress', time: '11:00', req: '에어컨 필터 교체' },
            { id: 'T-1004', room: '1401', type: '어메니티', status: 'pending', time: '11:45', req: '샴푸, 바디워시 보충' },
            { id: 'T-1005', room: '0612', type: '퇴실 청소', status: 'completed', time: '12:30', req: '' },
            { id: 'T-1006', room: 'PH01', type: 'VIP 세팅', status: 'in-progress', time: '14:00', req: '과일 바구니, 와인 준비' }
        ]);
    }
});
`;
fs.writeFileSync(path.join(apiDir, 'api-operations.js'), opsCode);

// 5. api-settings.js
const settingsCode = `// api-settings.js
window.PmsAPI = window.PmsAPI || {};
// Add logic if needed
`;
fs.writeFileSync(path.join(apiDir, 'api-settings.js'), settingsCode);

// 6. api-frontdesk.js
const roomsMatch = apiStoreStr.match(/const _fallbackRooms = (\[[\s\S]*?\]);/);
let roomsFallback = "[]";
if(roomsMatch) roomsFallback = roomsMatch[1];

const tResMatch = apiStoreStr.match(/const _fallbackTimelineReservations = (\[[\s\S]*?\]);/);
let tResFallback = "[]";
if(tResMatch) tResFallback = tResMatch[1];

const resMatch = apiStoreStr.match(/const _fallbackReservations = (\[[\s\S]*?\]);/);
let resFallback = "[]";
if(resMatch) resFallback = resMatch[1];

const fdCode = `// api-frontdesk.js
window.PmsAPI = window.PmsAPI || {};
Object.assign(window.PmsAPI, {
    getAllRooms: async () => {
        try {
            let res = await fetch('../data/frontdesk/rooms.json');
            if(res.ok) return await res.json();
        } catch(e) {}
        return initStorage('pms_rooms', ${roomsFallback});
    },
    getTimelineReservations: async () => {
        try {
            let res = await fetch('../data/frontdesk/timelineReservations.json');
            if(res.ok) return await res.json();
        } catch(e) {}
        return initStorage('pms_timeline_res', ${tResFallback});
    },
    getReservations: async () => {
        try {
            let res = await fetch('../data/frontdesk/reservations.json');
            if(res.ok) return await res.json();
        } catch(e) {}
        return initStorage('pms_reservations', ${resFallback});
    }
});
`;
fs.writeFileSync(path.join(apiDir, 'api-frontdesk.js'), fdCode);
console.log("Splitting completed successfully.");
