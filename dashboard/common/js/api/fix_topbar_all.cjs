const fs = require('fs');
const path = require('path');

// [file path, expected sidebar label, Korean page title]
const pages = [
    ['dashboard/dashboard.html',                    'Dashboard',         '대시보드'],
    ['dashboard/frontdesk/reservation-timeline.html','Reservations',     '예약 타임라인'],
    ['dashboard/frontdesk/reservation-list.html',    'Booking List',     '예약 목록'],
    ['dashboard/frontdesk/checkin.html',             'Check-in/out',     '체크인/아웃'],
    ['dashboard/frontdesk/groups.html',              'Groups',           '단체 관리'],
    ['dashboard/crm/guests.html',                    'Guest CRM',        '투숙객 관리'],
    ['dashboard/crm/membership.html',                'VIP Members',      'VIP 멤버십'],
    ['dashboard/operations/rooms.html',              'Room Mgmt',        '객실 관리'],
    ['dashboard/operations/room-setup.html',         'Room Types',       '객실 유형'],
    ['dashboard/operations/rates.html',              'Rates Calendar',   '요금 캘린더'],
    ['dashboard/operations/housekeeping.html',       'Housekeeping',     '하우스키핑'],
    ['dashboard/operations/maintenance.html',        'Maintenance',      '시설 보수'],
    ['dashboard/operations/folio.html',              'Folio List',       '정산 목록'],
    ['dashboard/operations/reports.html',            'Revenue Analytics','매출 분석'],
    ['dashboard/operations/night-audit.html',        'Night Audit',      '일일 마감'],
    ['dashboard/operations/room-service.html',       'Room Service',     '룸서비스'],
    ['dashboard/operations/golf.html',               'Golf',             '골프 예약'],
    ['dashboard/operations/rentacar.html',           'Rent-a-car',       '렌터카'],
    ['dashboard/operations/unified-pos.html',        'Unified POS',      '통합 POS'],
    ['dashboard/settings/settings.html',             'Hotel Settings',   '호텔 설정'],
    ['dashboard/settings/staff.html',                'Staff Mgmt',       '직원 관리'],
    ['dashboard/settings/roles.html',                'Role & Perms',     '권한 설정'],
    ['dashboard/settings/billing.html',              'Billing & Payment','요금 및 결제'],
    ['dashboard/settings/notices.html',              'Notices',          '공지사항'],
    ['dashboard/settings/support.html',              'Support',          '고객지원'],
];

const STANDARD_TOPBAR = function(koLabel, enKey, isRoot) {
    const prefix = isRoot ? 'common/js/' : '../common/js/';
    return `    <header class="topbar">
        <div class="topbar-left">
            <button class="mobile-menu-btn" onclick="toggleMenu()"><i class="fa-solid fa-bars"></i></button>
            <h1 data-i18n-key="${enKey}">${koLabel}</h1>
        </div>
        <div class="topbar-right">
            <select class="hotel-select" id="langSelect" onchange="changeLang(this.value)" style="width:110px">
                <option value="ko">🇰🇷 한국어</option>
                <option value="en">🇺🇸 English</option>
            </select>
        </div>
    </header>`;
};

let fixedCount = 0;

pages.forEach(function([p, enKey, koLabel]) {
    const full = 'E:/AI_Project/Hotel_PMS/' + p;
    if (!fs.existsSync(full)) { console.log('MISSING:', p); return; }
    
    let c = fs.readFileSync(full, 'utf8');
    let changed = false;
    const isRoot = !p.includes('/frontdesk/') && !p.includes('/crm/') && !p.includes('/operations/') && !p.includes('/settings/');
    
    // ── 1. Fix topbar: ensure it has mobile-menu-btn, correct h1, and langSelect ──
    const topbarMatch = c.match(/<header class="topbar">([\s\S]*?)<\/header>/);
    if (topbarMatch) {
        const currentTopbar = topbarMatch[0];
        const hasMenuBtn = currentTopbar.includes('mobile-menu-btn');
        const hasLangSelect = currentTopbar.includes('langSelect');
        const hasCorrectH1 = currentTopbar.includes('data-i18n-key="' + enKey + '"');
        
        if (!hasMenuBtn || !hasLangSelect || !hasCorrectH1) {
            const newTopbar = STANDARD_TOPBAR(koLabel, enKey, isRoot);
            c = c.replace(/<header class="topbar">[\s\S]*?<\/header>/, newTopbar);
            changed = true;
            console.log('Fixed topbar:', path.basename(p), 
                '| menuBtn:', hasMenuBtn ? 'ok' : 'ADDED',
                '| langSelect:', hasLangSelect ? 'ok' : 'ADDED',
                '| h1key:', hasCorrectH1 ? 'ok' : 'FIXED');
        }
    }
    
    // ── 2. Ensure langSelect sets the correct value on load ──
    // Add script to sync langSelect value with current lang if not already there
    if (!c.includes('langSelect') && !c.includes('document.getElementById')) {
        // Already handled above
    }
    
    // ── 3. Add langSelect sync script before </body> if not present ──
    const syncScript = `<script>
// Sync language selector to stored preference
(function(){
    var sel = document.getElementById('langSelect');
    if(sel) sel.value = localStorage.getItem('pms_lang') || 'ko';
})();
</script>`;
    
    if (!c.includes('langSelect')) {
        // Handled above
    } else if (!c.includes("localStorage.getItem('pms_lang')") || !c.includes('sel.value')) {
        // Remove old sync scripts first
        c = c.replace(/<script>\s*\/\/ Sync language selector[\s\S]*?<\/script>\s*/g, '');
        // Add before </body>
        c = c.replace('</body>', syncScript + '\n</body>');
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(full, c);
        fixedCount++;
    }
});

console.log('\nTotal fixed:', fixedCount, 'files');
