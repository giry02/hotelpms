import re
import json

with open(r'e:\AI_Project\Hotel_PMS\dashboard\dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# I want to extract the previous JSON block to not lose anything, but it's easier to just provide a completely comprehensive one.
# First, I'll strip out the old script block entirely from "// ===== i18n =====" to the end.
if '// ===== i18n =====' in html:
    html = html[:html.find('// ===== i18n =====')]

# Make sure updateDate doesn't have hardcoded 'ko-KR' inside the original script area.
# Wait, updateDate is defined BEFORE the i18n block originally. Let's replace the whole updateDate function to support i18n.
new_update_date = """// ===== LIVE CLOCK =====
let currentLang = 'ko';

function updateDate() {
    const now = new Date();
    const opts = {year:'numeric',month:'long',day:'numeric',weekday:'short'};
    const badge = document.querySelector('.date-badge');
    if(badge) {
        const locale = currentLang === 'en' ? 'en-US' : 'ko-KR';
        const dateStr = now.toLocaleDateString(locale, opts);
        const timeStr = now.toLocaleTimeString(locale, {hour:'2-digit',minute:'2-digit'});
        badge.innerHTML = `<i class="fa-regular fa-calendar"></i> ${dateStr} ${timeStr}`;
    }
}
updateDate();
setInterval(updateDate, 60000);"""

# Replace the original LIVE CLOCK block using regex
html = re.sub(r'// ===== LIVE CLOCK =====.*?setInterval\(updateDate, 60000\);', new_update_date, html, flags=re.DOTALL)


# Append the new JS at the end
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
        "Settings": "Settings",
        
        /* 알림 내역 */
        "VIP 체크인 예정": "VIP 체크인 예정",
        "PH01 객실 Tran Linh 고객님이 30분 내 도착 예정입니다. 환영 준비를 확인해주세요.": "PH01 객실 Tran Linh 고객님이 30분 내 도착 예정입니다. 환영 준비를 확인해주세요.",
        "방금 전": "방금 전",
        "긴급 청소 요청": "긴급 청소 요청",
        "0807 객실 고객이 수건 교체 및 미니바 정리를 요청했습니다.": "0807 객실 고객이 수건 교체 및 미니바 정리를 요청했습니다.",
        "12분 전": "12분 전",
        "룸서비스 주문 접수": "룸서비스 주문 접수",
        "1205 객실에서 클럽 샌드위치 2세트가 주문되었습니다.": "1205 객실에서 클럽 샌드위치 2세트가 주문되었습니다.",
        "45분 전": "45분 전",

        /* 실시간 활동 내역 */
        "1205호": "1205호",
        "Nguyen Thi 체크인 완료": "Nguyen Thi 체크인 완료",
        "2분 전": "2분 전",
        "0904호": "0904호",
        "청소 완료 → Inspected": "청소 완료 → Inspected",
        "8분 전": "8분 전",
        "0612호": "0612호",
        "Folio 정산 완료 ($485.00)": "Folio 정산 완료 ($485.00)",
        "15분 전": "15분 전",
        "1401호": "1401호",
        "Kim Jun 체크아웃": "Kim Jun 체크아웃",
        "22분 전": "22분 전",
        "Tran Linh": "Tran Linh",
        "VIP 승급 Gold → VIP": "VIP 승급 Gold → VIP",
        "30분 전": "30분 전",

        /* 부가서비스 내역 */
        "클럽 샌드위치 × 2, 아이스 라떼 × 1": "클럽 샌드위치 × 2, 아이스 라떼 × 1",
        "맥주 × 3, 와인 × 1": "맥주 × 3, 와인 × 1",
        "아로마 테라피 90분 코스": "아로마 테라피 90분 코스",
        "드라이클리닝 셔츠 × 3": "드라이클리닝 셔츠 × 3",
        "DaLat Palace GC · 10:30 T/Off 2인": "DaLat Palace GC · 10:30 T/Off 2인",

        /* 광고 배너 */
        "타겟 광고 배너 영역 · 지역: Vietnam / Ho Chi Minh · CPM: $2.50": "타겟 광고 배너 영역 · 지역: Vietnam / Ho Chi Minh · CPM: $2.50",
        "광고 관리 →": "광고 관리 →"
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
        "Settings": "Settings",

        /* 알림 내역 */
        "VIP 체크인 예정": "VIP Arrival Expected",
        "PH01 객실 Tran Linh 고객님이 30분 내 도착 예정입니다. 환영 준비를 확인해주세요.": "Guest Tran Linh (PH01) arriving in 30 mins. Please prepare welcome.",
        "방금 전": "Just now",
        "긴급 청소 요청": "Urgent Cleaning",
        "0807 객실 고객이 수건 교체 및 미니바 정리를 요청했습니다.": "Room 0807 requested fresh towels and minibar restock.",
        "12분 전": "12m ago",
        "룸서비스 주문 접수": "Room Svc Order",
        "1205 객실에서 클럽 샌드위치 2세트가 주문되었습니다.": "2 Club Sandwiches ordered by Room 1205.",
        "45분 전": "45m ago",

        /* 실시간 활동 내역 */
        "1205호": "Rm 1205",
        "Nguyen Thi 체크인 완료": "Nguyen Thi Checked in",
        "2분 전": "2m ago",
        "0904호": "Rm 0904",
        "청소 완료 → Inspected": "Cleaned → Inspected",
        "8분 전": "8m ago",
        "0612호": "Rm 0612",
        "Folio 정산 완료 ($485.00)": "Folio Settled ($485.00)",
        "15분 전": "15m ago",
        "1401호": "Rm 1401",
        "Kim Jun 체크아웃": "Kim Jun Checked out",
        "22분 전": "22m ago",
        "Tran Linh": "Tran Linh",
        "VIP 승급 Gold → VIP": "VIP Upgrade Gold → VIP",
        "30분 전": "30m ago",

        /* 부가서비스 내역 */
        "클럽 샌드위치 × 2, 아이스 라떼 × 1": "Club Sandwich x2, Iced Latte x1",
        "맥주 × 3, 와인 × 1": "Beer x3, Wine x1",
        "아로마 테라피 90분 코스": "Aromatherapy 90 min course",
        "드라이클리닝 셔츠 × 3": "Dry Cleaning Shirt x3",
        "DaLat Palace GC · 10:30 T/Off 2인": "DaLat Palace GC · 10:30 T/Off 2 pax",

        /* 광고 배너 */
        "타겟 광고 배너 영역 · 지역: Vietnam / Ho Chi Minh · CPM: $2.50": "Target Ad Banner · Region: Vietnam / HCMC · CPM: $2.50",
        "광고 관리 →": "Manage Ads →"
    }
};

// Map original strings using data-i18n attribute for easier replacement
function setupI18n() {
    // Only target nodes without children to avoid blowing up html
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const textNodes = [];
    while (node = walk.nextNode()) {
        const text = node.nodeValue.trim();
        // Since we may run setupI18n multiple times during dev, avoid double spanning
        if (text && translations.ko[text] && node.parentNode.tagName !== 'SPAN' && node.parentNode.getAttribute('data-i18n-key') == null) {
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
    currentLang = lang;
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
    
    updateDate(); // refresh date formatting
}

document.addEventListener('DOMContentLoaded', () => {
    setupI18n();
    // In case dom already loaded:
    if(document.readyState === 'complete' || document.readyState === 'interactive') {
        setupI18n();
    }
});
'''

# append script tag end
if html.endswith('</script>\n</body>\n</html>'):
    pass
elif html.endswith('</script>\n</body>'):
    html += '\n</html>'

html = html + js + '\n</script>\n</body>\n</html>'

with open(r'e:\AI_Project\Hotel_PMS\dashboard\dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
