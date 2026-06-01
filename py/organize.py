import os

base_dir = r"e:\AI_Project\Hotel_PMS\dashboard"

structure = {
    'frontdesk': ['reservation-timeline.html', 'reservation-list.html', 'checkin.html', 'frontdesk.css'],
    'crm': ['guests.html', 'membership.html', 'crm.css'],
    'operations': ['rooms.html', 'housekeeping.html', 'folio.html', 'ancillary.html', 'operations.css'],
    'settings': ['settings.html', 'staff.html', 'settings.css']
}

file_map = {
    'dashboard.html': '.',
    'dashboard.css': '.',
    'login.html': '.',
    'login.css': '.'
}

for folder, files in structure.items():
    for f in files:
        file_map[f] = folder

# Create dirs
for folder in structure.keys():
    os.makedirs(os.path.join(base_dir, folder), exist_ok=True)

def get_rel_path(from_file, to_file):
    from_folder = file_map.get(from_file, '.')
    to_folder = file_map.get(to_file, '.')
    
    if from_folder == to_folder:
        return to_file
    elif from_folder == '.':
        return f"{to_folder}/{to_file}"
    elif to_folder == '.':
        return f"../{to_file}"
    else:
        return f"../{to_folder}/{to_file}"

file_contents = {}
all_files = list(file_map.keys())

for f in all_files:
    path = os.path.join(base_dir, f)
    # It might already be in the target folder from a previous run, check both
    if not os.path.exists(path):
        path = os.path.join(base_dir, file_map[f], f)
        
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
            
            for target in all_files:
                rel_path = get_rel_path(f, target)
                content = content.replace(f'href="{target}"', f'href="{rel_path}"')
                content = content.replace(f"href='{target}'", f"href='{rel_path}'")
                
            file_contents[f] = content

for f, content in file_contents.items():
    folder = file_map[f]
    new_path = os.path.join(base_dir, folder, f)
    
    with open(new_path, 'w', encoding='utf-8') as file:
        file.write(content)
        
    old_path = os.path.join(base_dir, f)
    if folder != '.' and os.path.exists(old_path):
        os.remove(old_path)
        print(f"Moved {f} to {folder}/")
        
print("Folder organization and link update complete.")
