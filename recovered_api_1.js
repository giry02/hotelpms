window.PmsAPI = {
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