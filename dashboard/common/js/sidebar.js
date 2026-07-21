/**
 * sidebar.js — Hotel PMS 공통 사이드바
 * 모든 페이지에서 <script src="../common/js/sidebar.js"></script> 한 줄로 사용
 */

(function () {
    window.PMS_TABLET_ONLY = true;

    function applyTabletViewportPolicy() {
        const meta = document.querySelector('meta[name="viewport"]');
        if (!meta) return;
        const ua = navigator.userAgent || '';
        const uaDataMobile = navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean'
            ? navigator.userAgentData.mobile
            : null;
        const mobileUa = /Android|iPhone|iPad|iPod|Mobi|Mobile/i.test(ua);
        const touchDevice = Number(navigator.maxTouchPoints || 0) > 0;
        const screenShortSide = Math.min(
            Number(screen.width || window.innerWidth || 0),
            Number(screen.height || window.innerHeight || 0)
        );
        const narrowTouchViewport = touchDevice && screenShortSide > 0 && screenShortSide < 1180;
        if (mobileUa || uaDataMobile === true || narrowTouchViewport) {
            meta.setAttribute('content', 'width=1180, initial-scale=1.0');
        }
        document.documentElement.classList.add('tablet-desktop-only');
    }

    applyTabletViewportPolicy();

    const _pathParts = window.location.pathname.split('/').filter(Boolean);
    const _parentDir = _pathParts[_pathParts.length - 2] || '';
    const _subDirs = ['frontdesk', 'operations', 'crm', 'settings'];
    const BASE = _subDirs.includes(_parentDir) ? '../' : '';

    function enforceAuthenticatedSession() {
        if (sessionStorage.getItem('pms_logged_in') === 'true') return true;
        window.location.replace(BASE + 'login.html');
        return false;
    }

    if (!enforceAuthenticatedSession()) return;
    window.addEventListener('pageshow', enforceAuthenticatedSession);

    // ─── 사용자 역할 로드 (기본값 admin) ─────────
    window.currentUserRole = localStorage.getItem('currentUserRole') || 'sys_admin';

    const FEATURE_PERMISSION_KEY = 'pms_role_feature_permissions';
    const DEFAULT_FEATURE_PERMISSIONS = {
        sys_admin: { 'settlement.reopen': true, 'ancillary.reopen': true }
    };

    function readFeaturePermissions() {
        try {
            const parsed = JSON.parse(localStorage.getItem(FEATURE_PERMISSION_KEY) || '{}');
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch(e) {
            return {};
        }
    }

    function writeFeaturePermissions(value) {
        localStorage.setItem(FEATURE_PERMISSION_KEY, JSON.stringify(value || {}));
        window.dispatchEvent(new CustomEvent('pms:feature-permissions-updated'));
    }

    window.PMS_FeaturePermissions = window.PMS_FeaturePermissions || {
        key: FEATURE_PERMISSION_KEY,
        defaults: DEFAULT_FEATURE_PERMISSIONS,
        list() {
            return {
                'settlement.reopen': { label:'정산취소', desc:'정산 완료 건을 정산 미완료로 되돌립니다.' },
                'ancillary.reopen': { label:'부가서비스 취소', desc:'완료된 부가서비스를 미완료/수락 상태로 되돌립니다.' }
            };
        },
        read: readFeaturePermissions,
        save: writeFeaturePermissions,
        can(permission, role = window.currentUserRole) {
            const map = readFeaturePermissions();
            if (DEFAULT_FEATURE_PERMISSIONS[role]?.[permission]) return true;
            return !!map?.[role]?.[permission];
        },
        set(role, permission, allowed) {
            const map = readFeaturePermissions();
            map[role] = { ...(map[role] || {}) };
            if (allowed) map[role][permission] = true;
            else delete map[role][permission];
            writeFeaturePermissions(map);
        }
    };

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
                    mainHref: BASE + 'frontdesk/reservation-board.html',
                    children: [
                        { label: '예약 현황', href: BASE + 'frontdesk/reservation-board.html' },
                        { label: '예약 타임라인', href: BASE + 'frontdesk/reservation-timeline.html' },
                        { label: '예약 목록', href: BASE + 'frontdesk/reservation-list.html' },
                    ]
                },
                {
                    icon: 'fa-users', label: 'Groups', id: 'groups',
                    mainHref: BASE + 'frontdesk/groups_blocks.html',
                    children: [
                        { label: '단체/행사 목록', href: BASE + 'frontdesk/groups_blocks.html' },
                        { label: '단체 등록 관리', href: BASE + 'frontdesk/groups_companies.html' },
                    ]
                },
            ]
        },
        {
            group: 'Operations',
            items: [
                {
                    icon: 'fa-bed', label: 'Room Mgmt', id: 'rooms',
                    mainHref: BASE + 'operations/room-setup.html',
                    children: [
                        { label: 'Room Types',  href: BASE + 'operations/room-setup.html' },
                        { label: 'Rates Calendar', href: BASE + 'operations/rates.html' },
                    ]
                },
                { icon: 'fa-broom', label: 'Housekeeping', href: BASE + 'operations/housekeeping.html', roles: ['sys_admin', 'sys_gm', 'sys_housekeeping'] },
                { icon: 'fa-wrench', label: 'Maintenance', href: BASE + 'operations/maintenance.html', roles: ['sys_admin', 'sys_gm', 'sys_maintenance'] },
                {
                    icon: 'fa-concierge-bell', label: 'Ancillary Svcs', id: 'ancillary',
                    roles: ['sys_admin', 'sys_gm', 'sys_desk'],
                    mainHref: BASE + 'operations/ancillary.html',
                    children: [
                        { label: '부가서비스 등록', href: BASE + 'operations/ancillary.html' },
                        { label: '업체/항목 관리', href: BASE + 'operations/ancillary-vendors.html' },
                    ]
                },
                {
                    icon: 'fa-file-invoice-dollar', label: 'Folio & Billing', id: 'folio',
                    roles: ['sys_admin', 'sys_gm', 'sys_desk'],
                    mainHref: BASE + 'operations/settlement-status.html',
                    children: [
                        { label: '정산 현황',         href: BASE + 'operations/settlement-status.html', key: 'folio.status' },
                        { label: '정산 목록',         href: BASE + 'operations/folio.html' },
                        { label: 'page.expensePurchases',          href: BASE + 'operations/expense-purchases.html', key: 'folio.expenses' },
                        { label: 'Night Audit',       href: BASE + 'operations/night-audit.html' },
                        { label: 'Revenue Analytics', href: BASE + 'operations/reports.html' },
                    ]
                },
            ]
        },
        {
            group: 'Customer Management',
            roles: ['sys_admin', 'sys_gm', 'sys_desk'],
            items: [
                { icon: 'fa-address-book', label: 'Guest CRM',   href: BASE + 'crm/guests.html' },
                {
                    icon: 'fa-crown', label: 'VIP Members', id: 'crmMembership', key: 'crm.membership',
                    mainHref: BASE + 'crm/tier-history.html',
                    children: [
                        { label: 'Tier Change History', href: BASE + 'crm/tier-history.html', key: 'crm.membership.history' },
                        { label: 'Tier Member Criteria', href: BASE + 'crm/membership.html', key: 'crm.membership.criteria' },
                    ]
                },
            ]
        },
        {
            group: 'Settings & Admin',
            roles: ['sys_admin', 'sys_gm', 'sys_desk'],
            items: [
                { icon: 'fa-gear',        label: 'Hotel Settings', href: BASE + 'settings/settings.html', roles: ['sys_admin', 'sys_gm'] },
                {
                    icon: 'fa-user-shield', label: 'Staff Mgmt', id: 'staff',
                    roles: ['sys_admin', 'sys_gm'],
                    mainHref: BASE + 'settings/staff.html',
                    children: [
                        { label: 'Staff List',   href: BASE + 'settings/staff.html' },
                        { label: 'Role & Perms', href: BASE + 'settings/roles.html' },
                    ]
                },
                { icon: 'fa-credit-card', label: 'Payment Settings', href: BASE + 'settings/billing.html', roles: ['sys_admin', 'sys_gm'] },
                {
                    icon: 'fa-clipboard-list', label: 'Operation Logs', id: 'operationLogs', key: 'operationLogs',
                    roles: ['sys_admin', 'sys_gm', 'sys_desk'],
                    mainHref: BASE + 'settings/audit-logs.html',
                    children: [
                        { label: 'Audit Log', href: BASE + 'settings/audit-logs.html', key: 'operationLogs.audit', roles: ['sys_admin'] },
                        { label: 'Close Log', href: BASE + 'operations/closing-log.html', key: 'operationLogs.close', roles: ['sys_admin', 'sys_gm', 'sys_desk'] },
                    ]
                },
                { icon: 'fa-bullhorn',    label: 'Notices',           href: BASE + 'settings/notices.html', roles: ['sys_admin', 'sys_gm'] },
                { icon: 'fa-headset',     label: 'Support',           href: BASE + 'settings/support.html', roles: ['sys_admin', 'sys_gm'] },
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
        'reservation.board',
        'reservation.timeline',
        'reservation.list',
        'checkin',
        'crm',
        'crm.guests',
        'crm.membership',
        'crm.membership.history',
        'crm.membership.criteria',
        'groups',
        'groups.list',
        'groups.companies',
        'rooms',
        'rooms.list',
        'rooms.types',
        'rates',
        'housekeeping',
        'maintenance',
        'folio',
        'folio.status',
        'folio.list',
        'folio.expenses',
        'folio.night-audit',
        'folio.reports',
        'ancillary',
        'ancillary.board',
        'ancillary.vendors',
        'operationLogs',
        'operationLogs.audit',
        'operationLogs.close',
        'settings',
        'settings.hotel',
        'staff',
        'staff.list',
        'staff.roles',
        'billing',
        'settings.notices',
        'settings.support'
    ];

    const MENU_KEY_BY_FILE = {
        'dashboard.html': 'dashboard',
        'reservation-board.html': 'reservation.board',
        'reservation-timeline.html': 'reservation.timeline',
        'reservation-list.html': 'reservation.list',
        'checkin.html': 'checkin',
        'guests.html': 'crm.guests',
        'membership.html': 'crm.membership.criteria',
        'tier-history.html': 'crm.membership.history',
        'groups_blocks.html': 'groups.list',
        'groups_block_detail.html': 'groups.list',
        'groups_companies.html': 'groups.companies',
        'rooms.html': 'rooms.list',
        'room-setup.html': 'rooms.types',
        'rates.html': 'rates',
        'housekeeping.html': 'housekeeping',
        'maintenance.html': 'maintenance',
        'reports.html': 'folio.reports',
        'settlement-status.html': 'folio.status',
        'folio.html': 'folio.list',
        'expense-purchases.html': 'folio.expenses',
        'night-audit.html': 'folio.night-audit',
        'closing-log.html': 'operationLogs.close',
        'ancillary.html': 'ancillary.board',
        'unified-pos.html': 'ancillary.board',
        'golf.html': 'ancillary.board',
        'rentacar.html': 'ancillary.board',
        'ancillary-vendors.html': 'ancillary.vendors',
        'settings.html': 'settings.hotel',
        'staff.html': 'staff.list',
        'roles.html': 'staff.roles',
        'billing.html': 'billing',
        'audit-logs.html': 'operationLogs.audit',
        'notices.html': 'settings.notices',
        'support.html': 'settings.support'
    };

    function safeJsonParse(value, fallback = {}) {
        try {
            return value ? (JSON.parse(value) || fallback) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function readHotelSettingsForSidebar() {
        const settings = safeJsonParse(localStorage.getItem('pms_hotel_settings'), {});
        const tenantId =
            settings.id
            || settings.tenantId
            || localStorage.getItem('pms_tenant_id')
            || 'TENANT-GRAND-SAIGON';
        const adminPolicy = safeJsonParse(
            localStorage.getItem(`admin_tenant_menu_policy:${tenantId}`)
            || localStorage.getItem(`mockapi:v1:ADMIN:tenant-menu-policy:${tenantId}`),
            {}
        );
        return {
            ...settings,
            featureFlags: {
                ...(settings.featureFlags || {}),
                ...(adminPolicy.featureFlags || {})
            },
            menuPolicy: {
                ...(settings.menuPolicy || {}),
                ...(adminPolicy.menuPolicy || {})
            }
        };
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

    function parentMenuKey(key) {
        if (!key || !String(key).includes('.')) {
            return key === 'rates' ? 'rooms' : '';
        }
        return String(key).split('.')[0];
    }

    function hotelMenuPolicyAllows(key) {
        if (!key) return true;
        const settings = readHotelSettingsForSidebar();
        const featureFlags = settings.featureFlags || {};
        const menuPolicy = settings.menuPolicy || {};
        const enabledMenus = Array.isArray(menuPolicy.enabledMenus) ? menuPolicy.enabledMenus : null;
        const disabledMenus = Array.isArray(menuPolicy.disabledMenus) ? menuPolicy.disabledMenus : [];
        const parentKey = parentMenuKey(key);
        if (featureFlags[key] === false) return false;
        if (disabledMenus.includes(key)) return false;
        if (parentKey && featureFlags[parentKey] === false) return false;
        if (parentKey && disabledMenus.includes(parentKey)) return false;
        if (enabledMenus && enabledMenus.length > 0) {
            if (enabledMenus.includes(key)) return true;
            if (parentKey && enabledMenus.includes(parentKey)) return true;
            return false;
        }
        return true;
    }

    function filterMenuItem(item) {
        if (!rolePolicyAllows(item)) return null;
        const key = resolveMenuKey(item);
        const directAllowed = hotelMenuPolicyAllows(key);
        if (Array.isArray(item.children)) {
            const children = item.children
                .filter(child => rolePolicyAllows(child) && hotelMenuPolicyAllows(resolveMenuKey(child, item)));
            if (children.length === 0) return null;
            const next = { ...item, key, children };
            if (!directAllowed && children[0]?.href) next.mainHref = children[0].href;
            return next;
        }
        return directAllowed ? { ...item, key } : null;
    }

    function findPagePolicy(fileName) {
        const normalizedFile = fileName === 'groups_block_detail.html'
            ? 'groups_blocks.html'
            : fileName;
        for (const group of MENU) {
            for (const item of group.items || []) {
                const itemFile = hrefFile(item.href || item.mainHref);
                if (itemFile === normalizedFile) return { group, item, child: null };
                for (const child of item.children || []) {
                    if (hrefFile(child.href) === normalizedFile) return { group, item, child };
                }
            }
        }
        return null;
    }

    function enforcePageAccess() {
        const fileName = hrefFile(window.location.pathname);
        const policy = findPagePolicy(fileName);
        if (!policy) return true;

        const roleAllowed = rolePolicyAllows(policy.group)
            && rolePolicyAllows(policy.item)
            && rolePolicyAllows(policy.child);
        const menuKey = resolveMenuKey(policy.child || policy.item, policy.item);
        if (roleAllowed && hotelMenuPolicyAllows(menuKey)) return true;

        sessionStorage.setItem('pms_access_denied', fileName);
        window.location.replace(BASE + 'dashboard.html');
        return false;
    }

    if (!enforcePageAccess()) return;

    window.PMS_MenuPolicy = {
        resolveMenuKey,
        rolePolicyAllows,
        hotelMenuPolicyAllows,
        enforcePageAccess
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

    const SIDEBAR_USER_PROFILES = {
        'sys_admin': { id:'s1', name: 'Nguyen Kim' },
        'sys_gm': { id:'s2', name: 'Robert Ford' },
        'sys_desk': { id:'s4', name: 'Sarah Connor' },
        'sys_housekeeping': { id:'s5', name: 'Maria Garcia' },
        'sys_maintenance': { id:'s7', name: '김철수' }
    };

    function sidebarEscape(value) {
        return String(value ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m]));
    }

    function readSidebarStaffList() {
        try {
            const data = JSON.parse(localStorage.getItem('pms_staff') || '[]');
            return Array.isArray(data) ? data : [];
        } catch(e) {
            return [];
        }
    }

    function saveSidebarStaffList(list) {
        localStorage.setItem('pms_staff', JSON.stringify(Array.isArray(list) ? list : []));
    }

    function currentSidebarProfile() {
        const fallback = SIDEBAR_USER_PROFILES[window.currentUserRole] || SIDEBAR_USER_PROFILES.sys_admin;
        const id = localStorage.getItem('mock_user_id') || fallback.id;
        const staff = readSidebarStaffList();
        const matched = staff.find(item => item.id === id)
            || staff.find(item => item.roleId === window.currentUserRole)
            || null;
        return {
            ...fallback,
            ...(matched || {}),
            id,
            roleId: matched?.roleId || window.currentUserRole
        };
    }

    function buildProfileModal(roleText) {
        const profile = currentSidebarProfile();
        const isSuperAdmin = profile.roleId === 'sys_admin';
        const lang = localStorage.getItem('pms_lang') || window.currentLang || 'ko';
        const text = {
            title: lang === 'en' ? 'My Profile' : '내 정보 수정',
            superAdmin: lang === 'en'
                ? 'Super admin account details are managed in hotel settings.'
                : '슈퍼관리자 계정 정보는 호텔 설정의 관리자 정보에서 관리합니다.',
            name: lang === 'en' ? 'Name' : '이름',
            role: lang === 'en' ? 'Role' : '권한',
            email: lang === 'en' ? 'Email' : '이메일',
            phone: lang === 'en' ? 'Phone' : '전화번호',
            address: lang === 'en' ? 'Address' : '주소',
            newPw: lang === 'en' ? 'New Password' : '새 비밀번호',
            newPwConfirm: lang === 'en' ? 'Confirm New Password' : '새 비밀번호 확인',
            pwPlaceholder: lang === 'en' ? 'Enter only to change' : '변경 시 입력',
            pwConfirmPlaceholder: lang === 'en' ? 'Confirm new password' : '새 비밀번호 확인',
            phonePlaceholder: lang === 'en' ? 'Ex: +84 90 123 4567' : '예: +84 90 123 4567',
            addressPlaceholder: lang === 'en' ? 'Ex: Ho Chi Minh City' : '예: Ho Chi Minh City',
            helper: lang === 'en'
                ? 'Leave password fields blank if you do not want to change the password.'
                : '비밀번호를 변경하지 않으려면 비밀번호 입력칸은 비워두세요.',
            cancel: lang === 'en' ? 'Cancel' : '취소',
            save: lang === 'en' ? 'Save' : '저장'
        };
        return `
<div class="modal-overlay" id="sidebarProfileModal" onclick="if(event.target===this) window.closeSidebarProfileModal()">
    <div class="modal-card" style="max-width:560px;width:95vw">
        <div class="modal-header">
            <h3 class="modal-title"><i class="fa-solid fa-user-gear" style="color:var(--primary);margin-right:8px"></i>${text.title}</h3>
            <button class="modal-close" onclick="window.closeSidebarProfileModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:16px">
            ${isSuperAdmin ? `<div class="empty-state" style="display:block;padding:18px;text-align:left">${text.superAdmin}</div>` : `
            <div class="profile-modal-grid">
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label class="form-label">${text.name}</label>
                    <input type="text" class="form-control" id="profileName" value="${sidebarEscape(profile.name || '')}">
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label class="form-label">${text.role}</label>
                    <input type="text" class="form-control" value="${sidebarEscape(roleText(profile.roleId))}" readonly style="background:#f1f5f9">
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px">
                <label class="form-label">${text.email}</label>
                <input type="email" class="form-control" id="profileEmail" value="${sidebarEscape(profile.email || '')}">
            </div>
            <div class="profile-modal-grid">
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label class="form-label">${text.phone}</label>
                    <input type="tel" class="form-control" id="profilePhone" value="${sidebarEscape(profile.phone || '')}" placeholder="${text.phonePlaceholder}">
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label class="form-label">${text.address}</label>
                    <input type="text" class="form-control" id="profileAddress" value="${sidebarEscape(profile.address || '')}" placeholder="${text.addressPlaceholder}">
                </div>
            </div>
            <div class="profile-modal-grid">
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label class="form-label">${text.newPw}</label>
                    <input type="password" class="form-control" id="profileNewPw" placeholder="${text.pwPlaceholder}">
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label class="form-label">${text.newPwConfirm}</label>
                    <input type="password" class="form-control" id="profileNewPwConfirm" placeholder="${text.pwConfirmPlaceholder}">
                </div>
            </div>
            <div class="profile-password-help">${text.helper}</div>
            `}
        </div>
        <div class="modal-footer">
            <button class="btn-outline" onclick="window.closeSidebarProfileModal()">${text.cancel}</button>
            ${isSuperAdmin ? '' : `<button class="btn-primary-sm" onclick="window.saveSidebarProfile()"><i class="fa-solid fa-floppy-disk"></i> ${text.save}</button>`}
        </div>
    </div>
</div>`;
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

        const activeProfile = currentSidebarProfile();
        const lang = localStorage.getItem('pms_lang') || window.currentLang || 'ko';
        const roleLabels = {
            ko: {
                sys_admin: '관리자',
                sys_gm: '총괄 매니저',
                sys_desk: '프론트 데스크',
                sys_housekeeping: '하우스키핑',
                sys_maintenance: '시설 보수'
            },
            en: {
                sys_admin: 'Admin',
                sys_gm: 'General Manager',
                sys_desk: 'Front Desk',
                sys_housekeeping: 'Housekeeping',
                sys_maintenance: 'Maintenance'
            }
        };
        const roleText = (role) => (roleLabels[lang] || roleLabels.ko)[role] || role;
        const isSuperAdmin = activeProfile.roleId === 'sys_admin';
        const profileButton = isSuperAdmin ? '' : `
                <button type="button" class="sidebar-profile-btn" onclick="window.openSidebarProfileModal()">
                    <i class="fa-solid fa-user-gear"></i>
                    <span>${lang === 'en' ? 'My Profile' : '내 정보 수정'}</span>
                </button>`;
        const logoutButton = `
                <button type="button" class="sidebar-logout-btn" onclick="window.logoutHotelPms()">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>${lang === 'en' ? 'Log out' : '로그아웃'}</span>
                </button>`;

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
            <div class="sidebar-user-card">
                <div class="user-info">
                    <div class="user-name">${sidebarEscape(activeProfile.name)}</div>
                    <div class="sidebar-user-role">${sidebarEscape(roleText(activeProfile.roleId))}</div>
                </div>
                ${profileButton}
                ${logoutButton}
            </div>
        </div>
    </div>
</aside>
${buildProfileModal(roleText)}`;
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

    window.openSidebarProfileModal = function() {
        const modal = document.getElementById('sidebarProfileModal');
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.logoutHotelPms = function() {
        sessionStorage.removeItem('pms_logged_in');
        sessionStorage.removeItem('pms_current_reservation');
        window.location.replace(BASE + 'login.html');
    };

    window.closeSidebarProfileModal = function() {
        const modal = document.getElementById('sidebarProfileModal');
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    window.saveSidebarProfile = function() {
        const profile = currentSidebarProfile();
        if (profile.roleId === 'sys_admin') {
            alert('슈퍼관리자 계정 정보는 호텔 설정에서 관리합니다.');
            return;
        }
        const name = document.getElementById('profileName')?.value.trim() || '';
        const email = document.getElementById('profileEmail')?.value.trim() || '';
        const phone = document.getElementById('profilePhone')?.value.trim() || '';
        const address = document.getElementById('profileAddress')?.value.trim() || '';
        const newPw = document.getElementById('profileNewPw')?.value.trim() || '';
        const newPwConfirm = document.getElementById('profileNewPwConfirm')?.value.trim() || '';
        if (!name) { alert('이름을 입력해 주세요.'); return; }
        if (!email) { alert('이메일을 입력해 주세요.'); return; }
        if (newPw || newPwConfirm) {
            if (!newPw || !newPwConfirm) { alert('새 비밀번호와 확인값을 모두 입력해 주세요.'); return; }
            if (newPw !== newPwConfirm) { alert('새 비밀번호가 서로 일치하지 않습니다.'); return; }
            if (newPw.length < 8) { alert('비밀번호는 8자 이상으로 입력해 주세요.'); return; }
        }

        const staff = readSidebarStaffList();
        const duplicate = staff.some(item => item.id !== profile.id && String(item.email || '').toLowerCase() === email.toLowerCase());
        if (duplicate) { alert('이미 등록된 이메일입니다.'); return; }

        const index = staff.findIndex(item => item.id === profile.id);
        const next = {
            ...(index >= 0 ? staff[index] : profile),
            id: profile.id,
            roleId: profile.roleId,
            name,
            email,
            phone,
            address,
            last: '방금 전'
        };
        if (newPw) {
            next.password = newPw;
            next.passwordUpdatedAt = new Date().toISOString();
            next.passwordChangeRequired = false;
            next.passwordMethod = 'self';
        }
        if (index >= 0) staff[index] = next;
        else staff.push(next);
        saveSidebarStaffList(staff);
        localStorage.setItem('mock_user_id', next.id);
        window.closeSidebarProfileModal();
        inject();
        updateActiveSidebarLinks();
        window.dispatchEvent(new CustomEvent('pms:profile-updated', { detail: next }));
    };

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
            const hasActiveChild = !!div.nextElementSibling?.querySelector?.('.nav-sub-item.active');
            if (hasActiveChild) return;
            div.classList.remove('active');
            if (div.getAttribute('onclick').includes(activePath)) div.classList.add('active');
        });
    }

    const TABLET_MENU_BREAKPOINT = 1180;

    function setSidebarOpen(open) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (!sidebar || !overlay) return;
        sidebar.classList.toggle('active', open);
        overlay.classList.toggle('active', open);
        document.body.classList.toggle('sidebar-open', open);
        document.querySelectorAll('.mobile-menu-btn').forEach(btn => {
            btn.setAttribute('aria-expanded', String(open));
        });
    }

    function syncSidebarForViewport() {
        if (window.innerWidth > TABLET_MENU_BREAKPOINT) setSidebarOpen(false);
    }

    window.PMS_Sidebar = {
        toggleMenu() {
            const sidebar = document.querySelector('.sidebar');
            setSidebarOpen(!sidebar?.classList.contains('active'));
        },

        closeMenu() {
            setSidebarOpen(false);
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
            const lang = localStorage.getItem('pms_lang') || window.currentLang || 'ko';
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
            window.addEventListener('resize', syncSidebarForViewport);
            syncSidebarForViewport();

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
