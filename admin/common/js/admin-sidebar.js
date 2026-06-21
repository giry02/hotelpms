/**
 * admin-sidebar.js — Super Admin Portal 사이드바
 * 메뉴구조도_PMS.xlsx '최종 관리자(Super Admin)' 탭 기준
 */
(function () {
    // Auth Check
    if (sessionStorage.getItem('admin_logged_in') !== 'true') {
        const _p = window.location.pathname.split('/').filter(Boolean);
        const depth = _p.length - _p.indexOf('admin') - 1;
        const prefix = depth > 0 ? '../'.repeat(depth) : '';
        window.location.replace(prefix + 'login.html');
        return;
    }

    const _pathParts = window.location.pathname.split('/').filter(Boolean);
    const _parentDir = _pathParts[_pathParts.length - 2] || '';
    const _subDirs = ['tenants', 'ads', 'system'];
    const BASE = _subDirs.includes(_parentDir) ? '../' : '';

    const DATASETS = [
        { key: 'users', src: `${BASE}data/api/v1/admin/users.json`, legacySrc: `${BASE}data/users.json` },
        { key: 'billing', src: `${BASE}data/api/v1/admin/billing.json`, legacySrc: `${BASE}data/billing.json` },
        { key: 'tickets', src: `${BASE}data/api/v1/admin/support-tickets.json`, legacySrc: `${BASE}data/tickets.json` },
        { key: 'devices', src: `${BASE}data/trusted-devices.json` },
        { key: 'auditLogs', src: `${BASE}data/api/v1/admin/audit-logs.json`, legacySrc: `${BASE}data/audit-logs.json` },
        { key: 'tenantApplications', src: `${BASE}data/api/v1/admin/tenant-applications.json`, legacySrc: `${BASE}data/tenant-applications.json` },
        { key: 'dashboardSummary', src: `${BASE}data/api/v1/admin/dashboard/summary.json` },
        { key: 'tenants', src: `${BASE}data/api/v1/admin/tenants.json` }
    ];

    const FALLBACK_DATA = {
        users: [
            { id: 'ADM-1', name: 'Super Admin', email: 'superadmin@platform.example', role: 'Platform Owner', status: 'active', lastLogin: '2026-05-28 09:00' },
            { id: 'ADM-2', name: 'Ops Manager', email: 'ops@platform.example', role: 'Operations', status: 'active', lastLogin: '2026-05-27 18:40' }
        ],
        billing: [
            { id: 'INV-202605-001', tenantId: 'TENANT-GRAND-SAIGON', hotelName: 'The Grand Saigon', plan: 'Premium', amount: 1250, currency: 'PHP', status: 'paid', issuedAt: '2026-05-01', dueAt: '2026-05-10' },
            { id: 'INV-202605-002', tenantId: 'TENANT-HANOI-LAKE', hotelName: 'Hanoi Lakeside', plan: 'Standard', amount: 650, currency: 'PHP', status: 'open', issuedAt: '2026-05-01', dueAt: '2026-05-10' }
        ],
        tickets: [
            { id: 'TCK-1001', tenantId: 'TENANT-GRAND-SAIGON', hotelName: 'The Grand Saigon', title: '요금 캘린더 저장 확인 요청', status: 'open', priority: 'normal', createdAt: '2026-05-28 09:00' },
            { id: 'TCK-1002', tenantId: 'TENANT-HANOI-LAKE', hotelName: 'Hanoi Lakeside', title: '관리자 비밀번호 초기화 요청', status: 'pending', priority: 'high', createdAt: '2026-05-27 10:15' }
        ],
        devices: [
            { id: 'DEV-001', name: 'MacBook Pro - Chrome', os: 'macOS 14.0', ip: '112.168.45.12 (Seoul, KR)', addedAt: '2026-05-10', lastActive: '현재 접속 중', status: 'active', current: true },
            { id: 'DEV-002', name: 'iPhone 15 Pro - Safari', os: 'iOS 17.2', ip: '211.55.102.8 (Busan, KR)', addedAt: '2026-05-12', lastActive: '2026-05-21 08:30', status: 'active', current: false },
            { id: 'DEV-003', name: 'Galaxy Tab S9 - Chrome', os: 'Android 14', ip: '14.33.20.100 (Jeju, KR)', addedAt: '2026-03-05', lastActive: '2026-04-10 14:20', status: 'expired', current: false }
        ],
        auditLogs: [
            { id: 'AUD-1001', actor: 'Super Admin', action: 'tenant.approve', target: 'APP-20260526-002', ip: '10.0.0.12', createdAt: '2026-05-26 15:10', risk: 'Low' },
            { id: 'AUD-1002', actor: 'Ops Manager', action: 'user.password_reset', target: 'TENANT-GRAND-SAIGON', ip: '10.0.0.14', createdAt: '2026-05-27 12:00', risk: 'Medium' }
        ],
        tenantApplications: [
            { id: 'APP-20260526-001', hotelName: 'Hanoi Lakeside', country: 'Vietnam', city: 'Hanoi', plan: 'Standard', rooms: 180, status: 'pending', email: 'owner@hanoilake.example' },
            { id: 'APP-20260526-002', hotelName: 'Jeju Bay Resort', country: 'South Korea', city: 'Jeju', plan: 'Standard', rooms: 210, status: 'pending', email: 'owner@jejubay.example' }
        ],
        dashboardSummary: {
            tenants: 3,
            applications: 2,
            monthlyRecurringRevenue: { amount: 1900, currency: 'PHP' },
            openTickets: 2,
            pmsOperationCoverage: []
        },
        tenants: [
            { id: 'TENANT-GRAND-SAIGON', hotelName: 'The Grand Saigon', country: 'Vietnam', city: 'Ho Chi Minh', plan: 'Premium', status: 'active', currency: 'PHP' },
            { id: 'TENANT-HANOI-LAKE', hotelName: 'Hanoi Lakeside', country: 'Vietnam', city: 'Hanoi', plan: 'Standard', status: 'active', currency: 'VND' }
        ]
    };

    window.AdminData = window.AdminData || {};
    window.adminDataReady = false;
    window.onAdminDataReady = function(callback) {
        if (window.adminDataReady) callback();
        else window.addEventListener('DataReady', callback, { once: true });
    };

    async function loadAdminData() {
        await Promise.all(DATASETS.map(async item => {
            try {
                let res = await fetch(item.src, { cache: 'no-store' });
                if (!res.ok && item.legacySrc) res = await fetch(item.legacySrc, { cache: 'no-store' });
                if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                const payload = await res.json();
                window.AdminData[item.key] = payload?.success && payload?.data
                    ? (payload.data.items || payload.data)
                    : payload;
            } catch (err) {
                window.AdminData[item.key] = window.AdminData[item.key] || JSON.parse(JSON.stringify(FALLBACK_DATA[item.key] || []));
                console.warn(`Admin data load failed: ${item.src}`, err);
            }
        }));
        const emitReady = () => {
            window.adminDataReady = true;
            window.dispatchEvent(new Event('DataReady'));
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', emitReady, { once: true });
        } else {
            emitReady();
        }
    }
    loadAdminData();

    const MENU = [
        { group: '메인', items: [
            { icon: 'fa-chart-line', label: '플랫폼 현황', href: BASE + 'admin.html' }
        ]},
        { group: '입점 호텔 관리', items: [
            { icon: 'fa-building',       label: '호텔 목록',     href: BASE + 'tenants/list.html' },
            { icon: 'fa-circle-plus',    label: '관리자 직접 등록', href: BASE + 'tenants/register.html' }
        ]},
        { group: '광고 네트워크', items: [
            { icon: 'fa-rectangle-ad',   label: '캠페인 목록',   href: BASE + 'ads/campaigns.html' },
            { icon: 'fa-plus',           label: '캠페인 등록',   href: BASE + 'ads/new.html' },
            { icon: 'fa-file-invoice-dollar', label: '광고 정산', href: BASE + 'ads/billing.html' }
        ]},
        { group: '시스템 관리', items: [
            { icon: 'fa-users-gear',         label: '관리자 계정',   href: BASE + 'system/users.html' },
            { icon: 'fa-credit-card',        label: '구독 및 결제',   href: BASE + 'system/billing.html' },
            { icon: 'fa-plug',               label: '연동 관리',  href: BASE + 'system/integrations.html' },
            { icon: 'fa-headset',            label: '고객 지원',     href: BASE + 'system/helpdesk.html' },
            { icon: 'fa-bullhorn',           label: '공지사항 관리', href: BASE + 'system/notices.html' },
            { icon: 'fa-clock-rotate-left',  label: '감사 로그',     href: BASE + 'system/audit-logs.html' }
        ]}
    ];

    function buildSidebar() {
        let groups = '';
        MENU.forEach(g => {
            let items = '';
            g.items.forEach(it => {
                items += `<a class="nav-item" href="${it.href}"><i class="fa-solid ${it.icon}"></i><span>${it.label}</span></a>`;
            });
            groups += `<div class="nav-group"><div class="nav-group-label">${g.group}</div>${items}</div>`;
        });
        return `<div class="sidebar-overlay" onclick="toggleMenu()"></div>
<aside class="sidebar">
    <div class="sidebar-logo">
        <div class="logo-icon"><i class="fa-solid fa-shield-halved"></i></div>
        <div><div class="logo-text">SUPER ADMIN</div><div class="logo-sub">Platform Management</div></div>
    </div>
    <nav class="sidebar-nav">${groups}</nav>
    <div class="sidebar-bottom">
        <a href="${BASE}system/profile.html" class="sidebar-user" style="text-decoration:none; color:inherit; display:flex; padding:8px; border-radius:8px; transition:background 0.2s;">
            <div class="user-avatar">SA</div>
            <div class="user-info"><div class="user-name">슈퍼 관리자</div><div class="user-role">플랫폼 운영자</div></div>
        </a>
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
        } else { root.outerHTML = buildSidebar(); }
    }

    function updateActive() {
        const path = window.location.pathname;
        const curFile = path.split('/').pop() || 'admin.html';
        const isAds = path.includes('/ads/');
        const isTenants = path.includes('/tenants/');

        document.querySelectorAll('.sidebar-nav a.nav-item').forEach(a => {
            a.classList.remove('active');
            let href = a.getAttribute('href');
            
            // Normalize href to remove BASE prefix like '../' or './' for comparison
            if (href.startsWith('../')) href = href.substring(3);
            else if (href.startsWith('./')) href = href.substring(2);

            // Normalize path to forward slashes for reliable comparison
            const normalizedPath = path.replace(/\\/g, '/');
            if (normalizedPath.endsWith("/" + href) || normalizedPath.endsWith(href)) {
                // We use endsWith("/" + href) to prevent "ads/billing.html" from matching "system/billing.html" by mistake
                // If the path exactly equals href, endsWith(href) will catch it.
                if (normalizedPath.endsWith("/" + href) || normalizedPath === href || normalizedPath === "/" + href) {
                    a.classList.add('active');
                }
            } else if (isTenants && curFile === 'detail.html' && href === 'tenants/list.html') {
                a.classList.add('active');
            } else if (isAds && (curFile === 'detail.html' || curFile === 'targeting.html') && href === 'ads/campaigns.html') {
                a.classList.add('active');
            }
        });
    }

    window.toggleMenu = function () {
        document.querySelector('.sidebar')?.classList.toggle('active');
        document.querySelector('.sidebar-overlay')?.classList.toggle('active');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { inject(); if(typeof window.changeLang==='function') window.changeLang(window.currentLang || 'ko'); updateActive(); });
    } else { inject(); if(typeof window.changeLang==='function') window.changeLang(window.currentLang || 'ko'); updateActive(); }
})();
