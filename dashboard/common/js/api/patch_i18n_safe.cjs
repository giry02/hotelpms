const fs = require('fs');

let code = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/i18n.js', 'utf8');

// ─── 1. Fix currentLang to read from localStorage ───────────────
code = code.replace(
    "window.currentLang = 'ko';",
    "window.currentLang = localStorage.getItem('pms_lang') || 'ko';"
);

// ─── 2. Add localStorage.setItem in changeLang ──────────────────
code = code.replace(
    "function changeLang(l) {\n    window.currentLang = l;\n    const d",
    "function changeLang(l) {\n    window.currentLang = l;\n    localStorage.setItem('pms_lang', l);\n    const d"
);
// Also handle Windows line endings
code = code.replace(
    "function changeLang(l) {\r\n    window.currentLang = l;\r\n    const d",
    "function changeLang(l) {\r\n    window.currentLang = l;\r\n    localStorage.setItem('pms_lang', l);\r\n    const d"
);

// ─── 3. Fix PAGE_TITLE_MAP ──────────────────────────────────────
const mapStart = code.indexOf('PAGE_TITLE_MAP = {');
const mapEnd = code.indexOf('};', mapStart) + 2;
const newMap = `PAGE_TITLE_MAP = {
    'Dashboard':         { ko: '대시보드',        en: 'Dashboard' },
    'Reservations':      { ko: '예약 타임라인',    en: 'Reservations' },
    'Booking List':      { ko: '예약 목록',        en: 'Booking List' },
    'Check-in/out':      { ko: '체크인/아웃',      en: 'Check-in/out' },
    'Groups':            { ko: '단체 관리',        en: 'Groups' },
    'Guest CRM':         { ko: '투숙객 관리',      en: 'Guest CRM' },
    'VIP Members':       { ko: 'VIP 멤버십',       en: 'VIP Members' },
    'Room Mgmt':         { ko: '객실 관리',        en: 'Room Mgmt' },
    'Room Types':        { ko: '객실 유형',        en: 'Room Types' },
    'Room List':         { ko: '객실 목록',        en: 'Room List' },
    'Rates Calendar':    { ko: '요금 캘린더',      en: 'Rates Calendar' },
    'Housekeeping':      { ko: '하우스키핑',       en: 'Housekeeping' },
    'Maintenance':       { ko: '시설 보수',        en: 'Maintenance' },
    'Folio List':        { ko: '정산 목록',        en: 'Folio List' },
    'Folio & Billing':   { ko: '통합 정산',        en: 'Folio & Billing' },
    'Revenue Analytics': { ko: '매출 분석',        en: 'Revenue Analytics' },
    'Night Audit':       { ko: '일일 마감',        en: 'Night Audit' },
    'Room Service':      { ko: '룸서비스',         en: 'Room Service' },
    'Golf':              { ko: '골프 예약',        en: 'Golf' },
    'Rent-a-car':        { ko: '렌터카',           en: 'Rent-a-car' },
    'Unified POS':       { ko: '통합 POS',         en: 'Unified POS' },
    'Ancillary Svcs':    { ko: '부가서비스',       en: 'Ancillary Svcs' },
    'Hotel Settings':    { ko: '호텔 설정',        en: 'Hotel Settings' },
    'Staff Mgmt':        { ko: '직원 관리',        en: 'Staff Mgmt' },
    'Staff List':        { ko: '직원 목록',        en: 'Staff List' },
    'Role & Perms':      { ko: '권한 설정',        en: 'Role & Perms' },
    'Billing & Payment': { ko: '요금 및 결제',     en: 'Billing & Payment' },
    'Notices':           { ko: '공지사항',         en: 'Notices' },
    'Support':           { ko: '고객지원',         en: 'Support' },
    'Tier Change History': { ko: '등급 변동 이력', en: 'Tier Change History' },
};`;
code = code.substring(0, mapStart) + newMap + code.substring(mapEnd);

// ─── 4. Add missing KO translations via Object.assign ──────────
// First check if there's already an Object.assign block for ko
const hasKoAssign = code.includes('Object.assign(window.translations.ko');
const missingKo = {
    'Groups': '단체 관리',
    'Maintenance': '시설 보수',
    'Night Audit': '일일 마감',
    'Unified POS': '통합 POS',
    'Revenue Analytics': '매출 분석',
    'Room List': '객실 목록',
    'Folio List': '정산 목록',
    'Folio & Billing': '통합 정산',
    'Ancillary Svcs': '부가서비스',
    'Staff List': '직원 목록',
    'Role & Perms': '권한 설정',
    'Billing & Payment': '요금 및 결제',
    'Hotel Settings': '호텔 설정',
    'Staff Mgmt': '직원 관리',
    'VIP Members': 'VIP 멤버십',
    'Booking List': '예약 목록',
    'Reservations': '예약 타임라인',
    'Guest CRM': '투숙객 관리',
    'Room Types': '객실 유형',
    'Room Service': '룸서비스',
    'Rent-a-car': '렌터카',
    'Golf': '골프 예약',
    'Rates Calendar': '요금 캘린더',
    'Housekeeping': '하우스키핑',
    'Room Mgmt': '객실 관리',
    'Check-in/out': '체크인/아웃',
    'Notices': '공지사항',
    'Support': '고객지원',
};
const koLines = Object.entries(missingKo).map(([k,v]) => `    "${k}": "${v}"`).join(',\n');
const koBlock = `\n// 사이드바 메뉴 KO 보완 번역\nObject.assign(window.translations.ko, {\n${koLines}\n});\n`;

if (hasKoAssign) {
    // Replace existing Object.assign ko block
    code = code.replace(/\/\/ 사이드바 메뉴 KO 보완 번역\nObject\.assign\(window\.translations\.ko,[\s\S]*?\}\);\n/, koBlock);
} else {
    code = code.trimEnd() + '\n' + koBlock;
}

// ─── 5. Remove duplicate EN assign blocks (keep only one) ──────
const enAssignCount = (code.match(/Object\.assign\(window\.translations\.en/g) || []).length;
if (enAssignCount > 1) {
    // Extract all KV from all EN blocks
    const kvMap = {};
    const enBlockRegex = /Object\.assign\(window\.translations\.en,\s*\{([\s\S]*?)\}\);/g;
    let m;
    while ((m = enBlockRegex.exec(code)) !== null) {
        const block = m[1];
        const kvRegex = /"([^"]+)":\s*"([^"]*)"/g;
        let kv;
        while ((kv = kvRegex.exec(block)) !== null) {
            kvMap[kv[1]] = kv[2];
        }
    }
    // Remove all EN assign blocks
    code = code.replace(/Object\.assign\(window\.translations\.en,[\s\S]*?\}\);\n?/g, '');
    // Append single merged block
    const enLines = Object.entries(kvMap).map(([k,v]) => `    "${k}": "${v}"`).join(',\n');
    code = code.trimEnd() + '\n\nObject.assign(window.translations.en, {\n' + enLines + '\n});\n';
    console.log('Merged EN translations:', Object.keys(kvMap).length, 'entries');
}

fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/i18n.js', code);

// Verify
const result = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/i18n.js', 'utf8');
console.log('changeLang has localStorage.setItem:', result.includes("localStorage.setItem('pms_lang'"));
console.log('currentLang reads localStorage:', result.includes("localStorage.getItem('pms_lang')"));
console.log('PAGE_TITLE_MAP has Groups:', result.includes("'Groups':"));
console.log('KO translations has Groups:', result.includes('"Groups": "단체 관리"'));
console.log('Total lines:', result.split('\n').length);
console.log('\nAll done!');
