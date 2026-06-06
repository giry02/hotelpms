/**
 * guest-search.js — 공통 회원 검색 모듈
 * reservation-timeline.html, reservation-list.html 등에서 공유
 *
 * 사용법:
 *   const gs = new GuestSearchWidget({
 *       searchInputId: 'nrSearchGuest',
 *       resultsId:     'guestSearchResults',
 *       selectedId:    'selectedGuestCard',
 *       newFormId:     'newGuestForm',
 *       guestNameId:   'nrGuest'
 *   });
 *
 *   gs.getSelectedGuest()  → { id, name, ... } 또는 null
 *   gs.getNewGuestName()   → string (신규 입력 이름)
 *   gs.reset()             → 상태 초기화
 */

// ===== 공통 게스트 DB =====
const GUEST_DB = [
    { id:'G-001', name:'Alexander',    phone:'+1 555-0102',      email:'alex@example.com',       country:'🇺🇸 미국',         tier:'Platinum', visits:5,  spend:4500 },
    { id:'G-002', name:'Sophia Kim',   phone:'+82 10-1234-5678', email:'sophia@example.com',     country:'🇰🇷 대한민국', tier:'Standard', visits:1,  spend:0 },
    { id:'G-003', name:'James Wilson', phone:'+44 20-7123-4567', email:'james@example.com',      country:'🇬🇧 UK',          tier:'Gold',     visits:12, spend:12000 },
    { id:'G-004', name:'Tran Linh',    phone:'+84 90-123-4567',  email:'tran.linh@example.com',  country:'🇻🇳 베트남',     tier:'VIP',      visits:8,  spend:9200 },
    { id:'G-005', name:'Tanaka Yuki',  phone:'+81 3-1234-5678',  email:'tanaka@example.com',     country:'🇯🇵 일본',       tier:'Gold',     visits:6,  spend:7800 },
    { id:'G-006', name:'Chen Wei',     phone:'+86 138-0000-0000',email:'chen.wei@example.com',   country:'🇨🇳 중국',       tier:'Standard', visits:2,  spend:950 },
    { id:'G-007', name:'Park Minjun',  phone:'+82 10-9876-5432', email:'park.mj@example.com',    country:'🇰🇷 대한민국', tier:'Platinum', visits:15, spend:18500 },
    { id:'G-008', name:'Emma Laurent', phone:'+33 6-1234-5678',  email:'emma@example.com',       country:'🇫🇷 프랑스',      tier:'Standard', visits:1,  spend:450 },
    { id:'G-009', name:'Nguyen Hoa',   phone:'+84 91-234-5678',  email:'hoa.nguyen@example.com', country:'🇻🇳 베트남',     tier:'Gold',     visits:4,  spend:3200 },
    { id:'G-010', name:'김서연',        phone:'+82 10-5555-1234', email:'seoyeon@example.com',    country:'🇰🇷 대한민국', tier:'Standard', visits:3,  spend:1800 }
];

const _tierColors = { VIP:'#8B5CF6', Platinum:'#3B82F6', Gold:'#F59E0B', Standard:'#6B7280' };
const _tierIcons  = { VIP:'fa-crown', Platinum:'fa-gem', Gold:'fa-medal', Standard:'fa-user' };
const _tierLabels = {
    ko: { VIP:'우수 고객', Platinum:'플래티넘', Gold:'골드', Standard:'일반' },
    en: { VIP:'VIP', Platinum:'Platinum', Gold:'Gold', Standard:'Standard' }
};

function _guestSearchLang() {
    return (window.currentLang || localStorage.getItem('pms_lang') || document.getElementById('langSelect')?.value || 'ko') === 'en' ? 'en' : 'ko';
}

function _tierLabel(tier) {
    const lang = _guestSearchLang();
    return _tierLabels[lang]?.[tier] || tier || '';
}

class GuestSearchWidget {
    constructor(opts) {
        this.els = {
            search:   document.getElementById(opts.searchInputId),
            results:  document.getElementById(opts.resultsId),
            selected: document.getElementById(opts.selectedId),
            newForm:  document.getElementById(opts.newFormId),
            guestName:document.getElementById(opts.guestNameId)
        };
        this._selectedGuest = null;
        this._mode = 'idle'; // idle | selected | newForm

        // Enter 키 검색
        if (this.els.search) {
            this.els.search.addEventListener('keydown', e => {
                if (e.key === 'Enter') this.search();
            });
        }
    }

    // ─── 검색 ───
    search() {
        const q = (this.els.search?.value || '').trim().toLowerCase();
        if (!q) { if (typeof showToast === 'function') showToast('검색어를 입력해 주세요.'); return; }

        const results = GUEST_DB.filter(g =>
            g.name.toLowerCase().includes(q) ||
            g.phone.replace(/[\s\-]/g,'').includes(q.replace(/[\s\-]/g,'')) ||
            g.email.toLowerCase().includes(q)
        );

        this._hideAll();

        if (results.length > 0) {
            this._renderResults(results);
        } else {
            this._renderNoResults(q);
        }
    }

    // ─── 회원 선택 ───
    select(id) {
        const g = GUEST_DB.find(x => x.id === id);
        if (!g) return;
        this._selectedGuest = g;
        this._mode = 'selected';
        this._hideAll();

        const tc = _tierColors[g.tier] || '#6B7280';
        const ti = _tierIcons[g.tier]  || 'fa-user';

        this.els.selected.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:linear-gradient(135deg,${tc}08,${tc}15);border:1.5px solid ${tc}40;border-radius:10px">
            <div style="display:flex;align-items:center;gap:12px">
                <div style="width:44px;height:44px;border-radius:50%;background:${tc}20;color:${tc};display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800">${g.name.charAt(0).toUpperCase()}</div>
                <div>
                    <div style="font-size:.88rem;font-weight:700;color:var(--txt)">${g.name} <span style="font-size:.65rem;padding:2px 7px;border-radius:10px;background:${tc};color:#fff;font-weight:700;margin-left:4px"><i class="fa-solid ${ti}" style="font-size:.55rem"></i> ${_tierLabel(g.tier)}</span></div>
                    <div style="font-size:.72rem;color:var(--txt3);margin-top:2px">${g.phone} · ${g.email}</div>
                    <div style="font-size:.68rem;color:var(--txt3);margin-top:1px">${g.country} · 방문 ${g.visits}회 · 누적 $${g.spend.toLocaleString()}</div>
                </div>
            </div>
            <button type="button" class="_gs-deselect-btn" style="background:none;border:1px solid var(--border);border-radius:6px;padding:4px 10px;font-family:var(--font);font-size:.72rem;color:var(--txt3);cursor:pointer" title="선택 해제"><i class="fa-solid fa-xmark"></i> 변경</button>
        </div>`;
        this.els.selected.style.display = 'block';
        this.els.selected.querySelector('._gs-deselect-btn').onclick = () => this.deselect();
    }

    // ─── 선택 해제 ───
    deselect() {
        this._selectedGuest = null;
        this._mode = 'idle';
        this._hideAll();
        if (this.els.search) { this.els.search.value = ''; this.els.search.focus(); }
    }

    // ─── 신규 등록 폼 표시 ───
    showNewForm() {
        this._selectedGuest = null;
        this._mode = 'newForm';
        this._hideAll();
        this.els.newForm.style.display = 'block';
        if (this.els.guestName) {
            this.els.guestName.value = this.els.search?.value || '';
            this.els.guestName.focus();
        }
    }

    // ─── 전체 리셋 ───
    reset() {
        this._selectedGuest = null;
        this._mode = 'idle';
        if (this.els.search) this.els.search.value = '';
        this._hideAll();
    }

    // ─── 예약 저장 시 게스트 이름 반환 ───
    getGuestName() {
        if (this._selectedGuest) return this._selectedGuest.name;
        if (this._mode === 'newForm' && this.els.guestName) return this.els.guestName.value.trim();
        return '';
    }

    getSelectedGuest() { return this._selectedGuest; }

    // ─── 내부 렌더 ───
    _hideAll() {
        this.els.results.style.display  = 'none';
        this.els.selected.style.display = 'none';
        this.els.newForm.style.display  = 'none';
    }

    _renderResults(results) {
        let html = '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;max-height:200px;overflow-y:auto">';
        results.forEach(g => {
            const tc = _tierColors[g.tier] || '#6B7280';
            const ti = _tierIcons[g.tier]  || 'fa-user';
            html += `<div class="_gs-result-row" data-gid="${g.id}" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border2);transition:background .15s">
                <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:36px;height:36px;border-radius:50%;background:${tc}15;color:${tc};display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700">${g.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <div style="font-size:.82rem;font-weight:600;color:var(--txt)">${g.name} <span style="font-size:.65rem;padding:2px 6px;border-radius:10px;background:${tc}18;color:${tc};font-weight:700;margin-left:4px"><i class="fa-solid ${ti}" style="font-size:.6rem"></i> ${_tierLabel(g.tier)}</span></div>
                        <div style="font-size:.72rem;color:var(--txt3);margin-top:1px">${g.phone} · ${g.email}</div>
                    </div>
                </div>
                <div style="font-size:.7rem;color:var(--txt3);text-align:right">
                    <div>${g.visits}회 방문</div>
                    <div style="font-weight:600;color:var(--primary)">$${g.spend.toLocaleString()}</div>
                </div>
            </div>`;
        });
        html += '</div>';
        html += `<div style="text-align:center;margin-top:8px">
            <button type="button" class="_gs-new-btn" style="background:none;border:none;color:#8B5CF6;font-family:var(--font);font-size:.78rem;font-weight:600;cursor:pointer;padding:4px 8px"><i class="fa-solid fa-user-plus"></i> 검색 결과에 없음 — 신규 회원 등록</button>
        </div>`;
        this.els.results.innerHTML = html;
        this.els.results.style.display = 'block';

        // 이벤트 바인딩
        this.els.results.querySelectorAll('._gs-result-row').forEach(row => {
            row.onmouseover = () => row.style.background = 'var(--primary-lt)';
            row.onmouseout  = () => row.style.background = 'transparent';
            row.onclick = () => this.select(row.dataset.gid);
        });
        this.els.results.querySelector('._gs-new-btn').onclick = () => this.showNewForm();
    }

    _renderNoResults(q) {
        this.els.results.innerHTML = `<div style="text-align:center;padding:16px;background:var(--border2);border-radius:8px">
            <i class="fa-solid fa-user-xmark" style="font-size:1.5rem;color:var(--txt3);margin-bottom:6px;display:block"></i>
            <div style="font-size:.82rem;font-weight:600;color:var(--txt2);margin-bottom:4px">"${q}" 검색 결과 없음</div>
            <div style="font-size:.72rem;color:var(--txt3);margin-bottom:10px">일치하는 기존 회원이 없습니다.</div>
            <button type="button" class="_gs-new-btn2" style="background:var(--primary);color:#fff;border:none;border-radius:6px;padding:7px 16px;font-family:var(--font);font-size:.78rem;font-weight:600;cursor:pointer"><i class="fa-solid fa-user-plus"></i> 신규 회원으로 등록</button>
        </div>`;
        this.els.results.style.display = 'block';
        this.els.results.querySelector('._gs-new-btn2').onclick = () => this.showNewForm();
    }
}

/**
 * 공통 Guest 섹션 HTML을 생성합니다.
 * @param {string} prefix - 각 요소 ID에 붙는 접미사 (예: '' 또는 '2')
 * @returns {string} HTML 문자열
 */
function renderGuestSearchHTML(prefix) {
    prefix = prefix || '';
    return `
    <!-- 회원 검색 -->
    <div style="display:flex;align-items:center;gap:8px;padding-bottom:6px;border-bottom:2px solid var(--primary);margin-bottom:12px">
        <i class="fa-solid fa-magnifying-glass" style="color:var(--primary);font-size:.8rem"></i>
        <span style="font-weight:700;font-size:.82rem;color:var(--primary)">회원 검색</span>
    </div>
    <div style="display:flex;gap:8px;align-items:flex-end">
        <div style="display:flex;flex-direction:column;gap:5px;flex:1">
            <label style="font-size:.75rem;font-weight:600;color:var(--txt2)">이름 / 연락처 / 이메일</label>
            <input type="text" id="nrSearchGuest${prefix}" style="height:38px;border:1px solid var(--border);border-radius:6px;padding:0 12px;font-family:var(--font);font-size:.82rem" placeholder="기존 회원 검색...">
        </div>
        <button type="button" id="nrSearchBtn${prefix}" style="height:38px;padding:0 16px;border:none;border-radius:6px;background:var(--primary);color:#fff;font-family:var(--font);font-size:.8rem;font-weight:600;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:5px">
            <i class="fa-solid fa-search"></i> 검색
        </button>
        <button type="button" id="nrNewGuestBtn${prefix}" style="height:38px;padding:0 16px;border:none;border-radius:6px;background:#8B5CF6;color:#fff;font-family:var(--font);font-size:.8rem;font-weight:600;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:5px">
            <i class="fa-solid fa-user-plus"></i> 신규 등록
        </button>
    </div>

    <!-- 검색 결과 -->
    <div id="guestSearchResults${prefix}" style="display:none; margin-top: 16px;"></div>

    <!-- 선택된 회원 카드 -->
    <div id="selectedGuestCard${prefix}" style="display:none; margin-top: 16px;"></div>

    <!-- 신규 회원 등록 폼 -->
    <div id="newGuestForm${prefix}" style="display:none; margin-top: 20px;">
        <div style="display:flex;align-items:center;gap:8px;padding-bottom:4px;border-bottom:2px solid #8B5CF6;margin-bottom:10px">
            <i class="fa-solid fa-user-plus" style="color:#8B5CF6;font-size:.8rem"></i>
            <span style="font-weight:700;font-size:.82rem;color:#8B5CF6">신규 회원 등록</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div style="display:flex;flex-direction:column;gap:5px">
                <label style="font-size:.75rem;font-weight:600;color:var(--txt2)">고객명 <span style="color:var(--danger)">*</span></label>
                <input type="text" id="nrGuest${prefix}" style="height:38px;border:1px solid var(--border);border-radius:6px;padding:0 12px;font-family:var(--font);font-size:.82rem" placeholder="예: 홍길동">
            </div>
            <div style="display:flex;flex-direction:column;gap:5px">
                <label style="font-size:.75rem;font-weight:600;color:var(--txt2)">연락처 <span style="color:var(--danger)">*</span></label>
                <input type="text" id="nrPhone${prefix}" style="height:38px;border:1px solid var(--border);border-radius:6px;padding:0 12px;font-family:var(--font);font-size:.82rem" placeholder="+84 000 0000">
            </div>
            <div style="display:flex;flex-direction:column;gap:5px">
                <label style="font-size:.75rem;font-weight:600;color:var(--txt2)">이메일</label>
                <input type="email" id="nrEmail${prefix}" style="height:38px;border:1px solid var(--border);border-radius:6px;padding:0 12px;font-family:var(--font);font-size:.82rem" placeholder="guest@email.com">
            </div>
            <div style="display:flex;flex-direction:column;gap:5px">
                <label style="font-size:.75rem;font-weight:600;color:var(--txt2)">국적</label>
                <select id="nrNation${prefix}" style="height:38px;border:1px solid var(--border);border-radius:6px;padding:0 10px;font-family:var(--font);font-size:.82rem;background:#fff">
                    <option value="">선택</option>
                    <option>🇻🇳 베트남</option><option>🇰🇷 대한민국</option><option>🇯🇵 일본</option>
                    <option>🇺🇸 미국</option><option>🇨🇳 중국</option><option>🇩🇪 독일</option><option>🇫🇷 프랑스</option>
                    <option>🇬🇧 UK</option><option>🇦🇺 Australia</option><option>기타</option>
                </select>
            </div>
        </div>
    </div>`;
}

/**
 * GuestSearchWidget을 초기화하고 버튼 이벤트까지 연결합니다.
 * @param {string} prefix
 * @returns {GuestSearchWidget}
 */
function initGuestSearch(prefix) {
    prefix = prefix || '';
    const widget = new GuestSearchWidget({
        searchInputId: 'nrSearchGuest' + prefix,
        resultsId:     'guestSearchResults' + prefix,
        selectedId:    'selectedGuestCard' + prefix,
        newFormId:     'newGuestForm' + prefix,
        guestNameId:   'nrGuest' + prefix
    });

    // 검색 버튼
    const searchBtn = document.getElementById('nrSearchBtn' + prefix);
    if (searchBtn) searchBtn.onclick = () => widget.search();

    // 신규 등록 버튼
    const newBtn = document.getElementById('nrNewGuestBtn' + prefix);
    if (newBtn) newBtn.onclick = () => widget.showNewForm();

    return widget;
}
