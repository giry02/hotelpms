const fs = require('fs');
const path = require('path');

const base = 'E:/AI_Project/Hotel_PMS/dashboard/';
const pages = [
    ['dashboard.html',                    'Dashboard',         '대시보드',       false],
    ['frontdesk/reservation-timeline.html','Reservations',     '예약 타임라인',  true],
    ['frontdesk/reservation-list.html',    'Booking List',     '예약 목록',      true],
    ['frontdesk/checkin.html',             'Check-in/out',     '체크인/아웃',    true],
    ['frontdesk/groups.html',              'Groups',           '단체 관리',      true],
    ['crm/guests.html',                    'Guest CRM',        '투숙객 관리',    true],
    ['crm/membership.html',                'VIP Members',      'VIP 멤버십',     true],
    ['operations/rooms.html',              'Room Mgmt',        '객실 관리',      true],
    ['operations/room-setup.html',         'Room Types',       '객실 유형',      true],
    ['operations/rates.html',              'Rates Calendar',   '요금 캘린더',    true],
    ['operations/housekeeping.html',       'Housekeeping',     '하우스키핑',     true],
    ['operations/maintenance.html',        'Maintenance',      '시설 보수',      true],
    ['operations/folio.html',              'Folio List',       '정산 목록',      true],
    ['operations/reports.html',            'Revenue Analytics','매출 분석',      true],
    ['operations/night-audit.html',        'Night Audit',      '일일 마감',      true],
    ['operations/room-service.html',       'Room Service',     '룸서비스',       true],
    ['operations/golf.html',               'Golf',             '골프 예약',      true],
    ['operations/rentacar.html',           'Rent-a-car',       '렌터카',         true],
    ['operations/unified-pos.html',        'Unified POS',      '통합 POS',       true],
    ['settings/settings.html',             'Hotel Settings',   '호텔 설정',      true],
    ['settings/staff.html',                'Staff Mgmt',       '직원 관리',      true],
    ['settings/roles.html',                'Role & Perms',     '권한 설정',      true],
    ['settings/billing.html',              'Billing & Payment','요금 및 결제',   true],
    ['settings/notices.html',              'Notices',          '공지사항',       true],
    ['settings/support.html',              'Support',          '고객지원',       true],
];

let fixed = 0;

pages.forEach(function(item) {
    const p = item[0], enKey = item[1], koLabel = item[2], isSub = item[3];
    const full = base + p;
    if (!fs.existsSync(full)) { console.log('MISSING:', p); return; }
    let c = fs.readFileSync(full, 'utf8');
    let changed = false;
    const prefix = isSub ? '../' : '';

    // ── 1. topbar를 최소화: h1만 있으면 topbar.js가 나머지를 주입 ──
    // topbar.js의 injectTopbar()는 기존 h1의 key와 텍스트를 읽어서 전체를 재구성함
    // 따라서 <header class="topbar">에는 h1만 남기면 됨
    const minimalTopbar = '<header class="topbar"><h1 data-i18n-key="' + enKey + '">' + koLabel + '</h1></header>';
    
    const topbarRegex = /<header class="topbar">[\s\S]*?<\/header>/;
    const topbarMatch = c.match(topbarRegex);
    if (topbarMatch && topbarMatch[0] !== minimalTopbar) {
        c = c.replace(topbarRegex, minimalTopbar);
        changed = true;
    }

    // ── 2. topbar.js 스크립트 로드 확인 (없으면 추가) ──
    if (!c.includes('topbar.js')) {
        // sidebar.js 다음에 추가
        const sidebarTag = '<script src="' + prefix + 'common/js/sidebar.js"></script>';
        const topbarTag = '<script src="' + prefix + 'common/js/topbar.js"></script>';
        if (c.includes(sidebarTag)) {
            c = c.replace(sidebarTag, sidebarTag + '\n    ' + topbarTag);
        } else {
            // </head> 바로 전에 추가
            c = c.replace('</head>', '    ' + topbarTag + '\n</head>');
        }
        changed = true;
    }

    // ── 3. ui-components.js 로드 확인 (없으면 추가) ──
    if (!c.includes('ui-components.js')) {
        const topbarTag = '<script src="' + prefix + 'common/js/topbar.js"></script>';
        const uiTag = '<script src="' + prefix + 'common/js/ui-components.js"></script>';
        if (c.includes(topbarTag)) {
            c = c.replace(topbarTag, uiTag + '\n    ' + topbarTag);
        }
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(full, c);
        fixed++;
        console.log('Fixed:', path.basename(p));
    } else {
        console.log('OK:', path.basename(p));
    }
});

console.log('\nDone! Fixed', fixed, 'pages');
