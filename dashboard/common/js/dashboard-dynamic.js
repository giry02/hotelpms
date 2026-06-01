document.addEventListener('DOMContentLoaded', async () => {
    const normalizeStatus = (value) => String(value || '').toLowerCase().replace(/[_\s]/g, '-');
    const isOccupiedRoom = (room) => ['occupied', 'checked-in', 'in-house'].includes(normalizeStatus(room.frontStatus || room.status));
    const amountValue = (value) => {
        if (typeof value === 'number') return value;
        if (value && typeof value === 'object') return Number(value.amount || 0);
        return Number(value || 0);
    };
    const defaultRateByType = {
        standard: 100,
        deluxe: 140,
        premier: 100,
        penthouse: 650,
        'pool villa': 380
    };
    const roomRate = (room) => {
        const explicit = amountValue(room.baseRate ?? room.rate ?? room.price);
        if (explicit > 0) return explicit;
        const type = String(room.roomTypeName || room.type || room.roomTypeId || '').toLowerCase();
        const match = Object.keys(defaultRateByType).find(key => type.includes(key));
        return match ? defaultRateByType[match] : 0;
    };
    const currencyOf = (value) => (value && typeof value === 'object' && value.currency) || 'USD';
    const formatMoney = (amount, currency = 'USD') => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'USD' ? 2 : 0
    }).format(Number(amount || 0));
    const localIso = (date = new Date()) => {
        const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return shifted.toISOString().slice(0, 10);
    };
    const dateMatches = (value, isoDate) => {
        if (!value) return false;
        const raw = String(value);
        if (raw === isoDate) return true;
        const d = new Date(`${isoDate}T00:00:00`);
        const md = `${d.getMonth() + 1}/${d.getDate()}`;
        return raw === md || raw.replace(/^0/, '').replace('/0', '/') === md;
    };

    let rooms = [];
    let reservations = [];
    let tasks = [];
    let summary = null;
    if (window.PmsMockApi) {
        try {
            const env = await window.PmsMockApi.request('GET', '/dashboard/summary');
            summary = env && env.success ? env.data : null;
        } catch(e) {}
    }
    if (window.PmsAPI) {
        [rooms, reservations, tasks] = await Promise.all([
            window.PmsAPI.getAllRooms ? window.PmsAPI.getAllRooms().catch(() => []) : [],
            window.PmsAPI.getReservations ? window.PmsAPI.getReservations().catch(() => []) : [],
            window.PmsAPI.getTasks ? window.PmsAPI.getTasks().catch(() => []) : []
        ]);
    }

    const totalRooms = rooms.length || 1;
    const occupiedRooms = rooms.filter(isOccupiedRoom);
    const occupancy = summary?.occupancy !== undefined
        ? `${Number(summary.occupancy).toFixed(1)}%`
        : `${((occupiedRooms.length / totalRooms) * 100).toFixed(1)}%`;
    const currency = summary?.revenueToday?.currency
        || rooms.find(r => r.currency || r.baseRate?.currency)?.currency
        || currencyOf(rooms.find(r => r.baseRate)?.baseRate);
    const roomRevenueFromRooms = occupiedRooms.reduce((sum, room) => sum + roomRate(room), 0);
    const roomRevenueFromReservations = reservations
        .filter(r => ['checked-in', 'checkedin', 'in-house'].includes(normalizeStatus(r.status)))
        .reduce((sum, r) => {
            const nights = Number(r.nights || r.len || 1) || 1;
            return sum + (amountValue(r.rate) || amountValue(r.totalAmount) / nights || amountValue(r.amount) / nights || 0);
        }, 0);
    const dailyRoomRevenue = roomRevenueFromRooms || roomRevenueFromReservations;
    const adr = occupiedRooms.length ? formatMoney(dailyRoomRevenue / occupiedRooms.length, currency) : formatMoney(0, currency);
    const revpar = formatMoney(dailyRoomRevenue / totalRooms, currency);

    const today = localIso();
    const todayCheckin = reservations.filter(r =>
        dateMatches(r.checkInDate || r.checkin || r.cin, today) && normalizeStatus(r.status) === 'confirmed'
    ).length;
    const todayCheckout = reservations.filter(r => {
        const status = normalizeStatus(r.status);
        return dateMatches(r.checkOutDate || r.checkout || r.cout, today) && ['checked-in', 'checkedin', 'checked-out', 'checkout'].includes(status);
    }).length;

    const kpiVals = document.querySelectorAll('.kpi-value');
    if (kpiVals.length >= 4) {
        kpiVals[0].textContent = occupancy;
        kpiVals[1].textContent = adr;
        kpiVals[2].textContent = revpar;
        kpiVals[3].textContent = `${summary?.arrivals ?? todayCheckin} / ${summary?.departures ?? todayCheckout}`;
        const kpiLabel = kpiVals[3].nextElementSibling;
        if (kpiLabel && kpiLabel.classList.contains('kpi-label')) {
            kpiLabel.textContent = '오늘 체크인 / 체크아웃';
        }
    }

    const hkCounts = document.querySelectorAll('.hk-count');
    if (hkCounts.length >= 5) {
        hkCounts[0].textContent = rooms.filter(r => normalizeStatus(r.status) === 'vacant-clean' || normalizeStatus(r.housekeepingStatus) === 'clean').length;
        hkCounts[1].textContent = tasks.filter(t => normalizeStatus(t.status) === 'dirty').length;
        hkCounts[2].textContent = tasks.filter(t => normalizeStatus(t.status) === 'cleaning' || normalizeStatus(t.status) === 'progress').length;
        hkCounts[3].textContent = tasks.filter(t => normalizeStatus(t.status) === 'inspect').length;
        hkCounts[4].textContent = rooms.filter(r => ['oos', 'out-of-service'].includes(normalizeStatus(r.status))).length;
    }

    const checkinLink = document.querySelector('a.card-title-link[href="frontdesk/reservation-list.html?tab=checkin"]');
    const checkinBody = checkinLink ? checkinLink.closest('.card').querySelector('tbody') : null;
    if (checkinBody) {
        const checkinRes = reservations.filter(r => normalizeStatus(r.status) === 'confirmed').slice(0, 5);
        if (checkinRes.length > 0) {
            checkinBody.innerHTML = checkinRes.map(r => {
                const isVip = r.vip && (String(r.vip).includes('VIP') || String(r.vip).includes('Gold'));
                const vipBadge = isVip ? `<span style="font-size:.62rem;color:#9CA3AF">${r.vip}</span>` : '';
                return `<tr><td><div class="guest-cell"><div class="guest-avatar" style="background:${r.color || '#3B82F6'}">${r.initials || ''}</div><div>${r.guest || r.guestName || '-'} ${vipBadge}</div></div></td><td>${r.room || r.roomNo || '-'}</td><td>${r.type || r.roomTypeName || '-'}</td><td>${r.cin || r.checkInDate || '-'} - ${r.cout || r.checkOutDate || '-'} (${r.nights || r.len || 1}N)</td><td><span class="status-badge confirmed">Confirmed</span></td></tr>`;
            }).join('');
        }
    }

    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        const firstReservation = reservations[0] || {};
        const secondReservation = reservations[1] || {};
        const firstTask = tasks[0] || {};
        const activities = [
            { icon: 'ci', iconClass: 'fa-right-to-bracket', text: `<b>${firstReservation.room || firstReservation.roomNo || '객실'}호</b> ${firstReservation.guest || firstReservation.guestName || 'Guest'} 체크인 완료`, time: '방금 전' },
            { icon: 'hk', iconClass: 'fa-broom', text: `<b>${firstTask.room || firstTask.roomNo || '객실'}호</b> 하우스키핑 작업 업데이트`, time: '5분 전' },
            { icon: 'co', iconClass: 'fa-right-from-bracket', text: `<b>${secondReservation.room || secondReservation.roomNo || '객실'}호</b> ${secondReservation.guest || secondReservation.guestName || 'Guest'} 체크아웃 예정`, time: '12분 전' }
        ];
        activityList.innerHTML = activities.map(a => `<div class="activity-item"><div class="activity-icon ${a.icon}"><i class="fa-solid ${a.iconClass}"></i></div><div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div></div>`).join('');
    }
});
