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

    const scriptsToLoad = [
        `${BASE}common/data/users.js`,
        `${BASE}common/data/billing.js`,
        `${BASE}common/data/tickets.js`,
        `${BASE}common/data/devices.js`,
        `${BASE}common/data/audit.js`
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
        document.head.appendChild(script);
    });

    const MENU = [
        { group: 'Main', items: [
            { icon: 'fa-chart-line', label: 'Platform Status', href: BASE + 'admin.html' }
        ]},
        { group: 'Tenant Mgmt', items: [
            { icon: 'fa-building',       label: 'Hotel List',     href: BASE + 'tenants/list.html' },
            { icon: 'fa-circle-plus',    label: 'New Registration', href: BASE + 'tenants/register.html' }
        ]},
        { group: 'Ad Network', items: [
            { icon: 'fa-rectangle-ad',   label: 'Campaigns',   href: BASE + 'ads/campaigns.html' },
            { icon: 'fa-plus',           label: 'New Campaign',   href: BASE + 'ads/new.html' },
            { icon: 'fa-file-invoice-dollar', label: 'Ad Billing', href: BASE + 'ads/billing.html' }
        ]},
        { group: 'System', items: [
            { icon: 'fa-users-gear',         label: 'Admin Accounts',   href: BASE + 'system/users.html' },
            { icon: 'fa-credit-card',        label: 'Subscription & Billing',   href: BASE + 'system/billing.html' },
            { icon: 'fa-headset',            label: 'Customer Support',     href: BASE + 'system/helpdesk.html' },
            { icon: 'fa-bullhorn',           label: 'Notice Mgmt', href: BASE + 'system/notices.html' },
            { icon: 'fa-clock-rotate-left',  label: 'Audit Logs',     href: BASE + 'system/audit-logs.html' }
        ]}
    ];

    function buildSidebar() {
        let groups = '';
        MENU.forEach(g => {
            let items = '';
            g.items.forEach(it => {
                items += `<a class="nav-item" href="${it.href}"><i class="fa-solid ${it.icon}"></i><span data-i18n-key="${it.label}">${it.label}</span></a>`;
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
            <div class="user-info"><div class="user-name">Super Admin</div><div class="user-role">Platform Owner</div></div>
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
