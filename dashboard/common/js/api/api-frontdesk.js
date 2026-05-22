// api-frontdesk.js
window.PmsAPI = window.PmsAPI || {};
Object.assign(window.PmsAPI, {

    getAllRooms: async () => {
        try {
            let res = await fetch('../data/frontdesk/rooms.json');
            if (res.ok) return await res.json();
        } catch(e) {}
        return initStorage('pms_rooms', [
            { "id": "0301", "floor": 3,  "type": "Standard",  "status": "vacant-clean", "guest": "",          "building": "Main" },
            { "id": "0302", "floor": 3,  "type": "Standard",  "status": "occupied",     "guest": "Park Soo",  "building": "Main" },
            { "id": "0303", "floor": 3,  "type": "Standard",  "status": "vacant-clean", "guest": "",          "building": "Main" },
            { "id": "0501", "floor": 5,  "type": "Standard",  "status": "occupied",     "guest": "Lee Ji",    "building": "Main" },
            { "id": "0502", "floor": 5,  "type": "Standard",  "status": "vacant-clean", "guest": "",          "building": "Main" },
            { "id": "0503", "floor": 5,  "type": "Standard",  "status": "occupied",     "guest": "Choi Min",  "building": "Main" },
            { "id": "0701", "floor": 7,  "type": "Deluxe",    "status": "vacant-clean", "guest": "",          "building": "Main" },
            { "id": "0702", "floor": 7,  "type": "Deluxe",    "status": "vacant-clean", "guest": "",          "building": "Main" },
            { "id": "0703", "floor": 7,  "type": "Deluxe",    "status": "occupied",     "guest": "Kim Jin",   "building": "Main" },
            { "id": "0801", "floor": 8,  "type": "Deluxe",    "status": "vacant-clean", "guest": "",          "building": "Main" },
            { "id": "0805", "floor": 8,  "type": "Deluxe",    "status": "occupied",     "guest": "Han So",    "building": "Main" },
            { "id": "0807", "floor": 8,  "type": "Deluxe",    "status": "vacant-clean", "guest": "",          "building": "Main" },
            { "id": "1001", "floor": 10, "type": "Suite",     "status": "occupied",     "guest": "Jeong Tae", "building": "Main" },
            { "id": "1002", "floor": 10, "type": "Suite",     "status": "vacant-clean", "guest": "",          "building": "Main" },
            { "id": "1201", "floor": 12, "type": "Premier",   "status": "occupied",     "guest": "Kang Do",   "building": "Main" },
            { "id": "1205", "floor": 12, "type": "Premier",   "status": "vacant-clean", "guest": "",          "building": "Main" },
            { "id": "1401", "floor": 14, "type": "Penthouse", "status": "occupied",     "guest": "Bae Yoon",  "building": "Main" },
            { "id": "1402", "floor": 14, "type": "Penthouse", "status": "vacant-clean", "guest": "",          "building": "Main" },
            { "id": "PH01", "floor": 15, "type": "Penthouse", "status": "occupied",     "guest": "Yoon Ji",   "building": "Main" },
            { "id": "PH02", "floor": 15, "type": "Penthouse", "status": "vacant-clean", "guest": "",          "building": "Main" }
        ]);
    },

    getTimelineReservations: async () => {
        try {
            let res = await fetch('../data/frontdesk/timelineReservations.json');
            if (res.ok) return await res.json();
        } catch(e) {}
        return initStorage('pms_timeline_res', [
            { "room": "0301", "guest": "Park Soo",   "start": 0, "len": 3, "status": "confirmed",  "channel": "Direct" },
            { "room": "0302", "guest": "Lee Min",    "start": 1, "len": 4, "status": "confirmed",  "channel": "Agoda" },
            { "room": "0303", "guest": "Tran Van",   "start": 2, "len": 2, "status": "pending",    "channel": "Walk-in" },
            { "room": "0501", "guest": "Kim Da",     "start": 0, "len": 5, "status": "checkedin",  "channel": "Booking" },
            { "room": "0502", "guest": "Pham Anh",   "start": 3, "len": 3, "status": "confirmed",  "channel": "Direct" },
            { "room": "0503", "guest": "Park Kyung", "start": 0, "len": 1, "status": "confirmed",  "channel": "Direct" },
            { "room": "0701", "guest": "Chen Wei",   "start": 1, "len": 6, "status": "confirmed",  "channel": "Agoda" },
            { "room": "0702", "guest": "Nguyen Ha",  "start": 0, "len": 3, "status": "checkedin",  "channel": "Direct" },
            { "room": "0703", "guest": "Tanaka Y.",  "start": 4, "len": 4, "status": "confirmed",  "channel": "Booking" },
            { "room": "0801", "guest": "Smith J.",   "start": 0, "len": 2, "status": "checkedin",  "channel": "Direct" },
            { "room": "0805", "guest": "John Smith", "start": 0, "len": 2, "status": "checkedin",  "channel": "Direct" },
            { "room": "0807", "guest": "Wong Li",    "start": 2, "len": 5, "status": "confirmed",  "channel": "Agoda" },
            { "room": "1001", "guest": "Garcia M.",  "start": 0, "len": 7, "status": "vip",        "channel": "Direct" },
            { "room": "1002", "guest": "Mueller K.", "start": 1, "len": 3, "status": "confirmed",  "channel": "Booking" },
            { "room": "1201", "guest": "Sato Yuki",  "start": 3, "len": 4, "status": "pending",    "channel": "Agoda" },
            { "room": "1205", "guest": "Nguyen Thi", "start": 0, "len": 3, "status": "confirmed",  "channel": "Direct" },
            { "room": "1401", "guest": "Kim Jun",    "start": 0, "len": 1, "status": "checkedin",  "channel": "Direct" },
            { "room": "1402", "guest": "Lee Hana",   "start": 2, "len": 5, "status": "vip",        "channel": "하나투어 (Hana)", "isB2B": true },
            { "room": "PH01", "guest": "Tran Linh",  "start": 0, "len": 4, "status": "vip",        "channel": "Direct" },
            { "room": "PH02", "guest": "Al Rashid",  "start": 5, "len": 5, "status": "confirmed",  "channel": "Booking.com" },
            { "room": "0301", "guest": "Vo Duc",     "start": 5, "len": 4, "status": "confirmed",  "channel": "모두투어 (Mode)", "isB2B": true },
            { "room": "0503", "guest": "Bui Tien",   "start": 2, "len": 3, "status": "pending",    "channel": "Walk-in" },
            { "room": "0801", "guest": "Nakamura",   "start": 4, "len": 3, "status": "confirmed",  "channel": "JTB Travel", "isB2B": true },
            { "room": "1401", "guest": "David C.",   "start": 3, "len": 4, "status": "vip",        "channel": "Direct" }
        ]);
    },

    getReservations: async () => {
        try {
            let res = await fetch('../data/frontdesk/reservations.json');
            if (!res.ok) res = await fetch('../common/data/reservations.json');
            if (res.ok) {
                const data = await res.json();
                if (data.length > 10) return data;
            }
        } catch(e) { console.warn('Fetch failed for reservations, using fallback'); }
        return initStorage('pms_reservations', [
            {
                "id": "RSV-20260512-001", "room": "1205", "fullRoom": "FT-1205", "type": "Deluxe",
                "guestId": "G-1002", "guest": "Nguyen Thi", "initials": "NT", "color": "#3B82F6",
                "start": 0, "len": 3, "nights": 3, "status": "checkedin", "channel": "Direct",
                "cin": "5/12", "cout": "5/15", "amount": 373.5, "vip": "VIP Gold"
            },
            {
                "id": "RSV-20260512-002", "room": "0807", "fullRoom": "FT-0807", "type": "Suite",
                "guestId": "G-1001", "guest": "John Smith", "initials": "JS", "color": "#8B5CF6",
                "start": 0, "len": 2, "nights": 2, "status": "checkedin", "channel": "Agoda",
                "cin": "5/12", "cout": "5/14", "amount": 520, "vip": "Silver"
            },
            {
                "id": "RSV-20260512-003", "room": "0503", "fullRoom": "FT-0503", "type": "Standard",
                "guestId": "G-1003", "guest": "Park Kyung", "initials": "PK", "color": "#10B981",
                "start": 0, "len": 1, "nights": 1, "status": "confirmed", "channel": "Direct",
                "cin": "5/12", "cout": "5/13", "amount": 95, "vip": "Standard"
            },
            {
                "id": "RSV-20260512-004", "room": "PH01", "fullRoom": "OT-PH01", "type": "Penthouse",
                "guestId": "G-1004", "guest": "Tran Linh", "initials": "TL", "color": "#F59E0B",
                "start": 0, "len": 4, "nights": 4, "status": "vip", "channel": "Direct",
                "cin": "5/12", "cout": "5/16", "amount": 2400, "vip": "VIP"
            },
            {
                "id": "RSV-20260512-005", "room": "0501", "fullRoom": "FT-0501", "type": "Standard",
                "guestId": "G-1006", "guest": "Sato Yuki", "initials": "SY", "color": "#EC4899",
                "start": 0, "len": 5, "nights": 5, "status": "checkedin", "channel": "Booking",
                "cin": "5/12", "cout": "5/17", "amount": 475, "vip": "Silver"
            },
            {
                "id": "RSV-20260512-006", "room": "1401", "fullRoom": "OT-1401", "type": "Suite",
                "guestId": "G-1005", "guest": "Al Rashid", "initials": "AR", "color": "#6366F1",
                "start": 3, "len": 4, "nights": 4, "status": "vip", "channel": "Direct",
                "cin": "5/15", "cout": "5/19", "amount": 1600, "vip": "VIP Gold"
            }
        ]);
    },

    getGroups: async () => {
        try {
            let res = await fetch('../data/frontdesk/groups.json');
            if (res.ok) return await res.json();
        } catch(e) {}
        return initStorage('pms_groups', [
            {
                "id": "GRP-2605-01", "name": "Samsung Tech Conference 2026",
                "type": "기업 행사 / 컨퍼런스", "status": "inhouse",
                "checkin": "2026-05-20", "checkout": "2026-05-24",
                "block": 50, "pickup": 45, "pax": 90,
                "routing": "Master Account (Company)", "contact": "010-1234-5678 (김과장)",
                "sales": "박민수", "note": "얼리 체크인 10객실 요청됨"
            },
            {
                "id": "GRP-2605-02", "name": "Wedding: Lee & Kim",
                "type": "결혼식 / 웨딩", "status": "confirmed",
                "checkin": "2026-05-28", "checkout": "2026-05-30",
                "block": 30, "pickup": 25, "pax": 50,
                "routing": "Individual / Pay Own", "contact": "010-9876-5432 (이신랑)",
                "sales": "최지연", "note": "신부대기실 연결 객실 배정 必"
            },
            {
                "id": "GRP-2605-03", "name": "Hanwha Eagles Baseball",
                "type": "스포츠팀", "status": "inhouse",
                "checkin": "2026-05-21", "checkout": "2026-05-23",
                "block": 20, "pickup": 20, "pax": 40,
                "routing": "Master Account (Team)", "contact": "010-1111-2222 (매니저)",
                "sales": "이동국", "note": "식사 메뉴 별도 지정"
            },
            {
                "id": "GRP-2605-04", "name": "Global Summit 2026",
                "type": "기업 행사 / 컨퍼런스", "status": "pending",
                "checkin": "2026-06-10", "checkout": "2026-06-15",
                "block": 18, "pickup": 0, "pax": 35,
                "routing": "Master Account", "contact": "02-555-1234",
                "sales": "정우성", "note": "디포짓 입금 대기중"
            },
            {
                "id": "GRP-2605-05", "name": "Jeju Tour Package",
                "type": "여행사 단체", "status": "departed",
                "checkin": "2026-05-18", "checkout": "2026-05-20",
                "block": 10, "pickup": 10, "pax": 20,
                "routing": "Travel Agency Account", "contact": "064-123-4567 (가이드)",
                "sales": "김현수", "note": "정산 대기 (미정산 단체)"
            }
        ]);
    }

});