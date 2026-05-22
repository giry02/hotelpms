window.PmsAPI = {
220:     getWeekData: async () => { return JSON.parse(JSON.stringify(_weekData)); },
221:     getMonthData: async () => { return JSON.parse(JSON.stringify(_monthData)); },
2
<truncated 2660 bytes>
     getRentacarOrders: async () => { 
264:         const items = [];
265:         for(let i=1; i<=5; i++) items.push({ id:`RNT-P${i.toString().padStart(3,'0')}`, room:`${1200+i}`, type:'lotte', guest:'Guest '+i, items:'그랜저 IG / 2일', total:180000, status:'new', time:'10:00' });
266:         for(let i=1; i<=8; i++) items.push({ id:`RNT-C${i.toString().padStart(3,'0')}`, room:`${300+i}`, type:'sk', guest:'Guest '+(i+5), items:'아반떼 / 1일', total:60000, status:'done', time:'08:30' });
267:         return items;
268:     },
269: 
270:     // Unified Room Data Methods
271:     getAllRooms: async () => { return initStorage('pms_rooms', _fallbackRooms); },
272:     getAllRoomTypes: async () => { return initStorage('pms_room_types', _fallbackRoomTypes); },
273:     saveRoom: async (roomData) => {
274:         const rooms = initStorage('pms_rooms', _fallbackRooms);
275:         const existing = rooms.findIndex(r => r.id === roomData.id);
276:         if(existing >= 0) rooms[existing] = roomData;
277:         else rooms.push(roomData);
278:         localStorage.setItem('pms_rooms', JSON.stringify(rooms));
279:         return true;
280:     },
281:     saveRoomType: async (typeData) => {
282:         const types = initStorage('pms_room_types', _fallbackRoomTypes);
283:         const existing = types.findIndex(t => t.id === typeData.id);
284:         if(existing >= 0) types[existing] = typeData;
285:         else types.push(typeData);
286:         localStorage.setItem('pms_room_types', JSON.stringify(types));
287:         return true;
288:     },
289:     deleteRoom: async (roomId) => {
290:         let rooms = initStorage('pms_rooms', _fallbackRooms);
291:         rooms = rooms.filter(r => r.id !== roomId);
292:         localStorage.setItem('pms_rooms', JSON.stringify(rooms));
293:         return true;
294:     }
295: };