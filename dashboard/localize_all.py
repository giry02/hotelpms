import os, re

base = r"E:\AI_Project\Hotel_PMS\dashboard"

def r(path):
    with open(path, encoding='utf-8') as f: return f.read()

def w(path, content):
    with open(path, 'w', encoding='utf-8') as f: f.write(content)

def bulk_replace(s, pairs):
    for old, new in pairs:
        s = s.replace(old, new)
    return s

# ─────────────────────────────────────────
# 1. night-audit.html
# ─────────────────────────────────────────
na = os.path.join(base, "operations", "night-audit.html")
if os.path.exists(na):
    c = r(na)
    c = bulk_replace(c, [
        ('>Run Night Audit<', '>야간 마감 실행<'),
        ('>Roll Over<', '>날짜 이월<'),
        ('>Export Report<', '>리포트 출력<'),
        ('"Run Night Audit"', '"야간 마감 실행"'),
        ('>Close<', '>닫기<'),
        ('>Night Audit<', '>야간 마감<'),
        ('Current Business Date', '현재 영업일'),
        ('After Roll-over', '이월 후 영업일'),
        ('Start Audit', '마감 시작'),
        ('Confirm & Close', '확정 후 마감'),
        ('>Pending<', '>대기 중<'),
        ('>Complete<', '>완료<'),
        ('>In Progress<', '>진행 중<'),
        ('Audit Checklist', '마감 체크리스트'),
        ('Revenue Summary', '매출 요약'),
        ('Occupancy', '점유율'),
        ('Unsettled Folios', '미정산 객실'),
        ('All Settled', '전체 정산 완료'),
        ('Run Audit', '마감 실행'),
    ])
    # Ensure current date is dynamic
    if 'new Date()' not in c and 'currentDate' not in c:
        date_script = """
<script>
(function(){
    const today = new Date();
    const fmt = d => d.toLocaleDateString('ko-KR', {year:'numeric',month:'long',day:'numeric',weekday:'short'});
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
    document.querySelectorAll('.current-date').forEach(el => el.textContent = fmt(today));
    document.querySelectorAll('.next-date').forEach(el => el.textContent = fmt(tomorrow));
})();
</script>"""
        c = c.replace('</body>', date_script + '\n</body>')
    w(na, c)
    print("✓ night-audit.html")

# ─────────────────────────────────────────
# 2. reports.html
# ─────────────────────────────────────────
rp = os.path.join(base, "operations", "reports.html")
if os.path.exists(rp):
    c = r(rp)
    c = bulk_replace(c, [
        ('>Generate Report<', '>리포트 생성<'),
        ('>Export CSV<', '>CSV 다운로드<'),
        ('"Export CSV"', '"CSV 다운로드"'),
        ('>Export<', '>다운로드<'),
        ('Date Range', '기간 설정'),
        ('Room Type', '객실 유형'),
        ('>Filter<', '>조회<'),
        ('>Apply<', '>적용<'),
        ('Revenue', '매출'),
        ('Occupancy Rate', '점유율'),
        ('Total Revenue', '총 매출'),
        ('Net Revenue', '순 매출'),
        ('This Month', '이번 달'),
        ('Last Month', '지난 달'),
        ('Year to Date', '올해 누적'),
    ])
    w(rp, c)
    print("✓ reports.html")

# ─────────────────────────────────────────
# 3. housekeeping.html
# ─────────────────────────────────────────
hk = os.path.join(base, "operations", "housekeeping.html")
if os.path.exists(hk):
    c = r(hk)
    c = bulk_replace(c, [
        ('>Clean<', '>청소 완료<'),
        ('"Clean"', '"청소 완료"'),
        ('>Inspect<', '>점검<'),
        ('"Inspect"', '"점검"'),
        ('>Dirty<', '>오염<'),
        ('"Dirty"', '"오염"'),
        ('>Assign<', '>담당자 배정<'),
        ('"Assign"', '"담당자 배정"'),
        ('>All Rooms<', '>전체 객실<'),
        ('>Pending Clean<', '>청소 대기<'),
        ('>In Progress<', '>진행 중<'),
        ('>Completed<', '>완료<'),
        ('>Priority<', '>우선순위<'),
        ('Print Task List', '작업지시서 출력'),
        ('Manual Order', '수기 오더 등록'),
        ('Audit Log', '작업 이력'),
        ('>View Log<', '>이력 보기<'),
        ('>Save<', '>저장<'),
        ('>Cancel<', '>취소<'),
        ('>Close<', '>닫기<'),
    ])
    w(hk, c)
    print("✓ housekeeping.html")

# ─────────────────────────────────────────
# 4. groups.html
# ─────────────────────────────────────────
grp = os.path.join(base, "frontdesk", "groups.html")
if os.path.exists(grp):
    c = r(grp)
    c = bulk_replace(c, [
        ('>New Group<', '>신규 단체 등록<'),
        ('"New Group"', '"신규 단체 등록"'),
        ('>Add Room<', '>객실 추가<'),
        ('>Assign Rooms<', '>객실 배정<'),
        ('>Export<', '>다운로드<'),
        ('>Confirm<', '>확정<'),
        ('>Cancel<', '>취소<'),
        ('>Close<', '>닫기<'),
        ('>Save<', '>저장<'),
        ('>Edit<', '>수정<'),
        ('>Delete<', '>삭제<'),
        ('Group Name', '단체명'),
        ('Check-in Date', '체크인 날짜'),
        ('Check-out Date', '체크아웃 날짜'),
        ('Number of Rooms', '예약 객실 수'),
        ('Payment Method', '결제 방식'),
        ('Contact Person', '담당자'),
    ])
    w(grp, c)
    print("✓ groups.html")

# ─────────────────────────────────────────
# 5. checkin.html
# ─────────────────────────────────────────
ci = os.path.join(base, "frontdesk", "checkin.html")
if os.path.exists(ci):
    c = r(ci)
    c = bulk_replace(c, [
        ('>Process Check-in<', '>체크인 처리<'),
        ('"Process Check-in"', '"체크인 처리"'),
        ('>Check In<', '>체크인<'),
        ('>Check Out<', '>체크아웃<'),
        ('"Check In"', '"체크인"'),
        ('"Check Out"', '"체크아웃"'),
        ('>Walk-in<', '>워크인 (예약없음)<'),
        ('>Confirm<', '>확정<'),
        ('>Cancel<', '>취소<'),
        ('>Close<', '>닫기<'),
        ('>Save<', '>저장<'),
        ('>Assign Room<', '>객실 배정<'),
        ('>Print<', '>출력<'),
        ('Arrival', '도착 예정'),
        ('Departure', '출발 예정'),
        ('Expected Arrivals', '오늘 체크인 예정'),
        ('Expected Departures', '오늘 체크아웃 예정'),
        ('In-house', '현재 투숙 중'),
        ('Walk-in Guest', '워크인 고객'),
    ])
    w(ci, c)
    print("✓ checkin.html")

# ─────────────────────────────────────────
# 6. folio.html
# ─────────────────────────────────────────
fo = os.path.join(base, "operations", "folio.html")
if os.path.exists(fo):
    c = r(fo)
    c = bulk_replace(c, [
        ('>Post Charge<', '>요금 청구<'),
        ('"Post Charge"', '"요금 청구"'),
        ('>Settle<', '>정산 완료<'),
        ('"Settle"', '"정산 완료"'),
        ('>Print<', '>영수증 출력<'),
        ('>Void<', '>취소 처리<'),
        ('"Void"', '"취소 처리"'),
        ('>Export<', '>다운로드<'),
        ('>Close<', '>닫기<'),
        ('>Save<', '>저장<'),
        ('>Cancel<', '>취소<'),
        ('Folio & Billing', '객실 정산서'),
        ('Guest Folio', '객실 정산서'),
        ('Outstanding Balance', '미수금 잔액'),
        ('Settled', '정산 완료'),
        ('Pending', '정산 대기'),
        ('Room Charges', '객실 요금'),
        ('Tax', '세금'),
        ('Discount', '할인'),
        ('Total Due', '청구 총액'),
    ])
    w(fo, c)
    print("✓ folio.html")

# ─────────────────────────────────────────
# 7. unified-pos.html
# ─────────────────────────────────────────
up = os.path.join(base, "operations", "unified-pos.html")
if os.path.exists(up):
    c = r(up)
    c = bulk_replace(c, [
        ('좌측에서 상품을 선택해주세요.', '좌측에서 상품을 선택해주세요.'),
        ('>Pay Now<', '>즉시 결제<'),
        ('"Pay Now"', '"즉시 결제"'),
        ('Pay Now', '즉시 결제'),
        ('Room Charge', '객실 청구'),
        ('Cart', '주문 리스트'),
        ('Clear All', '전체 삭제'),
        ('>Add<', '>추가<'),
        ('현장 즉시 결제 (Pay Now)', '즉시 결제 (현장 결제)'),
    ])
    w(up, c)
    print("✓ unified-pos.html")

# ─────────────────────────────────────────
# 8. crm/guests.html
# ─────────────────────────────────────────
gg = os.path.join(base, "crm", "guests.html")
if os.path.exists(gg):
    c = r(gg)
    c = bulk_replace(c, [
        ('>Add Guest<', '>고객 등록<'),
        ('"Add Guest"', '"고객 등록"'),
        ('>Export<', '>다운로드<'),
        ('>Edit<', '>수정<'),
        ('>Delete<', '>삭제<'),
        ('>Close<', '>닫기<'),
        ('>Save<', '>저장<'),
        ('>Cancel<', '>취소<'),
        ('>Search<', '>검색<'),
        ('Search guests...', '고객명, 연락처 검색...'),
        ('All Countries', '전체 국적'),
        ('All Tiers', '전체 등급'),
        ('First Name', '이름'),
        ('Last Name', '성'),
        ('Phone', '전화번호'),
        ('Email', '이메일'),
        ('Nationality', '국적'),
    ])
    w(gg, c)
    print("✓ crm/guests.html")

# ─────────────────────────────────────────
# 9. crm/membership.html
# ─────────────────────────────────────────
mb = os.path.join(base, "crm", "membership.html")
if os.path.exists(mb):
    c = r(mb)
    c = bulk_replace(c, [
        ('>Export<', '>다운로드<'),
        ('>Edit<', '>수정<'),
        ('>Save<', '>저장<'),
        ('>Cancel<', '>취소<'),
        ('>Close<', '>닫기<'),
        ('>Upgrade<', '>등급 승급<'),
        ('>Downgrade<', '>등급 강등<'),
        ('Tier Benefits', '등급별 혜택'),
        ('Point Balance', '포인트 잔액'),
        ('Total Spend', '총 이용 금액'),
        ('Member Since', '가입일'),
        ('Expiry Date', '유효 기간'),
    ])
    w(mb, c)
    print("✓ crm/membership.html")

# ─────────────────────────────────────────
# 10. golf.html
# ─────────────────────────────────────────
gf = os.path.join(base, "operations", "golf.html")
if os.path.exists(gf):
    c = r(gf)
    c = bulk_replace(c, [
        ('>New Booking<', '>신규 예약<'),
        ('"New Booking"', '"신규 예약"'),
        ('>Confirm<', '>확정<'),
        ('>Cancel<', '>취소<'),
        ('>Close<', '>닫기<'),
        ('>Save<', '>저장<'),
        ('>Export<', '>다운로드<'),
        ('>Edit<', '>수정<'),
        ('>Delete<', '>삭제<'),
        ('Vendor', '제휴 업체'),
        ('Tee Time', '티 타임'),
        ('Course', '코스'),
        ('Pax / Holes', '인원 / 홀수'),
        ('Agency', '에이전시'),
        ('Nationality', '국적'),
        ('Add Vendor', '제휴 업체 등록'),
        ('Vendor List', '제휴 업체 목록'),
        ('Manage Vendors', '제휴 업체 관리'),
    ])
    w(gf, c)
    print("✓ golf.html")

# ─────────────────────────────────────────
# 11. rentacar.html
# ─────────────────────────────────────────
rc = os.path.join(base, "operations", "rentacar.html")
if os.path.exists(rc):
    c = r(rc)
    c = bulk_replace(c, [
        ('>New Booking<', '>신규 예약<'),
        ('"New Booking"', '"신규 예약"'),
        ('>Confirm<', '>확정<'),
        ('>Cancel<', '>취소<'),
        ('>Close<', '>닫기<'),
        ('>Save<', '>저장<'),
        ('>Export<', '>다운로드<'),
        ('>Edit<', '>수정<'),
        ('Vendor', '제휴 업체'),
        ('Car Type', '차종'),
        ('Pick-up Date', '픽업 일시'),
        ('Return Date', '반납 일시'),
        ('Driver Name', '운전자명'),
        ('Agency', '에이전시'),
        ('Rental Fee', '렌탈 요금'),
        ('Hotel Revenue', '호텔 수익'),
        ('Add Vendor', '제휴 업체 등록'),
        ('Manage Vendors', '제휴 업체 관리'),
    ])
    w(rc, c)
    print("✓ rentacar.html")

# ─────────────────────────────────────────
# 12. maintenance.html — Full rebuild if minimal
# ─────────────────────────────────────────
mt = os.path.join(base, "operations", "maintenance.html")
if os.path.exists(mt):
    c = r(mt)
    # Check if it's a stub (small file)
    if len(c) < 5000:
        mt_full = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>시설 보수 — Hotel PMS</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="../common/css/dashboard.css">
    <script src="../common/js/i18n.js"></script>
    <script src="../common/js/sidebar.js"></script>
    <style>
        .priority-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:0.75rem; font-weight:700; }
        .priority-urgent { background:#FEE2E2; color:#DC2626; }
        .priority-high   { background:#FEF3C7; color:#D97706; }
        .priority-normal { background:#DBEAFE; color:#2563EB; }
        .status-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:0.75rem; font-weight:700; }
        .status-open     { background:#FEF3C7; color:#D97706; }
        .status-progress { background:#DBEAFE; color:#2563EB; }
        .status-done     { background:#D1FAE5; color:#059669; }
    </style>
</head>
<body>
<div class="main">
    <header class="topbar">
        <div class="topbar-left">
            <button class="mobile-menu-btn" onclick="toggleMenu()"><i class="fa-solid fa-bars"></i></button>
            <h1>시설 보수 관리</h1>
        </div>
        <div class="topbar-right">
            <button class="btn-primary-sm" onclick="openModal('newRequestModal')"><i class="fa-solid fa-plus"></i> 요청 등록</button>
        </div>
    </header>
    <div class="content">
        <!-- KPI Cards -->
        <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr); margin-bottom:24px">
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#FEF3C7; color:#D97706"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div class="kpi-info"><div class="kpi-label">신규 요청</div><div class="kpi-value">4</div></div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#DBEAFE; color:#2563EB"><i class="fa-solid fa-screwdriver-wrench"></i></div>
                <div class="kpi-info"><div class="kpi-label">진행 중</div><div class="kpi-value">3</div></div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#D1FAE5; color:#059669"><i class="fa-solid fa-circle-check"></i></div>
                <div class="kpi-info"><div class="kpi-label">이번 달 완료</div><div class="kpi-value">18</div></div>
            </div>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar">
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="chip active" onclick="filterMt('all')">전체</button>
                <button class="chip" onclick="filterMt('open')">신규 요청</button>
                <button class="chip" onclick="filterMt('in-progress')">진행 중</button>
                <button class="chip" onclick="filterMt('done')">완료</button>
            </div>
            <select class="form-input" style="height:36px;min-width:140px" id="priorityFilter" onchange="filterMt()">
                <option value="">전체 우선순위</option>
                <option value="urgent">긴급</option>
                <option value="high">높음</option>
                <option value="normal">일반</option>
            </select>
        </div>

        <!-- Table -->
        <div class="table-card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>요청 번호</th>
                        <th>객실</th>
                        <th>유형</th>
                        <th>상세 내용</th>
                        <th>우선순위</th>
                        <th>담당자</th>
                        <th>상태</th>
                        <th>등록일</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody id="mtTableBody">
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- New Request Modal -->
<div class="modal-overlay" id="newRequestModal" onclick="if(event.target===this)closeModal('newRequestModal')">
    <div class="modal-card" style="max-width:520px;width:95vw">
        <div class="modal-header">
            <h3 class="modal-title">시설 보수 요청 등록</h3>
            <button class="modal-close" onclick="closeModal('newRequestModal')"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:16px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                    <label class="form-label">객실 번호 <span style="color:var(--danger)">*</span></label>
                    <input type="text" class="form-input" style="width:100%" placeholder="예: 1205">
                </div>
                <div>
                    <label class="form-label">유형 <span style="color:var(--danger)">*</span></label>
                    <select class="form-input" style="width:100%">
                        <option>전기/조명</option>
                        <option>배관/수도</option>
                        <option>에어컨/냉난방</option>
                        <option>가구/비품</option>
                        <option>도어/잠금장치</option>
                        <option>기타</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="form-label">상세 내용</label>
                <textarea class="form-input" style="width:100%;min-height:80px;resize:vertical" placeholder="증상 및 위치를 구체적으로 작성해주세요."></textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                    <label class="form-label">우선순위</label>
                    <select class="form-input" style="width:100%">
                        <option value="urgent">긴급 (즉시 처리)</option>
                        <option value="high">높음</option>
                        <option value="normal" selected>일반</option>
                    </select>
                </div>
                <div>
                    <label class="form-label">담당자 배정</label>
                    <select class="form-input" style="width:100%">
                        <option>김철수 (시설팀장)</option>
                        <option>이영호 (전기담당)</option>
                        <option>박미래 (배관담당)</option>
                        <option>미배정</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-outline" onclick="closeModal('newRequestModal')">취소</button>
            <button class="btn-primary-sm" onclick="showToast('요청이 등록되었습니다.'); closeModal('newRequestModal');"><i class="fa-solid fa-check"></i> 등록</button>
        </div>
    </div>
</div>

<script>
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function showToast(msg) {
    let t = document.getElementById('toast');
    if(!t) { t = document.createElement('div'); t.id='toast'; t.style.cssText='position:fixed;bottom:24px;right:24px;background:#1e293b;color:#fff;padding:12px 20px;border-radius:8px;z-index:9999;font-size:0.85rem;'; document.body.appendChild(t); }
    t.textContent = msg; t.style.display='block';
    setTimeout(()=>{ t.style.display='none'; }, 3000);
}

const requests = [
    { id:'MT-001', room:'1205', type:'에어컨/냉난방', desc:'에어컨 소음 심각, 냉방 불량', priority:'urgent', assignee:'이영호', status:'open', date:'2025-05-21' },
    { id:'MT-002', room:'0803', type:'배관/수도', desc:'세면대 배수 막힘', priority:'high', assignee:'박미래', status:'in-progress', date:'2025-05-20' },
    { id:'MT-003', room:'PH01', type:'전기/조명', desc:'욕실 조명 교체 필요', priority:'normal', assignee:'김철수', status:'in-progress', date:'2025-05-20' },
    { id:'MT-004', room:'1401', type:'가구/비품', desc:'침대 프레임 삐걱 소리', priority:'normal', assignee:'미배정', status:'open', date:'2025-05-19' },
    { id:'MT-005', room:'0801', type:'도어/잠금장치', desc:'도어락 배터리 교체', priority:'high', assignee:'김철수', status:'done', date:'2025-05-18' },
    { id:'MT-006', room:'1202', type:'에어컨/냉난방', desc:'온도 조절 불가', priority:'urgent', assignee:'이영호', status:'open', date:'2025-05-22' },
    { id:'MT-007', room:'V-01', type:'전기/조명', desc:'거실 조명 스위치 불량', priority:'normal', assignee:'미배정', status:'open', date:'2025-05-22' },
];

const priorityLabel = { urgent:'긴급', high:'높음', normal:'일반' };
const priorityClass = { urgent:'priority-urgent', high:'priority-high', normal:'priority-normal' };
const statusLabel = { open:'신규 요청', 'in-progress':'진행 중', done:'완료' };
const statusClass = { open:'status-open', 'in-progress':'status-progress', done:'status-done' };

let currentStatusFilter = 'all';

function filterMt(status) {
    if(status) currentStatusFilter = status;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.chip').forEach(c => {
        if(c.getAttribute('onclick') && c.getAttribute('onclick').includes(`'${currentStatusFilter}'`)) c.classList.add('active');
    });
    const pf = document.getElementById('priorityFilter').value;
    const filtered = requests.filter(r => {
        const statusMatch = currentStatusFilter === 'all' || r.status === currentStatusFilter;
        const priorityMatch = !pf || r.priority === pf;
        return statusMatch && priorityMatch;
    });
    renderTable(filtered);
}

function renderTable(data) {
    const tbody = document.getElementById('mtTableBody');
    if(!data) data = requests;
    tbody.innerHTML = data.map(r => `
        <tr>
            <td><strong>${r.id}</strong></td>
            <td>${r.room}호</td>
            <td>${r.type}</td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.desc}</td>
            <td><span class="priority-badge ${priorityClass[r.priority]}">${priorityLabel[r.priority]}</span></td>
            <td>${r.assignee}</td>
            <td><span class="status-badge ${statusClass[r.status]}">${statusLabel[r.status]}</span></td>
            <td>${r.date}</td>
            <td>
                <button class="btn-outline-sm" onclick="showToast('담당자 배정 창을 엽니다.')">배정</button>
                <button class="btn-outline-sm" onclick="showToast('상태가 업데이트 되었습니다.')">상태 변경</button>
            </td>
        </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => { renderTable(); });
</script>
</body>
</html>"""
        w(mt, mt_full)
        print("✓ maintenance.html (REBUILT)")
    else:
        c = bulk_replace(c, [
            ('>Add Request<', '>요청 등록<'),
            ('"Add Request"', '"요청 등록"'),
            ('>Assign<', '>배정<'),
            ('"Assign"', '"배정"'),
            ('>Complete<', '>완료<'),
            ('>Cancel<', '>취소<'),
            ('>Close<', '>닫기<'),
            ('Priority', '우선순위'),
            ('New Requests', '신규 요청'),
            ('In Progress', '진행 중'),
            ('Completed', '완료'),
        ])
        w(mt, c)
        print("✓ maintenance.html (patched)")

print("\nAll Korean localization done!")
