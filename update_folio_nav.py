import os

old_nav = '<a class="nav-item" href="folio.html"><i class="fa-solid fa-file-invoice-dollar"></i> 통합 정산</a>'
new_nav = '''<div class="nav-item" style="margin-bottom:0" onclick="this.classList.toggle('expanded'); this.nextElementSibling.classList.toggle('show')">
                <i class="fa-solid fa-file-invoice-dollar"></i> 통합 정산
                <i class="fa-solid fa-chevron-down nav-chevron"></i>
            </div>
            <div class="nav-sub">
                <a class="nav-sub-item" href="folio.html">정산 목록</a>
                <a class="nav-sub-item desktop-sub-only" href="folio-chart.html">매출 분석</a>
            </div>'''

# Operations pages (relative path: folio.html)
ops_files = [
    r'e:\AI_Project\Hotel_PMS\dashboard\operations\rooms.html',
    r'e:\AI_Project\Hotel_PMS\dashboard\operations\room-setup.html',
    r'e:\AI_Project\Hotel_PMS\dashboard\operations\rates.html',
    r'e:\AI_Project\Hotel_PMS\dashboard\operations\housekeeping.html',
    r'e:\AI_Project\Hotel_PMS\dashboard\operations\ancillary.html',
]

for f in ops_files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    if old_nav in content:
        content = content.replace(old_nav, new_nav)
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print(f'Updated: {f}')
    else:
        print(f'NOT FOUND: {f}')

# Other pages use ../operations/folio.html
old_nav2 = '<a class="nav-item" href="../operations/folio.html"><i class="fa-solid fa-file-invoice-dollar"></i> 통합 정산</a>'
new_nav2 = '''<div class="nav-item" style="margin-bottom:0" onclick="this.classList.toggle('expanded'); this.nextElementSibling.classList.toggle('show')">
                <i class="fa-solid fa-file-invoice-dollar"></i> 통합 정산
                <i class="fa-solid fa-chevron-down nav-chevron"></i>
            </div>
            <div class="nav-sub">
                <a class="nav-sub-item" href="../operations/folio.html">정산 목록</a>
                <a class="nav-sub-item desktop-sub-only" href="../operations/folio-chart.html">매출 분석</a>
            </div>'''

other_files = [
    r'e:\AI_Project\Hotel_PMS\dashboard\frontdesk\reservation-timeline.html',
    r'e:\AI_Project\Hotel_PMS\dashboard\frontdesk\reservation-list.html',
    r'e:\AI_Project\Hotel_PMS\dashboard\frontdesk\checkin.html',
    r'e:\AI_Project\Hotel_PMS\dashboard\crm\guests.html',
    r'e:\AI_Project\Hotel_PMS\dashboard\crm\membership.html',
    r'e:\AI_Project\Hotel_PMS\dashboard\crm\tier-history.html',
    r'e:\AI_Project\Hotel_PMS\dashboard\settings\staff.html',
    r'e:\AI_Project\Hotel_PMS\dashboard\settings\settings.html',
]

for f in other_files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    if old_nav2 in content:
        content = content.replace(old_nav2, new_nav2)
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print(f'Updated: {f}')
    else:
        print(f'NOT FOUND: {f}')

# Dashboard uses operations/folio.html (no ../)
old_nav3 = '<a class="nav-item" href="operations/folio.html"><i class="fa-solid fa-file-invoice-dollar"></i> 통합 정산</a>'
new_nav3 = '''<div class="nav-item" style="margin-bottom:0" onclick="this.classList.toggle('expanded'); this.nextElementSibling.classList.toggle('show')">
                <i class="fa-solid fa-file-invoice-dollar"></i> 통합 정산
                <i class="fa-solid fa-chevron-down nav-chevron"></i>
            </div>
            <div class="nav-sub">
                <a class="nav-sub-item" href="operations/folio.html">정산 목록</a>
                <a class="nav-sub-item desktop-sub-only" href="operations/folio-chart.html">매출 분석</a>
            </div>'''

dashboard = r'e:\AI_Project\Hotel_PMS\dashboard\dashboard.html'
with open(dashboard, 'r', encoding='utf-8') as fh:
    content = fh.read()
if old_nav3 in content:
    content = content.replace(old_nav3, new_nav3)
    with open(dashboard, 'w', encoding='utf-8') as fh:
        fh.write(content)
    print(f'Updated: {dashboard}')
else:
    print(f'NOT FOUND: {dashboard}')

print('\nDone!')
