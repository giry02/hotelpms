/*
 * Shared guest search widget.
 * Guest records are loaded from the CRM API and cached in window.GUEST_DB for
 * legacy pages that still read the global directly.
 */
var GUEST_DB = window.GUEST_DB || [];
window.GUEST_DB = GUEST_DB;

const _tierColors = {
    diamond: '#8B5CF6',
    platinum: '#3B82F6',
    gold: '#F59E0B',
    standard: '#6B7280',
    VIP: '#8B5CF6',
    Platinum: '#3B82F6',
    Gold: '#F59E0B',
    Standard: '#6B7280'
};

const _tierIcons = {
    diamond: 'fa-crown',
    platinum: 'fa-gem',
    gold: 'fa-medal',
    standard: 'fa-user',
    VIP: 'fa-crown',
    Platinum: 'fa-gem',
    Gold: 'fa-medal',
    Standard: 'fa-user'
};

let _guestDbPromise = null;

function _guestText(key, fallback) {
    if (typeof window.t !== 'function') return fallback;
    const translated = window.t(key);
    return translated && translated !== key ? translated : fallback;
}

function _refreshGuestSearchI18n(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-guest-text]').forEach(el => {
        const key = el.getAttribute('data-guest-text');
        const fallback = el.getAttribute('data-guest-fallback') || el.textContent || key;
        el.textContent = _guestText(key, fallback);
    });
    scope.querySelectorAll('[data-guest-placeholder]').forEach(el => {
        const key = el.getAttribute('data-guest-placeholder');
        const fallback = el.getAttribute('data-guest-fallback') || el.getAttribute('placeholder') || key;
        el.setAttribute('placeholder', _guestText(key, fallback));
    });
}

window.refreshGuestSearchI18n = _refreshGuestSearchI18n;
window.addEventListener('languagechange', () => _refreshGuestSearchI18n());

function _guestSearchLang() {
    return (window.currentLang || localStorage.getItem('pms_lang') || document.getElementById('langSelect')?.value || 'ko') === 'en' ? 'en' : 'ko';
}

function _tierLabel(tier) {
    return String(tier || '');
}

function _escapeGuestHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function _normalizeGuestForSearch(guest, index = 0) {
    const spendValue = guest.totalSpend && typeof guest.totalSpend === 'object'
        ? Number(guest.totalSpend.amount || 0)
        : Number(guest.spend || 0);
    const tier = guest.tier || guest.vip || 'standard';
    return {
        ...guest,
        id: guest.id || guest.guestId || `guest-${index}`,
        name: guest.name || guest.guestName || '',
        phone: guest.phone || guest.mobile || '',
        email: guest.email || '',
        country: guest.country || guest.nationality || guest.nation || '',
        tier,
        visits: Number(guest.visits || guest.visitCount || 0),
        spend: spendValue
    };
}

async function loadGuestDb(force = false) {
    if (_guestDbPromise && !force) return _guestDbPromise;
    _guestDbPromise = (async () => {
        let guests = [];
        if (window.PmsAPI?.getGuests) {
            guests = await window.PmsAPI.getGuests();
        } else if (window.PmsMockApi) {
            const env = await window.PmsMockApi.request('GET', '/crm/guests');
            guests = window.PmsMockApi.items(env);
        }
        GUEST_DB = (guests || []).map(_normalizeGuestForSearch);
        window.GUEST_DB = GUEST_DB;
        return GUEST_DB;
    })().catch(error => {
        console.warn('Guest search API load failed', error);
        GUEST_DB = [];
        window.GUEST_DB = GUEST_DB;
        return GUEST_DB;
    });
    return _guestDbPromise;
}

window.loadGuestDb = loadGuestDb;
loadGuestDb();

class GuestSearchWidget {
    constructor(opts) {
        this.els = {
            search: document.getElementById(opts.searchInputId),
            results: document.getElementById(opts.resultsId),
            selected: document.getElementById(opts.selectedId),
            newForm: document.getElementById(opts.newFormId),
            guestName: document.getElementById(opts.guestNameId)
        };
        this._selectedGuest = null;
        this._mode = 'idle';

        if (this.els.search) {
            this.els.search.addEventListener('keydown', e => {
                if (e.key === 'Enter') this.search();
            });
        }
    }

    async search() {
        const q = (this.els.search?.value || '').trim().toLowerCase();
        if (!q) {
            if (typeof showToast === 'function') showToast(_guestText('guest.search.required', '검색어를 입력해 주세요.'));
            return;
        }

        const guests = await loadGuestDb();
        const normalizedQuery = q.replace(/[\s-]/g, '');
        const results = guests.filter(g =>
            String(g.name || '').toLowerCase().includes(q) ||
            String(g.phone || '').replace(/[\s-]/g, '').includes(normalizedQuery) ||
            String(g.email || '').toLowerCase().includes(q)
        );

        this._hideAll();
        if (results.length > 0) this._renderResults(results);
        else this._renderNoResults(q);
    }

    async select(id) {
        const guests = await loadGuestDb();
        const g = guests.find(x => String(x.id) === String(id));
        if (!g) return;
        if (window.PmsPrivacyAudit) {
            window.PmsPrivacyAudit.log('guest.search_selection.view', {
                screen: window.location.pathname.includes('reservation-timeline') ? 'reservation-timeline' : 'reservation-list',
                guestId: g.id || '',
                guestName: g.name || '',
                fields: ['phone', 'email']
            });
        }
        this._selectedGuest = g;
        this._mode = 'selected';
        this._hideAll();

        const tc = _tierColors[g.tier] || '#6B7280';
        const ti = _tierIcons[g.tier] || 'fa-user';

        this.els.selected.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:linear-gradient(135deg,${tc}08,${tc}15);border:1.5px solid ${tc}40;border-radius:10px">
            <div style="display:flex;align-items:center;gap:12px">
                <div style="width:44px;height:44px;border-radius:50%;background:${tc}20;color:${tc};display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800">${_escapeGuestHtml(g.name.charAt(0).toUpperCase())}</div>
                <div>
                    <div style="font-size:.88rem;font-weight:700;color:var(--txt)">${_escapeGuestHtml(g.name)} <span style="font-size:.65rem;padding:2px 7px;border-radius:10px;background:${tc};color:#fff;font-weight:700;margin-left:4px"><i class="fa-solid ${ti}" style="font-size:.55rem"></i> ${_escapeGuestHtml(_tierLabel(g.tier))}</span></div>
                    <div style="font-size:.72rem;color:var(--txt3);margin-top:2px">${_escapeGuestHtml(g.phone)} · ${_escapeGuestHtml(g.email)}</div>
                    <div style="font-size:.68rem;color:var(--txt3);margin-top:1px">${_escapeGuestHtml(g.country)} · ${_guestText('guest.visits', '방문')} ${Number(g.visits || 0)} · ${_guestText('guest.spend', '누적')} $${Number(g.spend || 0).toLocaleString()}</div>
                </div>
            </div>
            <button type="button" class="_gs-deselect-btn" style="background:none;border:1px solid var(--border);border-radius:6px;padding:4px 10px;font-family:var(--font);font-size:.72rem;color:var(--txt3);cursor:pointer" title="${_guestText('guest.deselect', '선택 해제')}"><i class="fa-solid fa-xmark"></i> ${_guestText('Change', '변경')}</button>
        </div>`;
        this.els.selected.style.display = 'block';
        this.els.selected.querySelector('._gs-deselect-btn').onclick = () => this.deselect();
    }

    deselect() {
        this._selectedGuest = null;
        this._mode = 'idle';
        this._hideAll();
        if (this.els.search) {
            this.els.search.value = '';
            this.els.search.focus();
        }
    }

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

    reset() {
        this._selectedGuest = null;
        this._mode = 'idle';
        if (this.els.search) this.els.search.value = '';
        this._hideAll();
    }

    getGuestName() {
        if (this._selectedGuest) return this._selectedGuest.name;
        if (this._mode === 'newForm' && this.els.guestName) return this.els.guestName.value.trim();
        return '';
    }

    getSelectedGuest() {
        return this._selectedGuest;
    }

    _hideAll() {
        if (this.els.results) this.els.results.style.display = 'none';
        if (this.els.selected) this.els.selected.style.display = 'none';
        if (this.els.newForm) this.els.newForm.style.display = 'none';
    }

    _renderResults(results) {
        if (window.PmsPrivacyAudit) {
            window.PmsPrivacyAudit.log('guest.search_results.view', {
                screen: window.location.pathname.includes('reservation-timeline') ? 'reservation-timeline' : 'reservation-list',
                resultCount: results.length,
                fields: ['phone', 'email']
            });
        }
        let html = '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;max-height:200px;overflow-y:auto">';
        results.forEach(g => {
            const tc = _tierColors[g.tier] || '#6B7280';
            const ti = _tierIcons[g.tier] || 'fa-user';
            html += `<div class="_gs-result-row" data-gid="${_escapeGuestHtml(g.id)}" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border2);transition:background .15s">
                <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:36px;height:36px;border-radius:50%;background:${tc}15;color:${tc};display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700">${_escapeGuestHtml(g.name.charAt(0).toUpperCase())}</div>
                    <div>
                        <div style="font-size:.82rem;font-weight:600;color:var(--txt)">${_escapeGuestHtml(g.name)} <span style="font-size:.65rem;padding:2px 6px;border-radius:10px;background:${tc}18;color:${tc};font-weight:700;margin-left:4px"><i class="fa-solid ${ti}" style="font-size:.6rem"></i> ${_escapeGuestHtml(_tierLabel(g.tier))}</span></div>
                        <div style="font-size:.72rem;color:var(--txt3);margin-top:1px">${_escapeGuestHtml(g.phone)} · ${_escapeGuestHtml(g.email)}</div>
                    </div>
                </div>
                <div style="font-size:.7rem;color:var(--txt3);text-align:right">
                    <div>${Number(g.visits || 0)} ${_guestText('guest.visits', '방문')}</div>
                    <div style="font-weight:600;color:var(--primary)">$${Number(g.spend || 0).toLocaleString()}</div>
                </div>
            </div>`;
        });
        html += '</div>';
        html += `<div style="text-align:center;margin-top:8px">
            <button type="button" class="_gs-new-btn" style="background:none;border:none;color:#8B5CF6;font-family:var(--font);font-size:.78rem;font-weight:600;cursor:pointer;padding:4px 8px"><i class="fa-solid fa-user-plus"></i> ${_guestText('guest.new', '신규 고객 등록')}</button>
        </div>`;
        this.els.results.innerHTML = html;
        this.els.results.style.display = 'block';

        this.els.results.querySelectorAll('._gs-result-row').forEach(row => {
            row.onmouseover = () => row.style.background = 'var(--primary-lt)';
            row.onmouseout = () => row.style.background = 'transparent';
            row.onclick = () => this.select(row.dataset.gid);
        });
        this.els.results.querySelector('._gs-new-btn').onclick = () => this.showNewForm();
    }

    _renderNoResults(q) {
        this.els.results.innerHTML = `<div style="text-align:center;padding:16px;background:var(--border2);border-radius:8px">
            <i class="fa-solid fa-user-xmark" style="font-size:1.5rem;color:var(--txt3);margin-bottom:6px;display:block"></i>
            <div style="font-size:.82rem;font-weight:600;color:var(--txt2);margin-bottom:4px">"${_escapeGuestHtml(q)}" ${_guestText('guest.noResults', '검색 결과 없음')}</div>
            <div style="font-size:.72rem;color:var(--txt3);margin-bottom:10px">${_guestText('guest.noExisting', '일치하는 기존 고객이 없습니다.')}</div>
            <button type="button" class="_gs-new-btn2" style="background:var(--primary);color:#fff;border:none;border-radius:6px;padding:7px 16px;font-family:var(--font);font-size:.78rem;font-weight:600;cursor:pointer"><i class="fa-solid fa-user-plus"></i> ${_guestText('guest.new', '신규 고객 등록')}</button>
        </div>`;
        this.els.results.style.display = 'block';
        this.els.results.querySelector('._gs-new-btn2').onclick = () => this.showNewForm();
    }
}

function renderGuestSearchHTML(prefix) {
    prefix = prefix || '';
    return `
    <div style="display:flex;align-items:center;gap:8px;padding-bottom:6px;border-bottom:2px solid var(--primary);margin-bottom:12px">
        <i class="fa-solid fa-magnifying-glass" style="color:var(--primary);font-size:.8rem"></i>
        <span data-guest-text="guest.search.title" data-guest-fallback="고객 검색" style="font-weight:700;font-size:.82rem;color:var(--primary)">${_guestText('guest.search.title', '고객 검색')}</span>
    </div>
    <div style="display:flex;gap:8px;align-items:flex-end">
        <div style="display:flex;flex-direction:column;gap:5px;flex:1">
            <label style="font-size:.75rem;font-weight:600;color:var(--txt2)"><span data-guest-text="guest.search.label" data-guest-fallback="이름 / 연락처 / 이메일">${_guestText('guest.search.label', '이름 / 연락처 / 이메일')}</span></label>
            <input type="text" id="nrSearchGuest${prefix}" data-guest-placeholder="guest.search.placeholder" data-guest-fallback="기존 고객 검색..." style="height:38px;border:1px solid var(--border);border-radius:6px;padding:0 12px;font-family:var(--font);font-size:.82rem" placeholder="${_guestText('guest.search.placeholder', '기존 고객 검색...')}">
        </div>
        <button type="button" id="nrSearchBtn${prefix}" style="height:38px;padding:0 16px;border:none;border-radius:6px;background:var(--primary);color:#fff;font-family:var(--font);font-size:.8rem;font-weight:600;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:5px">
            <i class="fa-solid fa-search"></i> <span data-guest-text="Search" data-guest-fallback="검색">${_guestText('Search', '검색')}</span>
        </button>
        <button type="button" id="nrNewGuestBtn${prefix}" style="height:38px;padding:0 16px;border:none;border-radius:6px;background:#8B5CF6;color:#fff;font-family:var(--font);font-size:.8rem;font-weight:600;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:5px">
            <i class="fa-solid fa-user-plus"></i> <span data-guest-text="guest.new.short" data-guest-fallback="신규 등록">${_guestText('guest.new.short', '신규 등록')}</span>
        </button>
    </div>
    <div id="guestSearchResults${prefix}" style="display:none; margin-top: 16px;"></div>
    <div id="selectedGuestCard${prefix}" style="display:none; margin-top: 16px;"></div>
    <div id="newGuestForm${prefix}" style="display:none; margin-top: 20px;">
        <div style="display:flex;align-items:center;gap:8px;padding-bottom:4px;border-bottom:2px solid #8B5CF6;margin-bottom:10px">
            <i class="fa-solid fa-user-plus" style="color:#8B5CF6;font-size:.8rem"></i>
            <span data-guest-text="guest.new.title" data-guest-fallback="신규 고객 등록" style="font-weight:700;font-size:.82rem;color:#8B5CF6">${_guestText('guest.new.title', '신규 고객 등록')}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div style="display:flex;flex-direction:column;gap:5px">
                <label style="font-size:.75rem;font-weight:600;color:var(--txt2)"><span data-guest-text="guest.name" data-guest-fallback="고객명">${_guestText('guest.name', '고객명')}</span> <span style="color:var(--danger)">*</span></label>
                <input type="text" id="nrGuest${prefix}" data-guest-placeholder="guest.name.placeholder" data-guest-fallback="고객명 입력" style="height:38px;border:1px solid var(--border);border-radius:6px;padding:0 12px;font-family:var(--font);font-size:.82rem" placeholder="${_guestText('guest.name.placeholder', '고객명 입력')}">
            </div>
            <div style="display:flex;flex-direction:column;gap:5px">
                <label style="font-size:.75rem;font-weight:600;color:var(--txt2)"><span data-guest-text="guest.phone" data-guest-fallback="연락처">${_guestText('guest.phone', '연락처')}</span> <span style="color:var(--danger)">*</span></label>
                <input type="text" id="nrPhone${prefix}" data-guest-placeholder="guest.phone.placeholder" data-guest-fallback="연락처 입력" style="height:38px;border:1px solid var(--border);border-radius:6px;padding:0 12px;font-family:var(--font);font-size:.82rem" placeholder="${_guestText('guest.phone.placeholder', '연락처 입력')}">
            </div>
            <div style="display:flex;flex-direction:column;gap:5px">
                <label style="font-size:.75rem;font-weight:600;color:var(--txt2)"><span data-guest-text="guest.email" data-guest-fallback="이메일">${_guestText('guest.email', '이메일')}</span></label>
                <input type="email" id="nrEmail${prefix}" data-guest-placeholder="guest.email.placeholder" data-guest-fallback="이메일 입력" style="height:38px;border:1px solid var(--border);border-radius:6px;padding:0 12px;font-family:var(--font);font-size:.82rem" placeholder="${_guestText('guest.email.placeholder', '이메일 입력')}">
            </div>
            <div style="display:flex;flex-direction:column;gap:5px">
                <label style="font-size:.75rem;font-weight:600;color:var(--txt2)"><span data-guest-text="guest.nationality" data-guest-fallback="국적">${_guestText('guest.nationality', '국적')}</span></label>
                <input type="text" id="nrNation${prefix}" data-guest-placeholder="guest.nationality.placeholder" data-guest-fallback="국적 입력" style="height:38px;border:1px solid var(--border);border-radius:6px;padding:0 12px;font-family:var(--font);font-size:.82rem" placeholder="${_guestText('guest.nationality.placeholder', '국적 입력')}">
            </div>
        </div>
    </div>`;
}

function initGuestSearch(prefix) {
    prefix = prefix || '';
    const widget = new GuestSearchWidget({
        searchInputId: 'nrSearchGuest' + prefix,
        resultsId: 'guestSearchResults' + prefix,
        selectedId: 'selectedGuestCard' + prefix,
        newFormId: 'newGuestForm' + prefix,
        guestNameId: 'nrGuest' + prefix
    });

    const searchBtn = document.getElementById('nrSearchBtn' + prefix);
    if (searchBtn) searchBtn.onclick = () => widget.search();

    const newBtn = document.getElementById('nrNewGuestBtn' + prefix);
    if (newBtn) newBtn.onclick = () => widget.showNewForm();

    _refreshGuestSearchI18n(document);
    return widget;
}
