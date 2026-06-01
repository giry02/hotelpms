const fs = require('fs');

const path = 'dashboard/operations/rates.html';
let content = fs.readFileSync(path, 'utf8');

// Replace let DEFAULT_ROOM_TYPES = []; with the actual array
const replacement = `let DEFAULT_ROOM_TYPES = [
    { id: 'Standard', name: 'Standard Double', basePrice: 100 },
    { id: 'Deluxe', name: 'Deluxe King', basePrice: 150 },
    { id: 'Premier', name: 'Premier Twin', basePrice: 180 },
    { id: 'Suite', name: 'Executive Suite', basePrice: 300 },
    { id: 'Penthouse', name: 'Penthouse', basePrice: 800 }
];`;

content = content.replace(/let\s+DEFAULT_ROOM_TYPES\s*=\s*\[\];/, replacement);

// Also we need to make sure roomTypes correctly updates.
// The code has:
// 196: let roomTypes = getRoomTypes();
// We should change it to:
// let roomTypes = [];
// and in DOMContentLoaded, we set it:
// document.addEventListener('DOMContentLoaded', async () => {
//    ...
//    DEFAULT_ROOM_TYPES = await PmsAPI.getDEFAULT_ROOM_TYPES(); // wait, if we hardcode it, we don't need this line.

const domLoadedRegex = /document\.addEventListener\('DOMContentLoaded',\s*async\s*\(\)\s*=>\s*\{[\s\S]*?DEFAULT_ROOM_TYPES\s*=\s*await\s*PmsAPI\.getDEFAULT_ROOM_TYPES\(\);[\s\S]*?renderCalendar\(\);\s*\}\s*catch\(e\)\s*\{\s*console\.error\(e\);\s*\}\s*\}\);/;

const domLoadedReplacement = `document.addEventListener('DOMContentLoaded', async () => {
    try {
        roomTypes = getRoomTypes();
        if (roomTypes.length === 0) {
            localStorage.removeItem('pms_room_types_config');
            roomTypes = getRoomTypes();
        }
        renderCalendar();
    } catch(e) { console.error(e); }
});`;

content = content.replace(domLoadedRegex, domLoadedReplacement);

fs.writeFileSync(path, content);
console.log("Fixed rates.html");
