window.PmsAPI = {
246:     getWeekData: async () => { return JSON.parse(JSON.stringify(_weekData)); },
247:     getMonthData: async () => { return JSON.parse(JSON.stringify(_monthData)); },
248:     getHistory: async () => { return JSON.parse(JSON.stringify(_history)); },
249:     getGroups: async () => { return JSON.parse(JSON.stringify(_groups)); },
250:     getRooms: async () => { return JSON.parse(JSON.stringify(_rooms)); },
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.


---

Created At: 2026-05-22T05:19:50Z
Completed At: 2026-05-22T05:19:51Z
File Path: `file:///E:/AI_Project/Hotel_PMS/dashboard/frontdesk/reservation-timeline.html`
Total Lines: 452
Total Bytes: 28108
Showing lines 1 to 40
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: <!DOCTYPE html>
2: <html lang="ko">
3: <head>
4:     <meta charset="UTF-8">
5:     <meta name="viewport" content="width=device-width, initial-scale=1.0">
6:     <title>예약 타임라인 — Hotel PMS</title>
7:     <link rel="preconnect" href="https://fonts.googleapis.com">
8:     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
9:     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
10:     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
11:     <link rel="stylesheet" href="../common/css/dashboard.css">
12:     <link rel="stylesheet" href="../common/css/frontdesk.css">
13: <style>
14: /* Thin scrollbar for modal */
15: #newResModal .modal-body{scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
16: #newResModal .modal-body::-webkit-scrollbar{width:4px}
17: #newResModal .modal-body::-webkit-scrollbar-track{background:transparent}
18: #newResModal .modal-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px}
19: 
20: @media(max-width:768px){
21:     #newResModal .modal-card{width:100%!important;max-width:100%!important;margin:0 8px;border-radius:12px}
22:     #newResModal .modal-body{padding:16px!important;gap:14px!important}
23:     #newResModal .modal-body > div[style*="grid-template-columns"]{grid-template-columns:1fr!important;gap:10px!important}
24:     #newResModal input,#newResModal select,#newResModal textarea{font-size:.8rem!important;max-width:100%!important;box-sizing:border-box!important}
25:     #newResModal .modal-footer{flex-direction:column;gap:8px}
26:     #newResModal .modal-footer button{width:100%}
27: }
28: </style>
29:     <script src="../common/js/api-store.js"></script>
30:     <script src="../common/js/i18n.js"></script>
31: <script src="../common/js/sidebar.js"></script>
32:     <script src="../common/js/ui-components.js"></script>
33:     <script src="../common/js/topbar.js"></script>
34: </head>
35: <body>
36: 
37: <!-- MOBILE OVERLAY -->
38: 
39: <!-- ===== MAIN ===== -->
40: <div class="main">
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.


---

Created At: 2026-05-22T05:24:20Z
Completed At: 2026-05-22T05:24:20Z
File Path: `file:///E:/AI_Project/Hotel_PMS/dashboard/operations/room-service.html`
Total Lines: 391
Total Bytes: 22807
Showing lines 1 to 391
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: <!DOCTYPE html>
2: <html lang="ko">
3: <head>
4:     <meta charset="UTF-8">
5:     <meta name="viewport" content="width=device-width, initial-scale=1.0">
6:     <title>룸서비스 — Hotel PMS</title>
7:     <link rel="preconnect" href="https://fonts.googleapis.com">
8:     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
9:     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
10:     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
11:     <link rel="stylesheet" href="../common/css/dashboard.css">
12:     <link rel="stylesheet" href="../common/css/frontdesk.css">
13:     <link rel="stylesheet" href="../common/css/operations.css">
14:     <script src="../common/js/api-store.js"></script>
15:     <script src="../common/js/i18n.js"></script>
16: <script src="../common/js/sidebar.js"></script>
17:     <script src="../common/js/ui-components.js"></script>
18:     <script src="../common/js/topbar.js"></script>
19: </head>
20: <body>
21: 
22: <div class="main">
23:     <header class="topbar">
24:         <h1 data-i18n-key="Room Service">룸서비스</h1>
25:     </header>
26: 
27:     <div class="content">
28:         <!-- KPI -->
29:         <div class="kpi-grid">
30:             <div class="kpi-card orange">
31:                 <div class="kpi-top"><div class="kpi-icon"><i class="fa-solid fa-bell"></i></div></div>
32:                 <div class=
<truncated 21095 bytes>
식</span> <strong style="margin-left:6px">아메리칸 브렉퍼스트</strong>
358:                 </div>
359:                 <div style="display:flex;align-items:center;gap:10px">
360:                     <span style="font-weight:700;font-size:0.9rem">$22.50</span>
361:                     <button class="btn-icon-sm" style="height:28px;width:28px;color:var(--danger);font-size:0.75rem"><i class="fa-solid fa-trash"></i></button>
362:                 </div>
363:             </div>
364:             <div style="border:1px solid var(--border);border-radius:4px;padding:12px;display:flex;justify-content:space-between;align-items:center">
365:                 <div>
366:                     <span class="role-badge" style="background:var(--purple-lt);color:var(--purple)">다이닝</span> <strong style="margin-left:6px">클럽 샌드위치</strong>
367:                 </div>
368:                 <div style="display:flex;align-items:center;gap:10px">
369:                     <span style="font-weight:700;font-size:0.9rem">$15.00</span>
370:                     <button class="btn-icon-sm" style="height:28px;width:28px;color:var(--danger);font-size:0.75rem"><i class="fa-solid fa-trash"></i></button>
371:                 </div>
372:             </div>
373:         </div>
374:         <div class="modal-footer" style="padding:16px 20px;border-top:1px solid var(--border2);display:flex;justify-content:flex-end;gap:10px;background:#f8fafc;border-radius:0 0 var(--radius-sm) var(--radius-sm)">
375:             <button class="btn-primary-sm" onclick="closeModal('catalogModal')">확인</button>
376:         </div>
377:     </div>
378: </div>
379: 
380: 
381: <script>
382: document.addEventListener('DOMContentLoaded', async () => {
383:     try {
384:         orders = await PmsAPI.getOrders();
385:         renderOrders();
386:     } catch(e) { console.error(e); }
387: });
388: </script>
389: </body>
390: </html>
391: 
The above content shows the entire, complete file contents of the requested file.


---

Created At: 2026-05-22T05:24:32Z
Completed At: 2026-05-22T05:24:33Z
File Path: `file:///E:/AI_Project/Hotel_PMS/dashboard/common/js/api-store.js`
Total Lines: 299
Total Bytes: 23910
Showing lines 150 to 250
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
150: const _tasks = [
151:     {id:'0301', room:'0301', status:'dirty', type:'checkout'}, 
152:     {id:'0702', room:'0702', status:'inspect', type:'stayover'},
153:     {id:'1105', room:'1105', status:'dirty', type:'checkout'},
154:     {id:'1203', room:'1203', status:'clean', type:'stayover'},
155:     {id:'0202', room:'0202', status:'inspect', type:'checkout'}
156: ];
157: 
158: const _requests = [
159:     { id:'MT-001', room:'1205', type:'에어컨/냉난방', desc:'에어컨 소음 심각, 냉방 불량', priority:'urgent', assignee:'이영호', status:'open', date:'2025-05-21' },
160:     { id:'MT-002', room:'0803', type:'배관/수도', desc:'세면대 배수 막힘', priority:'high', assignee:'박미래', status:'in-progress', date:'2025-05-20' },
161:     { id:'MT-003', room:'PH01', type:'전기/조명', desc:'욕실 조명 교체 필요', priority:'normal', assignee:'김철수', status:'in-progress', date:'2025-05-20' },
162:     { id:'MT-004', room:'1401', type:'가구/비품', desc:'침대 프레임 삐걱 소리', priority:'normal', assignee:'미배정', status:'open', date:'2025-05-19' },
163:     { id:'MT-005', room:'0801', type:'도어/잠금장치', desc:'도어락 배터리 교체', priority:'high', assignee:'김철수', status:'done', date:'2025-05-18' },
164:     { id:'MT-006', room:'1202', type:'에어컨/냉난방', desc:'온도 조절 불가', priority:'urgent', assignee:'이영호', status:'open', date:'2025-05-22' },
165:     { id:'MT-007', room:'V-01', type:'전기/조명', desc:'거실 조명 스위치 불량', priority:'normal', 
<truncated 4993 bytes>
ekeeping','folio','ancillary'] },
233:     { id:'sys_housekeeper', name:'Housekeeper', color:'#065F46', desc:'하우스키핑 전용',    perms:['dashboard','housekeeping','rooms'] },
234: ];
235: 
236: const _DEFAULT_STAFF = [
237:     { id:'s1', name:'Nguyen Kim',     init:'NK', email:'nkim@grandsaigon.com',  phone:'+84 90 123 4444', roleId:'sys_admin',       status:'online',  last:'방금 전',    color:'#8B5CF6' },
238:     { id:'s2', name:'Lee Min Ho',     init:'LM', email:'lmh@grandsaigon.com',   phone:'+84 91 222 3333', roleId:'sys_manager',     status:'online',  last:'10분 전',   color:'#3B82F6' },
239:     { id:'s3', name:'Mai Thi',        init:'MT', email:'mai@grandsaigon.com',   phone:'+84 92 444 5555', roleId:'sys_housekeeper', status:'online',  last:'1시간 전',  color:'#10B981' },
240:     { id:'s4', name:'Anna Kournikova',init:'AK', email:'anna@grandsaigon.com',  phone:'+84 93 555 6666', roleId:'sys_housekeeper', status:'offline', last:'어제',       color:'#F59E0B' },
241:     { id:'s5', name:'Tran Van',       init:'TV', email:'tranv@grandsaigon.com', phone:'+84 94 666 7777', roleId:'sys_admin',       status:'online',  last:'20분 전',   color:'#8B5CF6' },
242:     { id:'s6', name:'Soo Jin Park',   init:'SP', email:'sjp@grandsaigon.com',   phone:'+84 95 777 8888', roleId:'sys_manager',     status:'offline', last:'오늘 06:00', color:'#3B82F6' },
243: ];
244: 
245: window.PmsAPI = {
246:     getWeekData: async () => { return JSON.parse(JSON.stringify(_weekData)); },
247:     getMonthData: async () => { return JSON.parse(JSON.stringify(_monthData)); },
248:     getHistory: async () => { return JSON.parse(JSON.stringify(_history)); },
249:     getGroups: async () => { return JSON.parse(JSON.stringify(_groups)); },
250:     getRooms: async () => { return JSON.parse(JSON.stringify(_rooms)); },
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.


---

Created At: 2026-05-22T05:24:41Z
Completed At: 2026-05-22T05:24:41Z
File Path: `file:///E:/AI_Project/Hotel_PMS/dashboard/common/js/api-store.js`
Total Lines: 299
Total Bytes: 23910
Showing lines 250 to 299
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
250:     getRooms: async () => { return JSON.parse(JSON.stringify(_rooms)); },
251:     getReservations: async () => { return JSON.parse(JSON.stringify(_reservations)); },
252:     getDailyData: async () => { return JSON.parse(JSON.stringify(_dailyData)); },
253:     getMonthlyData: async () => { return JSON.parse(JSON.stringify(_monthlyData)); },
254:     getYoyData: async () => { return JSON.parse(JSON.stringify(_yoyData)); },
255:     getDepts: async () => { return JSON.parse(JSON.stringify(_depts)); },
256:     getTrendData: async () => { return JSON.parse(JSON.stringify(_trendData)); },
257:     getOrders: async () => { return JSON.parse(JSON.stringify(_orders)); },
258:     getTasks: async () => { return JSON.parse(JSON.stringify(_tasks)); },
259:     getRequests: async () => { return JSON.parse(JSON.stringify(_requests)); },
260:     getDEFAULT_ROOM_TYPES: async () => { return JSON.parse(JSON.stringify(_DEFAULT_ROOM_TYPES)); },
261:     getAllRooms: async () => { return JSON.parse(JSON.stringify(_allRooms)); },
262:     getAllRoomTypes: async () => { return JSON.parse(JSON.stringify(_allRoomTypes)); },
263:     getALL_MENUS: async () => { return JSON.parse(JSON.stringify(_ALL_MENUS)); },
264:     getSYSTEM_ROLES: async () => { return JSON.parse(JSON.stringify(_SYSTEM_ROLES)); },
265:     getDEFAULT_CUSTOM_ROLES: async () => { return JSON.parse(JSON.stringify(_DEFAULT_CUSTOM_ROLES)); },
266:     getDEFAULT_STAFF: async () => { return JSON.parse(JSON.stringify(_DEFAULT_STAFF)); },
267:     getGuests: async () => { 
268:         try {
269:           
<truncated 158 bytes>
ok) return await res.json();
272:         } catch(e) { console.warn('Fetch failed for guests, returning empty array'); }
273:         return [];
274:     },
275:     getReservations: async () => { 
276:         try {
277:             let res = await fetch('../common/data/reservations.json');
278:             if(!res.ok) res = await fetch('./common/data/reservations.json');
279:             if(res.ok) {
280:                 const data = await res.json();
281:                 if(data.length > 10) return data; 
282:             }
283:         } catch(e) { console.warn('Fetch failed for reservations, using memory fallback'); }
284:         return JSON.parse(JSON.stringify(_reservations));
285:     },
286:     getGolfOrders: async () => { 
287:         const items = [];
288:         for(let i=1; i<=8; i++) items.push({ id:`GLF-P${i.toString().padStart(3,'0')}`, room:`${1000+i}`, type: i%2===0?'club_a':'club_b', guest:'Guest '+i, items:'18홀 / 4인', total:450000, status:'new', time:'14:00' });
289:         for(let i=1; i<=12; i++) items.push({ id:`GLF-C${i.toString().padStart(3,'0')}`, room:`${800+i}`, type: i%2===0?'club_b':'club_a', guest:'Guest '+(i+8), items:'9홀 / 2인', total:150000, status:'done', time:'09:00' });
290:         return items;
291:     },
292:     getRentacarOrders: async () => { 
293:         const items = [];
294:         for(let i=1; i<=5; i++) items.push({ id:`RNT-P${i.toString().padStart(3,'0')}`, room:`${1200+i}`, type:'lotte', guest:'Guest '+i, items:'그랜저 IG / 2일', total:180000, status:'new', time:'10:00' });
295:         for(let i=1; i<=8; i++) items.push({ id:`RNT-C${i.toString().padStart(3,'0')}`, room:`${300+i}`, type:'sk', guest:'Guest '+(i+5), items:'아반떼 / 1일', total:60000, status:'done', time:'08:30' });
296:         return items;
297:     }
298: };