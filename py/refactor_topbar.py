import os
import re

html_files = [
    r"E:\AI_Project\Hotel_PMS\dashboard\dashboard.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\index.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\login.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\notifications.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\crm\guests.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\crm\membership.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\crm\tier-history.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\frontdesk\checkin.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\frontdesk\groups.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\frontdesk\reservation-list.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\frontdesk\reservation-timeline.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\ancillary.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\folio-chart.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\folio.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\golf.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\housekeeping.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\maintenance.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\night-audit.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\pos.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\rates.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\rentacar.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\reports.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\room-service.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\room-setup.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\rooms.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\operations\unified-pos.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\settings\billing.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\settings\notices.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\settings\roles.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\settings\settings.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\settings\staff.html",
    r"E:\AI_Project\Hotel_PMS\dashboard\settings\support.html"
]

modified_count = 0
header_pattern = re.compile(r'<header class="topbar[^>]*>(.*?)</header>', re.DOTALL | re.IGNORECASE)
h1_pattern = re.compile(r'<h1[^>]*>.*?</h1>', re.DOTALL | re.IGNORECASE)

for fpath in html_files:
    if not os.path.exists(fpath):
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    match = header_pattern.search(content)
    if match:
        header_content = match.group(1)
        h1_match = h1_pattern.search(header_content)
        if h1_match:
            h1_tag = h1_match.group(0)
            
            # extract spaces before <header> to keep indentation
            line_start = content.rfind('\n', 0, match.start())
            if line_start != -1:
                indent = content[line_start+1:match.start()]
                if not indent.strip():
                    indent_str = indent
                else:
                    indent_str = "    "
            else:
                indent_str = ""
                
            h1_indent = indent_str + "    "
            
            new_header = f'<header class="topbar">\n{h1_indent}{h1_tag}\n{indent_str}</header>'
            
            # replace only if it's different in non-whitespace characters
            current_header = match.group(0)
            if re.sub(r'\s+', '', new_header) != re.sub(r'\s+', '', current_header):
                new_content = content[:match.start()] + new_header + content[match.end():]
                with open(fpath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Modified: {fpath}")
                modified_count += 1
        else:
            print(f"No h1 found in header for: {fpath}")

print(f"Total modified files: {modified_count}")
