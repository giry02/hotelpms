import os

base_path = r"E:\AI_Project\Hotel_PMS"
sb_path = os.path.join(base_path, "dashboard", "common", "js", "sidebar.js")

if os.path.exists(sb_path):
    with open(sb_path, 'r', encoding='utf-8') as f:
        sb_content = f.read()
    
    concierge_group = """        {
            group: 'Concierge (컨시어지)',
            items: [
                { icon: 'fa-golf-ball-tee', label: 'Golf Booking', href: BASE + 'operations/golf.html' },
                { icon: 'fa-car', label: 'Rent-a-car', href: BASE + 'operations/rentacar.html' }
            ]
        },
        {
            group: 'Billing & POS',"""
            
    if "Concierge" not in sb_content:
        sb_content = sb_content.replace("        {\n            group: 'Billing & POS',", concierge_group)
        
        with open(sb_path, 'w', encoding='utf-8') as f:
            f.write(sb_content)
        print("Golf and Rent-a-car menus restored successfully under Concierge group.")
    else:
        print("Menus already restored.")
else:
    print("sidebar.js not found.")
