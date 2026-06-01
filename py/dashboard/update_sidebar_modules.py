import os
import re

base_path = r"E:\AI_Project\Hotel_PMS\dashboard"

# 1. Update sidebar.js
sidebar_file = os.path.join(base_path, "common", "js", "sidebar.js")
with open(sidebar_file, 'r', encoding='utf-8') as f:
    sb_content = f.read()

# Add Group & MICE to Front Desk
group_item = "                { icon: 'fa-users-rectangle', label: 'Group & MICE', href: BASE + 'frontdesk/groups.html' },\n"
sb_content = re.sub(r"({ icon: 'fa-right-to-bracket', label: 'Check-in/out',   href: BASE \+ 'frontdesk/checkin\.html' },\n)", r"\1" + group_item, sb_content)

# Add Maintenance after Housekeeping
maintenance_item = "                { icon: 'fa-wrench', label: 'Maintenance',  href: BASE + 'operations/maintenance.html' },\n"
sb_content = re.sub(r"({ icon: 'fa-broom', label: 'Housekeeping',  href: BASE \+ 'operations/housekeeping\.html', badge: '5' },\n)", r"\1" + maintenance_item, sb_content)

# Add Night Audit and Reporting at the end of Operations (before Settings group)
ops_append = """                { icon: 'fa-moon', label: 'Night Audit', href: BASE + 'operations/night-audit.html' },
                { icon: 'fa-chart-pie', label: 'Reporting', href: BASE + 'operations/reports.html' },
"""
sb_content = re.sub(r"(]\n\s*},\n\s*{\n\s*group: 'Settings')", ops_append + r"\1", sb_content)

# Add POS under Ancillary Svcs
pos_item = "                        { label: 'POS',   href: BASE + 'operations/pos.html' },\n"
sb_content = re.sub(r"({ label: 'Rent-a-car',   href: BASE \+ 'operations/rentacar\.html' },\n)", r"\1" + pos_item, sb_content)

with open(sidebar_file, 'w', encoding='utf-8') as f:
    f.write(sb_content)


# 2. Update i18n.js
i18n_file = os.path.join(base_path, "common", "js", "i18n.js")
with open(i18n_file, 'r', encoding='utf-8') as f:
    i18n_content = f.read()

ko_items = """    "Group & MICE": "그룹/행사 예약",
    "Night Audit": "일일 마감",
    "Reporting": "종합 리포트",
    "Maintenance": "유지보수",
    "POS": "F&B / 리테일",
"""

en_items = """    "Group & MICE": "Group & MICE",
    "Night Audit": "Night Audit",
    "Reporting": "Reporting",
    "Maintenance": "Maintenance",
    "POS": "POS",
"""

# Inject ko_items into Object.assign(window.translations.ko, {
i18n_content = i18n_content.replace('Object.assign(window.translations.ko, {', 'Object.assign(window.translations.ko, {\n' + ko_items)

# Inject en_items into Object.assign(window.translations.en, {
i18n_content = i18n_content.replace('Object.assign(window.translations.en, {', 'Object.assign(window.translations.en, {\n' + en_items)

with open(i18n_file, 'w', encoding='utf-8') as f:
    f.write(i18n_content)

print("Updated sidebar.js and i18n.js with new modules.")
