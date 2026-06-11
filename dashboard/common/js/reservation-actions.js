// reservation-actions.js
// Handles common Unified Reservation Modal (View & Edit combined) across Timeline and List views

(function() {
    const ACTION_MESSAGES = {
        ko: {
            'action.checkin': '체크인',
            'action.checkout': '체크아웃',
            'flow.alreadyCheckedIn': '이미 체크인 또는 투숙 중인 예약입니다. 체크인을 다시 처리할 수 없습니다.',
            'flow.checkoutOnlyInhouse': '체크아웃은 투숙 중 예약에서만 처리할 수 있습니다.',
            'flow.noRoom': '객실을 먼저 배정해야 체크인할 수 있습니다.',
            'flow.dirtyRoom': '배정 객실 청소가 아직 완료되지 않았습니다.',
            'flow.dirtyRoomWarning': '배정 객실 청소가 아직 완료되지 않았습니다.\n체크인은 진행할 수 있지만 객실 준비 상태는 하우스키핑 확인 대상으로 남습니다.',
            'flow.dirtyRoomTitle': '객실 청소 미완료',
            'flow.continueCheckin': '체크인 진행',
            'flow.maintenanceRoom': '점검/수리 중 객실은 체크인할 수 없습니다.',
            'flow.occupiedRoom': '이미 투숙 중인 객실입니다.',
            'flow.confirm': '{name} 예약을 {action} 처리하시겠습니까?',
            'flow.completed': '{action} 처리가 완료되었습니다.',
            'flow.completedRoomNotReady': '{action} 처리가 완료되었습니다. 객실 청소 상태를 하우스키핑에서 확인하세요.',
            'edit.readonly': '체크인 이후 예약은 이 화면에서 수정할 수 없습니다.',
            'guest.required': '고객명을 입력하거나 선택해주세요.',
            'booking.dateRequired': '체크인/체크아웃 날짜를 선택해 주세요.',
            'booking.pastCheckin': '체크인 시작일은 오늘 이후 날짜만 선택할 수 있습니다.',
            'booking.invalidDates': '체크아웃 날짜는 체크인 다음 날 이후여야 합니다.',
            'booking.roomRequired': '예약 가능한 객실을 선택해 주세요.',
            'booking.roomDateFirst': '날짜를 먼저 선택하면 예약 가능한 객실이 표시됩니다.',
            'booking.roomUnavailable': '선택한 기간에 이미 예약된 객실입니다.',
            'booking.noRooms': '선택한 기간에 예약 가능한 객실이 없습니다.',
            'booking.conflictSuffix': '예약 중',
            'booking.newTitle': '신규 예약 등록',
            'booking.created': '신규 예약을 성공적으로 등록했습니다.',
            'booking.updated': '예약이 성공적으로 수정되었습니다.',
            'cancel.notAllowed': '체크인 이후 예약은 취소할 수 없습니다. 체크아웃, 조기퇴실, 환불/정산 정정으로 처리해주세요.',
            'cancel.confirm': '[{name}] 고객의 예약을 취소하시겠습니까?',
            'cancel.done': '예약이 취소되었습니다.'
        },
        en: {
            'action.checkin': 'Check-in',
            'action.checkout': 'Check-out',
            'flow.alreadyCheckedIn': 'This reservation is already checked in or in-house. Check-in cannot be processed again.',
            'flow.checkoutOnlyInhouse': 'Check-out can only be processed for in-house reservations.',
            'flow.noRoom': 'Assign a room before check-in.',
            'flow.dirtyRoom': 'The assigned room has not been cleaned yet.',
            'flow.dirtyRoomWarning': 'The assigned room has not been cleaned yet.\nYou can continue check-in, but the room readiness remains flagged for housekeeping.',
            'flow.dirtyRoomTitle': 'Room Not Ready',
            'flow.continueCheckin': 'Continue Check-in',
            'flow.maintenanceRoom': 'Rooms under maintenance cannot be checked in.',
            'flow.occupiedRoom': 'This room is already occupied.',
            'flow.confirm': 'Process {action} for {name}?',
            'flow.completed': '{action} has been completed.',
            'flow.completedRoomNotReady': '{action} has been completed. Check the room cleaning status with housekeeping.',
            'edit.readonly': 'Reservations after check-in cannot be edited from this screen.',
            'guest.required': 'Enter or select a guest name.',
            'booking.dateRequired': 'Select check-in and check-out dates.',
            'booking.pastCheckin': 'Check-in must be today or a future date.',
            'booking.invalidDates': 'Check-out must be later than check-in.',
            'booking.roomRequired': 'Select an available room.',
            'booking.roomDateFirst': 'Select dates first to see available rooms.',
            'booking.roomUnavailable': 'This room is already booked for the selected dates.',
            'booking.noRooms': 'No rooms are available for the selected dates.',
            'booking.conflictSuffix': 'Booked',
            'booking.newTitle': 'New Booking',
            'booking.created': 'New booking has been registered successfully.',
            'booking.updated': 'Reservation has been updated successfully.',
            'cancel.notAllowed': 'Reservations after check-in cannot be cancelled. Please handle it through check-out, early departure, refund, or settlement correction.',
            'cancel.confirm': 'Cancel the reservation for {name}?',
            'cancel.done': 'Reservation has been cancelled.'
        }
    };

    function actionLang() {
        return (window.currentLang || localStorage.getItem('pms_lang') || document.getElementById('langSelect')?.value || 'ko') === 'en'
            ? 'en'
            : 'ko';
    }

    function actionText(key, params = {}) {
        const catalogKey = `reservation.${key}`;
        let text = '';
        if (typeof window.t === 'function') {
            text = window.t(catalogKey, params);
            if (text && text !== catalogKey) return text;
        }
        const lang = actionLang();
        text = ACTION_MESSAGES[lang]?.[key] || ACTION_MESSAGES.ko[key] || key;
        Object.keys(params).forEach(name => {
            text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), params[name]);
        });
        return text;
    }

    function actionEscapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, ch => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch]));
    }

    function compactValue(value) {
        const text = String(value ?? '').trim();
        return text && text !== '-' ? text : '';
    }

    async function reservationGuestList() {
        try {
            if (typeof window.loadGuestDb === 'function') {
                const loaded = await window.loadGuestDb();
                if (Array.isArray(loaded) && loaded.length) return loaded;
            }
        } catch (error) {
            console.warn('Guest DB lookup failed', error);
        }
        if (Array.isArray(window.GUEST_DB) && window.GUEST_DB.length) return window.GUEST_DB;
        if (Array.isArray(window.guests) && window.guests.length) return window.guests;
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/crm/guests');
                const items = window.PmsMockApi.items ? window.PmsMockApi.items(env) : env?.data?.items;
                if (Array.isArray(items)) return items;
            }
        } catch (error) {
            console.warn('Reservation guest privacy lookup failed', error);
        }
        return [];
    }

    async function guestForUnifiedReservation(res) {
        const list = await reservationGuestList();
        const guestId = compactValue(res?.guestId || res?.roomingGuestId);
        const guestName = compactValue(res?.roomingGuestName || res?.guestName || res?.guest);
        const guestEmail = compactValue(res?.guestEmail || res?.email);
        return list.find(guest => String(guest.id || guest.guestId || '') === guestId)
            || list.find(guest => guestEmail && String(guest.email || '').toLowerCase() === guestEmail.toLowerCase())
            || list.find(guest => guestName && String(guest.name || guest.guestName || '').toLowerCase() === guestName.toLowerCase())
            || null;
    }

    function reservationPrivacyDetails(res, guest) {
        const guestName = compactValue(res?.roomingGuestName || res?.guestName || res?.guest || guest?.name || guest?.guestName) || '-';
        const phone = compactValue(res?.guestPhone || res?.phone || res?.mobile || guest?.phone || guest?.mobile) || '-';
        const email = compactValue(res?.guestEmail || res?.email || guest?.email) || '-';
        const notes = [
            res?.specialNotes,
            res?.guestNote,
            res?.notes,
            res?.memo,
            guest?.specialNotes,
            guest?.notes,
            guest?.preference
        ].map(compactValue).filter(Boolean);
        const documentStatus = compactValue(res?.docStatus || res?.documentStatus || guest?.documentStatus || guest?.docStatus || guest?.document?.status) || '-';
        return {
            guestName,
            phone,
            email,
            notes: [...new Set(notes)].join(' / ') || '-',
            documentStatus,
            guestId: compactValue(res?.guestId || res?.roomingGuestId || guest?.id || guest?.guestId),
            guest
        };
    }

    function reservationCurrency(res = null) {
        return res?.currency || res?.totalAmount?.currency || res?.rate?.currency || 'PHP';
    }

    function reservationAmountValue(res = null) {
        if (!res) return 0;
        if (res.totalAmount && typeof res.totalAmount === 'object') return Number(res.totalAmount.amount || 0);
        return Number(res.amount || 0);
    }

    function reservationRateValue(res = null) {
        if (!res) return 0;
        if (res.rate && typeof res.rate === 'object') return Number(res.rate.amount || 0);
        return Number(res.rate || 0);
    }

    function reservationPrepaidValue(res = null) {
        if (!res) return 0;
        if (res.paymentPlan && typeof res.paymentPlan === 'object') return Number(res.paymentPlan.prepaidAmount || 0);
        return Number(res.prepaidAmount || res.prepaid || 0);
    }

    function parseMoneyInput(value) {
        const normalized = String(value ?? '').replace(/[^\d.-]/g, '');
        const amount = Number(normalized);
        return Number.isFinite(amount) ? Math.max(0, amount) : 0;
    }

    function formatMoneyInputValue(amount) {
        const value = Number(amount || 0);
        return Number.isFinite(value) ? String(Math.round(value * 100) / 100) : '0';
    }

    function formatSettlementMoney(amount, currency = 'PHP') {
        try {
            return new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency,
                maximumFractionDigits: 2
            }).format(Number(amount || 0));
        } catch(e) {
            return `${currency} ${Number(amount || 0).toLocaleString()}`;
        }
    }

    function reservationActionScreen() {
        const path = window.location.pathname || '';
        if (path.includes('reservation-timeline')) return 'reservation-timeline';
        if (path.includes('reservation-board')) return 'reservation-board';
        if (path.includes('reservation-list')) return 'reservation-list';
        return 'reservation';
    }

    function companionNamesFromText(value) {
        return String(value || '')
            .split(/[\n,]/)
            .map(name => name.trim())
            .filter(Boolean)
            .filter((name, index, arr) => arr.indexOf(name) === index);
    }

    function companionNamesForReservation(res) {
        const values = [
            ...(Array.isArray(res?.companionGuestNames) ? res.companionGuestNames : []),
            ...(Array.isArray(res?.roomingGuestNames) ? res.roomingGuestNames.slice(1) : []),
            ...(Array.isArray(res?.companions) ? res.companions.map(item => typeof item === 'string' ? item : item?.name) : []),
            ...(Array.isArray(res?.roomingGuests) ? res.roomingGuests.slice(1).map(item => typeof item === 'string' ? item : item?.name) : [])
        ];
        const primary = guestNameForReservation(res);
        const seen = new Set();
        return values
            .map(name => String(name || '').trim())
            .filter(name => name && name !== primary && !seen.has(name) && seen.add(name));
    }

    let unifiedStayGuestRoster = [];
    let unifiedPrivacyReservation = null;

    function rosterGuestRole(role) {
        const value = String(role || '').toLowerCase();
        return ['primary', 'representative', 'main', 'owner'].includes(value) ? 'primary' : 'companion';
    }

    function rosterGuestKey(entry) {
        const guestId = compactValue(entry?.guestId || entry?.id || entry?.roomingGuestId);
        const name = compactValue(entry?.name || entry?.guestName || entry?.roomingGuestName || entry?.guest);
        return guestId ? `id:${guestId}` : `name:${name.toLowerCase()}`;
    }

    function normalizeRosterGuest(source, fallbackRole = 'companion') {
        if (!source) return null;
        const item = typeof source === 'string' ? { name: source } : source;
        const name = compactValue(item.name || item.guestName || item.roomingGuestName || item.guest);
        if (!name) return null;
        const guestId = compactValue(item.guestId || item.id || item.roomingGuestId);
        return {
            key: guestId ? `id:${guestId}` : `name:${name.toLowerCase()}`,
            guestId,
            id: guestId,
            name,
            phone: compactValue(item.phone || item.mobile || item.guestPhone),
            email: compactValue(item.email || item.guestEmail),
            tier: compactValue(item.tier || item.vip),
            country: compactValue(item.country || item.nationality || item.nation),
            role: rosterGuestRole(item.role || fallbackRole)
        };
    }

    function findRosterGuestRecord(raw, guestList = []) {
        const guestId = compactValue(raw?.guestId || raw?.id || raw?.roomingGuestId);
        const name = compactValue(raw?.name || raw?.guestName || raw?.roomingGuestName || raw?.guest);
        const email = compactValue(raw?.email || raw?.guestEmail);
        return guestList.find(guest => guestId && String(guest.id || guest.guestId || '') === guestId)
            || guestList.find(guest => email && String(guest.email || '').toLowerCase() === email.toLowerCase())
            || guestList.find(guest => name && String(guest.name || guest.guestName || '').toLowerCase() === name.toLowerCase())
            || null;
    }

    function mergeRosterGuestWithRecord(raw, guestList = []) {
        const item = typeof raw === 'string' ? { name: raw } : (raw || {});
        const matched = findRosterGuestRecord(item, guestList);
        const guestId = compactValue(item.guestId || item.id || item.roomingGuestId || matched?.id || matched?.guestId);
        const name = compactValue(item.name || item.guestName || item.roomingGuestName || item.guest || matched?.name || matched?.guestName);
        return {
            ...(matched || {}),
            ...item,
            id: guestId,
            guestId,
            name
        };
    }

    async function rosterGuestsForReservation(res = null) {
        if (!res) return [];
        const guestList = await reservationGuestList();
        const entries = [];
        const addEntry = (raw, fallbackRole) => {
            const normalized = normalizeRosterGuest(mergeRosterGuestWithRecord(raw, guestList), fallbackRole);
            if (!normalized) return;
            const key = rosterGuestKey(normalized);
            const existingIndex = entries.findIndex(item => rosterGuestKey(item) === key);
            if (normalized.role === 'primary') {
                entries.forEach(item => { item.role = 'companion'; });
            }
            if (existingIndex >= 0) {
                entries[existingIndex] = { ...entries[existingIndex], ...normalized };
            } else {
                entries.push(normalized);
            }
        };

        addEntry({
            guestId: res.guestId || res.roomingGuestId,
            name: res.roomingGuestName || res.guestName || res.guest,
            phone: res.guestPhone || res.phone || res.mobile,
            email: res.guestEmail || res.email,
            tier: res.tier || res.vip
        }, 'primary');

        if (Array.isArray(res.roomingGuests)) {
            res.roomingGuests.forEach((item, index) => {
                const role = typeof item === 'object' && item?.role ? item.role : (index === 0 ? 'primary' : 'companion');
                addEntry(item, role);
            });
        }

        const companionIds = Array.isArray(res.companionGuestIds) ? res.companionGuestIds : [];
        if (Array.isArray(res.companionGuestNames)) {
            res.companionGuestNames.forEach((name, index) => addEntry({ name, guestId: companionIds[index] }, 'companion'));
        }
        if (Array.isArray(res.roomingGuestNames)) {
            res.roomingGuestNames.slice(1).forEach(name => addEntry({ name }, 'companion'));
        }
        if (Array.isArray(res.companions)) {
            res.companions.forEach(item => addEntry(item, 'companion'));
        }

        const primary = entries.find(item => item.role === 'primary');
        if (primary) {
            const primaryKey = rosterGuestKey(primary);
            entries.forEach(item => {
                if (item.role !== 'primary' && rosterGuestKey(item) === primaryKey) item.role = 'primary';
            });
        } else if (entries[0]) {
            entries[0].role = 'primary';
        }

        const seen = new Set();
        return entries.filter(item => {
            const key = rosterGuestKey(item);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    function orderedUnifiedRoster() {
        const primary = unifiedStayGuestRoster.filter(item => item.role === 'primary');
        const companions = unifiedStayGuestRoster.filter(item => item.role !== 'primary');
        return [...primary, ...companions];
    }

    function syncUnifiedCompanionField() {
        const companionInput = document.getElementById('unifiedCompanions');
        if (!companionInput) return;
        companionInput.value = unifiedStayGuestRoster
            .filter(item => item.role !== 'primary')
            .map(item => item.name)
            .join('\n');
    }

    function renderUnifiedGuestRoster() {
        const list = document.getElementById('unifiedStayGuestList');
        const count = document.getElementById('unifiedStayGuestCount');
        if (!list) return;
        syncUnifiedCompanionField();
        const roster = orderedUnifiedRoster();
        if (count) count.textContent = `${roster.length}명`;
        if (!roster.length) {
            list.innerHTML = `<div style="padding:14px;border:1px dashed var(--border);border-radius:8px;background:#fff;color:var(--txt3);font-size:.78rem;font-weight:700;text-align:center">상단에서 투숙객을 검색한 뒤 대표 또는 동반으로 추가하세요.</div>`;
            return;
        }
        list.innerHTML = roster.map(item => {
            const isPrimary = item.role === 'primary';
            const key = encodeURIComponent(rosterGuestKey(item)).replace(/'/g, '%27');
            const meta = [item.phone, item.email].filter(Boolean).join(' · ') || (item.guestId ? `고객ID ${item.guestId}` : '신규 입력 고객');
            const badgeStyle = isPrimary
                ? 'background:#111827;color:#fff'
                : 'background:#EEF2FF;color:#4338CA';
            const icon = isPrimary ? 'fa-user-check' : 'fa-user-group';
            return `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px;background:#fff;border:1px solid var(--border2);border-radius:9px;margin-top:8px">
                <div style="display:flex;align-items:center;gap:10px;min-width:0">
                    <div style="width:36px;height:36px;border-radius:50%;background:${isPrimary ? '#111827' : '#EEF2FF'};color:${isPrimary ? '#fff' : '#4338CA'};display:flex;align-items:center;justify-content:center;flex:0 0 auto"><i class="fa-solid ${icon}" style="font-size:.8rem"></i></div>
                    <div style="min-width:0">
                        <div style="display:flex;align-items:center;gap:7px;min-width:0;flex-wrap:wrap">
                            <span style="font-size:.86rem;font-weight:900;color:var(--txt);word-break:break-word">${actionEscapeHtml(item.name)}</span>
                            <span style="font-size:.65rem;font-weight:900;border-radius:999px;padding:3px 8px;${badgeStyle}">${isPrimary ? '대표' : '동반'}</span>
                        </div>
                        <div style="font-size:.7rem;color:var(--txt3);font-weight:700;margin-top:2px;word-break:break-all">${actionEscapeHtml(meta)}</div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;flex:0 0 auto">
                    ${isPrimary ? '' : `<button type="button" onclick="setUnifiedPrimaryGuest('${key}')" style="height:30px;border:1px solid var(--border);background:#fff;border-radius:6px;padding:0 9px;font-family:var(--font);font-size:.7rem;font-weight:800;color:var(--txt2);cursor:pointer"><i class="fa-solid fa-star"></i> 대표</button>`}
                    <button type="button" onclick="removeUnifiedStayGuest('${key}')" style="width:30px;height:30px;border:1px solid var(--border);background:#fff;border-radius:6px;color:var(--txt3);cursor:pointer" title="삭제"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function setUnifiedGuestRoster(entries = []) {
        unifiedStayGuestRoster = [];
        entries.forEach(entry => {
            const normalized = normalizeRosterGuest(entry, entry?.role || 'companion');
            if (!normalized) return;
            const existingIndex = unifiedStayGuestRoster.findIndex(item => rosterGuestKey(item) === rosterGuestKey(normalized));
            if (normalized.role === 'primary') unifiedStayGuestRoster.forEach(item => { item.role = 'companion'; });
            if (existingIndex >= 0) unifiedStayGuestRoster[existingIndex] = { ...unifiedStayGuestRoster[existingIndex], ...normalized };
            else unifiedStayGuestRoster.push(normalized);
        });
        if (!unifiedStayGuestRoster.some(item => item.role === 'primary') && unifiedStayGuestRoster[0]) {
            unifiedStayGuestRoster[0].role = 'primary';
        }
        renderUnifiedGuestRoster();
    }

    function getUnifiedSelectedGuestCandidate() {
        const widget = window._editGuestWidget;
        const selected = widget?.getSelectedGuest ? widget.getSelectedGuest() : null;
        if (selected) return selected;
        const name = compactValue(widget?.getGuestName ? widget.getGuestName() : document.getElementById('nrGuestEdit')?.value);
        if (!name) return null;
        return {
            name,
            phone: compactValue(document.getElementById('nrPhoneEdit')?.value),
            email: compactValue(document.getElementById('nrEmailEdit')?.value),
            country: compactValue(document.getElementById('nrNationEdit')?.value)
        };
    }

    function upsertUnifiedRosterGuest(source, role = 'companion') {
        const normalized = normalizeRosterGuest(source, role);
        if (!normalized) return null;
        const key = rosterGuestKey(normalized);
        const existingIndex = unifiedStayGuestRoster.findIndex(item => rosterGuestKey(item) === key);
        if (existingIndex >= 0 && unifiedStayGuestRoster[existingIndex].role === 'primary' && normalized.role !== 'primary') {
            return unifiedStayGuestRoster[existingIndex];
        }
        if (normalized.role === 'primary') {
            unifiedStayGuestRoster.forEach(item => { item.role = 'companion'; });
        }
        if (existingIndex >= 0) {
            unifiedStayGuestRoster[existingIndex] = { ...unifiedStayGuestRoster[existingIndex], ...normalized };
        } else {
            unifiedStayGuestRoster.push(normalized);
        }
        if (!unifiedStayGuestRoster.some(item => item.role === 'primary') && unifiedStayGuestRoster[0]) {
            unifiedStayGuestRoster[0].role = 'primary';
        }
        renderUnifiedGuestRoster();
        return normalized;
    }

    function getUnifiedPrimaryGuestEntry() {
        return unifiedStayGuestRoster.find(item => item.role === 'primary') || null;
    }

    function getUnifiedCompanionGuestEntries() {
        return unifiedStayGuestRoster.filter(item => item.role !== 'primary');
    }

    function unifiedRosterPayload(fallbackGuestName = '') {
        const primary = getUnifiedPrimaryGuestEntry();
        const companions = getUnifiedCompanionGuestEntries();
        const guest = compactValue(primary?.name || fallbackGuestName);
        const guestId = compactValue(primary?.guestId || primary?.id);
        const companionGuestNames = companions.map(item => item.name).filter(Boolean);
        const companionGuestIds = companions.map(item => compactValue(item.guestId || item.id));
        const roomingGuests = [
            primary ? { ...primary, role: 'primary' } : (guest ? { name: guest, guestId, role: 'primary' } : null),
            ...companions.map(item => ({ ...item, role: 'companion' }))
        ].filter(Boolean).map(item => ({
            guestId: compactValue(item.guestId || item.id),
            name: item.name,
            phone: compactValue(item.phone),
            email: compactValue(item.email),
            tier: compactValue(item.tier),
            role: item.role
        }));
        return {
            primary,
            guest,
            guestId,
            companionGuestNames,
            companionGuestIds,
            roomingGuestNames: [guest, ...companionGuestNames].filter(Boolean),
            roomingGuests,
            companions: companions.map(item => ({
                guestId: compactValue(item.guestId || item.id),
                name: item.name,
                phone: compactValue(item.phone),
                email: compactValue(item.email)
            }))
        };
    }

    window.addUnifiedSelectedGuest = function(role = 'companion') {
        const candidate = getUnifiedSelectedGuestCandidate();
        if (!candidate || !compactValue(candidate.name)) {
            alert('상단에서 투숙객을 검색한 뒤 선택해주세요.');
            return;
        }
        upsertUnifiedRosterGuest(candidate, role === 'primary' ? 'primary' : 'companion');
        if (window._editGuestWidget?.reset) window._editGuestWidget.reset();
    };

    window.setUnifiedPrimaryGuest = function(encodedKey) {
        const key = decodeURIComponent(encodedKey || '');
        const target = unifiedStayGuestRoster.find(item => rosterGuestKey(item) === key);
        if (!target) return;
        unifiedStayGuestRoster.forEach(item => { item.role = rosterGuestKey(item) === key ? 'primary' : 'companion'; });
        renderUnifiedGuestRoster();
    };

    window.removeUnifiedStayGuest = function(encodedKey) {
        const key = decodeURIComponent(encodedKey || '');
        unifiedStayGuestRoster = unifiedStayGuestRoster.filter(item => rosterGuestKey(item) !== key);
        if (!unifiedStayGuestRoster.some(item => item.role === 'primary') && unifiedStayGuestRoster[0]) {
            unifiedStayGuestRoster[0].role = 'primary';
        }
        renderUnifiedGuestRoster();
    };

    function setUnifiedFinanceValues(res = null, options = {}) {
        const amountInput = document.getElementById('unifiedAmount');
        const prepaidInput = document.getElementById('unifiedPrepaid');
        if (!amountInput || !prepaidInput) return;
        const currency = reservationCurrency(res);
        let amount = options.amount;
        if (amount === undefined) amount = reservationAmountValue(res);
        if (!amount && options.suggest) amount = options.suggest;
        const prepaid = options.prepaid !== undefined ? options.prepaid : reservationPrepaidValue(res);
        amountInput.value = formatMoneyInputValue(amount);
        prepaidInput.value = formatMoneyInputValue(prepaid);
        amountInput.dataset.currency = currency;
        prepaidInput.dataset.currency = currency;
        syncUnifiedBalance();
    }

    function syncUnifiedBalance() {
        const amountInput = document.getElementById('unifiedAmount');
        const prepaidInput = document.getElementById('unifiedPrepaid');
        const balanceInput = document.getElementById('unifiedBalance');
        const help = document.getElementById('unifiedFinanceHelp');
        if (!amountInput || !prepaidInput || !balanceInput) return;
        const currency = amountInput.dataset.currency || 'PHP';
        const total = parseMoneyInput(amountInput.value);
        const prepaid = Math.min(parseMoneyInput(prepaidInput.value), total);
        const balance = Math.max(total - prepaid, 0);
        balanceInput.value = formatSettlementMoney(balance, currency);
        if (help) {
            help.textContent = `총 금액 ${formatSettlementMoney(total, currency)} · 선결제 ${formatSettlementMoney(prepaid, currency)} · 추후 정산 ${formatSettlementMoney(balance, currency)}`;
        }
    }

    function logReservationAudit(action, details) {
        if (!window.PmsPrivacyAudit) return;
        window.PmsPrivacyAudit.log(action, {
            screen: reservationActionScreen(),
            ...details
        });
    }

    function unifiedPrivacyGuestKey(entry) {
        return rosterGuestKey(entry);
    }

    async function unifiedPrivacyRoster(res) {
        const entries = await rosterGuestsForReservation(res);
        if (entries.length) return entries;
        const guest = await guestForUnifiedReservation(res);
        const normalized = normalizeRosterGuest({
            ...(guest || {}),
            guestId: res?.guestId || res?.roomingGuestId || guest?.id || guest?.guestId,
            name: res?.roomingGuestName || res?.guestName || res?.guest || guest?.name || guest?.guestName,
            phone: res?.guestPhone || res?.phone || res?.mobile || guest?.phone || guest?.mobile,
            email: res?.guestEmail || res?.email || guest?.email,
            role: 'primary'
        }, 'primary');
        return normalized ? [normalized] : [];
    }

    function unifiedPrivacyGuestTabs(entries, selectedKey) {
        if (!entries.length) return '';
        return `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
            ${entries.map(entry => {
                const key = unifiedPrivacyGuestKey(entry);
                const encoded = encodeURIComponent(key).replace(/'/g, '%27');
                const active = key === selectedKey;
                const roleLabel = entry.role === 'primary' ? '대표' : '동반';
                return `<button type="button" onclick="selectUnifiedPrivacyGuest('${encoded}')" style="height:30px;border:1px solid ${active ? 'var(--primary)' : 'var(--border)'};background:${active ? 'var(--primary)' : '#fff'};color:${active ? '#fff' : 'var(--txt2)'};border-radius:999px;padding:0 10px;font-family:var(--font);font-size:.7rem;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:5px;max-width:100%">
                    <i class="fa-solid ${entry.role === 'primary' ? 'fa-user-check' : 'fa-user-group'}" style="font-size:.66rem"></i>
                    <span>${roleLabel}</span>
                    <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${actionEscapeHtml(entry.name)}</span>
                </button>`;
            }).join('')}
        </div>`;
    }

    async function renderUnifiedGuestPrivacy(res, selectedKey = null) {
        const panel = document.getElementById('unifiedGuestPrivacyPanel');
        const body = document.getElementById('unifiedGuestPrivacyBody');
        if (!panel || !body) return;
        if (!res || res.isGroupPlaceholder || normalizedReservationStatus(res.status) === 'blocked') {
            unifiedPrivacyReservation = null;
            panel.style.display = 'none';
            body.innerHTML = '';
            return;
        }
        unifiedPrivacyReservation = res;
        const entries = await unifiedPrivacyRoster(res);
        if (!entries.length) {
            panel.style.display = 'none';
            body.innerHTML = '';
            return;
        }
        const primary = entries.find(entry => entry.role === 'primary') || entries[0];
        const selected = entries.find(entry => unifiedPrivacyGuestKey(entry) === selectedKey) || primary;
        const guestList = await reservationGuestList();
        const guest = findRosterGuestRecord(selected, guestList);
        const selectedRes = {
            guestId: selected.guestId || selected.id || guest?.id || guest?.guestId,
            roomingGuestId: selected.guestId || selected.id || guest?.id || guest?.guestId,
            guestName: selected.name,
            roomingGuestName: selected.name,
            guest: selected.name,
            guestPhone: selected.phone || guest?.phone || guest?.mobile,
            phone: selected.phone || guest?.phone || guest?.mobile,
            guestEmail: selected.email || guest?.email,
            email: selected.email || guest?.email,
            docStatus: selected.documentStatus || selected.docStatus || guest?.documentStatus || guest?.docStatus || guest?.document?.status,
            documentStatus: selected.documentStatus || selected.docStatus || guest?.documentStatus || guest?.docStatus || guest?.document?.status
        };
        const info = reservationPrivacyDetails(selectedRes, guest);
        const tabs = unifiedPrivacyGuestTabs(entries, unifiedPrivacyGuestKey(selected));
        panel.style.display = 'block';
        body.innerHTML = `
            ${tabs}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="min-width:0">
                    <div style="font-size:.72rem;color:var(--txt3);font-weight:700;margin-bottom:4px">고객명</div>
                    <div style="font-size:.88rem;color:var(--txt);font-weight:800;word-break:break-word">${actionEscapeHtml(info.guestName)}</div>
                </div>
                <div style="min-width:0">
                    <div style="font-size:.72rem;color:var(--txt3);font-weight:700;margin-bottom:4px">휴대폰</div>
                    <div style="font-size:.88rem;color:var(--txt);font-weight:800;word-break:break-word">${actionEscapeHtml(info.phone)}</div>
                </div>
                <div style="min-width:0">
                    <div style="font-size:.72rem;color:var(--txt3);font-weight:700;margin-bottom:4px">이메일</div>
                    <div style="font-size:.86rem;color:var(--txt2);font-weight:700;word-break:break-word">${actionEscapeHtml(info.email)}</div>
                </div>
                <div style="min-width:0">
                    <div style="font-size:.72rem;color:var(--txt3);font-weight:700;margin-bottom:4px">신분증 확인</div>
                    <div style="font-size:.86rem;color:var(--txt2);font-weight:700">${actionEscapeHtml(info.documentStatus)}</div>
                </div>
                <div style="grid-column:1 / -1;min-width:0">
                    <div style="font-size:.72rem;color:var(--txt3);font-weight:700;margin-bottom:4px">특이사항</div>
                    <div style="font-size:.86rem;color:var(--txt);font-weight:700;line-height:1.45;word-break:break-word;background:#f8fafc;border:1px solid var(--border2);border-radius:8px;padding:10px">${actionEscapeHtml(info.notes)}</div>
                </div>
            </div>`;
        if (window.PmsPrivacyAudit) {
            window.PmsPrivacyAudit.log('reservation.guest_detail.view', {
                screen: reservationActionScreen(),
                reservationId: res.id || res.reservationId || '',
                guestId: info.guestId || '',
                guestName: info.guestName,
                fields: ['phone', 'email', 'specialNotes']
            });
        }
    }

    window.selectUnifiedPrivacyGuest = async function(encodedKey) {
        if (!unifiedPrivacyReservation) return;
        await renderUnifiedGuestPrivacy(unifiedPrivacyReservation, decodeURIComponent(encodedKey || ''));
    };

    const modalHtml = `
    <!-- Unified Reservation Modal (View & Edit) -->
    <div class="modal-overlay" id="unifiedResModal" style="z-index: 9999;">
        <div class="modal-card" style="width: 550px; max-width: 95vw;">
            <div class="modal-header">
                <div class="modal-title" id="unifiedModalTitle">예약 상세 및 수정</div>
                <button class="modal-close" onclick="closeUnifiedResModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                  <input type="hidden" id="unifiedResId">
                  <input type="hidden" id="unifiedChannel" value="Walk-in">
                  <input type="hidden" id="unifiedGroupId" value="">
                  <input type="hidden" id="unifiedStatus" value="confirmed">
                
                <div id="unifiedGuestSection" style="margin-bottom:20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid var(--border2);">
                    ${typeof renderGuestSearchHTML === 'function' ? renderGuestSearchHTML('Edit') : '<div style="color:red">guest-search.js missing</div>'}
                    <div style="display:flex;gap:8px;align-items:center;justify-content:flex-end;flex-wrap:wrap;margin-top:12px">
                        <button type="button" onclick="addUnifiedSelectedGuest('primary')" style="height:34px;border:none;border-radius:7px;background:#111827;color:#fff;padding:0 13px;font-family:var(--font);font-size:.76rem;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px"><i class="fa-solid fa-user-check"></i> 대표로 설정</button>
                        <button type="button" onclick="addUnifiedSelectedGuest('companion')" style="height:34px;border:1px solid var(--border);border-radius:7px;background:#fff;color:var(--txt);padding:0 13px;font-family:var(--font);font-size:.76rem;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px"><i class="fa-solid fa-user-plus"></i> 동반으로 추가</button>
                    </div>
                    <div id="unifiedStayGuestPanel" style="margin-top:14px;background:#fff;border:1px solid var(--border2);border-radius:10px;padding:12px">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:2px">
                            <div style="font-size:.86rem;font-weight:900;color:var(--txt);display:flex;align-items:center;gap:7px"><i class="fa-solid fa-address-book" style="color:var(--primary)"></i> 예약 투숙객 명단</div>
                            <div id="unifiedStayGuestCount" style="font-size:.68rem;font-weight:900;color:var(--txt3);background:#f1f5f9;border-radius:999px;padding:4px 8px">0명</div>
                        </div>
                        <div id="unifiedStayGuestList"></div>
                    </div>
                </div>
                <input type="hidden" id="unifiedCompanions">
                <div id="unifiedGuestPrivacyPanel" style="display:none;margin-bottom:20px;background:#fff;border:1px solid var(--border2);border-radius:10px;overflow:hidden;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;background:#f8fafc;border-bottom:1px solid var(--border2);">
                        <div style="font-size:.9rem;font-weight:800;color:var(--txt);display:flex;align-items:center;gap:8px"><i class="fa-solid fa-id-card-clip" style="color:var(--primary)"></i> 고객 상세 정보</div>
                        <div style="font-size:.68rem;color:var(--txt3);font-weight:700"><i class="fa-solid fa-shield-halved"></i> 열람 로그 기록</div>
                    </div>
                    <div id="unifiedGuestPrivacyBody" style="padding:14px;"></div>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                    <div class="md-item">
                        <div class="md-label" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px" data-i18n-key="Check-in">체크인 일자</div>
                        <input type="date" id="unifiedCin" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:600;box-sizing:border-box;background:#fff;">
                    </div>
                    <div class="md-item">
                        <div class="md-label" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px" data-i18n-key="Check-out">체크아웃 일자</div>
                        <input type="date" id="unifiedCout" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:600;box-sizing:border-box;background:#fff;">
                    </div>
                    <div class="md-item">
                        <div class="md-label" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px" data-i18n-key="Stay">숙박 일수</div>
                        <div class="md-value" id="unifiedNights" style="font-size:0.9rem;font-weight:700;"></div>
                    </div>
                    <div class="md-item">
                        <div class="md-label" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px" data-i18n-key="Room">객실 배정</div>
                        <select id="unifiedRoom" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:600;box-sizing:border-box;background:#fff;"></select>
                        <div id="unifiedRoomHelp" style="margin-top:6px;font-size:0.72rem;color:var(--txt3);font-weight:600;"></div>
                    </div>
                    <div id="unifiedGroupLinkNotice" style="grid-column:1 / -1;display:none;background:#f8fafc;padding:12px;border:1px solid var(--border2);border-radius:8px;margin:0;">
                        <div class="md-label" style="color:var(--txt2);font-size:0.75rem;margin:0 0 4px 0">단체 연결</div>
                        <div id="unifiedGroupLinkText" style="font-size:0.82rem;font-weight:700;color:var(--txt)"></div>
                    </div>
                    <div class="md-item" style="grid-column:1 / -1;display:none">
                        <div class="md-label" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px">동반 투숙객</div>
                        <textarea id="unifiedCompanionsLegacy" style="min-height:58px;border:1px solid var(--border);border-radius:4px;padding:10px;font-family:var(--font);width:100%;font-weight:600;box-sizing:border-box;background:#fff;resize:vertical" placeholder="동반 투숙객 이름을 쉼표 또는 줄바꿈으로 입력"></textarea>
                        <div style="margin-top:6px;font-size:0.72rem;color:var(--txt3);font-weight:600;">대표투숙객은 위 고객 정보, 동반 투숙객은 목록과 타임라인 아래줄에 표시됩니다.</div>
                    </div>
                    <div style="grid-column:1 / -1;background:#fff;border:1px solid var(--border2);border-radius:10px;padding:14px;">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:.9rem;font-weight:900;color:var(--txt);"><i class="fa-solid fa-file-invoice-dollar" style="color:var(--primary)"></i> 객실 요금 / 선결제</div>
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                            <div class="md-item">
                                <div class="md-label" style="color:var(--txt2);font-size:0.75rem;margin-bottom:6px">총 객실 금액</div>
                                <input type="number" min="0" step="0.01" id="unifiedAmount" oninput="syncUnifiedBalance()" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:700;box-sizing:border-box;background:#fff;">
                            </div>
                            <div class="md-item">
                                <div class="md-label" style="color:var(--txt2);font-size:0.75rem;margin-bottom:6px">선결제 금액</div>
                                <input type="number" min="0" step="0.01" id="unifiedPrepaid" oninput="syncUnifiedBalance()" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:700;box-sizing:border-box;background:#fff;">
                            </div>
                            <div class="md-item">
                                <div class="md-label" style="color:var(--txt2);font-size:0.75rem;margin-bottom:6px">추후 정산 잔액</div>
                                <input type="text" id="unifiedBalance" readonly style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:800;box-sizing:border-box;background:#f8fafc;color:var(--primary);">
                            </div>
                        </div>
                        <div id="unifiedFinanceHelp" style="margin-top:8px;font-size:0.72rem;color:var(--txt3);font-weight:700;line-height:1.45"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer" style="padding: 16px 20px; border-top: 1px solid var(--border2); display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-radius: 0 0 var(--radius-sm) var(--radius-sm);">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                    <button id="unifiedBtnCancel" class="btn-outline" style="color:var(--danger);border-color:var(--danger)" onclick="cancelUnifiedRes()" data-i18n-key="Cancel Booking"><i class="fa-solid fa-trash"></i> 예약 취소</button>
                    <span id="unifiedFlowActions" style="display:inline-flex;gap:8px;flex-wrap:wrap"></span>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-outline" onclick="closeUnifiedResModal()" data-i18n-key="Close">닫기</button>
                    <button class="btn-primary-sm" onclick="saveUnifiedRes()" data-i18n-key="Save">저장</button>
                </div>
            </div>
        </div>
    </div>
    `;

    function ensureModal() {
        if (!document.getElementById('unifiedResModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            ['unifiedCin', 'unifiedCout'].forEach(id => {
                const input = document.getElementById(id);
                if (input) input.addEventListener('change', () => {
                    if (id === 'unifiedCin' && input.min && input.value && input.value < input.min) input.value = input.min;
                    window.updateUnifiedStayAndRooms();
                });
            });
            ['unifiedAmount', 'unifiedPrepaid'].forEach(id => {
                const input = document.getElementById(id);
                if (input) input.addEventListener('input', syncUnifiedBalance);
            });
        }
        const checkinInput = document.getElementById('unifiedCin');
        if (checkinInput?.tagName === 'INPUT') checkinInput.min = todayInputValue();
    }

    window.syncUnifiedBalance = syncUnifiedBalance;

    async function unifiedGroups() {
        const merged = new Map();
        try {
            JSON.parse(localStorage.getItem('pms_groups') || '[]').forEach(group => {
                if (group?.id) merged.set(group.id, group);
            });
        } catch(e) {}
        try {
            if (window.PmsAPI?.getGroups) {
                const groups = await window.PmsAPI.getGroups();
                if (Array.isArray(groups)) {
                    groups.forEach(group => {
                        if (group?.id) merged.set(group.id, { ...merged.get(group.id), ...group });
                    });
                }
            }
        } catch(e) {
            console.warn('Group lookup failed', e);
        }
        return [...merged.values()];
    }

    async function unifiedGroupName(groupId) {
        if (!groupId) return '';
        const groups = await unifiedGroups();
        const group = groups.find(item => item.id === groupId);
        return group?.name || groupId;
    }

    async function setUnifiedGroupLink(groupId) {
        const input = document.getElementById('unifiedGroupId');
        const notice = document.getElementById('unifiedGroupLinkNotice');
        const text = document.getElementById('unifiedGroupLinkText');
        if (input) input.value = groupId || '';
        if (!notice || !text) return;
        if (!groupId) {
            notice.style.display = 'none';
            text.textContent = '';
            return;
        }
        const label = await unifiedGroupName(groupId);
        notice.style.display = 'block';
        text.textContent = actionLang() === 'en'
            ? `Linked from group management: ${label}`
            : `단체관리에서 연결된 예약: ${label}`;
    }

    function normalizedReservationStatus(value) {
        const key = String(value || '').replace(/[-_\s]/g, '').toLowerCase();
        if (['checkedin', 'inhouse', 'occupied'].includes(key)) return 'checkedin';
        if (key === 'checkout') return 'checkout';
        if (['checkedout', 'departed', 'completed'].includes(key)) return 'completed';
        if (key === 'cancelled' || key === 'canceled') return 'cancelled';
        if (key === 'blocked') return 'blocked';
        if (key === 'pending') return 'pending';
        return key || 'confirmed';
    }

    function parseReservationDate(value) {
        if (!value) return null;
        const text = String(value).trim();
        const match = text.match(/^(\d{1,2})\/(\d{1,2})$/);
        if (match) {
            const base = window.PmsDate?.today ? window.PmsDate.today() : new Date();
            const date = new Date(base.getFullYear(), Number(match[1]) - 1, Number(match[2]));
            date.setHours(0, 0, 0, 0);
            return date;
        }
        const date = new Date(text);
        if (!Number.isNaN(date.getTime())) {
            date.setHours(0, 0, 0, 0);
            return date;
        }
        return null;
    }

    function isCurrentStayWindow(res) {
        const start = parseReservationDate(res?.checkInDate || res?.checkin || res?.cin);
        const end = parseReservationDate(res?.checkOutDate || res?.checkout || res?.cout);
        if (!start || !end) return false;
        const today = todayStart();
        return start <= today && today < end;
    }

    function normalizeRoomValue(value) {
        const text = String(value || '').trim().toLowerCase();
        const digits = (text.match(/\d+/g) || []).join('');
        return {
            text,
            digits,
            strippedDigits: digits.replace(/^0+(?=\d)/, '')
        };
    }

    function sameRoomValue(left, right) {
        const a = normalizeRoomValue(left);
        const b = normalizeRoomValue(right);
        if (!a.text || !b.text) return false;
        if (a.text === b.text) return true;
        return !!(a.digits && b.digits && (a.digits === b.digits || a.strippedDigits === b.strippedDigits));
    }

    function reservationRoomValues(res) {
        return [
            res?.fullRoom,
            res?.roomId,
            res?.room,
            res?.roomNo,
            res?.roomNumber,
            res?.roomLabel
        ];
    }

    function roomMatchesReservation(room, res) {
        const roomValues = [
            room?.id,
            room?.fullRoom,
            room?.roomId,
            room?.number,
            room?.roomNo,
            room?.display,
            room?.displayName,
            room?.roomLabel
        ];
        const resValues = reservationRoomValues(res);
        return roomValues.some(roomValue => resValues.some(resValue => sameRoomValue(roomValue, resValue)));
    }

    function roomForReservation(res) {
        return (window.rooms || []).find(item => roomMatchesReservation(item, res));
    }

    function reservationList() {
        return window.reservations || (typeof reservations !== 'undefined' ? reservations : []);
    }

    function padDatePart(value) {
        return String(value).padStart(2, '0');
    }

    function todayStart() {
        const date = window.PmsDate?.today ? window.PmsDate.today() : new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }

    function todayInputValue() {
        return toDateInputValue(todayStart());
    }

    function toDateInputValue(value, fallback = null) {
        const date = parseReservationDate(value) || fallback;
        if (!date) return '';
        return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
    }

    function toReservationDateText(value) {
        const date = parseReservationDate(value);
        if (!date) return '';
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    function setUnifiedDateValue(id, value, fallback = null) {
        const el = document.getElementById(id);
        if (!el) return;
        const dateValue = toDateInputValue(value, fallback);
        if (el.tagName === 'INPUT') el.value = dateValue;
        else el.textContent = dateValue ? toReservationDateText(dateValue) : '';
    }

    function getUnifiedDateInputValue(id) {
        const el = document.getElementById(id);
        if (!el) return '';
        return el.tagName === 'INPUT' ? el.value : el.textContent;
    }

    function getUnifiedDateRange(options = {}) {
        const checkoutEl = document.getElementById('unifiedCout');
        const checkin = parseReservationDate(getUnifiedDateInputValue('unifiedCin'));
        let checkout = parseReservationDate(getUnifiedDateInputValue('unifiedCout'));
        if (options.autoFix && checkin && (!checkout || checkout <= checkin)) {
            checkout = new Date(checkin);
            checkout.setDate(checkout.getDate() + 1);
            if (checkoutEl?.tagName === 'INPUT') checkoutEl.value = toDateInputValue(checkout);
            else if (checkoutEl) checkoutEl.textContent = toReservationDateText(checkout);
        }
        if (checkoutEl?.tagName === 'INPUT') {
            const minCheckout = checkin ? new Date(checkin) : null;
            if (minCheckout) {
                minCheckout.setDate(minCheckout.getDate() + 1);
                checkoutEl.min = toDateInputValue(minCheckout);
            }
        }
        return { checkin, checkout, valid: !!(checkin && checkout && checkout > checkin) };
    }

    function updateUnifiedNightsLabel() {
        const nightsEl = document.getElementById('unifiedNights');
        const { checkin, checkout, valid } = getUnifiedDateRange({ autoFix: true });
        if (!nightsEl) return 0;
        if (!valid) {
            nightsEl.textContent = '-';
            return 0;
        }
        const nights = Math.max(1, Math.round((checkout - checkin) / 86400000));
        nightsEl.textContent = actionLang() === 'en' ? `${nights}N` : `${nights}박`;
        return nights;
    }

    function reservationBlocksAvailability(res) {
        const status = normalizedReservationStatus(res?.status);
        return !['cancelled', 'completed'].includes(status);
    }

    function reservationOverlapsDates(res, checkin, checkout) {
        if (!reservationBlocksAvailability(res)) return false;
        const start = parseReservationDate(res?.checkInDate || res?.checkin || res?.cin);
        const end = parseReservationDate(res?.checkOutDate || res?.checkout || res?.cout);
        if (!start || !end || !checkin || !checkout) return false;
        return checkin < end && start < checkout;
    }

    function roomMaintenanceBlocked(room) {
        const status = normalizedReservationStatus(room?.frontStatus || room?.status || room?.housekeepingStatus);
        return ['maintenance', 'outofservice', 'oos'].includes(status);
    }

    function roomConflictForDates(room, checkin, checkout, currentRes = null) {
        return reservationList().find(res => {
            if (!res || (currentRes && res.id === currentRes.id)) return false;
            return roomMatchesReservation(room, res) && reservationOverlapsDates(res, checkin, checkout);
        }) || null;
    }

    function roomLabel(room) {
        return room?.id || room?.fullRoom || room?.number || room?.display || room?.roomNo || '';
    }

    function roomTypeDisplay(type) {
        const value = String(type || '').trim();
        return value || 'Standard';
    }

    function refreshUnifiedRoomOptions(preferredValue = '') {
        const roomSelect = document.getElementById('unifiedRoom');
        const help = document.getElementById('unifiedRoomHelp');
        if (!roomSelect) return;
        const id = document.getElementById('unifiedResId')?.value;
        const currentRes = id ? reservationList().find(res => res.id === id) : null;
        const { checkin, checkout, valid } = getUnifiedDateRange({ autoFix: true });
        roomSelect.innerHTML = '';

        if (!valid) {
            roomSelect.disabled = true;
            roomSelect.innerHTML = `<option value="">${actionText('booking.roomDateFirst')}</option>`;
            if (help) help.textContent = actionText('booking.roomDateFirst');
            return;
        }

        roomSelect.disabled = false;
        const available = [];
        const unavailable = [];
        (Array.isArray(window.rooms) ? window.rooms : []).forEach(room => {
            const value = roomLabel(room);
            if (!value) return;
            const conflict = roomConflictForDates(room, checkin, checkout, currentRes);
            const isCurrentRoom = !!(currentRes && roomMatchesReservation(room, currentRes));
            const blocked = !isCurrentRoom && (!!conflict || roomMaintenanceBlocked(room));
            (blocked ? unavailable : available).push({ room, value, conflict: isCurrentRoom ? null : conflict, blocked });
        });

        if (!available.length && !unavailable.length) {
            roomSelect.disabled = true;
            roomSelect.innerHTML = `<option value="">${actionText('booking.noRooms')}</option>`;
            if (help) help.textContent = actionText('booking.noRooms');
            return;
        }

        const appendOption = ({ room, value, conflict, blocked }) => {
            const opt = document.createElement('option');
            opt.value = value;
            opt.disabled = blocked;
            const suffix = conflict ? ` - ${actionText('booking.conflictSuffix')}` : '';
            opt.textContent = `${value} (${roomTypeDisplay(room.type)})${suffix}`;
            roomSelect.appendChild(opt);
        };
        available.forEach(appendOption);
        unavailable.forEach(appendOption);

        const enabledValues = Array.from(roomSelect.options).filter(option => !option.disabled).map(option => option.value);
        const preferred = preferredValue && enabledValues.includes(preferredValue) ? preferredValue : '';
        roomSelect.value = preferred || enabledValues[0] || '';
        if (!enabledValues.length) roomSelect.disabled = true;
        if (help) {
            help.textContent = enabledValues.length
                ? `${enabledValues.length}${actionLang() === 'en' ? ' available rooms' : '개 객실 예약 가능'}`
                : actionText('booking.noRooms');
        }
    }

    window.updateUnifiedStayAndRooms = function(preferredValue = '') {
        updateUnifiedNightsLabel();
        refreshUnifiedRoomOptions(preferredValue || document.getElementById('unifiedRoom')?.value || '');
    };

    function isRoomInHouse(res) {
        const room = roomForReservation(res);
        const roomStatus = normalizedReservationStatus(room?.frontStatus || room?.status || room?.housekeepingStatus);
        return roomStatus === 'checkedin';
    }

    function normalizedRoomOpsValue(value) {
        return String(value || '').replace(/[-_\s]/g, '').toLowerCase();
    }

    function roomOpsStatuses(room) {
        return [room?.frontStatus, room?.status, room?.housekeepingStatus]
            .map(normalizedRoomOpsValue)
            .filter(Boolean);
    }

    function checkinBlockReasonForRoom(room) {
        if (!room) return actionText('flow.noRoom');
        const statuses = roomOpsStatuses(room);
        if (statuses.some(status => ['oos', 'outofservice', 'outoforder', 'maintenance'].includes(status))) return actionText('flow.maintenanceRoom');
        if (statuses.some(status => ['occupied', 'inhouse', 'checkedin'].includes(status))) return actionText('flow.occupiedRoom');
        return '';
    }

    function checkinWarningForRoom(room) {
        const statuses = roomOpsStatuses(room);
        return statuses.some(status => ['dirty', 'vacantdirty', 'needscleaning'].includes(status))
            ? actionText('flow.dirtyRoomWarning')
            : '';
    }

    function checkoutDateIsTodayOrPast(res) {
        const end = parseReservationDate(res?.checkOutDate || res?.checkout || res?.cout);
        if (!end) return false;
        const today = todayStart();
        return end <= today;
    }

    function effectiveReservationStatus(res) {
        if (!res) return 'confirmed';
        let status = normalizedReservationStatus(res.status || res.frontStatus || res.roomStatus);
        if (['confirmed', 'pending'].includes(status) && isRoomInHouse(res) && isCurrentStayWindow(res)) status = 'checkedin';
        if (status === 'checkedin' && checkoutDateIsTodayOrPast(res)) return 'checkout';
        return status;
    }

    function isReservationReadOnly(res) {
        if (!res) return false;
        const status = effectiveReservationStatus(res);
        if (['checkedin', 'checkout', 'completed', 'cancelled'].includes(status)) return true;
        return isRoomInHouse(res) && isCurrentStayWindow(res);
    }

    function guestNameForReservation(res) {
        return res?.roomingGuestName || res?.guestName || res?.guest || '-';
    }

    function setUnifiedReservationReadonly(locked, res = null) {
        const modal = document.getElementById('unifiedResModal');
        const guestSection = document.getElementById('unifiedGuestSection');
        if (!modal) return;
        modal.dataset.readonlyReservation = locked ? 'true' : 'false';
        const isBlock = !!(res && (res.isGroupPlaceholder || normalizedReservationStatus(res.status) === 'blocked'));

        let notice = document.getElementById('unifiedReadonlyNotice');
        if (!notice && guestSection) {
            notice = document.createElement('div');
            notice.id = 'unifiedReadonlyNotice';
            notice.style.cssText = 'display:none;margin-bottom:20px;background:#f8fafc;border:1px solid var(--border2);border-radius:8px;padding:14px;font-size:.82rem;color:var(--txt2);font-weight:700;line-height:1.55';
            guestSection.parentElement.insertBefore(notice, guestSection);
        }

        if (notice) {
            notice.style.display = locked ? 'block' : 'none';
            if (locked) {
                const roomLabel = res?.roomLabel || res?.fullRoom || res?.room || '-';
                notice.innerHTML = `
                            <div style="display:flex;gap:8px;align-items:flex-start">
                        <i class="fa-solid fa-lock" style="color:var(--primary);margin-top:3px"></i>
                        <div>
                            <div style="color:var(--txt);font-size:.9rem;margin-bottom:4px">체크인 이후 예약은 운영 정정만 가능합니다.</div>
                            <div>대표투숙객과 투숙 날짜는 잠기며, 객실 이동·동반 투숙객·요금·선결제 정정은 저장 시 감사 로그에 기록됩니다.</div>
                            <div style="margin-top:8px;color:var(--txt)">투숙객: ${guestNameForReservation(res)} · 객실: ${roomLabel}</div>
                        </div>
                    </div>`;
            }
        }

        if (guestSection) guestSection.style.display = isBlock ? 'none' : 'block';
        const blockNotice = document.getElementById('unifiedBlockNotice');
        if (blockNotice) blockNotice.style.display = (!locked && isBlock) ? 'block' : 'none';
        ['unifiedCin', 'unifiedCout', 'unifiedChannel'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.disabled = locked;
            if (el.tagName === 'SELECT' || el.tagName === 'INPUT') el.style.background = locked ? '#f1f5f9' : '#fff';
        });
        ['unifiedRoom', 'unifiedCompanions', 'unifiedAmount', 'unifiedPrepaid'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.disabled = false;
            if (el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.style.background = '#fff';
        });

        const saveBtn = modal.querySelector('button[onclick="saveUnifiedRes()"]');
        if (saveBtn) saveBtn.style.display = 'inline-flex';
        const cancelBtn = document.getElementById('unifiedBtnCancel');
        if (locked && cancelBtn) cancelBtn.style.display = 'none';
    }

    function renderUnifiedFlowActions(res = null) {
        const box = document.getElementById('unifiedFlowActions');
        if (!box) return;
        box.innerHTML = '';
        if (!res || res.isGroupPlaceholder || normalizedReservationStatus(res.status) === 'blocked') return;
        const status = effectiveReservationStatus(res);
        const locked = isReservationReadOnly(res);
        if (status === 'checkedin' || status === 'checkout') {
            box.innerHTML = `<button type="button" class="btn-primary-sm" style="background:#EF4444" onclick="processUnifiedReservationFlow('checkout')"><i class="fa-solid fa-right-from-bracket"></i> 체크아웃 처리</button>`;
        } else if (!locked && (status === 'confirmed' || status === 'pending')) {
            box.innerHTML = `<button type="button" class="btn-primary-sm" onclick="processUnifiedReservationFlow('checkin')"><i class="fa-solid fa-right-to-bracket"></i> 체크인 처리</button>`;
        }
    }

    async function persistUnifiedReservation(res) {
        const allRes = window.reservations || (typeof reservations !== 'undefined' ? reservations : null);
        if (allRes) localStorage.setItem('pms_reservations', JSON.stringify(allRes));
        try {
            if (window.PmsMockApi && res?.id) {
                await window.PmsMockApi.request('PATCH', `/reservations/${encodeURIComponent(res.id)}`, { body: res });
            }
        } catch(e) {
            console.warn('Mock reservation flow save failed', e);
        }
    }

    async function persistUnifiedRoom(room) {
        if (!room) return;
        localStorage.setItem('pms_rooms', JSON.stringify(window.rooms || []));
        try {
            const roomId = room.roomId || room.fullRoom || room.id;
            if (window.PmsMockApi && roomId) {
                await window.PmsMockApi.request('PATCH', `/rooms/${encodeURIComponent(roomId)}`, { body: room });
            }
        } catch(e) {
            console.warn('Mock room flow save failed', e);
        }
    }

    async function syncUnifiedHousekeeping(room, status, res) {
        if (!room || !window.PmsAPI?.syncRoomStatusToTask) return;
        const roomId = room.roomId || room.fullRoom || room.id || res?.room;
        try {
            await window.PmsAPI.syncRoomStatusToTask(roomId, status, {
                reservationId: res?.id,
                guestName: guestNameForReservation(res)
            });
        } catch(e) {
            console.warn('Housekeeping sync failed', e);
        }
    }

    window.processUnifiedReservationFlow = async function(action) {
        const id = document.getElementById('unifiedResId')?.value;
        const allRes = window.reservations || (typeof reservations !== 'undefined' ? reservations : null);
        const res = allRes?.find(item => item.id === id);
        if (!res) return;
        if ((!window.rooms || !window.rooms.length) && window.PmsAPI?.getAllRooms) {
            try {
                window.rooms = await window.PmsAPI.getAllRooms();
            } catch(e) {
                console.warn('Rooms load for reservation flow guard failed', e);
            }
        }
        const currentStatus = effectiveReservationStatus(res);
        if (action === 'checkin' && ['checkedin', 'checkout', 'completed', 'cancelled'].includes(currentStatus)) {
            const message = actionText('flow.alreadyCheckedIn');
            if (window.showToast) window.showToast(message, 'error');
            else alert(message);
            setUnifiedReservationReadonly(isReservationReadOnly(res), res);
            renderUnifiedFlowActions(res);
            return;
        }
        if (action === 'checkout' && !['checkedin', 'checkout'].includes(currentStatus)) {
            const message = actionText('flow.checkoutOnlyInhouse');
            if (window.showToast) window.showToast(message, 'error');
            else alert(message);
            renderUnifiedFlowActions(res);
            return;
        }
        const room = roomForReservation(res);
        let checkinWarning = '';
        if (action === 'checkin') {
            const blockReason = checkinBlockReasonForRoom(room);
            if (blockReason) {
                if (window.showToast) window.showToast(blockReason, 'error');
                else alert(blockReason);
                return;
            }
            checkinWarning = checkinWarningForRoom(room);
        }

        const label = action === 'checkin' ? actionText('action.checkin') : actionText('action.checkout');
        let confirmMessage = actionText('flow.confirm', { name: guestNameForReservation(res), action: label });
        const confirmOptions = {};
        if (checkinWarning) {
            confirmMessage = `${checkinWarning}\n\n${confirmMessage}`;
            confirmOptions.title = actionText('flow.dirtyRoomTitle');
            confirmOptions.okText = actionText('flow.continueCheckin');
        }
        const confirmed = window.showConfirm
            ? await window.showConfirm(confirmMessage, confirmOptions)
            : confirm(confirmMessage);
        if (!confirmed) return;

        if (action === 'checkin') {
            res.status = 'checkedin';
            if (room) {
                room.status = 'occupied';
                room.frontStatus = 'in-house';
                room.housekeepingStatus = checkinWarning ? 'dirty' : 'occupied';
                room.guest = guestNameForReservation(res);
            }
        } else {
            res.status = 'completed';
            if (room) {
                room.status = 'vacant-dirty';
                room.frontStatus = 'vacant';
                room.housekeepingStatus = 'dirty';
                room.guest = '';
            }
        }

        await persistUnifiedReservation(res);
        await persistUnifiedRoom(room);
        if (action === 'checkout') await syncUnifiedHousekeeping(room, 'vacant-dirty', res);
        if (window.showToast) {
            const toastKey = checkinWarning ? 'flow.completedRoomNotReady' : 'flow.completed';
            window.showToast(actionText(toastKey, { action: label }), 'success');
        }
        if (typeof window.buildTimeline === 'function') window.buildTimeline();
        if (typeof window.buildMobileView === 'function') window.buildMobileView();
        if (typeof window.renderTable === 'function') window.renderTable();
        if (typeof window.renderResTable === 'function') window.renderResTable();
        window.openUnifiedResModal(res.id);
    };
    
    window.toggleUnifiedGroupSelect = function() {
        setUnifiedGroupLink(document.getElementById('unifiedGroupId')?.value || '');
    };

    window.openUnifiedResModal = async function(resId = null, prefillGroupId = null) {
        const prefill = (resId && typeof resId === 'object') ? resId : null;
        if (prefill) {
            prefillGroupId = prefill.groupId || prefillGroupId;
            resId = null;
        }
        ensureModal();
        const allRes = window.reservations || (typeof reservations !== 'undefined' ? reservations : null);
        if (!allRes) {
            alert('Error: reservations variable not found!');
            return;
        }
        setUnifiedReservationReadonly(false);

        // Initialize Guest Search Widget
        if (!window._editGuestWidget && typeof initGuestSearch === 'function') {
            window._editGuestWidget = initGuestSearch('Edit');
        }

        const currentRes = resId ? allRes.find(r => r.id === resId) : null;
        const isEditingBlock = !!(currentRes && (normalizedReservationStatus(currentRes.status) === 'blocked' || currentRes.isGroupPlaceholder));

        // Populate room select
        if (!window.rooms || window.rooms.length === 0) {
            if (typeof window.PmsAPI !== 'undefined' && window.PmsAPI.getAllRooms) {
                window.rooms = await window.PmsAPI.getAllRooms();
            }
        }
        
        const roomSelect = document.getElementById('unifiedRoom');
        roomSelect.innerHTML = '';
        if (window.rooms && window.rooms.length > 0) {
            const bldgs = [...new Set(window.rooms.map(r => r.building || '미지정'))].sort();
            if (bldgs.length > 1 || (bldgs.length === 1 && bldgs[0] !== 'Main' && bldgs[0] !== '미지정')) {
                bldgs.forEach(b => {
                    const group = document.createElement('optgroup');
                    group.label = b;
                    window.rooms.filter(r => (r.building || '미지정') === b).forEach(r => {
                        const opt = document.createElement('option');
                        opt.value = r.id;
                        const blocked = !prefillGroupId && allRes.some(res => (res.room === r.id || res.fullRoom === r.id) && res.status === 'blocked' && (!currentRes || res.id !== currentRes.id));
                        const roomState = normalizedReservationStatus(r.frontStatus || r.status || r.housekeepingStatus);
                        const occupied = !currentRes && roomState === 'checkedin';
                        opt.disabled = blocked || occupied;
                        opt.textContent = `${r.id} (${roomTypeDisplay(r.type)})${blocked ? ' · 단체 블록' : occupied ? ' · 투숙 중' : ''}`;
                        group.appendChild(opt);
                    });
                    roomSelect.appendChild(group);
                });
            } else {
                window.rooms.forEach(r => {
                    const opt = document.createElement('option');
                    opt.value = r.id;
                    const blocked = !prefillGroupId && allRes.some(res => (res.room === r.id || res.fullRoom === r.id) && res.status === 'blocked' && (!currentRes || res.id !== currentRes.id));
                    const roomState = normalizedReservationStatus(r.frontStatus || r.status || r.housekeepingStatus);
                    const occupied = !currentRes && roomState === 'checkedin';
                    opt.disabled = blocked || occupied;
                    opt.textContent = `${r.id} (${roomTypeDisplay(r.type)})${blocked ? ' · 단체 블록' : occupied ? ' · 투숙 중' : ''}`;
                    roomSelect.appendChild(opt);
                });
            }
        }
        if (!resId) {
            // NEW BOOKING MODE
            const cancelBtn = document.getElementById('unifiedBtnCancel');
            if (cancelBtn) cancelBtn.style.display = 'none';
            await renderUnifiedGuestPrivacy(null);
            document.getElementById('unifiedModalTitle').textContent = actionText('booking.newTitle');
            document.getElementById('unifiedResId').value = '';
            document.getElementById('unifiedStatus').value = 'confirmed';
            const channelEl = document.getElementById('unifiedChannel');
            if (channelEl) channelEl.value = 'Walk-in';
            await setUnifiedGroupLink(prefillGroupId || '');
            
            // Set default dates to today and tomorrow
            const today = todayStart();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            setUnifiedDateValue('unifiedCin', prefill?.checkin || prefill?.cin || prefill?.checkInDate, today);
            setUnifiedDateValue('unifiedCout', prefill?.checkout || prefill?.cout || prefill?.checkOutDate, tomorrow);
            window.updateUnifiedStayAndRooms(prefill?.room || prefill?.fullRoom || '');
            if (window._editGuestWidget) {
                window._editGuestWidget.reset();
            }
            setUnifiedGuestRoster(await rosterGuestsForReservation(prefill || null));
            setUnifiedFinanceValues(null, {
                amount: Number(prefill?.amount || prefill?.totalAmount?.amount || 0),
                prepaid: Number(prefill?.prepaidAmount || prefill?.paymentPlan?.prepaidAmount || 0)
            });
            renderUnifiedFlowActions(null);
        } else {
            // EDIT BOOKING MODE
            const cancelBtn = document.getElementById('unifiedBtnCancel');
            if (cancelBtn) cancelBtn.style.display = 'inline-flex';
            const res = allRes.find(r => r.id === resId);
            if (!res) {
                alert('Error: reservation not found for ID ' + resId);
                return;
            }
            const effectiveStatus = effectiveReservationStatus(res);
            const isReadonlyReservation = isReservationReadOnly(res);
            
            const linkedGroupId = res.groupId || '';
            const isB2B = !!linkedGroupId;
            const isVip = res.isVip || (res.vip && res.vip.toLowerCase().includes('vip'));
            const groupBadgeText = actionLang() === 'en' ? 'Group linked' : '단체 연결';
            const b2bBadge = isB2B ? `<span style="background:#111827;color:#fff;font-size:0.65rem;padding:2px 6px;border-radius:4px;margin-left:8px;font-weight:600;vertical-align:middle;letter-spacing:0.5px"><i class="fa-solid fa-building"></i> ${groupBadgeText}</span>` : '';
            const vipText = actionLang() === 'en' ? 'VIP' : '우수 고객';
            const vipBadge = isVip ? `<span style="background:rgba(245,158,11,.15);color:#D97706;font-size:0.65rem;padding:2px 6px;border-radius:4px;margin-left:8px;font-weight:700;vertical-align:middle;"><i class="fa-solid fa-crown"></i> ${vipText}</span>` : '';
            
            document.getElementById('unifiedModalTitle').innerHTML = `${res.id} ${b2bBadge} ${vipBadge}`;
            document.getElementById('unifiedResId').value = res.id;
            
            if (window.rooms && window.rooms.length === 0) {
                const opt = document.createElement('option');
                opt.value = res.room;
                opt.textContent = res.room;
                roomSelect.appendChild(opt);
            }
            const matchedRoom = (window.rooms || []).find(r => r.id === res.room || r.fullRoom === res.room || r.number === res.room || r.display === res.room || r.id === res.fullRoom);
            const targetRoomValue = matchedRoom ? matchedRoom.id : res.room;
            if (targetRoomValue && !Array.from(roomSelect.options).some(o => o.value === targetRoomValue)) {
                const opt = document.createElement('option');
                opt.value = targetRoomValue;
                opt.textContent = `${targetRoomValue} (${roomTypeDisplay(res.type || matchedRoom?.type)})`;
                roomSelect.appendChild(opt);
            }
            roomSelect.value = targetRoomValue;

            const guestSection = document.getElementById('unifiedGuestSection');
            if (guestSection) {
                guestSection.style.display = isEditingBlock ? 'none' : 'block';
                let blockNotice = document.getElementById('unifiedBlockNotice');
                if (!blockNotice) {
                    blockNotice = document.createElement('div');
                    blockNotice.id = 'unifiedBlockNotice';
                    blockNotice.style.cssText = 'margin-bottom:20px;background:#f8fafc;border:1px solid var(--border2);border-radius:8px;padding:14px;font-size:.82rem;color:var(--txt2);font-weight:700';
                    guestSection.parentElement.insertBefore(blockNotice, guestSection);
                }
                blockNotice.style.display = (isEditingBlock && !isReadonlyReservation) ? 'block' : 'none';
                blockNotice.innerHTML = `<i class="fa-solid fa-building" style="color:var(--primary);margin-right:6px"></i> 단체 블록 상태입니다. 아직 개별 투숙객이 배정되지 않았으며, 투숙객은 단체 상세의 Rooming List에서 등록하거나 상태를 예약 확정으로 전환할 때 연결합니다.`;
            }

            if (!isEditingBlock && window._editGuestWidget) {
                window._editGuestWidget.reset();
                const existingGuest = await guestForUnifiedReservation(res);
                if (existingGuest) {
                    await window._editGuestWidget.select(existingGuest.id);
                } else {
                    window._editGuestWidget.showNewForm();
                    const nameInput = document.getElementById('nrGuestEdit');
                    if (nameInput) nameInput.value = guestNameForReservation(res);
                }
            } else if (window._editGuestWidget) {
                window._editGuestWidget.reset();
            }
        
            document.getElementById('unifiedStatus').value = isEditingBlock ? 'blocked' : (isReadonlyReservation ? effectiveStatus : normalizedReservationStatus(res.status));
            
            await setUnifiedGroupLink(linkedGroupId);
            const channelEl = document.getElementById('unifiedChannel');
            if (channelEl) channelEl.value = res.channel || 'Walk-in';

            setUnifiedDateValue('unifiedCin', res.checkInDate || res.checkin || res.cin);
            setUnifiedDateValue('unifiedCout', res.checkOutDate || res.checkout || res.cout);
            window.updateUnifiedStayAndRooms(targetRoomValue);
            setUnifiedGuestRoster(isEditingBlock ? [] : await rosterGuestsForReservation(res));
            setUnifiedFinanceValues(res);
            setUnifiedReservationReadonly(isReadonlyReservation, res);
            renderUnifiedFlowActions(res);
            await renderUnifiedGuestPrivacy(res);
        }

        // Hide other modals if they are open
        ['resModal', 'resDetailModal', 'editResModal'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.remove('active');
        });
        
        const unifiedModal = document.getElementById('unifiedResModal');
        if (unifiedModal) unifiedModal.classList.add('active');
    };

    window.closeUnifiedResModal = function() {
        const unifiedModal = document.getElementById('unifiedResModal');
        if (unifiedModal) unifiedModal.classList.remove('active');
    };

    window.saveUnifiedRes = async function() {
        const id = document.getElementById('unifiedResId').value;
        const allRes = window.reservations || (typeof reservations !== 'undefined' ? reservations : null);
        if (!allRes) return;
        
        let guest = '';
        const currentRes = id ? allRes.find(r => r.id === id) : null;
        const operationalEdit = !!(currentRes && isReservationReadOnly(currentRes));
        const isBlockSave = currentRes && (normalizedReservationStatus(currentRes.status) === 'blocked' || currentRes.isGroupPlaceholder) && document.getElementById('unifiedStatus').value === 'blocked';
        if (!isBlockSave) {
            let primaryEntry = getUnifiedPrimaryGuestEntry();
            if (!primaryEntry) {
                const candidate = getUnifiedSelectedGuestCandidate();
                if (candidate && compactValue(candidate.name)) {
                    upsertUnifiedRosterGuest(candidate, 'primary');
                    primaryEntry = getUnifiedPrimaryGuestEntry();
                }
            }
            if (!primaryEntry && currentRes) {
                upsertUnifiedRosterGuest({
                    guestId: currentRes.guestId || currentRes.roomingGuestId,
                    name: guestNameForReservation(currentRes),
                    phone: currentRes.guestPhone || currentRes.phone || currentRes.mobile,
                    email: currentRes.guestEmail || currentRes.email
                }, 'primary');
                primaryEntry = getUnifiedPrimaryGuestEntry();
            }
            guest = compactValue(primaryEntry?.name);
        }
        if (!isBlockSave && (!guest || !guest.trim())) {
            alert(actionText('guest.required'));
            return;
        }
        const dateRange = getUnifiedDateRange({ autoFix: false });
        if (!dateRange.checkin || !dateRange.checkout) {
            alert(actionText('booking.dateRequired'));
            return;
        }
        if (!currentRes && dateRange.checkin < todayStart()) {
            alert(actionText('booking.pastCheckin'));
            return;
        }
        if (!dateRange.valid) {
            alert(actionText('booking.invalidDates'));
            return;
        }
        updateUnifiedNightsLabel();
        refreshUnifiedRoomOptions(document.getElementById('unifiedRoom')?.value || '');
        const room = document.getElementById('unifiedRoom').value;
        const roomSelect = document.getElementById('unifiedRoom');
        const selectedOption = roomSelect?.selectedOptions?.[0];
        if (!room || roomSelect?.disabled || selectedOption?.disabled) {
            alert(actionText('booking.roomRequired'));
            return;
        }
        const selectedRoom = (window.rooms || []).find(r => r.id === room || r.fullRoom === room || r.number === room || r.display === room || roomLabel(r) === room);
        const selectedIsCurrentRoom = !!(currentRes && selectedRoom && roomMatchesReservation(selectedRoom, currentRes));
        if (!selectedIsCurrentRoom && roomConflictForDates(selectedRoom || { id: room }, dateRange.checkin, dateRange.checkout, currentRes)) {
            alert(actionText('booking.roomUnavailable'));
            return;
        }
        const status = id
            ? (operationalEdit ? normalizedReservationStatus(currentRes?.status) : (document.getElementById('unifiedStatus')?.value || normalizedReservationStatus(currentRes?.status)))
            : 'confirmed';
        let channel = document.getElementById('unifiedChannel')?.value || 'Walk-in';
        const groupId = document.getElementById('unifiedGroupId')?.value || '';
        const isB2B = !!groupId;
        const linkedGroupName = isB2B ? (await unifiedGroupName(groupId) || currentRes?.groupName || '') : '';
        let savedRes = null;
        const cinText = toReservationDateText(getUnifiedDateInputValue('unifiedCin'));
        const coutText = toReservationDateText(getUnifiedDateInputValue('unifiedCout'));
        const cinIso = getUnifiedDateInputValue('unifiedCin');
        const coutIso = getUnifiedDateInputValue('unifiedCout');
        const nights = updateUnifiedNightsLabel() || 1;
        const currency = reservationCurrency(currentRes);
        const totalAmount = parseMoneyInput(document.getElementById('unifiedAmount')?.value);
        const prepaidAmount = Math.min(parseMoneyInput(document.getElementById('unifiedPrepaid')?.value), totalAmount);
        const balanceDue = Math.max(totalAmount - prepaidAmount, 0);
        const nightlyRate = nights ? Math.round((totalAmount / nights) * 100) / 100 : totalAmount;
        const guestPayload = !isBlockSave
            ? unifiedRosterPayload(guest)
            : { guest, guestId: '', companionGuestNames: [], companionGuestIds: [], roomingGuestNames: [], roomingGuests: [], companions: [] };
        guest = guestPayload.guest || guest;
        const companionGuestNames = guestPayload.companionGuestNames;
        
        if (isB2B) channel = linkedGroupName || channel || 'Group';
        
        if (!id) {
            // NEW BOOKING MODE
            const newId = 'RSV-' + (window.PmsDate?.nowIso ? window.PmsDate.nowIso() : new Date().toISOString()).replace(/\D/g,'').slice(0,14) + '-' + Math.floor(Math.random()*1000);
            const newRes = {
                id: newId,
                guest: guest,
                guestName: guest,
                roomingGuestName: guest,
                guestId: guestPayload.guestId || '',
                roomingGuestId: guestPayload.guestId || '',
                room: room,
                status: status,
                channel: channel,
                isB2B: isB2B,
                groupId: groupId,
                groupName: linkedGroupName,
                cin: cinText,
                cout: coutText,
                checkin: cinIso,
                checkout: coutIso,
                checkInDate: cinIso,
                checkOutDate: coutIso,
                nights: nights,
                len: nights,

                type: selectedRoom?.type || currentRes?.type || 'Standard',
                fullRoom: selectedRoom?.fullRoom || selectedRoom?.roomId || selectedRoom?.id || room,
                roomId: selectedRoom?.roomId || selectedRoom?.fullRoom || room,
                roomNo: selectedRoom?.number || selectedRoom?.display || room,
                companionGuestNames,
                companionGuestIds: guestPayload.companionGuestIds,
                roomingGuestNames: guestPayload.roomingGuestNames,
                roomingGuests: guestPayload.roomingGuests,
                companions: guestPayload.companions,
                amount: totalAmount,
                rate: { amount: nightlyRate, currency },
                totalAmount: { amount: totalAmount, currency },
                prepaidAmount,
                balanceDue,
                paymentPlan: {
                    totalAmount,
                    prepaidAmount,
                    balanceDue,
                    currency,
                    settlementBasis: 'reservation-room-total'
                },
                roomMoveHistory: [],
                color: '#3B82F6',
                initials: guest.substring(0,2).toUpperCase(),
                vip: 'Standard'
            };
            allRes.unshift(newRes);
            savedRes = newRes;
            if (window.showToast) window.showToast(actionText('booking.created'), 'success');
        } else {
            // EDIT BOOKING MODE
            const res = allRes.find(r => r.id === id);
            if (res) {
                const beforeRoom = res.room;
                const beforeFullRoom = res.fullRoom || res.roomId || res.room;
                const beforeAmount = reservationAmountValue(res);
                const beforePrepaid = reservationPrepaidValue(res);
                const beforeStatus = effectiveReservationStatus(res);
                const beforeGuest = guestNameForReservation(res);
                const beforeGuestId = compactValue(res.guestId || res.roomingGuestId);
                const beforeCompanionNames = companionNamesForReservation(res);
                if (!isBlockSave) {
                    const nextGuestId = guestPayload.guestId || (beforeGuest === guest ? beforeGuestId : '');
                    res.guest = guest;
                    res.guestName = guest;
                    res.roomingGuestName = guest;
                    res.guestId = nextGuestId;
                    res.roomingGuestId = nextGuestId;
                    if (guest.trim()) res.initials = guest.split(' ').map(n => n[0]).join('');
                    if (res.isGroupPlaceholder && status !== 'blocked' && guest.trim()) {
                        res.isGroupPlaceholder = false;
                        res.status = 'confirmed';
                    }
                }
                res.room = room;
                res.status = status;
                res.channel = channel;
                res.isB2B = isB2B;
                res.groupId = groupId;
                res.groupName = linkedGroupName;
                res.cin = cinText;
                res.cout = coutText;
                res.checkin = cinIso;
                res.checkout = coutIso;
                res.checkInDate = cinIso;
                res.checkOutDate = coutIso;
                res.nights = nights;
                res.len = nights;
                res.type = selectedRoom?.type || res.type || 'Standard';
                res.fullRoom = selectedRoom?.fullRoom || selectedRoom?.roomId || selectedRoom?.id || room;
                res.roomId = selectedRoom?.roomId || selectedRoom?.fullRoom || res.roomId || room;
                res.roomNo = selectedRoom?.number || selectedRoom?.display || room;
                res.companionGuestNames = companionGuestNames;
                res.companionGuestIds = guestPayload.companionGuestIds;
                res.roomingGuestNames = guestPayload.roomingGuestNames;
                res.roomingGuests = guestPayload.roomingGuests;
                res.companions = guestPayload.companions;
                res.amount = totalAmount;
                res.rate = { amount: nightlyRate, currency };
                res.totalAmount = { amount: totalAmount, currency };
                res.prepaidAmount = prepaidAmount;
                res.balanceDue = balanceDue;
                res.paymentPlan = {
                    ...(res.paymentPlan || {}),
                    totalAmount,
                    prepaidAmount,
                    balanceDue,
                    currency,
                    settlementBasis: 'reservation-room-total'
                };
                const roomChanged = !sameRoomValue(beforeRoom, room) && !sameRoomValue(beforeFullRoom, res.fullRoom);
                const isPostCheckinEdit = ['checkedin', 'checkout'].includes(beforeStatus);
                const guestChanged = beforeGuest !== guestNameForReservation(res) || beforeGuestId !== compactValue(res.guestId || res.roomingGuestId);
                const companionsChanged = beforeCompanionNames.join('|') !== companionGuestNames.join('|');
                if (isPostCheckinEdit && (guestChanged || companionsChanged)) {
                    logReservationAudit('reservation.guests.adjust', {
                        reservationId: res.id,
                        beforeGuest,
                        afterGuest: guestNameForReservation(res),
                        beforeCompanions: beforeCompanionNames,
                        afterCompanions: companionGuestNames,
                        fields: ['reservationId', 'guestName', 'companionGuestNames']
                    });
                }
                if (roomChanged) {
                    const move = {
                        fromRoom: beforeRoom || beforeFullRoom || '',
                        toRoom: room,
                        fromFullRoom: beforeFullRoom || beforeRoom || '',
                        toFullRoom: res.fullRoom || room,
                        changedAt: window.PmsDate?.nowIso ? window.PmsDate.nowIso() : new Date().toISOString(),
                        reason: 'frontdesk-room-move',
                        affectsSettlement: true
                    };
                    res.roomMoveHistory = [...(Array.isArray(res.roomMoveHistory) ? res.roomMoveHistory : []), move];
                    res.settlementAdjustments = [...(Array.isArray(res.settlementAdjustments) ? res.settlementAdjustments : []), {
                        type: 'room-move',
                        createdAt: move.changedAt,
                        description: `${move.fromRoom} → ${move.toRoom} 객실 이동`,
                        affectsSettlement: true
                    }];
                    if (isPostCheckinEdit) {
                        logReservationAudit('reservation.room.move', {
                            reservationId: res.id,
                            guestName: guestNameForReservation(res),
                            fromRoom: move.fromRoom,
                            toRoom: move.toRoom,
                            fields: ['room', 'stayDates']
                        });
                    }
                }
                if (isPostCheckinEdit && beforeAmount !== totalAmount) {
                    logReservationAudit('reservation.amount.adjust', {
                        reservationId: res.id,
                        guestName: guestNameForReservation(res),
                        beforeAmount,
                        afterAmount: totalAmount,
                        currency,
                        fields: ['reservationId', 'guestName', 'room', 'amount']
                    });
                }
                if (isPostCheckinEdit && beforePrepaid !== prepaidAmount) {
                    logReservationAudit('reservation.prepayment.adjust', {
                        reservationId: res.id,
                        guestName: guestNameForReservation(res),
                        beforePrepaid,
                        afterPrepaid: prepaidAmount,
                        balanceDue,
                        currency,
                        fields: ['reservationId', 'guestName', 'amount']
                    });
                }
                if (roomChanged && isPostCheckinEdit && Array.isArray(window.rooms)) {
                    const oldRoom = window.rooms.find(item => roomMatchesReservation(item, { room: beforeRoom, fullRoom: beforeFullRoom }));
                    if (oldRoom) {
                        oldRoom.status = 'vacant-dirty';
                        oldRoom.frontStatus = 'vacant';
                        oldRoom.housekeepingStatus = 'dirty';
                        oldRoom.guest = '';
                    }
                    if (selectedRoom) {
                        selectedRoom.status = 'occupied';
                        selectedRoom.frontStatus = 'in-house';
                        selectedRoom.housekeepingStatus = 'occupied';
                        selectedRoom.guest = guestNameForReservation(res);
                    }
                    localStorage.setItem('pms_rooms', JSON.stringify(window.rooms));
                    if (oldRoom) await persistUnifiedRoom(oldRoom);
                    if (selectedRoom) await persistUnifiedRoom(selectedRoom);
                }
                savedRes = res;
            }
            if (window.showToast) window.showToast(actionText('booking.updated'), 'success');
        }
        
        localStorage.setItem('pms_reservations', JSON.stringify(allRes));
        try {
            if (window.PmsMockApi && savedRes) {
                await window.PmsMockApi.request(id ? 'PATCH' : 'POST', id ? `/reservations/${encodeURIComponent(id)}` : '/reservations', { body: savedRes });
            }
        } catch(e) {
            console.warn('Mock reservation save failed', e);
        }
        if (typeof window.syncGroupData === 'function') window.syncGroupData();
        
        closeUnifiedResModal();
        
        // 화면 재랜더링
        if (typeof window.renderTable === 'function') window.renderTable();
        if (typeof window.buildTimeline === 'function') window.buildTimeline();
        if (typeof window.renderResTable === 'function') window.renderResTable();
    };

    window.cancelUnifiedRes = async function() {
        const resId = document.getElementById('unifiedResId').value;
        window.cancelResAction(resId);
    };

    window.cancelResAction = async function(resId) {
        const allRes = window.reservations || (typeof reservations !== 'undefined' ? reservations : null);
        if (!allRes) return;
        const res = allRes.find(r => r.id === resId);
        if (!res) return;
        if ((!window.rooms || !window.rooms.length) && window.PmsAPI?.getAllRooms) {
            try {
                window.rooms = await window.PmsAPI.getAllRooms();
            } catch(e) {
                console.warn('Rooms load for cancellation guard failed', e);
            }
        }
        const currentStatus = effectiveReservationStatus(res);
        if (['checkedin', 'checkout', 'completed'].includes(currentStatus)) {
            const message = actionText('cancel.notAllowed');
            if (window.showToast) window.showToast(message, 'error');
            else alert(message);
            return;
        }
        
        const cancelMessage = actionText('cancel.confirm', { name: res.guest || guestNameForReservation(res) });
        const confirmed = window.showConfirm ? await window.showConfirm(cancelMessage) : confirm(cancelMessage);
        if (confirmed) {
            res.status = 'cancelled';
            localStorage.setItem('pms_reservations', JSON.stringify(allRes));
            try {
                if (window.PmsMockApi) await window.PmsMockApi.request('PATCH', `/reservations/${encodeURIComponent(resId)}`, { body: { status: 'cancelled' } });
            } catch(e) {
                console.warn('Mock reservation cancel failed', e);
            }
            if (typeof window.syncGroupData === 'function') window.syncGroupData();
            
            if (window.showToast) window.showToast(actionText('cancel.done'), 'success');
            
            closeUnifiedResModal();

            if (typeof window.renderTable === 'function') window.renderTable();
            if (typeof window.buildTimeline === 'function') window.buildTimeline();
        }
    };
})();
