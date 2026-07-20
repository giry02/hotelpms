// i18n.js - Global Translation Dictionary (English Base)

window.currentLang = localStorage.getItem('pms_admin_lang') || localStorage.getItem('pms_lang') || 'ko';
window.PMS_I18N_NAMESPACE = window.PMS_I18N_NAMESPACE || 'admin';
window.PMS_CURRENCY_META = window.PMS_CURRENCY_META || {
    PHP: { symbol: '₱', locale: 'en-PH' },
    VND: { symbol: '₫', locale: 'vi-VN' },
    USD: { symbol: '$', locale: 'en-US' },
    KRW: { symbol: '₩', locale: 'ko-KR' },
    THB: { symbol: '฿', locale: 'th-TH' },
    JPY: { symbol: '¥', locale: 'ja-JP' }
};
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
        .replace(/특별단가\s*\(\s*USD\s*\)/g, `특별단가(${currency})`);
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
        "Main": "메인",
        "Tenant Mgmt": "테넌트 관리",
        "Ad Network": "광고 네트워크",
        "System": "시스템 관리",
        "Platform Status": "플랫폼 상태",
        "Hotel List": "호텔 목록",
        "New Registration": "신규 등록",
        "Campaigns": "광고 캠페인",
        "New Campaign": "신규 캠페인",
        "Ad Billing": "광고 정산",
        "Admin Accounts": "관리자 계정",
        "Subscription & Billing": "구독 및 결제",
        "Customer Support": "고객 지원",
        "Notice Mgmt": "공지사항 관리",
        "Audit Logs": "감사 로그",

    "Dashboard": "대시보드",
    "Super Admin": "수퍼 어드민",
    "Tenants": "테넌트 관리",
    "Hotel List": "호텔 목록",
    "Register Hotel": "호텔 등록",
    "System": "시스템 관리",
    "Billing": "결제 및 과금",
    "Audit Logs": "감사 로그",
    "Users & Roles": "사용자 및 권한",
    "Notices": "공지사항",
    "Helpdesk": "고객지원",
    "Ad Network": "광고 네트워크",
    "Targeting": "타겟팅 설정",
    "Campaigns": "캠페인 관리",
    "New Ad": "새 광고 등록",
    "Set default rates for weekdays, weekends, and holidays.": "객실 유형별 평일(일~목), 주말(금, 토), 공휴일의 기본 요금을 설정합니다.",
    "Set automatic discount rates (%) applied during booking based on guest tier.": "고객 등급에 따라 예약 시 자동으로 적용될 할인율(%)을 지정합니다.",
    "Allow Overbooking": "오버부킹 (Overbooking) 허용",
    "Rates Calendar": "요금 캘린더 (Rates)",
    "Hotel Description (Multi)": "호텔 소개 (다국어 지원)",
    "Require Deposit (Pre-auth)": "디파짓(보증금) 필수 청구",
    "Folio & Billing": "통합 정산 (Folio)",
    "Auto VIP Discounts": "VIP 자동 할인율 설정",
    "Vacant": "공실 (Vacant)",
    "New Diamond": "신규 Diamond",
    "Export Transactions": "결제 내역 다운로드",
    "VIP Discounts": "VIP 할인율 설정",
    "OOS": "점검 중 (OOS)",
    "Default Check-out": "기본 체크아웃 시간",
    "Staff & Roles": "직원 및 권한 관리",
    "Avg. Spend/Guest": "고객당 평균 지출",
    "Paid (Deposit)": "결제액 (보증금)",
    "Default Check-in": "기본 체크인 시간",
    "Ancillary Svcs": "부가서비스 관리",
    "Recent Tier Changes": "최근 등급 변동",
    "Late Check-out": "레이트 체크아웃",
    "Room Upgrade": "객실 업그레이드",
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
    "VIP Members": "VIP 멤버십",
    "Welcome Amenity": "환영 어메니티",
    "Point Earn Rate": "포인트 적립률",
    "Upgrades (Month)": "이번 달 승급",
    "Downgrades (Month)": "이번 달 강등",
    "Amount(USD)": "금액(USD)",
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
    "VIP Guests": "VIP 고객",
    "Tier Benefits": "등급별 혜택",
    "Early Check-in": "얼리 체크인",
    "Lounge Access": "라운지 이용",
    "Retention Rate": "등급 유지율",
    "VIP Guests": "VIP 투숙",
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
    "Download Excel": "엑셀 다운로드",
    "Add Guest": "고객 등록",
    "Visits": "방문 횟수",
    "Last Stay": "최근 투숙",
    "Room Discount": "객실 할인",
    "Free Breakfast": "무료 조식",
    "Airport Pickup": "공항 픽업",
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
    "Save": "저장"
    },
    en: {
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
    "Room Upgrade": "Room Upgrade",
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
    "Welcome Amenity": "Welcome Amenity",
    "Point Earn Rate": "Point Earn Rate",
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
    "Check-in/out": "Check-in/out",
    "Total Guests": "Total Guests",
    "VIP Guests": "VIP Guests",
    "Tier Benefits": "Tier Benefits",
    "Early Check-in": "Early Check-in",
    "Lounge Access": "Lounge Access",
    "Retention Rate": "Retention Rate",
    "VIP Guests": "VIP Guests",
    "Process Check-in": "Process Check-in",
    "Outstanding Bal": "Outstanding Bal",
    "All Services": "All Services",
    "Spa & Massage": "Spa & Massage",
    "Rates Calendar": "Rates Calendar",
    "Main Email": "Main Email",
    "Booking List": "Booking List",
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
    "Room Discount": "Room Discount",
    "Free Breakfast": "Free Breakfast",
    "Airport Pickup": "Airport Pickup",
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
    "Save": "Save"
    }
};

function setupI18n() {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let n;
    const t = [];
    while(n = w.nextNode()) {
        const o = n.nodeValue, x = o.trim();
        const parentTag = n.parentElement?.tagName;
        if (parentTag === 'OPTION' || parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'TEXTAREA') continue;
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
    localStorage.setItem('pms_admin_lang', l);
    document.documentElement.lang = l;
    const d = window.translations[l] || window.translations.en;
    const catalog = (window.PMS_I18N_CATALOG && window.PMS_I18N_CATALOG[window.PMS_I18N_NAMESPACE]) || {};
    const catalogDict = catalog[l] || catalog.en || {};
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
    });

    applyKoEnDatasetI18n(l);
    
    const langSelects = document.querySelectorAll('#langSelect, .lang-select, select[onchange*="changeLang"]');
    langSelects.forEach(sel => {
        const koreanOption = sel.querySelector('option[value="ko"]');
        if (koreanOption) koreanOption.textContent = l === 'en' ? 'KR Korean' : 'KR 한국어';
        const englishOption = sel.querySelector('option[value="en"]');
        if (englishOption) englishOption.textContent = 'EN English';
        if(sel.value !== l) sel.value = l;
    });

    if(typeof window.applyLocalI18n === 'function') window.applyLocalI18n(l);
    applyVisibleTextI18nFallback(l, catalog);
    window.dispatchEvent(new Event('languagechange'));
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
        'PMS 운영 적용 현황': 'PMS Operations Coverage',
        '호텔별 확인': 'View by Hotel',
        '정산/마감 운영': 'Settlement / Closing Operations',
        '정산 목록은 운영자 상세와 고객용 명세서를 분리하고, 일일 마감은 시재 등록을 버튼 기반 흐름으로 정리했습니다.': 'The settlement list separates operator detail from guest statements, and daily closing uses a button-based cash-count flow.',
        '정산 상세': 'Settlement Detail',
        '고객용 명세서': 'Guest Statement',
        '예치금/미수금': 'Deposit / Outstanding Balance',
        '시재 등록 팝업': 'Cash Count Modal',
        '개인정보/감사 로그': 'Privacy / Audit Logs',
        '연락처 등 개인정보 상세 열람과 엑셀 다운로드 이력을 감사 로그로 남기는 기준을 반영했습니다.': 'Detailed personal data views and Excel downloads are captured in audit logs.',
        '상세 열람 로그': 'Detail View Logs',
        '다운로드 로그': 'Download Logs',
        '관리자 전용 조회': 'Admin-only Access',
        '제휴 광고/추천': 'Partner Ads / Recommendations',
        '연동 준비': 'Integration Ready',
        '골프장과 렌터카는 입점 업체를 호텔에 추천하고, 선택된 업체는 예약 화면에서 고정되는 구조로 정리했습니다.': 'Golf and rent-a-car partners can be recommended to hotels, and selected partners are fixed in the booking flow.',
        '골프장 추천': 'Golf Recommendation',
        '렌터카 추천': 'Rent-a-car Recommendation',
        '운영 적용': 'Applied',
        '적용 현황을 불러오는 중입니다.': 'Loading coverage status.',
        '서비스 영역': 'Service Area',
        '노출 위치': 'Placement',
        '시작일': 'Start Date',
        '종료일': 'End Date',
        '사이공 골프 추천 배너': 'Saigon Golf Recommendation Banner',
        '공항 렌터카 제휴 추천': 'Airport Rent-a-car Partner Recommendation',
        '다낭 지역 행사 프로모션': 'Da Nang Local Event Promotion',
        '스파 패키지 객실 부가서비스': 'Spa Package Room Ancillary Service',
        '지역 이벤트': 'Local Event',
        '대시보드 배너 / 골프 예약 추천': 'Dashboard Banner / Golf Booking Recommendation',
        '대시보드 배너 / 렌터카 예약 추천': 'Dashboard Banner / Rent-a-car Booking Recommendation',
        '예약 연동': 'Booking Link',
        '호텔 사용자가 추천 업체에서 예약을 시작하면 예약 화면에서 해당 업체를 고정합니다.': 'When a hotel user starts from a recommended vendor, that vendor is fixed in the booking screen.',
        '업체 선택 고정': 'Vendor Selection Lock',
        '기본 표시 통화': 'Default Display Currency',
        '기본 표시 통화 *': 'Default Display Currency *',
        '승인 후 호텔 운영 화면의 기준 표시 통화로 고정되며 변경할 수 없습니다.': 'After approval, this is fixed as the display currency for hotel operations and cannot be changed.',
        '등록 후 호텔 운영 화면의 기준 표시 통화로 고정되며 호텔 설정에서 변경할 수 없습니다.': 'After registration, this is fixed as the display currency for hotel operations and cannot be changed in hotel settings.',
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
        '베트남': 'Vietnam',
        '한국': 'South Korea',
        '태국': 'Thailand',
        '일본': 'Japan',
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
        '비밀번호 초기화': 'Password Reset',
        '플랜 변경': 'Change Plan',
        '호텔명 *': 'Hotel Name *',
        '국가 *': 'Country *',
        '도시 *': 'City *',
        '기본 통화': 'Default Currency',
        '담당자 이름 *': 'Manager Name *',
        '로그인 이메일 *': 'Login Email *',
        '초기 비밀번호 *': 'Initial Password *',
        '비밀번호 확인 *': 'Confirm Password *',
        '신청 경로': 'Application Source',
        '요청 사항': 'Requests',
        '특이사항': 'Notes',
        '이미 계정이 있습니다': 'Already have an account'
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
    out = out.replace(/(\d+)층/g, 'Floor $1');
    out = out.replace(/(\d+)회/g, '$1 visits');
    out = out.replace(/(\d+)박/g, '$1N');
    out = out.replace(/(\d+)건/g, '$1 items');
    out = out.replace(/(\d+)개 권한/g, '$1 permissions');
    out = out.replace(/(\d+)개/g, '$1 items');
    out = out.replace(/\/\s*월/g, '/ mo');
    const phraseMap = {
        '대시보드 배너': 'Dashboard Banner',
        '테넌트 메뉴 정책': 'Tenant Menu Policy',
        '호텔별로 예약, 객실, 하우스키핑, 정산, 부가서비스, 감사 로그 메뉴 노출을 제어합니다.': 'Controls reservation, room, housekeeping, settlement, ancillary, and audit-log menu visibility by hotel.',
        '메뉴 활성화': 'Menu Activation',
        '하위 메뉴 제어': 'Submenu Control',
        '호텔별 정책': 'Hotel Policy',
        '골프장': 'Golf Course',
        '항공권 제휴 프로모션': 'Airline Ticket Partner Promotion',
        '외부 제휴': 'External Partner',
        '글로벌 호텔 리워드 제휴': 'Global Hotel Rewards Partnership',
        '통합 POS 추천': 'Unified POS Recommendation',
        '체크인/체크아웃 시간 및 취소 정책을 설정합니다.': 'Set check-in/check-out times and cancellation policies.',
        '관리 대상': 'Managed Items',
        '적용': 'Applied',
        '호텔 운영 Dashboard에서 사용하는 주요 기능이 이 테넌트에 적용되어 있는지 확인합니다. 실제 운영 처리 화면은 호텔 PMS에서 사용하고, Super Admin은 적용 범위와 정책을 관리합니다.': 'Check whether key hotel operation dashboard features are applied to this tenant. Operational processing is handled in Hotel PMS, while Super Admin manages coverage and policy.',
        '예약/체크인': 'Reservation / Check-in',
        '예약 타임라인, 예약 목록, 고객 상세 팝업, 체크인/체크아웃 처리를 같은 예약 흐름으로 연결합니다.': 'Connects reservation timeline, reservation list, guest detail modal, and check-in/check-out processing into one reservation flow.',
        '고객 상세': 'Guest Detail',
        '상태 변경': 'Status Change',
        '정산/마감': 'Settlement / Closing',
        '부가서비스': 'Ancillary Services',
        '감사 로그': 'Audit Logs',
        '객실/하우스키핑': 'Room / Housekeeping',
        '연동': 'Integration',
        '정책': 'Policy',
        '상세': 'Detail',
        '다운로드': 'Download',
        '노출 위치': 'Placement',
        '서비스 영역': 'Service Area',
        '호텔 운영 Dashboard에서 사용하는 주요 기능이 이 테넌트에 Applied되어 있는지 확인합니다. 실제 운영 처리 화면은 호텔 PMS에서 사용하고, Super Admin은 Applied 범위와 Policy을 관리합니다.': 'Checks whether key Hotel PMS dashboard capabilities are applied to this tenant. Actual operations are handled in Hotel PMS, while Super Admin manages the applied scope and policy.',
        '체크아웃 기준 정산, 예치금, 미수금, 고객용 명세서, 일일 마감 시재 등록을 관리합니다.': 'Manages checkout-based settlement, deposits, outstanding balances, guest statements, and daily closing cash-count registration.',
        '객실 유형, 요금 캘린더, 하우스키핑, 시설보수 티켓을 호텔 운영 기준으로 묶어 관리합니다.': 'Manages room types, rate calendar, housekeeping, and maintenance tickets by hotel operation standards.',
        '예치금': 'Deposit',
        '미수금': 'Outstanding Balance',
        '시재 등록': 'Cash Count Registration',
        '객실/현장 운영': 'Room / On-site Operations',
        '객실 유형': 'Room Types',
        '요금 캘린더': 'Rate Calendar',
        '하우스키핑': 'Housekeeping',
        '청소 상태': 'Cleaning Status',
        '시설보수': 'Maintenance',
        '보수 티켓': 'Maintenance Ticket',
        '정산 목록': 'Settlement List',
        '고객용 명세서': 'Guest Statement',
        '일일 마감': 'Daily Closing',
        '정산 상세': 'Settlement Detail',
        '요금/결제': 'Rates / Payment',
        '요금 정책': 'Rate Policy',
        '호텔 설정': 'Hotel Settings',
        '직원 관리': 'Staff Management',
        '우수 고객 멤버십': 'Preferred Guest Membership',
        '블랙리스트': 'Blacklist',
        '등급과 혜택 관리': 'Tier and Benefit Management',
        '고객 상세와': 'Guest Details and',
        '관리': 'Management',
        '적용': 'Applied'
    };
    Object.entries(phraseMap).forEach(([ko, en]) => {
        out = out.replaceAll(ko, en);
    });
    const cleanupMap = {
        '입점 Golf Course과 렌터카 업체를 호텔 대시보드와 예약 화면에 추천 노출하는 기준입니다.': 'Defines how partnered golf courses and rent-a-car vendors are recommended on the hotel dashboard and reservation screens.',
        '배너 광고': 'Banner Ads',
        '예약 연결': 'Reservation Link',
        '투숙객 Detail, 등급 Management, 개인정보 Detail 열람, 엑셀 Download 로그를 Management자 권한으로 확인합니다.': 'Review guest details, tier management, personal-info detail access, and Excel download logs with manager permissions.',
        '투숙객 Detail': 'Guest Detail',
        '등급 Management': 'Tier Management',
        '열람 로그': 'Access Logs',
        '호텔별 Menu Activation': 'Hotel Menu Activation',
        '하위 Menu Control': 'Submenu Control',
        'Dashboard Banner': 'Dashboard Banner',
        '고객 Detail': 'Guest Detail',
        'Menu Activation': 'Menu Activation',
        'Policy': 'Policy',
        'Detail': 'Detail',
        'Download': 'Download'
    };
    Object.assign(cleanupMap, {
        '이 설정은 호텔/테넌트 단위 메뉴 노출 Policy입니다. 직원별 접근 범위는 호텔 PMS의 역할/권한 메뉴에서 별도로 Management됩니다.': 'This setting controls menu visibility by hotel/tenant. Staff-level access scope is managed separately in the Hotel PMS roles/permissions menu.',
        '운영 요약과 광고 영역': 'Operations Summary and Ad Area',
        '예약 Management': 'Reservation Management',
        '예약 운영 메뉴': 'Reservation Operations Menu',
        '예약 현황': 'Reservation Board',
        '객실 보드형 현황': 'Room Board View',
        '날짜별 예약 배치': 'Date-based Reservation Layout',
        '목록 조회와 처리': 'List Search and Processing',
        '프론트 처리 화면': 'Front Desk Processing Screen',
        '고객 정보와 멤버십': 'Guest Information and Membership',
        '단체 관리': 'Group Management',
        '단체/행사 운영': 'Group/Event Operations',
        '투숙객 관리': 'Guest CRM',
        '고객 상세와 블랙리스트': 'Guest Detail and Blacklist',
        '우수 고객 멤버십': 'Preferred Guest Membership',
        '등급과 혜택 관리': 'Tier and Benefit Management',
        '객실 관리': 'Room Management',
        '객실/현장 운영': 'Room / On-site Operations',
        '통합 정산': 'Folio & Billing',
        '정산/마감 운영': 'Settlement / Closing Operations',
        '부가서비스': 'Ancillary Services',
        '업체/바우처/주문': 'Vendor / Voucher / Order',
        '운영 로그': 'Operation Logs',
        '감사/마감 로그': 'Audit / Closing Logs',
        '호텔 설정': 'Hotel Settings',
        '요금/결제 설정': 'Rate / Payment Settings',
        '공지사항': 'Notices',
        '고객지원': 'Support'
    });
    Object.assign(cleanupMap, {
        'Guest Detail와 Blacklist': 'Guest Detail and Blacklist',
        '단체 Management': 'Group Management',
        '단체 예약과 업체': 'Group Reservations and Companies',
        '단체/행사 목록': 'Group/Event List',
        '단체 예약 Detail': 'Group Reservation Detail',
        '단체업체 Management': 'Group Company Management',
        '거래처와 계약 조건': 'Accounts and Contract Terms',
        '객실 목록과 요금': 'Room List and Rates',
        '객실 목록': 'Room List',
        '호실별 상태': 'Room Status by Room No.',
        '객실 타입 설정': 'Room Type Settings',
        '객실 요금 운영': 'Room Rate Operations',
        '객실 요금 달력': 'Room Rate Calendar',
        'Housekeeping': 'Housekeeping',
        'Cleaning 상태': 'Cleaning Status',
        'Maintenance Ticket': 'Maintenance Ticket',
        '부가서비스 업체': 'Ancillary Vendors',
        '바우처 양식': 'Voucher Template',
        '주문 등록': 'Order Registration',
        '마감 로그': 'Closing Log',
        '감사 로그': 'Audit Log',
        '직원 권한': 'Staff Permissions',
        '역할/권한': 'Roles / Permissions'
    });
    Object.assign(cleanupMap, {
        '청소 요청과 완료': 'Cleaning Requests and Completion',
        '시설 보수': 'Maintenance',
        '점검과 수리 Management': 'Inspection and Repair Management',
        '정산과 마감': 'Settlement and Closing',
        '부서별 매출': 'Revenue by Department',
        'Folio 및 명세서': 'Folios and Statements',
        '시재와 정산 마감': 'Cash Count and Settlement Closing',
        'POS, 골프, 렌터카': 'POS, Golf, Rent-a-car'
    });
    Object.assign(cleanupMap, {
        '통합 POS': 'Unified POS',
        '부가 주문 Management': 'Ancillary Order Management',
        '골프 예약': 'Golf Reservation',
        '제휴 Golf Course 예약': 'Partner Golf Course Reservation',
        '제휴 렌터카 예약': 'Partner Rent-a-car Reservation',
        '감사와 마감 내역': 'Audit and Closing History',
        '감사로그': 'Audit Log',
        '예약/정산 변경 이력': 'Reservation / Settlement Change History',
        '마감로그': 'Closing Log',
        '일자별 시재와 정산 내역': 'Daily Cash Count and Settlement History',
        '호텔 및 운영 설정': 'Hotel and Operations Settings',
        '호텔 기본 Policy': 'Hotel Base Policy'
    });
    Object.assign(cleanupMap, {
        '직원 목록': 'Staff List',
        '직원 계정': 'Staff Accounts',
        '권한 설정': 'Permission Settings',
        '역할별 접근 권한': 'Role-based Access Permissions',
        'Rates / Payment 설정': 'Rates / Payment Settings',
        '가입 통화와 결제 Policy': 'Signup Currency and Payment Policy',
        '호텔 공지 Management': 'Hotel Notice Management',
        '지원 요청 Management': 'Support Request Management',
        '활성 29 items / 비활성 7 items': 'Active 29 items / Inactive 7 items'
    });
    Object.entries(cleanupMap).forEach(([from, to]) => {
        out = out.replaceAll(from, to);
    });
    if (dayMap[out]) out = dayMap[out];
    return out;
}

function applyVisibleTextI18nFallback(lang, catalog) {
    if (lang !== 'en' || !document.body) return;
    const reverse = buildReverseI18nMap(catalog || {});
    const skipTags = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION']);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parent = node.parentElement;
            if (!parent || skipTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
            if (parent.closest('[data-no-auto-i18n], .user-input, .guest-name, .timeline-user-data')) return NodeFilter.FILTER_REJECT;
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
        const translated = reverse[trimmed] || ADMIN_RUNTIME_MESSAGE_FALLBACKS[trimmed] || translateKoreanPattern(trimmed);
        node.nodeValue = `${leading}${translated}${trailing}`;
    });
}

const ADMIN_RUNTIME_MESSAGE_FALLBACKS = {
    '광고 소재 수정 화면을 준비했습니다.': 'Ad creative edit screen is ready.',
    '캠페인이 등록되었습니다.': 'Campaign has been registered.',
    '타겟팅 설정이 저장되었습니다.': 'Targeting settings have been saved.',
    '타겟팅 규칙이 추가되었습니다.': 'Targeting rule has been added.',
    '등록된 이메일로 비밀번호 재설정 링크가 발송됩니다.': 'A password reset link will be sent to the registered email.',
    '프로모션 메일이 발송되었습니다!': 'Promotional email has been sent.',
    '안내 알림이 발송되었습니다.': 'Notification has been sent.',
    'API 설정을 엽니다.': 'Opening API settings.',
    '커스텀 연동 등록 화면을 준비했습니다.': 'Custom integration registration screen is ready.',
    'API 설정 화면을 엽니다.': 'Opening API settings screen.',
    'URL 입력:': 'Enter URL:',
    '이미지 업로드 창이 열립니다.': 'Opening image upload dialog.',
    '성공적으로 발행되었습니다.': 'Published successfully.',
    '임시 저장되었습니다.': 'Draft has been saved.',
    '신규 관리자 초대 메일을 발송하는 화면으로 연결됩니다.': 'Opening the new admin invitation email screen.',
    '입점 신청이 접수되었습니다.': 'Onboarding application has been submitted.',
    '사유를 입력해주세요.': 'Enter a reason.',
    '호텔 서비스가 정지되었습니다.': 'Hotel service has been suspended.',
    '호텔 관리자 이메일로 비밀번호 재설정 링크가 발송되었습니다.': 'A password reset link has been sent to the hotel admin email.',
    '등록 완료! Hotel ID가 발급되었습니다.': 'Registration complete. Hotel ID has been issued.'
};

function hasKoreanText(text) {
    return Array.from(String(text || '')).some(ch => ch.charCodeAt(0) >= 0xAC00 && ch.charCodeAt(0) <= 0xD7A3);
}

function translateAdminRuntimePattern(text) {
    let out = translateKoreanPattern(text);
    out = out.replace(/^(.+) 계정 편집 화면을 엽니다\.$/, 'Open edit screen for $1.');
    out = out.replace(/^(.+)로 비밀번호 재설정 링크가 발송되었습니다\.$/, 'Password reset link has been sent to $1.');
    out = out.replace(/^신청번호:\s*(.+)$/, 'Application No: $1');
    out = out.replace(/^심사 결과는\s*(.+)로 안내됩니다\.$/, 'Review result will be sent to $1.');
    return out;
}

function translateRuntimeLine(line, reverse) {
    const leading = line.match(/^\s*/)[0];
    const trailing = line.match(/\s*$/)[0];
    const trimmed = line.replace(/\s+/g, ' ').trim();
    const translated = reverse[trimmed] || ADMIN_RUNTIME_MESSAGE_FALLBACKS[trimmed] || translateAdminRuntimePattern(trimmed);
    return `${leading}${translated}${trailing}`;
}

function translateRuntimeMessageText(message) {
    if (message == null) return message;
    const lang = window.currentLang || localStorage.getItem('admin_lang') || localStorage.getItem('pms_lang') || 'ko';
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
    const nativeAlert = window.alert.bind(window);
    const nativeConfirm = window.confirm.bind(window);
    const nativePrompt = window.prompt.bind(window);
    window.alert = message => nativeAlert(translateRuntimeMessageText(message));
    window.confirm = message => nativeConfirm(translateRuntimeMessageText(message));
    window.prompt = (message, defaultValue) => nativePrompt(translateRuntimeMessageText(message), defaultValue);
}

installNativeDialogI18n();

function searchLabelText() {
    if (typeof window.t === 'function') {
        const translated = window.t('common.search');
        if (translated && translated !== 'common.search') return translated;
    }
    const lang = window.currentLang || localStorage.getItem('pms_lang') || 'ko';
    return lang === 'en' ? 'Search' : '검색';
}

function isSearchInput(input) {
    if (!input || input.dataset.pmsNoSearchButton === 'true') return false;
    if (input.tagName !== 'INPUT') return false;
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
        '이름, 이메일 검색...': 'Search name or email...',
        '이름, Contact, 이메일 검색...': 'Search name, contact, or email...',
        '고객명 검색...': 'Search guest name...',
        'Guest명 검색...': 'Search guest name...',
        '이름/호실 검색...': 'Search name or room...',
        '이름, Room번호, Booking # 검색...': 'Search name, room, or booking #...',
        '행사(블록)명 검색...': 'Search group/block name...',
        '업체명 검색...': 'Search company name...',
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
        'Search name or email...': '이름, 이메일 검색...',
        'Search name, contact, or email...': '이름, 연락처, 이메일 검색...',
        'Search guest name...': '고객명 검색...',
        'Search name or room...': '이름/객실번호 검색...',
        'Search name, room, or booking #...': '이름, 객실번호, 예약번호 검색...',
        'Search group/block name...': '행사/블록명 검색...',
        'Search company name...': '업체명 검색...',
        'Search room, guest, or folio...': '객실번호, 고객명, 정산번호 검색...',
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
    const lang = window.currentLang || localStorage.getItem('pms_lang') || 'ko';
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
        @media (max-width:768px){.pms-search-button{height:38px;min-width:82px}.search-container .pms-search-button{flex:0 0 auto}}
    `;
    document.head.appendChild(style);
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
        const anchor = input.closest('.search-box-mt, .search-box, .search-bar') || input;
        const existing = findNearbySearchButton(anchor);
        if (existing) {
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
    const lang = window.currentLang || localStorage.getItem('pms_lang') || 'ko';
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
    changeLang(window.currentLang);
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
        const nextLang = lang || window.currentLang || localStorage.getItem('pms_lang') || 'ko';
        window.currentLang = nextLang;
        localStorage.setItem('pms_lang', nextLang);
        localStorage.setItem('pms_admin_lang', nextLang);
        document.documentElement.lang = nextLang;
        const catalog = (window.PMS_I18N_CATALOG && window.PMS_I18N_CATALOG[window.PMS_I18N_NAMESPACE]) || {};
        applyVisibleTextI18nFallback(nextLang, catalog);
        window.dispatchEvent(new Event('languagechange'));
        return result;
    };
    window.changeLang.__pmsI18nGuard = true;
    const lang = localStorage.getItem('pms_admin_lang') || localStorage.getItem('pms_lang') || window.currentLang || 'ko';
    window.changeLang(lang);
    installI18nMutationObserver();
}

function installI18nMutationObserver() {
    if (window.__pmsI18nObserver || !document.body) return;
    let timer = null;
    window.__pmsI18nObserver = new MutationObserver(() => {
        const lang = window.currentLang || localStorage.getItem('pms_lang') || 'ko';
        if (lang !== 'en') return;
        clearTimeout(timer);
        timer = setTimeout(() => {
            const catalog = (window.PMS_I18N_CATALOG && window.PMS_I18N_CATALOG[window.PMS_I18N_NAMESPACE]) || {};
            applyVisibleTextI18nFallback('en', catalog);
        }, 80);
    });
    window.__pmsI18nObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
}

// --- Added Missing Sidebar Vocabulary ---
Object.assign(window.translations.ko, {
    "Main": "메인",
    "Front Desk": "프론트 데스크",
    "Guest & CRM": "투숙객 및 CRM",
    "Operations": "운영 관리",
    "Settings": "설정",
    "Dashboard": "대시보드",
    "Reservations": "예약 타임라인",
    "Booking List": "예약 목록",
    "Check-in/out": "체크인/아웃",
    "Guest CRM": "투숙객 관리",
    "VIP Members": "VIP 멤버십",
    "Room Mgmt": "객실 관리",
    "Room Types": "객실 유형",
    "Rates Calendar": "요금 캘린더",
    "Housekeeping": "하우스키핑",
    "Folio & Billing": "통합 정산",
    "Folio List": "정산 목록",
    "Revenue Analytics": "매출 분석",
    "Ancillary Svcs": "부가서비스",
    "Room Service": "룸서비스",
    "Golf": "골프",
    "Rent-a-car": "렌터카",
    "Hotel Settings": "호텔 설정",
    "Staff Mgmt": "직원 관리",
    "Billing & Payment": "요금 및 결제",
    "Notices": "공지사항",
    "Support": "고객지원",
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
    "Subscription & Billing": "구독 및 결제",
    "Customer Support": "고객 지원",
    "Notice Mgmt": "공지사항 관리",
    "Audit Logs": "감사 로그",
    "Platform Owner": "플랫폼 소유자",
    "Super Admin": "슈퍼 관리자",
});
Object.assign(window.translations.en, {
    "Main": "Main",
    "Front Desk": "Front Desk",
    "Guest & CRM": "Guest & CRM",
    "Operations": "Operations",
    "Settings": "Settings",
    "Dashboard": "Dashboard",
    "Reservations": "Reservations",
    "Booking List": "Booking List",
    "Check-in/out": "Check-in/out",
    "Guest CRM": "Guest CRM",
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
    "Audit Logs": "Audit Logs",
    "Platform Owner": "Platform Owner",
    "Super Admin": "Super Admin",
});
