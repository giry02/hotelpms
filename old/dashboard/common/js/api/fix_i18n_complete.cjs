const fs = require('fs');

let code = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/i18n.js', 'utf8');

// ─── 1. Replace PAGE_TITLE_MAP with full, correct version ───────────────────
const newTitleMap = `PAGE_TITLE_MAP = {
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

// Replace existing PAGE_TITLE_MAP block
const mapStart = code.indexOf('PAGE_TITLE_MAP = {');
const mapEnd = code.indexOf('};', mapStart) + 2;
code = code.substring(0, mapStart) + newTitleMap + code.substring(mapEnd);

// ─── 2. Build complete KO translations (authoritative single block) ──────────
const koEntries = {
    // Sidebar groups
    'Main': '메인',
    'Front Desk': '프론트 데스크',
    'Guest & CRM': '투숙객 및 CRM',
    'Operations': '운영 관리',
    'Settings': '설정',
    // Sidebar items
    'Dashboard': '대시보드',
    'Reservations': '예약 타임라인',
    'Booking List': '예약 목록',
    'Check-in/out': '체크인/아웃',
    'Groups': '단체 관리',
    'Guest CRM': '투숙객 관리',
    'VIP Members': 'VIP 멤버십',
    'Room Mgmt': '객실 관리',
    'Room Types': '객실 유형',
    'Room List': '객실 목록',
    'Rates Calendar': '요금 캘린더',
    'Housekeeping': '하우스키핑',
    'Maintenance': '시설 보수',
    'Folio & Billing': '통합 정산',
    'Folio List': '정산 목록',
    'Revenue Analytics': '매출 분석',
    'Night Audit': '일일 마감',
    'Ancillary Svcs': '부가서비스',
    'Room Service': '룸서비스',
    'Golf': '골프 예약',
    'Rent-a-car': '렌터카',
    'Unified POS': '통합 POS',
    'Hotel Settings': '호텔 설정',
    'Staff Mgmt': '직원 관리',
    'Staff List': '직원 목록',
    'Role & Perms': '권한 설정',
    'Billing & Payment': '요금 및 결제',
    'Notices': '공지사항',
    'Support': '고객지원',
    // Page content
    'Group & MICE': '그룹/행사 예약',
    'Tenant Mgmt': '입점사 관리',
    'Ad Network': '광고 네트워크',
    'System': '시스템',
    'Platform Status': '플랫폼 현황',
    'Hotel List': '호텔 목록',
    'New Registration': '신규 입점 등록',
    'Campaigns': '캠페인 목록',
    'New Campaign': '캠페인 등록',
    'Ad Billing': '광고 정산',
    'Admin Accounts': '어드민 계정',
    'Subscription & Billing': '구독 및 결제',
    'Customer Support': '고객 지원',
    'Notice Mgmt': '공지사항 관리',
    'Audit Logs': '감사 로그',
    'Platform Owner': '플랫폼 소유자',
    'Super Admin': '슈퍼 관리자',
};

// Find and replace the entire KO translations block
const koStart = code.indexOf('window.translations.ko,');
const koBlockEnd = code.indexOf('});', koStart) + 3;
const koLines = Object.entries(koEntries).map(([k,v]) => `    "${k}": "${v}"`).join(',\n');
const newKoBlock = `window.translations.ko, {\n${koLines}\n});`;
code = code.substring(0, koStart) + newKoBlock + code.substring(koBlockEnd);

fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/i18n.js', code);
console.log('i18n.js PAGE_TITLE_MAP and KO translations fully updated!');
console.log('KO entries:', Object.keys(koEntries).length);
