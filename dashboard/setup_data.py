import os
import shutil
import json

base_path = r"E:\AI_Project\Hotel_PMS\dashboard"
data_dir = os.path.join(base_path, "data")
dl_dir = os.path.join(base_path, "download")

os.makedirs(data_dir, exist_ok=True)
os.makedirs(dl_dir, exist_ok=True)

# 1. Copy Excel file
src_excel = r"E:\AI_Project\Hotel_PMS\Hotel_PMS_메뉴구조_권한매트릭스.xlsx"
dst_excel = os.path.join(dl_dir, "Export_Data.xlsx")
if os.path.exists(src_excel):
    shutil.copy(src_excel, dst_excel)
else:
    # Create empty file if not exists
    open(dst_excel, 'w').close()

# 2. Create reservations.json
reservations = [
    {"id": "RES-001", "guest": "Alexander", "checkIn": "2026-05-12", "checkOut": "2026-05-15", "roomType": "Deluxe", "room": "401", "status": "checkedin", "channel": "Direct"},
    {"id": "RES-002", "guest": "Sophia", "checkIn": "2026-05-12", "checkOut": "2026-05-14", "roomType": "Standard", "room": "205", "status": "pending", "channel": "Agoda"},
    {"id": "RES-003", "guest": "James & Co", "checkIn": "2026-05-13", "checkOut": "2026-05-18", "roomType": "Suite", "room": "801", "status": "confirmed", "channel": "Booking"},
    {"id": "RES-004", "guest": "Isabella", "checkIn": "2026-05-11", "checkOut": "2026-05-13", "roomType": "Standard", "room": "202", "status": "checkedin", "channel": "Direct"}
]
with open(os.path.join(data_dir, "reservations.json"), 'w', encoding='utf-8') as f:
    json.dump(reservations, f, ensure_ascii=False, indent=2)

# 3. Create guests.json
guests = [
    {"id": "G-001", "name": "Alexander", "visits": 5, "lastStay": "2026-02-10", "spend": 4500, "cancel": 0, "phone": "+1 555-0102", "email": "alex@example.com", "country": "United States", "tier": "Platinum"},
    {"id": "G-002", "name": "Sophia", "visits": 1, "lastStay": "-", "spend": 0, "cancel": 0, "phone": "+82 10-1234-5678", "email": "sophia@example.com", "country": "South Korea", "tier": "Standard"},
    {"id": "G-003", "name": "James", "visits": 12, "lastStay": "2026-04-05", "spend": 12000, "cancel": 1, "phone": "+44 20-7123-4567", "email": "james@example.com", "country": "United Kingdom", "tier": "Gold"}
]
with open(os.path.join(data_dir, "guests.json"), 'w', encoding='utf-8') as f:
    json.dump(guests, f, ensure_ascii=False, indent=2)

# 4. Create rooms.json
rooms = [
    {"id": "201", "bldg": "Main Tower", "floor": "2F", "type": "Standard", "status": "clean", "hk": "clean"},
    {"id": "202", "bldg": "Main Tower", "floor": "2F", "type": "Standard", "status": "occupied", "hk": "dirty"},
    {"id": "401", "bldg": "Main Tower", "floor": "4F", "type": "Deluxe", "status": "occupied", "hk": "clean"},
    {"id": "801", "bldg": "Main Tower", "floor": "8F", "type": "Suite", "status": "available", "hk": "inspect"}
]
with open(os.path.join(data_dir, "rooms.json"), 'w', encoding='utf-8') as f:
    json.dump(rooms, f, ensure_ascii=False, indent=2)

# 5. Create folios.json
folios = [
    {"id": "F-001", "resId": "RES-001", "guest": "Alexander", "total": 1200, "paid": 200, "balance": 1000, "status": "open", "date": "2026-05-12"},
    {"id": "F-002", "resId": "RES-004", "guest": "Isabella", "total": 450, "paid": 450, "balance": 0, "status": "closed", "date": "2026-05-13"}
]
with open(os.path.join(data_dir, "folios.json"), 'w', encoding='utf-8') as f:
    json.dump(folios, f, ensure_ascii=False, indent=2)

print("Setup complete: Data and Download folders created and populated.")
