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
                {
                    icon: 'fa-calendar-check', label: '예약 관리', id: 'reservations',
                    mainHref: BASE + 'frontdesk/reservation-timeline.html',
                    children: [
                        { label: '예약 타임라인', href: BASE + 'frontdesk/reservation-timeline.html' },
                        { label: '예약 현황', href: BASE + 'frontdesk/reservation-board.html' },
                        { label: '예약 목록', href: BASE + 'frontdesk/reservation-list.html' },
                    ]
                },
                {
                    icon: 'fa-users', label: 'Groups', id: 'groups',
                    mainHref: BASE + 'frontdesk/groups_blocks.html',
                    children: [
                        { label: '단체/행사 목록', href: BASE + 'frontdesk/groups_blocks.html' },
                        { label: '단체업체 관리', href: BASE + 'frontdesk/groups_companies.html' },
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
                { icon: 'fa-broom', label: 'Housekeeping', href: BASE + 'operations/housekeeping.html', roles: ['sys_admin', 'sys_gm', 'sys_housekeeping'] },
                { icon: 'fa-wrench', label: 'Maintenance', href: BASE + 'operations/maintenance.html', roles: ['sys_admin', 'sys_gm', 'sys_maintenance'] },
                {
                    icon: 'fa-file-invoice-dollar', label: 'Folio & Billing', id: 'folio',
                    roles: ['sys_admin', 'sys_gm', 'sys_desk'],
                    mainHref: BASE + 'operations/reports.html',
                    children: [
                        { label: 'Revenue Analytics', href: BASE + 'operations/reports.html' },
                        { label: 'Folio List',        href: BASE + 'operations/folio.html' },
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
                { icon: 'fa-shield-halved', label: 'Audit Logs', href: BASE + 'settings/audit-logs.html', roles: ['sys_admin'] },
                { icon: 'fa-bullhorn',    label: 'Notices',           href: BASE + 'settings/notices.html' },
                { icon: 'fa-headset',     label: 'Support',           href: BASE + 'settings/support.html' },
            ]
        },
    ];

    // ─── HTML 생성 ────────────────────────────────────────────
    const groupsMenu = MENU.find(group => group.items?.some(item => item.id === 'groups'));
    const groupsItem = groupsMenu?.items.find(item => item.id === 'groups');
    if (groupsItem?.children?.length >= 2) {
        groupsItem.children[0].label = '\uB2E8\uCCB4/\uD589\uC0AC \uBAA9\uB85D';
        groupsItem.children[1].label = '\uB2E8\uCCB4\uC5C5\uCCB4 \uAD00\uB9AC';
    }

    const HOTEL_MENU_KEYS = [
        'dashboard',
        'reservation',
        'checkin',
        'crm',
        'groups',
        'rooms',
        'rates',
        'housekeeping',
        'maintenance',
        'folio',
        'ancillary',
        'settings',
        'staff',
        'billing'
    ];

    const MENU_KEY_BY_FILE = {
        'dashboard.html': 'dashboard',
        'reservation-timeline.html': 'reservation',
        'reservation-board.html': 'reservation',
        'reservation-list.html': 'reservation',
        'checkin.html': 'checkin',
        'guests.html': 'crm',
        'membership.html': 'crm',
        'groups_blocks.html': 'groups',
        'groups_block_detail.html': 'groups',
        'groups_companies.html': 'groups',
        'rooms.html': 'rooms',
        'room-setup.html': 'rooms',
        'rates.html': 'rates',
        'housekeeping.html': 'housekeeping',
        'maintenance.html': 'maintenance',
        'reports.html': 'folio',
        'folio.html': 'folio',
        'night-audit.html': 'folio',
        'unified-pos.html': 'ancillary',
        'golf.html': 'ancillary',
        'rentacar.html': 'ancillary',
        'settings.html': 'settings',
        'staff.html': 'staff',
        'roles.html': 'staff',
        'billing.html': 'billing',
        'audit-logs.html': 'settings',
        'notices.html': 'settings',
        'support.html': 'settings'
    };

    function readHotelSettingsForSidebar() {
        try {
            return JSON.parse(localStorage.getItem('pms_hotel_settings') || '{}') || {};
        } catch (error) {
            return {};
        }
    }

    function hrefFile(href) {
        if (!href) return '';
        const clean = String(href).split('#')[0].split('?')[0];
        return clean.split('/').pop() || clean;
    }

    function resolveMenuKey(item, parent) {
        if (!item && !parent) return '';
        if (item?.key) return item.key;
        if (item?.id === 'reservations') return 'reservation';
        if (item?.id && HOTEL_MENU_KEYS.includes(item.id)) return item.id;
        const file = hrefFile(item?.href || item?.mainHref || parent?.href || parent?.mainHref);
        return MENU_KEY_BY_FILE[file] || parent?.key || parent?.id || '';
    }

    function rolePolicyAllows(item) {
        return !item?.roles || item.roles.includes(window.currentUserRole);
    }

    function hotelMenuPolicyAllows(key) {
        if (!key) return true;
        const settings = readHotelSettingsForSidebar();
        const featureFlags = settings.featureFlags || {};
        const menuPolicy = settings.menuPolicy || {};
        const enabledMenus = Array.isArray(menuPolicy.enabledMenus) ? menuPolicy.enabledMenus : null;
        const disabledMenus = Array.isArray(menuPolicy.disabledMenus) ? menuPolicy.disabledMenus : [];
        if (featureFlags[key] === false) return false;
        if (disabledMenus.includes(key)) return false;
        if (enabledMenus && enabledMenus.length > 0 && !enabledMenus.includes(key)) return false;
        return true;
    }

    function filterMenuItem(item) {
        if (!rolePolicyAllows(item)) return null;
        const key = resolveMenuKey(item);
        const directAllowed = hotelMenuPolicyAllows(key);
        if (Array.isArray(item.children)) {
            const children = item.children
                .filter(child => rolePolicyAllows(child) && hotelMenuPolicyAllows(resolveMenuKey(child, item)));
            if (!directAllowed && children.length === 0) return null;
            const next = { ...item, key, children };
            if (!directAllowed && children[0]?.href) next.mainHref = children[0].href;
            return next;
        }
        return directAllowed ? { ...item, key } : null;
    }

    window.PMS_MenuPolicy = {
        resolveMenuKey,
        rolePolicyAllows,
        hotelMenuPolicyAllows
    };

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
            const validItems = g.items.map(filterMenuItem).filter(Boolean);
            if (validItems.length === 0) return null;
            return `
        <div class="nav-group">
            <div class="nav-group-label" data-i18n-key="${g.group}">${g.group}</div>
            ${validItems.map(buildNavItem).join('')}
        </div>`;
        }).filter(Boolean).join('');

        const userProfiles = {
            'sys_admin': { name: 'Nguyen Kim' },
            'sys_gm': { name: 'Robert Ford' },
            'sys_desk': { name: 'Sarah Connor' },
            'sys_housekeeping': { name: 'Maria Garcia' },
            'sys_maintenance': { name: 'James Bond' }
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
        const activePath = currentPath === 'groups_block_detail.html' ? 'groups_blocks.html' : currentPath;
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
            if (hrefFile === activePath) {
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
            if (div.getAttribute('onclick').includes(activePath)) div.classList.add('active');
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
