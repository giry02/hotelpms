document.head.insertAdjacentHTML('beforeend', '<style>.topbar h1 { font-size: 1.15rem !important; font-weight: 700 !important; margin: 0 !important; line-height: 1.2 !important; display: block !important; }</style>');

(function() {
    window.PmsDate = window.PmsDate || (function() {
        const DEMO_ISO_DATE = '2026-06-10';
        function fromIso(isoDate) {
            const [year, month, day] = String(isoDate || DEMO_ISO_DATE).slice(0, 10).split('-').map(Number);
            const date = new Date(year, month - 1, day);
            date.setHours(0, 0, 0, 0);
            return date;
        }
        function now() {
            const clock = new Date();
            const date = fromIso(DEMO_ISO_DATE);
            date.setHours(clock.getHours(), clock.getMinutes(), clock.getSeconds(), clock.getMilliseconds());
            return date;
        }
        function localIso(date) {
            if (!date) return DEMO_ISO_DATE;
            const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            return shifted.toISOString().slice(0, 10);
        }
        function pad(value) {
            return String(value).padStart(2, '0');
        }
        function nowIso() {
            const clock = new Date();
            return `${DEMO_ISO_DATE}T${pad(clock.getHours())}:${pad(clock.getMinutes())}:${pad(clock.getSeconds())}+09:00`;
        }
        return { demoIsoDate: DEMO_ISO_DATE, todayIso: () => DEMO_ISO_DATE, today: () => fromIso(DEMO_ISO_DATE), now, nowIso, localIso };
    })();

    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const parentDir = pathParts[pathParts.length - 2] || '';
    const subDirs = ['frontdesk', 'operations', 'crm', 'settings'];
    const BASE = subDirs.includes(parentDir) ? '../' : '';
    const state = {
        hotelName: '',
        notifications: []
    };

    function currentLang() {
        return localStorage.getItem('pms_lang') || window.currentLang || 'ko';
    }

    function text(key, fallback) {
        return typeof window.t === 'function' ? window.t(key) : fallback;
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    }

    function activityIcon(type) {
        const value = String(type || '').toLowerCase();
        if (value.includes('housekeeping')) return 'fa-broom';
        if (value.includes('billing') || value.includes('folio')) return 'fa-credit-card';
        if (value.includes('group')) return 'fa-users-line';
        if (value.includes('reservation')) return 'fa-book-bookmark';
        return 'fa-bell';
    }

    function activityTitle(type) {
        const value = String(type || '').toLowerCase();
        if (value.includes('housekeeping')) return text('topbar.notification.housekeeping', '하우스키핑');
        if (value.includes('billing') || value.includes('folio')) return text('topbar.notification.billing', '정산');
        if (value.includes('group')) return text('topbar.notification.group', '단체');
        if (value.includes('reservation')) return text('topbar.notification.reservation', '예약');
        return text('topbar.notification.system', '알림');
    }

    function notificationClass(item) {
        const type = String(item.type || '').toLowerCase();
        if (item.urgent) return 'urgent';
        if (type.includes('housekeeping')) return 'warning';
        return '';
    }

    function buildNotificationList() {
        if (!state.notifications.length) {
            return `<div class="notif-item">
                <div class="notif-icon"><i class="fa-regular fa-bell"></i></div>
                <div class="notif-content">
                    <div class="n-title">${escapeHtml(text('topbar.notification.empty', '새 알림 없음'))}</div>
                    <div class="n-desc" style="font-size:0.8rem;color:var(--txt2);margin-bottom:4px">${escapeHtml(text('topbar.notification.empty.desc', '표시할 활동이 없습니다.'))}</div>
                </div>
            </div>`;
        }
        return state.notifications.slice(0, 3).map(item => `
            <div class="notif-item ${notificationClass(item)}">
                <div class="notif-icon"><i class="fa-solid ${item.icon || activityIcon(item.type)}"></i></div>
                <div class="notif-content">
                    <div class="n-title">${escapeHtml(item.title || activityTitle(item.type))}</div>
                    <div class="n-desc" style="font-size:0.8rem;color:var(--txt2);margin-bottom:4px">${escapeHtml(item.desc || item.label || '')}</div>
                    <span class="n-time" style="font-size:0.7rem;color:var(--txt3)">${escapeHtml(item.time || '')}</span>
                </div>
            </div>
        `).join('');
    }

    function renderNotificationList() {
        const list = document.querySelector('.notif-list');
        if (list) list.innerHTML = buildNotificationList();
    }

    function renderHotelName() {
        const el = document.getElementById('topbarHotelName');
        if (el) el.textContent = state.hotelName || text('Hotel', '호텔');
    }

    async function loadHotelName() {
        try {
            let settings = null;
            if (window.PmsAPI?.getHotelSettings) settings = await window.PmsAPI.getHotelSettings();
            else if (window.PmsMockApi) settings = window.PmsMockApi.data(await window.PmsMockApi.request('GET', '/settings/hotel'));
            state.hotelName = settings?.name || '';
        } catch (error) {
            console.warn('Topbar hotel settings load failed', error);
            state.hotelName = '';
        }
        renderHotelName();
    }

    async function loadNotifications() {
        try {
            if (!window.PmsMockApi) {
                state.notifications = [];
            } else {
                const env = await window.PmsMockApi.request('GET', '/dashboard/today-activities');
                state.notifications = window.PmsMockApi.items(env).map(item => ({
                    type: item.type,
                    title: item.title || activityTitle(item.type),
                    desc: item.desc || item.label,
                    time: item.time,
                    icon: item.icon || activityIcon(item.type),
                    urgent: Boolean(item.urgent)
                }));
            }
        } catch (error) {
            console.warn('Topbar notifications load failed', error);
            state.notifications = [];
        }
        renderNotificationList();
    }

    function setLanguage(lang) {
        localStorage.setItem('pms_lang', lang);
        window.currentLang = lang;
        if (typeof window.changeLang === 'function') window.changeLang(lang);
        else window.dispatchEvent(new Event('languagechange'));
    }

    function injectTopbar() {
        const topbar = document.querySelector('.topbar');
        if (!topbar) return;

        const existingH1 = topbar.querySelector('h1');
        const pageTitleKey = existingH1 ? (existingH1.getAttribute('data-i18n-key') || existingH1.textContent) : 'Dashboard';
        const pageTitleText = existingH1 ? existingH1.textContent : text('Dashboard', '대시보드');

        topbar.innerHTML = `
            <div class="topbar-left">
                <button class="mobile-menu-btn" onclick="toggleMenu()"><i class="fa-solid fa-bars"></i></button>
                <h1 data-i18n-key="${escapeHtml(pageTitleKey)}">${escapeHtml(pageTitleText)}</h1>
                <span class="date-badge"><i class="fa-regular fa-calendar"></i> <span class="live-clock"></span></span>
            </div>
            <div class="topbar-right">
                <div style="font-size:0.85rem;font-weight:700;color:var(--txt);margin-right:8px;display:flex;align-items:center;gap:4px">
                    <i class="fa-solid fa-hotel" style="color:var(--primary)"></i> <span id="topbarHotelName"></span>
                </div>
                <select class="hotel-select" id="langSelect" style="margin-left:8px; width:120px">
                    <option value="ko">KR 한국어</option>
                    <option value="en">EN English</option>
                </select>
                <div class="notif-wrap" style="margin-left:8px">
                    <button class="topbar-btn" onclick="toggleNotifications(event)">
                        <i class="fa-regular fa-bell"></i><span class="notif-dot"></span>
                    </button>
                    <div class="notif-dropdown" id="notifDropdown">
                        <div class="notif-header">
                            <h3>${escapeHtml(text('topbar.notifications', '호텔 알림'))}</h3>
                            <span>${escapeHtml(text('topbar.markRead', '모두 읽음 처리'))}</span>
                        </div>
                        <div class="notif-list">${buildNotificationList()}</div>
                        <div class="notif-footer" style="text-align:center;padding:12px;border-top:1px solid var(--border2)">
                            <a href="${BASE}notifications.html" style="font-size:0.8rem;font-weight:600;color:var(--primary);text-decoration:none">${escapeHtml(text('topbar.viewAll', '모든 알림 보기'))}</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const langSelect = document.getElementById('langSelect');
        const lang = currentLang();
        if (langSelect) {
            langSelect.value = lang;
            langSelect.onchange = () => setLanguage(langSelect.value);
        }
        renderHotelName();
        window.updateClock();
        loadHotelName();
        loadNotifications();
    }

    window.updateClock = function() {
        const clockEl = document.querySelector('.date-badge .live-clock');
        if (clockEl) {
            const now = window.PmsDate?.now ? window.PmsDate.now() : new Date();
            const locale = currentLang() === 'en' ? 'en-US' : 'ko-KR';
            const dateStr = now.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
            const timeStr = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
            clockEl.textContent = `${dateStr} ${timeStr}`;
        }
    };
    setInterval(window.updateClock, 60000);

    window.addEventListener('languagechange', function() {
        window.updateClock();
        renderNotificationList();
    });

    window.toggleNotifications = function(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('notifDropdown');
        if (dropdown) dropdown.classList.toggle('active');
    };

    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('notifDropdown');
        const wrap = document.querySelector('.notif-wrap');
        if (dropdown && dropdown.classList.contains('active') && wrap && !wrap.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectTopbar);
    else injectTopbar();
})();
