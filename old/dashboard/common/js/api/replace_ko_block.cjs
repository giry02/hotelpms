const fs = require('fs');
let code = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/i18n.js', 'utf8');

const koBlockStart = code.lastIndexOf('Object.assign(window.translations.ko,');
const koBlockEnd = code.indexOf('});', koBlockStart) + 3;

const allKo = {
    'Main': '메인',
    'Front Desk': '프론트 데스크',
    'Guest & CRM': '투숙객 및 CRM',
    'Operations': '운영 관리',
    'Settings': '설정',
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
    'Group & MICE': '그룹/행사 예약',
    'Reporting': '종합 리포트',
    'POS': 'F&B / 리테일',
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
    'Customer Support': '고객 지원',
    'Notice Mgmt': '공지사항 관리',
    'Audit Logs': '감사 로그',
    'Platform Owner': '플랫폼 소유자',
    'Super Admin': '슈퍼 관리자',
};

const lines = Object.entries(allKo).map(function(pair) {
    return '    "' + pair[0] + '": "' + pair[1] + '"';
});
const newKoBlock = 'Object.assign(window.translations.ko, {\n' + lines.join(',\n') + '\n});';

code = code.substring(0, koBlockStart) + newKoBlock + code.substring(koBlockEnd);
fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/i18n.js', code);

const verify = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/i18n.js', 'utf8');
console.log('Groups KO:', verify.includes('"Groups": "\ub2e8\uccb4 \uad00\ub9ac"'));
console.log('Night Audit KO:', verify.includes('"Night Audit":'));
console.log('Unified POS KO:', verify.includes('"Unified POS":'));
console.log('Done! Total lines:', verify.split('\n').length);
