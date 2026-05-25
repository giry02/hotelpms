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
    window.currentUserRole = localStorage.getItem('currentUserRole') || 'sys_admin';

    // DataReady 이벤트는 init() 완료 후 dispatch

    // ─── 메뉴 정의 ────────────────────────────────────────────
    const MENU = [
        {
            group: 'Main',
            items: [
                { icon: 'fa-gauge-high', label: 'Dashboard', href: BASE + 'dashboard.html' },
            ]
        },
        {
            group: 'Front Desk',
            roles: ['sys_admin', 'sys_gm', 'sys_desk'],
            items: [
                { icon: 'fa-calendar-days',    label: 'Reservations',  href: BASE + 'frontdesk/reservation-timeline.html' },
                { icon: 'fa-list-check',       label: 'Booking List',  href: BASE + 'frontdesk/reservation-list.html' },
                { icon: 'fa-right-to-bracket', label: 'Check-in/out',  href: BASE + 'frontdesk/checkin.html' },
                {
                    icon: 'fa-users', label: 'Groups', id: 'groups',
                    mainHref: BASE + 'frontdesk/groups_blocks.html',
                    children: [
                        { label: 'Room Assignment', href: BASE + 'frontdesk/groups_blocks.html' },
                        { label: 'Group Companies', href: BASE + 'frontdesk/groups_companies.html' },
                    ]
                },
            ]
        },
        {
            group: 'Guest & CRM',
            roles: ['sys_admin', 'sys_gm', 'sys_desk'],
            items: [
                { icon: 'fa-address-book', label: 'Guest CRM',   href: BASE + 'crm/guests.html' },
                { icon: 'fa-crown',        label: 'VIP Members', href: BASE + 'crm/membership.html' },
            ]
        },
        {
            group: 'Operations',
            items: [
                {
                    icon: 'fa-bed', label: 'Room Mgmt', id: 'rooms',
                    mainHref: BASE + 'operations/rooms.html',
                    children: [
                        { label: 'Room List',   href: BASE + 'operations/rooms.html' },
                        { label: 'Room Types',  href: BASE + 'operations/room-setup.html' },
                        { label: 'Rates Calendar', href: BASE + 'operations/rates.html' },
                    ]
                },
                { icon: 'fa-broom', label: 'Housekeeping', href: BASE + 'operations/housekeeping.html', badge: '5', roles: ['sys_admin', 'sys_gm', 'sys_housekeeping'] },
                { icon: 'fa-wrench', label: 'Maintenance', href: BASE + 'operations/maintenance.html', roles: ['sys_admin', 'sys_gm', 'sys_maintenance'] },
                {
                    icon: 'fa-file-invoice-dollar', label: 'Folio & Billing', id: 'folio',
                    roles: ['sys_admin', 'sys_gm', 'sys_desk'],
                    mainHref: BASE + 'operations/folio.html',
                    children: [
                        { label: 'Folio List',        href: BASE + 'operations/folio.html' },
                        { label: 'Revenue Analytics', href: BASE + 'operations/reports.html' },
                        { label: 'Night Audit',       href: BASE + 'operations/night-audit.html' },
                    ]
                },
                {
                    icon: 'fa-concierge-bell', label: 'Ancillary Svcs', id: 'ancillary',
                    roles: ['sys_admin', 'sys_gm', 'sys_desk'],
                    mainHref: BASE + 'operations/unified-pos.html',
                    children: [
                        { label: 'Unified POS', href: BASE + 'operations/unified-pos.html' },
                        { label: 'Golf',         href: BASE + 'operations/golf.html' },
                        { label: 'Rent-a-car',   href: BASE + 'operations/rentacar.html' },
                    ]
                },
            ]
        },
        {
            group: 'Settings',
            roles: ['sys_admin', 'sys_gm'],
            items: [
                { icon: 'fa-gear',        label: 'Hotel Settings', href: BASE + 'settings/settings.html' },
                {
                    icon: 'fa-user-shield', label: 'Staff Mgmt', id: 'staff',
                    mainHref: BASE + 'settings/staff.html',
                    children: [
                        { label: 'Staff List',   href: BASE + 'settings/staff.html' },
                        { label: 'Role & Perms', href: BASE + 'settings/roles.html' },
                    ]
                },
                { icon: 'fa-credit-card', label: 'Billing & Payment', href: BASE + 'settings/billing.html' },
                { icon: 'fa-bullhorn',    label: 'Notices',           href: BASE + 'settings/notices.html' },
                { icon: 'fa-headset',     label: 'Support',           href: BASE + 'settings/support.html' },
            ]
        },
    ];

    // ─── HTML 생성 ────────────────────────────────────────────
    function buildNavItem(item) {
        if (item.children) {
            const children = item.children.map(c =>
                `<a class="nav-sub-item" href="${c.href}"><span data-i18n-key="${c.label}">${c.label}</span></a>`
            ).join('');
            return `
            <div class="nav-item" data-menu="${item.id}" onclick="location.href='${item.mainHref}'">
                <i class="fa-solid ${item.icon}"></i> <span style="flex:1" data-i18n-key="${item.label}">${item.label}</span>
                <i class="fa-solid fa-chevron-down nav-chevron" onclick="event.stopPropagation(); PMS_Sidebar.toggleSubMenu(this)"></i>
            </div>
            <div class="nav-sub" data-submenu="${item.id}">${children}</div>`;
        }

        const badge = item.badge ? ` <span class="badge-nav">${item.badge}</span>` : '';
        return `<a class="nav-item" href="${item.href}"><i class="fa-solid ${item.icon}"></i> <span data-i18n-key="${item.label}">${item.label}</span>${badge}</a>`;
    }

    function buildSidebar() {
        const groups = MENU.map(g => {
            if (g.roles && !g.roles.includes(window.currentUserRole)) return null;
            const validItems = g.items.filter(item => !item.roles || item.roles.includes(window.currentUserRole));
            if (validItems.length === 0) return null;
            return `
        <div class="nav-group">
            <div class="nav-group-label" data-i18n-key="${g.group}">${g.group}</div>
            ${validItems.map(buildNavItem).join('')}
        </div>`;
        }).filter(Boolean).join('');

        const userProfiles = {
            'sys_admin': { name: 'Nguyen Kim', init: 'NK', color: '#6D28D9' },
            'sys_gm': { name: 'Robert Ford', init: 'RF', color: '#111827' },
            'sys_desk': { name: 'Sarah Connor', init: 'SC', color: '#2563EB' },
            'sys_housekeeping': { name: 'Maria Garcia', init: 'MG', color: '#059669' },
            'sys_maintenance': { name: 'James Bond', init: 'JB', color: '#D97706' }
        };
        const activeProfile = userProfiles[window.currentUserRole] || userProfiles['sys_admin'];

        return `
<div class="sidebar-overlay" onclick="PMS_Sidebar.toggleMenu()"></div>
<aside class="sidebar">
    <div class="sidebar-logo">
        <div class="logo-icon"><i class="fa-solid fa-hotel"></i></div>
        <div>
            <div class="logo-text">HOTEL PMS</div>
            <div class="logo-sub">Property Management</div>
        </div>
    </div>
    <nav class="sidebar-nav">${groups}</nav>
    <div class="sidebar-bottom">
        <div class="sidebar-user">
            <div class="user-avatar" style="background:${activeProfile.color}">${activeProfile.init}</div>
            <div class="user-info">
                <div class="user-name">${activeProfile.name}</div>
                <select class="user-role-select" onchange="window.switchRole(this.value)">
                    <option value="sys_admin" ${window.currentUserRole==='sys_admin'?'selected':''}>Admin</option>
                    <option value="sys_gm" ${window.currentUserRole==='sys_gm'?'selected':''}>General Manager</option>
                    <option value="sys_desk" ${window.currentUserRole==='sys_desk'?'selected':''}>Front Desk</option>
                    <option value="sys_housekeeping" ${window.currentUserRole==='sys_housekeeping'?'selected':''}>Housekeeping</option>
                    <option value="sys_maintenance" ${window.currentUserRole==='sys_maintenance'?'selected':''}>Maintenance</option>
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

        // Force close all menus first (strict accordion)
        document.querySelectorAll('.nav-item[data-menu]').forEach(item => {
            item.classList.remove('expanded', 'active');
            const sub = item.nextElementSibling;
            if (sub) sub.classList.remove('show');
            const id = item.getAttribute('data-menu');
            if (id) localStorage.setItem('menu_expanded_' + id, 'false');
        });

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
            // 1. 사이드바 DOM inject
            inject();

            // 2. 언어 번역 적용 (changeLang은 i18n.js가 먼저 로드되어야 함)
            const lang = window.currentLang || localStorage.getItem('pms_lang') || 'ko';
            if (typeof window.changeLang === 'function') {
                window.changeLang(lang);
            }

            // 3. 헤더 langSelect 값 동기화
            const langSel = document.getElementById('langSelect');
            if (langSel) langSel.value = lang;

            // 4. 이전에 펼쳐진 서브메뉴 복원
            document.querySelectorAll('.nav-item[data-menu]').forEach(item => {
                const menuId = item.getAttribute('data-menu');
                if (localStorage.getItem('menu_expanded_' + menuId) === 'true') {
                    item.classList.add('expanded');
                    const sub = item.nextElementSibling;
                    if (sub) sub.classList.add('show');
                }
            });

            // 5. 현재 페이지에 해당하는 메뉴 active 처리
            updateActiveSidebarLinks();

            // 6. 일반 nav-item 클릭 시 서브메뉴 닫기
            document.querySelectorAll('.sidebar-nav a.nav-item').forEach(link => {
                link.addEventListener('click', () => {
                    document.querySelectorAll('.nav-item[data-menu]').forEach(item => {
                        const id = item.getAttribute('data-menu');
                        if (id) localStorage.setItem('menu_expanded_' + id, 'false');
                    });
                });
            });

            window.addEventListener('hashchange', updateActiveSidebarLinks);

            // 7. 데이터 로딩 완료 이벤트 dispatch
            window.dispatchEvent(new Event('DataReady'));
        }
    };

    window.toggleMenu = () => PMS_Sidebar.toggleMenu();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PMS_Sidebar.init());
    } else {
        PMS_Sidebar.init();
    }
})();
