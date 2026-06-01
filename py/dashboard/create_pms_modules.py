import os

base_path = r"E:\AI_Project\Hotel_PMS\dashboard"

def get_html_template(title_key, title_ko, icon, content_html):
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title_ko} — Hotel PMS</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="../common/css/dashboard.css">
    <link rel="stylesheet" href="../common/css/operations.css">
    <script src="../common/js/i18n.js"></script>
    <script src="../common/js/ui-components.js"></script>
    <script src="../common/js/sidebar.js"></script>
</head>
<body>
<div class="main">
    <header class="topbar">
        <div class="topbar-left">
            <button class="mobile-menu-btn" onclick="toggleMenu()"><i class="fa-solid fa-bars"></i></button>
            <h1 data-i18n-key="{title_key}"><i class="fa-solid {icon}"></i> {title_ko}</h1>
        </div>
        <div class="topbar-right">
            <button class="btn-outline-sm" onclick="window.location.href='../download/Export_Data.xlsx'"><i class="fa-solid fa-download"></i> <span data-i18n-key="Export">Export</span></button>
        </div>
    </header>
    <div class="content">
        {content_html}
    </div>
</div>
<script>
document.addEventListener('DOMContentLoaded', () => {{
    if(typeof setupI18n === 'function') setupI18n();
    if(typeof changeLang === 'function' && typeof currentLang !== 'undefined') changeLang(currentLang);
}});
</script>
</body>
</html>
"""

# 1. Night Audit
night_audit_content = """
<div class="card" style="margin-bottom: 20px;">
    <div class="card-header">
        <h3 class="card-title">Night Audit (일일 영업 마감)</h3>
    </div>
    <div class="card-body">
        <p style="color:var(--txt2); margin-bottom: 20px;">현재 영업일: <strong>2026-05-12</strong> <i class="fa-solid fa-arrow-right" style="margin: 0 10px;"></i> 롤오버(Rollover) 후 영업일: <strong style="color:var(--primary)">2026-05-13</strong></p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
            <div style="border:1px solid var(--border);border-radius:4px;padding:16px;text-align:center">
                <i class="fa-solid fa-bed" style="font-size:2rem;color:var(--orange);margin-bottom:10px"></i>
                <div style="font-weight:700">객실 청구 처리 (Room/Tax)</div>
                <div style="font-size:0.8rem;color:var(--txt2);margin-top:4px">투숙 중인 객실에 1일 숙박 요금과 세금을 자동 청구합니다.</div>
            </div>
            <div style="border:1px solid var(--border);border-radius:4px;padding:16px;text-align:center">
                <i class="fa-solid fa-user-xmark" style="font-size:2rem;color:var(--danger);margin-bottom:10px"></i>
                <div style="font-weight:700">노쇼 (No-Show) 처리</div>
                <div style="font-size:0.8rem;color:var(--txt2);margin-top:4px">자정까지 도착하지 않은 예약건을 노쇼로 강제 전환합니다.</div>
            </div>
            <div style="border:1px solid var(--border);border-radius:4px;padding:16px;text-align:center">
                <i class="fa-solid fa-calendar-check" style="font-size:2rem;color:var(--success);margin-bottom:10px"></i>
                <div style="font-weight:700">영업일 롤오버 (Rollover)</div>
                <div style="font-size:0.8rem;color:var(--txt2);margin-top:4px">PMS 시스템 시계를 다음 영업일로 전환합니다.</div>
            </div>
        </div>
        <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
            <button class="btn-primary-sm" onclick="showConfirm('일일 마감을 시작하시겠습니까? 되돌릴 수 없습니다.').then(res => {if(res) showToast('마감이 완료되었습니다.');})"><i class="fa-solid fa-play"></i> 마감 시작 (Run Night Audit)</button>
        </div>
    </div>
</div>
"""

# 2. Reports
reports_content = """
<div class="card" style="margin-bottom: 20px;">
    <div class="card-header">
        <h3 class="card-title">Reporting Center (종합 통계)</h3>
    </div>
    <div class="card-body">
        <div style="display:flex;gap:10px;margin-bottom:16px">
            <select class="form-select"><option>Today (오늘)</option><option>Yesterday</option><option>This Month</option></select>
            <button class="btn-primary-sm"><i class="fa-solid fa-filter"></i> 조회</button>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>리포트 명</th>
                    <th>설명</th>
                    <th>형식</th>
                    <th>액션</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Shift Report (교대조 마감)</td>
                    <td>프론트데스크 근무자 교대 시 확인하는 현금 시재 및 결제 요약</td>
                    <td>PDF, Excel</td>
                    <td><button class="btn-outline-sm" onclick="window.location.href='../download/Export_Data.xlsx'">다운로드</button></td>
                </tr>
                <tr>
                    <td>Manager Flash Report</td>
                    <td>객실 점유율, ADR, RevPAR 등 총지배인용 요약 통계</td>
                    <td>PDF, Excel</td>
                    <td><button class="btn-outline-sm" onclick="window.location.href='../download/Export_Data.xlsx'">다운로드</button></td>
                </tr>
                <tr>
                    <td>Arrival & Departure List</td>
                    <td>금일 입퇴실 및 하우스키핑 청소 예상 명단</td>
                    <td>PDF, Excel</td>
                    <td><button class="btn-outline-sm" onclick="window.location.href='../download/Export_Data.xlsx'">다운로드</button></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
"""

# 3. Maintenance
maintenance_content = """
<div class="filter-bar">
    <button class="btn-primary-sm" onclick="showToast('기능 준비중입니다.')"><i class="fa-solid fa-plus"></i> 티켓 생성 (New Ticket)</button>
</div>
<div class="card" style="margin-top: 20px;">
    <div class="card-body" style="padding:0">
        <table class="data-table">
            <thead>
                <tr>
                    <th>상태</th>
                    <th>호실</th>
                    <th>이슈 내역 (Issue)</th>
                    <th>우선순위</th>
                    <th>담당자</th>
                    <th>액션</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><span class="role-badge" style="background:var(--danger-lt);color:var(--danger)">Open</span></td>
                    <td>402</td>
                    <td>에어컨 냉방 불량 (AC Broken)</td>
                    <td>High</td>
                    <td>Engineering Team</td>
                    <td><button class="btn-outline-sm" onclick="showToast('완료 처리됨')">완료</button></td>
                </tr>
                <tr>
                    <td><span class="role-badge" style="background:var(--success-lt);color:var(--success)">Resolved</span></td>
                    <td>1205</td>
                    <td>화장실 배관 누수</td>
                    <td>Medium</td>
                    <td>Plumber</td>
                    <td><button class="btn-outline-sm" disabled>완료됨</button></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
"""

# 4. MICE (Groups)
groups_content = """
<div class="filter-bar">
    <button class="btn-primary-sm" onclick="showToast('신규 그룹 블록 생성 창')"><i class="fa-solid fa-users"></i> 신규 그룹 생성 (New Group Block)</button>
</div>
<div class="card" style="margin-top: 20px;">
    <div class="card-body" style="padding:0">
        <table class="data-table">
            <thead>
                <tr>
                    <th>그룹명 (Group Name)</th>
                    <th>체크인 - 체크아웃</th>
                    <th>블록(예약 객실)</th>
                    <th>픽업(실 투숙)</th>
                    <th>상태</th>
                    <th>정산 (Routing)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Samsung Tech Conference</td>
                    <td>2026-05-20 ~ 2026-05-22</td>
                    <td>50 객실</td>
                    <td>45 객실</td>
                    <td><span class="role-badge" style="background:var(--primary-lt);color:var(--primary)">Confirmed</span></td>
                    <td><button class="btn-outline-sm" onclick="showToast('마스터 폴리오 라우팅')">Master Folio</button></td>
                </tr>
                <tr>
                    <td>Wedding: Lee & Kim</td>
                    <td>2026-06-12 ~ 2026-06-14</td>
                    <td>15 객실</td>
                    <td>15 객실</td>
                    <td><span class="role-badge" style="background:var(--success-lt);color:var(--success)">In-House</span></td>
                    <td><button class="btn-outline-sm" onclick="showToast('개별 결제 세팅')">Individual</button></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
"""

# 5. POS
pos_content = """
<div class="card" style="margin-bottom: 20px;">
    <div class="card-header">
        <h3 class="card-title">POS / F&B (식음료 및 리테일)</h3>
    </div>
    <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div style="border:1px solid var(--border);border-radius:4px;padding:16px">
                <h4 style="margin-bottom:12px;color:var(--primary)">상품/메뉴 선택</h4>
                <div style="display:flex;flex-direction:column;gap:10px">
                    <button class="btn-outline" style="justify-content:space-between;width:100%" onclick="showToast('상품 담김')"><span>아메리카노 (Cafe)</span> <span>₩ 6,000</span></button>
                    <button class="btn-outline" style="justify-content:space-between;width:100%" onclick="showToast('상품 담김')"><span>조식 뷔페 (Buffet)</span> <span>₩ 35,000</span></button>
                    <button class="btn-outline" style="justify-content:space-between;width:100%" onclick="showToast('상품 담김')"><span>미니바 맥주 (Minibar)</span> <span>₩ 8,000</span></button>
                </div>
            </div>
            <div style="border:1px solid var(--border);border-radius:4px;padding:16px;background:#f8fafc">
                <h4 style="margin-bottom:12px;color:var(--primary)">결제 및 청구 (Payment/Charge)</h4>
                <div style="margin-bottom:12px">
                    <label style="font-size:0.8rem;font-weight:600;color:var(--txt2)">결제 방식</label>
                    <select class="form-select" style="margin-top:6px"><option>Room Charge (객실로 달아두기)</option><option>Credit Card (카드 결제)</option><option>Cash (현금)</option></select>
                </div>
                <div style="margin-bottom:12px">
                    <label style="font-size:0.8rem;font-weight:600;color:var(--txt2)">Room 번호 (Room Charge 시 필수)</label>
                    <input type="text" class="form-input" placeholder="예: 1401" style="margin-top:6px">
                </div>
                <button class="btn-primary-sm" style="width:100%" onclick="showToast('객실 정산(Folio)으로 전송되었습니다.')"><i class="fa-solid fa-receipt"></i> 결제/청구 완료</button>
            </div>
        </div>
    </div>
</div>
"""

pages = {
    "night-audit.html": ("Night Audit", "일일 마감", "fa-moon", night_audit_content, "operations"),
    "reports.html": ("Reporting", "종합 리포트", "fa-chart-pie", reports_content, "operations"),
    "maintenance.html": ("Maintenance", "유지보수", "fa-wrench", maintenance_content, "operations"),
    "groups.html": ("Group & MICE", "그룹/행사 예약", "fa-users-rectangle", groups_content, "frontdesk"),
    "pos.html": ("POS", "F&B / 리테일", "fa-cash-register", pos_content, "operations")
}

for filename, (title_key, title_ko, icon, content, folder) in pages.items():
    filepath = os.path.join(base_path, folder, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(get_html_template(title_key, title_ko, icon, content))
    print(f"Created {folder}/{filename}")

print("All 5 modules created.")
