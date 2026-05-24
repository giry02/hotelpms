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
                        <div class="md-label" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px" data-i18n-key="Reservation Source">예약 유형 및 채널 (Source & Channel)</div>
                        <div style="display:flex;gap:16px;align-items:center;margin-bottom:10px;">
                            <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="unifiedSourceType" value="FIT" checked onclick="toggleUnifiedGroupSelect()"> 개별 예약 (FIT / OTA)</label>
                            <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="unifiedSourceType" value="Group" onclick="toggleUnifiedGroupSelect()"> 단체 및 B2B 연동 (Group / Agency)</label>
                        </div>
                        <div id="unifiedGroupSelectWrapper" style="display:none;background:#f8fafc;padding:12px;border:1px solid var(--border2);border-radius:8px;">
                            <div class="md-label" style="color:var(--txt2);font-size:0.75rem;margin-bottom:4px">소속 단체 / 여행사 선택</div>
                            <select id="unifiedGroupId" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:600;box-sizing:border-box;background:#fff;">
                                <option value="">단체를 선택하세요...</option>
                            </select>
                        </div>
                        <div id="unifiedFitChannelWrapper" style="margin-top:10px;">
                            <div class="md-label" style="color:var(--txt2);font-size:0.75rem;margin-bottom:4px">개별 채널 (Channel)</div>
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
                            <option value="confirmed">예약 확정 (Confirmed)</option>
                            <option value="checkedin">체크인 완료 (Checked-in)</option>
                            <option value="checkout">체크아웃 (Check-out)</option>
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
                <div>
                    <button class="btn-outline" style="color:var(--danger);border-color:var(--danger)" onclick="cancelUnifiedRes()" data-i18n-key="Cancel Booking"><i class="fa-solid fa-trash"></i> 예약 취소</button>
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
        }
    }

    window.openUnifiedResModal = async function(resId) {
        ensureModal();
        const allRes = window.reservations || (typeof reservations !== 'undefined' ? reservations : null);
        if (!allRes) {
            alert('Error: reservations variable not found!');
            return;
        }

        // Initialize Guest Search Widget
        if (!window._editGuestWidget && typeof initGuestSearch === 'function') {
            window._editGuestWidget = initGuestSearch('Edit');
        }

        // Populate room select
        if (!window.rooms || window.rooms.length === 0) {
            if (typeof window.PmsAPI !== 'undefined' && window.PmsAPI.getAllRooms) {
                window.rooms = await window.PmsAPI.getAllRooms();
            }
        }
        
        const roomSelect = document.getElementById('unifiedRoom');
        roomSelect.innerHTML = '';
        if (window.rooms && window.rooms.length > 0) {
            window.rooms.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r.id;
                opt.textContent = `${r.id} (${r.type || 'Standard'})`;
                roomSelect.appendChild(opt);
            });
        }

        if (!resId) {
            // NEW BOOKING MODE
            document.getElementById('unifiedModalTitle').innerHTML = `신규 예약 등록 (New Booking)`;
            document.getElementById('unifiedResId').value = '';
            document.getElementById('unifiedStatus').value = 'confirmed';
            document.querySelector('input[name="unifiedSourceType"][value="FIT"]').checked = true;
            document.getElementById('unifiedChannel').value = 'Walk-in';
            if (prefillGroupId) {
                document.querySelector('input[name="unifiedSourceType"][value="Group"]').checked = true;
                document.getElementById('unifiedGroupId').value = prefillGroupId;
            } else {
                document.getElementById('unifiedGroupId').value = '';
            }
            toggleUnifiedGroupSelect();
            
            // Set default dates to today and tomorrow
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const fmt = d => `${d.getMonth()+1}/${d.getDate()}`;
            document.getElementById('unifiedCin').textContent = fmt(today);
            document.getElementById('unifiedCout').textContent = fmt(tomorrow);
            document.getElementById('unifiedNights').textContent = '1박';
            document.getElementById('unifiedType').textContent = 'Standard';
            
            if (window._editGuestWidget) {
                window._editGuestWidget.reset();
                window._editGuestWidget.showNewForm();
            }
        } else {
            // EDIT BOOKING MODE
            const res = allRes.find(r => r.id === resId);
            if (!res) {
                alert('Error: reservation not found for ID ' + resId);
                return;
            }
            
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
            roomSelect.value = res.room;

            if (window._editGuestWidget) {
                window._editGuestWidget.reset();
                const existingGuest = typeof GUEST_DB !== 'undefined' ? GUEST_DB.find(g => g.name === res.guest) : null;
                if (existingGuest) {
                    window._editGuestWidget.select(existingGuest.id);
                } else {
                    window._editGuestWidget.showNewForm();
                    const nameInput = document.getElementById('nrGuestEdit');
                    if (nameInput) nameInput.value = res.guest;
                }
            }
        
            document.getElementById('unifiedStatus').value = res.status;
            
            if (res.groupId || res.isB2B) {
                document.querySelector('input[name="unifiedSourceType"][value="Group"]').checked = true;
                setTimeout(() => {
                    document.getElementById('unifiedGroupId').value = res.groupId || '';
                }, 100); // Wait for loadUnifiedGroups if necessary, but actually we should await it
            } else {
                document.querySelector('input[name="unifiedSourceType"][value="FIT"]').checked = true;
                const chanSelect = document.getElementById('unifiedChannel');
                let foundOption = Array.from(chanSelect.options).find(o => o.value === res.channel);
                if (!foundOption && res.channel) {
                    const opt = document.createElement('option');
                    opt.value = res.channel;
                    opt.textContent = res.channel;
                    chanSelect.appendChild(opt);
                }
                chanSelect.value = res.channel || 'Walk-in';
            }
            toggleUnifiedGroupSelect();
            document.getElementById('unifiedCin').textContent = res.cin || '-';
            document.getElementById('unifiedCout').textContent = res.cout || '-';
            document.getElementById('unifiedNights').textContent = res.nights ? (res.nights + '박') : (res.len ? res.len + '박' : '-');
            document.getElementById('unifiedType').textContent = res.type || '-';
        }

        // Hide other modals if they are open
        ['resModal', 'resDetailModal', 'editResModal'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.remove('active');
        });
        
        document.getElementById('unifiedResModal').classList.add('active');
    };

    window.closeUnifiedResModal = function() {
        document.getElementById('unifiedResModal').classList.remove('active');
    };

    window.saveUnifiedRes = function() {
        const id = document.getElementById('unifiedResId').value;
        
        let guest = '';
        if (window._editGuestWidget) {
            guest = window._editGuestWidget.getGuestName();
        } else {
            const guestInput = document.getElementById('nrGuestEdit');
            if (guestInput) guest = guestInput.value;
        }
        if (!guest || !guest.trim()) {
            alert('고객명을 입력하거나 선택해주세요.');
            return;
        }
        const room = document.getElementById('unifiedRoom').value;
        const status = document.getElementById('unifiedStatus').value;
        const isGroup = document.querySelector('input[name="unifiedSourceType"]:checked').value === 'Group';
        let channel = document.getElementById('unifiedChannel').value;
        let isB2B = false;
        let groupId = null;
        
        if (isGroup) {
            const grpSelect = document.getElementById('unifiedGroupId');
            groupId = grpSelect.value;
            const opt = grpSelect.options[grpSelect.selectedIndex];
            if (opt && groupId) {
                channel = opt.dataset.name || 'Group';
                isB2B = opt.dataset.b2b === 'true' || opt.textContent.includes('여행사') || opt.textContent.includes('B2B');
            } else {
                channel = 'Group (Unknown)';
            }
            // For now, if it's a group, we can set isB2B = true just to make it show up in B2B KPIs, 
            // but semantically we might want to separate Group and B2B. We'll set isB2B=true for both.
            isB2B = true; 
        }
        
        const allRes = window.reservations || (typeof reservations !== 'undefined' ? reservations : null);
        if (!allRes) return;
        
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
                nights: 1,

                type: 'Standard',
                amount: 0,
                color: '#3B82F6',
                initials: guest.substring(0,2).toUpperCase(),
                vip: 'Standard'
            };
            allRes.unshift(newRes);
            if (window.showToast) window.showToast('신규 예약을 성공적으로 등록했습니다.', 'success');
        } else {
            // EDIT BOOKING MODE
            const res = allRes.find(r => r.id === id);
            if (res) {
                res.guest = guest;
                if (guest.trim()) res.initials = guest.split(' ').map(n => n[0]).join('');
                res.room = room;
                res.status = status;
                res.channel = channel;
                res.isB2B = isB2B;
                res.groupId = groupId;
            }
            if (window.showToast) window.showToast('예약이 성공적으로 수정되었습니다.', 'success');
        }
        
        localStorage.setItem('pms_reservations', JSON.stringify(allRes));
        
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
        
        const confirmed = window.showConfirm ? await window.showConfirm(`정말 [${res.guest}] 고객의 예약을 취소하시겠습니까?`) : confirm(`정말 [${res.guest}] 고객의 예약을 취소하시겠습니까?`);
        if (confirmed) {
            res.status = 'cancelled';
            
            localStorage.setItem('pms_reservations', JSON.stringify(allRes));
            
            if (window.showToast) window.showToast('예약이 취소되었습니다.', 'success');
            
            closeUnifiedResModal();

            if (typeof window.renderTable === 'function') window.renderTable();
            if (typeof window.buildTimeline === 'function') window.buildTimeline();
        }
    };
})();
