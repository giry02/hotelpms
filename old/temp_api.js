const localStorage = { getItem: () => null, setItem: () => {} };
const initStorage = (k, d) => d;
module.exports = {
getWeekData: async () => { return JSON.parse(JSON.stringify(_weekData)); },
getMonthData: async () => { return JSON.parse(JSON.stringify(_monthData)); },
getHistory: async () => { return JSON.parse(JSON.stringify(_history)); },
getGroups: async () => { return JSON.parse(JSON.stringify(_groups)); },
getRooms: async () => { return JSON.parse(JSON.stringify(_rooms)); },



---

Created At: 2026-05-22T05:19:50Z
Completed At: 2026-05-22T05:19:51Z
File Path: `file:///E:/AI_Project/Hotel_PMS/dashboard/frontdesk/reservation-timeline.html`
Total Lines: 452
Total Bytes: 28108
Showing lines 1 to 40
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>예약 타임라인 — Hotel PMS</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link rel="stylesheet" href="../common/css/dashboard.css">
<link rel="stylesheet" href="../common/css/frontdesk.css">
<style>
/* Thin scrollbar for modal */
#newResModal .modal-body{scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
#newResModal .modal-body::-webkit-scrollbar{width:4px}
#newResModal .modal-body::-webkit-scrollbar-track{background:transparent}
#newResModal .modal-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px}
@media(max-width:768px){
#newResModal .modal-card{width:100%!important;max-width:100%!important;margin:0 8px;border-radius:12px}
#newResModal .modal-body{padding:16px!important;gap:14px!important}
#newResModal .modal-body > div[style*="grid-template-columns"]{grid-template-columns:1fr!important;gap:10px!important}
#newResModal input,#newResModal select,#newResModal textarea{font-size:.8rem!important;max-width:100%!important;box-sizing:border-box!important}
#newResModal .modal-footer{flex-direction:column;gap:8px}
#newResModal .modal-footer button{width:100%}
}
</style>
<script src="../common/js/api-store.js"></script>
<script src="../common/js/i18n.js"></script>
<script src="../common/js/sidebar.js"></script>
<script src="../common/js/ui-components.js"></script>
<script src="../common/js/topbar.js"></script>
</head>
<body>
<!-- MOBILE OVERLAY -->
<!-- ===== MAIN ===== -->
<div class="main">



---

Created At: 2026-05-22T05:24:20Z
Completed At: 2026-05-22T05:24:20Z
File Path: `file:///E:/AI_Project/Hotel_PMS/dashboard/operations/room-service.html`
Total Lines: 391
Total Bytes: 22807
Showing lines 1 to 391
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>룸서비스 — Hotel PMS</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link rel="stylesheet" href="../common/css/dashboard.css">
<link rel="stylesheet" href="../common/css/frontdesk.css">
<link rel="stylesheet" href="../common/css/operations.css">
<script src="../common/js/api-store.js"></script>
<script src="../common/js/i18n.js"></script>
<script src="../common/js/sidebar.js"></script>
<script src="../common/js/ui-components.js"></script>
<script src="../common/js/topbar.js"></script>
</head>
<body>
<div class="main">
<header class="topbar">
<h1 data-i18n-key="Room Service">룸서비스</h1>
</header>
<div class="content">
<!-- KPI -->
<div class="kpi-grid">
<div class="kpi-card orange">
<div class="kpi-top"><div class="kpi-icon"><i class="fa-solid fa-bell"></i></div></div>
<div class=
<truncated 21095 bytes>
식</span> <strong style="margin-left:6px">아메리칸 브렉퍼스트</strong>
</div>
<div style="display:flex;align-items:center;gap:10px">
<span style="font-weight:700;font-size:0.9rem">$22.50</span>
<button class="btn-icon-sm" style="height:28px;width:28px;color:var(--danger);font-size:0.75rem"><i class="fa-solid fa-trash"></i></button>
</div>
</div>
<div style="border:1px solid var(--border);border-radius:4px;padding:12px;display:flex;justify-content:space-between;align-items:center">
<div>
<span class="role-badge" style="background:var(--purple-lt);color:var(--purple)">다이닝</span> <strong style="margin-left:6px">클럽 샌드위치</strong>
</div>
<div style="display:flex;align-items:center;gap:10px">
<span style="font-weight:700;font-size:0.9rem">$15.00</span>
<button class="btn-icon-sm" style="height:28px;width:28px;color:var(--danger);font-size:0.75rem"><i class="fa-solid fa-trash"></i></button>
</div>
</div>
</div>
<div class="modal-footer" style="padding:16px 20px;border-top:1px solid var(--border2);display:flex;justify-content:flex-end;gap:10px;background:#f8fafc;border-radius:0 0 var(--radius-sm) var(--radius-sm)">
<button class="btn-primary-sm" onclick="closeModal('catalogModal')">확인</button>
</div>
</div>
</div>
<script>
document.addEventListener('DOMContentLoaded', async () => {
try {
orders = await PmsAPI.getOrders();
renderOrders();
} catch(e) { console.error(e); }
});
</script>
</body>
</html>
The above content shows the entire, complete file contents of the requested file.


---

Created At: 2026-05-22T05:24:32Z
Completed At: 2026-05-22T05:24:33Z
File Path: `file:///E:/AI_Project/Hotel_PMS/dashboard/common/js/api-store.js`
Total Lines: 299
Total Bytes: 23910
Showing lines 150 to 250
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
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
{ id:'MT-003', room:'PH01', type:'전기/조명', desc:'욕실 조명 교체 필요', priority:'normal', assignee:'김철수', status:'in-progress', date:'2025-05-20' },
{ id:'MT-004', room:'1401', type:'가구/비품', desc:'침대 프레임 삐걱 소리', priority:'normal', assignee:'미배정', status:'open', date:'2025-05-19' },
{ id:'MT-005', room:'0801', type:'도어/잠금장치', desc:'도어락 배터리 교체', priority:'high', assignee:'김철수', status:'done', date:'2025-05-18' },
{ id:'MT-006', room:'1202', type:'에어컨/냉난방', desc:'온도 조절 불가', priority:'urgent', assignee:'이영호', status:'open', date:'2025-05-22' },
{ id:'MT-007', room:'V-01', type:'전기/조명', desc:'거실 조명 스위치 불량', priority:'normal', 
<truncated 4993 bytes>
ekeeping','folio','ancillary'] },
{ id:'sys_housekeeper', name:'Housekeeper', color:'#065F46', desc:'하우스키핑 전용',    perms:['dashboard','housekeeping','rooms'] },
];
const _DEFAULT_STAFF = [
{ id:'s1', name:'Nguyen Kim',     init:'NK', email:'nkim@grandsaigon.com',  phone:'+84 90 123 4444', roleId:'sys_admin',       status:'online',  last:'방금 전',    color:'#8B5CF6' },
{ id:'s2', name:'Lee Min Ho',     init:'LM', email:'lmh@grandsaigon.com',   phone:'+84 91 222 3333', roleId:'sys_manager',     status:'online',  last:'10분 전',   color:'#3B82F6' },
{ id:'s3', name:'Mai Thi',        init:'MT', email:'mai@grandsaigon.com',   phone:'+84 92 444 5555', roleId:'sys_housekeeper', status:'online',  last:'1시간 전',  color:'#10B981' },
{ id:'s4', name:'Anna Kournikova',init:'AK', email:'anna@grandsaigon.com',  phone:'+84 93 555 6666', roleId:'sys_housekeeper', status:'offline', last:'어제',       color:'#F59E0B' },
{ id:'s5', name:'Tran Van',       init:'TV', email:'tranv@grandsaigon.com', phone:'+84 94 666 7777', roleId:'sys_admin',       status:'online',  last:'20분 전',   color:'#8B5CF6' },
{ id:'s6', name:'Soo Jin Park',   init:'SP', email:'sjp@grandsaigon.com',   phone:'+84 95 777 8888', roleId:'sys_manager',     status:'offline', last:'오늘 06:00', color:'#3B82F6' },
];
window.PmsAPI = {
getWeekData: async () => { return JSON.parse(JSON.stringify(_weekData)); },
getMonthData: async () => { return JSON.parse(JSON.stringify(_monthData)); },
getHistory: async () => { return JSON.parse(JSON.stringify(_history)); },
getGroups: async () => { return JSON.parse(JSON.stringify(_groups)); },
getRooms: async () => { return JSON.parse(JSON.stringify(_rooms)); },



---

Created At: 2026-05-22T05:24:41Z
Completed At: 2026-05-22T05:24:41Z
File Path: `file:///E:/AI_Project/Hotel_PMS/dashboard/common/js/api-store.js`
Total Lines: 299
Total Bytes: 23910
Showing lines 250 to 299
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
getRooms: async () => { return JSON.parse(JSON.stringify(_rooms)); },
getReservations: async () => { return JSON.parse(JSON.stringify(_reservations)); },
getDailyData: async () => { return JSON.parse(JSON.stringify(_dailyData)); },
getMonthlyData: async () => { return JSON.parse(JSON.stringify(_monthlyData)); },
getYoyData: async () => { return JSON.parse(JSON.stringify(_yoyData)); },
getDepts: async () => { return JSON.parse(JSON.stringify(_depts)); },
getTrendData: async () => { return JSON.parse(JSON.stringify(_trendData)); },
getOrders: async () => { return JSON.parse(JSON.stringify(_orders)); },
getTasks: async () => { return JSON.parse(JSON.stringify(_tasks)); },
getRequests: async () => { return JSON.parse(JSON.stringify(_requests)); },
getDEFAULT_ROOM_TYPES: async () => { return JSON.parse(JSON.stringify(_DEFAULT_ROOM_TYPES)); },
getAllRooms: async () => { return JSON.parse(JSON.stringify(_allRooms)); },
getAllRoomTypes: async () => { return JSON.parse(JSON.stringify(_allRoomTypes)); },
getALL_MENUS: async () => { return JSON.parse(JSON.stringify(_ALL_MENUS)); },
getSYSTEM_ROLES: async () => { return JSON.parse(JSON.stringify(_SYSTEM_ROLES)); },
getDEFAULT_CUSTOM_ROLES: async () => { return JSON.parse(JSON.stringify(_DEFAULT_CUSTOM_ROLES)); },
getDEFAULT_STAFF: async () => { return JSON.parse(JSON.stringify(_DEFAULT_STAFF)); },
getGuests: async () => { 
try {
<truncated 158 bytes>
ok) return await res.json();
} catch(e) { console.warn('Fetch failed for guests, returning empty array'); }
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
} catch(e) { console.warn('Fetch failed for reservations, using memory fallback'); }
return JSON.parse(JSON.stringify(_reservations));
},
getGolfOrders: async () => { 
const items = [];
for(let i=1; i<=8; i++) items.push({ id:`GLF-P${i.toString().padStart(3,'0')}`, room:`${1000+i}`, type: i%2===0?'club_a':'club_b', guest:'Guest '+i, items:'18홀 / 4인', total:450000, status:'new', time:'14:00' });
for(let i=1; i<=12; i++) items.push({ id:`GLF-C${i.toString().padStart(3,'0')}`, room:`${800+i}`, type: i%2===0?'club_b':'club_a', guest:'Guest '+(i+8), items:'9홀 / 2인', total:150000, status:'done', time:'09:00' });
return items;
},
getRentacarOrders: async () => { 
const items = [];
for(let i=1; i<=5; i++) items.push({ id:`RNT-P${i.toString().padStart(3,'0')}`, room:`${1200+i}`, type:'lotte', guest:'Guest '+i, items:'그랜저 IG / 2일', total:180000, status:'new', time:'10:00' });
for(let i=1; i<=8; i++) items.push({ id:`RNT-C${i.toString().padStart(3,'0')}`, room:`${300+i}`, type:'sk', guest:'Guest '+(i+5), items:'아반떼 / 1일', total:60000, status:'done', time:'08:30' });
return items;
}
};