"""
replace_sidebar.py
모든 HTML 페이지에서 기존 인라인 사이드바 HTML + 스크립트를 제거하고
공통 sidebar.js 한 줄 로드로 교체합니다.
"""
import os
import re

# 대상 파일 (dashboard.html 은 경로가 달라 별도 처리)
DASHBOARD_DIR = r'e:\AI_Project\Hotel_PMS\dashboard'

# 각 서브폴더 별 sidebar.js 상대 경로
SUB_FOLDERS = {
    'frontdesk': '../common/js/sidebar.js',
    'crm':       '../common/js/sidebar.js',
    'operations':'../common/js/sidebar.js',
    'settings':  '../common/js/sidebar.js',
}
DASHBOARD_SIDEBAR_PATH = 'common/js/sidebar.js'  # dashboard.html 기준

# ── 정규식 패턴 ──────────────────────────────────────────────
# 1. <div class="sidebar-overlay"...> ~ </aside> 블록
SIDEBAR_HTML_PATTERN = re.compile(
    r'<div class="sidebar-overlay"[^>]*>.*?</aside>',
    re.DOTALL
)

# 2. <script> 안에 // === Sidebar State Management === 포함된 블록
SIDEBAR_SCRIPT_PATTERN = re.compile(
    r'<script>\s*//\s*===\s*Sidebar State Management\s*===.*?</script>',
    re.DOTALL
)

# 3. toggleMenu 단독 inline script (일부 페이지)
TOGGLE_MENU_PATTERN = re.compile(
    r'function toggleMenu\(\)\{[^}]+\}\s*',
    re.DOTALL
)

def process_file(filepath, sidebar_js_path):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 이미 sidebar.js 로드 중이면 스킵
    if 'sidebar.js' in content:
        print(f'  [SKIP] 이미 처리됨: {filepath}')
        return

    # 1. 사이드바 HTML 제거
    content, n1 = SIDEBAR_HTML_PATTERN.subn('', content)

    # 2. 사이드바 Script 블록 제거
    content, n2 = SIDEBAR_SCRIPT_PATTERN.subn('', content)

    # 3. 개별 toggleMenu 함수 제거 (Script 내 남아있는 경우)
    content, n3 = TOGGLE_MENU_PATTERN.subn('', content)

    # 변경 사항 없으면 스킵
    if n1 == 0 and n2 == 0:
        print(f'  [SKIP] 패턴 없음: {filepath}')
        return

    # 4. </head> 직전에 sidebar.js 스크립트 태그 삽입
    sidebar_tag = f'<script src="{sidebar_js_path}"></script>\n'
    if sidebar_tag not in content:
        content = content.replace('</head>', f'    {sidebar_tag}</head>', 1)

    # 5. 빈 줄 정리 (연속 3줄 이상 -> 2줄)
    content = re.sub(r'\n{3,}', '\n\n', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'  [OK] 처리 완료: {filepath}  (HTML:{n1} Script:{n2} toggleMenu:{n3})')

def main():
    processed = 0

    # 서브폴더 HTML 파일들
    for folder, js_path in SUB_FOLDERS.items():
        folder_path = os.path.join(DASHBOARD_DIR, folder)
        if not os.path.isdir(folder_path):
            continue
        for fname in os.listdir(folder_path):
            if fname.endswith('.html'):
                fpath = os.path.join(folder_path, fname)
                print(f'처리 중: {fpath}')
                process_file(fpath, js_path)
                processed += 1

    # dashboard.html (루트 dashboard 폴더)
    dashboard_html = os.path.join(DASHBOARD_DIR, 'dashboard.html')
    if os.path.exists(dashboard_html):
        print(f'처리 중: {dashboard_html}')
        process_file(dashboard_html, DASHBOARD_SIDEBAR_PATH)
        processed += 1

    print(f'\n완료: 총 {processed}개 파일 처리')

if __name__ == '__main__':
    main()
