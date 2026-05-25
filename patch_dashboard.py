import re

with open('dashboard/dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add scripts
html = html.replace(
    '<script src=\"common/js/api/api-dashboard.js\"></script>',
    '<script src=\"common/js/api/api-dashboard.js\"></script>\\n    <script src=\"common/js/api/api-frontdesk.js\"></script>\\n    <script src=\"common/js/api/api-operations.js\"></script>'
)

# 2. Add IDs to KPI cards
html = html.replace(
    '<div class=\"kpi-value\">82.5%</div><div class=\"kpi-label\">Room 점유율 (OCC)</div>',
    '<div class=\"kpi-value\" id=\"kpiOcc\">0%</div><div class=\"kpi-label\">Room 점유율 (OCC)</div>'
)
html = html.replace(
    '<div class=\"kpi-value\">.50</div><div class=\"kpi-label\">평균 Room 단가 (ADR)</div>',
    '<div class=\"kpi-value\" id=\"kpiAdr\">.00</div><div class=\"kpi-label\">평균 Room 단가 (ADR)</div>'
)
html = html.replace(
    '<div class=\"kpi-value\">.71</div><div class=\"kpi-label\">Room당 수익 (RevPAR)</div>',
    '<div class=\"kpi-value\" id=\"kpiRevpar\">.00</div><div class=\"kpi-label\">Room당 수익 (RevPAR)</div>'
)
html = html.replace(
    '<div class=\"kpi-value\">24 / 18</div><div class=\"kpi-label\">Today Check-in / Check-out</div>',
    '<div class=\"kpi-value\" id=\"kpiCheckinOut\">0 / 0</div><div class=\"kpi-label\">Today Check-in / Check-out</div>'
)

# 3. Add ID to Housekeeping stats
html = html.replace('<div class=\"hk-count\">72</div><div class=\"hk-label\" data-i18n-key=\"Clean\">', '<div class=\"hk-count\" id=\"hkClean\">0</div><div class=\"hk-label\" data-i18n-key=\"Clean\">')
html = html.replace('<div class=\"hk-count\">18</div><div class=\"hk-label\" data-i18n-key=\"Dirty\">', '<div class=\"hk-count\" id=\"hkDirty\">0</div><div class=\"hk-label\" data-i18n-key=\"Dirty\">')
html = html.replace('<div class=\"hk-count\">12</div><div class=\"hk-label\" data-i18n-key=\"Cleaning\">', '<div class=\"hk-count\" id=\"hkCleaning\">0</div><div class=\"hk-label\" data-i18n-key=\"Cleaning\">')
html = html.replace('<div class=\"hk-count\">15</div><div class=\"hk-label\" data-i18n-key=\"Inspected\">', '<div class=\"hk-count\" id=\"hkInspected\">0</div><div class=\"hk-label\" data-i18n-key=\"Inspected\">')
html = html.replace('<div class=\"hk-count\">3</div><div class=\"hk-label\" data-i18n-key=\"OOS\">', '<div class=\"hk-count\" id=\"hkOos\">0</div><div class=\"hk-label\" data-i18n-key=\"OOS\">')

# 4. Replace hardcoded Check-in table rows
start_str = '<tbody>\\n                                <tr><td><div class=\"guest-cell\"><div class=\"guest-avatar\" style=\"background:#3B82F6\">NT</div><div>Nguyen Thi'
end_str = '</tbody>'
idx1 = html.find(start_str)
if idx1 != -1:
    idx2 = html.find(end_str, idx1)
    if idx2 != -1:
        html = html[:idx1] + '<tbody id=\"todayCheckinBody\">\\n                                <!-- Populated dynamically -->' + html[idx2:]

# 5. Replace hardcoded Live Activity list
start_act = '<div class=\"activity-list\">\\n                        <div class=\"activity-item\"><div class=\"activity-icon ci\"><i class=\"fa-solid fa-right-to-bracket\"></i></div><div><div class=\"activity-text\"><b>1205호</b> Nguyen Thi Check-in Completed</div><div class=\"activity-time\">2분 전</div></div></div>'
end_act = '</div>\\n                </div>\\n            </div>\\n        </div>'
idx1 = html.find(start_act)
if idx1 != -1:
    idx2 = html.find('</div>\\n                </div>', idx1)
    if idx2 != -1:
        html = html[:idx1] + '<div class=\"activity-list\" id=\"liveActivityList\">\\n                        <!-- Populated dynamically -->' + html[idx2:]

with open('dashboard/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
