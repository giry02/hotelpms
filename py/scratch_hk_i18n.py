import re

with open(r'e:\AI_Project\Hotel_PMS\dashboard\dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add missing Housekeeping items to the Korean dictionary
ko_insert = """
        /* 하우스키핑 상태 */
        "Clean": "청소 완료",
        "Dirty": "미청소",
        "Cleaning": "청소 중",
        "Inspected": "점검 완료",
        "OOS": "점검 중(OOS)",
"""

# Add missing Housekeeping items to the English dictionary
en_insert = """
        /* 하우스키핑 상태 */
        "Clean": "Clean",
        "Dirty": "Dirty",
        "Cleaning": "Cleaning",
        "Inspected": "Inspected",
        "OOS": "OOS",
"""

# Inject into ko dictionary
html = html.replace('"Settings": "Settings",', '"Settings": "Settings",' + ko_insert)
# Inject into en dictionary (second occurrence)
html = html.replace('"Settings": "Settings",', '"Settings": "Settings",' + en_insert)

# Wait, replacing '"Settings": "Settings",' will replace both.
# I need to do it precisely.
html_parts = html.split('"Settings": "Settings",')
if len(html_parts) == 3:
    html = html_parts[0] + '"Settings": "Settings",' + ko_insert + html_parts[1] + '"Settings": "Settings",' + en_insert + html_parts[2]

with open(r'e:\AI_Project\Hotel_PMS\dashboard\dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
