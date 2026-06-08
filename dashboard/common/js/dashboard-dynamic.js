document.addEventListener('DOMContentLoaded', async () => {
    const normalizeStatus = (value) => String(value || '').toLowerCase().replace(/[_\s]/g, '-');
    const isOccupiedRoom = (room) => ['occupied', 'checked-in', 'in-house'].includes(normalizeStatus(room.frontStatus || room.status));
    const amountValue = (value) => {
        if (typeof value === 'number') return value;
        if (value && typeof value === 'object') return Number(value.amount || 0);
        return Number(value || 0);
    };
    const roomRate = (room) => {
        const explicit = amountValue(room.baseRate ?? room.rate ?? room.price);
        return explicit > 0 ? explicit : 0;
    };
    const currencyOf = (value) => (value && typeof value === 'object' && value.currency) || 'USD';
    const formatMoney = (amount, currency = 'USD') => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'USD' ? 2 : 0
    }).format(Number(amount || 0));
    const localIso = (date) => {
        if (!date && window.PmsDate?.todayIso) return window.PmsDate.todayIso();
        date = date || new Date();
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
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
    const lang = () => window.currentLang || localStorage.getItem('pms_lang') || 'ko';
    const tr = (key) => typeof window.t === 'function' ? window.t(key) : key;
    function roomTypeText(value) {
        const text = String(value || '').trim();
        return text || '-';
    }
    const roomText = (roomNo) => {
        const room = escapeHtml(roomNo || tr('Room'));
        return lang() === 'en' ? `${tr('Room')} ${room}` : `${room}${tr('room')}`;
    };
    const orderDateValue = (order) => String(order?.date || order?.serviceDate || order?.createdAt || '').slice(0, 10);
    const orderDateSortValue = (order) => `${orderDateValue(order)}T${String(order?.time || '00:00').padStart(5, '0')}`;
    const orderStatusKey = (status) => {
        const value = normalizeStatus(status).replace(/-/g, '');
        if (['done', 'complete', 'completed', 'closed', 'paid', 'served'].includes(value)) return 'done';
        if (['prep', 'preparing', 'accepted', 'progress', 'processing', 'delivering', 'inprogress'].includes(value)) return 'prep';
        return 'new';
    };
    const orderStatusLabel = (status) => {
        const key = orderStatusKey(status);
        if (lang() === 'en') return key === 'done' ? 'Completed' : key === 'prep' ? 'Preparing' : 'New';
        return key === 'done' ? '완료' : key === 'prep' ? '준비 중' : '신규';
    };
    const orderStatusClass = (status) => {
        const key = orderStatusKey(status);
        return key === 'done' ? 'confirmed' : key === 'prep' ? 'checkout' : 'checkin';
    };
    const serviceLabel = (serviceKey, type) => {
        const isEn = lang() === 'en';
        const posTypes = {
            roomservice: isEn ? 'Room Service' : '룸서비스',
            minibar: isEn ? 'Minibar' : '미니바',
            spa: isEn ? 'Spa' : '스파',
            laundry: isEn ? 'Laundry' : '세탁',
            retail: isEn ? 'Retail' : '리테일'
        };
        if (serviceKey === 'golf') return isEn ? 'Golf' : '골프장';
        if (serviceKey === 'rentacar') return isEn ? 'Rent-a-car' : '렌트카';
        return posTypes[String(type || '').toLowerCase()] || (isEn ? 'POS' : '통합 POS');
    };
    const orderItemsText = (items) => {
        if (Array.isArray(items)) return items.join(', ');
        return String(items || '-');
    };
    const normalizeOrder = (order, serviceKey) => ({
        ...order,
        serviceKey,
        room: order.room || order.roomNo || String(order.roomId || '').split('-').pop() || '-',
        itemText: orderItemsText(order.items || order.item || order.name),
        amount: amountValue(order.total ?? order.amount ?? order.price),
        currency: order.currency || order.total?.currency || 'USD'
    });

    let rooms = [];
    let reservations = [];
    let tasks = [];
    let posOrders = [];
    let golfOrders = [];
    let rentacarOrders = [];
    let summary = null;
    if (window.PmsMockApi) {
        try {
            const env = await window.PmsMockApi.request('GET', '/dashboard/summary');
            summary = env && env.success ? env.data : null;
        } catch(e) {}
    }
    if (window.PmsAPI) {
        [rooms, reservations, tasks, posOrders, golfOrders, rentacarOrders] = await Promise.all([
            window.PmsAPI.getAllRooms ? window.PmsAPI.getAllRooms().catch(() => []) : [],
            window.PmsAPI.getReservations ? window.PmsAPI.getReservations().catch(() => []) : [],
            window.PmsAPI.getTasks ? window.PmsAPI.getTasks().catch(() => []) : [],
            window.PmsAPI.getOrders ? window.PmsAPI.getOrders().catch(() => []) : [],
            window.PmsAPI.getGolfOrders ? window.PmsAPI.getGolfOrders().catch(() => []) : [],
            window.PmsAPI.getRentacarOrders ? window.PmsAPI.getRentacarOrders().catch(() => []) : []
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

    const today = window.PmsDate?.todayIso ? window.PmsDate.todayIso() : localIso();
    const todayCheckinRes = reservations.filter(r =>
        dateMatches(r.checkInDate || r.checkin || r.cin, today) && normalizeStatus(r.status) === 'confirmed'
    );
    const todayCheckoutRes = reservations.filter(r => {
        const status = normalizeStatus(r.status);
        return dateMatches(r.checkOutDate || r.checkout || r.cout, today) && ['checked-in', 'checkedin', 'checked-out', 'checkout'].includes(status);
    });
    const todayCheckin = todayCheckinRes.length;
    const todayCheckout = todayCheckoutRes.length;

    const kpiVals = document.querySelectorAll('.kpi-value');
    if (kpiVals.length >= 4) {
        kpiVals[0].textContent = occupancy;
        kpiVals[1].textContent = adr;
        kpiVals[2].textContent = revpar;
        kpiVals[3].textContent = `${todayCheckin || summary?.arrivals || 0} / ${todayCheckout || summary?.departures || 0}`;
        const kpiLabel = kpiVals[3].nextElementSibling;
        if (kpiLabel && kpiLabel.classList.contains('kpi-label')) {
            kpiLabel.setAttribute('data-i18n-key', "Today's Check-in / Check-out");
            kpiLabel.textContent = tr("Today's Check-in / Check-out");
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
        const checkinRes = (todayCheckinRes.length ? todayCheckinRes : reservations.filter(r => normalizeStatus(r.status) === 'confirmed')).slice(0, 5);
        if (checkinRes.length > 0) {
            checkinBody.innerHTML = checkinRes.map(r => {
                const isVip = r.vip && (String(r.vip).includes('VIP') || String(r.vip).includes('Gold'));
                const vipBadge = isVip ? `<span style="font-size:.62rem;color:#9CA3AF">${lang() === 'en' ? escapeHtml(r.vip) : '우수 고객'}</span>` : '';
                const initials = escapeHtml(r.initials || String(r.guest || r.guestName || '-').slice(0, 2).toUpperCase());
                const guest = escapeHtml(r.guest || r.guestName || '-');
                const room = escapeHtml(r.room || r.roomNo || '-');
                const type = escapeHtml(roomTypeText(r.type || r.roomTypeName || '-'));
                const stayUnit = lang() === 'en' ? 'N' : '박';
                const stay = `${escapeHtml(r.cin || r.checkInDate || '-')} - ${escapeHtml(r.cout || r.checkOutDate || '-')} (${escapeHtml(r.nights || r.len || 1)}${stayUnit})`;
                const confirmedText = lang() === 'en' ? 'Confirmed' : '확정';
                return `<tr><td><div class="guest-cell"><div class="guest-avatar" style="background:${escapeHtml(r.color || '#3B82F6')}">${initials}</div><div>${guest} ${vipBadge}</div></div></td><td>${room}</td><td>${type}</td><td>${stay}</td><td><span class="status-badge confirmed">${confirmedText}</span></td></tr>`;
            }).join('');
        } else {
            checkinBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#9CA3AF;padding:20px">${tr('No scheduled check-ins for today.')}</td></tr>`;
        }
    }

    const ancillaryLink = document.querySelector('a.card-title-link[href="operations/ancillary.html"]');
    const ancillaryBody = ancillaryLink ? ancillaryLink.closest('.card')?.querySelector('tbody') : null;
    if (ancillaryBody) {
        const combinedOrders = [
            ...posOrders.map(order => normalizeOrder(order, 'pos')),
            ...golfOrders.map(order => normalizeOrder(order, 'golf')),
            ...rentacarOrders.map(order => normalizeOrder(order, 'rentacar'))
        ];
        const orderDates = combinedOrders.map(orderDateValue).filter(Boolean).sort();
        const targetDate = combinedOrders.some(order => dateMatches(orderDateValue(order), today))
            ? today
            : orderDates[orderDates.length - 1];
        const todayOrders = combinedOrders
            .filter(order => !targetDate || dateMatches(orderDateValue(order), targetDate))
            .sort((a, b) => orderDateSortValue(b).localeCompare(orderDateSortValue(a)))
            .slice(0, 6);

        if (todayOrders.length > 0) {
            ancillaryBody.innerHTML = todayOrders.map(order => `
                <tr>
                    <td>${escapeHtml(order.time || '-')}</td>
                    <td>${escapeHtml(order.room)}</td>
                    <td>${escapeHtml(serviceLabel(order.serviceKey, order.type))}</td>
                    <td>${escapeHtml(order.itemText)}</td>
                    <td>${formatMoney(order.amount, order.currency)}</td>
                    <td><span class="status-badge ${orderStatusClass(order.status)}">${escapeHtml(orderStatusLabel(order.status))}</span></td>
                </tr>`).join('');
        } else {
            const emptyText = lang() === 'en' ? 'No ancillary orders for today.' : '오늘 부가서비스 주문이 없습니다.';
            ancillaryBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#9CA3AF;padding:20px">${emptyText}</td></tr>`;
        }
    }

    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        const firstReservation = todayCheckinRes[0] || reservations.find(r => normalizeStatus(r.status) === 'confirmed') || {};
        const secondReservation = todayCheckoutRes[0] || reservations.find(r => ['checked-in', 'checkedin'].includes(normalizeStatus(r.status))) || {};
        const firstTask = tasks[0] || {};
        const activities = [
            { icon: 'ci', iconClass: 'fa-right-to-bracket', text: `<b>${roomText(firstReservation.room || firstReservation.roomNo)}</b> ${escapeHtml(firstReservation.guest || firstReservation.guestName || tr('Guest'))} ${tr('Scheduled check-in')}`, time: tr('Today') },
            { icon: 'hk', iconClass: 'fa-broom', text: `<b>${roomText(firstTask.room || firstTask.roomNo)}</b> ${tr('Housekeeping task updated')}`, time: tr('5 min ago') },
            { icon: 'co', iconClass: 'fa-right-from-bracket', text: `<b>${roomText(secondReservation.room || secondReservation.roomNo)}</b> ${escapeHtml(secondReservation.guest || secondReservation.guestName || tr('Guest'))} ${tr('Scheduled check-out')}`, time: tr('Today') }
        ];
        activityList.innerHTML = activities.map(a => `<div class="activity-item"><div class="activity-icon ${a.icon}"><i class="fa-solid ${a.iconClass}"></i></div><div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div></div>`).join('');
    }
});
