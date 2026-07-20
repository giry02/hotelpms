// i18n.js - Global Translation Dictionary (English Base)

window.currentLang = localStorage.getItem('pms_lang') || 'ko';
document.documentElement.lang = window.currentLang === 'en' ? 'en' : 'ko';

window.pmsRevealI18nBoot = window.pmsRevealI18nBoot || function pmsRevealI18nBoot() {
    document.documentElement.classList.remove('pms-i18n-pending');
    const bootStyle = document.getElementById('pms-i18n-boot-style');
    if (bootStyle) bootStyle.remove();
    window.__pmsI18nBootRevealed = true;
};

(function installI18nBootGuard(){
    try {
        const bootLang = localStorage.getItem('pms_lang') || window.currentLang || 'ko';
        window.currentLang = bootLang;
        document.documentElement.lang = bootLang === 'en' ? 'en' : 'ko';
        if (bootLang !== 'en' || window.__pmsI18nBootGuardInstalled) return;
        window.__pmsI18nBootGuardInstalled = true;
        document.documentElement.classList.add('pms-i18n-pending');
        const style = document.createElement('style');
        style.id = 'pms-i18n-boot-style';
        style.textContent = 'html.pms-i18n-pending body{visibility:hidden!important;}';
        (document.head || document.documentElement).appendChild(style);
        window.addEventListener('load', () => {
            if (!window.__pmsI18nBootRevealed) setTimeout(window.pmsRevealI18nBoot, 500);
        });
        setTimeout(() => {
            if (!window.__pmsI18nBootRevealed) window.pmsRevealI18nBoot();
        }, 2200);
    } catch(e) {}
})();
window.PMS_I18N_NAMESPACE = window.PMS_I18N_NAMESPACE || 'dashboard';
window.PMS_CURRENCY_META = window.PMS_CURRENCY_META || {
    PHP: { symbol: '₱', locale: 'en-PH' },
    VND: { symbol: '₫', locale: 'vi-VN' },
    USD: { symbol: '$', locale: 'en-US' },
    KRW: { symbol: '₩', locale: 'ko-KR' },
    THB: { symbol: '฿', locale: 'th-TH' },
    JPY: { symbol: '¥', locale: 'ja-JP' }
};

function pmsShouldSkipAutoI18n(node) {
    const skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT', 'OPTION']);
    let el = node && node.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
    while (el) {
        if (skipTags.has(el.tagName)) return true;
        if (el.matches && el.matches('[data-no-auto-i18n], [data-no-i18n], [data-i18n-skip], .user-input, .guest-name, .timeline-user-data')) return true;
        el = el.parentElement;
    }
    return false;
}
window.pmsDefaultCurrency = window.pmsDefaultCurrency || function pmsDefaultCurrency() {
    return localStorage.getItem('pms_default_currency') || localStorage.getItem('pms_currency') || 'PHP';
};
window.PMS_DEFAULT_CURRENCY = window.pmsDefaultCurrency();

(function ensureDefaultCurrency(){
    try {
        const current = window.pmsDefaultCurrency();
        if (!localStorage.getItem('pms_default_currency')) localStorage.setItem('pms_default_currency', current);
        if (!localStorage.getItem('pms_currency')) localStorage.setItem('pms_currency', current);
        window.PMS_DEFAULT_CURRENCY = current;
    } catch(e) {}
})();

window.pmsFormatCurrency = window.pmsFormatCurrency || function pmsFormatCurrency(value, options = {}) {
    const amount = Number(value || 0);
    const digits = options.forceDecimals ? 2 : (Number.isInteger(amount) ? 0 : 2);
    const currency = options.currency || window.pmsDefaultCurrency();
    const meta = window.PMS_CURRENCY_META[currency] || window.PMS_CURRENCY_META.PHP;
    return new Intl.NumberFormat(meta.locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: digits,
        maximumFractionDigits: 2
    }).format(amount);
};

window.pmsNormalizeCurrencyDisplayText = window.pmsNormalizeCurrencyDisplayText || function pmsNormalizeCurrencyDisplayText(text) {
    if (typeof text !== 'string' || !text) return text;
    const currency = window.pmsDefaultCurrency();
    const symbol = (window.PMS_CURRENCY_META[currency] || window.PMS_CURRENCY_META.PHP).symbol;
    const display = `${currency} (${symbol})`;
    return text
        .replace(/USD\s*\(\s*\$\s*\)/gi, display)
        .replace(/KRW\s*\(\s*₩\s*\)/gi, display)
        .replace(/Amount\s*\(\s*USD\s*\)/gi, `Amount(${currency})`)
        .replace(/Amount\s+USD/gi, `Amount ${currency}`)
        .replace(/청구액\s*\(\s*USD\s*\)/g, `청구액 (${currency})`)
        .replace(/금액\s*\(\s*USD\s*\)/g, `금액 (${currency})`)
        .replace(/금액\s+USD/g, `금액 ${currency}`)
        .replace(/단가\s*\(\s*USD\s*\)/g, `단가 (${currency})`)
        .replace(/요금\s*\(\s*USD\s*\)/g, `요금 (${currency})`)
        .replace(/특별단가\s*\(\s*USD\s*\)/g, `특별단가(${currency})`)
        .replace(/\bUSD\b/g, currency)
        .replace(/\bKRW\b/g, currency)
        .replace(/US\$/g, symbol)
        .replace(/\$/g, symbol)
        .replace(/₩/g, symbol);
};

(function installCurrencyDisplayNormalizer(){
    const skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'CODE', 'PRE', 'TEXTAREA']);

    function shouldSkip(node) {
        let el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
        while (el) {
            if (skipTags.has(el.tagName)) return true;
            if (el.hasAttribute && (el.hasAttribute('data-no-currency-normalize') || el.hasAttribute('data-keep-currency'))) return true;
            el = el.parentElement;
        }
        return false;
    }

    function normalizeTextNode(node) {
        const next = window.pmsNormalizeCurrencyDisplayText(node.nodeValue);
        if (next !== node.nodeValue) node.nodeValue = next;
    }

    function normalizeElementAttributes(el) {
        ['placeholder', 'title', 'aria-label'].forEach(attr => {
            if (!el.hasAttribute || !el.hasAttribute(attr)) return;
            const current = el.getAttribute(attr);
            const next = window.pmsNormalizeCurrencyDisplayText(current);
            if (next !== current) el.setAttribute(attr, next);
        });
    }

    function normalizeCurrencyDisplay(root = document.body) {
        if (!root) return;
        if (root.nodeType === Node.TEXT_NODE) {
            if (!shouldSkip(root)) normalizeTextNode(root);
            return;
        }
        if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
        if (shouldSkip(root)) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                return shouldSkip(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
            }
        });
        const nodes = [];
        let node;
        while ((node = walker.nextNode())) nodes.push(node);
        nodes.forEach(normalizeTextNode);
        if (root.querySelectorAll) {
            root.querySelectorAll('[placeholder], [title], [aria-label]').forEach(el => {
                if (!shouldSkip(el)) normalizeElementAttributes(el);
            });
        }
        if (root.nodeType === Node.ELEMENT_NODE) normalizeElementAttributes(root);
    }

    window.pmsNormalizeCurrencyDisplay = normalizeCurrencyDisplay;

    function scheduleNormalize() {
        clearTimeout(window.__pmsCurrencyNormalizeTimer);
        window.__pmsCurrencyNormalizeTimer = setTimeout(() => normalizeCurrencyDisplay(), 40);
    }

    document.addEventListener('DOMContentLoaded', () => {
        normalizeCurrencyDisplay();
        if (!window.__pmsCurrencyObserver && document.body) {
            window.__pmsCurrencyObserver = new MutationObserver(scheduleNormalize);
            window.__pmsCurrencyObserver.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true,
                attributeFilter: ['placeholder', 'title', 'aria-label']
            });
        }
    });
    window.addEventListener('DataReady', scheduleNormalize);
    window.addEventListener('languagechange', scheduleNormalize);
})();

(function migrateDefaultCurrencyToPhp(){
    const migrationKey = 'pms_default_currency_php_migrated_v1';
    try {
        if (localStorage.getItem(migrationKey)) return;
        const current = localStorage.getItem('pms_default_currency');
        if (!current) localStorage.setItem('pms_default_currency', 'PHP');
        localStorage.setItem(migrationKey, '1');
    } catch(e) {}
})();

window.translations = {
    ko: {

    "Groups": "단체 관리",
    "Group Companies": "단체 등록 관리",
    "Block Allocations": "행사 및 객실배정",
    "Group Companies": "단체 등록 관리",
    "Block Allocations": "행사 및 객실배정",
    "Room List": "객실 현황",
    "Maintenance": "시설 관리",
    "Night Audit": "야간 마감",
    "Unified POS": "통합 포스",
    "Staff List": "직원 목록",
    "Role & Perms": "권한 설정",
        "Main": "메인",
        "Front Desk": "프론트 데스크",
        "Guest & CRM": "투숙객 및 고객 관리",
        "Customer Management": "고객 관리",
        "Operations": "운영 관리",
        "Settings": "설정",
        "Settings & Admin": "설정/관리",
        "Dashboard": "대시보드",
        "Reservations": "예약 관리",
        "Booking List": "예약 목록",
        "Check-in/out": "체크인/아웃",
        "Guest CRM": "투숙객 관리",
            "Agencies": "거래처/여행사",
        "VIP Members": "우수 고객 멤버십",
        "Room Mgmt": "객실 관리",
        "Room Types": "객실 타입",
        "Rates Calendar": "요금 캘린더",
        "Housekeeping": "하우스키핑",
        "Folio & Billing": "정산 및 청구",
        "Folio List": "정산 내역",
        "Revenue Analytics": "매출 분석",
        "Ancillary Svcs": "부가 서비스",
        "Room Service": "룸서비스",
        "Golf": "골프",
        "Rent-a-car": "렌터카",
        "Hotel Settings": "호텔 설정",
        "Staff Mgmt": "직원 관리",
        "Billing & Payment": "요금 및 결제",
        "Payment Settings": "결제 설정",
        "Notices": "공지사항",
        "Support": "고객지원",

    "Main": "메인",
    "Guest & CRM": "투숙객 및 고객 관리",
    "Customer Management": "고객 관리",
    "Guest CRM": "투숙객 관리",
            "Agencies": "거래처/여행사",
    "VIP Members": "우수 고객 멤버십",
    "Room Mgmt": "객실 관리",
    "Folio List": "정산 목록",
    "Revenue Analytics": "매출 분석",
    "Staff Mgmt": "직원 관리",
    "Billing & Payment": "요금 및 결제",
    "Payment Settings": "결제 설정",
    "Dashboard": "대시보드",
    "Front Desk": "프론트 데스크",
    "Check-in/out": "체크인/아웃",
    "Room Assignment": "객실 배정",
    "Reservations": "예약 관리",
    "Operations": "운영 관리",
    "Housekeeping": "하우스키핑",
    "Room Setup": "객실 셋업",
    "Room Service": "룸서비스",
    "CRM & Guests": "고객 관리 및 투숙객",
    "Guest List": "고객 목록",
    "Membership": "멤버십",
    "Tier History": "등급 이력",
    "Ancillary Svcs": "부가서비스 관리",
    "Golf": "골프",
    "Rent-a-car": "렌터카",
    "Settings": "설정",
    "Settings & Admin": "설정/관리",
    "Hotel Settings": "호텔 설정",
    "Room Types": "객실 유형",
    "Staff & Roles": "직원 및 권한",
    "Billing": "요금 및 결제",
    "Notices": "공지사항",
    "Support": "고객지원",
    "Helpdesk": "고객지원",
    "Set default rates for weekdays, weekends, and holidays.": "객실 유형별 평일(일~목), 주말(금, 토), 공휴일의 기본 요금을 설정합니다.",
    "Set automatic discount rates (%) applied during booking based on guest tier.": "고객 등급에 따라 예약 시 자동으로 적용될 할인율(%)을 지정합니다.",
    "Allow Overbooking": "오버부킹 (Overbooking) 허용",
    "Rates Calendar": "요금 캘린더 (Rates)",
    "Hotel Description (Multi)": "호텔 소개 (다국어 지원)",
    "Require Deposit (Pre-auth)": "디파짓(보증금) 필수 청구",
    "Folio & Billing": "통합 정산",
    "Auto VIP Discounts": "우수 고객 자동 할인율 설정",
    "Vacant": "공실",
    "New Diamond": "신규 다이아몬드",
    "Export Transactions": "결제 내역 다운로드",
    "VIP Discounts": "우수 고객 할인율 설정",
    "OOS": "점검 중",
    "Default Check-out": "기본 체크아웃 시간",
    "Staff & Roles": "직원 및 권한 관리",
    "Avg. Spend/Guest": "고객당 평균 지출",
    "Paid (Deposit)": "결제액 (보증금)",
    "Default Check-in": "기본 체크인 시간",
    "Ancillary Svcs": "부가서비스 관리",
    "Recent Tier Changes": "최근 등급 변동",
    "Late Check-out": "레이트 체크아웃",
    "Tier Change History": "등급 변동 이력",
    "Settled Today": "금일 정산 완료",
    "Ancillary Rev": "부가서비스 매출",
    "Card Payment %": "카드 결제 비율",
    "Est. Revenue": "금일 예상 매출",
    "Manual Order": "수기 오더 등록",
    "Print Task List": "작업지시서 출력",
    "Default Rates": "기본 요금 설정",
    "Room Types": "객실 유형 관리",
    "Add Room": "신규 객실 등록",
    "Cancellation Policy": "기본 취소 정책",
    "Reservations": "예약 타임라인",
    "VIP Members": "우수 고객 멤버십",
    "Upgrades (Month)": "이번 달 승급",
    "Downgrades (Month)": "이번 달 강등",
    "Amount(USD)": "금액",
    "Preparing": "준비/진행 중",
    "Save Changes": "변경사항 저장",
    "Policies": "정책 및 규정",
    "Billing & Tax": "결제 및 세금",
    "Main Phone": "대표 전화번호",
    "On Duty": "현재 근무 중",
    "System Admins": "시스템 관리자",
    "Front Desk": "프론트 데스크",
    "Guest CRM": "투숙객 관리",
    "Check-in/out": "체크인/아웃",
    "Total Guests": "총 고객 수",
    "VIP Guests": "우수 고객",
    "Tier Criteria": "등급 기준",
    "Early Check-in": "얼리 체크인",
    "Retention Rate": "등급 유지율",
    "VIP Guests": "우수 고객 투숙",
    "Process Check-in": "체크인 처리",
    "Outstanding Bal": "미수금 잔액",
    "All Services": "전체 서비스",
    "Spa & Massage": "스파/마사지",
    "Rates Calendar": "요금 캘린더",
    "Main Email": "대표 이메일",
    "Booking List": "예약 목록",
    "Room Mgmt": "객실 관리",
    "Housekeeping": "하우스키핑",
    "Folio & Billing": "통합 정산",
    "Ancillary Svcs": "부가서비스",
    "Hotel Settings": "호텔 설정",
    "Staff Mgmt": "직원 관리",
    "Export": "엑셀 다운",
    "Add Guest": "고객 등록",
    "Visits": "방문 횟수",
    "Last Stay": "최근 투숙",
    "New Booking": "신규 예약",
    "Available": "잔여 객실",
    "Booking Detail": "예약 상세",
    "Revenue Analytics": "매출 분석",
    "Folio List": "정산 목록",
    "Check-out": "체크아웃일",
    "New Requests": "신규 요청",
    "Completed": "처리 완료",
    "Total Tasks": "전체 작업",
    "Pending Clean": "청소 대기",
    "To Inspect": "점검 대기",
    "Needs Cleaning": "청소 요망",
    "Weekend/Holiday": "주말/휴일",
    "Save Rates": "요금 저장",
    "Room Type": "객실 유형",
    "Occupied": "투숙 객실",
    "Vacant Clean": "청결 공실",
    "Vacant Dirty": "오염 공실",
    "Add Room": "객실 등록",
    "Basic Info": "기본 정보",
    "Hotel Name": "호텔 이름",
    "Hotel Address": "호텔 주소",
    "Operational Policies": "운영 정책",
    "Total Staff": "전체 직원",
    "Add Staff": "직원 등록",
    "Role": "소속/권한",
    "Last Login": "최근 접속",
    "Dashboard": "대시보드",
    "Return Rate": "재방문율",
    "Total Spend": "총 지출",
    "This Month": "이번 달",
    "Last Month": "지난 달",
    "Check-out": "체크아웃",
    "Booking #": "예약번호",
    "Total Rooms": "총 객실",
    "Occupied": "판매 중",
    "Total": "총 금액",
    "Room Service": "룸서비스",
    "Concierge": "컨시어지",
    "Occupied": "투숙 중",
    "Out of Order": "점검 중",
    "Contact": "연락처",
    "Check-in": "체크인",
    "Guest": "투숙객",
    "Management": "관리자",
    "Name": "직원명",
    "All": "전체",
    "Guest": "고객",
    "Country": "국적",
    "Tier": "등급",
    "Actions": "관리",
    "Benefit": "혜택",
    "Upgrade": "승급",
    "Downgrade": "강등",
    "Confirmed": "확정",
    "Pending": "대기",
    "Cancel": "취소",
    "Room": "객실",
    "Type": "유형",
    "Stay": "숙박",
    "Channel": "채널",
    "Status": "상태",
    "Today": "오늘",
    "Close": "닫기",
    "Completed": "완료",
    "Weekday": "평일",
    "Apply": "적용",
    "Date": "날짜",
    "Day": "요일",
    "Save": "저장",
    "Tier Change Reason": "등급 변경 사유",
    "Tier Change Reason Hint": "등급이 변경되는 경우 이 사유와 변경자가 등급 변경 이력에 저장됩니다.",
    "부가서비스 등록": "부가서비스 등록",
    "업체/항목 관리": "업체/항목 관리",
    "투숙 객실": "투숙 객실",
    "통합 POS": "통합 POS",
    "음식점": "음식점",
    "골프장": "골프장",
    "렌터카": "렌터카",
    "기타": "기타",
    "누적 이용금액": "누적 이용금액",
    "부가서비스 등록 가능": "부가서비스 등록 가능",
    "합산": "합산"
    },
    en: {

    "Groups": "Groups",
    "Group Companies": "Group Companies",
    "Block Allocations": "Block Allocations",
    "Room List": "Room List",
    "Maintenance": "Maintenance",
    "Night Audit": "Night Audit",
    "Unified POS": "Unified POS",
    "Staff List": "Staff List",
    "Role & Perms": "Role & Perms",
    "Set default rates for weekdays, weekends, and holidays.": "Set default rates for weekdays, weekends, and holidays.",
    "Set automatic discount rates (%) applied during booking based on guest tier.": "Set automatic discount rates (%) applied during booking based on guest tier.",
    "Allow Overbooking": "Allow Overbooking",
    "Rates Calendar": "Rates Calendar",
    "Hotel Description (Multi)": "Hotel Description (Multi)",
    "Require Deposit (Pre-auth)": "Require Deposit (Pre-auth)",
    "Folio & Billing": "Folio & Billing",
    "Auto VIP Discounts": "Auto VIP Discounts",
    "Vacant": "Vacant",
    "New Diamond": "New Diamond",
    "Export Transactions": "Export Transactions",
    "VIP Discounts": "VIP Discounts",
    "OOS": "OOS",
    "Default Check-out": "Default Check-out",
    "Staff & Roles": "Staff & Roles",
    "Avg. Spend/Guest": "Avg. Spend/Guest",
    "Paid (Deposit)": "Paid (Deposit)",
    "Default Check-in": "Default Check-in",
    "Ancillary Svcs": "Ancillary Svcs",
    "Recent Tier Changes": "Recent Tier Changes",
    "Late Check-out": "Late Check-out",
    "Tier Change History": "Tier Change History",
    "Settled Today": "Settled Today",
    "Ancillary Rev": "Ancillary Rev",
    "Card Payment %": "Card Payment %",
    "Est. Revenue": "Est. Revenue",
    "Manual Order": "Manual Order",
    "Print Task List": "Print Task List",
    "Default Rates": "Default Rates",
    "Room Types": "Room Types",
    "Add Room": "Add Room",
    "Cancellation Policy": "Cancellation Policy",
    "Reservations": "Reservations",
    "VIP Members": "VIP Members",
    "Upgrades (Month)": "Upgrades (Month)",
    "Downgrades (Month)": "Downgrades (Month)",
    "Amount(USD)": "Amount(USD)",
    "Preparing": "Preparing",
    "Save Changes": "Save Changes",
    "Policies": "Policies",
    "Billing & Tax": "Billing & Tax",
    "Main Phone": "Main Phone",
    "On Duty": "On Duty",
    "System Admins": "System Admins",
    "Front Desk": "Front Desk",
    "Guest CRM": "Guest CRM",
            "Agencies": "Agencies",
    "Check-in/out": "Check-in/out",
    "Total Guests": "Total Guests",
    "VIP Guests": "VIP Guests",
    "Tier Criteria": "Tier Criteria",
    "Tier Member Status": "Tier Member Status and Criteria",
    "VIP Upgrade Criteria": "Upgrade Criteria",
    "Early Check-in": "Early Check-in",
    "Retention Rate": "Retention Rate",
    "VIP Guests": "VIP Guests",
    "Process Check-in": "Process Check-in",
    "Outstanding Bal": "Outstanding Bal",
    "All Services": "All Services",
    "Spa & Massage": "Spa & Massage",
    "Rates Calendar": "Rates Calendar",
    "Main Email": "Main Email",
    "Booking List": "Reservation List",
    "Room Mgmt": "Room Mgmt",
    "Housekeeping": "Housekeeping",
    "Folio & Billing": "Folio & Billing",
    "Ancillary Svcs": "Ancillary Svcs",
    "Hotel Settings": "Hotel Settings",
    "Staff Mgmt": "Staff Mgmt",
    "Export": "Export",
    "Add Guest": "Add Guest",
    "Visits": "Visits",
    "Last Stay": "Last Stay",
    "New Booking": "New Booking",
    "Available": "Available",
    "Booking Detail": "Booking Detail",
    "Revenue Analytics": "Revenue Analytics",
    "Folio List": "Folio List",
    "Check-out": "Check-out",
    "New Requests": "New Requests",
    "Completed": "Completed",
    "Total Tasks": "Total Tasks",
    "Pending Clean": "Pending Clean",
    "To Inspect": "To Inspect",
    "Needs Cleaning": "Needs Cleaning",
    "Weekend/Holiday": "Weekend/Holiday",
    "Save Rates": "Save Rates",
    "Room Type": "Room Type",
    "Occupied": "Occupied",
    "Vacant Clean": "Vacant Clean",
    "Vacant Dirty": "Vacant Dirty",
    "Add Room": "Add Room",
    "Basic Info": "Basic Info",
    "Hotel Name": "Hotel Name",
    "Hotel Address": "Hotel Address",
    "Operational Policies": "Operational Policies",
    "Total Staff": "Total Staff",
    "Add Staff": "Add Staff",
    "Role": "Role",
    "Last Login": "Last Login",
    "Dashboard": "Dashboard",
    "Return Rate": "Return Rate",
    "Total Spend": "Total Spend",
    "This Month": "This Month",
    "Last Month": "Last Month",
    "Check-out": "Check-out",
    "Booking #": "Booking #",
    "Total Rooms": "Total Rooms",
    "Occupied": "Occupied",
    "Total": "Total",
    "Room Service": "Room Service",
    "Concierge": "Concierge",
    "Occupied": "Occupied",
    "Out of Order": "Out of Order",
    "Contact": "Contact",
    "Check-in": "Check-in",
    "Guest": "Guest",
    "Management": "Management",
    "Name": "Name",
    "All": "All",
    "Guest": "Guest",
    "Country": "Country",
    "Tier": "Tier",
    "Actions": "Actions",
    "Benefit": "Benefit",
    "Upgrade": "Upgrade",
    "Downgrade": "Downgrade",
    "Confirmed": "Confirmed",
    "Pending": "Pending",
    "Cancel": "Cancel",
    "Room": "Room",
    "Type": "Type",
    "Stay": "Stay",
    "Channel": "Channel",
    "Status": "Status",
    "Today": "Today",
    "Close": "Close",
    "Completed": "Completed",
    "Weekday": "Weekday",
    "Apply": "Apply",
    "Date": "Date",
    "Day": "Day",
    "Save": "Save",
    "Tier Change Reason": "Tier Change Reason",
    "Tier Change Reason Hint": "When the tier changes, this reason and the editor are saved in tier change history."
    }
};

function setupI18n() {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            return pmsShouldSkipAutoI18n(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
    }, false);
    let n;
    const t = [];
    while(n = w.nextNode()) {
        const o = n.nodeValue, x = o.trim();
        // NOW match against the English dictionary keys
        if(x && window.translations.en[x] && !n.parentNode.hasAttribute('data-i18n-key')) {
            const s = document.createElement('span');
            s.setAttribute('data-i18n-key', x);
            s.textContent = x;
            t.push({node:n, span:s, originalText:o});
        }
    }
    t.forEach(({node:n, span:s, originalText:o}) => {
        const f = document.createDocumentFragment();
        const l = o.match(/^\s+/), r = o.match(/\s+$/);
        if(l) f.appendChild(document.createTextNode(l[0]));
        f.appendChild(s);
        if(r) f.appendChild(document.createTextNode(r[0]));
        n.parentNode.replaceChild(f, n);
    });
}

// Page title map: English key → { ko, en }
const PAGE_TITLE_MAP = {
    'Dashboard':         { ko: '대시보드',        en: 'Dashboard' },
    'Reservations':      { ko: '예약 타임라인',    en: 'Reservations' },
    'Booking List':      { ko: '예약 목록',        en: 'Reservation List' },
    'Check-in/out':      { ko: '체크인/아웃',      en: 'Check-in/out' },
    'Groups':            { ko: '단체 관리',        en: 'Groups' },
    'Guest CRM':         { ko: '투숙객 관리',      en: 'Guest CRM' },
    'Customer Management': { ko: '고객 관리',      en: 'Customer Management' },
    'VIP Members':       { ko: '우수 고객 멤버십', en: 'VIP Members' },
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
    'Unified POS':       { ko: '통합 포스',         en: 'Unified POS' },
    'Ancillary Svcs':    { ko: '부가서비스',       en: 'Ancillary Svcs' },
    'Hotel Settings':    { ko: '호텔 설정',        en: 'Hotel Settings' },
    'Staff Mgmt':        { ko: '직원 관리',        en: 'Staff Mgmt' },
    'Staff List':        { ko: '직원 목록',        en: 'Staff List' },
    'Role & Perms':      { ko: '권한 설정',        en: 'Role & Perms' },
    'Billing & Payment': { ko: '요금 및 결제',     en: 'Billing & Payment' },
    'Payment Settings':  { ko: '결제 설정',        en: 'Payment Settings' },
    'Notices':           { ko: '공지사항',         en: 'Notices' },
    'Support':           { ko: '고객지원',         en: 'Support' },
    'Tier Change History': { ko: '등급 변동 이력', en: 'Tier Change History' },
};

function applyKoEnDatasetI18n(lang) {
    document.querySelectorAll('[data-ko][data-en]').forEach(element => {
        const translated = element.getAttribute(lang === 'en' ? 'data-en' : 'data-ko');
        if (translated == null) return;
        if (element.matches('input, textarea')) {
            element.setAttribute('placeholder', translated);
        } else if (element.matches('option')) {
            element.textContent = translated;
        } else {
            element.textContent = translated;
        }
    });
}

function changeLang(l) {
    window.currentLang = l;
    localStorage.setItem('pms_lang', l);
    document.documentElement.lang = l === 'en' ? 'en' : 'ko';
    const d = window.translations[l] || window.translations.en;
    const catalog = (window.PMS_I18N_CATALOG && window.PMS_I18N_CATALOG[window.PMS_I18N_NAMESPACE]) || {};
    const catalogDict = catalog[l] || catalog.en || {};

    // 1. data-i18n-key 속성이 있는 모든 요소 번역
    document.querySelectorAll('[data-i18n-key]').forEach(e => {
        const k = e.getAttribute('data-i18n-key');
        if(catalogDict[k]) e.textContent = catalogDict[k];
        else if(d[k]) e.textContent = d[k];
    });

    document.querySelectorAll('[data-i18n]').forEach(e => {
        const k = e.getAttribute('data-i18n');
        if(catalogDict[k]) e.textContent = catalogDict[k];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(e => {
        const k = e.getAttribute('data-i18n-placeholder');
        if(catalogDict[k]) e.setAttribute('placeholder', catalogDict[k]);
        else if(d[k]) e.setAttribute('placeholder', d[k]);
    });

    applyKoEnDatasetI18n(l);

    // 2. h1 태그 번역 (data-i18n-key 없는 것도 포함)
    document.querySelectorAll('h1').forEach(h1 => {
        const key = h1.getAttribute('data-i18n-key') || h1.textContent.trim();
        if(PAGE_TITLE_MAP[key]) {
            h1.textContent = PAGE_TITLE_MAP[key][l] || PAGE_TITLE_MAP[key]['en'];
            h1.setAttribute('data-i18n-key', key);
        } else if(d[key]) {
            h1.textContent = d[key];
            h1.setAttribute('data-i18n-key', key);
        }
    });

    // 3. <title> 태그 번역
    const titleEl = document.querySelector('title');
    if(titleEl) {
        const rawTitle = titleEl.getAttribute('data-i18n-title') || titleEl.textContent;
        // data-i18n-title에 영어 키를 저장해두고 참조
        if(!titleEl.getAttribute('data-i18n-title')) {
            titleEl.setAttribute('data-i18n-title', rawTitle);
        }
        const baseTitle = titleEl.getAttribute('data-i18n-title');
        // "Key — Hotel PMS" 형식에서 키 추출
        const keyPart = baseTitle.replace(/\s*[—\-]\s*Hotel PMS.*$/i, '').replace(/\s*-\s*Hotel PMS.*$/i, '').trim();
        if(PAGE_TITLE_MAP[keyPart]) {
            const translated = PAGE_TITLE_MAP[keyPart][l] || keyPart;
            titleEl.textContent = translated + ' — Hotel PMS';
        }
    }

    // 4. 언어 선택 드롭다운 동기화
    const langSelects = document.querySelectorAll('#langSelect, .lang-select, select[onchange*="changeLang"]');
    langSelects.forEach(sel => {
        if(sel.value !== l) sel.value = l;
    });

    if(typeof window.applyLocalI18n === 'function') window.applyLocalI18n(l);
    applyVisibleTextI18nFallback(l, catalog);
    window.dispatchEvent(new Event('languagechange'));
    if (typeof window.pmsRevealI18nBoot === 'function') {
        requestAnimationFrame(() => window.pmsRevealI18nBoot());
    }
}

function buildReverseI18nMap(catalog) {
    const reverse = {};
    const add = (koText, enText) => {
        if (!koText || !enText || koText === enText) return;
        reverse[String(koText).trim()] = String(enText).trim();
    };

    Object.entries(window.translations.ko || {}).forEach(([key, koText]) => {
        const enText = (window.translations.en && window.translations.en[key]) || key;
        add(koText, enText);
    });

    const koCatalog = catalog.ko || {};
    const enCatalog = catalog.en || {};
    Object.entries(koCatalog).forEach(([key, koText]) => add(koText, enCatalog[key] || key));
    Object.entries(getExactKoEnFallbackMap()).forEach(([koText, enText]) => add(koText, enText));

    return reverse;
}

function getExactKoEnFallbackMap() {
    return {
        '플랫폼 운영자': 'Platform Operator',
        '슈퍼 관리자': 'Super Admin',
        '전체 호텔': 'Total Hotels',
        'MRR (월 매출)': 'MRR',
        '이탈률': 'Churn Rate',
        '평균 가동률': 'Average Occupancy',
        '최근 7일 차트': 'Last 7 Days',
        '국가별 호텔 수': 'Hotels by Country',
        '최근 입점 호텔': 'Recent Hotels',
        '활성 캠페인 TOP 3': 'Top 3 Active Campaigns',
        'CSV 내보내기': 'Export CSV',
        'CSV 다운로드': 'Download CSV',
        '총 청구액:': 'Total Billing:',
        '캠페인': 'Campaign',
        '캠페인명': 'Campaign',
        '광고주': 'Advertiser',
        '과금 방식': 'Billing Model',
        '단가': 'Unit Price',
        '노출수': 'Impressions',
        '클릭수': 'Clicks',
        '청구액 (USD)': 'Amount (USD)',
        '청구액': 'Billing Amount',
        '총 청구액': 'Total Billing',
        '새 캠페인 등록': 'New Campaign',
        '활성 캠페인': 'Active Campaigns',
        '총 노출수': 'Total Impressions',
        '진행 중': 'Active',
        '종료': 'Ended',
        '노출 / 클릭 추이': 'Impression / Click Trend',
        '캠페인 상세 정보': 'Campaign Details',
        '캠페인 기본 정보': 'Campaign Information',
        '단가/방식': 'Rate / Model',
        '시작일 (UTC)': 'Start Date (UTC)',
        '종료일 (UTC)': 'End Date (UTC)',
        '랜딩 URL': 'Landing URL',
        '광고 배너 업로드': 'Ad Banner Upload',
        '타겟팅 설정 (국가 > 도시)': 'Targeting Settings (Country > City)',
        '타겟 추가': 'Add Target',
        '국가': 'Country',
        '도시': 'City',
        '대상 호텔': 'Target Hotels',
        '가중치 (1~10)': 'Weight (1-10)',
        '가중치 분포': 'Weight Distribution',
        '감사 이벤트': 'Audit Events',
        '기기': 'Device',
        '위험': 'Risk',
        '로그 ID': 'Log ID',
        '시간': 'Time',
        '작업 유형': 'Action Type',
        '상세': 'Details',
        '접속 IP': 'Access IP',
        '과금 현황 (Billing)': 'Billing Status',
        '이번 달 결제 완료': 'Paid This Month',
        '미납 및 연체': 'Unpaid / Overdue',
        '정지된 테넌트 (이탈)': 'Suspended Tenants',
        'All 결제 내역': 'All Payments',
        '미납/연체': 'Unpaid / Overdue',
        '만료 임박 (D-3)': 'Expiring Soon (D-3)',
        '만료됨': 'Expired',
        '호텔': 'Hotel',
        '미처리 문의': 'Open Tickets',
        '메시지 전송': 'Send Message',
        '서드파티 연동 관리': 'Third-party Integrations',
        '전체 연동': 'All Integrations',
        '결제(PG)': 'Payment Gateway',
        '메시징': 'Messaging',
        '커스텀 연동 추가': 'Add Custom Integration',
        'Stripe 결제': 'Stripe Payments',
        'API 설정': 'API Settings',
        '새 공지 작성': 'New Notice',
        '발행됨': 'Published',
        '미발행': 'Unpublished',
        '제목': 'Title',
        '대상 사용자': 'Target Users',
        '국가/지역': 'Country / Region',
        '조회 수': 'Views',
        '전 지역': 'All Regions',
        '프로필 설정': 'Profile Settings',
        '비밀번호 변경': 'Change Password',
        '이메일': 'Email',
        '2단계 인증 (2FA)': 'Two-factor Authentication (2FA)',
        '활성': 'Active',
        '등록된 기기 관리': 'Trusted Devices',
        '현재 기기': 'Current Device',
        '사용자 관리': 'User Management',
        '신규 관리자 초대': 'Invite Admin',
        '사용자 목록': 'Users',
        '이름': 'Name',
        '역할': 'Role',
        '최근 로그인': 'Last Login',
        '플랫폼 최고 관리자': 'Platform Owner',
        '호텔 입점 신청': 'Hotel Onboarding Application',
        '관리자 로그인으로 돌아가기': 'Back to Admin Login',
        '입점 신청서': 'Onboarding Application',
        '신규 신청': 'New Application',
        '호텔 정보': 'Hotel Information',
        '호텔명': 'Hotel Name',
        '객실 수': 'Room Count',
        '객실 수 *': 'Room Count *',
        '초기 관리자 계정': 'Initial Admin Account',
        '운영 중': 'Active',
        '서비스 정지': 'Suspend Service',
        '전체 객실': 'Total Rooms',
        '월 매출': 'Monthly Revenue',
        '점유율': 'Occupancy',
        '광고 매출': 'Ad Revenue',
        '국가/도시': 'Country / City',
        '입점 신청 페이지': 'Application Page',
        '전체 (5)': 'All (5)',
        '운영 중 (2)': 'Active (2)',
        '심사 중 (0)': 'Under Review (0)',
        '정지됨 (0)': 'Suspended (0)',
        '반려 (0)': 'Rejected (0)',
        '플랜': 'Plan',
        '호텔 기본 정보': 'Hotel Information',
        '타임존': 'Timezone',
        '계약 정보': 'Contract Information',
        '계약 기간': 'Contract Period',
        '등록하기': 'Register',
        '검색': 'Search',
        '조회': 'Search',
        '전체': 'All',
        '총': 'Total',
        '결제': 'Payment',
        '객실': 'Room',
        '투숙 중': 'In-house',
        '체크아웃': 'Check-out',
        '오늘 체크인': 'Today Check-ins',
        '완료': 'Completed',
        '수정': 'Edit',
        '예정': 'Scheduled',
        '접수': 'Received',
        '처리중': 'In Progress',
        '낮음': 'Low',
        '오류': 'Error',
        '배치 작업': 'Batch Job',
        '메시지': 'Message',
        '모듈': 'Module',
        '상태 코드': 'Status Code',
        '발생 시간': 'Occurred At',
        '금일 예약 건': 'Today Reservations',
        '제휴 업체 수': 'Partners',
        '예상 수수료 수익': 'Estimated Commission',
        '업체 관리': 'Manage Vendors',
        '골프장': 'Golf Course',
        '렌트카': 'Rent-a-car',
        '스파': 'Spa',
        '기타': 'Other',
        '미정산 단체': 'Unsettled Groups',
        '예약 Confirmed': 'Confirmed Reservations',
        '예약 Pending': 'Pending Reservations',
        '취소/노쇼': 'Cancel / No-show',
        '전주 대비': 'vs Previous Week',
        '주별 (Weekly)': 'Weekly',
        '월별 (Monthly)': 'Monthly',
        '년도별 (Yearly)': 'Yearly',
        '금일 (Today)': 'Today',
        'Room 매출': 'Room Revenue',
        '객실 매출': 'Room Revenue',
        '부가서비스 매출': 'Ancillary Revenue',
        '매출 요약': 'Revenue Summary',
        '총 매출': 'Total Revenue',
        '객실 수익 (Room Revenue)': 'Room Revenue',
        '일별 매출 추이': 'Daily Revenue Trend',
        '해당 주차 총 매출': 'Weekly Total Revenue',
        '해당 월 총 매출': 'Monthly Total Revenue',
        '올해 누적 총 매출': 'YTD Total Revenue',
        '작년 대비': 'vs Last Year',
        '스파': 'Spa',
        '룸서비스': 'Room Service',
        '세탁': 'Laundry',
        '미니바': 'Minibar',
        '외부 대행': 'External Partner',
        '룸서비스 오더': 'Room Service Orders',
        '통합 POS 주문': 'Unified POS Orders',
        '골프 예약': 'Golf Reservations',
        '렌터카 예약': 'Rent-a-car Reservations',
        '부가서비스 통합 대시보드': 'Ancillary Services Dashboard',
        '각 부가서비스 위젯을 클릭하여 상세 페이지로 이동하세요.': 'Select an ancillary service widget to open its detail page.',
        '시설보수 신청': 'Maintenance Request',
        '건물/구역 관리': 'Building / Area Management',
        '항목 관리': 'Item Management',
        '수동 오더 등록': 'Manual Order',
        '신규 접수': 'New',
        '오더 수락': 'Accept Order',
        '결제 및 청구 (Payment/Charge)': 'Payment / Charge',
        '상품/메뉴 등록': 'Product / Menu Setup',
        '결제 수단': 'Payment Method',
        '투숙객 확인': 'Verify Guest',
        '결제/청구 완료': 'Complete Payment / Charge',
        '요금 일괄 수정': 'Bulk Rate Edit',
        'VIP 할인율 설정': 'VIP Discount Settings',
        '단체 할인율': 'Group Discount',
        '기본 요금으로 초기화': 'Reset to Default Rates',
        '일자 (Date)': 'Date',
        '업체 관리': 'Vendor Management',
        '역할 및 접근 권한 관리': 'Roles and Access Management',
        '왼쪽에서 역할을 선택하여 우측에서 권한을 확인하거나 수정하세요.': 'Select a role on the left to view or edit permissions.',
        '역할 목록': 'Roles',
        '추가': 'Add',
        '왼쪽에서 역할을 선택하거나': 'Select a role on the left or click',
        '+ 추가': '+ Add',
        '버튼을 누르세요.': 'to create one.',
        '호텔의 프로필 및 Contact 정보를 설정합니다. OTA Channel과 웹사이트에 노출됩니다.': 'Set the hotel profile and contact information shown on OTA channels and the website.',
        '체크인/체크아웃 시간 및 취소 정책을 설정합니다.': 'Set check-in/check-out times and cancellation policies.',
        '기본 통화 및 부가세(VAT) 요율을 설정합니다.': 'Set default currency and VAT rate.',
        '기본 결제 통화': 'Default Payment Currency',
        '기본 세금(VAT) 비율': 'Default VAT Rate',
        '변경사항 All Save': 'Save All Changes',
        '전체 직원': 'Total Staff',
        '근무 중': 'On Duty',
        '정의된 역할 수': 'Defined Roles',
        '오프라인': 'Offline',
        '직원 목록': 'Staff List',
        '직원 계정과 역할, 상태를 확인하거나 등록 및 수정하세요.': 'View, register, or edit staff accounts, roles, and status.',
        '권한 설정': 'Permissions',
        '직원 등록': 'Add Staff',
        '직원': 'Staff',
        '접근 권한 수': 'Permissions',
        '상태': 'Status',
        '최근 접속': 'Last Login',
        '나의 문의 내역': 'My Tickets',
        '문의하기': 'Contact Support',
        '답변 내역': 'Replies',
        '답변완료': 'Answered',
        '작성일: 2026-05-20 | 상태:': 'Created: 2026-05-20 | Status:',
        '시스템 공지': 'System Notices',
        '시스템 점검': 'Maintenance',
        '점검 일시:': 'Maintenance Window:',
        '영향 범위:': 'Impact:',
        '대상 지역:': 'Regions:',
        '감사합니다.': 'Thank you.',
        '심사 중': 'Under Review',
        '글로벌 시스템 로그': 'Global System Logs',
        '테넌트 (호텔)': 'Tenant (Hotel)',
        'PG사 타임아웃 오류 발생': 'PG Timeout Error',
        '권한: RBAC 정책 충돌': 'Permission: RBAC Policy Conflict',
        '자동화 스크립트 오류 (메모리)': 'Automation Script Error (Memory)',
        '합계': 'Total',
        'CPC (클릭당 $0.45)': 'CPC ($0.45 per click)',
        '광고 배너 소재': 'Ad Banner Creative',
        '리조트 골프 패키지 $199부터': 'Resort Golf Package from $199',
        '예약하기': 'Book Now',
        '728 x 90 배너 (한국어 버전)': '728 x 90 Banner (Korean Version)',
        '단가 (USD)': 'Rate (USD)',
        '한국어 배너': 'Korean Banner',
        '영어 배너': 'English Banner',
        '일본어 배너': 'Japanese Banner',
        '위험도': 'Risk Level',
        '입점 승인': 'Tenant Approval',
        '비밀번호 초기화': 'Password Reset',
        '결제 주기': 'Billing Cycle',
        '금액': 'Amount',
        '갱신일': 'Renewal Date',
        '월간': 'Monthly',
        '결제 완료': 'Paid',
        '연체': 'Overdue',
        '2 items 처리 필요': '2 tickets need action',
        '[TCK-1001] 요금 캘린더 저장 확인 요청': '[TCK-1001] Rate Calendar Save Request',
        '[TCK-1002] 관리자 비밀번호 초기화': '[TCK-1002] Admin Password Reset',
        '관리팀': 'Admin Team',
        '안녕하세요. 결제창 호출 시 PG사 연동 에러(Error 502)가 발생했습니다. 확인 부탁드립니다.': 'Hello. A PG integration error (Error 502) occurred when opening the payment window. Please check it.',
        '글로벌 신용카드 결제 및 디파짓(Pre-auth) 처리를 위한 Stripe 결제 모듈입니다. 테넌트들이 자신의 Stripe 계정을 연결할 수 있습니다.': 'Stripe module for global credit card payments and deposit pre-authorization. Tenants can connect their own Stripe accounts.',
        '국내 고객을 위한 카카오톡 알림톡 발송 모듈입니다. 예약 확정, 체크인 안내, 웰컴 메시지 자동 발송을 지원합니다.': 'Kakao notification module for domestic guests. Supports reservation confirmations, check-in notices, and welcome messages.',
        'NICE Pay (나이스페이)': 'NICE Pay',
        '국내 신용카드, 가상계좌, 간편결제(네이버페이, 카카오페이 등)를 지원하는 국내 표준 결제 게이트웨이 연동 모듈입니다.': 'Domestic payment gateway integration supporting credit cards, virtual accounts, and simple payments such as Naver Pay and Kakao Pay.',
        '시스템 점검 안내 (5/25 02:00~06:00 UTC)': 'System Maintenance Notice (5/25 02:00-06:00 UTC)',
        '베트남 지역 정산 시스템 업데이트 안내': 'Vietnam Billing System Update',
        '호텔 관리자': 'Hotel Admin',
        '한국 지역 카카오 알림톡 연동 안내': 'Korea Kakao Notification Integration Notice',
        'Jun 글로벌 프로모션 캠페인 신청 안내': 'June Global Promotion Campaign Application Notice',
        '유럽 지역 개인정보 처리 방침 업데이트': 'Europe Privacy Policy Update',
        '관리자 계정에 연결된 신뢰 기기 목록입니다. 분실했거나 더 이상 사용하지 않는 기기는 즉시 해제하세요.': 'Trusted devices connected to the admin account. Remove lost or unused devices immediately.',
        '최근 활동: 현재 접속 중 | 등록일: 2026-05-10': 'Recent activity: Currently active | Added: 2026-05-10',
        '최근 활동: 2026-05-21 08:30 | 등록일: 2026-05-12': 'Recent activity: 2026-05-21 08:30 | Added: 2026-05-12',
        '최근 활동: 2026-04-10 14:20 | 등록일: 2026-03-05': 'Recent activity: 2026-04-10 14:20 | Added: 2026-03-05',
        '기기 해제': 'Remove Device',
        '운영 관리자': 'Operations Manager',
        '월 이용료': 'Monthly Fee',
        '로그인 이메일': 'Login Email',
        '호텔 최고 관리자 계정입니다.': 'Primary hotel administrator account.',
        '분실 시 임시 비밀번호 또는 재설정 링크를 이메일로 발송합니다.': 'If lost, send a temporary password or reset link by email.',
        '재설정 메일 발송': 'Send Reset Email',
        '매출 현황': 'Revenue Status',
        '(최근 6개월)': '(Last 6 months)',
        '호텔 정보와 담당자 계정을 입력합니다.': 'Enter hotel information and the manager account.',
        'Super Admin에서 심사 후 승인/반려를 처리합니다.': 'Super Admin reviews and approves or rejects the application.',
        '승인 시 로그인 안내와 임시 비밀번호 초기화 링크가 이메일로 발송됩니다.': 'When approved, login instructions and a temporary password reset link are sent by email.',
        '신청이 접수되면 플랫폼 관리자가 계약/운영 정보를 확인한 뒤 승인 결과와 접속 안내를 이메일로 발송합니다.': 'After submission, the platform admin checks contract and operation details, then emails the approval result and access instructions.',
        '로그인 ID는 담당자 이메일로 생성됩니다. 비밀번호는 승인 전까지 활성화되지 않습니다.': 'The login ID is created from the manager email. The password is not activated until approval.',
        '운영 기준:': 'Operation Policy:',
        '승인 이후 비밀번호 분실 시 호텔 담당자는 이메일 기반 재설정 링크를 받고, Super Admin은 호텔 상세 또는 관리자 계정 화면에서 임시 비밀번호 발송을 처리합니다.': 'After approval, hotel managers receive an email reset link for lost passwords, and Super Admin can send a temporary password from hotel detail or admin account pages.',
        '사업자 등록번호': 'Business Registration No.',
        '담당자 정보': 'Manager Information',
        '담당자명 *': 'Manager Name *',
        '담당자 이메일 *': 'Manager Email *',
        '연락처 *': 'Phone *',
        '희망 플랜': 'Preferred Plan',
        '신청 접수': 'Submit Application',
        'Tier 필터 선택': 'Select Tier Filter',
        '모든 Tier Guest 표시': 'Show all tier guests',
        '최상위 Tier Guest': 'Top-tier guests',
        '상위 Tier Guest': 'Upper-tier guests',
        '우수 Tier Guest': 'Preferred guests',
        '일반 Tier Guest': 'Standard guests',
        '총 투숙 횟수': 'Total Stays',
        '최근 투숙일': 'Last Stay',
        '고객 상세': 'Guest Detail',
        '20 visits 이상 투숙 · 연 $10,000+': '20+ stays · Annual $10,000+',
        '10 visits 이상 투숙 · 연 $5,000+': '10+ stays · Annual $5,000+',
        '5 visits 이상 투숙 · 연 $2,000+': '5+ stays · Annual $2,000+',
        '일반 회원 · 가입 즉시': 'Standard member · Upon signup',
        '더보기': 'View More',
        '· 5 visits 투숙 달성': '· 5 stays reached',
        '· 연 $5,000 돌파': '· Annual $5,000 reached',
        '· 연 $10,000 돌파': '· Annual $10,000 reached',
        '· 12개월 미투숙': '· No stay for 12 months',
        '· 10회 투숙 달성': '· 10 stays reached',
        '· 20회 투숙 달성': '· 20 stays reached',
        '· 연 지출 미달': '· Annual spend below threshold',
        '전월 대비 +5': '+5 vs last month',
        '12개월 미활동 기준': '12-month inactivity rule',
        'All VIP 회원 기준': 'All VIP member criteria',
        '이번 분기 달성': 'Achieved this quarter',
        '변동': 'Change',
        '이전 Tier': 'Previous Tier',
        '변경 Tier': 'New Tier',
        '사유': 'Reason',
        'Alexander Kim 체크인 예정': 'Alexander Kim check-in scheduled',
        'Miller Grace 체크아웃 예정': 'Miller Grace check-out scheduled',
        'Guest / 주의사항': 'Guest / Notes',
        '특이사항 없음': 'No notes',
        '신분증 확인됨': 'ID verified',
        '방해금지': 'Do Not Disturb',
        '청소요청': 'Cleaning requested',
        '외출': 'Away',
        '재실': 'In room',
        '신분증 확인': 'ID Check',
        '단체 블록을 찾을 수 없습니다.': 'Group block not found.',
        '목록으로': 'Back to List',
        '전체 행사': 'All Events',
        '현재 투숙 중': 'Currently In-house',
        '블록 배정 객실': 'Block Rooms',
        '지난 행사': 'Past Events',
        '정산 필요': 'Settlement Needed',
        '신규 행사 생성': 'New Event',
        '운영 상태': 'Operation Status',
        '행사 / 업체': 'Event / Company',
        '기간': 'Period',
        '투숙객': 'Guests',
        '등록 단체 수': 'Registered Groups',
        '진행/예정 행사': 'Active / Upcoming Events',
        '일반 기업': 'Corporate',
        '여행사': 'Travel Agency',
        '신규 단체 등록': 'New Group',
        '삼성전자': 'Samsung Electronics',
        '일반 기업 · COMP-1001': 'Corporate · COMP-1001',
        '담당: 김지연': 'Manager: Kim Ji-yeon',
        '미수금만 보기': 'Show Outstanding Only',
        '내역 다운로드': 'Download Details',
        '정산 번호(Folio)': 'Folio No.',
        '고객명': 'Guest Name',
        '결제액': 'Paid Amount',
        '명세서': 'Statement',
        '금일 라운딩 Completed': 'Today Completed Rounds',
        '금일 대여 중/Completed': 'Today In-use / Completed',
        'All 예약 (1)': 'All Reservations (1)',
        '썬밸리 CC (1)': 'Sun Valley CC (1)',
        '스카이72 (0)': 'Sky72 (0)',
        '썬밸리 CC': 'Sun Valley CC',
        '롯데렌터카 (1)': 'Lotte Rent-a-car (1)',
        'SK렌터카 (0)': 'SK Rent-a-car (0)',
        '롯데렌터카': 'Lotte Rent-a-car',
        '18홀 / 4인': '18 holes / 4 players',
        '그랜저 / 2일': 'Grandeur / 2 days',
        '접수: 14:00': 'Received: 14:00',
        '접수: 10:00': 'Received: 10:00',
        '청구액:': 'Charge:',
        '칸반': 'Kanban',
        '테이블': 'Table',
        '긴급 대기': 'Urgent Pending',
        '티켓 생성': 'Create Ticket',
        '요청 번호': 'Request No.',
        '상세 내용': 'Details',
        '우선순위': 'Priority',
        '담당자': 'Assignee',
        '현재 영업일': 'Current Business Day',
        '롤오버 예정일': 'Rollover Date',
        '미처리 체크아웃': 'Pending Check-outs',
        '미도착 체크인': 'No-show Check-ins',
        '노쇼(No-Show)': 'No-show',
        'POS / F&B (식음료 및 리테일)': 'POS / F&B and Retail',
        '아메리카노 (Cafe)': 'Americano (Cafe)',
        '조식 뷔페 (Buffet)': 'Breakfast Buffet',
        '미니바 스낵 (Minibar)': 'Minibar Snack',
        'Room 번호 (Room Charge 시 필수)': 'Room No. (Required for Room Charge)',
        'All 오더': 'All Orders',
        '전체 오더': 'All Orders',
        '조식': 'Breakfast',
        '다이닝/야식': 'Dining / Late-night',
        '주류/음료': 'Liquor / Drinks',
        '식음료/룸서비스': 'F&B / Room Service',
        '아메리칸 브렉퍼스트 x2, 오렌지 주스': 'American breakfast x2, orange juice',
        '화이트 와인 1병, 치즈 플래터': 'White wine bottle, cheese platter',
        'Steve T - 클럽 샌드위치, 콜라': 'Steve T - Club sandwich, cola',
        'Lee S - 셔츠 드라이클리닝 2': 'Lee S - Shirt dry cleaning x2',
        '다이닝': 'Dining',
        '서비스 이용 제한 경고: 요금 미납': 'Service Restriction Warning: Unpaid Billing',
        '미납 요금을 결제하지 않으시면': 'If unpaid charges are not settled,',
        '예약 생성, 체크인 처리 등 핵심 기능 사용이 제한될 수 있습니다.': 'core features such as reservation creation and check-in processing may be restricted.',
        '미납 요금 결제하기 ($299.00)': 'Pay Outstanding Balance ($299.00)',
        '현재 이용 중': 'Current Plan',
        'Premium 플랜': 'Premium Plan',
        '시스템 정기 점검 안내 (5/25 02:00~06:00 UTC)': 'Scheduled System Maintenance (5/25 02:00-06:00 UTC)',
        '안녕하세요. Hotel PMS 본사 플랫폼 운영팀입니다.': 'Hello, this is the Hotel PMS platform operations team.',
        '안정적인 서비스 제공을 위해 아래 일정과 같이 시스템 정기 점검이 진행될 예정입니다.': 'Scheduled maintenance will be performed as below to provide stable service.',
        '점검 시간 동안에는 시스템 접속 및 기능 사용이 중단되오니, 호텔 업무에 차질이 없으시도록 미리 확인 부탁드립니다.': 'System access and features will be unavailable during maintenance. Please prepare accordingly.',
        'PMS 로그인 불가, 예약 연동 지연, 체크인/아웃 처리 불가': 'PMS login unavailable, reservation sync delays, check-in/out unavailable',
        '전체 글로벌 통합 시스템': 'All global integrated systems',
        '업데이트': 'Update',
        '한국어 (KO)': 'Korean (KO)',
        '개': 'items',
        '방금 전': 'Just now',
        '편집': 'Edit',
        '10분 전': '10 min ago',
        '2시간 전': '2 hours ago',
        '30분 전': '30 min ago',
        '김지연': 'Kim Ji-yeon',
        '김철수': 'Kim Chul-soo',
        '[TK-10023] 결제 모듈 연동 에러': '[TK-10023] Payment Module Integration Error',
        '[TK-10020] 일간 리포트 다운로드 버그': '[TK-10020] Daily Report Download Bug',
        '결제 모듈 연동 에러': 'Payment Module Integration Error',
        '플랫폼 관리자 (Support Team)': 'Platform Admin (Support Team)',
        '안녕하세요. 오늘 예약 결제창에서 PG사 연동 오류(Error 502)가 발생했습니다. 확인 부탁드립니다.': 'Hello. A PG integration error (Error 502) occurred in today’s reservation payment window. Please check it.',
        'Guest님 이용에 불편을 드려 죄송합니다. 현재 결제 대행사(PG) 측의 일시적인 네트워크 지연이 발생한 것으로 파악되었습니다. 오후 3시 경 복구될 예정이며, 처리 후 다시 안내해드리겠습니다.': 'We apologize for the inconvenience. A temporary network delay was detected at the payment gateway and is expected to recover around 3 PM. We will update you after processing.',
        'Last Stay일': 'Last Stay Date',
        '누적 금액': 'Cumulative Spend',
        '노쇼 / Cancel': 'No-show / Cancel',
        '기본 인적 사항': 'Basic Profile',
        '이름 (이름)': 'First Name',
        '성 (성)': 'Last Name',
        'VIP Tier 지정': 'Set VIP Tier',
        '특이사항 / 선호도': 'Notes / Preferences',
        '상세 투숙 이력': 'Stay History',
        '투숙 일자': 'Stay Date',
        'Room 타입': 'Room Type',
        '결제 금액': 'Payment Amount',
        '표시할 항목이 없습니다.': 'No items to display.',
        '현재 조건에 맞는 데이터가 없습니다.': 'No data matches the current conditions.',
        '처리': 'Action',
        '누적 매출 기준 도달': 'Cumulative revenue threshold reached',
        '건': 'items',
        '변동 Type 선택': 'Select Change Type',
        'Upgrade + Downgrade 모두 표시': 'Show both upgrades and downgrades',
        'Tier이 올라간 변동만': 'Only tier upgrades',
        'Tier이 내려간 변동만': 'Only tier downgrades',
        '정산': 'Settlement',
        '예약/배정': 'Reservation / Assignment',
        '등록/PAX': 'Registered / PAX',
        '계약 활성': 'Contract Active',
        '객실 15% 할인': '15% room discount',
        '진행 0 · 예정 0': 'Active 0 · Upcoming 0',
        '지난 행사 0': 'Past events 0',
        '행사 생성': 'Create Event',
        '하나투어': 'Hana Tour',
        '여행사 · COMP-1002': 'Travel Agency · COMP-1002',
        '담당: 박서준': 'Manager: Park Seo-jun',
        '객실 12% 할인': '12% room discount',
        '단체 후불': 'Group billing',
        '롯데푸드': 'Lotte Food',
        '롯데푸드 목요일 임원 방문': 'Lotte Food Thursday Executive Visit',
        'Nguyen 가족 모임': 'Nguyen Family Gathering',
        '단체 객실 4실 후불 정산': 'Group room settlement for 4 rooms',
        '통합 POS 단체 조식/커피 쿠폰': 'Group breakfast/coffee POS coupons',
        '골프장 단체 그린피 / 2팀': 'Group golf green fee / 2 teams',
        '단체 공항 샌딩 렌터카 2대': 'Group airport drop-off / 2 rent-a-cars',
        '객실, 통합 POS, 골프장, 렌터카 항목을 한 단체 정산 상세에서 확인할 수 있도록 시연 데이터를 구성했습니다.': 'Demo data was configured so room, POS, golf, and rent-a-car items can be reviewed in one group settlement detail.',
        '정산 상세에서 객실, 통합 POS, 골프장, 렌터카 항목을 함께 확인하는 단체 시연 케이스입니다.': 'Group demo case for reviewing room, POS, golf, and rent-a-car items together in settlement detail.',
        '단체 일괄 후불 정산': 'Group postpaid batch settlement',
        '셰프 테이스팅 메뉴 2인': 'Chef tasting menu for 2',
        '공항 샌딩 / 밴': 'Airport drop-off / Van',
        '아이오닉 6 / 2일': 'IONIQ 6 / 2 days',
        '시내 투어 / 4시간': 'City tour / 4 hours',
        '18홀 그린피 / 2인': '18-hole green fee / 2 players',
        '18홀 그린피 / 4인': '18-hole green fee / 4 players',
        '카니발 / 1일': 'Carnival / 1 day',
        '주변 음식점 할인 이벤트': 'Nearby Restaurant Discount',
        '월컴 디저트 할인 이벤트': 'Welcome Dessert Discount',
        '웰컴 디저트 할인 이벤트': 'Welcome Dessert Discount',
        '패밀리 디너 할인 이벤트': 'Family Dinner Discount',
        '호텔 제휴 할인 이벤트': 'Hotel Partner Discount Events',
        '투숙객 전용 레스토랑 20% 할인': '20% restaurant discount for guests',
        '체크인 쿠폰': 'Check-in coupon',
        '일반 기업 · COMP-1003': 'Corporate · COMP-1003',
        '담당: 이현우': 'Manager: Lee Hyun-woo',
        '객실 10% 할인': '10% room discount',
        '법인카드': 'Corporate card',
        'Late checkout 선호': 'Prefers late checkout',
        '견과류 알러지, 저자극 베개 요청': 'Nut allergy, hypoallergenic pillow requested',
        '투숙객 미등록': 'Guest not registered',
        '중 1–10 표시': 'Showing 1-10',
        '(예상 수수료)': '(Estimated commission)',
        '등록일': 'Created Date',
        '에어컨/냉난방': 'A/C and HVAC',
        '온도 조절기 작동 불량 — 객실 좌측 벽면 조절 패널에서 반응 없음': 'Thermostat malfunction - no response from the left wall control panel',
        '긴급': 'Urgent',
        '최동훈': 'Choi Dong-hoon',
        '착수': 'Started',
        '배관/수도': 'Plumbing',
        '세면대 배수구 막힘 — 물이 빠지지 않음': 'Sink drain clogged - water does not drain',
        '박미래': 'Park Mirae',
        '전기/조명': 'Electrical / Lighting',
        '거실 메인 조명 깜빡임 현상 반복': 'Living room main light flickers repeatedly',
        '높음': 'High',
        '이영호': 'Lee Young-ho',
        '가구/비품': 'Furniture / Fixtures',
        '옷장 우측 문 경첩 파손 — 닫히지 않음': 'Right wardrobe door hinge broken - does not close',
        '일반': 'Normal',
        '도어/잠금장치': 'Door / Lock',
        '객실 메인 도어 카드키 인식 오류 — 반복적으로 3~4 visits 시도 필요': 'Main room door keycard recognition error - requires 3-4 repeated attempts',
        '욕조 수전 온수 나오지 않음': 'No hot water from bathtub faucet',
        '화장실 환풍기 소음 발생': 'Bathroom ventilation fan noise',
        '냉방 작동 시 이상 소음 및 진동': 'Abnormal noise and vibration during cooling',
        '침대 프레임 삐걱거림': 'Bed frame squeaks',
        '발코니 슬라이딩 도어 레일 걸림': 'Balcony sliding door rail stuck',
        '콘센트 2구 작동 불량 (침대 좌측)': 'Two outlets not working (left side of bed)',
        '실외기 이상 소음 — 인접 객실 민원 발생': 'Outdoor unit abnormal noise - complaints from adjacent rooms',
        '1. 마감 전 필수 체크 (Pre-Close Checklist)': '1. Pre-Close Checklist',
        '미처리 항목이 있을 경우 정상적인 마감 및 롤오버가 제한될 수 있습니다.': 'Unresolved items may prevent normal closing and rollover.',
        '퇴실 예정이나 아직 시스템에서 체크아웃 처리되지 않은 객실입니다.': 'Rooms scheduled to depart but not yet checked out in the system.',
        '2 items 남음': '2 items remaining',
        '마감 실행 시 자동으로': 'When closing runs, they will automatically be',
        '처리되어 수수료가 청구됩니다.': 'processed and charged.',
        '3 items 미도착': '3 arrivals pending',
        '미결제 오더 (POS)': 'Unpaid Orders (POS)',
        '객실(Folio) 청구 전이거나 제공 완료되지 않은 룸서비스/부대시설 주문.': 'Room service or ancillary orders not yet charged to folio or not completed.',
        '3 items 남음': '3 items remaining',
        '2. 금일 정산액 검증 (Revenue Verification)': '2. Revenue Verification',
        '객실 이용 요금 (Tax 포함)': 'Room charges (tax included)',
        '상세보기': 'View Details',
        '식음료 / 룸서비스 (F&B / Room Service)': 'F&B / Room Service',
        'POS 통합 오더 데이터 기준': 'Based on unified POS order data',
        '골프장 (Golf)': 'Golf',
        '그린피, 카트 이용료 기준': 'Based on green fees and cart charges',
        '렌트카 (Rent-a-car)': 'Rent-a-car',
        '차량 렌탈 이용료 기준': 'Based on car rental charges',
        '일일 총 영업 이익 (Total Revenue)': 'Daily Total Revenue',
        '위 정산 내역을 확인하였으며,': 'I have reviewed the settlement details above and',
        '영업일을 마감합니다.': 'will close the business day.',
        '일일 영업 마감 실행': 'Run Daily Close',
        '시그니처 버거, 트러플 감자튀김': 'Signature burger, truffle fries',
        '서빙 Completed': 'Serving Completed',
        '클럽 샌드위치, 감자튀김, 콜라': 'Club sandwich, fries, cola',
        '마가리타 피자, 콜라 2잔': 'Margherita pizza, 2 colas',
        'Completed됨': 'Completed',
        'Maria G - 조식 뷔페 2인': 'Maria G - Breakfast buffet for 2',
        'John D - 에비앙 2, 맥주 1': 'John D - Evian x2, beer x1',
        '처리 완료': 'Completed',
        'Kim H - 아로마 마사지 90분 2인': 'Kim H - 90-min aroma massage for 2',
        '접수: 14:02': 'Received: 14:02',
        '접수: 13:50': 'Received: 13:50',
        '접수: 13:15': 'Received: 13:15',
        '접수: 12:40': 'Received: 12:40',
        '접수: 11:30': 'Received: 11:30',
        '접수: 10:05': 'Received: 10:05',
        '접수: 10:30': 'Received: 10:30',
        '접수: 08:30': 'Received: 08:30',
        '접수: 09:15': 'Received: 09:15',
        '접수: 11:00': 'Received: 11:00',
        'May 2026 청구서 결제가 연체되었습니다.': 'The May 2026 invoice is overdue.',
        'May 2026 25일까지': 'By May 25, 2026',
        '다음 청구일: 2026-06-01': 'Next billing date: 2026-06-01',
        'Room 및 예약 무제한 등록': 'Unlimited rooms and reservations',
        '프리미엄 광고 네트워크 노출 가중치': 'Premium ad network exposure weighting',
        '통합 정산 및 결제 대행 수수료 할인': 'Unified billing and payment processing fee discount',
        '24시간 우선 기술 지원': '24-hour priority technical support',
        '청구 및 결제 이력': 'Billing and Payment History',
        '총 합계 다운로드': 'Download Total Summary',
        '청구일': 'Billing Date',
        '청구 번호': 'Invoice No.',
        '금액 (USD)': 'Amount (USD)',
        '결제 상태': 'Payment Status',
        '결제일 / 기한': 'Paid / Due Date',
        '미납 (Overdue)': 'Overdue',
        '2026-05-15 (기한 경과)': '2026-05-15 (Past due)',
        '결제하기': 'Pay Now',
        '영수증': 'Receipt',
        '등록된 결제 수단': 'Saved Payment Methods',
        '카드 추가': 'Add Card',
        '만료: 12/28': 'Expires: 12/28',
        '기본 결제수단': 'Default Payment Method',
        'May 25, 2026 (Mon) 02:00 ~ 06:00 (UTC 기준)': 'May 25, 2026 (Mon) 02:00-06:00 UTC',
        'Premium 플랜 신규 기능 업데이트 안내 (v2.4)': 'Premium Plan Feature Update Notice (v2.4)',
        '정책 변경': 'Policy Change',
        '베트남 지역 대상 전자세금계산서 연동 가이드 변경 안내': 'Vietnam E-tax Invoice Integration Guide Update',
        '회': 'visits',
        '명 표시': 'guests shown',
        '플랜 변경': 'Change Plan'
    };
}

function translateKoreanPattern(text) {
    const dayMap = { '일': 'Sun', '월': 'Mon', '화': 'Tue', '수': 'Wed', '목': 'Thu', '금': 'Fri', '토': 'Sat' };
    const monthMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let out = text;

    out = out.replace(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*([일월화수목금토])\s*(오전|오후)\s*(\d{1,2}):(\d{2})/g,
        (_, y, m, d, day, ampm, hh, mm) => `${dayMap[day]}, ${monthMap[Number(m) - 1]} ${Number(d)}, ${y} ${hh}:${mm} ${ampm === '오전' ? 'AM' : 'PM'}`);
    out = out.replace(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*\(([일월화수목금토])\)/g,
        (_, y, m, d, day) => `${monthMap[Number(m) - 1]} ${Number(d)}, ${y} (${dayMap[day]})`);
    out = out.replace(/(\d{4})년\s*(\d{1,2})월/g, (_, y, m) => `${monthMap[Number(m) - 1]} ${y}`);
    out = out.replace(/(\d{1,2})월/g, (_, m) => monthMap[Number(m) - 1] || `${m} mo`);
    out = out.replace(/(\d{1,2})\/(\d{1,2})\s*\(([일월화수목금토])\)/g, (_, m, d, day) => `${m}/${d} (${dayMap[day]})`);
    out = out.replace(/(\d{3,4})호/g, 'Room $1');
    out = out.replace(/([A-Z]{1,3}-?\d{1,2})호/g, 'Room $1');
    out = out.replace(/(\d+)층/g, 'Floor $1');
    out = out.replace(/(\d+)회/g, '$1 visits');
    out = out.replace(/(\d+)박/g, '$1N');
    out = out.replace(/(\d+)건/g, '$1 items');
    out = out.replace(/(\d+)개 권한/g, '$1 permissions');
    out = out.replace(/(\d+)개 객실/g, '$1 rooms');
    out = out.replace(/(\d+)개/g, '$1 items');
    out = out.replace(/(\d+)실/g, '$1 rooms');
    out = out.replace(/\/\s*월/g, '/ mo');
    const phraseMap = {
        '예약, 체크인, 고객 응대 전 확인이 필요한 투숙객이면 사유와 함께 등록합니다.': 'Register guests who require review before reservation, check-in, or service handling, with a reason.',
        '예약 등록·수정·취소, 객실 이동, 요금/예치금 정정, 개인정보 열람과 엑셀 반출 이력을 함께 확인합니다. 민감한 연락처 값은 저장하지 않고 대상과 변경 항목만 기록합니다.': 'Review reservation creation, edits, cancellations, room moves, rate/deposit corrections, personal-info access, and Excel exports together. Sensitive contact values are not stored; only target and changed fields are logged.',
        '투숙객 교통비 지원 현금 전달. 통화별 봉투 번호와 영수증을 인수인계 메모에 기록.': 'Guest transport cash support handed over. Record envelope numbers and receipts by currency in the handover memo.',
        '투숙객 교통비 현금 지원. 인수인계 메모와 영수증 봉투 확인.': 'Guest transport cash support. Check the handover memo and receipt envelope.',
        '거실 메인 조명 스위치 반응 없음, 투숙객 재실 중 긴급 점검 요청': 'Living room main light switch unresponsive; urgent inspection requested while guest is occupied',
        '투숙객 엑셀 다운로드': 'Guest Excel Download',
        '투숙객 상세 열람': 'Guest Detail Viewed',
        '투숙객 명단 변경': 'Guest List Changed',
        '동반 투숙객': 'Companion Guest',
        '투숙객명': 'Guest Name',
        '투숙객': 'Guest',
        '재실 중': 'Occupied',
        '현금': 'Cash',
        '메모': 'Memo',
        '정산 현황': 'Settlement Status',
        '금일': 'Today',
        '기간 선택': 'Select Period',
        '전일 대비': 'vs Previous Day',
        '개인': 'Individual',
        '단체': 'Group',
        '정산 번호': 'Folio No.',
        '예약 예정': 'Reserved',
        '예약 없음': 'No Reservation',
        '입실': 'Check-in',
        '퇴실': 'Check-out',
        '레이트': 'Late',
        '체크인 가능': 'Check-in Available',
        '이동': 'Move',
        '엑셀 다운로드': 'Download Excel',
        '객실 / 예약번호': 'Room / Reservation No.',
        '고객 / 주의사항': 'Guest / Notes',
        '예치금': 'Deposit',
        '잔액': 'Balance',
        '투숙객 미배정': 'Guest Unassigned',
        '단체업체 관리': 'Group Company Management',
        '행사 / 단체': 'Event / Group',
        '기업 행사 / 컨퍼런스': 'Corporate Event / Conference',
        '등록/총 인원': 'Registered / Total Pax',
        '일반인 대표 단체': 'Private Representative Group',
        '일반인 단체': 'Private Group',
        '여행사 단체': 'Travel Agency Group',
        '단체 일괄 정산': 'Group Batch Settlement',
        '담당:': 'Manager:',
        '예약/객실': 'Reservation / Room',
        '승인/주의': 'Approval / Attention',
        '부가서비스 등록': 'Ancillary Registration',
        '업체/항목 관리': 'Vendor / Item Management',
        '통합 POS': 'Unified POS',
        '부가서비스 화면': 'Ancillary Page',
        '업체 등록': 'Register Vendor',
        '업체 목록': 'Vendor List',
        '호텔 통합 POS': 'Hotel Unified POS',
        '투숙 객실': 'In-house Rooms',
        '누적 이용금액': 'Total Usage Amount',
        '부가서비스 등록 가능': 'Ancillary Registration Available',
        '합산': 'Total',
        '일일 마감으로 이동': 'Go to Daily Close',
        '마감 완료': 'Closing Completed',
        '마감 상태': 'Closing Status',
        '마감 정산액': 'Closing Settlement Amount',
        '정산 인입 구분': 'Settlement Inflow Type',
        '시재 반영은 현금만': 'Only cash is reflected in cash count',
        '투숙객이 바로 사용할 수 있는 제휴 혜택': 'Partner benefits available to in-house guests',
        '주변 음식점, 렌터카, 골프장 할인 이벤트를 한 곳에서 확인하고 관련 예약 화면으로 이동합니다.': 'View nearby restaurant, rent-a-car, and golf discounts in one place and open the related booking page.',
        '대시보드로': 'Back to Dashboard',
        '주변 맛집': 'Nearby Restaurant',
        '당일 사용': 'Same-day Use',
        '카페 제휴': 'Cafe Partner',
        '웰컴 디저트 세트 할인': 'Welcome Dessert Set Discount',
        '객실번호 인증': 'Room Number Verification',
        '금일 라운딩 완료': 'Today Completed Rounds',
        '금일 대여 중/완료': 'Today In-use / Completed',
        '미완료': 'Incomplete',
        '예약 대기': 'Reservation Pending',
        '진행 예정': 'Scheduled',
        '반납 완료': 'Returned',
        '처리 일시': 'Processed At',
        '객실 점검': 'Room Inspection',
        '시설팀': 'Facilities Team',
        '발행': 'Issued',
        '시작': 'Start',
        '완료 확인': 'Confirm Completion',
        '현금': 'Cash',
        '카드': 'Card',
        '계좌이체': 'Bank Transfer',
        '이체': 'Transfer',
        '포스 / 식음료 및 리테일': 'POS / F&B and Retail',
        '아메리카노': 'Americano',
        '조식 뷔페': 'Breakfast Buffet',
        '미니바 스낵': 'Minibar Snack',
        '결제 및 청구': 'Payment and Charge',
        '객실 번호': 'Room No.',
        '객실 청구 시 필수': 'Required for room charge',
        '기준:': 'Base:',
        '예상 매출': 'Expected Revenue',
        '수기 오더': 'Manual Order',
        '접수:': 'Received:',
        '완료됨': 'Completed',
        '처리 중': 'In Progress',
        '누적 매출': 'Cumulative Revenue',
        '표시 오더': 'Displayed Orders',
        '표시 금액': 'Displayed Amount',
        '운영 감사 로그': 'Operation Audit Log',
        '새로고침': 'Refresh',
        '전체 로그': 'All Logs',
        '예약 변경': 'Reservation Changes',
        '개인정보 열람': 'Privacy Access',
        '다운로드': 'Download',
        '로그 목록': 'Log List',
        '미납 요금 결제하기': 'Pay Outstanding Balance',
        '금액': 'Amount',
        '미납': 'Outstanding',
        '설정에서 관리': 'Manage in Settings',
        '플랫폼 관리자': 'Platform Admin',
        '우수 고객': 'Preferred Guest',
        '신규 우수 고객': 'New Preferred Guests',
        '다이아몬드': 'Diamond',
        '플래티넘': 'Platinum',
        '골드': 'Gold',
        '블랙리스트': 'Blacklist',
        '등급 필터 선택': 'Select Tier Filter',
        '모든 등급 고객 표시': 'Show All Guest Tiers',
        '최상위 등급 고객': 'Top-tier Guests',
        '상위 등급 고객': 'Upper-tier Guests',
        '우수 등급 고객': 'Preferred-tier Guests',
        '주의 사유가 등록된 투숙객': 'Guests with a registered caution reason',
        '등급별 회원 현황 및 기준': 'Tier Status and Criteria',
        '현재 고객 등급 분포, 승급 기준, 최근 등급 변동 이력을 함께 확인합니다.': 'Review guest tier distribution, upgrade criteria, and recent tier changes together.',
        '승급 기준 관리': 'Upgrade Criteria Management',
        '등급 기준 요약': 'Tier Criteria Summary',
        '이전 등급': 'Previous Tier',
        '변경 등급': 'New Tier',
        '수동 변경': 'Manual Change',
        '모든 등급 변동': 'All Tier Changes',
        '등급이 올라간 변동만': 'Upgrades Only',
        '누적 투숙': 'Cumulative Stays',
        '달성': 'Reached',
        '중복 VIP 프로필 병합 후 등급 정정': 'Tier corrected after merging duplicate VIP profiles',
        '법인 장기투숙 실적 수동 반영': 'Corporate long-stay performance applied manually',
        '확인 필요': 'Needs Review',
        '청소 필요': 'Needs Cleaning',
        '청소 완료': 'Clean',
        '방해금지': 'Do Not Disturb',
        '청소 중': 'Cleaning',
        '예약': 'Reservation',
        '객실': 'Room',
        '체크인 예정': 'Check-in Due',
        '체크아웃 예정': 'Check-out Due',
        '투숙 중': 'In-house',
        '공실': 'Vacant',
        '점검 중': 'Out of Order',
        '예약현황에서 빈방 청소 필요 처리': 'Vacant room marked as needs cleaning from reservation board',
        '예약현황에서 빈방 청소 완료 처리': 'Vacant room marked clean from reservation board',
        '수납': 'Payment',
        '정산 완료': 'Settlement Complete',
        '수납/정산 필요': 'Payment / Settlement Needed',
        '이전 미수금': 'Previous Outstanding',
        '완료됨': 'Completed',
        '환불': 'Refund',
        '환불 확인': 'Refund Review',
        '전체 유형': 'All Types',
        '대상 / FOLIO': 'Target / Folio',
        '마감 처리 내역': 'Closing Activity',
        '선택한 영업일의 시작 시재, 현금입금, 중간출금, 마감 실사를 시간순으로 확인합니다.': 'Review opening cash, cash receipts, mid-shift withdrawals, and closing count for the selected business day in chronological order.',
        '차액 확인': 'Variance Review',
        '검토 필요': 'Needs Review',
        '종 통화 확인 필요': 'currencies need review',
        '정산': 'Settlement',
        '예치': 'Deposit',
        '현금입금 기록': 'Cash Receipt Records',
        '시작 시재': 'Opening Cash',
        '중간출금': 'Mid-shift Withdrawal',
        '마감 실사': 'Closing Count',
        '항목': 'Item',
        '항목수': 'Item Count',
        '서비스 구분': 'Service Type',
        '골프장': 'Golf',
        '렌터카': 'Rent-a-car',
        '전기차': 'EV',
        '밴/승합': 'Van',
        '세단': 'Sedan',
        '배차 진행중': 'Dispatching',
        '대여 완료': 'Rental Complete',
        '정산됨': 'Settled',
        '완료 처리': 'Mark Complete',
        '라운딩 완료': 'Round Complete',
        '카트 이용권': 'Cart Pass',
        '클럽 대여': 'Club Rental',
        '준비 중': 'Preparing',
        '객실 이동': 'Room Move',
        '금일 체크인': 'Today Check-ins',
        '금일 체크아웃': 'Today Check-outs',
        '숙박': 'Stay',
        '상태': 'Status',
        '관리': 'Actions',
        '일시': 'Date/Time',
        '화면': 'Screen',
        '동작': 'Action',
        '대상': 'Target',
        '관련 항목': 'Related Fields',
        '세부 정보': 'Details',
        '문의번호': 'Ticket No.',
        '유형': 'Type',
        '작성일': 'Created At',
        '고객님 이용에 불편을 드려 죄송합니다.': 'We apologize for the inconvenience.',
        '안녕하세요.': 'Hello.'
    };
    Object.entries(phraseMap).sort((a, b) => b[0].length - a[0].length).forEach(([ko, en]) => {
        out = out.replaceAll(ko, en);
    });
    const cleanupMap = {
        'Group업체 Actions': 'Group Company Management',
        'Group업체 관리': 'Group Company Management',
        'Group 일괄 Settlement': 'Group Batch Settlement',
        '행사 / Group': 'Event / Group',
        '일반인 대표 Group': 'Private Representative Group',
        '일반인 Group': 'Private Group',
        '여행사 Group': 'Travel Agency Group',
        'Ancillary Registration 가능': 'Ancillary Registration Available',
        '클릭하여 상세 보기': 'Click to View Details',
        '일일 마감으로 Move': 'Go to Daily Close',
        'Cash입금 기록': 'Cash Receipt Records',
        'Start 시재': 'Opening Cash',
        'Cash입금': 'Cash Receipt',
        '장부 반영액': 'Ledger Amount',
        '실제 통화': 'Actual Currency',
        '메모': 'Memo',
        '선택한 영업일의 Start 시재, Cash입금, Mid-shift Withdrawal, Closing Count를 시간순으로 확인합니다.': 'Review opening cash, cash receipts, mid-shift withdrawals, and closing count for the selected business day in chronological order.',
        '주변 음식점, Rent-a-car, Golf 할인 이벤트를 한 곳에서 확인하고 관련 Reservation Screen으로 Move합니다.': 'View nearby restaurant, rent-a-car, and golf discount events in one place and open the related reservation page.',
        'Rent-a-car 할인 이벤트': 'Rent-a-car Discount Event',
        '공항 픽업': 'Airport Pickup',
        '공항 픽업 Rent-a-car 주말 특가': 'Airport Pickup Rent-a-car Weekend Special',
        '커피 세트 혜택': 'Coffee Set Benefit',
        '패밀리 디너 세트 할인': 'Family Dinner Set Discount',
        '호텔 키 인증': 'Hotel Key Verification',
        '세트 메뉴 할인': 'Set Menu Discount',
        'Today 대여 중/완료': 'Today In-use / Completed',
        'Settlement됨': 'Settled',
        'Cart Pass / 1팀': 'Cart Pass / 1 Team',
        '스카이72': 'Sky72',
        '럭셔리': 'Luxury',
        '아반떼': 'Avante',
        '쏘렌토': 'Sorento',
        '제네시스 G80': 'Genesis G80',
        '일반 등급 고객': 'Standard-tier Guests',
        '노쇼 / 취소': 'No-show / Cancel',
        'Preferred Guest 등급 지정': 'Preferred Guest Tier',
        'Reservation, 체크인, 고객 응대 전 확인이 필요한 투숙객이면 사유와 함께 등록합니다.': 'Register guests who require review before reservation, check-in, or service handling, with a reason.',
        '등록': 'Register',
        '투숙': 'Stays',
        '이상 또는 누적 결제': 'or cumulative payment over',
        '이상': 'or more',
        '또는': 'or',
        '둘 중 하나 충족': 'Meets Either Condition',
        '횟수 또는 누적 결제 Amount 중 하나를 충족하면 해당 등급 기준을 만족합니다.': 'The tier is satisfied when either stay count or cumulative payment amount meets the criterion.',
        '최상위 등급으로 특별 Actions Target 고객입니다.': 'Top-tier guests requiring special handling.',
        '신규 Preferred Guest': 'New Preferred Guests',
        'Actions자가 사유를 남긴 변경만': 'Only changes with staff-entered reasons',
        '2 items Folio 묶음': '2 Folios Bundled',
        '총 14 items · 1-14 표시': 'Total 14 items · Showing 1-14',
        '건 / Incomplete': 'items / Incomplete',
        'Reservation 등록·수정·취소, Room Move, 요금/Deposit 정정, Individual정보 열람과 엑셀 반출 이력을 함께 확인합니다. 민감한 연락처 값은 저장하지 않고 Target과 변경 Item만 기록합니다.': 'Review reservation creation, edits, cancellations, room moves, rate/deposit corrections, personal-info access, and Excel exports together. Sensitive contact values are not stored; only target and changed fields are logged.',
        'Individual정보 열람': 'Personal Info Access',
        '관련 Item': 'Related Fields',
        '투숙일': 'Stay Dates',
        'Reservation 정보 변경': 'Reservation Info Change',
        '운영 메모': 'Operation Memo',
        'Ticket No.: TK-10023 | Type: 요금/결제 | Created At: 2026-05-20 | Status:': 'Ticket No.: TK-10023 | Type: Rates / Payment | Created At: 2026-05-20 | Status:',
        'Hello. 오늘 Reservation 결제창에서 결제 대행사 연동 오류가 발생했습니다. 확인 부탁드립니다.': 'Hello. A payment gateway integration error occurred on today\'s reservation payment screen. Please check.',
        'We apologize for the inconvenience. 현재 결제 대행사 측의 Date/Time적인 네트워크 지연이 발생한 것으로 파악되었습니다. 오후 3시 경 복구될 예정이며, 처리 후 다시 안내해드리겠습니다.': 'We apologize for the inconvenience. We identified a temporary network delay at the payment gateway. It is expected to recover around 3 PM, and we will update you after processing.'
    };
    Object.assign(cleanupMap, {
        '투숙객': 'Guest',
        'Stays일': 'Stay Dates',
        'Room요금': 'Room Rate',
        'Refund금': 'Refund Amount',
        'Opening Cash 인수': 'Opening Cash Handover',
        '프런트 보유 통화': 'Front Desk Cash on Hand',
        '프런트 Opening Cash 인수': 'Front Desk Opening Cash Handover',
        '체크아웃 Room Settlement': 'Checkout Room Settlement',
        'Unified POS 미니바 Settlement': 'Unified POS Minibar Settlement',
        'Golf 그린피 Cash Settlement': 'Golf Green Fee Cash Settlement',
        'Group Rent-a-car 및 골프 패키지 Cash Payment': 'Group Rent-a-car and Golf Package Cash Payment',
        '페소': 'Peso',
        '달러': 'Dollar',
        '원화': 'Won',
        '통화별 봉투 번호와 영수증을 인수인계 Memo에 기록.': 'Record envelope numbers and receipts by currency in the handover memo.',
        'GM 승인 후 긴급 Refund금 전달. 페소, 달러, 원화 출금 증빙을 마감 Memo에서 재확인.': 'Emergency refund handed over after GM approval. Recheck peso, dollar, and won withdrawal evidence in the closing memo.',
        '투숙객 교통비 지원 현금 전달. 통화별 봉투 번호와 영수증을 인수인계 메모에 기록.': 'Guest transport cash support handed over. Record envelope numbers and receipts by currency in the handover memo.',
        'Stays 횟수 or 누적 결제 Amount 중 하나를 충족하면 해당 등급 기준을 만족합니다.': 'The tier criterion is satisfied when either stay count or cumulative payment amount is met.',
        '누적 결제 ₱10,000 or more': 'Cumulative payment ₱10,000 or more',
        '누적 결제 ₱5,000 or more': 'Cumulative payment ₱5,000 or more',
        '누적 결제 ₱2,000 or more': 'Cumulative payment ₱2,000 or more',
        '장기 Stays 및 높은 결제 실적을 가진 핵심 고객입니다.': 'Core guests with long stays and high payment performance.',
        '반복 Stays or 일정 결제액을 충족한 Preferred Guest입니다.': 'Preferred guests who meet repeat stay or payment amount criteria.',
        '가입 즉시 적용되는 기본 등급입니다.': 'Default tier applied immediately upon registration.',
        '가입 즉시 기본 등급': 'Default tier upon registration',
        '승급 및 수동 조정 내역을 최근순으로 표시합니다.': 'Shows upgrades and manual adjustments in newest-first order.',
        '전체 보기': 'View All',
        'Group/행사를 찾을 수 없습니다.': 'Group/event not found.',
        '호텔 Unified POS': 'Hotel Unified POS',
        '담당 F&B / Front Desk': 'Assigned F&B / Front Desk',
        '수수료 0%': 'Commission 0%',
        '수수료 8%': 'Commission 8%',
        'The Grand Saigon 내부 POS': 'The Grand Saigon Internal POS',
        '리버사이드 비스트로': 'Riverside Bistro',
        '담당 Minh Nguyen / +84 90 118 2233': 'Contact Minh Nguyen / +84 90 118 2233',
        '업체별 Item / 바우처 양식': 'Vendor Items / Voucher Template',
        '호텔 Unified POS · Item 4 items · 출력 6 items 필드': 'Hotel Unified POS · 4 items · 6 print fields',
        'Item 추가': 'Add Item',
        'Airport Pickup Rent-a-car 주말 특가': 'Airport Pickup Rent-a-car Weekend Special',
        '금-일': 'Fri-Sun',
        '사전 Reservation 할인': 'Advance Reservation Discount',
        '장기 Stays Rent-a-car 보험료 지원': 'Long-stay Rent-a-car Insurance Support',
        '보험료 혜택': 'Insurance Benefit',
        '로컬 투어': 'Local Tour',
        '시내 투어 차량 할인 이벤트': 'City Tour Vehicle Discount Event',
        '반나절 이용': 'Half-day Use',
        '기사 포함 특가': 'Driver-included Special',
        '18 holes / 4 pax + 카트': '18 holes / 4 pax + Cart',
        '점검': 'Inspection',
        '재실 중': 'Occupied',
        'Samsung Tech Conference 2026 Settlement 검증': 'Samsung Tech Conference 2026 Settlement Validation',
        'Reservation Register·수정·취소, Room Move, 요금/Deposit 정정, Personal Info Access과 엑셀 반출 이력을 함께 확인합니다. 민감한 연락처 값은 저장하지 않고 Target과 변경 Item만 기록합니다.': 'Review reservation creation, edits, cancellations, room moves, rate/deposit corrections, personal-info access, and Excel exports together. Sensitive contact values are not stored; only target and changed fields are logged.',
        '운영 Memo': 'Operation Memo',
        '총괄 매니저': 'General Manager',
        'Reservation 취소': 'Reservation Cancelled',
        '투숙객 명단 변경': 'Guest List Changed',
        '동반 투숙객': 'Companion Guest',
        '체크인 후 Room요금 정정': 'Room Rate Corrected After Check-in',
        'May 2026 25 day까지': 'Through May 25, 2026',
        '[TK-10018] 직원 권한 변경 문의': '[TK-10018] Staff Permission Change Inquiry',
        '풀빌라 BBQ 세트': 'Pool Villa BBQ Set',
        '아로마 마사지': 'Aroma Massage',
        '탄산수': 'Sparkling Water',
        '클럽 샌드위치': 'Club Sandwich',
        '에비앙': 'Evian',
        '프리미엄 맥주': 'Premium Beer',
        '초콜릿': 'Chocolate',
        '카푸치노': 'Cappuccino',
        '해산물 파스타': 'Seafood Pasta',
        '화이트 와인': 'White Wine',
        '샴페인': 'Champagne',
        '치즈 플래터': 'Cheese Platter',
        '레드와인 하프 보틀': 'Red Wine Half Bottle',
        '캐슈넛': 'Cashews',
        '시그니처 버거': 'Signature Burger',
        '트러플 감자튀김': 'Truffle Fries',
        '콜라': 'Cola',
        '셔츠 드라이클리닝': 'Shirt Dry Cleaning',
        '정장 프레스': 'Suit Press',
        '호텔 시그니처 디퓨저': 'Hotel Signature Diffuser',
        '로브': 'Robe',
        '셰프 테이스팅 메뉴': 'Chef Tasting Menu',
        '서빙 완료': 'Served',
        'Hotel Unified POS · Item 4 items · 출력 6 items 필드': 'Hotel Unified POS · 4 items · 6 print fields',
        '업체명': 'Vendor Name',
        '담당/연락처': 'Manager / Contact',
        '수수료율': 'Commission Rate',
        'Item 수': 'Item Count',
        '업체 주소': 'Vendor Address',
        '이용 Item': 'Service Items',
        '룸서비스 세트': 'Room Service Set',
        'Room 주문': 'Room Order',
        '미니바 추가': 'Minibar Add-on',
        'Room 미니바': 'Room Minibar',
        '영상 서비스': 'Streaming Service',
        '출력': 'Print',
        '필드': 'Fields',
        'Rent-a-car 이용료 Cash Settlement': 'Rent-a-car Fee Cash Settlement',
        '출금 처리': 'Withdrawal Processed',
        'GM 승인 후 긴급 Refund Amount 전달. 마감 Memo에서 재확인.': 'Emergency refund amount handed over after GM approval. Recheck it in the closing memo.',
        'Deposit 입금': 'Deposit Receipt',
        '추가 Stay Deposit Payment': 'Additional Stay Deposit Payment',
        '행사 추가 Deposit Payment': 'Event Additional Deposit Payment',
        'Guest 교통비 Cash 지원. 인수인계 Memo와 영수증 봉투 확인.': 'Guest transport cash support. Check handover memo and receipt envelope.',
        '마감 보유 Cash': 'Closing Cash on Hand',
        '실사 통화': 'Counted Currency',
        'Cash Payment 및 Deposit 반영 후 Closing Count 완료': 'Closing count completed after reflecting cash payments and deposits',
        '장기 Stays': 'Long Stay',
        'Golf 할인 이벤트': 'Golf Discount Event',
        '티타임': 'Tee Time',
        '제휴 Golf 그린피 할인': 'Partner Golf Green Fee Discount',
        '티타임 Reservation': 'Tee Time Reservation',
        '그린피 혜택': 'Green Fee Benefit',
        '조조 라운딩': 'Early Morning Round',
        '평일 오전 라운딩 패키지': 'Weekday Morning Round Package',
        '평일 오전': 'Weekday Morning',
        '카트비 할인': 'Cart Fee Discount',
        '레슨': 'Lesson',
        '골프 레슨 할인 이벤트': 'Golf Lesson Discount Event',
        '쌀국수': 'Pho',
        '망고 주스': 'Mango Juice',
        '생수': 'Bottled Water',
        '수입 맥주': 'Imported Beer',
        '시저 샐러드': 'Caesar Salad',
        '수프': 'Soup',
        '스파클링 워터': 'Sparkling Water',
        'Chocolate 바': 'Chocolate Bar',
        '아메리칸 브렉퍼스트': 'American Breakfast',
        '레드와인': 'Red Wine',
        '마르게리타 피자': 'Margherita Pizza',
        '원피스 드라이클리닝': 'Dress Dry Cleaning',
        '블라우스 세탁': 'Blouse Laundry',
        '풋 마사지': 'Foot Massage',
        '기념품 세트': 'Souvenir Set',
        '엽서': 'Postcard',
        '셔츠 세탁': 'Shirt Laundry',
        '바지 프레스': 'Pants Press',
        '서비스 Item 미입력': 'Service item not entered',
        'Late 요청': 'Late request',
        '체크아웃': 'Check-out',
        '투숙객 명단 변경': 'Guest List Changed',
        '동반 Guest': 'Companion Guest',
        '동반': 'Companion',
        '대표': 'Primary Guest',
        'Guest 상세 열람': 'Guest Detail Viewed',
        'Reservation 고객정보 열람': 'Reservation Guest Info Viewed',
        'Room Stays정보 열람': 'Room Stay Info Viewed',
        'Room Move 이력': 'Room Move History',
        '체크인 후 Room Rate 정정': 'Room Rate Corrected After Check-in',
        '체크인 후 Deposit 정정': 'Deposit Corrected After Check-in',
        '체크인 후 Room Move': 'Room Move After Check-in',
        '휴대폰': 'Mobile Phone',
        '특이사항': 'Notes',
        '고객 ID': 'Guest ID',
        '영상/스트리밍': 'Video / Streaming',
        '세탁 서비스': 'Laundry Service',
        'Room 세탁 접수': 'Room Laundry Request',
        '전표 Print 양식': 'Slip Print Template',
        '체크한 Item은 부가서비스 상세 Screen의 Print 버튼과 오른쪽 미리보기에 그대로 반영됩니다.': 'Checked items are reflected in the print button and right-side preview on the ancillary detail screen.',
        '체크한 Item은 부가서비스 상세 Screen의 Print 버튼과 미리보기 팝업에 그대로 반영됩니다.': 'Checked items are reflected in the print button and preview popup on the ancillary detail screen.',
        '양식 저장': 'Save Template',
        'Print 로고': 'Print Logo',
        '바우처 상단에 표시됩니다.': 'Shown at the top of the voucher.',
        '총 11 items 표시': 'Total 11 items shown',
        '영업일 2026-07-07': 'Business Date 2026-07-07',
        '시재 대조 보기': 'Cash Reconciliation View',
        '전일 마감Cash부터 Start시재, Cash Receipt, Mid-shift Withdrawal, 보유 Cash, 차액 여부를 마감 기준으로 확인합니다.': 'Review previous closing cash, opening cash, cash receipts, mid-shift withdrawals, cash on hand, and variance status by closing standard.',
        '펼치기': 'Expand',
        '선택한 영업일의 Opening Cash, Cash Receipt, Mid-shift Withdrawal, Closing Count를 시간순으로 확인합니다.': 'Review opening cash, cash receipts, mid-shift withdrawals, and closing count for the selected business day in chronological order.',
        '프로 Lesson 특가': 'Pro Lesson Special',
        '골프 Lesson 할인 이벤트': 'Golf Lesson Discount Event',
        'GM 승인 후 긴급 Refund Amount 전달. Peso, Dollar, Won 출금 증빙을 마감 Memo에서 재확인.': 'Emergency refund amount handed over after GM approval. Recheck peso, dollar, and won withdrawal evidence in the closing memo.',
        'Guest 교통비 지원 Cash 전달. Record envelope numbers and receipts by currency in the handover memo.': 'Guest transport cash support handed over. Record envelope numbers and receipts by currency in the handover memo.',
        '프런트 Opening Cash Handover': 'Front Desk Opening Cash Handover',
        '로고 Register': 'Logo Registration',
        '전표 기본 정보': 'Slip Basic Information',
        'Guest명': 'Guest Name',
        'Room번호': 'Room No.',
        '이용Date/Time': 'Usage Date/Time',
        'Print 미리보기': 'Print Preview',
        'Room 전표': 'Room Slip',
        '프런트 확인 후 제공': 'Provide after front desk verification',
        '고객 프로필': 'Guest Profile',
        'Stays 이력': 'Stay History',
        '검색 조건 적용': 'Search conditions applied',
        '· 연 누적 결제 Amount ₱10,000 돌파': '· Annual cumulative payment exceeded ₱10,000',
        '일반 →': 'Standard →'
    });
    Object.assign(cleanupMap, {
        '롯데푸드 · GRP-DEMO-THU-CORP': 'Lotte Food · GRP-DEMO-THU-CORP',
        'GUEST-XLSX · 결과 42 items · Search conditions applied': 'GUEST-XLSX · 42 results · Search conditions applied',
        'RESERVATION-XLSX · 결과 38 items · Search conditions applied': 'RESERVATION-XLSX · 38 results · Search conditions applied',
        '총 20 items 중 1-12 표시': 'Total 20 items · Showing 1-12'
    });
    Object.assign(cleanupMap, {
        'VIP 도착 전 냉방 성능 Inspection 및 필터 교체 필요': 'AC performance inspection and filter replacement required before VIP arrival',
        '욕실 배수 속도 저하, 샤워 후 바닥 물고임 발생': 'Bathroom drain is slow; water pools on the floor after shower use',
        '거실 메인 조명 스위치 반응 없음, Guest Occupied 긴급 Inspection 요청': 'Living room main light switch is unresponsive; urgent inspection requested while guest is occupied',
        'Room Card키 인식 지연, 3 visits or more 태그해야 문 열림': 'Room card key recognition is delayed; door opens only after tagging 3 or more times',
        '책상 의자 흔들림 보수 및 볼트 조임 완료': 'Desk chair wobble repaired and bolts tightened',
        '세면대 수전 누수 패킹 교체 완료': 'Sink faucet leak packing replaced',
        '풀빌라 실외기 or more 소음, 인접 Room 민원 접수': 'Pool villa outdoor unit noise reported; adjacent room complaint received',
        '엘리베이터': 'Elevator',
        '오션타워 Floor 14 엘리베이터 호출 버튼 점등 불량': 'Ocean Tower Floor 14 elevator call button indicator malfunction',
        '미배정': 'Unassigned',
        '침대 좌측 콘센트 커버 교체 완료': 'Outlet cover on the left side of the bed replaced',
        '옷장 슬라이딩 도어 레일 이탈, 부품 확인 중': 'Wardrobe sliding door rail detached; parts being checked',
        '발코니 방충망 찢어짐, Check-out 후 교체 필요': 'Balcony screen is torn; replacement required after check-out',
        '욕실 도어 손잡이 헐거움 보수 완료': 'Loose bathroom door handle repaired'
    });
    Object.assign(cleanupMap, {
        '오션타워 Floor 14 Elevator 호출 버튼 점등 불량': 'Ocean Tower Floor 14 elevator call button indicator malfunction'
    });
    Object.entries(cleanupMap).sort((a, b) => b[0].length - a[0].length).forEach(([from, to]) => {
        out = out.replaceAll(from, to);
    });
    out = out.replace(/(\d+)종 통화 Needs Review/g, '$1 currencies need review');
    out = out.replace(/(\d+)홀/g, '$1 holes');
    out = out.replace(/(\d+)인/g, '$1 pax');
    out = out.replace(/(\d+)팀/g, '$1 team');
    out = out.replace(/(\d+)일/g, '$1 day');
    out = out.replace(/(\d+)분/g, '$1 min');
    out = out.replace(/(\d+)병/g, '$1 bottle');
    out = out.replace(/(\d+)잔/g, '$1 glass');
    out = out.replace(/(\d+)명/g, '$1 people');
    if (dayMap[out]) out = dayMap[out];
    return out;
}

function applyVisibleTextI18nFallback(lang, catalog) {
    if (lang === 'ko') {
        applyEnglishUiTextFallback();
        return;
    }
    if (lang !== 'en' || !document.body) return;
    const reverse = buildReverseI18nMap(catalog || {});
    const skipTags = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION']);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parent = node.parentElement;
            if (!parent || skipTags.has(parent.tagName) || pmsShouldSkipAutoI18n(node)) return NodeFilter.FILTER_REJECT;
            const trimmed = node.nodeValue.replace(/\s+/g, ' ').trim();
            return (reverse[trimmed] || /[가-힣]/.test(trimmed)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });

    const pending = [];
    let node;
    while ((node = walker.nextNode())) pending.push(node);
    pending.forEach(node => {
        const leading = node.nodeValue.match(/^\s*/)[0];
        const trailing = node.nodeValue.match(/\s*$/)[0];
        const trimmed = node.nodeValue.replace(/\s+/g, ' ').trim();
        const translated = reverse[trimmed] || RUNTIME_MESSAGE_FALLBACKS[trimmed] || translateKoreanPattern(trimmed);
        node.nodeValue = `${leading}${translated}${trailing}`;
    });
}

function buildEnglishUiI18nMap() {
    const map = {};
    const add = (enText, koText) => {
        if (!enText || !koText || enText === koText) return;
        map[String(enText).trim()] = String(koText).trim();
    };

    Object.entries(window.translations.en || {}).forEach(([key, enText]) => {
        const koText = window.translations.ko && window.translations.ko[key];
        add(enText, koText);
    });

    Object.entries(EN_TO_KO_UI_FALLBACKS).forEach(([enText, koText]) => add(enText, koText));
    return map;
}

function translateEnglishUiPattern(text) {
    if (!text) return text;
    const trimmed = String(text).replace(/\s+/g, ' ').trim();
    const exact = EN_TO_KO_UI_FALLBACKS[trimmed];
    if (exact) return exact;
    const completed = trimmed.match(/^Completed\s+(\d+)$/i);
    if (completed) return `완료 ${completed[1]}`;
    const todayCheckins = trimmed.match(/^Today Check-ins\s+(\d+)$/i);
    if (todayCheckins) return `금일 체크인 ${todayCheckins[1]}`;
    const urgentPending = trimmed.match(/^Urgent Pending\s+(\d+)$/i);
    if (urgentPending) return `긴급 대기 ${urgentPending[1]}`;
    const nightAuditClose = trimmed.match(/^I have reviewed the settlement details above and ([0-9-]+) will close the business day\.$/i);
    if (nightAuditClose) return `위 정산 세부 내역을 확인했으며 ${nightAuditClose[1]} 영업일을 마감합니다.`;
    return null;
}

function applyEnglishUiTextFallback() {
    if (!document.body) return;
    const forward = buildEnglishUiI18nMap();
    const skipTags = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION']);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parent = node.parentElement;
            if (!parent || skipTags.has(parent.tagName) || pmsShouldSkipAutoI18n(node)) return NodeFilter.FILTER_REJECT;
            const trimmed = node.nodeValue.replace(/\s+/g, ' ').trim();
            return (forward[trimmed] || translateEnglishUiPattern(trimmed)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });

    const pending = [];
    let node;
    while ((node = walker.nextNode())) pending.push(node);
    pending.forEach(node => {
        const leading = node.nodeValue.match(/^\s*/)[0];
        const trailing = node.nodeValue.match(/\s*$/)[0];
        const trimmed = node.nodeValue.replace(/\s+/g, ' ').trim();
        const translated = forward[trimmed] || translateEnglishUiPattern(trimmed);
        if (translated) node.nodeValue = `${leading}${translated}${trailing}`;
    });

    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
        const current = input.getAttribute('placeholder');
        const translated = forward[current] || KO_PLACEHOLDER_FALLBACKS[current];
        if (translated) input.setAttribute('placeholder', translated);
    });
}

const KO_PLACEHOLDER_FALLBACKS = {
    'Room번호 검색...': '객실번호 검색...',
    '이름, Room No., Reservation번호, Group명 검색...': '이름, 객실번호, 예약번호, 단체명 검색...',
    'Reservation번호, 고객명, 직원, Room, 변경내용 검색...': '예약번호, 고객명, 직원, 객실, 변경내용 검색...'
};

const EN_TO_KO_UI_FALLBACKS = {
    'Reservation Mgmt': '예약 관리',
    'Reservation Board': '예약 현황',
    'Reservation Timeline': '예약 타임라인',
    'Reservation List': '예약 목록',
    'Booking List': '예약 목록',
    'Groups': '단체 관리',
    'Group/Event List': '단체/행사 목록',
    'Group Company Management': '단체업체 관리',
    'Room Mgmt': '객실 관리',
    'Ancillary Svcs': '부가서비스',
    'Ancillary Registration': '부가서비스 등록',
    'Vendor / Item Management': '업체/항목 관리',
    'Folio & Billing': '통합 정산',
    'Settlement Status': '정산 현황',
    'Settlement List': '정산 목록',
    'Expense Purchases': '비품 구매',
    'Night Audit': '일일 마감',
    'Sales Analytics': '매출 분석',
    'Guest CRM': '투숙객 관리',
    'Staff Mgmt': '직원 관리',
    'Staff List': '직원 목록',
    'Role & Permissions': '권한 설정',
    'Operation Logs': '운영 로그',
    'Audit Logs': '감사 로그',
    'Notices': '공지사항',
    'Cancelled': '취소/노쇼',
    'Scheduled': '예정',
    'Past Events': '지난 행사',
    'Settlement Needed': '정산 필요',
    'New Event': '신규 행사',
    'Download Excel': '엑셀 다운로드',
    'Golf Course': '골프장',
    'Ancillary Page': '부가서비스 화면',
    'Register Vendor': '업체 등록',
    'Add Item': '항목 추가',
    'Select Period': '기간 선택',
    'Download Details': '상세 다운로드',
    'Payment Register': '결제 등록',
    'Payment Mark Complete': '결제 완료 처리',
    'Refresh': '새로고침',
    'Total Guests': '총 고객 수',
    'Return Rate': '재방문율',
    'Avg. Spend/Guest': '고객당 평균 지출',
    'Guest': '고객',
    'Country': '국적',
    'Tier': '등급',
    'Total Spend': '총 지출',
    'Contact': '연락처',
    'Actions': '관리',
    'First Name *': '이름 *',
    'First Name': '이름',
    'Last Name *': '성 *',
    'Last Name': '성',
    'Contact *': '연락처 *',
    'Email': '이메일',
    'Room Type': '객실 유형',
    'Payment Amount': '결제 금액',
    'Status': '상태',
    'Tier Member Status and Criteria': '등급 멤버 현황 및 기준',
    'Recent Tier Changes': '최근 등급 변동',
    'Today': '오늘',
    'Check-in': '체크인',
    'Check-out': '체크아웃',
    'Channel': '채널',
    'Amount': '금액',
    'Unsettled Groups': '미정산 단체',
    'Today Check-ins': '금일 체크인',
    'Room Service Orders': '룸서비스 주문',
    'Golf Reservations': '골프 예약',
    'Rent-a-car Reservations': '렌터카 예약',
    'Ancillary Services Dashboard': '부가서비스 대시보드',
    'Weekly Total Revenue': '주간 총 매출',
    'Total Revenue': '총 매출',
    'Room Revenue': '객실 매출',
    'Ancillary Revenue': '부가서비스 매출',
    'Daily Revenue Trend': '일별 매출 추이',
    'Revenue by Department': '부서별 매출',
    'Room': '객실',
    'Search': '검색',
    'Guest Name': '고객명',
    'Total': '총 금액',
    'Paid Amount': '결제액',
    'Today Reservations': '금일 예약',
    'Maintenance Request': '시설 보수 요청',
    'Completed': '완료',
    'Urgent Pending': '긴급 대기',
    'I have reviewed the settlement details above and': '위 정산 세부 내역을 확인했으며',
    'will close the business day.': '영업일을 마감합니다.',
    'Run Daily Close': '일일 마감 실행',
    'Payment Method': '결제 방식',
    'Verify Guest': '투숙객 확인',
    'Complete Payment / Charge': '결제/청구 완료',
    'Bulk Rate Edit': '일괄 요금 수정',
    'Reset to Default Rates': '기본 요금으로 초기화',
    'Item Actions': '항목 관리',
    'Building / Area Actions': '건물/구역 관리',
    'Add Room': '객실 등록',
    'Manual Order': '수기 오더 등록',
    'Accept Order': '주문 접수',
    'Service Restriction Warning: Unpaid Billing': '미납 요금 서비스 제한 경고',
    'Billing and Payment History': '요금 및 결제 내역',
    'Download Total Summary': '전체 요약 다운로드',
    'Billing Date': '청구일',
    'Payment Status': '결제 상태',
    'Saved Payment Methods': '저장된 결제 수단',
    'Add Card': '카드 추가',
    'System Notices': '시스템 공지',
    'Add': '추가',
    'Total Staff': '전체 직원',
    'Add Staff': '직원 등록',
    'Staff': '직원',
    'Role': '권한',
    'Edit': '수정',
    'Contact Support': '고객지원 문의'
};

const RUNTIME_MESSAGE_FALLBACKS = {
    '검색어를 입력해 주세요.': 'Enter a search term.',
    '다운로드 되었습니다.': 'Download completed.',
    '단체 일괄 정산 화면으로 이동합니다.': 'Opening the group settlement screen.',
    '행사(블록)명을 입력하세요.': 'Enter an event/block name.',
    '최소 1개 이상의 객실을 할당해야 합니다.': 'Allocate at least one room.',
    '행사 정보가 수정되었습니다.': 'Event information has been updated.',
    '신규 객실 배정이 등록되었습니다.': 'New room allocation has been registered.',
    '이름을 입력하세요.': 'Enter a name.',
    '투숙객이 Rooming List에 추가되었습니다.': 'Guest has been added to the rooming list.',
    '예약 모달을 불러오지 못했습니다. 페이지를 새로고침 후 다시 시도해주세요.': 'Could not load the reservation modal. Refresh the page and try again.',
    '예약 화면을 여는 중 오류가 발생했습니다.': 'An error occurred while opening the reservation screen.',
    '행사명을 입력해주세요.': 'Enter an event name.',
    '기본 정보를 먼저 저장해주세요.': 'Save the basic information first.',
    '같은 호실이 중복되었습니다.': 'The same room is duplicated.',
    '객실 배정이 저장되었습니다.': 'Room allocation has been saved.',
    '호실 선택': 'Select room',
    '호실을 선택하세요.': 'Select a room.',
    '기존 회원을 선택하거나 신규 회원 이름을 입력하세요.': 'Select an existing member or enter a new guest name.',
    '조회 조건이 적용되었습니다.': 'Search conditions have been applied.',
    '결제가 성공적으로 승인되었습니다.': 'Payment has been approved successfully.',
    '새 Ancillary Svcs 오더가 시스템에 등록되었습니다.': 'New ancillary service order has been registered.',
    '객실 번호와 상세 내용을 입력해주세요.': 'Enter a room number and details.',
    '시설 보수 요청이 등록되었습니다.': 'Maintenance request has been registered.',
    '데이터를 불러오는데 실패했습니다.': 'Failed to load data.',
    '일일 마감이 성공적으로 완료되었습니다. 다음 영업일로 전환됩니다.': 'Night audit has been completed successfully. Switching to the next business day.',
    '상품 추가됨': 'Item added.',
    '객실 원장(Folio)에 반영되었습니다.': 'Applied to the room folio.',
    'Room 번호를 입력해주세요.': 'Enter a room number.',
    '요금이 성공적으로 저장되었습니다.': 'Rates have been saved successfully.',
    '기본 요금으로 초기화되었습니다. 변경사항을 저장하려면 요금 저장을 누르세요.': 'Rates have been reset to defaults. Click Save Rates to save the changes.',
    '필수 항목을 모두 입력해주세요.': 'Enter all required fields.',
    '요금이 일괄 적용되었습니다. 변경사항을 저장하려면 요금 저장을 누르세요.': 'Rates have been applied in bulk. Click Save Rates to save the changes.',
    '업체별 단체 할인율이 저장되었습니다.': 'Company group discount rates have been saved.',
    '업체 정보가 저장되었습니다.': 'Company information has been saved.',
    '새 룸서비스 오더가 시스템에 등록되었습니다.': 'New room service order has been registered.',
    '새 객실 유형 이름을 입력하세요:': 'Enter a new room type name:',
    '객실 유형 설명을 입력하세요:': 'Enter a room type description:',
    '객실 유형이 추가되었습니다.': 'Room type has been added.',
    '객실 유형 이름을 입력하세요:': 'Enter a room type name:',
    '객실 유형이 수정되었습니다.': 'Room type has been updated.',
    '새 건물/구역의 이름을 입력하세요:': 'Enter a new building/area name:',
    '건물/구역의 새 이름을 입력하세요:': 'Enter a new building/area name:',
    '이미 존재하는 건물/구역명입니다.': 'This building/area name already exists.',
    '이미 등록된 객실 번호입니다.': 'This room number is already registered.',
    '투숙 중인 객실은 프론트데스크 예약 화면에서 체크아웃 처리를 해야 합니다.': 'Occupied rooms must be checked out from the front desk reservation screen.',
    '신규 Room이 등록되었습니다.': 'New room has been registered.',
    '오더가 전송되었습니다.': 'Order has been sent.',
    '다운그레이드는 고객센터 문의가 필요합니다.': 'Downgrades require contacting support.',
    '모든 카드 정보를 올바르게 입력해주세요.': 'Enter all card information correctly.',
    '카드가 성공적으로 등록되었습니다.': 'Card has been registered successfully.',
    '결제가 성공적으로 완료되었습니다.': 'Payment has been completed successfully.',
    '역할 이름을 입력하세요.': 'Enter a role name.',
    '최소 1개 이상의 권한을 선택하세요.': 'Select at least one permission.',
    '새 역할이 생성되었습니다.': 'New role has been created.',
    '역할이 수정되었습니다.': 'Role has been updated.',
    '역할이 삭제되었습니다.': 'Role has been deleted.',
    '기본 통화 설정이 저장되었습니다.': 'Default currency setting has been saved.',
    '이름을 입력해 주세요.': 'Enter a name.',
    '이메일을 입력해 주세요.': 'Enter an email address.',
    '역할을 선택해 주세요.': 'Select a role.',
    '임시 비밀번호를 입력해 주세요.': 'Enter a temporary password.',
    '비밀번호가 성공적으로 초기화되었습니다.': 'Password has been reset successfully.',
    '직원 정보가 수정되었습니다.': 'Staff information has been updated.',
    '등록된 이메일로 임시 비밀번호가 발송되었습니다.': 'A temporary password has been sent to the registered email.',
    '직원이 삭제되었습니다.': 'Staff member has been deleted.',
    '접수되었습니다.': 'Submitted.'
};

function hasKoreanText(text) {
    return Array.from(String(text || '')).some(ch => ch.charCodeAt(0) >= 0xAC00 && ch.charCodeAt(0) <= 0xD7A3);
}

function translateRuntimeLine(line, reverse) {
    const leading = line.match(/^\s*/)[0];
    const trailing = line.match(/\s*$/)[0];
    const trimmed = line.replace(/\s+/g, ' ').trim();
    const translated = reverse[trimmed] || RUNTIME_MESSAGE_FALLBACKS[trimmed] || translateKoreanPattern(trimmed);
    return `${leading}${translated}${trailing}`;
}

function translateRuntimeMessageText(message) {
    if (message == null) return message;
    const lang = localStorage.getItem('pms_lang') || window.currentLang || 'ko';
    const text = String(message);
    if (lang !== 'en' || !hasKoreanText(text)) return message;
    const catalog = (window.PMS_I18N_CATALOG && window.PMS_I18N_CATALOG[window.PMS_I18N_NAMESPACE]) || {};
    const reverse = buildReverseI18nMap(catalog || {});
    return text.split('\n').map(line => translateRuntimeLine(line, reverse)).join('\n');
}

window.pmsRuntimeText = translateRuntimeMessageText;

function installNativeDialogI18n() {
    if (window.__pmsNativeDialogI18n) return;
    window.__pmsNativeDialogI18n = true;
    window.alert = message => {
        const translated = translateRuntimeMessageText(message);
        if (window.showAlert) window.showAlert(translated);
        else if (window.showToast) window.showToast(translated, 'error');
        else console.warn(translated);
    };
    window.confirm = message => {
        const translated = translateRuntimeMessageText(message);
        if (window.showConfirm) window.showConfirm(translated);
        else console.warn(translated);
        return false;
    };
    window.prompt = (message, defaultValue = '') => {
        const translated = translateRuntimeMessageText(message);
        if (window.showAlert) window.showAlert(translated);
        else console.warn(translated);
        return defaultValue;
    };
}

installNativeDialogI18n();

function searchLabelText() {
    if (typeof window.t === 'function') {
        const translated = window.t('common.search');
        if (translated && translated !== 'common.search') return translated;
    }
    const lang = localStorage.getItem('pms_lang') || window.currentLang || 'ko';
    return lang === 'en' ? 'Search' : '검색';
}

function isSearchInput(input) {
    if (!input || input.dataset.pmsNoSearchButton === 'true') return false;
    if (!['INPUT'].includes(input.tagName)) return false;
    const type = String(input.type || 'text').toLowerCase();
    if (!['text', 'search'].includes(type)) return false;
    const hint = [
        input.id,
        input.name,
        input.className,
        input.placeholder,
        input.getAttribute('aria-label')
    ].filter(Boolean).join(' ').toLowerCase();
    return hint.includes('search') || hint.includes('검색');
}

const searchPlaceholderTranslations = {
    en: {
        '이름, 객실번호, 예약번호, 단체명 검색...': 'Search by name, room, booking #, group...',
        '이름, Room No., Reservation번호, Group명 검색...': 'Search by name, room, booking #, group...',
        '예약번호, 고객명, 직원, 객실, 변경내용 검색...': 'Search reservation no., guest, staff, room, or changes...',
        'Reservation번호, 고객명, 직원, Room, 변경내용 검색...': 'Search reservation no., guest, staff, room, or changes...',
        '항목/구매자 검색': 'Search item or buyer',
        '이름, 이메일 검색...': 'Search name or email...',
        '이름, Contact, 이메일 검색...': 'Search name, contact, or email...',
        '고객명 검색...': 'Search guest name...',
        'Guest명 검색...': 'Search guest name...',
        '이름/호실 검색...': 'Search name or room...',
        '이름, Room번호, Booking # 검색...': 'Search name, room, or booking #...',
        '행사(블록)명 검색...': 'Search group/block name...',
        '단체명 검색...': 'Search group name...',
        '객실번호, 고객명, Folio 검색...': 'Search room, guest, or folio...',
        '객실번호, 고객명, 정산번호 검색...': 'Search room, guest, or folio...',
        'Room번호, Guest명, Folio 번호 검색...': 'Search room, guest, or folio...',
        'Room번호 검색...': 'Search room number...',
        'Room 번호 검색...': 'Search room number...',
        '객실번호 검색...': 'Search room number...',
        '객실 번호 검색...': 'Search room number...',
        '객실 번호, 타입 검색...': 'Search room number or type...'
    },
    ko: {
        'Search by name, room, booking #, group...': '이름, 객실번호, 예약번호, 단체명 검색...',
        'Search reservation no., guest, staff, room, or changes...': '예약번호, 고객명, 직원, 객실, 변경내용 검색...',
        'Search item or buyer': '항목/구매자 검색',
        'Search name or email...': '이름, 이메일 검색...',
        'Search name, contact, or email...': '이름, 연락처, 이메일 검색...',
        'Search guest name...': '고객명 검색...',
        'Search name or room...': '이름/객실번호 검색...',
        'Search name, room, or booking #...': '이름, 객실번호, 예약번호 검색...',
        'Search group/block name...': '행사/블록명 검색...',
        'Search group name...': '단체명 검색...',
        'Search room, guest, or folio...': '객실번호, 고객명, 정산번호 검색...',
        'Search room, guest, folio...': '객실번호, 고객명, 정산번호 검색...',
        'Search room number...': '객실번호 검색...',
        'Search room number or type...': '객실번호, 타입 검색...',
        '이름, Contact, 이메일 검색...': '이름, 연락처, 이메일 검색...',
        'Guest명 검색...': '고객명 검색...',
        '이름, Room번호, Booking # 검색...': '이름, 객실번호, 예약번호 검색...',
        'Room번호, Guest명, Folio 번호 검색...': '객실번호, 고객명, 정산번호 검색...',
        '객실번호, 고객명, Folio 검색...': '객실번호, 고객명, 정산번호 검색...',
        'Room번호 검색...': '객실번호 검색...',
        'Room 번호 검색...': '객실번호 검색...'
    }
};

function normalizeSearchPlaceholder(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
}

function searchPlaceholderText(input) {
    if (!input.placeholder) return '';
    const lang = localStorage.getItem('pms_lang') || window.currentLang || 'ko';
    const source = input.dataset.pmsSearchOriginalPlaceholder || input.placeholder;
    const normalized = normalizeSearchPlaceholder(source);
    const translated = (searchPlaceholderTranslations[lang] || {})[normalized];
    if (translated) return translated;
    if (lang === 'en' && typeof window.pmsRuntimeText === 'function') {
        const runtime = window.pmsRuntimeText(source);
        if (runtime && runtime !== source) return runtime;
    }
    return source;
}

function refreshSearchInputPlaceholder(input) {
    if (!input.placeholder) return;
    if (input.matches('[data-no-auto-i18n], [data-no-i18n], [data-i18n-skip]')) return;
    if (!input.dataset.pmsSearchOriginalPlaceholder) {
        input.dataset.pmsSearchOriginalPlaceholder = input.placeholder;
    }
    input.placeholder = searchPlaceholderText(input);
}

function hasNearbySearchButton(anchor) {
    return !!findNearbySearchButton(anchor);
}

function findNearbySearchButton(anchor) {
    const scope = anchor.parentElement || anchor;
    return Array.from(scope.querySelectorAll('button')).find(button => {
        const text = button.textContent.trim().toLowerCase();
        const icon = button.querySelector('.fa-search, .fa-magnifying-glass');
        return button.dataset.pmsSearchButton === 'true'
            || button.classList.contains('btn-search')
            || text === 'search'
            || text === '검색'
            || !!icon;
    }) || null;
}

function ensureSearchButtonStyles() {
    if (document.getElementById('pmsSearchButtonStyles')) return;
    const style = document.createElement('style');
    style.id = 'pmsSearchButtonStyles';
    style.textContent = `
        .pms-search-button{height:38px;padding:0 14px;background:var(--primary,#3B82F6);color:#fff;border:0;border-radius:var(--radius-sm,8px);font-family:var(--font,inherit);font-size:.78rem;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;cursor:pointer;transition:all .2s}
        .pms-search-button:hover{background:var(--primary-dk,#2563EB);transform:translateY(-1px);box-shadow:0 2px 8px rgba(59,130,246,.28)}
        .pms-search-button i{font-size:.78rem}
        .pms-search-divider{width:1px;height:24px;background:var(--border,#E5E7EB);flex:0 0 auto;margin:0 4px}
        @media (max-width:768px){.pms-search-button{height:38px;min-width:82px}.search-container .pms-search-button{flex:0 0 auto}.pms-search-divider{display:none}}
    `;
    document.head.appendChild(style);
}

function ensureFilterSearchDivider(anchor) {
    const filterLeft = anchor?.closest?.('.filter-left');
    if (!filterLeft) return;
    const chips = Array.from(filterLeft.children).find(child => child.classList?.contains('filter-chips'));
    if (!chips) return;
    const previous = chips.previousElementSibling;
    if (previous?.classList?.contains('pms-search-divider') || previous?.classList?.contains('filter-divider')) return;
    if (previous && previous.classList?.contains('desktop-only') && previous.getBoundingClientRect?.().height >= 20) return;
    const divider = document.createElement('div');
    divider.className = 'pms-search-divider desktop-only';
    divider.setAttribute('aria-hidden', 'true');
    filterLeft.insertBefore(divider, chips);
}

function bindSearchInputForButton(input) {
    if (input.dataset.pmsSearchHandlerBound === 'true') return;
    const inlineInput = input.getAttribute('oninput') || '';
    const inlineKeyup = input.getAttribute('onkeyup') || '';
    const inlineKeydown = input.getAttribute('onkeydown') || '';
    const inlineSearch = input.getAttribute('onsearch') || '';
    const inlineHandler = inlineSearch || inlineInput || inlineKeyup || inlineKeydown;
    if (inlineHandler) input.dataset.pmsSearchInlineHandler = inlineHandler;
    if (inlineInput) {
        input.removeAttribute('oninput');
        input.oninput = null;
    }
    if (inlineKeyup) {
        input.removeAttribute('onkeyup');
        input.onkeyup = null;
    }
    if (inlineKeydown) {
        input.removeAttribute('onkeydown');
        input.onkeydown = null;
    }
    input.dataset.pmsSearchHandlerBound = 'true';
}

function runSearchInput(input) {
    const inline = input.dataset.pmsSearchInlineHandler || input.getAttribute('onsearch');
    if (inline) {
        try {
            new Function('event', inline).call(input, { key: 'Enter', target: input, currentTarget: input });
        } catch(e) {
            console.warn('Search handler failed', e);
        }
    } else {
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

function ensureSearchButtons() {
    if (!document.body) return;
    ensureSearchButtonStyles();
    document.querySelectorAll('input').forEach(input => {
        if (!isSearchInput(input)) return;
        bindSearchInputForButton(input);
        refreshSearchInputPlaceholder(input);
        const anchor = input.closest('.search-box-mt, .search-box, .search-bar, .audit-search, .settlement-search') || input;
        if (hasNearbySearchButton(anchor)) {
            ensureFilterSearchDivider(anchor);
            if (!input.dataset.pmsSearchEnterBound) {
                input.dataset.pmsSearchEnterBound = 'true';
                input.addEventListener('keydown', event => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    const button = findNearbySearchButton(anchor);
                    if (button) button.click();
                    else runSearchInput(input);
                });
            }
            return;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'pms-search-button';
        button.dataset.pmsSearchButton = 'true';
        button.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i><span>${searchLabelText()}</span>`;
        button.addEventListener('click', () => runSearchInput(input));
        anchor.insertAdjacentElement('afterend', button);
        ensureFilterSearchDivider(anchor);

        if (!input.dataset.pmsSearchEnterBound) {
            input.dataset.pmsSearchEnterBound = 'true';
            input.addEventListener('keydown', event => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                button.click();
            });
        }
    });
}

function refreshSearchButtonLabels() {
    document.querySelectorAll('button[data-pms-search-button="true"] span').forEach(span => {
        span.textContent = searchLabelText();
    });
}

function refreshSearchPlaceholders() {
    document.querySelectorAll('input').forEach(input => {
        if (isSearchInput(input)) refreshSearchInputPlaceholder(input);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(ensureSearchButtons, 120);
    setTimeout(ensureSearchButtons, 800);
});
window.addEventListener('DataReady', () => setTimeout(ensureSearchButtons, 120));
window.addEventListener('languagechange', () => {
    refreshSearchButtonLabels();
    refreshSearchPlaceholders();
});

window.t = function(key, params) {
    const lang = localStorage.getItem('pms_lang') || window.currentLang || 'ko';
    const catalog = (window.PMS_I18N_CATALOG && window.PMS_I18N_CATALOG[window.PMS_I18N_NAMESPACE]) || {};
    const dict = catalog[lang] || catalog.en || {};
    const legacy = (window.translations && (window.translations[lang] || window.translations.en)) || {};
    let value = dict[key] || legacy[key] || key;
    if (params && typeof value === 'string') {
        Object.keys(params).forEach(name => {
            value = value.replace(new RegExp(`\\{${name}\\}`, 'g'), params[name]);
        });
    }
    return value;
};

window.addEventListener('DataReady', () => {
    setupI18n();
    changeLang(localStorage.getItem('pms_lang') || window.currentLang || 'ko');
});

document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('script[src*="sidebar.js"]')) {
        window.dispatchEvent(new Event('DataReady'));
    }
    setTimeout(installChangeLangGuard, 0);
});

function installChangeLangGuard() {
    const original = window.changeLang;
    if (typeof original !== 'function' || original.__pmsI18nGuard) return;
    window.changeLang = function guardedChangeLang(lang) {
        const result = original.apply(this, arguments);
        const nextLang = lang || localStorage.getItem('pms_lang') || window.currentLang || 'ko';
        window.currentLang = nextLang;
        localStorage.setItem('pms_lang', nextLang);
        const catalog = (window.PMS_I18N_CATALOG && window.PMS_I18N_CATALOG[window.PMS_I18N_NAMESPACE]) || {};
        applyKeyedI18nFallback(nextLang, catalog);
        applyVisibleTextI18nFallback(nextLang, catalog);
        window.dispatchEvent(new Event('languagechange'));
        setTimeout(() => {
            applyKeyedI18nFallback(nextLang, catalog);
            applyVisibleTextI18nFallback(nextLang, catalog);
        }, 120);
        return result;
    };
    window.changeLang.__pmsI18nGuard = true;
    const lang = localStorage.getItem('pms_lang') || window.currentLang || 'ko';
    window.changeLang(lang);
    installI18nMutationObserver();
}

function applyKeyedI18nFallback(lang, catalog) {
    if (!document.body) return;
    const legacy = (window.translations && (window.translations[lang] || window.translations.en)) || {};
    const catalogDict = (catalog && (catalog[lang] || catalog.en)) || {};
    document.querySelectorAll('[data-i18n-key]').forEach(element => {
        const key = element.getAttribute('data-i18n-key');
        const translated = catalogDict[key] || legacy[key];
        if (translated && element.textContent !== translated) element.textContent = translated;
    });
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translated = catalogDict[key] || legacy[key];
        if (translated && element.textContent !== translated) element.textContent = translated;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translated = catalogDict[key] || legacy[key];
        if (translated && element.getAttribute('placeholder') !== translated) element.setAttribute('placeholder', translated);
    });
    applyKoEnDatasetI18n(lang);
    const langSelects = document.querySelectorAll('#langSelect, .lang-select, select[onchange*="changeLang"]');
    langSelects.forEach(select => {
        if (select.value !== lang) select.value = lang;
    });
    if (typeof window.applyLocalI18n === 'function' && !window.__pmsApplyingLocalI18n) {
        try {
            window.__pmsApplyingLocalI18n = true;
            window.applyLocalI18n(lang);
        } finally {
            window.__pmsApplyingLocalI18n = false;
        }
    }
}

function installI18nMutationObserver() {
    if (window.__pmsI18nObserver || !document.body) return;
    let timer = null;
    window.__pmsI18nObserver = new MutationObserver(() => {
        const lang = localStorage.getItem('pms_lang') || window.currentLang || 'ko';
        clearTimeout(timer);
        timer = setTimeout(() => {
            const catalog = (window.PMS_I18N_CATALOG && window.PMS_I18N_CATALOG[window.PMS_I18N_NAMESPACE]) || {};
            applyKeyedI18nFallback(lang, catalog);
            applyVisibleTextI18nFallback(lang, catalog);
        }, 80);
    });
    window.__pmsI18nObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
}

// --- Added Missing Sidebar Vocabulary ---
Object.assign(window.translations.ko, {
    "Main": "메인",
    "Front Desk": "프론트 데스크",
    "Guest & CRM": "투숙객 및 고객 관리",
    "Customer Management": "고객 관리",
    "Operations": "운영 관리",
    "Settings": "설정",
    "Settings & Admin": "설정/관리",
    "Dashboard": "대시보드",
    "Reservations": "예약 타임라인",
    "Booking List": "예약 목록",
    "Check-in/out": "체크인/아웃",
    "Groups": "단체 관리",
    "Group Companies": "단체 등록 관리",
    "Block Allocations": "행사 및 객실배정",
    "Guest CRM": "투숙객 관리",
    "VIP Members": "우수 고객 멤버십",
    "Room Mgmt": "객실 관리",
    "Room Types": "객실 유형",
    "Room List": "객실 목록",
    "Rates Calendar": "요금 캘린더",
    "Housekeeping": "하우스키핑",
    "Maintenance": "시설 보수",
    "Folio & Billing": "통합 정산",
    "Folio List": "정산 목록",
    "Revenue Analytics": "매출 분석",
    "Night Audit": "일일 마감",
    "Ancillary Svcs": "부가서비스",
    "Ancillary Registration": "부가서비스 등록",
    "Vendor / Item Management": "업체/항목 관리",
    "부가서비스 등록": "부가서비스 등록",
    "업체/항목 관리": "업체/항목 관리",
    "Room Service": "룸서비스",
    "Golf": "골프 예약",
    "Rent-a-car": "렌터카",
    "Unified POS": "통합 포스",
    "Hotel Settings": "호텔 설정",
    "Staff Mgmt": "직원 관리",
    "Staff List": "직원 목록",
    "Role & Perms": "권한 설정",
    "Billing & Payment": "요금 및 결제",
    "Payment Settings": "결제 설정",
    "Notices": "공지사항",
    "Support": "고객지원",
    "Group & MICE": "그룹/행사 예약",
    "Reporting": "종합 리포트",
    "POS": "식음료 / 리테일",
    "Tenant Mgmt": "입점사 관리",
    "Ad Network": "광고 네트워크",
    "System": "시스템",
    "Platform Status": "플랫폼 현황",
    "Hotel List": "호텔 목록",
    "New Registration": "신규 입점 등록",
    "Campaigns": "캠페인 목록",
    "New Campaign": "캠페인 등록",
    "Ad Billing": "광고 정산",
    "Admin Accounts": "어드민 계정",
    "Customer Support": "고객 지원",
    "Notice Mgmt": "공지사항 관리",
    "Operation Logs": "운영 로그",
    "Audit Log": "감사로그",
    "Close Log": "마감로그",
    "Audit Logs": "감사 로그",
    "Platform Owner": "플랫폼 소유자",
    "Super Admin": "슈퍼 관리자",
    "더보기 →": "더보기 →",
    "단체/행사 목록": "단체/행사 목록",
    "단체 등록 관리": "단체 등록 관리",
    "Group Events": "단체/행사 목록",
    "호텔 알림": "호텔 알림",
    "모두 읽음 처리": "모두 읽음 처리",
    "모든 알림 보기 →": "모든 알림 보기 →",
    "알림 및 실시간 활동": "알림 및 실시간 활동",
    "행사 등록/관리": "행사 등록/관리",
    "투숙 중": "투숙 중",
    "하우스키핑 현황": "하우스키핑 현황",
    "Clean": "청소 완료",
    "Dirty": "미청소",
    "Cleaning": "청소 중",
    "Inspected": "점검 완료",
    "New Diamond": "신규 다이아몬드",
    "Vacant": "공실",
    "Search": "검색",
    "고객 등록": "고객 등록",
    "Riverside Family Dinner Set": "리버사이드 패밀리 디너 세트",
    "Penthouse Room Service Set 2 items": "펜트하우스 룸서비스 세트 2건",
    "Sedan Rental / 2 hours": "세단 기본 대여 / 2시간",
    "Chauffeur Van": "기사 포함 밴",
    "Chauffeur Van Rental": "기사 포함 밴 기본 대여",
    "기본 정보": "기본 정보",
    "호텔명": "호텔명",
    "대표 전화번호": "대표 전화번호",
    "대표 이메일": "대표 이메일",
    "호텔 주소": "호텔 주소"
});
Object.assign(window.translations.en, {
    "Group & MICE": "Group & MICE",
    "Night Audit": "Night Audit",
    "Reporting": "Reporting",
    "Maintenance": "Maintenance",
    "POS": "POS",

    "Main": "Main",
    "Front Desk": "Front Desk",
    "Guest & CRM": "Guest & CRM",
    "Customer Management": "Customer Management",
    "Operations": "Operations",
    "Settings": "Settings",
    "Settings & Admin": "Settings & Admin",
    "Dashboard": "Dashboard",
    "Reservations": "Reservations",
    "Booking List": "Reservation List",
    "Check-in/out": "Check-in/out",
    "Guest CRM": "Guest CRM",
            "Agencies": "Agencies",
    "VIP Members": "VIP Members",
    "Room Mgmt": "Room Mgmt",
    "Room Types": "Room Types",
    "Rates Calendar": "Rates Calendar",
    "Housekeeping": "Housekeeping",
    "Folio & Billing": "Folio & Billing",
    "Folio List": "Folio List",
    "Revenue Analytics": "Revenue Analytics",
    "Ancillary Svcs": "Ancillary Svcs",
    "Room Service": "Room Service",
    "Golf": "Golf",
    "Rent-a-car": "Rent-a-car",
    "Hotel Settings": "Hotel Settings",
    "Staff Mgmt": "Staff Mgmt",
    "Billing & Payment": "Billing & Payment",
    "Payment Settings": "Payment Settings",
    "Notices": "Notices",
    "Support": "Support",
    "Tenant Mgmt": "Tenant Mgmt",
    "Ad Network": "Ad Network",
    "System": "System",
    "Platform Status": "Platform Status",
    "Hotel List": "Hotel List",
    "New Registration": "New Registration",
    "Campaigns": "Campaigns",
    "New Campaign": "New Campaign",
    "Ad Billing": "Ad Billing",
    "Admin Accounts": "Admin Accounts",
    "Subscription & Billing": "Subscription & Billing",
    "Customer Support": "Customer Support",
    "Notice Mgmt": "Notice Mgmt",
    "Operation Logs": "Operation Logs",
    "Audit Log": "Audit Log",
    "Close Log": "Close Log",
    "Audit Logs": "Audit Logs",
    "Platform Owner": "Platform Owner",
    "Super Admin": "Super Admin",
    "더보기 →": "View More →",
    "단체/행사 목록": "Group Events",
    "단체 등록 관리": "Group Registration",
    "Group Events": "Group Events",
    "호텔 알림": "Hotel Alerts",
    "모두 읽음 처리": "Mark all read",
    "모든 알림 보기 →": "View all notifications →",
    "알림 및 실시간 활동": "Notifications & Live Activity",
    "행사 등록/관리": "Group Event Management",
    "투숙 중": "In-house",
    "하우스키핑 현황": "Housekeeping Status",
    "Clean": "Clean",
    "Dirty": "Dirty",
    "Cleaning": "Cleaning",
    "Inspected": "Inspected",
    "New Diamond": "New Diamond",
    "Vacant": "Vacant",
    "Search": "Search",
    "고객 등록": "Add Guest",
    "리버사이드 패밀리 디너 세트": "Riverside Family Dinner Set",
    "펜트하우스 룸서비스 세트 2건": "Penthouse Room Service Set 2 items",
    "펜트하우스 Room Service Set 2 items": "Penthouse Room Service Set 2 items",
    "세단 기본 대여 / 2시간": "Sedan Rental / 2 hours",
    "Sedan 기본 대여 / 2시간": "Sedan Rental / 2 hours",
    "기사 포함 밴": "Chauffeur Van",
    "기사 포함 밴 기본 대여": "Chauffeur Van Rental",
    "기본 정보": "Basic Info",
    "호텔명": "Hotel Name",
    "대표 전화번호": "Main Phone",
    "대표 이메일": "Main Email",
    "호텔 주소": "Hotel Address"
});

Object.assign(window.translations.ko, {
    "Room Occupancy (OCC)": "객실 점유율",
    "Average Daily Rate (ADR)": "평균 일 객실요금",
    "Revenue per Available Room (RevPAR)": "판매 가능 객실당 수익",
    "Today's Check-in / Check-out": "오늘 체크인 / 체크아웃",
    "Weekly": "주간",
    "Monthly": "월간",
    "Daily Status": "요일별 현황",
    "Today's Scheduled Check-ins": "오늘 체크인 예정",
    "Live Activity": "실시간 활동",
    "Today's Ancillary Orders": "오늘 부가서비스 주문",
    "Time": "시간",
    "Service": "서비스",
    "Item": "항목",
    "In Progress": "진행 중",
    "Pickup": "수거 중",
    "Booked": "예약 확정",
    "Housekeeping Status": "하우스키핑 현황",
    "Target ad banner area · Region: Vietnam / Ho Chi Minh · CPM: $2.50": "광고 배너 영역 · 지역: 베트남 / 호치민 · 노출단가: $2.50",
    "Today's Ancillary Revenue": "오늘 총 부가서비스 매출",
    "Weekly Ancillary Revenue": "주간 총 부가서비스 매출",
    "No scheduled check-ins for today.": "오늘 예정된 체크인이 없습니다.",
    "Scheduled check-in": "체크인 예정",
    "Scheduled check-out": "체크아웃 예정",
    "Housekeeping task updated": "하우스키핑 작업 업데이트",
    "Today": "오늘",
    "5 min ago": "5분 전",
    "room": "호",
    "Spa": "스파",
    "Golf Booking": "골프 예약",
    "Minibar": "미니바",
    "Laundry": "세탁",
    "Club sandwich × 2, Iced latte × 1": "클럽 샌드위치 × 2, 아이스 라떼 × 1",
    "Beer × 3, Wine × 1": "맥주 × 3, 와인 × 1",
    "Aroma therapy 90 min": "아로마 테라피 90분",
    "Dry-cleaning shirt × 3": "셔츠 드라이클리닝 × 3",
    "Golf (External)": "골프 예약",
    "DaLat Palace GC · 10:30 T/Off · 2 pax": "DaLat Palace GC · 10:30 T/Off 2인",
    "Revenue Amount": "매출액",
    "Share": "비중",
    "Monthly Room Statistics": "월간 객실 통계",
    "Weekly Room Statistics": "주간 객실 통계",
    "Active Rooms": "가동 객실",
    "Occupancy Rate": "가동률",
    "This Week": "금주 가동",
    "Last Week": "전주 가동",
    "vs Last Week": "전주 대비",
    "System / Booking": "시스템/예약"
});

Object.assign(window.translations.en, {
    "Room Occupancy (OCC)": "Room Occupancy (OCC)",
    "Average Daily Rate (ADR)": "Average Daily Rate (ADR)",
    "Revenue per Available Room (RevPAR)": "Revenue per Available Room (RevPAR)",
    "Today's Check-in / Check-out": "Today's Check-in / Check-out",
    "Weekly": "Weekly",
    "Monthly": "Monthly",
    "Daily Status": "Daily Status",
    "Today's Scheduled Check-ins": "Today's Scheduled Check-ins",
    "Live Activity": "Live Activity",
    "Today's Ancillary Orders": "Today's Ancillary Orders",
    "Time": "Time",
    "Service": "Service",
    "Item": "Item",
    "In Progress": "In Progress",
    "Pickup": "Pickup",
    "Booked": "Booked",
    "Housekeeping Status": "Housekeeping Status",
    "Target ad banner area · Region: Vietnam / Ho Chi Minh · CPM: $2.50": "Target ad banner area · Region: Vietnam / Ho Chi Minh · CPM: $2.50",
    "Today's Ancillary Revenue": "Today's Ancillary Revenue",
    "Weekly Ancillary Revenue": "Weekly Ancillary Revenue",
    "No scheduled check-ins for today.": "No scheduled check-ins for today.",
    "Scheduled check-in": "Scheduled check-in",
    "Scheduled check-out": "Scheduled check-out",
    "Housekeeping task updated": "Housekeeping task updated",
    "Today": "Today",
    "5 min ago": "5 min ago",
    "room": "room",
    "Spa": "Spa",
    "Golf Booking": "Golf Booking",
    "Minibar": "Minibar",
    "Laundry": "Laundry",
    "Club sandwich × 2, Iced latte × 1": "Club sandwich × 2, Iced latte × 1",
    "Beer × 3, Wine × 1": "Beer × 3, Wine × 1",
    "Aroma therapy 90 min": "Aroma therapy 90 min",
    "Dry-cleaning shirt × 3": "Dry-cleaning shirt × 3",
    "Golf (External)": "Golf (External)",
    "DaLat Palace GC · 10:30 T/Off · 2 pax": "DaLat Palace GC · 10:30 T/Off · 2 pax",
    "Revenue Amount": "Revenue Amount",
    "Share": "Share",
    "Monthly Room Statistics": "Monthly Room Statistics",
    "Weekly Room Statistics": "Weekly Room Statistics",
    "Active Rooms": "Active Rooms",
    "Occupancy Rate": "Occupancy Rate",
    "This Week": "This Week",
    "Last Week": "Last Week",
    "vs Last Week": "vs Last Week",
    "System / Booking": "System / Booking"
});

Object.assign(window.translations.ko, {
    "staff.list.title": "직원 목록",
    "staff.list.description": "직원 계정과 역할, 상태를 확인하거나 등록 및 수정하세요.",
    "staff.action.permissions": "권한 설정",
    "staff.action.add": "직원 등록"
});

Object.assign(window.translations.en, {
    "staff.list.title": "Staff List",
    "staff.list.description": "View, register, or edit staff accounts, roles, and status.",
    "staff.action.permissions": "Permissions",
    "staff.action.add": "Add Staff"
});

Object.assign(window.translations.ko, {
    "folio.filter.hasOutstanding": "미수금 있음"
});

Object.assign(window.translations.en, {
    "folio.filter.hasOutstanding": "Outstanding"
});

Object.assign(window.translations.ko, {
    "단체 관리": "단체 관리",
    "행사 목록": "행사 목록",
    "상세": "상세",
    "개요": "개요",
    "객실 배정": "객실 배정",
    "투숙객 명단": "투숙객 명단",
    "정산": "정산",
    "변경 이력": "변경 이력",
    "신규 작성": "신규 작성",
    "배정 호실": "배정 호실",
    "객실 일정": "객실 일정",
    "총 인원": "총 인원",
    "등록 투숙객": "등록 투숙객",
    "여권/신분증 확인": "여권/신분증 확인",
    "{count} rooms": "{count}실",
    "{count} people": "{count}명",
    "행사 기본 정보": "행사 기본 정보",
    "행사명": "행사명",
    "예: Samsung Tech Conference 2026": "예: Samsung Tech Conference 2026",
    "등록 단체": "등록 단체",
    "등록 단체를 선택하세요": "등록 단체를 선택하세요",
    "등록된 단체가 없습니다": "등록된 단체가 없습니다",
    "등록된 단체가 없습니다.": "등록된 단체가 없습니다.",
    "행사 목적(선택)": "행사 목적(선택)",
    "체크인": "체크인",
    "체크아웃": "체크아웃",
    "행사 적용 할인율(%)": "행사 적용 할인율(%)",
    "상태": "상태",
    "정산 방식": "정산 방식",
    "행사 연락 담당자/연락처": "행사 연락 담당자/연락처",
    "예: 홍길동 / 010-1234-5678": "예: 홍길동 / 010-1234-5678",
    "특이사항 / 메모": "특이사항 / 메모",
    "단체 등록/관리": "단체 등록/관리",
    "행사 저장": "행사 저장",
    "등록 단체 유형": "등록 단체 유형",
    "단체 기준 할인": "단체 기준 할인",
    "기본 정산 방식(참고)": "기본 정산 방식(참고)",
    "대표/연락처": "대표/연락처",
    "단체를 검색하거나 신규 단체 등록으로 바로 추가해 주세요.": "단체를 검색하거나 신규 단체 등록으로 바로 추가해 주세요.",
    "단체를 검색하거나 신규 단체 등록으로 바로 추가해 주세요. 행사 저장은 등록 단체가 선택된 뒤 가능합니다.": "단체를 검색하거나 신규 단체 등록으로 바로 추가해 주세요. 행사 저장은 등록 단체가 선택된 뒤 가능합니다.",
    "단체명, 담당자, 연락처 검색": "단체명, 담당자, 연락처 검색",
    "신규 단체": "신규 단체",
    "다시 선택": "다시 선택",
    "할인": "할인",
    "연락처 미등록": "연락처 미등록",
    "일치하는 단체가 없습니다.": "일치하는 단체가 없습니다.",
    "단체": "단체",
    "확정": "확정",
    "대기": "대기",
    "투숙 중": "투숙 중",
    "체크아웃": "체크아웃",
    "기업 단체": "기업 단체",
    "여행사 단체": "여행사 단체",
    "일반인 대표": "일반인 대표",
    "정부/공공기관": "정부/공공기관",
    "기타 단체": "기타 단체",
    "단체 일괄 정산": "단체 일괄 정산",
    "단체 일괄 후불 정산": "단체 일괄 후불 정산",
    "단체 후불": "단체 후불",
    "법인카드 정산": "법인카드 정산",
    "프런트 선결제": "프런트 선결제",
    "현장 개별 결제": "현장 개별 결제",
    "가상계좌 선입금": "가상계좌 선입금",
    "개별 결제": "개별 결제",
    "개별 정산": "개별 정산",
    "혼합 정산": "혼합 정산",
    "기업 행사 / 컨퍼런스": "기업 행사 / 컨퍼런스",
    "일반인 단체": "일반인 단체",
    "웨딩 / 연회": "웨딩 / 연회",
    "스포츠팀": "스포츠팀",
    "기타": "기타",
    "행사명을 입력해주세요.": "행사명을 입력해주세요.",
    "등록 단체를 선택해야 행사를 저장할 수 있습니다.": "등록 단체를 선택해야 행사를 저장할 수 있습니다.",
    "체크인 날짜를 선택해 주세요.": "체크인 날짜를 선택해 주세요.",
    "체크아웃 날짜를 선택해 주세요.": "체크아웃 날짜를 선택해 주세요.",
    "체크아웃 날짜는 체크인 이후여야 합니다.": "체크아웃 날짜는 체크인 이후여야 합니다.",
    "총 인원을 1명 이상 입력해 주세요.": "총 인원을 1명 이상 입력해 주세요.",
    "객실 할인율은 0~100 사이로 입력해 주세요.": "객실 할인율은 0~100 사이로 입력해 주세요.",
    "행사가 생성되었습니다. 이제 객실을 배정하세요.": "행사가 생성되었습니다. 이제 객실을 배정하세요.",
    "행사 정보가 저장되었습니다.": "행사 정보가 저장되었습니다.",
    "신규 단체 관리": "신규 단체 관리",
    "신규 단체 등록": "신규 단체 등록",
    "일반 기업": "일반 기업",
    "여행사": "여행사",
    "계약 활성": "계약 활성",
    "목록으로": "목록으로",
    "행사 목적": "행사 목적",
    "없음": "없음",
    "객실/투숙객 배정": "객실/투숙객 배정",
    "객실 배정이 저장되었습니다.": "객실 배정이 저장되었습니다.",
    "객실": "객실",
    "투숙객": "투숙객",
    "관리": "관리",
    "메모": "메모",
    "이름": "이름",
    "대표": "대표",
    "동반": "동반",
    "정산 완료": "정산 완료",
    "항목": "항목",
    "금액": "금액",
    "합계": "합계",
    "일시": "일시",
    "건": "건",
    "호실": "호실",
    "타입": "타입",
    "요금": "요금",
    "기준 단가": "기준 단가",
    "할인율": "할인율",
    "할인율(%)": "할인율(%)",
    "최종 단가": "최종 단가",
    "대표 투숙객": "대표 투숙객",
    "투숙객 수정": "투숙객 수정",
    "투숙객 등록": "투숙객 등록",
    "투숙객 편집": "투숙객 편집",
    "대표로 설정": "대표로 설정",
    "등록된 투숙객 없음": "등록된 투숙객 없음",
    "등록됨": "등록됨",
    "미등록": "미등록",
    "배정된 호실이 없습니다.": "배정된 호실이 없습니다.",
    "{current}/{total} guests registered": "{current}/{total}명 등록",
    "투숙객 추가": "투숙객 추가",
    "구분": "구분",
    "국적": "국적",
    "여권/신분증": "여권/신분증",
    "투숙 구분": "투숙 구분",
    "동반 투숙객": "동반 투숙객",
    "특이사항 / 알러지": "특이사항 / 알러지",
    "예: 땅콩 알러지, 고층 선호, 늦은 도착": "예: 땅콩 알러지, 고층 선호, 늦은 도착",
    "확인 완료": "확인 완료",
    "미확인": "미확인",
    "삭제": "삭제",
    "등록된 투숙객이 없습니다. 엑셀 업로드/일괄 등록은 다음 단계에서 붙일 수 있습니다.": "등록된 투숙객이 없습니다. 엑셀 업로드/일괄 등록은 다음 단계에서 붙일 수 있습니다.",
    "전표 반영": "전표 반영",
    "미정산": "미정산",
    "정산 요약": "정산 요약",
    "숙박 일수": "숙박 일수",
    "{count} nights": "{count}박",
    "업체": "업체",
    "총 정산 예정": "총 정산 예정",
    "연결": "연결",
    "수량/일수": "수량/일수",
    "정산 항목이 없습니다.": "정산 항목이 없습니다.",
    "통합 정산에서 보기": "통합 정산에서 보기",
    "통합 명세서": "통합 명세서",
    "항목별 명세서": "항목별 명세서",
    "작업": "작업",
    "아직 기록된 변경 이력이 없습니다.": "아직 기록된 변경 이력이 없습니다.",
    "주관 단체": "주관 단체",
    "단체명 입력": "단체명 입력",
    "기본 정보 저장": "기본 정보 저장",
    "단체/행사를 찾을 수 없습니다.": "단체/행사를 찾을 수 없습니다.",
    "단체명을 입력해 주세요.": "단체명을 입력해 주세요.",
    "연락처는 숫자 기준 7~15자리로 입력해 주세요.": "연락처는 숫자 기준 7~15자리로 입력해 주세요.",
    "신규 단체가 등록되고 선택되었습니다.": "신규 단체가 등록되고 선택되었습니다.",
    "배정된 객실이 없습니다.": "배정된 객실이 없습니다.",
    "객실과 행사별 요금 변경사항을 저장합니다.": "객실과 행사별 요금 변경사항을 저장합니다.",
    "객실 배정 저장": "객실 배정 저장",
    "기본 정보를 저장하면 객실 배정을 시작할 수 있습니다.": "기본 정보를 저장하면 객실 배정을 시작할 수 있습니다.",
    "배정 {count}실 · 행사 할인 {discount}% · 객실과 요금만 관리합니다.": "배정 {count}실 · 행사 할인 {discount}% · 객실과 요금만 관리합니다.",
    "호실 추가": "호실 추가",
    "단체명": "단체명",
    "대표 유형": "대표 유형",
    "계약 비활성": "계약 비활성",
    "대표/담당자 이름": "대표/담당자 이름",
    "연락처": "연락처",
    "기본 객실 할인율 (%)": "기본 객실 할인율 (%)",
    "취소": "취소",
    "저장": "저장",
    "예: 삼성전자 워크숍, 김대리 단체": "예: 삼성전자 워크숍, 김대리 단체",
    "예: 김대리": "예: 김대리",
    "예: 010-1234-5678": "예: 010-1234-5678",
    "예: 15": "예: 15",
    "추가 계약사항 등": "추가 계약사항 등",
    "투숙객 명단에서 관리": "투숙객 명단에서 관리",
    "기본 정보를 저장한 뒤 투숙객 명단을 등록할 수 있습니다.": "기본 정보를 저장한 뒤 투숙객 명단을 등록할 수 있습니다.",
    "미배정 투숙객": "미배정 투숙객",
    "객실별로 대표/동반 투숙객을 바로 등록합니다 · 전체 {current}/{total}명": "객실별로 대표/동반 투숙객을 바로 등록합니다 · 전체 {current}/{total}명",
    "배정 객실": "배정 객실",
    "신분증 미확인": "신분증 미확인",
    "등록": "등록",
    "대표 등록": "대표 등록",
    "대표 미등록": "대표 미등록",
    "대표 수정": "대표 수정",
    "동반 추가": "동반 추가",
    "배정된 객실이 없습니다. 객실 배정 탭에서 객실을 먼저 배정하세요.": "배정된 객실이 없습니다. 객실 배정 탭에서 객실을 먼저 배정하세요.",
    "대표/동반 변경은 예약 데이터와 함께 동기화됩니다.": "대표/동반 변경은 예약 데이터와 함께 동기화됩니다.",
    "객실 배정으로 이동": "객실 배정으로 이동",
    "투숙객 정보 수정": "투숙객 정보 수정",
    "호실을 선택하세요.": "호실을 선택하세요.",
    "투숙객 이름을 입력하거나 기존 고객을 선택하세요.": "투숙객 이름을 입력하거나 기존 고객을 선택하세요.",
    "연락처는 숫자와 +, -, 괄호만 입력해 주세요.": "연락처는 숫자와 +, -, 괄호만 입력해 주세요.",
    "투숙객 고객 등록에 실패했습니다. 다시 시도해주세요.": "투숙객 고객 등록에 실패했습니다. 다시 시도해주세요.",
    "명": "명",
    "실": "실",
    "객실 미정": "객실 미정",
    "호실 선택": "호실 선택",
    "신분증": "신분증",
    "대표 투숙객 수정": "대표 투숙객 수정",
    "대표 투숙객 등록": "대표 투숙객 등록",
    "동반 투숙객 수정": "동반 투숙객 수정",
    "동반 투숙객 등록": "동반 투숙객 등록",
    "객실 배정 수정": "객실 배정 수정",
    "대표 투숙객 변경": "대표 투숙객 변경",
    "투숙객 삭제": "투숙객 삭제",
    "투숙객 정보가 수정되었습니다.": "투숙객 정보가 수정되었습니다.",
    "투숙객이 등록되었습니다.": "투숙객이 등록되었습니다.",
    "객실 배정 수정은 변경 이력에 남습니다.": "객실 배정 수정은 변경 이력에 남습니다."
});

Object.assign(window.translations.en, {
    "단체 관리": "Groups",
    "행사 목록": "Group Events",
    "상세": "Detail",
    "개요": "Overview",
    "객실 배정": "Room Assignment",
    "투숙객 명단": "Guest List",
    "정산": "Settlement",
    "변경 이력": "Change History",
    "신규 작성": "New Draft",
    "배정 호실": "Assigned Rooms",
    "객실 일정": "Room Schedule",
    "총 인원": "Total Guests",
    "등록 투숙객": "Registered Guests",
    "여권/신분증 확인": "Passport/ID Verified",
    "{count} rooms": "{count} rooms",
    "{count} people": "{count} people",
    "행사 기본 정보": "Event Basic Information",
    "행사명": "Event Name",
    "예: Samsung Tech Conference 2026": "e.g. Samsung Tech Conference 2026",
    "등록 단체": "Registered Group",
    "등록 단체를 선택하세요": "Select a registered group",
    "등록된 단체가 없습니다": "No registered groups",
    "등록된 단체가 없습니다.": "No registered groups.",
    "행사 목적(선택)": "Event Purpose (Optional)",
    "체크인": "Check-in",
    "체크아웃": "Check-out",
    "행사 적용 할인율(%)": "Event Discount (%)",
    "상태": "Status",
    "정산 방식": "Settlement Method",
    "행사 연락 담당자/연락처": "Event Contact",
    "예: 홍길동 / 010-1234-5678": "e.g. Sarah Connor / +63 900 000 0000",
    "특이사항 / 메모": "Notes / Memo",
    "단체 등록/관리": "Group Register/Management",
    "행사 저장": "Save Event",
    "등록 단체 유형": "Registered Group Type",
    "단체 기준 할인": "Group Discount",
    "기본 정산 방식(참고)": "Default Settlement Method",
    "대표/연락처": "Representative / Contact",
    "단체를 검색하거나 신규 단체 등록으로 바로 추가해 주세요.": "Search for a group or add a new group directly.",
    "단체를 검색하거나 신규 단체 등록으로 바로 추가해 주세요. 행사 저장은 등록 단체가 선택된 뒤 가능합니다.": "Search for a group or add a new group directly. The event can be saved after a registered group is selected.",
    "단체명, 담당자, 연락처 검색": "Search group, contact, or phone",
    "신규 단체": "New Group",
    "다시 선택": "Select Again",
    "할인": "Discount",
    "연락처 미등록": "No contact",
    "일치하는 단체가 없습니다.": "No matching groups.",
    "단체": "Group",
    "확정": "Confirmed",
    "대기": "Pending",
    "투숙 중": "In-house",
    "체크아웃": "Checked Out",
    "기업 단체": "Corporate Group",
    "여행사 단체": "Travel Agency Group",
    "일반인 대표": "Individual Representative",
    "정부/공공기관": "Government/Public",
    "기타 단체": "Other Group",
    "단체 일괄 정산": "Group Batch Settlement",
    "단체 일괄 후불 정산": "Group Postpaid Batch Settlement",
    "단체 후불": "Group Postpaid",
    "법인카드 정산": "Corporate Card",
    "프런트 선결제": "Front Desk Prepaid",
    "현장 개별 결제": "On-site Individual Payment",
    "가상계좌 선입금": "Virtual Account Prepayment",
    "개별 결제": "Individual Payment",
    "개별 정산": "Individual Settlement",
    "혼합 정산": "Mixed Settlement",
    "기업 행사 / 컨퍼런스": "Corporate Event / Conference",
    "일반인 단체": "Private Group",
    "웨딩 / 연회": "Wedding / Banquet",
    "스포츠팀": "Sports Team",
    "기타": "Other",
    "행사명을 입력해주세요.": "Enter an event name.",
    "등록 단체를 선택해야 행사를 저장할 수 있습니다.": "Select a registered group before saving the event.",
    "체크인 날짜를 선택해 주세요.": "Select a check-in date.",
    "체크아웃 날짜를 선택해 주세요.": "Select a check-out date.",
    "체크아웃 날짜는 체크인 이후여야 합니다.": "Check-out date must be after check-in.",
    "총 인원을 1명 이상 입력해 주세요.": "Enter at least 1 guest.",
    "객실 할인율은 0~100 사이로 입력해 주세요.": "Room discount must be between 0 and 100.",
    "행사가 생성되었습니다. 이제 객실을 배정하세요.": "Event created. Assign rooms next.",
    "행사 정보가 저장되었습니다.": "Event information saved.",
    "신규 단체 관리": "New Group Event",
    "신규 단체 등록": "Register New Group",
    "일반 기업": "General Company",
    "여행사": "Travel Agency",
    "계약 활성": "Contract Active",
    "목록으로": "Back to List",
    "행사 목적": "Event Purpose",
    "없음": "None",
    "객실/투숙객 배정": "Room / Guest Assignment",
    "객실 배정이 저장되었습니다.": "Room assignment has been saved.",
    "객실": "Room",
    "투숙객": "Guest",
    "관리": "Manage",
    "메모": "Memo",
    "이름": "Name",
    "대표": "Primary",
    "동반": "Companion",
    "정산 완료": "Settled",
    "항목": "Item",
    "금액": "Amount",
    "합계": "Total",
    "일시": "Date/Time",
    "건": "items",
    "호실": "Room",
    "타입": "Type",
    "요금": "Rate",
    "기준 단가": "Base Rate",
    "할인율": "Discount",
    "할인율(%)": "Discount (%)",
    "최종 단가": "Final Rate",
    "대표 투숙객": "Primary Guest",
    "투숙객 수정": "Edit Guest",
    "투숙객 등록": "Register Guest",
    "투숙객 편집": "Edit Guest",
    "대표로 설정": "Set as Primary",
    "등록된 투숙객 없음": "No registered guests",
    "등록됨": "Registered",
    "미등록": "Not Registered",
    "배정된 호실이 없습니다.": "No rooms assigned.",
    "{current}/{total} guests registered": "{current}/{total} guests registered",
    "투숙객 추가": "Add Guest",
    "구분": "Type",
    "국적": "Nationality",
    "여권/신분증": "Passport/ID",
    "투숙 구분": "Stay Type",
    "동반 투숙객": "Companion Guest",
    "특이사항 / 알러지": "Notes / Allergies",
    "예: 땅콩 알러지, 고층 선호, 늦은 도착": "e.g. peanut allergy, high floor preference, late arrival",
    "확인 완료": "Verified",
    "미확인": "Unverified",
    "삭제": "Delete",
    "등록된 투숙객이 없습니다. 엑셀 업로드/일괄 등록은 다음 단계에서 붙일 수 있습니다.": "No guests registered yet. Excel upload or bulk registration can be added later.",
    "전표 반영": "Posted",
    "미정산": "Unsettled",
    "정산 요약": "Settlement Summary",
    "숙박 일수": "Nights",
    "{count} nights": "{count} nights",
    "업체": "Company",
    "총 정산 예정": "Estimated Total Settlement",
    "연결": "Linked To",
    "수량/일수": "Qty / Nights",
    "정산 항목이 없습니다.": "No settlement items.",
    "통합 정산에서 보기": "Open in Folio & Billing",
    "통합 명세서": "Consolidated Statement",
    "항목별 명세서": "Itemized Statement",
    "작업": "Action",
    "아직 기록된 변경 이력이 없습니다.": "No change history yet.",
    "주관 단체": "Host Group",
    "단체명 입력": "Enter group name",
    "기본 정보 저장": "Save Basic Info",
    "단체/행사를 찾을 수 없습니다.": "Group/event not found.",
    "단체명을 입력해 주세요.": "Please enter the group name.",
    "연락처는 숫자 기준 7~15자리로 입력해 주세요.": "Enter a phone number with 7 to 15 digits.",
    "신규 단체가 등록되고 선택되었습니다.": "The new group was registered and selected.",
    "배정된 객실이 없습니다.": "No rooms assigned.",
    "객실과 행사별 요금 변경사항을 저장합니다.": "Save room and event rate changes.",
    "객실 배정 저장": "Save Room Assignment",
    "기본 정보를 저장하면 객실 배정을 시작할 수 있습니다.": "Save the basic information to start room assignment.",
    "배정 {count}실 · 행사 할인 {discount}% · 객실과 요금만 관리합니다.": "{count} rooms assigned · event discount {discount}% · rooms and rates only.",
    "호실 추가": "Add Room",
    "단체명": "Group Name",
    "대표 유형": "Primary Type",
    "계약 비활성": "Contract Inactive",
    "대표/담당자 이름": "Primary/Contact Name",
    "연락처": "Contact",
    "기본 객실 할인율 (%)": "Default Room Discount (%)",
    "취소": "Cancel",
    "저장": "Save",
    "예: 삼성전자 워크숍, 김대리 단체": "e.g. Samsung workshop, Kim group",
    "예: 김대리": "e.g. Kim",
    "예: 010-1234-5678": "e.g. 010-1234-5678",
    "예: 15": "e.g. 15",
    "추가 계약사항 등": "Additional contract notes",
    "투숙객 명단에서 관리": "Manage in Guest List",
    "기본 정보를 저장한 뒤 투숙객 명단을 등록할 수 있습니다.": "Save the basic information before registering the guest list.",
    "미배정 투숙객": "Unassigned Guests",
    "객실별로 대표/동반 투숙객을 바로 등록합니다 · 전체 {current}/{total}명": "Register primary/companion guests by room · total {current}/{total} guests",
    "배정 객실": "Assigned Rooms",
    "신분증 미확인": "ID Unverified",
    "등록": "Registered",
    "대표 등록": "Primary Registered",
    "대표 미등록": "No Primary Guest",
    "대표 수정": "Edit Primary",
    "동반 추가": "Add Companion",
    "배정된 객실이 없습니다. 객실 배정 탭에서 객실을 먼저 배정하세요.": "No rooms assigned. Assign rooms in the Room Assignment tab first.",
    "대표/동반 변경은 예약 데이터와 함께 동기화됩니다.": "Primary/companion changes are synced with reservation data.",
    "객실 배정으로 이동": "Go to Room Assignment",
    "투숙객 정보 수정": "Edit Guest Info",
    "호실을 선택하세요.": "Please select a room.",
    "투숙객 이름을 입력하거나 기존 고객을 선택하세요.": "Enter a guest name or select an existing guest.",
    "연락처는 숫자와 +, -, 괄호만 입력해 주세요.": "Contact can contain only numbers, +, -, and parentheses.",
    "투숙객 고객 등록에 실패했습니다. 다시 시도해주세요.": "Guest registration failed. Please try again.",
    "명": " guests",
    "실": " rooms",
    "객실 미정": "Room TBD",
    "호실 선택": "Select room",
    "신분증": "ID",
    "대표 투숙객 수정": "Edit Primary Guest",
    "대표 투숙객 등록": "Register Primary Guest",
    "동반 투숙객 수정": "Edit Companion Guest",
    "동반 투숙객 등록": "Register Companion Guest",
    "객실 배정 수정": "Edit Room Assignment",
    "대표 투숙객 변경": "Change Primary Guest",
    "투숙객 삭제": "Delete Guest",
    "투숙객 정보가 수정되었습니다.": "Guest information was updated.",
    "투숙객이 등록되었습니다.": "Guest was registered.",
    "객실 배정 수정은 변경 이력에 남습니다.": "Room assignment changes are recorded in change history."
});

Object.assign(window.translations.ko, {
    "Placard": "플랫카드",
    "Placard Print": "플랫카드 인쇄",
    "Placard Preview": "플랫카드 미리보기",
    "Flight": "항공편",
    "Print": "인쇄",
    "placard.flight.placeholder": "예: 대한항공 KE641",
    "placard.flight.help": "입력하는 즉시 위 미리보기에 반영됩니다. 저장을 누르면 예약 데이터에 저장됩니다.",
    "placard.preview.unsaved": "미리보기 반영됨 · 저장 전",
    "placard.saved.state": "저장 완료 · 예약 데이터 저장됨",
    "placard.flight.saved.toast": "플랫카드 항공편이 저장되었습니다.",
    "placard.flight.empty": "항공편 미입력",
    "placard.guest.extra": "{name} 외 {count}명"
});

Object.assign(window.translations.en, {
    "Placard": "Placard",
    "Placard Print": "Print Placard",
    "Placard Preview": "Placard Preview",
    "Flight": "Flight",
    "Print": "Print",
    "placard.flight.placeholder": "e.g. Korean Air KE641",
    "placard.flight.help": "Typing updates the preview immediately. Click Save to store it in the booking data.",
    "placard.preview.unsaved": "Preview updated · not saved",
    "placard.saved.state": "Saved · booking data updated",
    "placard.flight.saved.toast": "Placard flight information has been saved.",
    "placard.flight.empty": "Flight not entered",
    "placard.guest.extra": "{name} + {count} guest(s)"
});
