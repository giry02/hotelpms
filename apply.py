import os
import re

dashboard_dir = 'E:/AI_Project/Hotel_PMS/dashboard'

file_configs = {
    'dashboard.html': {
        'vars': ['weekData', 'monthData'],
        'remove_renders': ['renderRoomChart(weekData, false);'],
        'init_call': 'renderRoomChart(weekData, false);'
    },
    'crm/tier-history.html': {
        'vars': ['history'],
        'remove_renders': ['renderHistory();'],
        'init_call': 'renderHistory();'
    },
    'frontdesk/groups.html': {
        'vars': ['groups'],
        'remove_renders': ['renderGroups();'],
        'init_call': 'renderGroups();'
    },
    'frontdesk/reservation-timeline.html': {
        'vars': ['rooms', 'reservations'],
        'remove_renders': ['renderTimeline();'],
        'init_call': 'renderTimeline();'
    },
    'operations/folio-chart.html': {
        'vars': ['dailyData', 'monthlyData', 'yoyData', 'depts', 'trendData'],
        'remove_renders': ['initCharts();', 'renderTrendTable();'],
        'init_call': 'initCharts();\n    renderTrendTable();'
    },
    'operations/golf.html': {
        'vars': ['orders'],
        'remove_renders': ['renderOrders();'],
        'init_call': 'renderOrders();'
    },
    'operations/housekeeping.html': {
        'vars': ['tasks'],
        'remove_renders': ['renderTasks();'],
        'init_call': 'renderTasks();'
    },
    'operations/maintenance.html': {
        'vars': ['requests'],
        'remove_renders': ['renderRequests();'],
        'init_call': 'renderRequests();'
    },
    'operations/rates.html': {
        'vars': ['DEFAULT_ROOM_TYPES'],
        'remove_renders': ['renderCalendar();'],
        'init_call': 'renderCalendar();'
    },
    'operations/rentacar.html': {
        'vars': ['orders'],
        'remove_renders': ['renderOrders();'],
        'init_call': 'renderOrders();'
    },
    'operations/room-service.html': {
        'vars': ['orders'],
        'remove_renders': ['renderOrders();'],
        'init_call': 'renderOrders();'
    },
    'operations/room-setup.html': {
        'vars': ['allRooms', 'allRoomTypes'],
        'remove_renders': ['renderRoomTypes();', 'renderRooms();'],
        'init_call': 'renderRoomTypes();\n    renderRooms();'
    },
    'operations/rooms.html': {
        'vars': ['allRooms'],
        'remove_renders': ['renderRooms();'],
        'init_call': 'renderRooms();'
    },
    'settings/roles.html': {
        'vars': ['ALL_MENUS', 'SYSTEM_ROLES', 'DEFAULT_CUSTOM_ROLES'],
        'remove_renders': ['renderRoles();'],
        'init_call': 'renderRoles();'
    },
    'settings/staff.html': {
        'vars': ['ALL_MENUS', 'SYSTEM_ROLES', 'DEFAULT_CUSTOM_ROLES', 'DEFAULT_STAFF'],
        'remove_renders': ['renderStaff();'],
        'init_call': 'renderStaff();'
    }
}

for rel_path, cfg in file_configs.items():
    filepath = os.path.join(dashboard_dir, rel_path)
    if not os.path.exists(filepath):
        print(f"Skipping {rel_path}, file not found")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace const arrays
    for var_name in cfg['vars']:
        match = re.search(r'(const|let)\s+' + var_name + r'\s*=\s*\[', content)
        if match:
            start_idx = match.end() - 1
            depth = 0
            end_idx = start_idx
            for i, char in enumerate(content[start_idx:]):
                if char == '[': depth += 1
                elif char == ']':
                    depth -= 1
                    if depth == 0:
                        end_idx = start_idx + i
                        break
            
            block = content[match.start():end_idx+1]
            content = content.replace(block + ';', f'let {var_name} = [];')
            content = content.replace(block, f'let {var_name} = []')

    # 2. Add API Store script to head
    depth = rel_path.count('/')
    prefix = '../' * depth if depth > 0 else ''
    api_script = f'<script src="{prefix}common/js/api-store.js"></script>'
    if api_script not in content:
        content = content.replace('<script src="', f'{api_script}\n    <script src="', 1)

    # 3. Remove synchronous render calls
    for rr in cfg['remove_renders']:
        content = content.replace(rr, f'/* {rr} */')

    # 4. Append DOMContentLoaded
    init_body = ""
    for var_name in cfg['vars']:
        init_body += f"        {var_name} = await PmsAPI.get{var_name[0].upper() + var_name[1:]}();\n"
    init_body += f"        {cfg['init_call']}\n"
    
    dom_script = f"\n<script>\ndocument.addEventListener('DOMContentLoaded', async () => {{\n    try {{\n{init_body}    }} catch(e) {{ console.error(e); }}\n}});\n</script>\n"
    
    # insert before </body>
    content = content.replace('</body>', dom_script + '</body>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Processed {rel_path}")

