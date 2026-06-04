// api-frontdesk.js
window.PmsAPI = window.PmsAPI || {};
Object.assign(window.PmsAPI, {

    getBuildings: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/buildings');
                const names = window.PmsMockApi.items(env).map(b => b.name || b.id).filter(Boolean);
                if (names.length) return names;
            }
        } catch(e) {
            console.warn('Mock buildings fallback', e);
        }
        let bldgs = initStorage('pms_buildings', ['Forest Tower', 'Lakeside Villa', 'Ocean Tower']);
        if (!bldgs || bldgs.length === 0) {
            bldgs = ['Forest Tower', 'Lakeside Villa', 'Ocean Tower'];
            localStorage.setItem('pms_buildings', JSON.stringify(bldgs));
        }
        return bldgs;
    },

    saveBuildings: async (buildings) => {
        try {
            if (window.PmsMockApi) {
                const items = (buildings || []).map((name, index) => ({
                    id: String(name || `BLDG-${index + 1}`).replace(/\s+/g, '-').toUpperCase(),
                    name,
                    sortOrder: index + 1
                }));
                await window.PmsMockApi.request('PUT', '/buildings', { body: items });
            }
        } catch(e) {
            console.warn('Mock buildings save fallback', e);
        }
        localStorage.setItem('pms_buildings', JSON.stringify(buildings));
        return true;
    },

    saveRooms: async (rooms) => {
        try {
            if (window.PmsMockApi) await window.PmsMockApi.request('PUT', '/rooms', { body: rooms || [] });
        } catch(e) {
            console.warn('Mock rooms save fallback', e);
        }
        localStorage.setItem('pms_rooms', JSON.stringify(rooms));
        return true;
    },

    getAllRooms: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/rooms');
                const rooms = window.PmsMockApi.items(env).map(window.PmsMockApi.toLegacyRoom);
                if (rooms.length) return rooms.filter(r => r && typeof r === 'object');
            }
        } catch(e) {
            console.warn('Mock rooms fallback', e);
        }
        try {
            let res = await fetch('../data/frontdesk/rooms.json');
            if (res.ok) return await res.json();
        } catch(e) {}
        let rooms = initStorage('pms_rooms', [
            { "id": "PH01", "floor": 20, "type": "Penthouse", "status": "occupied", "guest": "Yoon Ji", "building": "Ocean Tower" },
            { "id": "PH02", "floor": 20, "type": "Penthouse", "status": "vacant-clean", "guest": "", "building": "Ocean Tower" },
            { "id": "1401", "floor": 14, "type": "Premier", "status": "vacant-dirty", "guest": "Bae Yoon", "building": "Ocean Tower" },
            { "id": "1402", "floor": 14, "type": "Premier", "status": "occupied", "guest": "Park Soo", "building": "Ocean Tower" },
            { "id": "1403", "floor": 14, "type": "Premier", "status": "occupied", "guest": "Choi Min", "building": "Ocean Tower" },
            { "id": "1405", "floor": 14, "type": "Premier", "status": "oos", "guest": "", "building": "Ocean Tower" },
            { "id": "1201", "floor": 12, "type": "Deluxe", "status": "occupied", "guest": "Kang Do", "building": "Forest Tower" },
            { "id": "1202", "floor": 12, "type": "Deluxe", "status": "vacant-clean", "guest": "", "building": "Forest Tower" },
            { "id": "1203", "floor": 12, "type": "Deluxe", "status": "vacant-clean", "guest": "", "building": "Forest Tower" },
            { "id": "1205", "floor": 12, "type": "Deluxe", "status": "occupied", "guest": "Kim Jin", "building": "Forest Tower" },
            { "id": "1206", "floor": 12, "type": "Deluxe", "status": "vacant-dirty", "guest": "", "building": "Forest Tower" },
            { "id": "0801", "floor": 8, "type": "Standard", "status": "occupied", "guest": "Han So", "building": "Forest Tower" },
            { "id": "0802", "floor": 8, "type": "Standard", "status": "occupied", "guest": "Lee Ji", "building": "Forest Tower" },
            { "id": "0803", "floor": 8, "type": "Standard", "status": "oos", "guest": "", "building": "Forest Tower" },
            { "id": "V-01", "floor": 1, "type": "Pool Villa", "status": "occupied", "guest": "Jeong Tae", "building": "Lakeside Villa" },
            { "id": "V-02", "floor": 1, "type": "Pool Villa", "status": "vacant-clean", "guest": "", "building": "Lakeside Villa" }
        ]);
        if (!rooms || rooms.length === 0) {
            localStorage.removeItem('pms_rooms');
            rooms = initStorage('pms_rooms', [
                { "id": "PH01", "floor": 20, "type": "Penthouse", "status": "occupied", "guest": "Yoon Ji", "building": "Ocean Tower" },
                { "id": "PH02", "floor": 20, "type": "Penthouse", "status": "vacant-clean", "guest": "", "building": "Ocean Tower" },
                { "id": "1401", "floor": 14, "type": "Premier", "status": "vacant-dirty", "guest": "Bae Yoon", "building": "Ocean Tower" },
                { "id": "1402", "floor": 14, "type": "Premier", "status": "occupied", "guest": "Park Soo", "building": "Ocean Tower" },
                { "id": "1403", "floor": 14, "type": "Premier", "status": "occupied", "guest": "Choi Min", "building": "Ocean Tower" },
                { "id": "1405", "floor": 14, "type": "Premier", "status": "oos", "guest": "", "building": "Ocean Tower" },
                { "id": "1201", "floor": 12, "type": "Deluxe", "status": "occupied", "guest": "Kang Do", "building": "Forest Tower" },
                { "id": "1202", "floor": 12, "type": "Deluxe", "status": "vacant-clean", "guest": "", "building": "Forest Tower" },
                { "id": "1203", "floor": 12, "type": "Deluxe", "status": "vacant-clean", "guest": "", "building": "Forest Tower" },
                { "id": "1205", "floor": 12, "type": "Deluxe", "status": "occupied", "guest": "Kim Jin", "building": "Forest Tower" },
                { "id": "1206", "floor": 12, "type": "Deluxe", "status": "vacant-dirty", "guest": "", "building": "Forest Tower" },
                { "id": "0801", "floor": 8, "type": "Standard", "status": "occupied", "guest": "Han So", "building": "Forest Tower" },
                { "id": "0802", "floor": 8, "type": "Standard", "status": "occupied", "guest": "Lee Ji", "building": "Forest Tower" },
                { "id": "0803", "floor": 8, "type": "Standard", "status": "oos", "guest": "", "building": "Forest Tower" },
                { "id": "V-01", "floor": 1, "type": "Pool Villa", "status": "occupied", "guest": "Jeong Tae", "building": "Lakeside Villa" },
                { "id": "V-02", "floor": 1, "type": "Pool Villa", "status": "vacant-clean", "guest": "", "building": "Lakeside Villa" }
            ]);
        }
        // Data sanitization to prevent rendering crash from corrupted localStorage items
        if (Array.isArray(rooms)) {
            rooms = rooms.filter(r => r !== null && typeof r === 'object');
        } else {
            rooms = [];
        }
        return rooms;
    },

    getTimelineReservations: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/reservations/timeline');
                const reservations = window.PmsMockApi.items(env).map(window.PmsMockApi.toLegacyReservation);
                if (reservations.length) return reservations;
            }
        } catch(e) {
            console.warn('Mock timeline reservations fallback', e);
        }
        return window.PmsAPI.getReservations();
    },

    getReservations: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/reservations');
                const reservations = window.PmsMockApi.items(env).map(window.PmsMockApi.toLegacyReservation);
                if (reservations.length) return reservations;
            }
        } catch(e) {
            console.warn('Mock reservations fallback', e);
        }
        const storedReservations = localStorage.getItem('pms_reservations');
        if (storedReservations) {
            try {
                const parsed = JSON.parse(storedReservations);
                if (Array.isArray(parsed)) return await window.PmsAPI.syncGroupsToReservations(parsed);
            } catch(e) {}
        }
        
        try {
            let res = await fetch('../data/frontdesk/reservations.json');
            if (!res.ok) res = await fetch('../common/data/reservations.json');
            if (res.ok) {
                const data = await res.json();
                if (data.length > 10) return await window.PmsAPI.syncGroupsToReservations(data);
            }
        } catch(e) {}
        let reservations = initStorage('pms_reservations', [

    {
        "id": "RSV-0001",
        "room": "PH01",
        "fullRoom": "T-PH01",
        "type": "Penthouse",
        "guestId": "G-8104",
        "guest": "Nguyen David",
        "initials": "ND",
        "color": "#8B5CF6",
        "start": -10,
        "len": 2,
        "nights": 2,
        "status": "checked-out",
        "channel": "Direct",
        "cin": "5/15",
        "cout": "5/17",
        "amount": 1018,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0002",
        "room": "PH01",
        "fullRoom": "T-PH01",
        "type": "Penthouse",
        "guestId": "G-6919",
        "guest": "Jones Thi",
        "initials": "JT",
        "color": "#8B5CF6",
        "start": -6,
        "len": 2,
        "nights": 2,
        "status": "checked-out",
        "channel": "Corporate",
        "cin": "5/19",
        "cout": "5/21",
        "amount": 1010,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0003",
        "room": "PH01",
        "fullRoom": "T-PH01",
        "type": "Penthouse",
        "guestId": "G-9790",
        "guest": "Williams Robert",
        "initials": "WR",
        "color": "#8B5CF6",
        "start": -2,
        "len": 3,
        "nights": 3,
        "status": "checked-in",
        "channel": "Agoda",
        "cin": "5/23",
        "cout": "5/26",
        "amount": 281,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0004",
        "room": "PH01",
        "fullRoom": "T-PH01",
        "type": "Penthouse",
        "guestId": "G-2047",
        "guest": "Nguyen Michael",
        "initials": "NM",
        "color": "#8B5CF6",
        "start": 2,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Booking.com",
        "cin": "5/27",
        "cout": "5/29",
        "amount": 1079,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0005",
        "room": "PH01",
        "fullRoom": "T-PH01",
        "type": "Penthouse",
        "guestId": "G-2712",
        "guest": "Martinez John",
        "initials": "MJ",
        "color": "#8B5CF6",
        "start": 6,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Walk-in",
        "cin": "5/31",
        "cout": "6/2",
        "amount": 967,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0006",
        "room": "PH01",
        "fullRoom": "T-PH01",
        "type": "Penthouse",
        "guestId": "G-4589",
        "guest": "Jones Thi",
        "initials": "JT",
        "color": "#8B5CF6",
        "start": 10,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Booking.com",
        "cin": "6/4",
        "cout": "6/8",
        "amount": 345,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0007",
        "room": "PH02",
        "fullRoom": "T-PH02",
        "type": "Penthouse",
        "guestId": "G-8774",
        "guest": "Garcia Min-jun",
        "initials": "GM",
        "color": "#8B5CF6",
        "start": -8,
        "len": 3,
        "nights": 3,
        "status": "checked-out",
        "channel": "Direct",
        "cin": "5/17",
        "cout": "5/20",
        "amount": 1076,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0008",
        "room": "PH02",
        "fullRoom": "T-PH02",
        "type": "Penthouse",
        "guestId": "G-3705",
        "guest": "Le Ji-woo",
        "initials": "LJ",
        "color": "#8B5CF6",
        "start": -5,
        "len": 3,
        "nights": 3,
        "status": "checked-out",
        "channel": "Walk-in",
        "cin": "5/20",
        "cout": "5/23",
        "amount": 626,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0009",
        "room": "PH02",
        "fullRoom": "T-PH02",
        "type": "Penthouse",
        "guestId": "G-5572",
        "guest": "Le Robert",
        "initials": "LR",
        "color": "#8B5CF6",
        "start": -2,
        "len": 2,
        "nights": 2,
        "status": "checked-in",
        "channel": "Expedia",
        "cin": "5/23",
        "cout": "5/25",
        "amount": 1361,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0010",
        "room": "PH02",
        "fullRoom": "T-PH02",
        "type": "Penthouse",
        "guestId": "G-1379",
        "guest": "Kim Thi",
        "initials": "KT",
        "color": "#8B5CF6",
        "start": 1,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Expedia",
        "cin": "5/26",
        "cout": "5/30",
        "amount": 1574,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0011",
        "room": "PH02",
        "fullRoom": "T-PH02",
        "type": "Penthouse",
        "guestId": "G-7578",
        "guest": "Nguyen Michael",
        "initials": "NM",
        "color": "#8B5CF6",
        "start": 5,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Walk-in",
        "cin": "5/30",
        "cout": "6/2",
        "amount": 1572,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0012",
        "room": "PH02",
        "fullRoom": "T-PH02",
        "type": "Penthouse",
        "guestId": "G-5248",
        "guest": "Rodriguez Van",
        "initials": "RV",
        "color": "#8B5CF6",
        "start": 10,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Walk-in",
        "cin": "6/4",
        "cout": "6/6",
        "amount": 1650,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0013",
        "room": "PH02",
        "fullRoom": "T-PH02",
        "type": "Penthouse",
        "guestId": "G-9406",
        "guest": "Garcia Van",
        "initials": "GV",
        "color": "#8B5CF6",
        "start": 12,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Expedia",
        "cin": "6/6",
        "cout": "6/9",
        "amount": 1482,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0014",
        "room": "1401",
        "fullRoom": "T-1401",
        "type": "Premier",
        "guestId": "G-4252",
        "guest": "Williams Charles",
        "initials": "WC",
        "color": "#10B981",
        "start": -8,
        "len": 1,
        "nights": 1,
        "status": "checked-out",
        "channel": "Walk-in",
        "cin": "5/17",
        "cout": "5/18",
        "amount": 1117,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0015",
        "room": "1401",
        "fullRoom": "T-1401",
        "type": "Premier",
        "guestId": "G-9962",
        "guest": "Jung Joseph",
        "initials": "JJ",
        "color": "#10B981",
        "start": -6,
        "len": 4,
        "nights": 4,
        "status": "checked-out",
        "channel": "Corporate",
        "cin": "5/19",
        "cout": "5/23",
        "amount": 1620,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0016",
        "room": "1401",
        "fullRoom": "T-1401",
        "type": "Premier",
        "guestId": "G-2940",
        "guest": "Lee Joseph",
        "initials": "LJ",
        "color": "#10B981",
        "start": 0,
        "len": 1,
        "nights": 1,
        "status": "checked-in",
        "channel": "Corporate",
        "cin": "5/25",
        "cout": "5/26",
        "amount": 558,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0017",
        "room": "1401",
        "fullRoom": "T-1401",
        "type": "Premier",
        "guestId": "G-5007",
        "guest": "Jung Van",
        "initials": "JV",
        "color": "#10B981",
        "start": 2,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Agoda",
        "cin": "5/27",
        "cout": "5/31",
        "amount": 1396,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0018",
        "room": "1401",
        "fullRoom": "T-1401",
        "type": "Premier",
        "guestId": "G-2110",
        "guest": "Hoang Michael",
        "initials": "HM",
        "color": "#10B981",
        "start": 8,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Direct",
        "cin": "6/2",
        "cout": "6/6",
        "amount": 1399,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0019",
        "room": "1401",
        "fullRoom": "T-1401",
        "type": "Premier",
        "guestId": "G-9680",
        "guest": "Williams James",
        "initials": "WJ",
        "color": "#10B981",
        "start": 12,
        "len": 1,
        "nights": 1,
        "status": "confirmed",
        "channel": "Expedia",
        "cin": "6/6",
        "cout": "6/7",
        "amount": 958,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0020",
        "room": "1401",
        "fullRoom": "T-1401",
        "type": "Premier",
        "guestId": "G-8497",
        "guest": "Martinez Thi",
        "initials": "MT",
        "color": "#10B981",
        "start": 13,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Booking.com",
        "cin": "6/7",
        "cout": "6/10",
        "amount": 748,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0021",
        "room": "1402",
        "fullRoom": "T-1402",
        "type": "Premier",
        "guestId": "G-1583",
        "guest": "Johnson Ji-hoon",
        "initials": "JJ",
        "color": "#10B981",
        "start": -10,
        "len": 3,
        "nights": 3,
        "status": "checked-out",
        "channel": "Expedia",
        "cin": "5/15",
        "cout": "5/18",
        "amount": 807,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0022",
        "room": "1402",
        "fullRoom": "T-1402",
        "type": "Premier",
        "guestId": "G-2332",
        "guest": "Garcia Seo-yeon",
        "initials": "GS",
        "color": "#10B981",
        "start": -6,
        "len": 2,
        "nights": 2,
        "status": "checked-out",
        "channel": "Corporate",
        "cin": "5/19",
        "cout": "5/21",
        "amount": 1202,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0023",
        "room": "1402",
        "fullRoom": "T-1402",
        "type": "Premier",
        "guestId": "G-8743",
        "guest": "Jung Seo-yeon",
        "initials": "JS",
        "color": "#10B981",
        "start": -4,
        "len": 4,
        "nights": 4,
        "status": "checked-in",
        "channel": "Walk-in",
        "cin": "5/21",
        "cout": "5/25",
        "amount": 1674,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0024",
        "room": "1402",
        "fullRoom": "T-1402",
        "type": "Premier",
        "guestId": "G-9691",
        "guest": "Pham David",
        "initials": "PD",
        "color": "#10B981",
        "start": 2,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Expedia",
        "cin": "5/27",
        "cout": "5/30",
        "amount": 1615,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0025",
        "room": "1402",
        "fullRoom": "T-1402",
        "type": "Premier",
        "guestId": "G-5207",
        "guest": "Garcia Seo-yeon",
        "initials": "GS",
        "color": "#10B981",
        "start": 5,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Agoda",
        "cin": "5/30",
        "cout": "6/2",
        "amount": 819,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0026",
        "room": "1402",
        "fullRoom": "T-1402",
        "type": "Premier",
        "guestId": "G-7698",
        "guest": "Johnson Ji-woo",
        "initials": "JJ",
        "color": "#10B981",
        "start": 10,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Direct",
        "cin": "6/4",
        "cout": "6/7",
        "amount": 1648,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0027",
        "room": "1402",
        "fullRoom": "T-1402",
        "type": "Premier",
        "guestId": "G-7180",
        "guest": "Kim Maria",
        "initials": "KM",
        "color": "#10B981",
        "start": 14,
        "len": 1,
        "nights": 1,
        "status": "confirmed",
        "channel": "Booking.com",
        "cin": "6/8",
        "cout": "6/9",
        "amount": 944,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0028",
        "room": "1403",
        "fullRoom": "T-1403",
        "type": "Premier",
        "guestId": "G-2551",
        "guest": "Garcia Van",
        "initials": "GV",
        "color": "#10B981",
        "start": -10,
        "len": 2,
        "nights": 2,
        "status": "checked-out",
        "channel": "Expedia",
        "cin": "5/15",
        "cout": "5/17",
        "amount": 1641,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0029",
        "room": "1403",
        "fullRoom": "T-1403",
        "type": "Premier",
        "guestId": "G-4710",
        "guest": "Kim Joseph",
        "initials": "KJ",
        "color": "#10B981",
        "start": -8,
        "len": 2,
        "nights": 2,
        "status": "checked-out",
        "channel": "Corporate",
        "cin": "5/17",
        "cout": "5/19",
        "amount": 1180,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0030",
        "room": "1403",
        "fullRoom": "T-1403",
        "type": "Premier",
        "guestId": "G-1619",
        "guest": "Choi Ji-hoon",
        "initials": "CJ",
        "color": "#10B981",
        "start": -4,
        "len": 3,
        "nights": 3,
        "status": "checked-out",
        "channel": "Expedia",
        "cin": "5/21",
        "cout": "5/24",
        "amount": 1319,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0031",
        "room": "1403",
        "fullRoom": "T-1403",
        "type": "Premier",
        "guestId": "G-9186",
        "guest": "Choi David",
        "initials": "CD",
        "color": "#10B981",
        "start": -1,
        "len": 2,
        "nights": 2,
        "status": "checked-in",
        "channel": "Walk-in",
        "cin": "5/24",
        "cout": "5/26",
        "amount": 923,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0032",
        "room": "1403",
        "fullRoom": "T-1403",
        "type": "Premier",
        "guestId": "G-2408",
        "guest": "Martinez Charles",
        "initials": "MC",
        "color": "#10B981",
        "start": 3,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Direct",
        "cin": "5/28",
        "cout": "5/30",
        "amount": 1202,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0033",
        "room": "1403",
        "fullRoom": "T-1403",
        "type": "Premier",
        "guestId": "G-6835",
        "guest": "Park Linh",
        "initials": "PL",
        "color": "#10B981",
        "start": 7,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Corporate",
        "cin": "6/1",
        "cout": "6/4",
        "amount": 831,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0034",
        "room": "1403",
        "fullRoom": "T-1403",
        "type": "Premier",
        "guestId": "G-9794",
        "guest": "Brown Joseph",
        "initials": "BJ",
        "color": "#10B981",
        "start": 11,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Corporate",
        "cin": "6/5",
        "cout": "6/8",
        "amount": 356,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0035",
        "room": "1405",
        "fullRoom": "T-1405",
        "type": "Premier",
        "guestId": "G-7928",
        "guest": "Choi John",
        "initials": "CJ",
        "color": "#10B981",
        "start": -9,
        "len": 2,
        "nights": 2,
        "status": "checked-out",
        "channel": "Direct",
        "cin": "5/16",
        "cout": "5/18",
        "amount": 1568,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0036",
        "room": "1405",
        "fullRoom": "T-1405",
        "type": "Premier",
        "guestId": "G-8323",
        "guest": "Martinez Robert",
        "initials": "MR",
        "color": "#10B981",
        "start": -7,
        "len": 1,
        "nights": 1,
        "status": "checked-out",
        "channel": "Corporate",
        "cin": "5/18",
        "cout": "5/19",
        "amount": 487,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0037",
        "room": "1405",
        "fullRoom": "T-1405",
        "type": "Premier",
        "guestId": "G-9322",
        "guest": "Martinez Thi",
        "initials": "MT",
        "color": "#10B981",
        "start": -5,
        "len": 1,
        "nights": 1,
        "status": "checked-out",
        "channel": "Booking.com",
        "cin": "5/20",
        "cout": "5/21",
        "amount": 658,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0038",
        "room": "1405",
        "fullRoom": "T-1405",
        "type": "Premier",
        "guestId": "G-6490",
        "guest": "Jung David",
        "initials": "JD",
        "color": "#10B981",
        "start": -4,
        "len": 1,
        "nights": 1,
        "status": "checked-out",
        "channel": "Booking.com",
        "cin": "5/21",
        "cout": "5/22",
        "amount": 1236,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0039",
        "room": "1405",
        "fullRoom": "T-1405",
        "type": "Premier",
        "guestId": "G-3818",
        "guest": "Hoang Min-jun",
        "initials": "HM",
        "color": "#10B981",
        "start": -3,
        "len": 4,
        "nights": 4,
        "status": "checked-in",
        "channel": "Direct",
        "cin": "5/22",
        "cout": "5/26",
        "amount": 769,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0040",
        "room": "1405",
        "fullRoom": "T-1405",
        "type": "Premier",
        "guestId": "G-7650",
        "guest": "Park Ji-woo",
        "initials": "PJ",
        "color": "#10B981",
        "start": 1,
        "len": 1,
        "nights": 1,
        "status": "confirmed",
        "channel": "Direct",
        "cin": "5/26",
        "cout": "5/27",
        "amount": 1358,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0041",
        "room": "1405",
        "fullRoom": "T-1405",
        "type": "Premier",
        "guestId": "G-2922",
        "guest": "Williams Linh",
        "initials": "WL",
        "color": "#10B981",
        "start": 2,
        "len": 1,
        "nights": 1,
        "status": "confirmed",
        "channel": "Expedia",
        "cin": "5/27",
        "cout": "5/28",
        "amount": 1282,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0042",
        "room": "1405",
        "fullRoom": "T-1405",
        "type": "Premier",
        "guestId": "G-5474",
        "guest": "Park Michael",
        "initials": "PM",
        "color": "#10B981",
        "start": 4,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Expedia",
        "cin": "5/29",
        "cout": "6/1",
        "amount": 420,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0043",
        "room": "1405",
        "fullRoom": "T-1405",
        "type": "Premier",
        "guestId": "G-8404",
        "guest": "Kim James",
        "initials": "KJ",
        "color": "#10B981",
        "start": 8,
        "len": 1,
        "nights": 1,
        "status": "confirmed",
        "channel": "Expedia",
        "cin": "6/2",
        "cout": "6/3",
        "amount": 1546,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0044",
        "room": "1405",
        "fullRoom": "T-1405",
        "type": "Premier",
        "guestId": "G-3211",
        "guest": "Tran James",
        "initials": "TJ",
        "color": "#10B981",
        "start": 11,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Corporate",
        "cin": "6/5",
        "cout": "6/8",
        "amount": 1477,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0045",
        "room": "1201",
        "fullRoom": "T-1201",
        "type": "Deluxe",
        "guestId": "G-4075",
        "guest": "Lee Ji-woo",
        "initials": "LJ",
        "color": "#F59E0B",
        "start": -9,
        "len": 3,
        "nights": 3,
        "status": "checked-out",
        "channel": "Walk-in",
        "cin": "5/16",
        "cout": "5/19",
        "amount": 457,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0046",
        "room": "1201",
        "fullRoom": "T-1201",
        "type": "Deluxe",
        "guestId": "G-8710",
        "guest": "Johnson Minh",
        "initials": "JM",
        "color": "#F59E0B",
        "start": -6,
        "len": 4,
        "nights": 4,
        "status": "checked-out",
        "channel": "Corporate",
        "cin": "5/19",
        "cout": "5/23",
        "amount": 999,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0047",
        "room": "1201",
        "fullRoom": "T-1201",
        "type": "Deluxe",
        "guestId": "G-8428",
        "guest": "Jung Van",
        "initials": "JV",
        "color": "#F59E0B",
        "start": -1,
        "len": 2,
        "nights": 2,
        "status": "checked-in",
        "channel": "Booking.com",
        "cin": "5/24",
        "cout": "5/26",
        "amount": 820,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0048",
        "room": "1201",
        "fullRoom": "T-1201",
        "type": "Deluxe",
        "guestId": "G-2018",
        "guest": "Brown John",
        "initials": "BJ",
        "color": "#F59E0B",
        "start": 3,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Walk-in",
        "cin": "5/28",
        "cout": "6/1",
        "amount": 1012,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0049",
        "room": "1201",
        "fullRoom": "T-1201",
        "type": "Deluxe",
        "guestId": "G-4637",
        "guest": "Nguyen James",
        "initials": "NJ",
        "color": "#F59E0B",
        "start": 8,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Walk-in",
        "cin": "6/2",
        "cout": "6/5",
        "amount": 209,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0050",
        "room": "1201",
        "fullRoom": "T-1201",
        "type": "Deluxe",
        "guestId": "G-8785",
        "guest": "Nguyen Van",
        "initials": "NV",
        "color": "#F59E0B",
        "start": 13,
        "len": 1,
        "nights": 1,
        "status": "confirmed",
        "channel": "Booking.com",
        "cin": "6/7",
        "cout": "6/8",
        "amount": 1253,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0051",
        "room": "1202",
        "fullRoom": "T-1202",
        "type": "Deluxe",
        "guestId": "G-3688",
        "guest": "Garcia Linh",
        "initials": "GL",
        "color": "#F59E0B",
        "start": -8,
        "len": 3,
        "nights": 3,
        "status": "checked-out",
        "channel": "Expedia",
        "cin": "5/17",
        "cout": "5/20",
        "amount": 973,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0052",
        "room": "1202",
        "fullRoom": "T-1202",
        "type": "Deluxe",
        "guestId": "G-9810",
        "guest": "Kim Ji-woo",
        "initials": "KJ",
        "color": "#F59E0B",
        "start": -3,
        "len": 3,
        "nights": 3,
        "status": "checked-out",
        "channel": "Direct",
        "cin": "5/22",
        "cout": "5/25",
        "amount": 1580,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0053",
        "room": "1202",
        "fullRoom": "T-1202",
        "type": "Deluxe",
        "guestId": "G-8555",
        "guest": "Nguyen Ji-woo",
        "initials": "NJ",
        "color": "#F59E0B",
        "start": 1,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Agoda",
        "cin": "5/26",
        "cout": "5/28",
        "amount": 976,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0054",
        "room": "1202",
        "fullRoom": "T-1202",
        "type": "Deluxe",
        "guestId": "G-9847",
        "guest": "Jung Charles",
        "initials": "JC",
        "color": "#F59E0B",
        "start": 3,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Expedia",
        "cin": "5/28",
        "cout": "5/31",
        "amount": 1540,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0055",
        "room": "1202",
        "fullRoom": "T-1202",
        "type": "Deluxe",
        "guestId": "G-4213",
        "guest": "Garcia Joseph",
        "initials": "GJ",
        "color": "#F59E0B",
        "start": 8,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Expedia",
        "cin": "6/2",
        "cout": "6/6",
        "amount": 926,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0056",
        "room": "1202",
        "fullRoom": "T-1202",
        "type": "Deluxe",
        "guestId": "G-5139",
        "guest": "Tran Min-jun",
        "initials": "TM",
        "color": "#F59E0B",
        "start": 13,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Direct",
        "cin": "6/7",
        "cout": "6/9",
        "amount": 1548,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0057",
        "room": "1203",
        "fullRoom": "T-1203",
        "type": "Deluxe",
        "guestId": "G-2084",
        "guest": "Rodriguez John",
        "initials": "RJ",
        "color": "#F59E0B",
        "start": -9,
        "len": 3,
        "nights": 3,
        "status": "checked-out",
        "channel": "Agoda",
        "cin": "5/16",
        "cout": "5/19",
        "amount": 691,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0058",
        "room": "1203",
        "fullRoom": "T-1203",
        "type": "Deluxe",
        "guestId": "G-1521",
        "guest": "Brown Van",
        "initials": "BV",
        "color": "#F59E0B",
        "start": -6,
        "len": 1,
        "nights": 1,
        "status": "checked-out",
        "channel": "Walk-in",
        "cin": "5/19",
        "cout": "5/20",
        "amount": 315,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0059",
        "room": "1203",
        "fullRoom": "T-1203",
        "type": "Deluxe",
        "guestId": "G-6475",
        "guest": "Nguyen Seo-yeon",
        "initials": "NS",
        "color": "#F59E0B",
        "start": -5,
        "len": 4,
        "nights": 4,
        "status": "checked-out",
        "channel": "Expedia",
        "cin": "5/20",
        "cout": "5/24",
        "amount": 1388,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0060",
        "room": "1203",
        "fullRoom": "T-1203",
        "type": "Deluxe",
        "guestId": "G-2696",
        "guest": "Tran John",
        "initials": "TJ",
        "color": "#F59E0B",
        "start": 0,
        "len": 2,
        "nights": 2,
        "status": "checked-in",
        "channel": "Walk-in",
        "cin": "5/25",
        "cout": "5/27",
        "amount": 544,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0061",
        "room": "1203",
        "fullRoom": "T-1203",
        "type": "Deluxe",
        "guestId": "G-7413",
        "guest": "Garcia Min-jun",
        "initials": "GM",
        "color": "#F59E0B",
        "start": 2,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Corporate",
        "cin": "5/27",
        "cout": "5/29",
        "amount": 842,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0062",
        "room": "1203",
        "fullRoom": "T-1203",
        "type": "Deluxe",
        "guestId": "G-6428",
        "guest": "Tran James",
        "initials": "TJ",
        "color": "#F59E0B",
        "start": 5,
        "len": 1,
        "nights": 1,
        "status": "confirmed",
        "channel": "Walk-in",
        "cin": "5/30",
        "cout": "5/31",
        "amount": 1522,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0063",
        "room": "1203",
        "fullRoom": "T-1203",
        "type": "Deluxe",
        "guestId": "G-4254",
        "guest": "Garcia Maria",
        "initials": "GM",
        "color": "#F59E0B",
        "start": 7,
        "len": 1,
        "nights": 1,
        "status": "confirmed",
        "channel": "Booking.com",
        "cin": "6/1",
        "cout": "6/2",
        "amount": 970,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0064",
        "room": "1203",
        "fullRoom": "T-1203",
        "type": "Deluxe",
        "guestId": "G-2038",
        "guest": "Kim Ji-woo",
        "initials": "KJ",
        "color": "#F59E0B",
        "start": 9,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Booking.com",
        "cin": "6/3",
        "cout": "6/6",
        "amount": 694,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0065",
        "room": "1203",
        "fullRoom": "T-1203",
        "type": "Deluxe",
        "guestId": "G-3289",
        "guest": "Brown Van",
        "initials": "BV",
        "color": "#F59E0B",
        "start": 14,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Agoda",
        "cin": "6/8",
        "cout": "6/12",
        "amount": 325,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0066",
        "room": "1205",
        "fullRoom": "T-1205",
        "type": "Deluxe",
        "guestId": "G-5114",
        "guest": "Tran Min-jun",
        "initials": "TM",
        "color": "#F59E0B",
        "start": -8,
        "len": 1,
        "nights": 1,
        "status": "checked-out",
        "channel": "Agoda",
        "cin": "5/17",
        "cout": "5/18",
        "amount": 1363,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0067",
        "room": "1205",
        "fullRoom": "T-1205",
        "type": "Deluxe",
        "guestId": "G-3882",
        "guest": "Pham James",
        "initials": "PJ",
        "color": "#F59E0B",
        "start": -6,
        "len": 2,
        "nights": 2,
        "status": "checked-out",
        "channel": "Direct",
        "cin": "5/19",
        "cout": "5/21",
        "amount": 1459,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0068",
        "room": "1205",
        "fullRoom": "T-1205",
        "type": "Deluxe",
        "guestId": "G-7924",
        "guest": "Williams James",
        "initials": "WJ",
        "color": "#F59E0B",
        "start": -2,
        "len": 4,
        "nights": 4,
        "status": "checked-in",
        "channel": "Corporate",
        "cin": "5/23",
        "cout": "5/27",
        "amount": 312,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0069",
        "room": "1205",
        "fullRoom": "T-1205",
        "type": "Deluxe",
        "guestId": "G-1216",
        "guest": "Brown Seo-yeon",
        "initials": "BS",
        "color": "#F59E0B",
        "start": 2,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Agoda",
        "cin": "5/27",
        "cout": "5/30",
        "amount": 1260,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0070",
        "room": "1205",
        "fullRoom": "T-1205",
        "type": "Deluxe",
        "guestId": "G-2492",
        "guest": "Lee Linh",
        "initials": "LL",
        "color": "#F59E0B",
        "start": 5,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Expedia",
        "cin": "5/30",
        "cout": "6/2",
        "amount": 680,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0071",
        "room": "1205",
        "fullRoom": "T-1205",
        "type": "Deluxe",
        "guestId": "G-4271",
        "guest": "Hoang Maria",
        "initials": "HM",
        "color": "#F59E0B",
        "start": 10,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Walk-in",
        "cin": "6/4",
        "cout": "6/7",
        "amount": 655,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0072",
        "room": "1205",
        "fullRoom": "T-1205",
        "type": "Deluxe",
        "guestId": "G-4323",
        "guest": "Hoang David",
        "initials": "HD",
        "color": "#F59E0B",
        "start": 14,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Expedia",
        "cin": "6/8",
        "cout": "6/10",
        "amount": 1633,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0073",
        "room": "1206",
        "fullRoom": "T-1206",
        "type": "Deluxe",
        "guestId": "G-9276",
        "guest": "Jung Ji-woo",
        "initials": "JJ",
        "color": "#F59E0B",
        "start": -9,
        "len": 2,
        "nights": 2,
        "status": "checked-out",
        "channel": "Expedia",
        "cin": "5/16",
        "cout": "5/18",
        "amount": 1053,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0074",
        "room": "1206",
        "fullRoom": "T-1206",
        "type": "Deluxe",
        "guestId": "G-5787",
        "guest": "Park Linh",
        "initials": "PL",
        "color": "#F59E0B",
        "start": -7,
        "len": 4,
        "nights": 4,
        "status": "checked-out",
        "channel": "Walk-in",
        "cin": "5/18",
        "cout": "5/22",
        "amount": 852,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0075",
        "room": "1206",
        "fullRoom": "T-1206",
        "type": "Deluxe",
        "guestId": "G-3378",
        "guest": "Martinez Van",
        "initials": "MV",
        "color": "#F59E0B",
        "start": -3,
        "len": 1,
        "nights": 1,
        "status": "checked-out",
        "channel": "Agoda",
        "cin": "5/22",
        "cout": "5/23",
        "amount": 1452,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0076",
        "room": "1206",
        "fullRoom": "T-1206",
        "type": "Deluxe",
        "guestId": "G-8194",
        "guest": "Choi Charles",
        "initials": "CC",
        "color": "#F59E0B",
        "start": -2,
        "len": 1,
        "nights": 1,
        "status": "checked-out",
        "channel": "Direct",
        "cin": "5/23",
        "cout": "5/24",
        "amount": 1616,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0077",
        "room": "1206",
        "fullRoom": "T-1206",
        "type": "Deluxe",
        "guestId": "G-4998",
        "guest": "Le Van",
        "initials": "LV",
        "color": "#F59E0B",
        "start": 0,
        "len": 2,
        "nights": 2,
        "status": "checked-in",
        "channel": "Booking.com",
        "cin": "5/25",
        "cout": "5/27",
        "amount": 894,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0078",
        "room": "1206",
        "fullRoom": "T-1206",
        "type": "Deluxe",
        "guestId": "G-8089",
        "guest": "Jung James",
        "initials": "JJ",
        "color": "#F59E0B",
        "start": 3,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Walk-in",
        "cin": "5/28",
        "cout": "5/30",
        "amount": 862,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0079",
        "room": "1206",
        "fullRoom": "T-1206",
        "type": "Deluxe",
        "guestId": "G-6846",
        "guest": "Martinez Charles",
        "initials": "MC",
        "color": "#F59E0B",
        "start": 6,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Agoda",
        "cin": "5/31",
        "cout": "6/2",
        "amount": 1190,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0080",
        "room": "1206",
        "fullRoom": "T-1206",
        "type": "Deluxe",
        "guestId": "G-1158",
        "guest": "Park Linh",
        "initials": "PL",
        "color": "#F59E0B",
        "start": 8,
        "len": 1,
        "nights": 1,
        "status": "confirmed",
        "channel": "Corporate",
        "cin": "6/2",
        "cout": "6/3",
        "amount": 686,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0081",
        "room": "1206",
        "fullRoom": "T-1206",
        "type": "Deluxe",
        "guestId": "G-5485",
        "guest": "Nguyen David",
        "initials": "ND",
        "color": "#F59E0B",
        "start": 10,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Corporate",
        "cin": "6/4",
        "cout": "6/6",
        "amount": 952,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0082",
        "room": "1206",
        "fullRoom": "T-1206",
        "type": "Deluxe",
        "guestId": "G-9266",
        "guest": "Jung David",
        "initials": "JD",
        "color": "#F59E0B",
        "start": 14,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Walk-in",
        "cin": "6/8",
        "cout": "6/12",
        "amount": 476,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0083",
        "room": "0801",
        "fullRoom": "T-0801",
        "type": "Standard",
        "guestId": "G-6135",
        "guest": "Smith Michael",
        "initials": "SM",
        "color": "#EF4444",
        "start": -10,
        "len": 1,
        "nights": 1,
        "status": "checked-out",
        "channel": "Booking.com",
        "cin": "5/15",
        "cout": "5/16",
        "amount": 494,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0084",
        "room": "0801",
        "fullRoom": "T-0801",
        "type": "Standard",
        "guestId": "G-1423",
        "guest": "Smith Min-jun",
        "initials": "SM",
        "color": "#EF4444",
        "start": -7,
        "len": 4,
        "nights": 4,
        "status": "checked-out",
        "channel": "Direct",
        "cin": "5/18",
        "cout": "5/22",
        "amount": 386,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0085",
        "room": "0801",
        "fullRoom": "T-0801",
        "type": "Standard",
        "guestId": "G-6760",
        "guest": "Pham Robert",
        "initials": "PR",
        "color": "#EF4444",
        "start": -3,
        "len": 4,
        "nights": 4,
        "status": "checked-in",
        "channel": "Walk-in",
        "cin": "5/22",
        "cout": "5/26",
        "amount": 1425,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0086",
        "room": "0801",
        "fullRoom": "T-0801",
        "type": "Standard",
        "guestId": "G-5936",
        "guest": "Garcia Seo-yeon",
        "initials": "GS",
        "color": "#EF4444",
        "start": 3,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Agoda",
        "cin": "5/28",
        "cout": "5/30",
        "amount": 1280,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0087",
        "room": "0801",
        "fullRoom": "T-0801",
        "type": "Standard",
        "guestId": "G-9531",
        "guest": "Tran David",
        "initials": "TD",
        "color": "#EF4444",
        "start": 6,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Direct",
        "cin": "5/31",
        "cout": "6/4",
        "amount": 1641,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0088",
        "room": "0801",
        "fullRoom": "T-0801",
        "type": "Standard",
        "guestId": "G-8217",
        "guest": "Pham Charles",
        "initials": "PC",
        "color": "#EF4444",
        "start": 10,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Direct",
        "cin": "6/4",
        "cout": "6/8",
        "amount": 860,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0089",
        "room": "0802",
        "fullRoom": "T-0802",
        "type": "Standard",
        "guestId": "G-6049",
        "guest": "Kim Thi",
        "initials": "KT",
        "color": "#EF4444",
        "start": -8,
        "len": 4,
        "nights": 4,
        "status": "checked-out",
        "channel": "Agoda",
        "cin": "5/17",
        "cout": "5/21",
        "amount": 597,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0090",
        "room": "0802",
        "fullRoom": "T-0802",
        "type": "Standard",
        "guestId": "G-8709",
        "guest": "Park Seo-yeon",
        "initials": "PS",
        "color": "#EF4444",
        "start": -3,
        "len": 1,
        "nights": 1,
        "status": "checked-out",
        "channel": "Direct",
        "cin": "5/22",
        "cout": "5/23",
        "amount": 1292,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0091",
        "room": "0802",
        "fullRoom": "T-0802",
        "type": "Standard",
        "guestId": "G-6326",
        "guest": "Jung Linh",
        "initials": "JL",
        "color": "#EF4444",
        "start": -1,
        "len": 1,
        "nights": 1,
        "status": "checked-out",
        "channel": "Expedia",
        "cin": "5/24",
        "cout": "5/25",
        "amount": 639,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0092",
        "room": "0802",
        "fullRoom": "T-0802",
        "type": "Standard",
        "guestId": "G-3061",
        "guest": "Brown Charles",
        "initials": "BC",
        "color": "#EF4444",
        "start": 1,
        "len": 1,
        "nights": 1,
        "status": "confirmed",
        "channel": "Corporate",
        "cin": "5/26",
        "cout": "5/27",
        "amount": 624,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0093",
        "room": "0802",
        "fullRoom": "T-0802",
        "type": "Standard",
        "guestId": "G-6171",
        "guest": "Pham John",
        "initials": "PJ",
        "color": "#EF4444",
        "start": 4,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Direct",
        "cin": "5/29",
        "cout": "5/31",
        "amount": 1532,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0094",
        "room": "0802",
        "fullRoom": "T-0802",
        "type": "Standard",
        "guestId": "G-6155",
        "guest": "Kim Joseph",
        "initials": "KJ",
        "color": "#EF4444",
        "start": 7,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Walk-in",
        "cin": "6/1",
        "cout": "6/4",
        "amount": 805,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0095",
        "room": "0802",
        "fullRoom": "T-0802",
        "type": "Standard",
        "guestId": "G-2986",
        "guest": "Jung Linh",
        "initials": "JL",
        "color": "#EF4444",
        "start": 10,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Corporate",
        "cin": "6/4",
        "cout": "6/8",
        "amount": 1197,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0096",
        "room": "0803",
        "fullRoom": "T-0803",
        "type": "Standard",
        "guestId": "G-6160",
        "guest": "Williams Min-jun",
        "initials": "WM",
        "color": "#EF4444",
        "start": -9,
        "len": 4,
        "nights": 4,
        "status": "checked-out",
        "channel": "Corporate",
        "cin": "5/16",
        "cout": "5/20",
        "amount": 508,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0097",
        "room": "0803",
        "fullRoom": "T-0803",
        "type": "Standard",
        "guestId": "G-6313",
        "guest": "Brown Robert",
        "initials": "BR",
        "color": "#EF4444",
        "start": -3,
        "len": 4,
        "nights": 4,
        "status": "checked-in",
        "channel": "Walk-in",
        "cin": "5/22",
        "cout": "5/26",
        "amount": 1262,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0098",
        "room": "0803",
        "fullRoom": "T-0803",
        "type": "Standard",
        "guestId": "G-8150",
        "guest": "Lee Min-jun",
        "initials": "LM",
        "color": "#EF4444",
        "start": 1,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Direct",
        "cin": "5/26",
        "cout": "5/29",
        "amount": 1185,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0099",
        "room": "0803",
        "fullRoom": "T-0803",
        "type": "Standard",
        "guestId": "G-3238",
        "guest": "Lee Joseph",
        "initials": "LJ",
        "color": "#EF4444",
        "start": 4,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Booking.com",
        "cin": "5/29",
        "cout": "5/31",
        "amount": 1592,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0100",
        "room": "0803",
        "fullRoom": "T-0803",
        "type": "Standard",
        "guestId": "G-2044",
        "guest": "Johnson Maria",
        "initials": "JM",
        "color": "#EF4444",
        "start": 8,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Corporate",
        "cin": "6/2",
        "cout": "6/5",
        "amount": 1570,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0101",
        "room": "0803",
        "fullRoom": "T-0803",
        "type": "Standard",
        "guestId": "G-6049",
        "guest": "Johnson Ji-woo",
        "initials": "JJ",
        "color": "#EF4444",
        "start": 13,
        "len": 2,
        "nights": 2,
        "status": "confirmed",
        "channel": "Direct",
        "cin": "6/7",
        "cout": "6/9",
        "amount": 508,
        "vip": "Gold",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0102",
        "room": "V-01",
        "fullRoom": "T-V-01",
        "type": "Pool Villa",
        "guestId": "G-2077",
        "guest": "Brown Min-jun",
        "initials": "BM",
        "color": "#3B82F6",
        "start": -8,
        "len": 1,
        "nights": 1,
        "status": "checked-out",
        "channel": "Walk-in",
        "cin": "5/17",
        "cout": "5/18",
        "amount": 1580,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0103",
        "room": "V-01",
        "fullRoom": "T-V-01",
        "type": "Pool Villa",
        "guestId": "G-5644",
        "guest": "Brown Robert",
        "initials": "BR",
        "color": "#3B82F6",
        "start": -6,
        "len": 4,
        "nights": 4,
        "status": "checked-out",
        "channel": "Direct",
        "cin": "5/19",
        "cout": "5/23",
        "amount": 1617,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0104",
        "room": "V-01",
        "fullRoom": "T-V-01",
        "type": "Pool Villa",
        "guestId": "G-4915",
        "guest": "Park Van",
        "initials": "PV",
        "color": "#3B82F6",
        "start": -1,
        "len": 1,
        "nights": 1,
        "status": "checked-out",
        "channel": "Walk-in",
        "cin": "5/24",
        "cout": "5/25",
        "amount": 265,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0105",
        "room": "V-01",
        "fullRoom": "T-V-01",
        "type": "Pool Villa",
        "guestId": "G-5466",
        "guest": "Smith John",
        "initials": "SJ",
        "color": "#3B82F6",
        "start": 2,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Direct",
        "cin": "5/27",
        "cout": "5/31",
        "amount": 1685,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0106",
        "room": "V-01",
        "fullRoom": "T-V-01",
        "type": "Pool Villa",
        "guestId": "G-2302",
        "guest": "Kim Ji-woo",
        "initials": "KJ",
        "color": "#3B82F6",
        "start": 6,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Corporate",
        "cin": "5/31",
        "cout": "6/4",
        "amount": 752,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0107",
        "room": "V-01",
        "fullRoom": "T-V-01",
        "type": "Pool Villa",
        "guestId": "G-1908",
        "guest": "Lee Joseph",
        "initials": "LJ",
        "color": "#3B82F6",
        "start": 10,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Corporate",
        "cin": "6/4",
        "cout": "6/8",
        "amount": 1324,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0108",
        "room": "V-02",
        "fullRoom": "T-V-02",
        "type": "Pool Villa",
        "guestId": "G-9128",
        "guest": "Nguyen Maria",
        "initials": "NM",
        "color": "#3B82F6",
        "start": -8,
        "len": 4,
        "nights": 4,
        "status": "checked-out",
        "channel": "Direct",
        "cin": "5/17",
        "cout": "5/21",
        "amount": 904,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0109",
        "room": "V-02",
        "fullRoom": "T-V-02",
        "type": "Pool Villa",
        "guestId": "G-5745",
        "guest": "Jung James",
        "initials": "JJ",
        "color": "#3B82F6",
        "start": -3,
        "len": 4,
        "nights": 4,
        "status": "checked-in",
        "channel": "Corporate",
        "cin": "5/22",
        "cout": "5/26",
        "amount": 1200,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0110",
        "room": "V-02",
        "fullRoom": "T-V-02",
        "type": "Pool Villa",
        "guestId": "G-7549",
        "guest": "Pham Thi",
        "initials": "PT",
        "color": "#3B82F6",
        "start": 1,
        "len": 1,
        "nights": 1,
        "status": "confirmed",
        "channel": "Expedia",
        "cin": "5/26",
        "cout": "5/27",
        "amount": 1223,
        "vip": "Standard",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0111",
        "room": "V-02",
        "fullRoom": "T-V-02",
        "type": "Pool Villa",
        "guestId": "G-7034",
        "guest": "Le Thi",
        "initials": "LT",
        "color": "#3B82F6",
        "start": 2,
        "len": 4,
        "nights": 4,
        "status": "confirmed",
        "channel": "Corporate",
        "cin": "5/27",
        "cout": "5/31",
        "amount": 1192,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0112",
        "room": "V-02",
        "fullRoom": "T-V-02",
        "type": "Pool Villa",
        "guestId": "G-7570",
        "guest": "Garcia Van",
        "initials": "GV",
        "color": "#3B82F6",
        "start": 8,
        "len": 1,
        "nights": 1,
        "status": "confirmed",
        "channel": "Direct",
        "cin": "6/2",
        "cout": "6/3",
        "amount": 1515,
        "vip": "Silver",
        "isVip": false,
        "isB2B": false
    },
    {
        "id": "RSV-0113",
        "room": "V-02",
        "fullRoom": "T-V-02",
        "type": "Pool Villa",
        "guestId": "G-4809",
        "guest": "Brown James",
        "initials": "BJ",
        "color": "#3B82F6",
        "start": 9,
        "len": 1,
        "nights": 1,
        "status": "confirmed",
        "channel": "Agoda",
        "cin": "6/3",
        "cout": "6/4",
        "amount": 1646,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    },
    {
        "id": "RSV-0114",
        "room": "V-02",
        "fullRoom": "T-V-02",
        "type": "Pool Villa",
        "guestId": "G-2950",
        "guest": "Park Joseph",
        "initials": "PJ",
        "color": "#3B82F6",
        "start": 12,
        "len": 3,
        "nights": 3,
        "status": "confirmed",
        "channel": "Walk-in",
        "cin": "6/6",
        "cout": "6/9",
        "amount": 1677,
        "vip": "VIP",
        "isVip": true,
        "isB2B": false
    }
]);
        
        if (window.PmsAPI.syncGroupsToReservations) {
            reservations = await window.PmsAPI.syncGroupsToReservations(reservations);
        }
        return reservations;
    },

    syncGroupsToReservations: async (reservations) => {
        const groupStr = localStorage.getItem('pms_groups');
        if (!groupStr) return reservations;
        let groups = JSON.parse(groupStr);
        const beforeGroupCount = Array.isArray(groups) ? groups.length : 0;
        groups = (Array.isArray(groups) ? groups : []).filter(g =>
            !(g?.id === 'GRP-2605-01' && g?.name === 'Samsung Tech Conference 2026')
        );
        if (groups.length !== beforeGroupCount) localStorage.setItem('pms_groups', JSON.stringify(groups));
        
        let rooms = [];
        try { rooms = await window.PmsAPI.getAllRooms(); } catch(e) {}
        
        let modified = false;
        const epoch = new Date(2026, 4, 12);
        const toDate = (value) => {
            if (!value) return null;
            if (value.includes('-')) return new Date(value);
            const parts = value.split('/');
            return new Date(2026, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
        };
        const fmt = (date) => `${date.getMonth()+1}/${date.getDate()}`;
        const roomId = (room) => room.id || room.roomId || room.fullRoom || room.display || room.number || '';
        const roomLabel = (room) => {
            const id = roomId(room);
            const building = room.building || room.bldgCode || '';
            const number = room.number || room.display || id;
            return building ? `${building} ${number}` : number;
        };
        const roomType = (room) => room.type || 'Standard';
        const findRoom = (id) => rooms.find(r => roomId(r) === id || r.fullRoom === id || r.number === id || r.display === id) || {};
        const getExplicitAllocations = (g) => {
            const source = Array.isArray(g.roomAllocations) && g.roomAllocations.length ? g.roomAllocations : (g.allocations || []);
            return source
                .filter(a => a && (a.roomId || a.room || a.id))
                .map(a => {
                    const id = a.roomId || a.room || a.id;
                    const rm = findRoom(id);
                    return {
                        roomId: id,
                        roomLabel: a.roomLabel || roomLabel(rm) || id,
                        type: a.type || roomType(rm),
                        building: a.building || rm.building || rm.bldgCode || '',
                        baseRate: Number(a.baseRate || 0),
                        discountPercent: Number(a.discountPercent || 0),
                        rate: Number(a.rate || 0)
                    };
                });
        };
        const hasRoomConflict = (room, group) => {
            const cin = toDate(group.checkin);
            const cout = toDate(group.checkout);
            if (!room || !cin || !cout) return false;
            return reservations.some(r => {
                if (r.groupId === group.id || (r.status || '').toLowerCase() === 'cancelled') return false;
                if (r.room !== room && r.fullRoom !== room) return false;
                try {
                    const rCin = toDate(r.cin);
                    const rCout = toDate(r.cout);
                    return rCin && rCout && cin < rCout && cout > rCin;
                } catch(e) {
                    return false;
                }
            });
        };
        const seedRoomAllocations = (g) => {
            const requested = Number(g.block || 0);
            if (!requested || !rooms.length) return [];
            const usedByGroups = new Set();
            groups.forEach(other => {
                if (other.id === g.id) return;
                getExplicitAllocations(other).forEach(a => usedByGroups.add(a.roomId));
            });
            return rooms
                .filter(r => {
                    const id = roomId(r);
                    const status = String(r.status || '').toLowerCase();
                    if (!id || usedByGroups.has(id)) return false;
                    if (['occupied', 'oos', 'out-of-service', 'maintenance'].includes(status)) return false;
                    return !hasRoomConflict(id, g);
                })
                .slice(0, Math.min(requested, 3))
                .map(r => ({
                    roomId: roomId(r),
                    roomLabel: roomLabel(r),
                    type: roomType(r),
                    building: r.building || r.bldgCode || '',
                    baseRate: 0,
                    discountPercent: 0,
                    rate: 0,
                    seeded: true
                }));
        };
        const buildReservation = (g, allocation, existing) => {
            const cin = toDate(g.checkin);
            const cout = toDate(g.checkout);
            const len = cin && cout ? Math.max(1, Math.round((cout - cin) / 86400000)) : (existing?.len || 1);
            const start = cin ? Math.round((cin - epoch) / 86400000) : (existing?.start || 0);
            const base = existing || {};
            const rooming = (g.roomingList || []).find(item =>
                item.roomId === allocation.roomId || item.room === allocation.roomId || item.fullRoom === allocation.roomId
            );
            const cleanGuest = (value) => {
                const text = String(value || '').trim();
                if (!text || text === 'undefined' || text === 'null') return '';
                if (text === g.name || text.includes('객실 블록') || text.includes('(단체)')) return '';
                return text;
            };
            const roomingGuest = cleanGuest(base.roomingGuestName) || cleanGuest(base.guestName) || cleanGuest(rooming?.name);
            const storedGuest = cleanGuest(base.guest);
            const assignedGuest = roomingGuest || (!base.isGroupPlaceholder ? storedGuest : '');
            const placeholderGuest = !assignedGuest;
            const currentStatus = String(base.status || '').replace(/[- _]/g, '').toLowerCase();
            const reservationStatus = placeholderGuest
                ? 'blocked'
                : (!base.status || currentStatus === 'blocked' ? 'confirmed' : base.status);
            const initialsSource = assignedGuest || base.guest || 'BL';
            return Object.assign(base, {
                id: base.id || `RSV-${g.id}-${allocation.roomId}`,
                groupId: g.id,
                room: allocation.roomId,
                fullRoom: allocation.roomId,
                type: allocation.type,
                guestId: base.guestId || rooming?.guestId || `G-${g.id}`,
                guest: assignedGuest,
                roomingGuestId: base.roomingGuestId || rooming?.id || '',
                roomingGuestName: assignedGuest,
                guestName: assignedGuest,
                groupName: g.name,
                isGroupPlaceholder: placeholderGuest,
                groupAssigned: !placeholderGuest,
                initials: placeholderGuest ? 'BL' : (base.initials && base.initials !== 'BL' ? base.initials : String(initialsSource).substring(0,2).toUpperCase()),
                color: placeholderGuest ? '#111827' : (base.color && base.color !== '#111827' ? base.color : '#2563EB'),
                start,
                len,
                nights: len,
                status: reservationStatus,
                channel: g.agency || base.channel || 'Group',
                cin: cin ? fmt(cin) : base.cin,
                cout: cout ? fmt(cout) : base.cout,
                amount: Number(allocation.rate || 0) * len,
                phone: base.phone || rooming?.phone || '',
                email: base.email || rooming?.email || '',
                nation: base.nation || rooming?.nation || '',
                docStatus: base.docStatus || rooming?.docStatus || '',
                roomingGuestNote: base.roomingGuestNote || rooming?.note || rooming?.specialNotes || '',
                guestNote: base.guestNote || rooming?.note || rooming?.specialNotes || '',
                specialNotes: base.specialNotes || rooming?.specialNotes || rooming?.note || '',
                vip: base.vip || 'Standard',
                isVip: base.isVip || false,
                isB2B: true
            });
        };
        
        groups.forEach(g => {
            let explicitAllocations = getExplicitAllocations(g);
            if (!explicitAllocations.length) {
                const seededAllocations = seedRoomAllocations(g);
                if (seededAllocations.length) {
                    g.roomAllocations = seededAllocations;
                    g.allocations = seededAllocations;
                    g.block = seededAllocations.length;
                    explicitAllocations = seededAllocations;
                    modified = true;
                }
            }
            if (explicitAllocations.length) {
                const validRoomIds = explicitAllocations.map(a => a.roomId);
                const before = reservations.length;
                reservations = reservations.filter(r => !(r.groupId === g.id && !validRoomIds.includes(r.room)));
                if (reservations.length !== before) modified = true;

                explicitAllocations.forEach(allocation => {
                    const existing = reservations.find(r => r.groupId === g.id && (r.room === allocation.roomId || r.fullRoom === allocation.roomId));
                    if (existing) {
                        buildReservation(g, allocation, existing);
                    } else {
                        reservations.push(buildReservation(g, allocation));
                    }
                    modified = true;
                });
                g.block = explicitAllocations.length;
                g.pickup = reservations.filter(r => r.groupId === g.id && r.status !== 'cancelled').length;
                return;
            }

            if (!g.allocations || g.allocations.length === 0) return;
            const existing = reservations.filter(r => r.groupId === g.id);
            if (existing.length < g.block) {
                let needed = g.block - existing.length;
                let allocated = 0;
                
                for (let a of g.allocations) {
                    if (allocated >= needed) break;
                    // Find matching room types (fuzzy match on first word like 'Standard')
                    const matchingRooms = rooms.filter(rm => rm.type === a.type || rm.type.includes(a.type.split(' ')[0]));
                    
                    for (let rm of matchingRooms) {
                        if (allocated >= needed) break;
                        if (existing.some(r => r.room === rm.id)) continue;
                        
                        const epo = new Date(2026, 4, 12);
                        const cin = new Date(g.checkin);
                        const cout = new Date(g.checkout);
                        
                        // Check if room is already occupied for these dates
                        const hasConflict = reservations.some(r => {
                            if (r.room !== rm.id) return false;
                            try {
                                const rCinParts = r.cin.split('/');
                                const rCoutParts = r.cout.split('/');
                                // Assume year is 2026 for mock data
                                const rCin = new Date(2026, parseInt(rCinParts[0]) - 1, parseInt(rCinParts[1]));
                                const rCout = new Date(2026, parseInt(rCoutParts[0]) - 1, parseInt(rCoutParts[1]));
                                return (cin < rCout && cout > rCin);
                            } catch(e) { return false; }
                        });
                        if (hasConflict) continue;
                        
                        const start = Math.round((cin - epo) / 86400000);
                        const len = Math.max(1, Math.round((cout - cin) / 86400000));
                        
                        const newRes = {
                            id: `RSV-${g.id}-${Math.floor(Math.random()*10000)}`,
                            groupId: g.id,
                            room: rm.id,
                            fullRoom: rm.building ? `${rm.building.substring(0,1)}T-${rm.id}` : rm.id,
                            type: rm.type,
                            guestId: `G-${Math.floor(Math.random()*10000)}`,
                            guest: '',
                            groupName: g.name,
                            isGroupPlaceholder: true,
                            initials: 'BL',
                            color: '#111827',
                            start: start,
                            len: len,
                            nights: len,
                            status: 'blocked',
                            channel: g.agency || 'Group',
                            cin: `${cin.getMonth()+1}/${cin.getDate()}`,
                            cout: `${cout.getMonth()+1}/${cout.getDate()}`,
                            amount: a.rate * len,
                            vip: 'Standard',
                            isVip: false,
                            isB2B: true
                        };
                        reservations.push(newRes);
                        existing.push(newRes); // prevent picking same room
                        allocated++;
                        modified = true;
                    }
                }
            }
        });
        
        // Remove orphans
        const validGroupIds = groups.map(g => g.id);
        const originalCount = reservations.length;
        reservations = reservations.filter(r => {
            if (r.groupId) {
                if (!validGroupIds.includes(r.groupId)) return false;
                
                // If block size reduced, we might want to trim, but simple orphan removal is enough for deleted groups.
            }
            return true;
        });
        if (reservations.length !== originalCount) modified = true;
        
        if (modified) {
            localStorage.setItem('pms_groups', JSON.stringify(groups));
            localStorage.setItem('pms_reservations', JSON.stringify(reservations));
        }
        return reservations;
    },

    getGroups: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/groups/events');
                const groups = window.PmsMockApi.items(env).map(window.PmsMockApi.toLegacyGroup);
                if (groups.length) return groups;
            }
        } catch(e) {
            console.warn('Mock groups fallback', e);
        }
        try {
            let res = await fetch('../data/frontdesk/groups.json');
            if (res.ok) return await res.json();
        } catch(e) {}
        return initStorage('pms_groups', [
            {
                "id": "GRP-260527-01", "name": "Samsung Tech Conference 2026",
                "type": "기업 행사 / 컨퍼런스", "status": "inhouse",
                "checkin": "2026-06-09", "checkout": "2026-06-12",
                "block": 4, "pickup": 2, "pax": 70,
                "routing": "Master Folio", "contact": "+82 10 1234 5678 (Kim Jiwon)",
                "sales": "Sarah Connor", "note": "VIP speaker rooms and breakfast coupons prepared."
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
                "type": "기업 행사 / 컨퍼런스", "status": "confirmed",
                "checkin": "2026-06-10", "checkout": "2026-06-15",
                "block": 18, "pickup": 0, "pax": 35,
                "routing": "Master Account", "contact": "02-555-1234",
                "sales": "정우성", "note": "디포짓 입금 대기중"
            },
            {
                "id": "GRP-2605-05", "name": "하나투어 (Hana Tour) 제주패키지",
                "type": "여행사 단체", "status": "departed",
                "checkin": "2026-05-18", "checkout": "2026-05-20",
                "block": 10, "pickup": 10, "pax": 20,
                "routing": "Travel Agency Account", "contact": "064-123-4567 (가이드)",
                "sales": "김현수", "note": "정산 대기 (미정산 단체)"
            },
            {
                "id": "GRP-2605-06", "name": "모두투어 (Modetour) 해외VIP",
                "type": "여행사 단체", "status": "confirmed",
                "checkin": "2026-06-01", "checkout": "2026-06-05",
                "block": 15, "pickup": 0, "pax": 30,
                "routing": "Travel Agency Account", "contact": "02-1544-5252 (예약과)",
                "sales": "이동국", "note": "특별 조식 요금 적용"
            }
        ]);
    },

    getCompanies: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/b2b/companies');
                const companies = window.PmsMockApi.items(env).map(window.PmsMockApi.toLegacyCompany);
                if (companies.length) return companies;
            }
        } catch(e) {
            console.warn('Mock companies fallback', e);
        }
        return initStorage('pms_companies', []);
    },

    saveCompanies: async (companies) => {
        try {
            if (window.PmsMockApi) await window.PmsMockApi.request('PUT', '/b2b/companies', { body: companies || [] });
        } catch(e) {
            console.warn('Mock companies save fallback', e);
        }
        localStorage.setItem('pms_companies', JSON.stringify(companies || []));
        return true;
    }
});
