import os
import shutil

base_path = r"E:\AI_Project\Hotel_PMS"
dashboard_path = os.path.join(base_path, "dashboard")

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Create unified-pos.html
upos_path = os.path.join(dashboard_path, "operations", "unified-pos.html")
upos_content = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>통합 POS — Hotel PMS</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="../common/css/dashboard.css">
    <script src="../common/js/i18n.js"></script>
    <script src="../common/js/sidebar.js"></script>
    <style>
        .pos-container { display: flex; gap: 20px; height: calc(100vh - 120px); }
        .pos-left { flex: 1; display: flex; flex-direction: column; background: #fff; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .pos-right { width: 350px; display: flex; flex-direction: column; background: #fff; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        
        .pos-tabs { display: flex; background: var(--card); border-bottom: 1px solid var(--border); overflow-x: auto; }
        .pos-tab { padding: 15px 20px; font-weight: 600; font-size: 0.9rem; color: var(--txt2); cursor: pointer; border-bottom: 3px solid transparent; white-space: nowrap; }
        .pos-tab.active { color: var(--primary); border-bottom-color: var(--primary); background: #fff; }
        .pos-tab:hover:not(.active) { background: #fff; }
        
        .item-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; padding: 20px; overflow-y: auto; }
        .item-card { border: 1px solid var(--border2); border-radius: 8px; padding: 15px; text-align: center; cursor: pointer; transition: all 0.2s; display:flex; flex-direction:column; gap:8px; align-items:center;}
        .item-card:hover { border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .item-icon { font-size: 2rem; color: var(--txt3); }
        .item-name { font-size: 0.85rem; font-weight: 600; color: var(--txt); }
        .item-price { font-size: 0.9rem; font-weight: 700; color: var(--primary); }
        
        .cart-header { padding: 15px 20px; border-bottom: 1px solid var(--border); background: var(--card); font-weight: 700; display:flex; justify-content:space-between}
        .cart-body { flex: 1; padding: 20px; overflow-y: auto; display:flex; flex-direction:column; gap:10px; }
        .cart-item { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border2); padding-bottom: 10px; }
        .cart-total { padding: 20px; border-top: 2px solid var(--border); background: #f8fafc; }
        .total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 1.2rem; font-weight: 800; color: var(--primary); }
    </style>
</head>
<body>
<div class="main">
    <header class="topbar">
        <div class="topbar-left">
            <button class="mobile-menu-btn" onclick="toggleMenu()"><i class="fa-solid fa-bars"></i></button>
            <h1 data-i18n-key="Unified POS">통합 POS (F&B / 부가서비스)</h1>
        </div>
    </header>
    <div class="content" style="padding-top:20px;">
        <div class="pos-container">
            <!-- Left: Catalog -->
            <div class="pos-left">
                <div class="pos-tabs">
                    <div class="pos-tab active"><i class="fa-solid fa-utensils"></i> 레스토랑 (F&B)</div>
                    <div class="pos-tab"><i class="fa-solid fa-bell-concierge"></i> 룸서비스</div>
                    <div class="pos-tab"><i class="fa-solid fa-golf-ball-tee"></i> 골프 예약</div>
                    <div class="pos-tab"><i class="fa-solid fa-car"></i> 렌터카</div>
                    <div class="pos-tab"><i class="fa-solid fa-wine-bottle"></i> 미니바</div>
                </div>
                <div class="item-grid">
                    <div class="item-card" onclick="addToCart('조식 뷔페 (성인)', 35)">
                        <i class="fa-solid fa-mug-hot item-icon" style="color:#F59E0B"></i>
                        <span class="item-name">조식 뷔페 (성인)</span>
                        <span class="item-price">$35.00</span>
                    </div>
                    <div class="item-card" onclick="addToCart('조식 뷔페 (아동)', 20)">
                        <i class="fa-solid fa-mug-hot item-icon" style="color:#F59E0B"></i>
                        <span class="item-name">조식 뷔페 (아동)</span>
                        <span class="item-price">$20.00</span>
                    </div>
                    <div class="item-card" onclick="addToCart('아메리카노', 5)">
                        <i class="fa-solid fa-coffee item-icon" style="color:#8B5CF6"></i>
                        <span class="item-name">아메리카노</span>
                        <span class="item-price">$5.00</span>
                    </div>
                    <div class="item-card" onclick="addToCart('스테이크 디너', 85)">
                        <i class="fa-solid fa-drumstick-bite item-icon" style="color:#EF4444"></i>
                        <span class="item-name">스테이크 디너</span>
                        <span class="item-price">$85.00</span>
                    </div>
                    <div class="item-card" onclick="addToCart('18홀 그린피', 150)">
                        <i class="fa-solid fa-golf-ball-tee item-icon" style="color:#10B981"></i>
                        <span class="item-name">18홀 그린피</span>
                        <span class="item-price">$150.00</span>
                    </div>
                </div>
            </div>
            
            <!-- Right: Cart & Checkout -->
            <div class="pos-right">
                <div class="cart-header">
                    <span>주문 리스트 (Cart)</span>
                    <span style="color:var(--danger);cursor:pointer;font-size:0.8rem;font-weight:600" onclick="clearCart()">전체 삭제</span>
                </div>
                <div class="cart-body" id="cartBody">
                    <div style="color:var(--txt3);font-size:0.85rem;text-align:center;margin-top:50px">좌측에서 상품을 선택해주세요.</div>
                </div>
                <div class="cart-total">
                    <div class="total-row">
                        <span>Total</span>
                        <span id="cartTotal">$0.00</span>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <div>
                            <label style="font-size:0.75rem; font-weight:600; color:var(--txt2)">객실로 청구 (Room Charge)</label>
                            <div style="display:flex; gap:5px; margin-top:4px">
                                <input type="text" class="form-input" placeholder="Room 번호 (예: 1205)" style="flex:1; height:42px;">
                                <button class="btn-primary-sm" onclick="alert('객실 청구가 완료되었습니다.')" style="height:42px;">청구</button>
                            </div>
                        </div>
                        <div style="text-align:center; color:var(--txt3); font-size:0.7rem; font-weight:600">- OR -</div>
                        <button class="btn-primary-sm" style="background:#10B981; border-color:#10B981; height:42px" onclick="alert('현장 카드/현금 결제창을 엽니다.')">현장 즉시 결제 (Pay Now)</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<script>
    let cart = [];
    function addToCart(name, price) {
        let existing = cart.find(c => c.name === name);
        if(existing) existing.qty++;
        else cart.push({name, price, qty:1});
        renderCart();
    }
    function clearCart() { cart = []; renderCart(); }
    function renderCart() {
        let html = '';
        let total = 0;
        if(cart.length === 0) {
            html = '<div style="color:var(--txt3);font-size:0.85rem;text-align:center;margin-top:50px">좌측에서 상품을 선택해주세요.</div>';
        } else {
            cart.forEach(c => {
                total += c.price * c.qty;
                html += `
                <div class="cart-item">
                    <div>
                        <div style="font-weight:600;font-size:0.85rem">${c.name}</div>
                        <div style="font-size:0.75rem;color:var(--txt2)">$${c.price} x ${c.qty}</div>
                    </div>
                    <div style="font-weight:700">$${(c.price * c.qty).toFixed(2)}</div>
                </div>`;
            });
        }
        document.getElementById('cartBody').innerHTML = html;
        document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);
    }
</script>
</body>
</html>
"""
write_file(upos_path, upos_content)


# 2. Re-write sidebar.js
sb_path = os.path.join(dashboard_path, "common", "js", "sidebar.js")
sb_content = """(function () {
    const MENU = [
        {
            group: 'Front Desk',
            items: [
                { icon: 'fa-chart-pie', label: 'Dashboard', href: BASE + 'index.html' },
                { icon: 'fa-calendar-days', label: 'Reservations', href: BASE + 'frontdesk/reservation-timeline.html' },
                { icon: 'fa-user-check', label: 'Reception (In-house)', href: BASE + 'frontdesk/checkin.html' },
                { icon: 'fa-users', label: 'Groups', href: BASE + 'frontdesk/groups.html' }
            ]
        },
        {
            group: 'Billing & POS',
            items: [
                { icon: 'fa-file-invoice-dollar', label: 'Guest Folio (정산)', href: BASE + 'operations/folio.html' },
                { icon: 'fa-cash-register', label: 'Unified POS (포스)', href: BASE + 'operations/unified-pos.html' }
            ]
        },
        {
            group: 'Rooms & Facilities',
            items: [
                { icon: 'fa-broom', label: 'Housekeeping', href: BASE + 'operations/housekeeping.html' },
                { icon: 'fa-wrench', label: 'Maintenance', href: BASE + 'operations/maintenance.html' }
            ]
        },
        {
            group: 'Reports & CRM',
            items: [
                { icon: 'fa-address-book', label: 'Guest Directory', href: BASE + 'frontdesk/guests.html' },
                { icon: 'fa-chart-column', label: 'Reports', href: BASE + 'operations/reports.html' },
                { icon: 'fa-moon', label: 'Night Audit', href: BASE + 'operations/night-audit.html' }
            ]
        },
        {
            group: 'Settings',
            items: [
                { icon: 'fa-bed', label: 'Room Setup', href: BASE + 'settings/room-setup.html' },
                { icon: 'fa-door-open', label: 'Room List', href: BASE + 'settings/rooms.html' },
                { icon: 'fa-tags', label: 'Rates Calendar', href: BASE + 'settings/rates.html' },
                { icon: 'fa-building', label: 'Property Settings', href: BASE + 'settings/hotel-settings.html' },
                { icon: 'fa-user-tie', label: 'Staff & Roles', href: BASE + 'settings/staff.html' }
            ]
        }
    ];

    function buildSidebar() {
        let groups = '';
        MENU.forEach(g => {
            let items = '';
            g.items.forEach(it => {
                items += `<a class="nav-item" href="${it.href}"><i class="fa-solid ${it.icon}"></i><span data-i18n-key="${it.label}">${it.label}</span></a>`;
            });
            groups += `<div class="nav-group"><div class="nav-group-label" data-i18n-key="${g.group}">${g.group}</div>${items}</div>`;
        });
        return `<div class="sidebar-overlay" onclick="toggleMenu()"></div>
<aside class="sidebar">
    <div class="sidebar-logo">
        <div class="logo-icon"><i class="fa-solid fa-hotel"></i></div>
        <div><div class="logo-text">HOTEL PMS</div><div class="logo-sub">Property Management</div></div>
    </div>
    <nav class="sidebar-nav">${groups}</nav>
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
        const path = window.location.pathname.replace(/\\\\/g, '/');
        document.querySelectorAll('.sidebar-nav a.nav-item').forEach(a => {
            a.classList.remove('active');
            let href = a.getAttribute('href');
            if (href.startsWith('../')) href = href.substring(3);
            else if (href.startsWith('./')) href = href.substring(2);
            if (path.endsWith("/" + href) || path.endsWith(href)) {
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
"""
write_file(sb_path, sb_content)

print("Plan 06 IA Restructuring executed successfully.")
