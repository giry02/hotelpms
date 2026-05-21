import os, codecs, re, sys

sys.stdout.reconfigure(encoding='utf-8')

# Map: 현재 h1 텍스트 → i18n key (PAGE_TITLE_MAP의 키와 일치해야 함)
H1_KEY_MAP = {
    'Dashboard': 'Dashboard',
    'Guest CRM': 'Guest CRM',
    'VIP Members': 'VIP Members',
    'Tier Change History': 'Tier Change History',
    'Check-in/out': 'Check-in/out',
    'Booking List': 'Booking List',
    'Reservations': 'Reservations',
    'Revenue Analytics': 'Revenue Analytics',
    'Folio & Billing': 'Folio & Billing',
    'Housekeeping': 'Housekeeping',
    'Rates Calendar': 'Rates Calendar',
    'Room Mgmt': 'Room Mgmt',
    'Hotel Settings': 'Hotel Settings',
    'Staff & Roles': 'Staff & Roles',
}

updated = []

for root, dirs, files in os.walk(r'E:\AI_Project\Hotel_PMS\dashboard'):
    for f in files:
        if f.endswith('.html'):
            path = os.path.join(root, f)
            with codecs.open(path, 'r', 'utf-8', errors='ignore') as file:
                c = file.read()
            
            original = c
            for text, key in H1_KEY_MAP.items():
                # Match <h1> without data-i18n-key or with wrong key
                # Replace <h1>TEXT</h1> → <h1 data-i18n-key="KEY">TEXT</h1>
                pattern = rf'<h1>({re.escape(text)})</h1>'
                replacement = f'<h1 data-i18n-key="{key}">{text}</h1>'
                c = re.sub(pattern, replacement, c)
            
            if c != original:
                with codecs.open(path, 'w', 'utf-8') as file:
                    file.write(c)
                updated.append(path)
                print(f'Updated: {f}')

print(f'\nDone. {len(updated)} files updated.')

# Verify no sidebar keys were accidentally touched
print('\n--- Verifying sidebar.js is unchanged ---')
sidebar = open(r'E:\AI_Project\Hotel_PMS\dashboard\common\js\sidebar.js', encoding='utf-8').read()
print('sidebar.js size:', len(sidebar), 'bytes — OK' if len(sidebar) > 10000 else 'WARNING: too small!')
