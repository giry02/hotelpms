import os, re

# Pattern: the expandable div + nav-sub block for 통합 정산
# Replace with: simple link on mobile (m-folio-link) + expandable on desktop (d-folio-nav)

def make_replacement(folio_href, chart_href):
    return f'''<a class="nav-item m-folio-link" href="{folio_href}"><i class="fa-solid fa-file-invoice-dollar"></i> 통합 정산</a>
            <div class="nav-item d-folio-nav" style="margin-bottom:0" onclick="this.classList.toggle('expanded'); this.nextElementSibling.classList.toggle('show')">
                <i class="fa-solid fa-file-invoice-dollar"></i> 통합 정산
                <i class="fa-solid fa-chevron-down nav-chevron"></i>
            </div>
            <div class="nav-sub d-folio-nav">
                <a class="nav-sub-item" href="{folio_href}">정산 목록</a>
                <a class="nav-sub-item" href="{chart_href}">매출 분석</a>
            </div>'''

# For operations pages
old_patterns = [
    # Pattern with expanded class and show class (folio.html active page)
    (r'<div class="nav-item expanded"[^>]*onclick="[^"]*">\s*<i class="fa-solid fa-file-invoice-dollar"></i>\s*통합 정산\s*<i class="fa-solid fa-chevron-down nav-chevron"></i>\s*</div>\s*<div class="nav-sub show">\s*<a class="nav-sub-item active"[^>]*>정산 목록</a>\s*<a class="nav-sub-item desktop-sub-only"[^>]*>매출 분석</a>\s*</div>',),
    # Pattern without expanded/show (other operations pages)
    (r'<div class="nav-item"[^>]*onclick="[^"]*">\s*<i class="fa-solid fa-file-invoice-dollar"></i>\s*통합 정산\s*<i class="fa-solid fa-chevron-down nav-chevron"></i>\s*</div>\s*<div class="nav-sub">\s*<a class="nav-sub-item"[^>]*>정산 목록</a>\s*<a class="nav-sub-item desktop-sub-only"[^>]*>매출 분석</a>\s*</div>',),
]

files_ops = [
    (r'e:\AI_Project\Hotel_PMS\dashboard\operations\folio.html', 'folio.html', 'folio-chart.html'),
    (r'e:\AI_Project\Hotel_PMS\dashboard\operations\rooms.html', 'folio.html', 'folio-chart.html'),
    (r'e:\AI_Project\Hotel_PMS\dashboard\operations\room-setup.html', 'folio.html', 'folio-chart.html'),
    (r'e:\AI_Project\Hotel_PMS\dashboard\operations\rates.html', 'folio.html', 'folio-chart.html'),
    (r'e:\AI_Project\Hotel_PMS\dashboard\operations\housekeeping.html', 'folio.html', 'folio-chart.html'),
    (r'e:\AI_Project\Hotel_PMS\dashboard\operations\ancillary.html', 'folio.html', 'folio-chart.html'),
    (r'e:\AI_Project\Hotel_PMS\dashboard\operations\folio-chart.html', 'folio.html', 'folio-chart.html'),
]

files_other = [
    (r'e:\AI_Project\Hotel_PMS\dashboard\frontdesk\reservation-timeline.html', '../operations/folio.html', '../operations/folio-chart.html'),
    (r'e:\AI_Project\Hotel_PMS\dashboard\frontdesk\reservation-list.html', '../operations/folio.html', '../operations/folio-chart.html'),
    (r'e:\AI_Project\Hotel_PMS\dashboard\frontdesk\checkin.html', '../operations/folio.html', '../operations/folio-chart.html'),
    (r'e:\AI_Project\Hotel_PMS\dashboard\crm\guests.html', '../operations/folio.html', '../operations/folio-chart.html'),
    (r'e:\AI_Project\Hotel_PMS\dashboard\crm\membership.html', '../operations/folio.html', '../operations/folio-chart.html'),
    (r'e:\AI_Project\Hotel_PMS\dashboard\crm\tier-history.html', '../operations/folio.html', '../operations/folio-chart.html'),
    (r'e:\AI_Project\Hotel_PMS\dashboard\settings\staff.html', '../operations/folio.html', '../operations/folio-chart.html'),
    (r'e:\AI_Project\Hotel_PMS\dashboard\settings\settings.html', '../operations/folio.html', '../operations/folio-chart.html'),
    (r'e:\AI_Project\Hotel_PMS\dashboard\dashboard.html', 'operations/folio.html', 'operations/folio-chart.html'),
]

all_files = files_ops + files_other

for filepath, folio_href, chart_href in all_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    replacement = make_replacement(folio_href, chart_href)
    
    # Try multiple patterns
    found = False
    # Generic pattern that matches any variant of the expandable nav
    pattern = r'<div class="nav-item[^"]*"[^>]*onclick="[^"]*">\s*<i class="fa-solid fa-file-invoice-dollar"></i>\s*통합 정산\s*<i class="fa-solid fa-chevron-down nav-chevron"></i>\s*</div>\s*<div class="nav-sub[^"]*">\s*(?:<a class="nav-sub-item[^"]*"[^>]*>[^<]*</a>\s*)+</div>'
    
    match = re.search(pattern, content)
    if match:
        content = content[:match.start()] + replacement + content[match.end():]
        found = True
    
    if found:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated: {filepath}')
    else:
        print(f'NOT FOUND: {filepath}')

print('\nDone!')
