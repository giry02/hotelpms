const fs = require('fs');
const pages = [
    ['E:/AI_Project/Hotel_PMS/dashboard/dashboard.html', 'dashboard'],
    ['E:/AI_Project/Hotel_PMS/dashboard/crm/guests.html', 'guests'],
    ['E:/AI_Project/Hotel_PMS/dashboard/frontdesk/checkin.html', 'checkin'],
    ['E:/AI_Project/Hotel_PMS/dashboard/settings/billing.html', 'billing'],
    ['E:/AI_Project/Hotel_PMS/dashboard/operations/housekeeping.html', 'housekeeping'],
    ['E:/AI_Project/Hotel_PMS/dashboard/settings/support.html', 'support'],
];

pages.forEach(function(item) {
    const p = item[0], name = item[1];
    const c = fs.readFileSync(p, 'utf8');
    const hasTopbarJs = c.includes('topbar.js');
    const hasI18n = c.includes('i18n.js');
    const hasSidebar = c.includes('sidebar.js');
    const hasMinHeader = c.includes('<header class="topbar"><h1');
    console.log(
        name + ':',
        'i18n=' + (hasI18n ? 'OK' : 'NO'),
        'sidebar=' + (hasSidebar ? 'OK' : 'NO'),
        'topbar.js=' + (hasTopbarJs ? 'OK' : 'NO'),
        'minimal-header=' + (hasMinHeader ? 'YES' : 'FULL(OK)')
    );
});
