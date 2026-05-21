import re

with open(r'e:\AI_Project\Hotel_PMS\dashboard\dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add langSelect
select_html = '''
            <select class="hotel-select" id="langSelect" onchange="changeLang(this.value)" style="margin-left:8px; width:110px">
                <option value="ko">🇰🇷 한국어</option>
                <option value="en">🇺🇸 English</option>
            </select>
'''
html = html.replace('</select>\n            <div class="notif-wrap">', '</select>' + select_html + '            <div class="notif-wrap">')

# Append JS at the end
js = '''
// ===== i18n =====
const translations = {
    ko: {
        "대시보드": "대시보드",
        "예약 타임라인": "예약 타임라인",
        "예약 목록": "예약 목록",
        "체크인/아웃": "체크인/아웃",
        "투숙객 관리": "투숙객 관리",
        "VIP 멤버십": "VIP 멤버십",
        "객실 관리": "객실 관리",
        "하우스키핑": "하우스키핑",
        "통합 정산": "통합 정산",
        "부가서비스": "부가서비스",
        "호텔 설정": "호텔 설정",
        "직원 관리": "직원 관리",
        "호텔 알림": "호텔 알림",
        "모두 읽음 처리": "모두 읽음 처리",
        "객실 점유율 (OCC)": "객실 점유율 (OCC)",
        "총 120실 중 99실 판매": "총 120실 중 99실 판매",
        "평균 객실 단가 (ADR)": "평균 객실 단가 (ADR)",
        "전주 대비 +$10.00": "전주 대비 +$10.00",
        "객실당 수익 (RevPAR)": "객실당 수익 (RevPAR)",
        "오늘 체크인 / 체크아웃": "오늘 체크인 / 체크아웃",
        "대기 3건 · No-show 1건": "대기 3건 · No-show 1건",
        "주간 객실 현황": "주간 객실 현황",
        "주간": "주간",
        "월간": "월간",
        "예약 채널 비율": "예약 채널 비율",
        "총 예약": "총 예약",
        "오늘의 체크인 예정": "오늘의 체크인 예정",
        "전체보기 →": "전체보기 →",
        "투숙객": "투숙객",
        "객실": "객실",
        "유형": "유형",
        "기간": "기간",
        "상태": "상태",
        "하우스키핑 현황": "하우스키핑 현황",
        "실시간 활동": "실시간 활동",
        "오늘의 부가서비스 주문": "오늘의 부가서비스 주문",
        "부가서비스 매출": "부가서비스 매출",
        "오늘": "오늘",
        "시간": "시간",
        "서비스": "서비스",
        "항목": "항목",
        "금액(USD)": "금액(USD)",
        "처리": "처리",
        "오늘 총 부가서비스 매출": "오늘 총 부가서비스 매출",
        "완료": "완료",
        "진행 중": "진행 중",
        "수거 중": "수거 중",
        "예약확정": "예약확정",
        "스파": "스파",
        "외부 대행": "외부 대행",
        "룸서비스": "룸서비스",
        "미니바": "미니바",
        "세탁": "세탁",
        "Main": "Main",
        "Front Desk": "Front Desk",
        "Guest & CRM": "Guest & CRM",
        "Operations": "Operations",
        "Settings": "Settings"
    },
    en: {
        "대시보드": "Dashboard",
        "예약 타임라인": "Reservations",
        "예약 목록": "Booking List",
        "체크인/아웃": "Check-in/out",
        "투숙객 관리": "Guest CRM",
        "VIP 멤버십": "VIP Members",
        "객실 관리": "Room Mgmt",
        "하우스키핑": "Housekeeping",
        "통합 정산": "Folio & Billing",
        "부가서비스": "Ancillary Svcs",
        "호텔 설정": "Hotel Settings",
        "직원 관리": "Staff Mgmt",
        "호텔 알림": "Notifications",
        "모두 읽음 처리": "Mark all read",
        "객실 점유율 (OCC)": "Occupancy (OCC)",
        "총 120실 중 99실 판매": "99 of 120 rooms sold",
        "평균 객실 단가 (ADR)": "Average Daily Rate (ADR)",
        "전주 대비 +$10.00": "+$10.00 from last week",
        "객실당 수익 (RevPAR)": "Rev. per Available Room",
        "오늘 체크인 / 체크아웃": "Today's Check-in / out",
        "대기 3건 · No-show 1건": "3 Waitlist · 1 No-show",
        "주간 객실 현황": "Weekly Room Status",
        "주간": "Weekly",
        "월간": "Monthly",
        "예약 채널 비율": "Booking Channels",
        "총 예약": "Total Bookings",
        "오늘의 체크인 예정": "Today's Arrivals",
        "전체보기 →": "View All →",
        "투숙객": "Guest",
        "객실": "Room",
        "유형": "Type",
        "기간": "Duration",
        "상태": "Status",
        "하우스키핑 현황": "HK Status",
        "실시간 활동": "Live Activity",
        "오늘의 부가서비스 주문": "Today's Ancillary Orders",
        "부가서비스 매출": "Ancillary Revenue",
        "오늘": "Today",
        "시간": "Time",
        "서비스": "Service",
        "항목": "Item",
        "금액(USD)": "Amount(USD)",
        "처리": "Action",
        "오늘 총 부가서비스 매출": "Today's Total Revenue",
        "완료": "Done",
        "진행 중": "In Progress",
        "수거 중": "Collecting",
        "예약확정": "Confirmed",
        "스파": "Spa",
        "외부 대행": "External",
        "룸서비스": "Room Svc",
        "미니바": "Minibar",
        "세탁": "Laundry",
        "Main": "Main",
        "Front Desk": "Front Desk",
        "Guest & CRM": "Guest & CRM",
        "Operations": "Operations",
        "Settings": "Settings"
    }
};

// Map original strings using data-i18n attribute for easier replacement
function setupI18n() {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const textNodes = [];
    while (node = walk.nextNode()) {
        const text = node.nodeValue.trim();
        if (translations.ko[text]) {
            const span = document.createElement('span');
            span.setAttribute('data-i18n-key', text);
            span.textContent = text;
            textNodes.push({node, span});
        }
    }
    // Replace text nodes with spans
    textNodes.forEach(({node, span}) => {
        node.parentNode.replaceChild(span, node);
    });
}

window.changeLang = function(lang) {
    const dict = translations[lang] || translations.ko;
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.getAttribute('data-i18n-key');
        if (dict[key]) el.textContent = dict[key];
    });
    
    // update dynamic js data
    if(window.svcData && document.getElementById('svcBreakdown')) {
        document.getElementById('svcBreakdown').innerHTML = '';
        window.svcData.forEach(s => {
            const name = dict[s.name] || s.name;
            const row = document.createElement('div');
            row.className = 'svc-row';
            row.innerHTML = `
                <div class="svc-icon" style="background:${s.color}1A; color:${s.color}"><i class="fa-solid ${s.icon}"></i></div>
                <div class="svc-name">${name}</div>
                <div class="svc-bar-bg"><div class="svc-bar" style="width:${s.pct}%; background:${s.color}"></div></div>
                <div class="svc-val">$${s.val}</div>
            `;
            document.getElementById('svcBreakdown').appendChild(row);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupI18n();
});
'''

html = html.replace('</script>\n</body>', js + '\n</script>\n</body>')
# Expose svcData to window for dynamic replacement
html = html.replace('const svcData = [', 'window.svcData = [')

with open(r'e:\AI_Project\Hotel_PMS\dashboard\dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
