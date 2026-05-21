import os
import re

# The original dictionary mapping Korean -> English
translations_en = {
    "투숙객 관리": "Guest CRM",
    "대시보드": "Dashboard",
    "예약 타임라인": "Reservations",
    "예약 목록": "Booking List",
    "체크인/아웃": "Check-in/out",
    "VIP 멤버십": "VIP Members",
    "객실 관리": "Room Mgmt",
    "하우스키핑": "Housekeeping",
    "통합 정산": "Folio & Billing",
    "통합 정산 (Folio)": "Folio & Billing",
    "부가서비스": "Ancillary Svcs",
    "부가서비스 관리": "Ancillary Svcs",
    "호텔 설정": "Hotel Settings",
    "직원 관리": "Staff Mgmt",
    "총 고객 수": "Total Guests",
    "재방문율": "Return Rate",
    "VIP 고객": "VIP Guests",
    "고객당 평균 지출": "Avg. Spend/Guest",
    "전체": "All",
    "엑셀 다운": "Export",
    "고객 등록": "Add Guest",
    "고객": "Guest",
    "국적": "Country",
    "등급": "Tier",
    "방문 횟수": "Visits",
    "최근 투숙": "Last Stay",
    "총 지출": "Total Spend",
    "연락처": "Contact",
    "관리": "Actions",
    "등급별 혜택": "Tier Benefits",
    "최근 등급 변동": "Recent Tier Changes",
    "이번 달": "This Month",
    "지난 달": "Last Month",
    "혜택": "Benefit",
    "객실 할인": "Room Discount",
    "얼리 체크인": "Early Check-in",
    "레이트 체크아웃": "Late Check-out",
    "무료 조식": "Free Breakfast",
    "객실 업그레이드": "Room Upgrade",
    "라운지 이용": "Lounge Access",
    "공항 픽업": "Airport Pickup",
    "환영 어메니티": "Welcome Amenity",
    "포인트 적립률": "Point Earn Rate",
    "등급 변동 이력": "Tier Change History",
    "이번 달 승급": "Upgrades (Month)",
    "이번 달 강등": "Downgrades (Month)",
    "등급 유지율": "Retention Rate",
    "신규 Diamond": "New Diamond",
    "승급": "Upgrade",
    "강등": "Downgrade",
    "확정": "Confirmed",
    "대기": "Pending",
    "체크인": "Check-in",
    "체크아웃": "Check-out",
    "취소": "Cancel",
    "신규 예약": "New Booking",
    "예약번호": "Booking #",
    "투숙객": "Guest",
    "객실": "Room",
    "유형": "Type",
    "숙박": "Stay",
    "채널": "Channel",
    "금액(USD)": "Amount(USD)",
    "상태": "Status",
    "오늘": "Today",
    "총 객실": "Total Rooms",
    "판매 중": "Occupied",
    "잔여 객실": "Available",
    "VIP 투숙": "VIP Guests",
    "예약 상세": "Booking Detail",
    "닫기": "Close",
    "체크인 처리": "Process Check-in",
    "매출 분석": "Revenue Analytics",
    "정산 목록": "Folio List",
    "금일 정산 완료": "Settled Today",
    "미수금 잔액": "Outstanding Bal",
    "부가서비스 매출": "Ancillary Rev",
    "카드 결제 비율": "Card Payment %",
    "결제 내역 다운로드": "Export Transactions",
    "체크아웃일": "Check-out",
    "총 금액": "Total",
    "결제액 (보증금)": "Paid (Deposit)",
    "신규 요청": "New Requests",
    "준비/진행 중": "Preparing",
    "처리 완료": "Completed",
    "금일 예상 매출": "Est. Revenue",
    "전체 서비스": "All Services",
    "룸서비스": "Room Service",
    "스파/마사지": "Spa & Massage",
    "컨시어지": "Concierge",
    "수기 오더 등록": "Manual Order",
    "전체 작업": "Total Tasks",
    "청소 대기": "Pending Clean",
    "점검 대기": "To Inspect",
    "완료": "Completed",
    "청소 요망": "Needs Cleaning",
    "작업지시서 출력": "Print Task List",
    "기본 요금 설정": "Default Rates",
    "평일": "Weekday",
    "주말/휴일": "Weekend/Holiday",
    "객실 유형별 평일(일~목), 주말(금, 토), 공휴일의 기본 요금을 설정합니다.": "Set default rates for weekdays, weekends, and holidays.",
    "적용": "Apply",
    "날짜": "Date",
    "요일": "Day",
    "요금 캘린더": "Rates Calendar",
    "요금 캘린더 (Rates)": "Rates Calendar",
    "VIP 할인율 설정": "VIP Discounts",
    "요금 저장": "Save Rates",
    "객실 유형": "Room Type",
    "VIP 자동 할인율 설정": "Auto VIP Discounts",
    "고객 등급에 따라 예약 시 자동으로 적용될 할인율(%)을 지정합니다.": "Set automatic discount rates (%) applied during booking based on guest tier.",
    "변경사항 저장": "Save Changes",
    "투숙 객실": "Occupied",
    "공실 (Vacant)": "Vacant",
    "점검 중 (OOS)": "OOS",
    "투숙 중": "Occupied",
    "청결 공실": "Vacant Clean",
    "오염 공실": "Vacant Dirty",
    "점검 중": "Out of Order",
    "객실 유형 관리": "Room Types",
    "신규 객실 등록": "Add Room",
    "객실 등록": "Add Room",
    "기본 정보": "Basic Info",
    "정책 및 규정": "Policies",
    "결제 및 세금": "Billing & Tax",
    "호텔 이름": "Hotel Name",
    "대표 전화번호": "Main Phone",
    "대표 이메일": "Main Email",
    "호텔 주소": "Hotel Address",
    "호텔 소개 (다국어 지원)": "Hotel Description (Multi)",
    "저장": "Save",
    "운영 정책": "Operational Policies",
    "기본 체크인 시간": "Default Check-in",
    "기본 체크아웃 시간": "Default Check-out",
    "기본 취소 정책": "Cancellation Policy",
    "오버부킹 (Overbooking) 허용": "Allow Overbooking",
    "디파짓(보증금) 필수 청구": "Require Deposit (Pre-auth)",
    "직원 및 권한 관리": "Staff & Roles",
    "전체 직원": "Total Staff",
    "현재 근무 중": "On Duty",
    "시스템 관리자": "System Admins",
    "프론트 데스크": "Front Desk",
    "관리자": "Management",
    "직원 등록": "Add Staff",
    "직원명": "Name",
    "소속/권한": "Role",
    "최근 접속": "Last Login"
}

# Sort keys by length descending to prevent partial replacements (e.g. replacing '관리' inside '객실 관리')
sorted_ko_keys = sorted(translations_en.keys(), key=len, reverse=True)

# 1. Update HTML files
directories_to_scan = [
    r'E:\AI_Project\Hotel_PMS\dashboard',
    r'E:\AI_Project\Hotel_PMS\admin'
]

html_files = []
for directory in directories_to_scan:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))

for filepath in html_files:
    # Read file with EXACTLY utf-8
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We only want to replace text that is outside HTML tags.
    # A simple regex approach to split tags and text:
    parts = re.split(r'(<[^>]+>)', content)
    
    new_parts = []
    for part in parts:
        if part.startswith('<'):
            # It's an HTML tag.
            # We MIGHT have placeholders or data-i18n attributes inside tags.
            # Usually we don't have Korean inside attributes except maybe placeholder, value, or title.
            # For this quick fix, we also do simple string replacement inside the tag string.
            part_mut = part
            for ko_key in sorted_ko_keys:
                en_val = translations_en[ko_key]
                # specific attributes that might contain Korean text
                part_mut = part_mut.replace(f'placeholder="{ko_key}"', f'placeholder="{en_val}"')
                part_mut = part_mut.replace(f'value="{ko_key}"', f'value="{en_val}"')
                part_mut = part_mut.replace(f'title="{ko_key}"', f'title="{en_val}"')
            new_parts.append(part_mut)
        else:
            # It's text outside tags. Safe to replace.
            part_mut = part
            for ko_key in sorted_ko_keys:
                en_val = translations_en[ko_key]
                # Replace exact occurrences. We can just use string replace.
                part_mut = part_mut.replace(ko_key, en_val)
            new_parts.append(part_mut)
            
    new_content = "".join(new_parts)
    
    # Write back
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

# 2. Rewrite i18n.js
i18n_js_paths = [
    r'E:\AI_Project\Hotel_PMS\dashboard\common\js\i18n.js',
    r'E:\AI_Project\Hotel_PMS\admin\common\js\admin-i18n.js'
]

# We construct the new window.translations object
new_ko = []
new_en = []
for ko_key in sorted_ko_keys:
    en_val = translations_en[ko_key]
    # Escape quotes
    en_val_esc = en_val.replace('"', '\\"')
    ko_key_esc = ko_key.replace('"', '\\"')
    
    # Base is English. So English keys!
    # "Guest CRM": "Guest CRM"
    # "Guest CRM": "투숙객 관리"
    new_en.append(f'    "{en_val_esc}": "{en_val_esc}"')
    new_ko.append(f'    "{en_val_esc}": "{ko_key_esc}"')

new_en_str = ",\n".join(new_en)
new_ko_str = ",\n".join(new_ko)

new_i18n_js_content = f"""// i18n.js - Global Translation Dictionary (English Base)

window.currentLang = 'ko';

window.translations = {{
    ko: {{
{new_ko_str}
    }},
    en: {{
{new_en_str}
    }}
}};

function setupI18n() {{
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let n;
    const t = [];
    while(n = w.nextNode()) {{
        const o = n.nodeValue, x = o.trim();
        // NOW match against the English dictionary keys
        if(x && window.translations.en[x] && !n.parentNode.hasAttribute('data-i18n-key')) {{
            const s = document.createElement('span');
            s.setAttribute('data-i18n-key', x);
            s.textContent = x;
            t.push({{node:n, span:s, originalText:o}});
        }}
    }}
    t.forEach(({{node:n, span:s, originalText:o}}) => {{
        const f = document.createDocumentFragment();
        const l = o.match(/^\s+/), r = o.match(/\s+$/);
        if(l) f.appendChild(document.createTextNode(l[0]));
        f.appendChild(s);
        if(r) f.appendChild(document.createTextNode(r[0]));
        n.parentNode.replaceChild(f, n);
    }});
}}

function changeLang(l) {{
    window.currentLang = l;
    const d = window.translations[l] || window.translations.en;
    document.querySelectorAll('[data-i18n-key]').forEach(e => {{
        const k = e.getAttribute('data-i18n-key');
        if(d[k]) e.textContent = d[k];
    }});
    
    const langSelects = document.querySelectorAll('#langSelect, .lang-select, select[onchange*="changeLang"]');
    langSelects.forEach(sel => {{
        if(sel.value !== l) sel.value = l;
    }});

    if(typeof window.applyLocalI18n === 'function') window.applyLocalI18n(l);
}}

window.addEventListener('DataReady', () => {{
    setupI18n();
    changeLang(window.currentLang);
}});

document.addEventListener('DOMContentLoaded', () => {{
    if (!document.querySelector('script[src*="sidebar.js"]')) {{
        window.dispatchEvent(new Event('DataReady'));
    }}
}});
"""

for js_path in i18n_js_paths:
    if os.path.exists(js_path):
        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(new_i18n_js_content)
        print(f"Updated JS: {js_path}")

print("Successfully replaced all Korean HTML strings with English strings and updated JS logic.")
