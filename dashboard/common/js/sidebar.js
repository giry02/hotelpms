/**
 * sidebar.js — Hotel PMS 공통 사이드바
 * 모든 페이지에서 <script src="../common/js/sidebar.js"></script> 한 줄로 사용
 */

(function () {
    const _pathParts = window.location.pathname.split('/').filter(Boolean);
    const _parentDir = _pathParts[_pathParts.length - 2] || '';
    const _subDirs = ['frontdesk', 'operations', 'crm', 'settings'];
    const BASE = _subDirs.includes(_parentDir) ? '../' : '';

    // ─── 사용자 역할 로드 (기본값 admin) ─────────
    window.currentUserRole = localStorage.getItem('currentUserRole') || 'admin';

    // 동적 스크립트 로드 후 DataReady 이벤트 발생 (document.write 안티패턴 제거)
    const scriptsToLoad = [
        `${BASE}common/data/ancillaries.js`,
        `${BASE}common/data/guests.js`,
        `${BASE}common/data/rooms.js`,
        `${BASE}common/data/reservations.js`,
        `${BASE}common/data/orders.js`,
        `${BASE}common/data/housekeeping.js`
    ];
    let loadedCount = 0;
    scriptsToLoad.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            loadedCount++;
            if(loadedCount === scriptsToLoad.length) {
                window.dispatchEvent(new Event('DataReady'));
            }
        };
        // 오류가 나도 다음 스크립트를 로드하기 위해
        script.onerror = () => {
            loadedCount++;
            if(loadedCount === scriptsToLoad.length) window.dispatchEvent(new Event('DataReady'));
        };
        document.head.appendChild(script);
    });

    // ─── 메뉴 정의 (dashboard/ 기준 상대경로) ────────────────────
    const MENU = [
        {
            group: 'Main',
            roles: ['admin', 'manager', 'housekeeper'],
            items: [
                { icon: 'fa-gauge-high', label: 'Dashboard', href: BASE + 'dashboard.html' },
            ]
        },
        {
            group: 'Front Desk',
            roles: ['admin', 'manager'],
            items: [
                { icon: 'fa-calendar-days',    label: 'Reservations', href: BASE + 'frontdesk/reservation-timeline.html' },
                { icon: 'fa-list-check',       label: 'Booking List',     href: BASE + 'frontdesk/reservation-list.html' },
                { icon: 'fa-right-to-bracket', label: 'Check-in/out',   href: BASE + 'frontdesk/checkin.html' },
            ]
        },
        {
            group: 'Guest & CRM',
            roles: ['admin', 'manager'],
            items: [
                { icon: 'fa-users', label: 'Guest CRM', href: BASE + 'crm/guests.html' },
                { icon: 'fa-crown', label: 'VIP Members',  href: BASE + 'crm/membership.html' },
            ]
        },
        {
            group: 'Operations',
            roles: ['admin', 'manager', 'housekeeper'],
            items: [
                {
                    icon: 'fa-bed', label: 'Room Mgmt', id: 'rooms',
                    mainHref: BASE + 'operations/rooms.html',
                    children: [
                        { label: 'Room Mgmt', href: BASE + 'operations/rooms.html' },
                        { label: 'Room Types', href: BASE + 'operations/room-setup.html' },
                    ]
                },
                { icon: 'fa-tags',  label: 'Rates Calendar', href: BASE + 'operations/rates.html' },
                { icon: 'fa-broom', label: 'Housekeeping',  href: BASE + 'operations/housekeeping.html', badge: '5' },
                {
                    icon: 'fa-file-invoice-dollar', label: 'Folio & Billing', id: 'folio',
                    mainHref: BASE + 'operations/folio.html',
                    children: [
                        { label: 'Folio List', href: BASE + 'operations/folio.html' },
                        { label: 'Revenue Analytics', href: BASE + 'operations/folio-chart.html' },
                    ]
                },
                {
                    icon: 'fa-concierge-bell', label: 'Ancillary Svcs', id: 'ancillary',
                    mainHref: BASE + 'operations/room-service.html',
                    children: [
                        { label: 'Room Service', href: BASE + 'operations/room-service.html' },
                        { label: 'Golf',   href: BASE + 'operations/golf.html' },
                        { label: 'Rent-a-car',   href: BASE + 'operations/rentacar.html' },
                    ]
                },
            ]
        },
        {
            group: 'Settings',
            roles: ['admin', 'manager'],
            items: [
                { icon: 'fa-gear',        label: 'Hotel Settings', href: BASE + 'settings/settings.html' },
                {
                    icon: 'fa-user-shield', label: 'Staff Mgmt', id: 'staff',
                    mainHref: BASE + 'settings/staff.html',
                    children: [
                        { label: 'Staff List',    href: BASE + 'settings/staff.html' },
                        { label: 'Role & Perms',  href: BASE + 'settings/roles.html' },
                    ]
                },
                { icon: 'fa-credit-card', label: 'Billing & Payment', href: BASE + 'settings/billing.html' },
                { icon: 'fa-bullhorn',    label: 'Notices',   href: BASE + 'settings/notices.html' },
                { icon: 'fa-headset',     label: 'Support',   href: BASE + 'settings/support.html' }
            ]
        },
    ];

    // ─── HTML 생성 ────────────────────────────────────────────
    function buildNavItem(item) {
        if (item.disabled) {
            const badge = item.badge ? ` <span class="badge-nav">${item.badge}</span>` : '';
            return `<a class="nav-item" href="${item.href}"><i class="fa-solid ${item.icon}"></i> <span data-i18n-key="${item.label}">${item.label}</span>${badge}</a>`;
        }

        if (item.children) {
            const children = item.children.map(c =>
                `<a class="nav-sub-item" href="${c.href}"><span data-i18n-key="${c.label}">${c.label}</span></a>`
            ).join('');
            return `
            <div class="nav-item" data-menu="${item.id}" onclick="location.href='${item.mainHref}'">
                <span><i class="fa-solid ${item.icon}"></i> <span data-i18n-key="${item.label}">${item.label}</span></span>
                <i class="fa-solid fa-chevron-down nav-chevron" onclick="event.stopPropagation(); PMS_Sidebar.toggleSubMenu(this)"></i>
            </div>
            <div class="nav-sub" data-submenu="${item.id}">${children}</div>`;
        }

        const badge = item.badge ? ` <span class="badge-nav">${item.badge}</span>` : '';
        return `<a class="nav-item" href="${item.href}"><i class="fa-solid ${item.icon}"></i> <span data-i18n-key="${item.label}">${item.label}</span>${badge}</a>`;
    }

    function buildSidebar() {
        const groups = MENU.filter(g => !g.roles || g.roles.includes(window.currentUserRole)).map(g => `
        <div class="nav-group">
            <div class="nav-group-label" data-i18n-key="${g.group}">${g.group}</div>
            ${g.items.map(buildNavItem).join('')}
        </div>`).join('');

        return `
<div class="sidebar-overlay" onclick="PMS_Sidebar.toggleMenu()"></div>
<aside class="sidebar">
    <div class="sidebar-logo">
        <div class="logo-icon">H</div>
        <div>
            <div class="logo-text">HOTEL PMS</div>
            <div class="logo-sub">Management System</div>
        </div>
    </div>
    <nav class="sidebar-nav">${groups}</nav>
    <div class="sidebar-bottom">
        <div class="sidebar-user">
            <div class="user-avatar">NK</div>
            <div class="user-info">
                <div class="user-name">Nguyen Kim</div>
                <select class="user-role-select" onchange="window.switchRole(this.value)" style="margin-top:4px;font-size:0.75rem;padding:2px 4px;border-radius:4px;background:var(--card);color:var(--txt2);border:1px solid var(--border)">
                    <option value="admin" ${window.currentUserRole==='admin'?'selected':''}>Admin</option>
                    <option value="manager" ${window.currentUserRole==='manager'?'selected':''}>Manager</option>
                    <option value="housekeeper" ${window.currentUserRole==='housekeeper'?'selected':''}>Housekeeper</option>
                </select>
            </div>
        </div>
    </div>
</aside>`;
    }

    function inject() {
        const root = document.getElementById('sidebar-root');
        if (!root) {
            const div = document.createElement('div');
            div.id = 'sidebar-root';
            document.body.insertBefore(div, document.body.firstChild);
            div.outerHTML = buildSidebar();
        } else {
            root.outerHTML = buildSidebar();
        }
    }

    function updateActiveSidebarLinks() {
        const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
        const currentHash = window.location.hash;

        document.querySelectorAll('.sidebar-nav a.nav-item, .sidebar-nav a.nav-sub-item').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            const hrefParts = href.split('/');
            const hrefFileAndHash = hrefParts[hrefParts.length - 1];
            const hrefFile = hrefFileAndHash.split('#')[0];
            const hrefHash = hrefFileAndHash.includes('#') ? '#' + hrefFileAndHash.split('#')[1] : '';

            let isMatch = false;
            if (hrefFile === currentPath) {
                if (currentHash) {
                    if (hrefHash === currentHash) isMatch = true;
                } else {
                    if (!hrefHash || hrefHash === '#tab-basic') isMatch = true;
                }
            }

            if (isMatch) {
                link.classList.add('active');
                const sub = link.closest('.nav-sub');
                if (sub) {
                    sub.classList.add('show');
                    sub.previousElementSibling.classList.add('expanded', 'active');
                    const parentMenuId = sub.previousElementSibling.getAttribute('data-menu');
                    if (parentMenuId) localStorage.setItem('menu_expanded_' + parentMenuId, 'true');
                }
            }
        });

        document.querySelectorAll('.sidebar-nav div.nav-item[onclick]').forEach(div => {
            div.classList.remove('active');
            if (div.getAttribute('onclick').includes(currentPath)) div.classList.add('active');
        });
    }

    window.switchRole = function(role) {
        localStorage.setItem('currentUserRole', role);
        window.location.reload();
    };

    window.PMS_Sidebar = {
        toggleMenu() {
            document.querySelector('.sidebar').classList.toggle('active');
            document.querySelector('.sidebar-overlay').classList.toggle('active');
        },

        toggleSubMenu(iconElement) {
            const parentItem = iconElement.parentElement;
            const subMenu = parentItem.nextElementSibling;
            const menuId = parentItem.getAttribute('data-menu');

            document.querySelectorAll('.nav-item[data-menu]').forEach(item => {
                if (item !== parentItem) {
                    item.classList.remove('expanded');
                    const sub = item.nextElementSibling;
                    if (sub) sub.classList.remove('show');
                    const id = item.getAttribute('data-menu');
                    if (id) localStorage.setItem('menu_expanded_' + id, 'false');
                }
            });

            parentItem.classList.toggle('expanded');
            subMenu.classList.toggle('show');
            if (menuId) localStorage.setItem('menu_expanded_' + menuId, parentItem.classList.contains('expanded'));
        },

        init() {
            inject();
            if (typeof window.changeLang === 'function') {
                window.changeLang(window.currentLang || 'ko');
            }
            document.querySelectorAll('.nav-item[data-menu]').forEach(item => {
                const menuId = item.getAttribute('data-menu');
                if (localStorage.getItem('menu_expanded_' + menuId) === 'true') {
                    item.classList.add('expanded');
                    const sub = item.nextElementSibling;
                    if (sub) sub.classList.add('show');
                }
            });

            updateActiveSidebarLinks();

            document.querySelectorAll('.sidebar-nav a.nav-item').forEach(link => {
                link.addEventListener('click', () => {
                    document.querySelectorAll('.nav-item[data-menu]').forEach(item => {
                        const id = item.getAttribute('data-menu');
                        if (id) localStorage.setItem('menu_expanded_' + id, 'false');
                    });
                });
            });

            window.addEventListener('hashchange', updateActiveSidebarLinks);
        }
    };

    window.toggleMenu = () => PMS_Sidebar.toggleMenu();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PMS_Sidebar.init());
    } else {
        PMS_Sidebar.init();
    }
})();
