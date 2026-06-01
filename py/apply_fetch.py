import os

dashboard_dir = 'E:/AI_Project/Hotel_PMS/dashboard'

# guests.html
with open(os.path.join(dashboard_dir, 'crm/guests.html'), 'r', encoding='utf-8') as f:
    content = f.read()

if 'api-store.js' not in content:
    content = content.replace('<script src="', '<script src="../common/js/api-store.js"></script>\n    <script src="', 1)

content = content.replace(
    "fetch('../data/guests.json')\n    .then(res => res.json())",
    "PmsAPI.getGuests()"
)
# Note: since PmsAPI.getGuests returns a Promise that resolves to the array, the existing .then(data => {...}) will still work!

with open(os.path.join(dashboard_dir, 'crm/guests.html'), 'w', encoding='utf-8') as f:
    f.write(content)


# reservation-list.html
with open(os.path.join(dashboard_dir, 'frontdesk/reservation-list.html'), 'r', encoding='utf-8') as f:
    content = f.read()

if 'api-store.js' not in content:
    content = content.replace('<script src="', '<script src="../common/js/api-store.js"></script>\n    <script src="', 1)

content = content.replace(
    "fetch('../data/reservations.json')\n    .then(res => res.json())",
    "PmsAPI.getReservations()"
)

with open(os.path.join(dashboard_dir, 'frontdesk/reservation-list.html'), 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated guests.html and reservation-list.html")
