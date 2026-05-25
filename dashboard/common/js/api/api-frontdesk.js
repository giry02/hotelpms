// api-frontdesk.js
window.PmsAPI = window.PmsAPI || {};
Object.assign(window.PmsAPI, {

    getBuildings: async () => {
        return initStorage('pms_buildings', ['Forest Tower', 'Lakeside Villa', 'Ocean Tower']);
    },

    saveBuildings: async (buildings) => {
        localStorage.setItem('pms_buildings', JSON.stringify(buildings));
        return true;
    },

    saveRooms: async (rooms) => {
        localStorage.setItem('pms_rooms', JSON.stringify(rooms));
        return true;
    },

    getAllRooms: async () => {
        try {
            let res = await fetch('../data/frontdesk/rooms.json');
            if (res.ok) return await res.json();
        } catch(e) {}
        return initStorage('pms_rooms', [
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
    },

    getTimelineReservations: async () => {
        return window.PmsAPI.getReservations();
    },

    getReservations: async () => {
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
                            "id": "RSV-20260512-001",
                            "room": "0301",
                            "fullRoom": "FT-0301",
                            "type": "Standard",
                            "guestId": "G-1638",
                            "guest": "Park Soo",
                            "initials": "PS",
                            "color": "#EF4444",
                            "start": 0,
                            "len": 3,
                            "nights": 3,
                            "status": "confirmed",
                            "channel": "Direct",
                            "cin": "5/12",
                            "cout": "5/15",
                            "amount": 525,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-002",
                            "room": "0302",
                            "fullRoom": "FT-0302",
                            "type": "Standard",
                            "guestId": "G-1959",
                            "guest": "Lee Min",
                            "initials": "LM",
                            "color": "#EF4444",
                            "start": 1,
                            "len": 4,
                            "nights": 4,
                            "status": "confirmed",
                            "channel": "Agoda",
                            "cin": "5/13",
                            "cout": "5/17",
                            "amount": 548,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-003",
                            "room": "0303",
                            "fullRoom": "FT-0303",
                            "type": "Standard",
                            "guestId": "G-1369",
                            "guest": "Tran Van",
                            "initials": "TV",
                            "color": "#F59E0B",
                            "start": 2,
                            "len": 2,
                            "nights": 2,
                            "status": "confirmed",
                            "channel": "Walk-in",
                            "cin": "5/14",
                            "cout": "5/16",
                            "amount": 284,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-004",
                            "room": "0501",
                            "fullRoom": "FT-0501",
                            "type": "Standard",
                            "guestId": "G-1742",
                            "guest": "Kim Da",
                            "initials": "KD",
                            "color": "#F59E0B",
                            "start": 0,
                            "len": 5,
                            "nights": 5,
                            "status": "checkedin",
                            "channel": "Booking",
                            "cin": "5/12",
                            "cout": "5/17",
                            "amount": 955,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-005",
                            "room": "0502",
                            "fullRoom": "FT-0502",
                            "type": "Standard",
                            "guestId": "G-1179",
                            "guest": "Pham Anh",
                            "initials": "PA",
                            "color": "#EC4899",
                            "start": 3,
                            "len": 3,
                            "nights": 3,
                            "status": "confirmed",
                            "channel": "Direct",
                            "cin": "5/15",
                            "cout": "5/18",
                            "amount": 405,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-006",
                            "room": "0503",
                            "fullRoom": "FT-0503",
                            "type": "Standard",
                            "guestId": "G-1702",
                            "guest": "Park Kyung",
                            "initials": "PK",
                            "color": "#3B82F6",
                            "start": 0,
                            "len": 1,
                            "nights": 1,
                            "status": "confirmed",
                            "channel": "Direct",
                            "cin": "5/12",
                            "cout": "5/13",
                            "amount": 189,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-007",
                            "room": "0701",
                            "fullRoom": "FT-0701",
                            "type": "Standard",
                            "guestId": "G-1715",
                            "guest": "Chen Wei",
                            "initials": "CW",
                            "color": "#F59E0B",
                            "start": 1,
                            "len": 6,
                            "nights": 6,
                            "status": "confirmed",
                            "channel": "Agoda",
                            "cin": "5/13",
                            "cout": "5/19",
                            "amount": 750,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-008",
                            "room": "0702",
                            "fullRoom": "FT-0702",
                            "type": "Standard",
                            "guestId": "G-1982",
                            "guest": "Nguyen Ha",
                            "initials": "NH",
                            "color": "#EC4899",
                            "start": 0,
                            "len": 3,
                            "nights": 3,
                            "status": "checkedin",
                            "channel": "Direct",
                            "cin": "5/12",
                            "cout": "5/15",
                            "amount": 384,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-009",
                            "room": "0703",
                            "fullRoom": "FT-0703",
                            "type": "Standard",
                            "guestId": "G-1727",
                            "guest": "Tanaka Y.",
                            "initials": "TY",
                            "color": "#3B82F6",
                            "start": 4,
                            "len": 4,
                            "nights": 4,
                            "status": "confirmed",
                            "channel": "Booking",
                            "cin": "5/16",
                            "cout": "5/20",
                            "amount": 756,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-010",
                            "room": "0801",
                            "fullRoom": "FT-0801",
                            "type": "Standard",
                            "guestId": "G-1642",
                            "guest": "Smith J.",
                            "initials": "SJ",
                            "color": "#EC4899",
                            "start": 0,
                            "len": 2,
                            "nights": 2,
                            "status": "checkedin",
                            "channel": "Direct",
                            "cin": "5/12",
                            "cout": "5/14",
                            "amount": 232,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-011",
                            "room": "0805",
                            "fullRoom": "FT-0805",
                            "type": "Standard",
                            "guestId": "G-1923",
                            "guest": "John Smith",
                            "initials": "JS",
                            "color": "#EC4899",
                            "start": 0,
                            "len": 2,
                            "nights": 2,
                            "status": "checkedin",
                            "channel": "Direct",
                            "cin": "5/12",
                            "cout": "5/14",
                            "amount": 296,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-012",
                            "room": "0807",
                            "fullRoom": "FT-0807",
                            "type": "Standard",
                            "guestId": "G-1798",
                            "guest": "Wong Li",
                            "initials": "WL",
                            "color": "#EC4899",
                            "start": 2,
                            "len": 5,
                            "nights": 5,
                            "status": "confirmed",
                            "channel": "Agoda",
                            "cin": "5/14",
                            "cout": "5/19",
                            "amount": 985,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-013",
                            "room": "1001",
                            "fullRoom": "FT-1001",
                            "type": "Suite",
                            "guestId": "G-1756",
                            "guest": "Garcia M.",
                            "initials": "GM",
                            "color": "#8B5CF6",
                            "start": 0,
                            "len": 7,
                            "nights": 7,
                            "status": "checkedin",
                            "channel": "Direct",
                            "cin": "5/12",
                            "cout": "5/19",
                            "amount": 805,
                            "vip": "VIP",
                            "isVip": true,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-014",
                            "room": "1002",
                            "fullRoom": "FT-1002",
                            "type": "Suite",
                            "guestId": "G-1361",
                            "guest": "Mueller K.",
                            "initials": "MK",
                            "color": "#F59E0B",
                            "start": 1,
                            "len": 3,
                            "nights": 3,
                            "status": "confirmed",
                            "channel": "Booking",
                            "cin": "5/13",
                            "cout": "5/16",
                            "amount": 540,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-015",
                            "room": "1201",
                            "fullRoom": "FT-1201",
                            "type": "Suite",
                            "guestId": "G-1594",
                            "guest": "Sato Yuki",
                            "initials": "SY",
                            "color": "#8B5CF6",
                            "start": 3,
                            "len": 4,
                            "nights": 4,
                            "status": "confirmed",
                            "channel": "Agoda",
                            "cin": "5/15",
                            "cout": "5/19",
                            "amount": 600,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-016",
                            "room": "1205",
                            "fullRoom": "FT-1205",
                            "type": "Suite",
                            "guestId": "G-1332",
                            "guest": "Nguyen Thi",
                            "initials": "NT",
                            "color": "#3B82F6",
                            "start": 0,
                            "len": 3,
                            "nights": 3,
                            "status": "confirmed",
                            "channel": "Direct",
                            "cin": "5/12",
                            "cout": "5/15",
                            "amount": 558,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-017",
                            "room": "1401",
                            "fullRoom": "FT-1401",
                            "type": "Suite",
                            "guestId": "G-1815",
                            "guest": "Kim Jun",
                            "initials": "KJ",
                            "color": "#8B5CF6",
                            "start": 0,
                            "len": 1,
                            "nights": 1,
                            "status": "checkedin",
                            "channel": "Direct",
                            "cin": "5/12",
                            "cout": "5/13",
                            "amount": 121,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-018",
                            "room": "1402",
                            "fullRoom": "FT-1402",
                            "type": "Suite",
                            "guestId": "G-1407",
                            "guest": "Lee Hana",
                            "initials": "LH",
                            "color": "#F59E0B",
                            "start": 2,
                            "len": 5,
                            "nights": 5,
                            "status": "confirmed",
                            "channel": "하나투어 (Hana)",
                            "cin": "5/14",
                            "cout": "5/19",
                            "amount": 665,
                            "vip": "VIP",
                            "isVip": true,
                            "isB2B": true
                  },
                  {
                            "id": "RSV-20260512-019",
                            "room": "PH01",
                            "fullRoom": "FT-PH01",
                            "type": "Penthouse",
                            "guestId": "G-1648",
                            "guest": "Tran Linh",
                            "initials": "TL",
                            "color": "#8B5CF6",
                            "start": 0,
                            "len": 4,
                            "nights": 4,
                            "status": "checkedin",
                            "channel": "Direct",
                            "cin": "5/12",
                            "cout": "5/16",
                            "amount": 616,
                            "vip": "VIP",
                            "isVip": true,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-020",
                            "room": "PH02",
                            "fullRoom": "FT-PH02",
                            "type": "Penthouse",
                            "guestId": "G-1205",
                            "guest": "Al Rashid",
                            "initials": "AR",
                            "color": "#8B5CF6",
                            "start": 5,
                            "len": 5,
                            "nights": 5,
                            "status": "confirmed",
                            "channel": "Booking.com",
                            "cin": "5/17",
                            "cout": "5/22",
                            "amount": 585,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-021",
                            "room": "0301",
                            "fullRoom": "FT-0301",
                            "type": "Standard",
                            "guestId": "G-1539",
                            "guest": "Vo Duc",
                            "initials": "VD",
                            "color": "#3B82F6",
                            "start": 5,
                            "len": 4,
                            "nights": 4,
                            "status": "confirmed",
                            "channel": "모두투어 (Mode)",
                            "cin": "5/17",
                            "cout": "5/21",
                            "amount": 560,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": true
                  },
                  {
                            "id": "RSV-20260512-022",
                            "room": "0503",
                            "fullRoom": "FT-0503",
                            "type": "Standard",
                            "guestId": "G-1326",
                            "guest": "Bui Tien",
                            "initials": "BT",
                            "color": "#F59E0B",
                            "start": 2,
                            "len": 3,
                            "nights": 3,
                            "status": "confirmed",
                            "channel": "Walk-in",
                            "cin": "5/14",
                            "cout": "5/17",
                            "amount": 576,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": false
                  },
                  {
                            "id": "RSV-20260512-023",
                            "room": "0801",
                            "fullRoom": "FT-0801",
                            "type": "Standard",
                            "guestId": "G-1731",
                            "guest": "Nakamura",
                            "initials": "N",
                            "color": "#EF4444",
                            "start": 4,
                            "len": 3,
                            "nights": 3,
                            "status": "confirmed",
                            "channel": "JTB Travel",
                            "cin": "5/16",
                            "cout": "5/19",
                            "amount": 459,
                            "vip": "Standard",
                            "isVip": false,
                            "isB2B": true
                  },
                  {
                            "id": "RSV-20260512-024",
                            "room": "1401",
                            "fullRoom": "FT-1401",
                            "type": "Suite",
                            "guestId": "G-1200",
                            "guest": "David C.",
                            "initials": "DC",
                            "color": "#EF4444",
                            "start": 3,
                            "len": 4,
                            "nights": 4,
                            "status": "confirmed",
                            "channel": "Direct",
                            "cin": "5/15",
                            "cout": "5/19",
                            "amount": 688,
                            "vip": "VIP",
                            "isVip": true,
                            "isB2B": false
                  }
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
        const groups = JSON.parse(groupStr);
        
        let rooms = [];
        try { rooms = await window.PmsAPI.getAllRooms(); } catch(e) {}
        
        let modified = false;
        
        groups.forEach(g => {
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
                        const start = Math.round((cin - epo) / 86400000);
                        const len = Math.max(1, Math.round((cout - cin) / 86400000));
                        
                        const newRes = {
                            id: `RSV-${g.id}-${Math.floor(Math.random()*10000)}`,
                            groupId: g.id,
                            room: rm.id,
                            fullRoom: rm.building ? `${rm.building.substring(0,1)}T-${rm.id}` : rm.id,
                            type: rm.type,
                            guestId: `G-${Math.floor(Math.random()*10000)}`,
                            guest: `${g.name} (단체)`,
                            initials: g.name.substring(0,2).toUpperCase(),
                            color: '#111827',
                            start: start,
                            len: len,
                            nights: len,
                            status: g.status === 'inhouse' ? 'checkedin' : 'confirmed',
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
            localStorage.setItem('pms_reservations', JSON.stringify(reservations));
        }
        return reservations;
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
    }
});