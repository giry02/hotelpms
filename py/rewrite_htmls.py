import os

blocks_html = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>객실 배정 - Hotel PMS</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="../common/css/dashboard.css">
    <link rel="stylesheet" href="../common/css/frontdesk.css">
    <script src="../common/js/api/api-core.js"></script>
    <script src="../common/js/api/api-frontdesk.js"></script>
    <script src="../common/js/i18n.js"></script>
    <script src="../common/js/sidebar.js"></script>
    <script src="../common/js/ui-components.js"></script>
    <script src="../common/js/topbar.js"></script>
    <script src="../common/js/guest-search.js"></script>
    <script src="../common/js/reservation-actions.js"></script>
    <style>
        .filter-bar-mt {
            display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 24px;
            padding: 12px 20px; background: #fff; border: 1px solid var(--border); border-radius: 14px;
        }
        .filter-left { display: flex; align-items: center; gap: 12px; flex: 1; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .filter-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
        .search-box-mt {
            display: flex; align-items: center; gap: 8px;
            padding: 7px 14px; border: 1.5px solid var(--border); border-radius: 8px;
            background: #fff; transition: border-color .2s; width: 220px;
        }
        .search-box-mt:focus-within { border-color: var(--primary); }
        .search-box-mt i { color: var(--txt3); font-size: .85rem; }
        .search-box-mt input { border: none; outline: none; font-family: var(--font); font-size: .82rem; color: var(--txt); width: 100%; background: transparent; padding: 0; margin: 0; }
        @media(max-width:768px){
            .filter-bar-mt { flex-direction: column; align-items: stretch; padding: 12px; gap: 10px; }
            .search-box-mt { flex: 1; min-width: 0; width: auto; }
        }

        .modal-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,.45);
            z-index: 500;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; visibility: hidden;
            transition: opacity .2s, visibility .2s;
            backdrop-filter: blur(3px);
        }
        .modal-overlay.active { opacity: 1; visibility: visible; }
        .modal-card {
            background: #fff; border-radius: 12px;
            width: 560px; max-width: 95vw; max-height: 90vh;
            display: flex; flex-direction: column;
            box-shadow: 0 20px 60px rgba(0,0,0,.2);
            transform: scale(.95); transition: transform .2s;
        }
        .modal-overlay.active .modal-card { transform: scale(1); }
        .modal-header { padding: 18px 20px; border-bottom: 1px solid var(--border2); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .modal-header h3 { font-size: 1rem; font-weight: 700; margin: 0; }
        .modal-close { width: 28px; height: 28px; border: none; background: none; color: var(--txt3); cursor: pointer; font-size: .9rem; display: flex; align-items: center; justify-content: center; border-radius: 6px; }
        .modal-close:hover { background: var(--border2); }
        .modal-body { padding: 20px; overflow-y: auto; flex: 1; }
        .modal-footer { padding: 14px 20px; border-top: 1px solid var(--border2); display: flex; justify-content: flex-end; gap: 8px; flex-shrink: 0; }

        .group-card {
            background: #fff; border: 1px solid var(--border); border-radius: 12px;
            padding: 20px; display: flex; flex-direction: column; gap: 16px;
            transition: box-shadow 0.2s;
        }
        .group-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
        .group-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .group-name { font-size: 1rem; font-weight: 700; color: var(--txt); }
        .group-type { font-size: 0.75rem; color: var(--txt3); font-weight: 500; }
        .group-meta { display: flex; flex-wrap: wrap; gap: 10px; }
        .group-meta-item { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--txt2); }
        .group-meta-item i { color: var(--txt3); width: 14px; }
        .group-card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border2); padding-top: 14px; }
        .group-rooms { display: flex; gap: 16px; }
        .group-room-stat { text-align: center; }
        .group-room-stat .val { font-size: 1.2rem; font-weight: 800; color: var(--primary); }
        .group-room-stat .lbl { font-size: 0.7rem; color: var(--txt3); font-weight: 500; }
        .progress-bar { height: 6px; background: var(--border2); border-radius: 99px; overflow: hidden; margin-top: 4px; }
        .progress-fill { height: 100%; background: var(--primary); border-radius: 99px; transition: width 0.4s; }
        .status-pill {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 4px 12px; border-radius: 20px;
            font-size: 0.72rem; font-weight: 700;
        }
        .pill-confirmed { background: #EFF6FF; color: #2563EB; }
        .pill-inhouse   { background: #ECFDF5; color: #059669; }
        .pill-pending   { background: #FEF3C7; color: #D97706; }
        .pill-departed  { background: #F1F5F9; color: #64748B; }
        .kpi-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        @media(max-width: 768px) { .kpi-grid-4 { grid-template-columns: repeat(2, 1fr); } }
    </style>
</head>
<body>
    <div id="sidebar-root"></div>
    <div class="main-content">
        <header class="topbar">
            <div class="topbar-left">
                <button class="mobile-menu-btn" onclick="PMS_Sidebar.toggleMenu()">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <h1 data-i18n-key="Room Assignment">객실 배정</h1>
            </div>
            <div class="topbar-right">
                <div class="search-box">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="예약번호, 고객명 검색..." id="global-search-input">
                </div>
                <button class="btn-icon" title="알림"><i class="fa-regular fa-bell"></i><span class="badge">3</span></button>
                <button class="btn-icon" title="설정"><i class="fa-solid fa-gear"></i></button>
                <select id="langSelect" class="lang-select" onchange="changeLang(this.value)">
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                </select>
            </div>
        </header>

        <div class="content">
            <!-- KPI Cards -->
            <div class="kpi-grid-4">
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:#EFF6FF;color:#2563EB"><i class="fa-solid fa-users-rectangle"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">전체 행사</div>
                        <div class="kpi-value">5</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:#ECFDF5;color:#059669"><i class="fa-solid fa-bed"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">현재 투숙 중</div>
                        <div class="kpi-value">2</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:#F5F3FF;color:#7C3AED"><i class="fa-solid fa-door-open"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">블록 배정 객실</div>
                        <div class="kpi-value">128</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:#FFF7ED;color:#EA580C"><i class="fa-solid fa-file-invoice-dollar"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">미정산 단체</div>
                        <div class="kpi-value">1</div>
                    </div>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="filter-bar-mt">
                <div class="filter-left">
                    <div style="display:flex;align-items:center;gap:8px">
                        <div class="search-box-mt">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            <input type="text" placeholder="행사(블록)명 검색..." oninput="searchGroups(this.value)">
                        </div>
                    </div>
                    <div class="filter-chips">
                        <button class="chip active" onclick="filterGroups('all', this)" id="chip-all">전체</button>
                        <button class="chip" onclick="filterGroups('confirmed', this)" id="chip-confirmed">확정</button>
                        <button class="chip" onclick="filterGroups('inhouse', this)" id="chip-inhouse">투숙 중</button>
                        <button class="chip" onclick="filterGroups('pending', this)" id="chip-pending">대기</button>
                        <button class="chip" onclick="filterGroups('departed', this)" id="chip-departed">체크아웃</button>
                    </div>
                </div>
                <div class="filter-right">
                    <button class="btn-outline" style="height:38px"><i class="fa-solid fa-download"></i> 다운로드</button>
                    <button class="btn-primary-sm" style="height:38px;padding:0 16px" onclick="openNewGroupModal()">
                        <i class="fa-solid fa-plus"></i> 신규 객실 배정
                    </button>
                </div>
            </div>

            <!-- Group Cards Grid -->
            <div id="groupGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(440px,1fr));gap:16px">
            </div>
            <div id="emptyState" style="display:none;text-align:center;padding:60px 20px;color:var(--txt3)">
                <i class="fa-solid fa-users-slash" style="font-size:2.5rem;margin-bottom:12px;display:block"></i>
                해당 조건의 단체 예약이 없습니다.
            </div>

        </div>
    </div>

    <!-- 신규 행사(블록) 등록 Modal -->
    <div class="modal-overlay" id="newGroupModal" onclick="if(event.target===this)closeModal('newGroupModal')">
        <div class="modal-card" style="max-width:560px;width:95vw">
            <div class="modal-header">
                <h3 class="modal-title" id="ngModalTitle">신규 객실 배정</h3>
                <input type="hidden" id="ngId" value="">
                <button class="modal-close" onclick="closeModal('newGroupModal')"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body" style="display:flex;flex-direction:column;gap:16px">
                <div>
                    <label class="form-label">행사(블록)명 <span style="color:var(--danger)">*</span></label>
                    <input type="text" id="ngName" class="form-input" style="width:100%" placeholder="예: Samsung Tech Conference 2026">
                </div>
                <div>
                    <label class="form-label">주관 업체 (Agency / Corporate) <span style="color:var(--danger)">*</span></label>
                    <select id="ngAgency" class="form-input" style="width:100%">
                        <!-- Dynamically populated -->
                    </select>
                </div>
                <div>
                    <label class="form-label">행사 유형</label>
                    <select id="ngType" class="form-input" style="width:100%">
                        <option>기업 행사 / 컨퍼런스</option>
                        <option>결혼식 / 웨딩</option>
                        <option>여행사 단체</option>
                        <option>스포츠팀</option>
                        <option>기타</option>
                    </select>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                    <div>
                        <label class="form-label">체크인 <span style="color:var(--danger)">*</span></label>
                        <input type="date" id="ngCheckin" class="form-input" style="width:100%">
                    </div>
                    <div>
                        <label class="form-label">체크아웃 <span style="color:var(--danger)">*</span></label>
                        <input type="date" id="ngCheckout" class="form-input" style="width:100%">
                    </div>
                </div>
                <!-- Dynamic Room Allocation -->
                <div style="background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <label class="form-label" style="margin:0;">객실 할당 및 가변 단가 설정 <span style="color:var(--danger)">*</span></label>
                        <button class="btn-outline-sm" onclick="addAllocationRow()" type="button"><i class="fa-solid fa-plus"></i> 객실 추가</button>
                    </div>
                    <div id="allocationContainer" style="display:flex; flex-direction:column; gap:8px;">
                        <!-- Rows will be added here via JS -->
                    </div>
                    <div style="margin-top:12px; font-weight:600; font-size:0.85rem; color:var(--txt);">
                        총 할당 객실 수: <span id="ngTotalBlock" style="color:var(--primary); font-size:1rem;">0</span> 객실
                    </div>
                </div>
                <div>
                    <label class="form-label">총 인원 (PAX)</label>
                    <input type="number" id="ngPax" class="form-input" style="width:100%" min="1" placeholder="20">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                    <div>
                        <label class="form-label">결제 방식</label>
                        <select id="ngRouting" class="form-input" style="width:100%">
                            <option>Master Folio (단체 일괄)</option>
                            <option>Individual (개별 정산)</option>
                            <option>혼합 (일부 단체/일부 개별)</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">담당 영업 직원</label>
                        <select id="ngSales" class="form-input" style="width:100%">
                            <option>김지연 (영업담당)</option>
                            <option>이수진 (세일즈)</option>
                            <option>담당자 없음</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="form-label">담당자 연락처</label>
                    <input type="text" id="ngContact" class="form-input" style="width:100%" placeholder="예: 홍길동 / 010-1234-5678">
                </div>
                <div>
                    <label class="form-label">특이사항 / 메모</label>
                    <textarea id="ngNote" class="form-input" style="width:100%;min-height:70px;resize:vertical" placeholder="VIP 요청, 조식 포함, 특별 케이터링 등..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-outline" onclick="closeModal('newGroupModal')">취소</button>
                <button class="btn-primary-sm" onclick="saveGroup()"><i class="fa-solid fa-check"></i> 저장</button>
            </div>
        </div>
    </div>

    <!-- 행사 상세 Modal -->
    <div class="modal-overlay" id="groupDetailModal" onclick="if(event.target===this)closeModal('groupDetailModal')">
        <div class="modal-card" style="max-width:600px;width:95vw">
            <div class="modal-header">
                <h3 class="modal-title" id="detailGroupName">행사 상세</h3>
                <button class="modal-close" onclick="closeModal('groupDetailModal')"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body" id="detailBody" style="padding:0">
            </div>
            <div class="modal-footer">
                <button class="btn-outline" onclick="closeModal('groupDetailModal')">닫기</button>
                <button class="btn-primary-sm" onclick="showToast('Master Folio 정산 화면으로 이동합니다.')"><i class="fa-solid fa-file-invoice-dollar"></i> 정산 보기</button>
            </div>
        </div>
    </div>

<script>
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function showToast(msg) {
    let t = document.getElementById('_toast');
    if (!t) {
        t = document.createElement('div');
        t.id = '_toast';
        t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1e293b;color:#fff;padding:12px 20px;border-radius:8px;z-index:9999;font-size:0.85rem;font-family:var(--font);box-shadow:0 4px 20px rgba(0,0,0,0.2)';
        document.body.appendChild(t);
    }
    t.textContent = msg; t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3000);
}

const statusMap = {
    confirmed: { label: '확정',      cls: 'pill-confirmed' },
    inhouse:   { label: '투숙 중',   cls: 'pill-inhouse' },
    pending:   { label: '대기',      cls: 'pill-pending' },
    departed:  { label: '체크아웃',  cls: 'pill-departed' },
};

let groups = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    let stored = localStorage.getItem('pms_groups');
    if(stored) {
        groups = JSON.parse(stored);
    } else {
        groups = [
            {
                id: 'GRP-1001', name: 'Samsung Tech Conference 2026', agency: '삼성전자 (Samsung)', type: '기업 행사 / 컨퍼런스', checkin: '2026-05-20', checkout: '2026-05-23', block: 35, pax: 70, routing: 'Master Folio (단체 일괄)', sales: '김지연', contact: '홍길동 부장 (010-1111-2222)', note: '조식 70명 포함, 컨퍼런스룸 A 대여', status: 'inhouse', pickup: 32,
                allocations: [ { type: 'Standard Double', count: 30, rate: 120000 }, { type: 'Suite', count: 5, rate: 250000 } ]
            }
        ];
        localStorage.setItem('pms_groups', JSON.stringify(groups));
    }
    updateFilterCounts();
    renderGroups();

    // Auto open logic
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('newBlock') === 'true') {
        setTimeout(() => { window.openNewGroupModal(); }, 300);
    }
});

function loadCompaniesForDropdown() {
    const stored = localStorage.getItem('pms_companies');
    const sel = document.getElementById('ngAgency');
    if (!sel) return;
    sel.innerHTML = '<option value="">주관 업체를 선택하세요</option>';
    
    if (stored) {
        const comps = JSON.parse(stored);
        comps.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.name} (${c.type === 'Corporate' ? '기업' : '여행사/기타'})`;
            sel.appendChild(opt);
        });
    }
}

window.openNewGroupModal = function() {
    loadCompaniesForDropdown();
    
    document.getElementById('ngModalTitle').textContent = '신규 객실 배정';
    document.getElementById('ngId').value = '';
    document.getElementById('ngName').value = '';
    document.getElementById('ngAgency').selectedIndex = 0;
    document.getElementById('ngCheckin').value = '';
    document.getElementById('ngCheckout').value = '';
    document.getElementById('ngPax').value = '';
    document.getElementById('ngContact').value = '';
    document.getElementById('ngNote').value = '';
    
    document.getElementById('allocationContainer').innerHTML = '';
    addAllocationRow(); // Add one default row
    
    const urlParams = new URLSearchParams(window.location.search);
    const preComp = urlParams.get('comp');
    if(preComp) {
        setTimeout(() => { document.getElementById('ngAgency').value = preComp; }, 50);
    }
    
    openModal('newGroupModal');
}

function filterGroups(status, btn) {
    currentFilter = status;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderGroups();
}

function searchGroups(val) {
    renderGroups(val);
}

function renderGroups(search = '') {
    const grid = document.getElementById('groupGrid');
    const empty = document.getElementById('emptyState');
    const filtered = groups.filter(g => {
        const statusMatch = currentFilter === 'all' || g.status === currentFilter;
        const searchMatch = !search || g.name.toLowerCase().includes(search.toLowerCase());
        return statusMatch && searchMatch;
    });

    if (filtered.length === 0) {
        grid.style.display = 'none'; empty.style.display = 'block'; return;
    }
    grid.style.display = 'grid'; empty.style.display = 'none';

    grid.innerHTML = filtered.map(g => {
        const pct = g.block > 0 ? Math.round((g.pickup / g.block) * 100) : 0;
        const s = statusMap[g.status];
        return `
        <div class="group-card">
            <div class="group-card-header">
                <div>
                    <div class="group-name">${g.name}</div>
                    <div class="group-type">${g.type} · ${g.id}</div>
                </div>
                <span class="status-pill ${s.cls}">${s.label}</span>
            </div>
            <div class="group-meta">
                <div class="group-meta-item"><i class="fa-solid fa-calendar-check"></i> ${g.checkin} ~ ${g.checkout}</div>
                <div class="group-meta-item"><i class="fa-solid fa-person"></i> ${g.pax}명</div>
                <div class="group-meta-item"><i class="fa-solid fa-file-invoice-dollar"></i> ${g.routing}</div>
                <div class="group-meta-item"><i class="fa-solid fa-phone"></i> ${g.contact}</div>
            </div>
            <div style="background:#F8FAFC; border-radius:6px; padding:8px 10px; font-size:0.75rem; color:var(--txt2); margin-top:8px;">
                <div style="font-weight:600; margin-bottom:4px; color:var(--txt);">객실 할당 내역</div>
                ${g.allocations ? g.allocations.map(a => `
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                        <span>- ${a.type}</span>
                        <span>${a.count}실 (단가: ${a.rate ? a.rate.toLocaleString() : '-'}원)</span>
                    </div>
                `).join('') : '<div style="color:var(--txt3)">할당 내역 없음</div>'}
            </div>
            <div style="margin-top:12px;">
                <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--txt2);margin-bottom:6px">
                    <span>전체 객실 픽업률</span>
                    <span style="font-weight:700;color:var(--primary)">${g.pickup} / ${g.block} 실 (${pct}%)</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
            </div>
            <div class="group-card-footer">
                <div style="font-size:0.78rem;color:var(--txt3)">담당: ${g.sales}</div>
                <div style="display:flex;gap:8px">
                    <button class="btn-outline-sm" onclick="showDetail('${g.id}')" title="상세"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn-outline-sm" onclick="editGroup('${g.id}')" title="수정"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-outline-sm" onclick="deleteGroup('${g.id}')" title="삭제" style="color:var(--danger);border-color:var(--danger)"><i class="fa-solid fa-trash"></i></button>
                    <button class="btn-outline-sm" onclick="showToast('정산 화면으로 이동합니다.')"><i class="fa-solid fa-receipt"></i> 정산</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function showDetail(id) {
    const g = groups.find(x => x.id === id);
    if (!g) return;
    document.getElementById('detailGroupName').textContent = g.name;
    const s = statusMap[g.status];
    document.getElementById('detailBody').innerHTML = `
        <div style="padding:20px;display:flex;flex-direction:column;gap:14px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">주관 업체</div><div style="font-weight:600">${g.agency || '-'}</div></div>
                <div><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">행사 유형</div><div style="font-weight:600">${g.type}</div></div>
                <div><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">상태</div><span class="status-pill ${s.cls}">${s.label}</span></div>
                <div><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">체크인</div><div style="font-weight:600">${g.checkin}</div></div>
                <div><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">체크아웃</div><div style="font-weight:600">${g.checkout}</div></div>
                <div><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">총 인원 (PAX)</div><div style="font-weight:600">${g.pax}명</div></div>
                <div><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">결제 방식</div><div style="font-weight:600">${g.routing}</div></div>
                <div style="grid-column:1/-1"><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">담당자 연락처</div><div style="font-weight:600">${g.contact}</div></div>
                <div style="grid-column:1/-1"><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">특이사항</div><div style="font-weight:500;color:var(--txt2)">${g.note || '없음'}</div></div>
            </div>
            
            <div style="margin-top:16px; border-top:1px solid var(--border); padding-top:16px;">
                <div style="font-size:0.85rem; font-weight:700; margin-bottom:10px;">객실 할당 상세 및 가변 단가</div>
                ${g.allocations && g.allocations.length > 0 ? `
                <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                    <thead>
                        <tr style="background:var(--bg); color:var(--txt2);">
                            <th style="padding:6px; text-align:left; border-bottom:1px solid var(--border);">객실 타입</th>
                            <th style="padding:6px; text-align:right; border-bottom:1px solid var(--border);">할당 객실</th>
                            <th style="padding:6px; text-align:right; border-bottom:1px solid var(--border);">특별 단가</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${g.allocations.map(a => `
                        <tr>
                            <td style="padding:6px; border-bottom:1px solid #f1f5f9;">${a.type}</td>
                            <td style="padding:6px; text-align:right; border-bottom:1px solid #f1f5f9;">${a.count}실</td>
                            <td style="padding:6px; text-align:right; border-bottom:1px solid #f1f5f9;">${a.rate ? a.rate.toLocaleString() + '원' : '-'}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<div style="font-size:0.8rem; color:var(--txt3);">할당 내역이 없습니다. (구버전 데이터)</div>'}
            </div>
        </div>`;
    openModal('groupDetailModal');
}

function updateFilterCounts() {
    document.getElementById('chip-all').innerHTML = `전체 (${groups.length})`;
    document.getElementById('chip-confirmed').innerHTML = `확정 (${groups.filter(g=>g.status==='confirmed').length})`;
    document.getElementById('chip-inhouse').innerHTML = `투숙 중 (${groups.filter(g=>g.status==='inhouse').length})`;
    document.getElementById('chip-pending').innerHTML = `대기 (${groups.filter(g=>g.status==='pending').length})`;
    document.getElementById('chip-departed').innerHTML = `체크아웃 (${groups.filter(g=>g.status==='departed').length})`;
}

function addAllocationRow(type='Standard Double', count=1, rate='') {
    const container = document.getElementById('allocationContainer');
    const row = document.createElement('div');
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '2fr 1fr 1.5fr auto';
    row.style.gap = '8px';
    row.style.alignItems = 'center';
    
    row.innerHTML = `
        <select class="form-input alloc-type" style="width:100%; padding:6px 10px; font-size:0.85rem;">
            <option ${type==='Standard Double'?'selected':''}>Standard Double</option>
            <option ${type==='Deluxe Twin'?'selected':''}>Deluxe Twin</option>
            <option ${type==='Suite'?'selected':''}>Suite</option>
        </select>
        <input type="number" class="form-input alloc-count" style="width:100%; padding:6px 10px; font-size:0.85rem;" min="1" value="${count}" onchange="calcTotalBlock()" placeholder="수량">
        <input type="number" class="form-input alloc-rate" style="width:100%; padding:6px 10px; font-size:0.85rem;" value="${rate}" placeholder="특별단가(KRW)">
        <button type="button" class="btn-outline-sm" style="color:var(--danger); border-color:var(--danger); padding:4px 8px;" onclick="this.parentElement.remove(); calcTotalBlock();"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(row);
    calcTotalBlock();
}

function calcTotalBlock() {
    const counts = document.querySelectorAll('.alloc-count');
    let total = 0;
    counts.forEach(c => total += parseInt(c.value || 0));
    document.getElementById('ngTotalBlock').textContent = total;
}

function saveGroup() {
    const id = document.getElementById('ngId').value;
    const name = document.getElementById('ngName').value;
    if (!name) { alert('행사(블록)명을 입력하세요.'); return; }
    
    const agency = document.getElementById('ngAgency').value;
    const type = document.getElementById('ngType').value;
    const checkin = document.getElementById('ngCheckin').value;
    const checkout = document.getElementById('ngCheckout').value;
    const pax = document.getElementById('ngPax').value || 0;
    const routing = document.getElementById('ngRouting').value;
    const sales = document.getElementById('ngSales').value.split(' ')[0];
    const contact = document.getElementById('ngContact').value;
    const note = document.getElementById('ngNote').value;

    const allocRows = document.getElementById('allocationContainer').children;
    let allocations = [];
    let block = 0;
    for(let i=0; i<allocRows.length; i++) {
        const row = allocRows[i];
        const rType = row.querySelector('.alloc-type').value;
        const rCount = parseInt(row.querySelector('.alloc-count').value || 0);
        const rRate = parseInt(row.querySelector('.alloc-rate').value || 0);
        if (rCount > 0) {
            allocations.push({ type: rType, count: rCount, rate: rRate });
            block += rCount;
        }
    }
    
    if (block === 0) { alert('최소 1개 이상의 객실을 할당해야 합니다.'); return; }

    if (id) {
        const g = groups.find(x => x.id === id);
        if (g) {
            g.name = name; g.agency = agency; g.type = type; g.checkin = checkin; g.checkout = checkout;
            g.block = block; g.allocations = allocations; g.pax = parseInt(pax); g.routing = routing;
            g.sales = sales; g.contact = contact; g.note = note;
        }
        showToast('행사 정보가 수정되었습니다.');
    } else {
        const newId = 'GRP-' + Math.floor(Math.random()*10000);
        groups.unshift({
            id: newId, name, agency, type, checkin, checkout, block: block, allocations: allocations,
            pax: parseInt(pax), routing, sales, contact, note,
            status: 'confirmed', pickup: 0
        });
        showToast('신규 객실 배정이 등록되었습니다.');
    }
    
    localStorage.setItem('pms_groups', JSON.stringify(groups));
    closeModal('newGroupModal');
    updateFilterCounts();
    renderGroups();
}

function editGroup(id) {
    loadCompaniesForDropdown();
    const g = groups.find(x => x.id === id);
    if (!g) return;
    document.getElementById('ngModalTitle').textContent = '객실 배정 수정';
    document.getElementById('ngId').value = g.id;
    document.getElementById('ngName').value = g.name || '';
    
    if(g.agency) {
        const agencySel = document.getElementById('ngAgency');
        const aMatch = Array.from(agencySel.options).find(o => o.value.includes(g.agency) || g.agency.includes(o.value));
        if (aMatch) agencySel.value = aMatch.value;
    }
    
    document.getElementById('ngType').value = g.type || '기업 행사 / 컨퍼런스';
    document.getElementById('ngCheckin').value = g.checkin || '';
    document.getElementById('ngCheckout').value = g.checkout || '';
    document.getElementById('ngPax').value = g.pax || '';
    
    const routingSel = document.getElementById('ngRouting');
    const rMatch = Array.from(routingSel.options).find(o => o.value.includes(g.routing) || g.routing.includes(o.value));
    if (rMatch) routingSel.value = rMatch.value;

    const salesSel = document.getElementById('ngSales');
    const sMatch = Array.from(salesSel.options).find(o => o.value.includes(g.sales) || g.sales.includes(o.value));
    if (sMatch) salesSel.value = sMatch.value;

    document.getElementById('ngContact').value = g.contact || '';
    document.getElementById('ngNote').value = g.note || '';
    
    document.getElementById('allocationContainer').innerHTML = '';
    if (g.allocations && g.allocations.length > 0) {
        g.allocations.forEach(a => {
            addAllocationRow(a.type, a.count, a.rate);
        });
    } else {
        addAllocationRow('Standard Double', g.block || 1, '');
    }
    
    openModal('newGroupModal');
}

function deleteGroup(id) {
    const g = groups.find(x => x.id === id);
    if (!g) return;
    if (confirm(`정말 [${g.name}] 행사를 취소(삭제)하시겠습니까? 관련된 예약에 영향을 줄 수 있습니다.`)) {
        groups = groups.filter(x => x.id !== id);
        localStorage.setItem('pms_groups', JSON.stringify(groups));
        showToast('행사가 취소/삭제되었습니다.');
        updateFilterCounts();
        renderGroups();
    }
}
</script>
</body>
</html>
"""

companies_html = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>단체업체 관리 - Hotel PMS</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../common/css/dashboard.css">
    <script src="../common/js/i18n.js"></script>
    <script src="../common/js/api/api-frontdesk.js"></script>
<style>
.kpi-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
@media(max-width: 768px) { .kpi-grid-4 { grid-template-columns: repeat(2, 1fr); } }

.filter-bar-mt {
    display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 24px;
    padding: 12px 20px; background: #fff; border: 1px solid var(--border); border-radius: 14px;
}
.filter-left { display: flex; align-items: center; gap: 12px; flex: 1; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.filter-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
.search-box-mt {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 14px; border: 1.5px solid var(--border); border-radius: 8px;
    background: #fff; transition: border-color .2s; width: 220px;
}
.search-box-mt:focus-within { border-color: var(--primary); }
.search-box-mt i { color: var(--txt3); font-size: .85rem; }
.search-box-mt input { border: none; outline: none; font-family: var(--font); font-size: .82rem; color: var(--txt); width: 100%; background: transparent; padding: 0; margin: 0; }

.company-card {
    background: #fff; border: 1px solid var(--border); border-radius: 12px;
    padding: 20px; display: flex; flex-direction: column; gap: 12px;
    transition: transform 0.2s, box-shadow 0.2s;
}
.company-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
.company-header { display: flex; justify-content: space-between; align-items: flex-start; }
.company-name { font-size: 1.15rem; font-weight: 700; color: var(--txt); margin-bottom: 4px; }
.company-type { font-size: 0.8rem; color: var(--txt2); font-weight: 500; }
.company-meta {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.82rem; color: var(--txt2);
    background: var(--bg); padding: 12px; border-radius: 8px;
}
.company-meta div { display: flex; align-items: center; gap: 6px; }
.company-meta i { color: var(--primary); width: 14px; text-align:center; }
.card-footer-btns { display: flex; gap: 8px; margin-top: 8px; justify-content: space-between; align-items: center; }

.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.pill-active { background: #ECFDF5; color: #059669; }
.pill-inactive { background: #F3F4F6; color: #4B5563; }
</style>
</head>
<body>
    <div id="sidebar-root"></div>
    <div class="main-content">
        <header class="topbar">
            <div class="topbar-left">
                <button class="mobile-menu-btn" onclick="PMS_Sidebar.toggleMenu()">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <h1 data-i18n-key="Group Companies">단체업체 관리</h1>
            </div>
            <div class="topbar-right">
                <div class="search-box">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="예약번호, 고객명 검색..." id="global-search-input">
                </div>
                <button class="btn-icon" title="알림"><i class="fa-regular fa-bell"></i><span class="badge">3</span></button>
                <button class="btn-icon" title="설정"><i class="fa-solid fa-gear"></i></button>
                <select id="langSelect" class="lang-select" onchange="changeLang(this.value)">
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                </select>
            </div>
        </header>
        <div class="content">
            <!-- KPI Cards -->
            <div class="kpi-grid-4">
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:#EFF6FF;color:#2563EB"><i class="fa-solid fa-building"></i></div>
                    <div class="kpi-info"><div class="kpi-label">등록 업체 수</div><div class="kpi-value" id="kpiTotal">0</div></div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:#ECFDF5;color:#059669"><i class="fa-solid fa-handshake"></i></div>
                    <div class="kpi-info"><div class="kpi-label">계약 활성</div><div class="kpi-value" id="kpiActive">0</div></div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:#F5F3FF;color:#7C3AED"><i class="fa-solid fa-calendar-check"></i></div>
                    <div class="kpi-info"><div class="kpi-label">진행/예정 행사</div><div class="kpi-value">2</div></div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:#FFF7ED;color:#EA580C"><i class="fa-solid fa-file-invoice-dollar"></i></div>
                    <div class="kpi-info"><div class="kpi-label">미정산 단체</div><div class="kpi-value">1</div></div>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="filter-bar-mt">
                <div class="filter-left">
                    <div class="search-box-mt">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" placeholder="업체명 검색..." oninput="searchCompanies(this.value)">
                    </div>
                    <div class="filter-chips">
                        <button class="chip active" onclick="filterCompanies('all', this)">전체</button>
                        <button class="chip" onclick="filterCompanies('Corporate', this)">일반 기업</button>
                        <button class="chip" onclick="filterCompanies('Travel Agency', this)">여행사</button>
                        <button class="chip" onclick="filterCompanies('Other', this)">기타</button>
                    </div>
                </div>
                <div class="filter-right">
                    <button class="btn-primary-sm" style="height:38px;padding:0 16px" onclick="openNewCompanyModal()">
                        <i class="fa-solid fa-plus"></i> 신규 업체 등록
                    </button>
                </div>
            </div>

            <div id="companyGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:16px"></div>
            
            <div id="emptyState" style="display:none;text-align:center;padding:60px 20px;color:var(--txt3)">
                <i class="fa-solid fa-building-circle-xmark" style="font-size:2.5rem;margin-bottom:12px;display:block"></i>
                등록된 업체가 없습니다.
            </div>

        </div>
    </div>

<!-- 신규/수정 업체 등록 모달 -->
<div class="modal-overlay" id="companyModal" onclick="if(event.target===this)closeModal('companyModal')">
    <div class="modal-card" style="max-width:500px;width:95vw">
        <div class="modal-header">
            <h3 class="modal-title" id="compModalTitle">업체 등록</h3>
            <input type="hidden" id="compId">
            <button class="modal-close" onclick="closeModal('companyModal')"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:16px">
            <div>
                <label class="form-label">업체명 (Company/Agency Name) <span style="color:var(--danger)">*</span></label>
                <input type="text" id="compName" class="form-input" style="width:100%" placeholder="예: 삼성전자">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                    <label class="form-label">업체 유형</label>
                    <select id="compType" class="form-input" style="width:100%">
                        <option value="Corporate">일반 기업 (Corporate)</option>
                        <option value="Travel Agency">여행사 (Travel Agency)</option>
                        <option value="Government">정부/공공기관</option>
                        <option value="Other">기타 단체 (스포츠팀, 종교 등)</option>
                    </select>
                </div>
                <div>
                    <label class="form-label">상태</label>
                    <select id="compStatus" class="form-input" style="width:100%">
                        <option value="active">계약 활성</option>
                        <option value="inactive">계약 만료/비활성</option>
                    </select>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                    <label class="form-label">담당자 이름</label>
                    <input type="text" id="compContactName" class="form-input" style="width:100%" placeholder="예: 김대리">
                </div>
                <div>
                    <label class="form-label">연락처</label>
                    <input type="text" id="compPhone" class="form-input" style="width:100%" placeholder="예: 010-1234-5678">
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                    <label class="form-label">계약 조건 (Discount/Comm)</label>
                    <input type="text" id="compRate" class="form-input" style="width:100%" placeholder="예: 객실 15% 할인">
                </div>
                <div>
                    <label class="form-label">정산 방식</label>
                    <select id="compBilling" class="form-input" style="width:100%">
                        <option>Master Folio (후불 월정산)</option>
                        <option>Individual (현장 개별결제)</option>
                        <option>가상계좌 선입금</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="form-label">메모</label>
                <textarea id="compNote" class="form-input" style="width:100%;min-height:60px;resize:vertical" placeholder="추가 계약사항 등"></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-outline" onclick="closeModal('companyModal')">취소</button>
            <button class="btn-primary-sm" onclick="saveCompany()"><i class="fa-solid fa-check"></i> 저장</button>
        </div>
    </div>
</div>

<script src="../common/js/sidebar.js"></script>
<script>
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function showToast(msg) {
    let t = document.getElementById('_toast');
    if (!t) {
        t = document.createElement('div');
        t.id = '_toast';
        t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1e293b;color:#fff;padding:12px 20px;border-radius:8px;z-index:9999;font-size:0.85rem;font-family:var(--font);box-shadow:0 4px 20px rgba(0,0,0,0.2)';
        document.body.appendChild(t);
    }
    t.textContent = msg; t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3000);
}

let companies = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    let stored = localStorage.getItem('pms_companies');
    if(stored) {
        companies = JSON.parse(stored);
    } else {
        companies = [
            { id: 'COMP-1001', name: '삼성전자 (Samsung)', type: 'Corporate', status: 'active', contactName: '김부장', phone: '02-2255-0000', rate: '객실 15% 할인', billing: 'Master Folio (후불 월정산)', note: '' },
            { id: 'COMP-1002', name: '하나투어 (Hana Tour)', type: 'Travel Agency', status: 'active', contactName: '이과장', phone: '02-1234-5678', rate: '커미션 10%', billing: '가상계좌 선입금', note: '' },
            { id: 'COMP-1003', name: '한화이글스', type: 'Other', status: 'active', contactName: '매니저', phone: '010-1111-2222', rate: '특별 단가 (유선협의)', billing: 'Master Folio (후불 월정산)', note: '' }
        ];
        localStorage.setItem('pms_companies', JSON.stringify(companies));
    }
    renderCompanies();
});

function filterCompanies(type, btn) {
    currentFilter = type;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    if(btn) btn.classList.add('active');
    renderCompanies();
}
function searchCompanies(val) { renderCompanies(val); }

function renderCompanies(search = '') {
    const grid = document.getElementById('companyGrid');
    const empty = document.getElementById('emptyState');
    
    document.getElementById('kpiTotal').textContent = companies.length;
    document.getElementById('kpiActive').textContent = companies.filter(c => c.status==='active').length;

    const filtered = companies.filter(c => {
        const typeMatch = currentFilter === 'all' || c.type === currentFilter;
        const searchMatch = !search || c.name.toLowerCase().includes(search.toLowerCase());
        return typeMatch && searchMatch;
    });

    if (filtered.length === 0) {
        grid.style.display = 'none'; empty.style.display = 'block'; return;
    }
    grid.style.display = 'grid'; empty.style.display = 'none';

    grid.innerHTML = filtered.map(c => {
        const typeName = c.type==='Corporate'?'일반 기업':c.type==='Travel Agency'?'여행사':c.type==='Government'?'정부/공공':'기타 단체';
        const badgeCls = c.status==='active'?'pill-active':'pill-inactive';
        const badgeTxt = c.status==='active'?'계약 활성':'계약 비활성';
        return `
        <div class="company-card">
            <div class="company-header">
                <div>
                    <div class="company-name">${c.name}</div>
                    <div class="company-type">${typeName} · ${c.id}</div>
                </div>
                <span class="status-badge ${badgeCls}">${badgeTxt}</span>
            </div>
            <div class="company-meta">
                <div><i class="fa-solid fa-user"></i> 담당: ${c.contactName || '-'}</div>
                <div><i class="fa-solid fa-phone"></i> ${c.phone || '-'}</div>
                <div><i class="fa-solid fa-percent"></i> ${c.rate || '-'}</div>
                <div><i class="fa-solid fa-credit-card"></i> ${c.billing || '-'}</div>
            </div>
            <div class="card-footer-btns">
                <button class="btn-primary-sm" style="flex:1" onclick="openBlockModal('${c.id}')">
                    <i class="fa-solid fa-bed"></i> 객실 배정
                </button>
                <div style="display:flex;gap:6px;">
                    <button class="btn-outline-sm" onclick="editCompany('${c.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-outline-sm" onclick="deleteCompany('${c.id}')" style="color:var(--danger);border-color:var(--danger)"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function openNewCompanyModal() {
    document.getElementById('compModalTitle').textContent = '신규 업체 등록';
    document.getElementById('compId').value = '';
    document.getElementById('compName').value = '';
    document.getElementById('compContactName').value = '';
    document.getElementById('compPhone').value = '';
    document.getElementById('compRate').value = '';
    document.getElementById('compNote').value = '';
    openModal('companyModal');
}

function editCompany(id) {
    const c = companies.find(x => x.id === id);
    if(!c) return;
    document.getElementById('compModalTitle').textContent = '업체 정보 수정';
    document.getElementById('compId').value = c.id;
    document.getElementById('compName').value = c.name;
    document.getElementById('compType').value = c.type;
    document.getElementById('compStatus').value = c.status;
    document.getElementById('compContactName').value = c.contactName;
    document.getElementById('compPhone').value = c.phone;
    document.getElementById('compRate').value = c.rate;
    document.getElementById('compNote').value = c.note || '';
    
    const bSel = document.getElementById('compBilling');
    const bMatch = Array.from(bSel.options).find(o => o.value.includes(c.billing) || (c.billing && c.billing.includes(o.value)));
    if(bMatch) bSel.value = bMatch.value;

    openModal('companyModal');
}

function saveCompany() {
    const id = document.getElementById('compId').value;
    const name = document.getElementById('compName').value;
    if(!name) { alert('업체명을 입력하세요.'); return; }
    
    const data = {
        name: name,
        type: document.getElementById('compType').value,
        status: document.getElementById('compStatus').value,
        contactName: document.getElementById('compContactName').value,
        phone: document.getElementById('compPhone').value,
        rate: document.getElementById('compRate').value,
        billing: document.getElementById('compBilling').value,
        note: document.getElementById('compNote').value
    };

    if(id) {
        const c = companies.find(x => x.id === id);
        Object.assign(c, data);
        showToast('업체 정보가 수정되었습니다.');
    } else {
        data.id = 'COMP-' + Math.floor(Math.random()*10000);
        companies.unshift(data);
        showToast('신규 업체가 등록되었습니다.');
    }
    localStorage.setItem('pms_companies', JSON.stringify(companies));
    closeModal('companyModal');
    renderCompanies();
}

function deleteCompany(id) {
    const c = companies.find(x => x.id === id);
    if(confirm(`정말 [${c.name}] 업체를 삭제하시겠습니까?`)) {
        companies = companies.filter(x => x.id !== id);
        localStorage.setItem('pms_companies', JSON.stringify(companies));
        showToast('업체가 삭제되었습니다.');
        renderCompanies();
    }
}

function openBlockModal(compId) {
    window.location.href = `groups_blocks.html?newBlock=true&comp=${compId}`;
}
</script>
</body>
</html>
"""

import os
with open(os.path.join('dashboard', 'frontdesk', 'groups_blocks.html'), 'w', encoding='utf-8') as f:
    f.write(blocks_html)
with open(os.path.join('dashboard', 'frontdesk', 'groups_companies.html'), 'w', encoding='utf-8') as f:
    f.write(companies_html)

print("HTML rewrites completed successfully.")
