const fs = require('fs');

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

// We want to generate reservations relative to "today" = 5/25
// For each room, we'll create a sequence of non-overlapping reservations from 5/15 to 5/35 (which maps to 6/4).
// start offsets relative to 5/25:
// day -10 to day +10

let idCounter = 1;

rooms.forEach(r => {
    let currentOffset = -10; // start 10 days ago
    
    while (currentOffset < 14) {
        // randomly skip some days between bookings (0 to 2 days)
        currentOffset += Math.floor(Math.random() * 3);
        
        // duration of stay (1 to 4 nights)
        let nights = Math.floor(Math.random() * 4) + 1;
        
        // if it goes way beyond our timeline window, break
        if (currentOffset > 14) break;
        
        const g = genGuest();
        const v = getRandomItem(vips);
        
        // Determine status based on dates relative to today (0)
        let status = 'confirmed';
        if (currentOffset < 0 && currentOffset + nights < 0) {
            status = 'checked-out';
        } else if (currentOffset < 0 && currentOffset + nights === 0) {
            // Checkout is today
            status = Math.random() > 0.5 ? 'checked-out' : 'checked-in';
        } else if (currentOffset <= 0 && currentOffset + nights > 0) {
            // Stayover or checked in today
            status = 'checked-in';
        } else if (currentOffset === 0) {
            // Checkin is today
            status = Math.random() > 0.5 ? 'checked-in' : 'confirmed';
        }
        
        // Format dates
        const getMMDD = (offset) => {
            const d = new Date(2026, 4, 25);
            d.setDate(d.getDate() + offset);
            return (d.getMonth()+1) + '/' + d.getDate();
        };
        
        generated.push({
            id: 'RSV-' + idCounter.toString().padStart(4, '0'),
            room: r.id, 
            fullRoom: 'T-' + r.id, 
            type: r.type,
            guestId: 'G-' + Math.floor(Math.random()*9000 + 1000),
            guest: g.name, 
            initials: g.initials,
            color: colorMap[r.type] || '#8B5CF6',
            start: currentOffset, // In reservation-timeline, renderStart = res.start - (baseDate-EPOCH). Since we patched baseDate=EPOCH, offset=0, so start=currentOffset.
            len: nights, 
            nights: nights,
            status: status,
            channel: getRandomItem(channels),
            cin: getMMDD(currentOffset), 
            cout: getMMDD(currentOffset + nights),
            amount: Math.floor(Math.random()*1500+200),
            vip: v, 
            isVip: (v === 'VIP' || v === 'Gold'), 
            isB2B: false
        });
        
        currentOffset += nights;
        idCounter++;
    }
});

const txt = fs.readFileSync('dashboard/common/js/api/api-frontdesk.js', 'utf8');
const search = "initStorage('pms_reservations', [";
const startIdx = txt.indexOf(search);
const endIdx = txt.indexOf(']);', startIdx);

const newTxt = txt.substring(0, startIdx) + search + '\n' + JSON.stringify(generated, null, 4).slice(1, -1) + ']);' + txt.substring(endIdx + 3);

fs.writeFileSync('dashboard/common/js/api/api-frontdesk.js', newTxt);
console.log('Generated ' + generated.length + ' non-overlapping reservations and patched api-frontdesk.js');
