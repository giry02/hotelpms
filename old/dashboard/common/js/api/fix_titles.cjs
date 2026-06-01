const fs = require('fs');
const path = require('path');

// [filePath, sidebarLabel (EN key), Korean label, Browser title]
const pages = [
    ['dashboard/dashboard.html',                    'Dashboard',         '대시보드',        '대시보드'],
    ['dashboard/frontdesk/reservation-timeline.html','Reservations',     '예약 타임라인',   '예약 타임라인'],
    ['dashboard/frontdesk/reservation-list.html',    'Booking List',     '예약 목록',       '예약 목록'],
    ['dashboard/frontdesk/checkin.html',             'Check-in/out',     '체크인/아웃',     '체크인/아웃'],
    ['dashboard/frontdesk/groups.html',              'Groups',           '단체 관리',       '단체 관리'],
    ['dashboard/crm/guests.html',                    'Guest CRM',        '투숙객 관리',     '투숙객 관리'],
    ['dashboard/crm/membership.html',                'VIP Members',      'VIP 멤버십',      'VIP 멤버십'],
    ['dashboard/operations/rooms.html',              'Room Mgmt',        '객실 관리',       '객실 관리'],
    ['dashboard/operations/room-setup.html',         'Room Types',       '객실 유형',       '객실 유형'],
    ['dashboard/operations/rates.html',              'Rates Calendar',   '요금 캘린더',     '요금 캘린더'],
    ['dashboard/operations/housekeeping.html',       'Housekeeping',     '하우스키핑',      '하우스키핑'],
    ['dashboard/operations/maintenance.html',        'Maintenance',      '시설 보수',       '시설 보수'],
    ['dashboard/operations/folio.html',              'Folio List',       '정산 목록',       '통합 정산'],
    ['dashboard/operations/reports.html',            'Revenue Analytics','매출 분석',       '매출 분석'],
    ['dashboard/operations/night-audit.html',        'Night Audit',      '일일 마감',       '일일 마감'],
    ['dashboard/operations/room-service.html',       'Room Service',     '룸서비스',        '룸서비스'],
    ['dashboard/operations/golf.html',               'Golf',             '골프 예약',       '골프 예약'],
    ['dashboard/operations/rentacar.html',           'Rent-a-car',       '렌터카',          '렌터카'],
    ['dashboard/operations/unified-pos.html',        'Unified POS',      '통합 POS',        '통합 POS'],
    ['dashboard/settings/settings.html',             'Hotel Settings',   '호텔 설정',       '호텔 설정'],
    ['dashboard/settings/staff.html',                'Staff Mgmt',       '직원 관리',       '직원 관리'],
    ['dashboard/settings/roles.html',                'Role & Perms',     '권한 설정',       '권한 설정'],
    ['dashboard/settings/billing.html',              'Billing & Payment','요금 및 결제',    '요금 및 결제'],
    ['dashboard/settings/notices.html',              'Notices',          '공지사항',        '공지사항'],
    ['dashboard/settings/support.html',              'Support',          '고객지원',        '고객지원'],
];

// Also ensure sidebar KO translations include all missing entries
const missingKoTranslations = {
    'Groups': '단체 관리',
    'Maintenance': '시설 보수',
    'Night Audit': '일일 마감',
    'Unified POS': '통합 POS',
    'Revenue Analytics': '매출 분석',
    'Room List': '객실 목록',
    'Staff List': '직원 목록',
    'Role & Perms': '권한 설정',
    'Folio & Billing': '통합 정산',
};

let fixed = 0;
let missing = 0;

pages.forEach(([p, enKey, koLabel, browserTitle]) => {
    const full = 'E:/AI_Project/Hotel_PMS/' + p;
    if (!fs.existsSync(full)) {
        console.log('MISSING FILE:', p);
        missing++;
        return;
    }
    let c = fs.readFileSync(full, 'utf8');
    let changed = false;

    // 1. Fix browser title
    const titlePattern = /<title>[^<]*<\/title>/;
    const newTitle = `<title>${browserTitle} — Hotel PMS</title>`;
    if (!c.includes(`<title>${browserTitle} — Hotel PMS</title>`)) {
        c = c.replace(titlePattern, newTitle);
        changed = true;
    }

    // 2. Fix h1 data-i18n-key - find h1 and update its key + text
    const h1Pattern = /<h1([^>]*)>([^<]*)<\/h1>/;
    const h1Match = c.match(h1Pattern);
    if (h1Match) {
        const hasKey = h1Match[1].includes('data-i18n-key');
        const currentKey = hasKey ? h1Match[1].match(/data-i18n-key="([^"]*)"/)?.[1] : null;
        if (currentKey !== enKey || h1Match[2].trim() !== koLabel) {
            const attrs = h1Match[1].replace(/\s*data-i18n-key="[^"]*"/, '');
            c = c.replace(h1Pattern, `<h1${attrs} data-i18n-key="${enKey}">${koLabel}</h1>`);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(full, c);
        console.log('Fixed:', path.basename(p));
        fixed++;
    } else {
        console.log('OK:', path.basename(p));
    }
});

// 3. Update i18n.js to add missing KO translations
const i18nPath = 'E:/AI_Project/Hotel_PMS/dashboard/common/js/i18n.js';
let i18n = fs.readFileSync(i18nPath, 'utf8');
let i18nChanged = false;

// Find the KO translations block end (});)
// We need to add missing keys
for (const [key, val] of Object.entries(missingKoTranslations)) {
    const entry = `"${key}": "${val}"`;
    if (!i18n.includes(entry)) {
        // Find end of KO block
        const koBlockStart = i18n.indexOf('window.translations.ko');
        const koBlockEnd = i18n.indexOf('});', koBlockStart);
        i18n = i18n.substring(0, koBlockEnd) + `    ${entry},\n` + i18n.substring(koBlockEnd);
        i18nChanged = true;
        console.log('Added KO translation:', key, '->', val);
    }
}

// Remove duplicate EN entries (the EN block had duplicates)
// Find all Object.assign(window.translations.en ...) calls and merge them
const enAssignCount = (i18n.match(/Object\.assign\(window\.translations\.en/g) || []).length;
if (enAssignCount > 1) {
    console.log('Found', enAssignCount, 'EN assign blocks - merging...');
    
    // Extract all KV pairs from all EN blocks
    const kvMap = {};
    const enBlockRegex = /Object\.assign\(window\.translations\.en,\s*\{([\s\S]*?)\}\);/g;
    let m;
    while ((m = enBlockRegex.exec(i18n)) !== null) {
        const block = m[1];
        const kvRegex = /"([^"]+)":\s*"([^"]*)"/g;
        let kv;
        while ((kv = kvRegex.exec(block)) !== null) {
            kvMap[kv[1]] = kv[2];
        }
    }
    
    // Build single merged EN block
    const mergedLines = Object.entries(kvMap).map(([k,v]) => `    "${k}": "${v}"`).join(',\n');
    const singleEnBlock = `Object.assign(window.translations.en, {\n${mergedLines}\n});`;
    
    // Remove all existing EN assign blocks
    i18n = i18n.replace(/Object\.assign\(window\.translations\.en,[\s\S]*?\}\);\n?/g, '');
    // Append single merged block
    i18n = i18n.trimEnd() + '\n\n' + singleEnBlock + '\n';
    i18nChanged = true;
    console.log('Merged EN translations:', Object.keys(kvMap).length, 'entries');
}

if (i18nChanged) {
    fs.writeFileSync(i18nPath, i18n);
    console.log('i18n.js updated!');
}

console.log('\nDone! Fixed', fixed, 'pages, missing:', missing);
