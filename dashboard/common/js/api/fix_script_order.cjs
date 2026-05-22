const fs = require('fs');
const path = require('path');

const base = 'E:/AI_Project/Hotel_PMS/dashboard/';
const pages = [
    'dashboard.html',
    'frontdesk/reservation-timeline.html',
    'frontdesk/reservation-list.html',
    'frontdesk/checkin.html',
    'frontdesk/groups.html',
    'crm/guests.html',
    'crm/membership.html',
    'operations/rooms.html',
    'operations/room-setup.html',
    'operations/rates.html',
    'operations/housekeeping.html',
    'operations/maintenance.html',
    'operations/folio.html',
    'operations/reports.html',
    'operations/night-audit.html',
    'operations/room-service.html',
    'operations/golf.html',
    'operations/rentacar.html',
    'operations/unified-pos.html',
    'settings/settings.html',
    'settings/staff.html',
    'settings/roles.html',
    'settings/billing.html',
    'settings/notices.html',
    'settings/support.html',
];

let fixed = 0;

pages.forEach(p => {
    const full = base + p;
    if (!fs.existsSync(full)) { console.log('MISSING:', p); return; }
    let c = fs.readFileSync(full, 'utf8');
    
    const i18nPos = c.indexOf('i18n.js');
    const sidebarPos = c.indexOf('sidebar.js');
    
    if (i18nPos === -1) {
        // i18n.js missing entirely - add it before sidebar.js
        c = c.replace(/<script src="([^"]*sidebar\.js)"><\/script>/, '<script src="$1/../i18n.js"></script>\n    <script src="$1"></script>');
        // Let's handle it properly based on path depth
        const isRoot = !p.includes('/');
        const prefix = isRoot ? 'common/js/' : '../common/js/';
        c = c.replace(/<script src="[^"]*sidebar\.js"><\/script>/, 
            `<script src="${prefix}i18n.js"></script>\n    <script src="${prefix}sidebar.js"></script>`);
        fixed++;
        console.log('Added i18n.js to:', path.basename(p));
    } else if (i18nPos > sidebarPos && sidebarPos !== -1) {
        // sidebar.js comes before i18n.js - swap them
        const isRoot = !p.includes('/');
        const prefix = isRoot ? 'common/js/' : '../common/js/';
        
        // Remove both and re-insert in correct order in <head>
        c = c.replace(/<script src="[^"]*i18n\.js"><\/script>\s*\n?\s*/g, '');
        c = c.replace(/<script src="[^"]*sidebar\.js"><\/script>/, 
            `<script src="${prefix}i18n.js"></script>\n    <script src="${prefix}sidebar.js"></script>`);
        fixed++;
        console.log('Fixed script order in:', path.basename(p));
    } else {
        // console.log('Order OK:', path.basename(p));
    }
    
    fs.writeFileSync(full, c);
});

console.log('\nFixed script order in', fixed, 'pages');
