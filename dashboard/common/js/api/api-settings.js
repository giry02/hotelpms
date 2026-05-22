// api-settings.js
window.PmsAPI = window.PmsAPI || {};
// Add logic if needed

Object.assign(window.PmsAPI, {
    getALL_MENUS: async () => { return JSON.parse(JSON.stringify(_ALL_MENUS)); },},
 {id:'m2', name:'객실 현황'} ]; },
    getSYSTEM_ROLES: async () => { return JSON.parse(JSON.stringify(_SYSTEM_ROLES)); },},
 {id:'r2', name:'Front Desk'} ]; },
    getDEFAULT_CUSTOM_ROLES: async () => { return JSON.parse(JSON.stringify(_DEFAULT_CUSTOM_ROLES)); },},

    getDEFAULT_STAFF: async () => { return JSON.parse(JSON.stringify(_DEFAULT_STAFF)); },},
 ]; }
getDEFAULT_ROOM_TYPES: async () => { return JSON.parse(JSON.stringify(_DEFAULT_ROOM_TYPES)); },},
getAllRooms: async () => { return initStorage('pms_rooms', _fallbackRooms); },},
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
},
});