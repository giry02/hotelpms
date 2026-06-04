// reservation-actions.js
// Handles common Unified Reservation Modal (View & Edit combined) across Timeline and List views

(function() {
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
                
                <div id="unifiedGuestSection" style="margin-bottom:20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid var(--border2);">
                    ${typeof renderGuestSearchHTML === 'function' ? renderGuestSearchHTML('Edit') : '<div style="color:red">guest-search.js missing</div>'}
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                    <div class="md-item">
                        <div class="md-label" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px" data-i18n-key="Room">객실 배정</div>
                        <select id="unifiedRoom" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:600;box-sizing:border-box;background:#fff;"></select>
                    </div>
                    <div class="md-item" style="grid-column: 1 / -1;">
                        <div class="md-label" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px" data-i18n-key="Reservation Source">예약 채널 및 소속 단체</div>
                        <div style="display:flex;gap:16px;align-items:center;margin-bottom:10px;">
                            <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="unifiedIsB2B" value="true" onclick="toggleUnifiedGroupSelect()"> 단체 고객</label>
                        </div>
                        <div id="unifiedGroupSelectWrapper" style="display:none;background:#f8fafc;padding:12px;border:1px solid var(--border2);border-radius:8px;margin-bottom:10px;">
                            <div class="md-label" style="color:var(--txt2);font-size:0.75rem;margin-bottom:4px">소속 단체 / 여행사 선택</div>
                            <select id="unifiedGroupId" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:600;box-sizing:border-box;background:#fff;">
                                <option value="">단체를 선택하세요...</option>
                            </select>
                        </div>
                        <div id="unifiedFitChannelWrapper">
                            <div class="md-label" style="color:var(--txt2);font-size:0.75rem;margin-bottom:4px">채널 (Channel)</div>
                            <select id="unifiedChannel" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:600;box-sizing:border-box;background:#fff;">
                                <option value="Walk-in">Walk-in</option>
                                <option value="Phone">Phone (Direct)</option>
                                <option value="Homepage">Website</option>
                                <option value="Agoda">Agoda</option>
                                <option value="Booking.com">Booking.com</option>
                            </select>
                        </div>
                    </div>
                    <div class="md-item">
                        <div class="md-label" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px" data-i18n-key="Status">상태</div>
                        <select id="unifiedStatus" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:600;box-sizing:border-box;background:#fff;">
                            <option value="blocked">단체 블록 (Blocked)</option>
                            <option value="confirmed">예약 확정 (Confirmed)</option>
                            <option value="checkedin">체크인 완료 (Checked-in)</option>
                            <option value="checkout">체크아웃 (Check-out)</option>
                            <option value="completed">체크아웃 완료 (Completed)</option>
                            <option value="cancelled">취소 (Cancelled)</option>
                        </select>
                    </div>
                    <div class="md-item">
                        <div class="md-label" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px" data-i18n-key="Check-in">체크인 일자</div>
                        <div class="md-value" id="unifiedCin" style="font-size:0.9rem;"></div>
                    </div>
                    <div class="md-item">
                        <div class="md-label" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px" data-i18n-key="Check-out">체크아웃 일자</div>
                        <div class="md-value" id="unifiedCout" style="font-size:0.9rem;"></div>
                    </div>
                    <div class="md-item">
                        <div class="md-label" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px" data-i18n-key="Stay">숙박 일수</div>
                        <div class="md-value" id="unifiedNights" style="font-size:0.9rem;"></div>
                    </div>
                    <div class="md-item">
                        <div class="md-label" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px" data-i18n-key="Room Type">객실 타입</div>
                        <div class="md-value" id="unifiedType" style="font-size:0.9rem;"></div>
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
            
            // Populate Groups when modal is created
            if (typeof window.PmsAPI !== 'undefined' && window.PmsAPI.getGroups) {
                window.PmsAPI.getGroups().then(groups => {
                    if (groups && groups.length > 0) {
                        const sel = document.getElementById('unifiedGroupId');
                        sel.innerHTML = '<option value="">단체를 선택하세요...</option>';
                        groups.forEach(g => {
                            const opt = document.createElement('option');
                            opt.value = g.id;
                            opt.textContent = g.name;
                            sel.appendChild(opt);
                        });
                    }
                }).catch(err => console.log('Error loading groups:', err));
            }
        }
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
            const date = new Date(new Date().getFullYear(), Number(match[1]) - 1, Number(match[2]));
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
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

    function isRoomInHouse(res) {
        const room = roomForReservation(res);
        const roomStatus = normalizedReservationStatus(room?.frontStatus || room?.status || room?.housekeepingStatus);
        return roomStatus === 'checkedin';
    }

    function normalizedRoomOpsStatus(room) {
        return String(room?.housekeepingStatus || room?.status || room?.frontStatus || '').replace(/[-_\s]/g, '').toLowerCase();
    }

    function checkinBlockReasonForRoom(room) {
        if (!room) return '객실을 먼저 배정해야 체크인할 수 있습니다.';
        const status = normalizedRoomOpsStatus(room);
        if (['dirty', 'vacantdirty'].includes(status)) return '하우스키핑 청소 완료 후 체크인할 수 있습니다.';
        if (['oos', 'outofservice', 'maintenance'].includes(status)) return '점검/수리 중 객실은 체크인할 수 없습니다.';
        if (['occupied', 'inhouse', 'checkedin', 'checked-in'].includes(status)) return '이미 투숙 중인 객실입니다.';
        return '';
    }

    function checkoutDateIsTodayOrPast(res) {
        const end = parseReservationDate(res?.checkOutDate || res?.checkout || res?.cout);
        if (!end) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
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
                            <div style="color:var(--txt);font-size:.9rem;margin-bottom:4px">체크인 이후 예약은 조회 전용입니다.</div>
                            <div>투숙객 변경, 신규 회원 등록, 객실/채널/상태 변경은 이 화면에서 처리하지 않습니다.</div>
                            <div style="margin-top:8px;color:var(--txt)">투숙객: ${guestNameForReservation(res)} · 객실: ${roomLabel}</div>
                        </div>
                    </div>`;
            }
        }

        if (guestSection) guestSection.style.display = locked ? 'none' : 'block';
        const blockNotice = document.getElementById('unifiedBlockNotice');
        if (!locked && blockNotice) blockNotice.style.display = 'none';
        ['unifiedRoom', 'unifiedIsB2B', 'unifiedGroupId', 'unifiedChannel', 'unifiedStatus'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.disabled = locked;
            if (el.tagName === 'SELECT') el.style.background = locked ? '#f1f5f9' : '#fff';
            if (el.type === 'checkbox') el.closest('label')?.style.setProperty('opacity', locked ? '.55' : '1');
        });

        const saveBtn = modal.querySelector('button[onclick="saveUnifiedRes()"]');
        if (saveBtn) saveBtn.style.display = locked ? 'none' : 'inline-flex';
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
            const message = '이미 체크인 또는 투숙중인 예약입니다. 체크인은 다시 처리할 수 없습니다.';
            if (window.showToast) window.showToast(message, 'error');
            else alert(message);
            setUnifiedReservationReadonly(isReservationReadOnly(res), res);
            renderUnifiedFlowActions(res);
            return;
        }
        if (action === 'checkout' && !['checkedin', 'checkout'].includes(currentStatus)) {
            const message = '체크아웃은 투숙중 예약에서만 처리할 수 있습니다.';
            if (window.showToast) window.showToast(message, 'error');
            else alert(message);
            renderUnifiedFlowActions(res);
            return;
        }
        const room = roomForReservation(res);
        if (action === 'checkin') {
            const blockReason = checkinBlockReasonForRoom(room);
            if (blockReason) {
                if (window.showToast) window.showToast(blockReason, 'error');
                else alert(blockReason);
                return;
            }
        }

        const label = action === 'checkin' ? '체크인' : '체크아웃';
        const confirmed = window.showConfirm
            ? await window.showConfirm(`${guestNameForReservation(res)} 예약을 ${label} 처리하시겠습니까?`)
            : confirm(`${guestNameForReservation(res)} 예약을 ${label} 처리하시겠습니까?`);
        if (!confirmed) return;

        if (action === 'checkin') {
            res.status = 'checkedin';
            if (room) {
                room.status = 'occupied';
                room.frontStatus = 'in-house';
                room.housekeepingStatus = 'occupied';
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
        if (window.showToast) window.showToast(`${label} 처리가 완료되었습니다.`, 'success');
        if (typeof window.buildTimeline === 'function') window.buildTimeline();
        if (typeof window.buildMobileView === 'function') window.buildMobileView();
        if (typeof window.renderTable === 'function') window.renderTable();
        if (typeof window.renderResTable === 'function') window.renderResTable();
        window.openUnifiedResModal(res.id);
    };
    
    window.toggleUnifiedGroupSelect = function() {
        const isB2B = document.getElementById('unifiedIsB2B').checked;
        document.getElementById('unifiedGroupSelectWrapper').style.display = isB2B ? 'block' : 'none';
        document.getElementById('unifiedFitChannelWrapper').style.display = isB2B ? 'none' : 'block';
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
                        opt.textContent = `${r.id} (${r.type || 'Standard'})${blocked ? ' · 단체 블록' : occupied ? ' · 투숙 중' : ''}`;
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
                    opt.textContent = `${r.id} (${r.type || 'Standard'})${blocked ? ' · 단체 블록' : occupied ? ' · 투숙 중' : ''}`;
                    roomSelect.appendChild(opt);
                });
            }
        }
        roomSelect.onchange = () => {
            const selectedRoom = (window.rooms || []).find(r => r.id === roomSelect.value || r.fullRoom === roomSelect.value || r.number === roomSelect.value || r.display === roomSelect.value);
            const typeEl = document.getElementById('unifiedType');
            if (typeEl) typeEl.textContent = selectedRoom?.type || '-';
        };

        if (!resId) {
            // NEW BOOKING MODE
            const cancelBtn = document.getElementById('unifiedBtnCancel');
            if (cancelBtn) cancelBtn.style.display = 'none';
            document.getElementById('unifiedModalTitle').innerHTML = `신규 예약 등록 (New Booking)`;
            document.getElementById('unifiedResId').value = '';
            document.getElementById('unifiedStatus').value = 'confirmed';
            document.getElementById('unifiedIsB2B').checked = false;
            document.getElementById('unifiedChannel').value = 'Walk-in';
            if (prefillGroupId) {
                document.getElementById('unifiedIsB2B').checked = true;
                setTimeout(() => document.getElementById('unifiedGroupId').value = prefillGroupId, 200);
            } else {
                document.getElementById('unifiedGroupId').value = '';
            }
            toggleUnifiedGroupSelect();
            
            // Set default dates to today and tomorrow
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const fmt = d => `${d.getMonth()+1}/${d.getDate()}`;
            document.getElementById('unifiedCin').textContent = prefill?.checkin || fmt(today);
            document.getElementById('unifiedCout').textContent = prefill?.checkout || fmt(tomorrow);
            const cinParts = document.getElementById('unifiedCin').textContent.split('/');
            const coutParts = document.getElementById('unifiedCout').textContent.split('/');
            const cinDate = cinParts.length === 2 ? new Date(2026, parseInt(cinParts[0],10)-1, parseInt(cinParts[1],10)) : today;
            const coutDate = coutParts.length === 2 ? new Date(2026, parseInt(coutParts[0],10)-1, parseInt(coutParts[1],10)) : tomorrow;
            const nights = Math.max(1, Math.round((coutDate - cinDate) / 86400000));
            document.getElementById('unifiedNights').textContent = nights + '박';
            if (prefill?.room) roomSelect.value = prefill.room;
            const selectedRoom = (window.rooms || []).find(r => r.id === roomSelect.value || r.fullRoom === roomSelect.value);
            document.getElementById('unifiedType').textContent = selectedRoom?.type || prefill?.type || 'Standard';
            
            if (window._editGuestWidget) {
                window._editGuestWidget.reset();
            }
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
            
            const isB2B = res.isB2B;
            const isVip = res.isVip || (res.vip && res.vip.toLowerCase().includes('vip'));
            const b2bBadge = isB2B ? '<span style="background:#111827;color:#fff;font-size:0.65rem;padding:2px 6px;border-radius:4px;margin-left:8px;font-weight:600;vertical-align:middle;letter-spacing:0.5px"><i class="fa-solid fa-building"></i> B2B 고객</span>' : '';
            const vipBadge = isVip ? '<span style="background:rgba(245,158,11,.15);color:#D97706;font-size:0.65rem;padding:2px 6px;border-radius:4px;margin-left:8px;font-weight:700;vertical-align:middle;"><i class="fa-solid fa-crown"></i> VIP</span>' : '';
            
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
                opt.textContent = `${targetRoomValue} (${res.type || matchedRoom?.type || 'Standard'})`;
                roomSelect.appendChild(opt);
            }
            roomSelect.value = targetRoomValue;

            const guestSection = document.getElementById('unifiedGuestSection');
            if (guestSection) {
                guestSection.style.display = (isEditingBlock || isReadonlyReservation) ? 'none' : 'block';
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

            if (!isEditingBlock && !isReadonlyReservation && window._editGuestWidget) {
                window._editGuestWidget.reset();
                const existingGuest = typeof GUEST_DB !== 'undefined' ? GUEST_DB.find(g => g.name === res.guest) : null;
                if (existingGuest) {
                    window._editGuestWidget.select(existingGuest.id);
                } else {
                    window._editGuestWidget.showNewForm();
                    const nameInput = document.getElementById('nrGuestEdit');
                    if (nameInput) nameInput.value = res.guest || '';
                }
            } else if (isReadonlyReservation && window._editGuestWidget) {
                window._editGuestWidget.reset();
            }
        
            document.getElementById('unifiedStatus').value = isReadonlyReservation ? effectiveStatus : normalizedReservationStatus(res.status);
            
            if (res.groupId || res.isB2B) {
                document.getElementById('unifiedIsB2B').checked = true;
                setTimeout(() => {
                    document.getElementById('unifiedGroupId').value = res.groupId || '';
                }, 200);
            } else {
                document.getElementById('unifiedIsB2B').checked = false;
            }
            const chanSelect = document.getElementById('unifiedChannel');
            let foundOption = Array.from(chanSelect.options).find(o => o.value === res.channel);
            if (!foundOption && res.channel) {
                const opt = document.createElement('option');
                opt.value = res.channel;
                opt.textContent = res.channel;
                chanSelect.appendChild(opt);
            }
            chanSelect.value = res.channel || 'Walk-in';

            toggleUnifiedGroupSelect();
            document.getElementById('unifiedCin').textContent = res.cin || '-';
            document.getElementById('unifiedCout').textContent = res.cout || '-';
            document.getElementById('unifiedNights').textContent = res.nights ? (res.nights + '박') : (res.len ? res.len + '박' : '-');
            document.getElementById('unifiedType').textContent = res.type || '-';
            setUnifiedReservationReadonly(isReadonlyReservation, res);
            renderUnifiedFlowActions(res);
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
        if (currentRes && isReservationReadOnly(currentRes)) {
            if (window.showToast) window.showToast('체크인 이후 예약은 이 화면에서 수정할 수 없습니다.', 'error');
            else alert('체크인 이후 예약은 이 화면에서 수정할 수 없습니다.');
            return;
        }
        const isBlockSave = currentRes && (normalizedReservationStatus(currentRes.status) === 'blocked' || currentRes.isGroupPlaceholder) && document.getElementById('unifiedStatus').value === 'blocked';
        if (!isBlockSave && window._editGuestWidget) {
            guest = window._editGuestWidget.getGuestName();
        } else if (!isBlockSave) {
            const guestInput = document.getElementById('nrGuestEdit');
            if (guestInput) guest = guestInput.value;
        }
        if (!isBlockSave && (!guest || !guest.trim())) {
            alert('고객명을 입력하거나 선택해주세요.');
            return;
        }
        const room = document.getElementById('unifiedRoom').value;
        const selectedRoom = (window.rooms || []).find(r => r.id === room || r.fullRoom === room || r.number === room || r.display === room);
        const status = document.getElementById('unifiedStatus').value;
        const isB2B = document.getElementById('unifiedIsB2B').checked;
        let channel = document.getElementById('unifiedChannel').value;
        let groupId = null;
        let savedRes = null;
        
        if (isB2B) {
            const grpSel = document.getElementById('unifiedGroupId');
            if (grpSel.value) {
                groupId = grpSel.value;
                channel = grpSel.options[grpSel.selectedIndex].text;
            } else {
                channel = 'B2B/Group';
            }
        }
        
        if (!id) {
            // NEW BOOKING MODE
            const newId = 'RSV-' + new Date().toISOString().replace(/\D/g,'').slice(0,14) + '-' + Math.floor(Math.random()*1000);
            const newRes = {
                id: newId,
                guest: guest,
                room: room,
                status: status,
                channel: channel,
                isB2B: isB2B,
                groupId: groupId,
                cin: document.getElementById('unifiedCin').textContent,
                cout: document.getElementById('unifiedCout').textContent,
                nights: parseInt(document.getElementById('unifiedNights').textContent, 10) || 1,

                type: selectedRoom?.type || document.getElementById('unifiedType').textContent || 'Standard',
                fullRoom: selectedRoom?.id || room,
                amount: 0,
                color: '#3B82F6',
                initials: guest.substring(0,2).toUpperCase(),
                vip: 'Standard'
            };
            allRes.unshift(newRes);
            savedRes = newRes;
            if (window.showToast) window.showToast('신규 예약을 성공적으로 등록했습니다.', 'success');
        } else {
            // EDIT BOOKING MODE
            const res = allRes.find(r => r.id === id);
            if (res) {
                res.guest = guest;
                if (guest.trim()) res.initials = guest.split(' ').map(n => n[0]).join('');
                res.room = room;
                res.status = status;
                if (res.isGroupPlaceholder && status !== 'blocked' && guest.trim()) {
                    res.isGroupPlaceholder = false;
                    res.status = 'confirmed';
                }
                res.channel = channel;
                res.isB2B = isB2B;
                res.groupId = groupId;
                savedRes = res;
            }
            if (window.showToast) window.showToast('예약이 성공적으로 수정되었습니다.', 'success');
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
            const message = '체크인 이후 예약은 취소할 수 없습니다. 체크아웃, 조기퇴실, 환불/정산 정정으로 처리해주세요.';
            if (window.showToast) window.showToast(message, 'error');
            else alert(message);
            return;
        }
        
        const confirmed = window.showConfirm ? await window.showConfirm(`정말 [${res.guest}] 고객의 예약을 취소하시겠습니까?`) : confirm(`정말 [${res.guest}] 고객의 예약을 취소하시겠습니까?`);
        if (confirmed) {
            res.status = 'cancelled';
            localStorage.setItem('pms_reservations', JSON.stringify(allRes));
            try {
                if (window.PmsMockApi) await window.PmsMockApi.request('PATCH', `/reservations/${encodeURIComponent(resId)}`, { body: { status: 'cancelled' } });
            } catch(e) {
                console.warn('Mock reservation cancel failed', e);
            }
            if (typeof window.syncGroupData === 'function') window.syncGroupData();
            
            if (window.showToast) window.showToast('예약이 취소되었습니다.', 'success');
            
            closeUnifiedResModal();

            if (typeof window.renderTable === 'function') window.renderTable();
            if (typeof window.buildTimeline === 'function') window.buildTimeline();
        }
    };
})();
