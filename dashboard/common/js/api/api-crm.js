// api-crm.js
window.PmsAPI = window.PmsAPI || {};
Object.assign(window.PmsAPI, {
    getGuests: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/crm/guests');
                const normalizeTier = (tier) => {
                    const value = String(tier || 'standard').toLowerCase();
                    if (value.includes('diamond')) return 'diamond';
                    if (value.includes('platinum')) return 'platinum';
                    if (value.includes('gold') || value === 'vip') return 'gold';
                    return 'standard';
                };
                const guests = window.PmsMockApi.items(env).map((guest, index) => ({
                    ...guest,
                    init: guest.init || String(guest.name || 'G').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(),
                    color: guest.color || ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'][index % 4],
                    nation: guest.nationality || guest.nation || '',
                    tier: normalizeTier(guest.tier || guest.vip),
                    visits: guest.visits || 1,
                    last: guest.lastStayDate || guest.last || '',
                    spend: window.PmsMockApi.amountValue(guest.totalSpend),
                    vip: guest.vip || guest.tier || 'Standard',
                    docStatus: guest.document?.status || guest.docStatus || 'pending',
                    documentStatus: guest.document?.status || guest.documentStatus || 'pending',
                    specialNotes: guest.specialNotes || ''
                }));
                if (guests.length) return guests;
            }
        } catch(e) {
            console.warn('Mock guests fallback', e);
        }
        try {
            let res = await fetch('../data/crm/guests.json');
            if(res.ok) return await res.json();
        } catch(e) { console.warn('Fetch failed for guests'); }
        return initStorage('pms_guests', [
            {
                "id": "G-1001", "name": "John Smith", "init": "JS", "color": "#8B5CF6",
                "nation": "🇺🇸 USA", "tier": "platinum", "visits": 8, "last": "2026-05-12",
                "spend": 6240, "phone": "+1 212 555 0142", "email": "jsmith@email.com",
                "nationality": "US", "vip": "Silver"
            },
            {
                "id": "G-1002", "name": "Nguyen Thi Lan", "init": "NT", "color": "#3B82F6",
                "nation": "🇻🇳 Vietnam", "tier": "gold", "visits": 12, "last": "2026-05-10",
                "spend": 4482, "phone": "+84 90 123 4567", "email": "ntlan@email.com",
                "nationality": "VN", "vip": "VIP Gold"
            },
            {
                "id": "G-1003", "name": "Park Soo Jin", "init": "PS", "color": "#10B981",
                "nation": "🇰🇷 Korea", "tier": "gold", "visits": 6, "last": "2026-05-12",
                "spend": 2970, "phone": "+82 10 5678 1234", "email": "psj@email.com",
                "nationality": "KR", "vip": "Standard"
            },
            {
                "id": "G-1004", "name": "Tran Linh", "init": "TL", "color": "#F59E0B",
                "nation": "🇻🇳 Vietnam", "tier": "diamond", "visits": 24, "last": "2026-05-12",
                "spend": 18900, "phone": "+84 91 888 9999", "email": "tlinh@email.com",
                "nationality": "VN", "vip": "VIP"
            },
            {
                "id": "G-1005", "name": "Al Rashid Omar", "init": "AR", "color": "#F59E0B",
                "nation": "🇦🇪 UAE", "tier": "diamond", "visits": 15, "last": "2026-04-20",
                "spend": 22500, "phone": "+971 50 123 4567", "email": "alrashid@email.com",
                "nationality": "AE", "vip": "VIP Gold"
            },
            {
                "id": "G-1006", "name": "Tanaka Yuki", "init": "TY", "color": "#10B981",
                "nation": "🇯🇵 Japan", "tier": "platinum", "visits": 10, "last": "2026-05-08",
                "spend": 7800, "phone": "+81 80 1234 5678", "email": "tanaka@email.com",
                "nationality": "JP", "vip": "Silver"
            },
            {
                "id": "G-1007", "name": "Garcia Miguel", "init": "GM", "color": "#EC4899",
                "nation": "🇪🇸 Spain", "tier": "diamond", "visits": 18, "last": "2026-05-12",
                "spend": 14700, "phone": "+34 612 345 678", "email": "garcia@email.com",
                "nationality": "ES", "vip": "VIP"
            },
            {
                "id": "G-1008", "name": "Kim Da Eun", "init": "KD", "color": "#3B82F6",
                "nation": "🇰🇷 Korea", "tier": "gold", "visits": 5, "last": "2026-05-12",
                "spend": 2375, "phone": "+82 10 9876 5432", "email": "kde@email.com",
                "nationality": "KR", "vip": "Standard"
            },
            {
                "id": "G-1009", "name": "Lee Hana", "init": "LH", "color": "#8B5CF6",
                "nation": "🇰🇷 Korea", "tier": "platinum", "visits": 9, "last": "2026-05-07",
                "spend": 5625, "phone": "+82 10 1111 2222", "email": "leehana@email.com",
                "nationality": "KR", "vip": "VIP Gold"
            },
            {
                "id": "G-1010", "name": "Pham Anh", "init": "PA", "color": "#10B981",
                "nation": "🇻🇳 Vietnam", "tier": "standard", "visits": 2, "last": "2026-05-05",
                "spend": 570, "phone": "+84 93 456 7890", "email": "panh@email.com",
                "nationality": "VN", "vip": "Standard"
            },
            {
                "id": "G-1011", "name": "Chen Wei", "init": "CW", "color": "#3B82F6",
                "nation": "🇨🇳 China", "tier": "gold", "visits": 7, "last": "2026-05-06",
                "spend": 3640, "phone": "+86 138 0000 1234", "email": "chenwei@email.com",
                "nationality": "CN", "vip": "Standard"
            },
            {
                "id": "G-1012", "name": "Mueller Klaus", "init": "MK", "color": "#EC4899",
                "nation": "🇩🇪 Germany", "tier": "standard", "visits": 3, "last": "2026-04-28",
                "spend": 1560, "phone": "+49 170 123 4567", "email": "mueller@email.com",
                "nationality": "DE", "vip": "Standard"
            },
            {
                "id": "G-1013", "name": "Wong Li", "init": "WL", "color": "#F59E0B",
                "nation": "🇭🇰 Hong Kong", "tier": "gold", "visits": 11, "last": "2026-05-04",
                "spend": 5720, "phone": "+852 9123 4567", "email": "wongli@email.com",
                "nationality": "HK", "vip": "Standard"
            },
            {
                "id": "G-1014", "name": "Sato Yuki", "init": "SY", "color": "#8B5CF6",
                "nation": "🇯🇵 Japan", "tier": "standard", "visits": 1, "last": "2026-05-01",
                "spend": 520, "phone": "+81 90 5555 6666", "email": "sato@email.com",
                "nationality": "JP", "vip": "Standard"
            },
            {
                "id": "G-1015", "name": "Bui Tien", "init": "BT", "color": "#10B981",
                "nation": "🇻🇳 Vietnam", "tier": "standard", "visits": 2, "last": "2026-04-22",
                "spend": 540, "phone": "+84 97 111 2222", "email": "buitien@email.com",
                "nationality": "VN", "vip": "Standard"
            },
            {
                "id": "G-1016", "name": "David Chen", "init": "DC", "color": "#3B82F6",
                "nation": "🇹🇼 Taiwan", "tier": "platinum", "visits": 14, "last": "2026-05-03",
                "spend": 8400, "phone": "+886 912 345 678", "email": "dchen@email.com",
                "nationality": "TW", "vip": "VIP Gold"
            }
        ]);
    },
    getHistory: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/crm/tier-history');
                const order = { standard: 0, gold: 1, platinum: 2, diamond: 3 };
                const normalizeTier = (tier) => {
                    const value = String(tier || 'standard').toLowerCase();
                    if (value.includes('diamond')) return 'diamond';
                    if (value.includes('platinum')) return 'platinum';
                    if (value.includes('gold') || value === 'vip') return 'gold';
                    return 'standard';
                };
                const localized = (value) => {
                    if (value && typeof value === 'object') {
                        const lang = localStorage.getItem('pms_lang') || window.currentLang || 'ko';
                        return value[lang] || value.ko || value.en || '';
                    }
                    return value || '';
                };
                return window.PmsMockApi.items(env).map((item, index) => {
                    const from = normalizeTier(item.beforeTier || item.from);
                    const to = normalizeTier(item.afterTier || item.to);
                    const rawChangeType = String(item.changeType || item.type || '').toLowerCase();
                    const changedBy = item.by || item.changedBy || 'System';
                    const changeType = rawChangeType === 'manual' || (!rawChangeType && changedBy && changedBy !== 'System') ? 'manual' : 'auto';
                    if (order[to] < order[from] && changeType !== 'manual') return null;
                    const name = item.guestName || item.name || item.guestId || 'Guest';
                    return {
                        ...item,
                        date: item.changedAt || item.date || '',
                        name,
                        init: item.init || String(name).split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(),
                        color: item.color || ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'][index % 4],
                        from,
                        to,
                        dir: order[to] > order[from] ? 'up' : 'change',
                        changeType,
                        reason: localized(item.reason),
                        by: changedBy
                    };
                }).filter(Boolean);
            }
        } catch(e) {
            console.warn('Mock tier history fallback', e);
        }
        return [];
    }
});
