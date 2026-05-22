const fs = require('fs');
const path = require('path');

const pages = [
    'E:/AI_Project/Hotel_PMS/dashboard/frontdesk/reservation-list.html',
    'E:/AI_Project/Hotel_PMS/dashboard/crm/membership.html',
    'E:/AI_Project/Hotel_PMS/dashboard/operations/room-setup.html',
    'E:/AI_Project/Hotel_PMS/dashboard/operations/room-service.html',
    'E:/AI_Project/Hotel_PMS/dashboard/settings/roles.html',
    'E:/AI_Project/Hotel_PMS/dashboard/settings/notices.html',
    'E:/AI_Project/Hotel_PMS/dashboard/settings/support.html',
];

const langSelectHtml = [
    '<select class="hotel-select" id="langSelect" onchange="changeLang(this.value)" style="margin-left:8px; width:110px">',
    '<option value="ko">\uD83C\uDDF0\uD83C\uDDF7 \ud55c\uAD6D\uC5B4</option>',
    '<option value="en">\uD83C\uDDFA\uD83C\uDDF8 English</option>',
    '</select>'
].join('');

pages.forEach(p => {
    if (!fs.existsSync(p)) { console.log('MISSING:', p); return; }
    let c = fs.readFileSync(p, 'utf8');
    
    c = c.replace(/PMS_Sidebar\.toggle\(\)/g, 'toggleMenu()');
    c = c.replace(/PMS_Sidebar\.toggleMenu\(\)/g, 'toggleMenu()');
    
    if (!c.includes('langSelect')) {
        c = c.replace(
            '<div class="topbar-right"></div>',
            '<div class="topbar-right">' + langSelectHtml + '</div>'
        );
    }
    
    fs.writeFileSync(p, c);
    console.log('Fixed:', path.basename(p));
});

console.log('All done!');
