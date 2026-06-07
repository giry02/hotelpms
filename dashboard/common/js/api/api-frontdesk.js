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
        return [];
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
        return [];
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
        return [];
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
        return [];
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
