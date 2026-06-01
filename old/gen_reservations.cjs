const fs = require('fs');

const todayStr = '5/25';

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const firstNames = ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Smith', 'Johnson', 'Brown', 'Williams', 'Jones', 'Garcia', 'Martinez', 'Rodriguez'];
const lastNames = ['Ji-hoon', 'Min-jun', 'Seo-yeon', 'Ji-woo', 'Thi', 'Van', 'Minh', 'Linh', 'James', 'John', 'Robert', 'Michael', 'Maria', 'David', 'Joseph', 'Charles'];
const channels = ['Direct', 'Agoda', 'Booking.com', 'Expedia', 'Walk-in', 'Corporate'];
const vips = ['Standard', 'Silver', 'Gold', 'VIP'];

function genGuest() {
    const f = getRandomItem(firstNames);
    const l = getRandomItem(lastNames);
    return { name: f + ' ' + l, initials: (f[0] + l[0]).toUpperCase() };
}

const rooms = [
    {id:'PH01', floor:20, type:'Penthouse'},
    {id:'PH02', floor:20, type:'Penthouse'},
    {id:'1401', floor:14, type:'Premier'},
    {id:'1402', floor:14, type:'Premier'},
    {id:'1403', floor:14, type:'Premier'},
    {id:'1405', floor:14, type:'Premier'},
    {id:'1201', floor:12, type:'Deluxe'},
    {id:'1202', floor:12, type:'Deluxe'},
    {id:'1203', floor:12, type:'Deluxe'},
    {id:'1205', floor:12, type:'Deluxe'},
    {id:'1206', floor:12, type:'Deluxe'},
    {id:'0801', floor:8, type:'Standard'},
    {id:'0802', floor:8, type:'Standard'},
    {id:'0803', floor:8, type:'Standard'},
    {id:'V-01', floor:1, type:'Pool Villa'},
    {id:'V-02', floor:1, type:'Pool Villa'}
];

const generated = [];
const colorMap = { 'Standard': '#EF4444', 'Deluxe': '#F59E0B', 'Premier': '#10B981', 'Penthouse': '#8B5CF6', 'Pool Villa': '#3B82F6' };

// Today's arrivals (cin: 5/25)
for(let i=0; i<15; i++) {
    const r = getRandomItem(rooms);
    const g = genGuest();
    const v = getRandomItem(vips);
    generated.push({
        id: 'RSV-CIN-' + (i+1).toString().padStart(3, '0'),
        room: r.id, fullRoom: 'T-' + r.id, type: r.type,
        guestId: 'G-' + Math.floor(Math.random()*9000 + 1000),
        guest: g.name, initials: g.initials,
        color: colorMap[r.type] || '#8B5CF6',
        start: 0, len: Math.floor(Math.random()*3+1), nights: Math.floor(Math.random()*3+1),
        status: (i < 5) ? 'checked-in' : 'confirmed', // 5 completed, 10 pending
        channel: getRandomItem(channels),
        cin: '5/25', cout: '5/' + (25 + Math.floor(Math.random()*3+1)),
        amount: Math.floor(Math.random()*1500+200),
        vip: v, isVip: (v === 'VIP' || v === 'Gold'), isB2B: false
    });
}

// Today's departures (cout: 5/25)
for(let i=0; i<12; i++) {
    const r = getRandomItem(rooms);
    const g = genGuest();
    const v = getRandomItem(vips);
    generated.push({
        id: 'RSV-COUT-' + (i+1).toString().padStart(3, '0'),
        room: r.id, fullRoom: 'T-' + r.id, type: r.type,
        guestId: 'G-' + Math.floor(Math.random()*9000 + 1000),
        guest: g.name, initials: g.initials,
        color: colorMap[r.type] || '#8B5CF6',
        start: -Math.floor(Math.random()*3+1), len: Math.floor(Math.random()*3+1), nights: Math.floor(Math.random()*3+1),
        status: (i < 8) ? 'checked-out' : 'checked-in', // 8 completed, 4 pending
        channel: getRandomItem(channels),
        cin: '5/' + (25 - Math.floor(Math.random()*3+1)), cout: '5/25',
        amount: Math.floor(Math.random()*1500+200),
        vip: v, isVip: (v === 'VIP' || v === 'Gold'), isB2B: false
    });
}

// Stayovers (cin < 5/25, cout > 5/25)
for(let i=0; i<8; i++) {
    const r = getRandomItem(rooms);
    const g = genGuest();
    const v = getRandomItem(vips);
    generated.push({
        id: 'RSV-STAY-' + (i+1).toString().padStart(3, '0'),
        room: r.id, fullRoom: 'T-' + r.id, type: r.type,
        guestId: 'G-' + Math.floor(Math.random()*9000 + 1000),
        guest: g.name, initials: g.initials,
        color: colorMap[r.type] || '#8B5CF6',
        start: -1, len: 3, nights: 3,
        status: 'checked-in',
        channel: getRandomItem(channels),
        cin: '5/24', cout: '5/27',
        amount: Math.floor(Math.random()*1500+200),
        vip: v, isVip: (v === 'VIP' || v === 'Gold'), isB2B: false
    });
}

// Future reservations
for(let i=0; i<15; i++) {
    const r = getRandomItem(rooms);
    const g = genGuest();
    const v = getRandomItem(vips);
    generated.push({
        id: 'RSV-FUT-' + (i+1).toString().padStart(3, '0'),
        room: r.id, fullRoom: 'T-' + r.id, type: r.type,
        guestId: 'G-' + Math.floor(Math.random()*9000 + 1000),
        guest: g.name, initials: g.initials,
        color: colorMap[r.type] || '#8B5CF6',
        start: 1, len: 2, nights: 2,
        status: 'confirmed',
        channel: getRandomItem(channels),
        cin: '5/26', cout: '5/28',
        amount: Math.floor(Math.random()*1500+200),
        vip: v, isVip: (v === 'VIP' || v === 'Gold'), isB2B: false
    });
}

const txt = fs.readFileSync('dashboard/common/js/api/api-frontdesk.js', 'utf8');
const search = "initStorage('pms_reservations', [";
const startIdx = txt.indexOf(search);
const endIdx = txt.indexOf(']);', startIdx);

const newTxt = txt.substring(0, startIdx) + search + '\n' + JSON.stringify(generated, null, 4).slice(1, -1) + ']);' + txt.substring(endIdx + 3);

fs.writeFileSync('dashboard/common/js/api/api-frontdesk.js', newTxt);
console.log('Generated ' + generated.length + ' reservations and patched api-frontdesk.js');
