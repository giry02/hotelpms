import os

base_path = r"E:\AI_Project\Hotel_PMS"
admin_path = os.path.join(base_path, "admin")

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Update admin-sidebar.js
sb_path = os.path.join(admin_path, "common", "js", "admin-sidebar.js")
if os.path.exists(sb_path):
    sb_content = read_file(sb_path)
    
    integration_item = "            { icon: 'fa-plug',               label: 'Integration Hub',  href: BASE + 'system/integrations.html' },\n"
    if "Integration Hub" not in sb_content:
        sb_content = sb_content.replace("{ icon: 'fa-credit-card',        label: 'Subscription & Billing',   href: BASE + 'system/billing.html' },\n",
                                      "{ icon: 'fa-credit-card',        label: 'Subscription & Billing',   href: BASE + 'system/billing.html' },\n" + integration_item)
        write_file(sb_path, sb_content)

# 2. Create integrations.html
integ_path = os.path.join(admin_path, "system", "integrations.html")
integ_html = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Integration Hub — Super Admin</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="../common/css/admin.css">
    <script src="../common/js/admin-i18n.js"></script>
    <script src="../common/js/admin-sidebar.js"></script>
    <style>
        .app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
        .app-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 15px; transition: all 0.2s; }
        .app-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); border-color: var(--primary-lt); }
        .app-header { display: flex; align-items: center; gap: 15px; }
        .app-icon { width: 50px; height: 50px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #fff; }
        .app-title { font-size: 1.1rem; font-weight: 700; color: var(--txt); }
        .app-cat { font-size: 0.75rem; font-weight: 600; color: var(--txt3); text-transform: uppercase; letter-spacing: 0.5px; }
        .app-desc { font-size: 0.85rem; color: var(--txt2); line-height: 1.5; flex: 1; }
        .app-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border2); padding-top: 15px; }
        .toggle-switch { position: relative; width: 44px; height: 24px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(20px); }
    </style>
</head>
<body>
<div class="main">
    <header class="topbar">
        <div class="topbar-left">
            <button class="mobile-menu-btn" onclick="toggleMenu()"><i class="fa-solid fa-bars"></i></button>
            <h1 data-i18n-key="Integration Hub">서드파티 통합 마켓플레이스</h1>
        </div>
    </header>
    <div class="content">
        <div class="filter-bar">
            <div style="display:flex;gap:10px;">
                <button class="btn-primary-sm" style="background:var(--card);color:var(--txt);border:1px solid var(--border)">All Apps</button>
                <button class="btn-primary-sm" style="background:var(--card);color:var(--txt);border:1px solid var(--border)">Payments (PG)</button>
                <button class="btn-primary-sm" style="background:var(--card);color:var(--txt);border:1px solid var(--border)">Keyless Locks</button>
                <button class="btn-primary-sm" style="background:var(--card);color:var(--txt);border:1px solid var(--border)">Messaging</button>
            </div>
            <button class="btn-primary-sm"><i class="fa-solid fa-plus"></i> Add Custom App</button>
        </div>

        <div class="app-grid">
            <div class="app-card">
                <div class="app-header">
                    <div class="app-icon" style="background: #635BFF;"><i class="fa-brands fa-stripe-s"></i></div>
                    <div>
                        <div class="app-title">Stripe Payments</div>
                        <div class="app-cat">Payments (PG)</div>
                    </div>
                </div>
                <div class="app-desc">글로벌 신용카드 결제 및 디파짓(Pre-auth) 처리를 위한 Stripe 결제 모듈입니다. 테넌트들이 자신의 Stripe 계정을 연결할 수 있습니다.</div>
                <div class="app-footer">
                    <button class="btn-outline-sm" onclick="alert('API 설정을 엽니다.')">API 설정</button>
                    <label class="toggle-switch">
                        <input type="checkbox" checked>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>

            <div class="app-card">
                <div class="app-header">
                    <div class="app-icon" style="background: #FEE500; color: #371D1E;"><i class="fa-solid fa-comment"></i></div>
                    <div>
                        <div class="app-title">Kakao Alimtalk</div>
                        <div class="app-cat">Messaging</div>
                    </div>
                </div>
                <div class="app-desc">국내 고객을 위한 카카오톡 알림톡 발송 모듈입니다. 예약 확정, 체크인 안내, 웰컴 메시지 자동 발송을 지원합니다.</div>
                <div class="app-footer">
                    <button class="btn-outline-sm">API 설정</button>
                    <label class="toggle-switch">
                        <input type="checkbox" checked>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>

            <div class="app-card">
                <div class="app-header">
                    <div class="app-icon" style="background: #E83E8C;"><i class="fa-solid fa-key"></i></div>
                    <div>
                        <div class="app-title">Salto Keyless</div>
                        <div class="app-cat">Keyless Locks</div>
                    </div>
                </div>
                <div class="app-desc">Salto 도어락 시스템과 연동하여 모바일 체크인 시 고객의 스마트폰으로 모바일 객실 키(BLE)를 전송합니다.</div>
                <div class="app-footer">
                    <button class="btn-outline-sm">API 설정</button>
                    <label class="toggle-switch">
                        <input type="checkbox">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="app-card">
                <div class="app-header">
                    <div class="app-icon" style="background: #00A650;"><i class="fa-solid fa-building-columns"></i></div>
                    <div>
                        <div class="app-title">NICE Pay (나이스페이)</div>
                        <div class="app-cat">Payments (PG)</div>
                    </div>
                </div>
                <div class="app-desc">국내 신용카드, 가상계좌, 간편결제(네이버페이, 카카오페이 등)를 지원하는 국내 표준 결제 게이트웨이 연동 모듈입니다.</div>
                <div class="app-footer">
                    <button class="btn-outline-sm">API 설정</button>
                    <label class="toggle-switch">
                        <input type="checkbox">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>
"""
write_file(integ_path, integ_html)
print("Integration Hub created.")
