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
            'flow.futureCheckinNotAllowed': '체크인 예정일 전에는 체크인할 수 없습니다. 예약 취소 또는 예약 수정만 가능합니다.',
            'flow.confirm': '{name} 예약을 {action} 처리하시겠습니까?',
            'flow.earlyCheckoutTitle': '조기 체크아웃 확인',
            'flow.earlyCheckoutOk': '조기 체크아웃 처리',
            'flow.earlyCheckoutConfirm': '{name} 예약은 예정 체크아웃일({checkoutDate} {checkoutTime}) 전입니다.\n지금 진행하면 오늘 기준 체크아웃 완료로 처리되고 객실은 청소필요 상태로 전환됩니다.\n남은 숙박 요금, 환불, 미수금은 정산에서 별도로 확인해야 합니다.\n그래도 조기 체크아웃 처리할까요?',
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
            'booking.dirtyRoomConfirm': '청소가 완료되지 않은 객실입니다. 그래도 신규 예약을 등록할까요?',
            'booking.newTitle': '신규 예약 등록',
            'booking.created': '신규 예약을 성공적으로 등록했습니다.',
            'booking.updated': '예약이 성공적으로 수정되었습니다.',
            'guest.roster.title': '예약 투숙객 명단',
            'guest.count': '{count}명',
            'guest.emptyRoster': '상단에서 투숙객을 검색한 뒤 대표 또는 동반으로 추가하세요.',
            'guest.id': '고객ID {id}',
            'guest.newInline': '신규 입력 고객',
            'guest.primary': '대표',
            'guest.companion': '동반',
            'guest.setPrimary': '대표',
            'guest.delete': '삭제',
            'guest.addPrimary': '대표로 설정',
            'guest.addCompanion': '동반으로 추가',
            'guest.detailTitle': '고객 상세 정보',
            'guest.auditLog': '열람 로그 기록',
            'modal.editTitle': '예약 상세 및 수정',
            'button.cancelBooking': '예약 취소',
            'button.close': '닫기',
            'button.save': '저장',
            'cancel.notAllowed': '체크인 이후 예약은 취소할 수 없습니다. 체크아웃, 조기퇴실, 환불/정산 정정으로 처리해주세요.',
            'cancel.confirm': '[{name}] 고객의 예약을 취소하시겠습니까?',
            'cancel.reasonTitle': '예약 취소 사유',
            'cancel.reasonPrompt': '취소 사유를 입력해주세요.',
            'cancel.reasonPlaceholder': '예: 고객 요청, 일정 변경, 중복 예약',
            'cancel.reasonOk': '취소 처리',
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
            'flow.futureCheckinNotAllowed': 'Check-in is not available before the scheduled arrival date. You can cancel or edit the reservation.',
            'flow.confirm': 'Process {action} for {name}?',
            'flow.earlyCheckoutTitle': 'Early Check-out Confirmation',
            'flow.earlyCheckoutOk': 'Process Early Check-out',
            'flow.earlyCheckoutConfirm': '{name} is scheduled to check out on {checkoutDate} {checkoutTime}.\nThis is before the scheduled check-out date. Continuing will mark the reservation checked out today and set the room to needs cleaning.\nReview any remaining room charge, refund, or balance in settlement.\nProcess early check-out?',
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
            'booking.dirtyRoomConfirm': 'This room has not been cleaned yet. Register the new booking anyway?',
            'booking.newTitle': 'New Booking',
            'booking.created': 'New booking has been registered successfully.',
            'booking.updated': 'Reservation has been updated successfully.',
            'guest.roster.title': 'Reservation Guest List',
            'guest.count': '{count} people',
            'guest.emptyRoster': 'Search for a guest above, then add them as primary or companion.',
            'guest.id': 'Guest ID {id}',
            'guest.newInline': 'New guest entry',
            'guest.primary': 'Primary',
            'guest.companion': 'Companion',
            'guest.setPrimary': 'Primary',
            'guest.delete': 'Remove',
            'guest.addPrimary': 'Set as Primary',
            'guest.addCompanion': 'Add Companion',
            'guest.detailTitle': 'Guest Details',
            'guest.auditLog': 'View access log',
            'modal.editTitle': 'Reservation Details',
            'button.cancelBooking': 'Cancel Reservation',
            'button.close': 'Close',
            'button.save': 'Save',
            'cancel.notAllowed': 'Reservations after check-in cannot be cancelled. Please handle it through check-out, early departure, refund, or settlement correction.',
            'cancel.confirm': 'Cancel the reservation for {name}?',
            'cancel.reasonTitle': 'Cancellation Reason',
            'cancel.reasonPrompt': 'Enter a reason for cancelling this reservation.',
            'cancel.reasonPlaceholder': 'e.g. Guest request, schedule change, duplicate booking',
            'cancel.reasonOk': 'Cancel Reservation',
            'cancel.done': 'Reservation has been cancelled.'
        }
    };

    function actionLang() {
        return (localStorage.getItem('pms_lang') || document.getElementById('langSelect')?.value || window.currentLang || 'ko') === 'en'
            ? 'en'
            : 'ko';
    }

    function actionText(key, params = {}) {
        const lang = actionLang();
        let text = ACTION_MESSAGES[lang]?.[key] || '';
        if (text) {
            Object.keys(params).forEach(name => {
                text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), params[name]);
            });
            return text;
        }
        const catalogKey = `reservation.${key}`;
        if (typeof window.t === 'function') {
            text = window.t(catalogKey, params);
            if (text && text !== catalogKey) return text;
        }
        text = ACTION_MESSAGES[lang]?.[key] || ACTION_MESSAGES.ko[key] || key;
        Object.keys(params).forEach(name => {
            text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), params[name]);
        });
        return text;
    }

    const UNIFIED_MODAL_TEXT = {
        ko: {
            'booking.checkoutBeforeCheckin': '체크아웃은 체크인과 같거나 이후 날짜여야 합니다.',
            'booking.checkoutTimeBeforeCheckin': '같은 날짜에는 체크아웃 시간이 체크인 시간보다 늦어야 합니다.',
            'booking.lateCheckoutTimeInvalid': '레이트 체크아웃 시간은 기본 체크아웃 시간보다 늦어야 합니다.',
            checkInDate: '체크인',
            checkOutDate: '체크아웃',
            checkInTime: '체크인 시간',
            checkOutTime: '체크아웃 시간',
            lateCheckout: '레이트 체크아웃',
            lateCheckoutTime: '레이트 체크아웃 시간',
            stay: '숙박',
            room: '객실',
            financeTitle: '객실 요금 / 예치금',
            nightlyRate: '1박 객실 단가',
            roomAmount: '총 객실 금액',
            depositTotal: '예치금 페소 기준 합계',
            balanceDue: '추후 정산 잔액',
            depositRows: '예치금 수납 현황',
            addRow: '행 추가',
            currency: '통화',
            receivedAmount: '실제 받은 금액',
            phpEquivalent: '페소 반영액',
            noDepositRows: '예치금 통화를 행으로 추가해주세요.',
            rowHelp: '달러/원화는 실제 받은 금액과 별도로 페소 반영액을 입력합니다. 페소 수납은 받은 금액이 그대로 페소 기준 합계에 반영됩니다.',
            summary: '총 금액 {total} · 예치금 {deposit} · 추후 정산 {balance} · 예치금 수납 통화 {rows}',
            noPrepaid: '미입력',
            phpPrefix: '페소',
            rateCalendar: '요금 캘린더',
            rateMixed: '요금 캘린더+기본요금',
            rateBase: '객실 기본요금',
            discountApplied: '고객 할인 {percent}% 적용',
            noDiscount: '고객 할인 없음',
            rateQuote: '{source} 기준 {base} / {nights}박 · {discount} = {total}',
            timeSummary: '입실 {checkInTime} / 퇴실 {checkOutTime}',
            timeSummaryLate: '입실 {checkInTime} / 퇴실 {checkOutTime} / 레이트 {lateCheckoutTime}',
            roomMoveAllowed: '객실 이동 가능',
            roomAvailable: '객실 예약 가능',
            roomBlocked: '단체 블록',
            roomOccupied: '투숙 중',
            groupLinked: '단체 연결',
            vip: '우수 고객',
            groupNoticeLabel: '단체 연결',
            groupNoticeText: '단체관리에서 연결된 예약: {group}',
            roomHistory: '객실 변경 이력',
            historyCount: '{count}건',
            historyEmpty: '객실 변경 이력이 없습니다.',
            settlementApplied: '정산 반영',
            historyTotal: '총액',
            historyDeposit: '예치금',
            historyBalance: '잔액',
            historySettled: '정산 완료',
            historyPending: '정산 확인',
            depositPhpRequired: '달러/원화 예치금 행에는 페소 반영액을 입력해주세요.',
            depositExceedsTotal: '예치금 페소 반영액이 총 객실 금액을 초과할 수 없습니다.',
            placardPrint: '플랫카드 인쇄',
            placardPreview: '플랫카드 미리보기',
            flight: '항공편',
            placardPlaceholder: '예: 대한항공 KE641',
            placardHelp: '입력하는 즉시 위 미리보기에 반영됩니다. 저장을 누르면 예약 데이터에 저장됩니다.',
            processCheckin: '체크인 처리',
            processCheckout: '체크아웃 처리',
            placardGuestExtra: '{name} 외 {count}명',
            placardFlightEmpty: '항공편 미입력',
            placardUnsaved: '미리보기 반영됨 · 저장 전',
            placardSaved: '저장 완료 · 예약 데이터 저장됨',
            placardToast: '플랫카드 항공편이 저장되었습니다.'
            ,
            readonlyTitle: '체크인 이후 예약은 운영 정정만 가능합니다.',
            readonlyBody: '대표투숙객과 숙박 날짜는 잠기며, 객실 이동·동반 투숙객·요금·예치금 정정은 저장 시 감사 로그에 기록됩니다.',
            readonlyGuestRoom: '투숙객: {guest} · 객실: {room}',
            baseTimesLockedTitle: '체크인 이후 입실/기본 퇴실시간은 변경할 수 없습니다.',
            blockEditableNotice: '단체 연결 객실입니다. 업체 연결은 유지되며, 여기에서 객실 변경과 대표·동반 투숙객 등록을 함께 처리할 수 있습니다.',
            blockLockedNotice: '단체 블록 상태입니다. 아직 개별 투숙객이 배정되지 않았으며, 투숙객은 단체 상세의 Rooming List에서 등록하거나 상태를 예약 확정으로 전환해야 연결됩니다.',
            guestRosterTitle: '예약 투숙객 명단',
            guestPrimary: '대표',
            guestCompanion: '동반',
            guestDetails: '고객 상세 정보',
            guestAccessLog: '열람 로그 기록',
            guestNameLabel: '고객명',
            guestPhoneLabel: '휴대폰',
            guestEmailLabel: '이메일',
            guestIdCheckLabel: '신분증 확인',
            guestNotesLabel: '특이사항',
            reservationNoteLabel: '예약 메모',
            reservationNotePlaceholder: '예: 늦은 도착, 객실 준비 요청'
        },
        en: {
            'booking.checkoutBeforeCheckin': 'Check-out must be on or after check-in.',
            'booking.checkoutTimeBeforeCheckin': 'For a same-day stay, check-out time must be later than check-in time.',
            'booking.lateCheckoutTimeInvalid': 'Late check-out time must be later than the standard check-out time.',
            checkInDate: 'Check-in',
            checkOutDate: 'Check-out',
            checkInTime: 'Check-in Time',
            checkOutTime: 'Check-out Time',
            lateCheckout: 'Late Check-out',
            lateCheckoutTime: 'Late Check-out Time',
            stay: 'Stay',
            room: 'Room',
            financeTitle: 'Room Rate / Deposit',
            nightlyRate: 'Room Rate per Night',
            roomAmount: 'Room Amount',
            depositTotal: 'Deposit Total in PHP',
            balanceDue: 'Settlement Balance',
            depositRows: 'Deposit Payment Status',
            addRow: 'Add Row',
            currency: 'Currency',
            receivedAmount: 'Received Amount',
            phpEquivalent: 'PHP Equivalent',
            noDepositRows: 'Add deposit currency rows.',
            rowHelp: 'For USD/KRW, enter the received amount and the PHP equivalent separately. PHP deposits are reflected directly in the PHP total.',
            summary: 'Total {total} · Deposit {deposit} · Settlement {balance} · Deposit currencies {rows}',
            noPrepaid: 'Not entered',
            phpPrefix: 'PHP',
            rateCalendar: 'Rate Calendar',
            rateMixed: 'Rate Calendar + Base Rate',
            rateBase: 'Room Base Rate',
            discountApplied: 'Guest discount {percent}% applied',
            noDiscount: 'No guest discount',
            rateQuote: '{source} {base} / {nights} nights · {discount} = {total}',
            timeSummary: 'Check-in {checkInTime} / Check-out {checkOutTime}',
            timeSummaryLate: 'Check-in {checkInTime} / Check-out {checkOutTime} / Late {lateCheckoutTime}',
            roomMoveAllowed: 'rooms available for move',
            roomAvailable: 'available rooms',
            roomBlocked: 'Group Block',
            roomOccupied: 'In-house',
            groupLinked: 'Group linked',
            vip: 'VIP',
            groupNoticeLabel: 'Group Link',
            groupNoticeText: 'Linked from group management: {group}',
            roomHistory: 'Room Change History',
            historyCount: '{count} records',
            historyEmpty: 'No room change history.',
            settlementApplied: 'Settlement Applied',
            historyTotal: 'Total',
            historyDeposit: 'Deposit',
            historyBalance: 'Balance',
            historySettled: 'Settled',
            historyPending: 'Settlement Check',
            depositPhpRequired: 'Enter the PHP equivalent for USD/KRW deposit rows.',
            depositExceedsTotal: 'Deposit PHP equivalent cannot exceed the total room amount.',
            placardPrint: 'Print Placard',
            placardPreview: 'Placard Preview',
            flight: 'Flight',
            placardPlaceholder: 'E.g. Korean Air KE641',
            placardHelp: 'Typing updates the preview immediately. Save stores it on the reservation.',
            processCheckin: 'Process Check-in',
            processCheckout: 'Process Check-out',
            placardGuestExtra: '{name} + {count}',
            placardFlightEmpty: 'Flight not entered',
            placardUnsaved: 'Preview updated · Not saved',
            placardSaved: 'Saved · Reservation data updated',
            placardToast: 'Placard flight has been saved.'
            ,
            readonlyTitle: 'After check-in, only operational corrections are allowed.',
            readonlyBody: 'The primary guest and stay dates are locked. Room moves, companion guests, rate, and deposit corrections are recorded in the audit log when saved.',
            readonlyGuestRoom: 'Guest: {guest} · Room: {room}',
            baseTimesLockedTitle: 'Check-in/default check-out times cannot be changed after check-in.',
            blockEditableNotice: 'This is a group-linked room. The company link remains, and room changes plus primary/companion guest assignment can be handled here.',
            blockLockedNotice: 'This is a group block. No individual guest has been assigned yet. Register guests in the group detail Rooming List or convert the status to confirmed.',
            guestRosterTitle: 'Reservation Guest List',
            guestPrimary: 'Primary',
            guestCompanion: 'Companion',
            guestDetails: 'Guest Details',
            guestAccessLog: 'View access log',
            guestNameLabel: 'Guest Name',
            guestPhoneLabel: 'Mobile Phone',
            guestEmailLabel: 'Email',
            guestIdCheckLabel: 'ID Check',
            guestNotesLabel: 'Notes',
            reservationNoteLabel: 'Reservation Note',
            reservationNotePlaceholder: 'E.g. late arrival or room preparation request'
        }
    };

    function unifiedModalText(key, params = {}) {
        const lang = actionLang();
        let text = UNIFIED_MODAL_TEXT[lang]?.[key] || UNIFIED_MODAL_TEXT.en[key] || key;
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

    function showReservationAlert(message, type = 'error') {
        if (window.showAlert) return window.showAlert(message, { type });
        if (window.showToast) return window.showToast(message, type);
        console.warn(message);
        return null;
    }

    async function confirmReservationDialog(message, options = {}) {
        if (window.showConfirm) return await window.showConfirm(message, options);
        console.warn('PMS confirmation dialog is unavailable.', message);
        return false;
    }

    async function promptReservationDialog(message, options = {}) {
        if (window.showPrompt) return await window.showPrompt(message, options);
        console.warn('PMS prompt dialog is unavailable.', message);
        return null;
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

    function reservationDepositValue(res = null) {
        if (!res) return 0;
        const direct = Number(res.depositAmount ?? res.preauthAmount ?? (typeof res.deposit === 'object' ? undefined : res.deposit));
        if (Number.isFinite(direct) && direct > 0) return direct;
        if (res.deposit && typeof res.deposit === 'object') {
            const fromObject = Number(res.deposit.amount || 0);
            if (Number.isFinite(fromObject) && fromObject > 0) return fromObject;
        }
        if (res.paymentPlan && typeof res.paymentPlan === 'object') {
            const fromPlan = Number(res.paymentPlan.depositAmount || res.paymentPlan.deposit || 0);
            if (Number.isFinite(fromPlan) && fromPlan > 0) return fromPlan;
        }
        return Number.isFinite(direct) ? direct : 0;
    }

    function currencyFractionDigits(currency = 'PHP') {
        const code = String(currency || 'PHP').toUpperCase();
        return code === 'USD' ? 2 : 0;
    }

    function normalizeMoneyAmount(amount, currency = 'PHP') {
        const value = Number(amount || 0);
        if (!Number.isFinite(value)) return 0;
        const digits = currencyFractionDigits(currency);
        const factor = 10 ** digits;
        return Math.max(0, Math.round(value * factor) / factor);
    }

    function parseMoneyInput(value, currency = 'PHP') {
        const normalized = String(value ?? '').replace(/[^\d.-]/g, '');
        const amount = Number(normalized);
        return normalizeMoneyAmount(amount, currency);
    }

    function formatMoneyInputValue(amount, currency = 'PHP') {
        const value = normalizeMoneyAmount(amount, currency);
        const digits = currencyFractionDigits(currency);
        return digits ? value.toFixed(digits) : String(Math.round(value));
    }

    function formatSettlementMoney(amount, currency = 'PHP') {
        const digits = currencyFractionDigits(currency);
        try {
            return new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency,
                minimumFractionDigits: digits,
                maximumFractionDigits: digits
            }).format(normalizeMoneyAmount(amount, currency));
        } catch(e) {
            return `${currency} ${normalizeMoneyAmount(amount, currency).toLocaleString()}`;
        }
    }

    const PREPAYMENT_CURRENCIES = ['PHP', 'USD', 'KRW'];
    const PREPAYMENT_CURRENCY_LABELS = { PHP: '페소', USD: '달러', KRW: '원화' };

    function normalizeCurrencyBreakdown(values = {}) {
        return PREPAYMENT_CURRENCIES.reduce((acc, currency) => {
            const digits = currencyFractionDigits(currency);
            acc[currency] = normalizeMoneyAmount(values?.[currency] || 0, currency);
            if (!digits) acc[currency] = Math.round(acc[currency]);
            return acc;
        }, { PHP: 0, USD: 0, KRW: 0 });
    }

    function normalizePrepaidRow(row = {}) {
        const currency = PREPAYMENT_CURRENCIES.includes(row.currency) ? row.currency : 'PHP';
        const amount = normalizeMoneyAmount(row.amount ?? row.receivedAmount ?? 0, currency);
        const phpEquivalent = currency === 'PHP'
            ? amount
            : normalizeMoneyAmount(row.phpEquivalent ?? row.appliedPhpAmount ?? row.equivalentPhp ?? 0, 'PHP');
        if (!amount && !phpEquivalent) return null;
        return { currency, amount, phpEquivalent };
    }

    function prepaidRowsFromLegacyBreakdown(values = {}, prepaidAmount = 0) {
        const breakdown = normalizeCurrencyBreakdown(values);
        const active = PREPAYMENT_CURRENCIES.filter(currency => Number(breakdown[currency] || 0) > 0);
        if (!active.length && prepaidAmount > 0) return [{ currency: 'PHP', amount: prepaidAmount, phpEquivalent: prepaidAmount }];
        return active.map((currency, index) => normalizePrepaidRow({
            currency,
            amount: breakdown[currency],
            phpEquivalent: currency === 'PHP' ? breakdown[currency] : (active.length === 1 || index === 0 ? prepaidAmount : 0)
        })).filter(Boolean);
    }

    function reservationPrepaidRows(res = null) {
        if (!res) return [];
        const savedRows = res?.paymentPlan?.prepaidReceivedRows || res?.prepaidReceivedRows;
        if (Array.isArray(savedRows)) return savedRows.map(normalizePrepaidRow).filter(Boolean);
        const fromPlan = res?.paymentPlan?.prepaidReceivedBreakdown || res?.prepaidReceivedBreakdown;
        return prepaidRowsFromLegacyBreakdown(fromPlan, reservationPrepaidValue(res));
    }

    function prepaidRowsFromInputs() {
        return [...document.querySelectorAll('#unifiedPrepaidRows .prepaid-row')].map(row => {
            const currency = row.querySelector('.prepaid-row-currency')?.value || 'PHP';
            return normalizePrepaidRow({
                currency,
                amount: parseMoneyInput(row.querySelector('.prepaid-row-amount')?.value, currency),
                phpEquivalent: parseMoneyInput(row.querySelector('.prepaid-row-php')?.value, 'PHP')
            });
        }).filter(Boolean);
    }

    function prepaidPhpTotalFromRows(rows = []) {
        return rows.reduce((sum, row) => sum + Number(row.phpEquivalent || 0), 0);
    }

    function prepaidBreakdownFromRows(rows = []) {
        return rows.reduce((acc, row) => {
            const currency = PREPAYMENT_CURRENCIES.includes(row.currency) ? row.currency : 'PHP';
            acc[currency] = (acc[currency] || 0) + Number(row.amount || 0);
            return acc;
        }, { PHP: 0, USD: 0, KRW: 0 });
    }

    function prepaidBreakdownFromInputs() {
        return prepaidBreakdownFromRows(prepaidRowsFromInputs());
    }

    function prepaidRowsText(rows = []) {
        const normalized = rows.map(normalizePrepaidRow).filter(Boolean);
        if (!normalized.length) return unifiedModalText('noPrepaid');
        return normalized.map(row => {
            const label = PREPAYMENT_CURRENCY_LABELS[row.currency] || row.currency;
            const amountText = `${label} ${Number(row.amount || 0).toLocaleString()}`;
            return row.currency === 'PHP'
                ? amountText
                : `${amountText} · ${unifiedModalText('phpPrefix')} ${Number(row.phpEquivalent || 0).toLocaleString()}`;
        }).join(' · ');
    }

    function syncUnifiedPrepaidRow(row) {
        if (!row) return;
        const currency = row.querySelector('.prepaid-row-currency')?.value || 'PHP';
        const phpWrap = row.querySelector('.prepaid-row-php-wrap');
        const phpInput = row.querySelector('.prepaid-row-php');
        if (phpWrap) phpWrap.style.display = currency === 'PHP' ? 'none' : 'block';
        if (phpInput && currency === 'PHP') phpInput.value = '';
    }

    function renderPrepaidRowsEmpty() {
        const list = document.getElementById('unifiedPrepaidRows');
        if (!list) return;
        if (list.querySelector('.prepaid-row')) return;
        list.innerHTML = `<div class="prepaid-empty" style="border:1px dashed var(--border);border-radius:8px;padding:10px;color:var(--txt3);font-size:.72rem;font-weight:800;text-align:center">${actionEscapeHtml(unifiedModalText('noDepositRows'))}</div>`;
    }

    function addUnifiedPrepaidRow(row = {}) {
        const list = document.getElementById('unifiedPrepaidRows');
        if (!list) return;
        list.querySelector('.prepaid-empty')?.remove();
        const normalized = normalizePrepaidRow(row) || { currency: row.currency || 'PHP', amount: 0, phpEquivalent: 0 };
        const div = document.createElement('div');
        div.className = 'prepaid-row';
        div.style.cssText = 'display:grid;grid-template-columns:minmax(100px,.7fr) minmax(130px,1fr) minmax(130px,1fr) auto;gap:8px;align-items:end;margin-top:8px';
        div.innerHTML = `
            <div class="md-item">
                <div class="md-label" data-action-i18n="currency" style="color:var(--txt2);font-size:0.72rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('currency'))}</div>
                <select class="prepaid-row-currency" onchange="syncUnifiedPrepaidRows()" data-no-currency-normalize="true" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:700;box-sizing:border-box;background:#fff;">
                    <option value="PHP">PHP</option>
                    <option value="USD">USD</option>
                    <option value="KRW">KRW</option>
                </select>
            </div>
            <div class="md-item">
                <div class="md-label" data-action-i18n="receivedAmount" style="color:var(--txt2);font-size:0.72rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('receivedAmount'))}</div>
                <input class="prepaid-row-amount" type="number" min="0" step="0.01" oninput="syncUnifiedPrepaidRows()" data-no-currency-normalize="true" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:700;box-sizing:border-box;background:#fff;" placeholder="0">
            </div>
            <div class="md-item prepaid-row-php-wrap">
                <div class="md-label" data-action-i18n="phpEquivalent" style="color:var(--txt2);font-size:0.72rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('phpEquivalent'))}</div>
                <input class="prepaid-row-php" type="number" min="0" step="1" oninput="syncUnifiedPrepaidRows()" data-no-currency-normalize="true" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:700;box-sizing:border-box;background:#fff;" placeholder="0">
            </div>
            <button type="button" class="btn-outline" onclick="removeUnifiedPrepaidRow(this)" style="height:38px;padding:0 10px;color:var(--danger);border-color:rgba(239,68,68,.45)"><i class="fa-solid fa-trash"></i></button>
        `;
        list.appendChild(div);
        div.querySelector('.prepaid-row-currency').value = PREPAYMENT_CURRENCIES.includes(normalized.currency) ? normalized.currency : 'PHP';
        div.querySelector('.prepaid-row-amount').value = normalized.amount ? formatMoneyInputValue(normalized.amount, normalized.currency) : '';
        div.querySelector('.prepaid-row-php').value = normalized.currency !== 'PHP' && normalized.phpEquivalent ? formatMoneyInputValue(normalized.phpEquivalent, 'PHP') : '';
        syncUnifiedPrepaidRow(div);
        syncUnifiedBalance();
    }

    function removeUnifiedPrepaidRow(button) {
        button?.closest('.prepaid-row')?.remove();
        renderPrepaidRowsEmpty();
        syncUnifiedBalance();
    }

    function setPrepaidRows(rows = []) {
        const list = document.getElementById('unifiedPrepaidRows');
        if (!list) return;
        list.innerHTML = '';
        const normalized = Array.isArray(rows) ? rows.map(normalizePrepaidRow).filter(Boolean) : [];
        normalized.forEach(row => addUnifiedPrepaidRow(row));
        renderPrepaidRowsEmpty();
    }

    function syncUnifiedPrepaidRows() {
        document.querySelectorAll('#unifiedPrepaidRows .prepaid-row').forEach(syncUnifiedPrepaidRow);
        syncUnifiedBalance();
    }

    let unifiedRateRowsCache = null;
    let unifiedRoomTypesCache = null;
    let unifiedRateQuoteSeq = 0;
    let unifiedLastRateQuote = null;

    function unifiedAmountValue(value) {
        if (window.PmsMockApi?.amountValue) return window.PmsMockApi.amountValue(value);
        if (value && typeof value === 'object') return Number(value.amount || 0);
        return Number(value || 0);
    }

    function unifiedCurrencyOf(value, fallback = 'PHP') {
        return (value && typeof value === 'object' && value.currency) || fallback;
    }

    async function unifiedRateRows() {
        if (Array.isArray(unifiedRateRowsCache)) return unifiedRateRowsCache;
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/rates/calendar');
                unifiedRateRowsCache = window.PmsMockApi.items(env);
                return unifiedRateRowsCache;
            }
        } catch (error) {
            console.warn('Rate calendar lookup failed', error);
        }
        try {
            const res = await fetch('../data/api/v1/rates/calendar.json', { cache: 'no-store' });
            const payload = await res.json();
            unifiedRateRowsCache = Array.isArray(payload?.data?.items) ? payload.data.items : [];
        } catch (error) {
            console.warn('Rate calendar fallback failed', error);
            unifiedRateRowsCache = [];
        }
        return unifiedRateRowsCache;
    }

    async function unifiedRoomTypes() {
        if (Array.isArray(unifiedRoomTypesCache)) return unifiedRoomTypesCache;
        try {
            if (window.PmsAPI?.getAllRoomTypes) {
                const items = await window.PmsAPI.getAllRoomTypes();
                if (Array.isArray(items) && items.length) {
                    unifiedRoomTypesCache = items;
                    return unifiedRoomTypesCache;
                }
            }
        } catch (error) {
            console.warn('Room type lookup failed', error);
        }
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/room-types');
                unifiedRoomTypesCache = window.PmsMockApi.items(env).map(item => window.PmsMockApi.toLegacyRoomType ? window.PmsMockApi.toLegacyRoomType(item) : item);
                return unifiedRoomTypesCache;
            }
        } catch (error) {
            console.warn('Room type mock fallback failed', error);
        }
        try {
            const res = await fetch('../data/api/v1/room-types/index.json', { cache: 'no-store' });
            const payload = await res.json();
            unifiedRoomTypesCache = Array.isArray(payload?.data?.items) ? payload.data.items : [];
        } catch (error) {
            console.warn('Room type static fallback failed', error);
            unifiedRoomTypesCache = [];
        }
        return unifiedRoomTypesCache;
    }

    function unifiedNormalizeKey(value) {
        return String(value || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
    }

    function unifiedRoomTypeKeys(room = null) {
        return [
            room?.roomTypeId,
            room?.typeId,
            room?.type,
            room?.roomTypeName,
            room?.code,
            room?.name
        ].map(unifiedNormalizeKey).filter(Boolean);
    }

    function unifiedRateRowMatchesRoom(row, room) {
        const roomKeys = unifiedRoomTypeKeys(room);
        if (!roomKeys.length) return false;
        const rowKeys = [
            row?.roomTypeId,
            row?.roomTypeName,
            row?.typeId,
            row?.type,
            row?.code
        ].map(unifiedNormalizeKey).filter(Boolean);
        return rowKeys.some(key => roomKeys.includes(key));
    }

    function unifiedBaseRateForRoom(room, roomTypes = []) {
        const direct = unifiedAmountValue(room?.baseRate ?? room?.rate ?? room?.price ?? room?.defaultRate ?? room?.rackRate);
        if (Number.isFinite(direct) && direct > 0) return {
            amount: direct,
            currency: unifiedCurrencyOf(room?.baseRate ?? room?.rate, 'PHP'),
            source: 'room'
        };
        const keys = unifiedRoomTypeKeys(room);
        const matched = roomTypes.find(type => unifiedRoomTypeKeys(type).some(key => keys.includes(key)));
        const typeRate = unifiedAmountValue(matched?.baseRate ?? matched?.basePrice ?? matched?.rate ?? matched?.price);
        return {
            amount: Number.isFinite(typeRate) ? typeRate : 0,
            currency: unifiedCurrencyOf(matched?.baseRate ?? matched?.rate, 'PHP'),
            source: matched ? 'room-type' : 'none'
        };
    }

    function unifiedGuestTierDiscountPercent(tier, rateRow = null) {
        const value = unifiedNormalizeKey(tier || 'standard');
        if (!value || value === 'standard' || value === 'regular') return 0;
        if (value.includes('silver')) return 5;
        if (value.includes('gold')) return 10;
        if (value.includes('vip') || value.includes('platinum') || value.includes('diamond')) {
            const rowDiscount = Number(rateRow?.vipDiscountPercent ?? rateRow?.customerDiscountPercent);
            return Number.isFinite(rowDiscount) ? rowDiscount : 20;
        }
        const explicit = Number(rateRow?.customerDiscountPercent);
        return Number.isFinite(explicit) ? explicit : 0;
    }

    function unifiedPrimaryGuestTier() {
        const primary = getUnifiedPrimaryGuestEntry();
        return compactValue(primary?.tier || primary?.vip) || 'standard';
    }

    function unifiedSelectedRoom() {
        const selectedValue = document.getElementById('unifiedRoom')?.value || '';
        return (Array.isArray(window.rooms) ? window.rooms : []).find(room =>
            roomLabel(room) === selectedValue ||
            room?.id === selectedValue ||
            room?.fullRoom === selectedValue ||
            room?.roomId === selectedValue ||
            room?.number === selectedValue ||
            room?.display === selectedValue
        ) || null;
    }

    async function buildUnifiedRoomRateQuote() {
        const room = unifiedSelectedRoom();
        const range = getUnifiedDateRange({ autoFix: true });
        if (!room || !range.valid) return null;
        const rows = await unifiedRateRows();
        const roomTypes = await unifiedRoomTypes();
        const fallback = unifiedBaseRateForRoom(room, roomTypes);
        const currency = reservationCurrency(null) || fallback.currency || 'PHP';
        const tier = unifiedPrimaryGuestTier();
        const nights = Math.max(1, Math.round((range.checkout - range.checkin) / 86400000));
        let baseTotal = 0;
        let finalTotal = 0;
        let calendarNights = 0;
        let discountPercent = 0;

        for (let offset = 0; offset < nights; offset += 1) {
            const day = new Date(range.checkin);
            day.setDate(day.getDate() + offset);
            const dateKey = toDateInputValue(day);
            const row = rows.find(item => item?.date === dateKey && unifiedRateRowMatchesRoom(item, room));
            const nightlyBase = row ? unifiedAmountValue(row.publicRate ?? row.baseRate) : fallback.amount;
            const nightlyDiscount = unifiedGuestTierDiscountPercent(tier, row);
            const nightlyFinal = normalizeMoneyAmount(nightlyBase * (100 - nightlyDiscount) / 100, currency);
            baseTotal += nightlyBase;
            finalTotal += nightlyFinal;
            discountPercent = Math.max(discountPercent, nightlyDiscount);
            if (row) calendarNights += 1;
        }

        return {
            roomId: roomLabel(room),
            roomType: roomTypeDisplay(room.type || room.roomTypeName || room.roomTypeId),
            nights,
            baseTotal: normalizeMoneyAmount(baseTotal, currency),
            total: normalizeMoneyAmount(finalTotal, currency),
            averageRate: normalizeMoneyAmount(finalTotal / nights, currency),
            discountPercent,
            tier,
            currency,
            source: calendarNights === nights ? 'calendar' : (calendarNights ? 'mixed' : fallback.source),
            calendarNights
        };
    }

    function unifiedRateQuoteText(quote) {
        if (!quote) return '';
        const sourceText = quote.source === 'calendar'
            ? unifiedModalText('rateCalendar')
            : (quote.source === 'mixed' ? unifiedModalText('rateMixed') : unifiedModalText('rateBase'));
        const discountText = quote.discountPercent
            ? unifiedModalText('discountApplied', { percent: quote.discountPercent })
            : unifiedModalText('noDiscount');
        return unifiedModalText('rateQuote', {
            source: sourceText,
            base: formatSettlementMoney(quote.baseTotal, quote.currency),
            nights: quote.nights,
            discount: discountText,
            total: formatSettlementMoney(quote.total, quote.currency)
        });
    }

    function shouldApplyUnifiedRateQuote(input, quote, force = false) {
        if (!input || !quote) return false;
        if (force) return true;
        if (input.dataset.manualAmount === 'true') return false;
        const current = parseMoneyInput(input.value, quote.currency);
        const previousAuto = Number(input.dataset.autoQuoteTotal || 0);
        if (!current) return true;
        return !!previousAuto && current === normalizeMoneyAmount(previousAuto, quote.currency);
    }

    async function refreshUnifiedRateQuote(options = {}) {
        const seq = ++unifiedRateQuoteSeq;
        const hint = document.getElementById('unifiedRateQuoteHint');
        const amountInput = document.getElementById('unifiedAmount');
        const nightlyInput = document.getElementById('unifiedNightlyRate');
        if (!amountInput) return null;
        const quote = await buildUnifiedRoomRateQuote();
        if (seq !== unifiedRateQuoteSeq) return quote;
        unifiedLastRateQuote = quote;
        if (hint) hint.textContent = quote ? unifiedRateQuoteText(quote) : '';
        if (quote && shouldApplyUnifiedRateQuote(amountInput, quote, !!options.force)) {
            amountInput.dataset.currency = quote.currency;
            amountInput.dataset.autoQuoteTotal = String(quote.total);
            if (nightlyInput) {
                nightlyInput.dataset.currency = quote.currency;
                nightlyInput.value = formatMoneyInputValue(quote.averageRate, quote.currency);
                configureUnifiedMoneyInput(nightlyInput, quote.currency);
            }
            amountInput.value = formatMoneyInputValue(quote.total, quote.currency);
            configureUnifiedMoneyInput(amountInput, quote.currency);
            const prepaidInput = document.getElementById('unifiedPrepaid');
            if (prepaidInput) {
                prepaidInput.dataset.currency = quote.currency;
                configureUnifiedMoneyInput(prepaidInput, quote.currency);
            }
            syncUnifiedBalance();
        }
        return quote;
    }

    function currentReservationActor() {
        const role = localStorage.getItem('currentUserRole') || window.currentUserRole || 'sys_admin';
        const profiles = {
            sys_admin: { id: 's1', name: 'Nguyen Kim', roleLabel: 'Admin' },
            sys_gm: { id: 's2', name: 'Robert Ford', roleLabel: 'General Manager' },
            sys_desk: { id: 's3', name: 'Sarah Connor', roleLabel: 'Front Desk' },
            sys_housekeeping: { id: 's5', name: 'Maria Garcia', roleLabel: 'Housekeeping' },
            sys_maintenance: { id: 's6', name: 'James Bond', roleLabel: 'Maintenance' }
        };
        const profile = profiles[role] || profiles.sys_admin;
        return {
            id: localStorage.getItem('mock_user_id') || profile.id || role,
            name: profile.name,
            role,
            roleLabel: profile.roleLabel
        };
    }

    function reservationRoomChangeHistory(res) {
        const values = [
            ...(Array.isArray(res?.roomChangeHistory) ? res.roomChangeHistory : []),
            ...(Array.isArray(res?.roomMoveHistory) ? res.roomMoveHistory : [])
        ];
        const seen = new Set();
        return values.map(item => {
            const changedBy = item.changedBy || item.actor || {};
            return {
                id: item.id || `${item.changedAt || item.createdAt || ''}-${item.fromRoom || item.fromFullRoom || ''}-${item.toRoom || item.toFullRoom || ''}`,
                reservationId: item.reservationId || res?.id || '',
                fromRoom: item.fromRoom || item.fromRoomNo || item.fromFullRoom || '',
                toRoom: item.toRoom || item.toRoomNo || item.toFullRoom || '',
                fromFullRoom: item.fromFullRoom || item.fromRoom || '',
                toFullRoom: item.toFullRoom || item.toRoom || '',
                changedAt: item.changedAt || item.createdAt || '',
                changedBy: {
                    id: changedBy.id || item.changedById || '',
                    name: changedBy.name || item.changedByName || item.changedBy || '-',
                    role: changedBy.role || item.changedByRole || '',
                    roleLabel: changedBy.roleLabel || item.changedByRoleLabel || ''
                },
                reason: item.reason || item.note || 'frontdesk-room-change',
                affectsSettlement: item.affectsSettlement !== false,
                settlementStatus: item.settlementStatus || (item.affectsSettlement === false ? 'none' : 'pending'),
                beforeAmount: Number(item.beforeAmount || 0),
                afterAmount: Number(item.afterAmount || 0),
                beforePrepaid: Number(item.beforePrepaid || 0),
                afterPrepaid: Number(item.afterPrepaid || 0),
                beforeDeposit: Number(item.beforeDeposit || 0),
                afterDeposit: Number(item.afterDeposit || 0),
                balanceDue: Number(item.balanceDue || 0),
                currency: item.currency || reservationCurrency(res),
                note: item.note || ''
            };
        }).filter(item => {
            if (!item.fromRoom && !item.toRoom) return false;
            const key = item.id || `${item.changedAt}-${item.fromRoom}-${item.toRoom}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        }).sort((a, b) => String(b.changedAt || '').localeCompare(String(a.changedAt || '')));
    }

    function roomChangeRouteText(item) {
        return `${item.fromRoom || item.fromFullRoom || '-'} -> ${item.toRoom || item.toFullRoom || '-'}`;
    }

    function formatReservationDateTime(value) {
        const date = value ? new Date(value) : new Date();
        if (Number.isNaN(date.getTime())) return '-';
        try {
            return new Intl.DateTimeFormat('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(date);
        } catch(e) {
            return String(value || '-');
        }
    }

    function renderUnifiedRoomHistory(res) {
        const panel = document.getElementById('unifiedRoomHistoryPanel');
        const body = document.getElementById('unifiedRoomHistoryBody');
        const count = document.getElementById('unifiedRoomHistoryCount');
        if (!panel || !body) return;
        if (!res) {
            panel.style.display = 'none';
            body.innerHTML = '';
            if (count) count.textContent = unifiedModalText('historyCount', { count: 0 });
            return;
        }
        const history = reservationRoomChangeHistory(res);
        panel.style.display = 'block';
        if (count) count.textContent = unifiedModalText('historyCount', { count: history.length });
        if (!history.length) {
            body.innerHTML = `<div style="font-size:.78rem;color:var(--txt3);font-weight:700;background:#f8fafc;border:1px dashed var(--border);border-radius:8px;padding:12px">${actionEscapeHtml(unifiedModalText('historyEmpty'))}</div>`;
            return;
        }
        body.innerHTML = history.map(item => `
            <div style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:start;padding:11px 0;border-top:1px solid var(--border2)">
                <div style="min-width:0">
                    <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap">
                        <span style="font-size:.82rem;font-weight:900;color:var(--txt)"><i class="fa-solid fa-right-left" style="color:var(--primary);margin-right:5px"></i>${actionEscapeHtml(roomChangeRouteText(item))}</span>
                        ${item.affectsSettlement ? `<span style="font-size:.66rem;font-weight:900;color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-radius:999px;padding:2px 7px">${actionEscapeHtml(unifiedModalText('settlementApplied'))}</span>` : ''}
                    </div>
                    <div style="font-size:.72rem;color:var(--txt3);font-weight:700;margin-top:4px">${actionEscapeHtml(formatReservationDateTime(item.changedAt))} · ${actionEscapeHtml(item.changedBy.name || '-')}</div>
                    <div style="font-size:.72rem;color:var(--txt2);font-weight:700;margin-top:4px">${actionEscapeHtml(unifiedModalText('historyTotal'))} ${formatSettlementMoney(item.beforeAmount || reservationAmountValue(res), item.currency)} -> ${formatSettlementMoney(item.afterAmount || reservationAmountValue(res), item.currency)} · ${actionEscapeHtml(unifiedModalText('historyDeposit'))} ${formatSettlementMoney(item.afterDeposit || reservationDepositValue(res), item.currency)} · ${actionEscapeHtml(unifiedModalText('historyBalance'))} ${formatSettlementMoney(item.balanceDue || 0, item.currency)}</div>
                </div>
                <div style="font-size:.68rem;font-weight:900;color:${item.settlementStatus === 'settled' ? 'var(--success)' : '#b45309'};background:${item.settlementStatus === 'settled' ? 'var(--success-lt)' : '#fff7ed'};border-radius:999px;padding:4px 8px;white-space:nowrap">${actionEscapeHtml(item.settlementStatus === 'settled' ? unifiedModalText('historySettled') : unifiedModalText('historyPending'))}</div>
            </div>
        `).join('');
    }

    function createRoomChangeRecord(res, data) {
        const changedAt = window.PmsDate?.nowIso ? window.PmsDate.nowIso() : new Date().toISOString();
        return {
            id: `RC-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            reservationId: res?.id || '',
            changedAt,
            changedBy: currentReservationActor(),
            fromRoom: data.fromRoom || '',
            toRoom: data.toRoom || '',
            fromFullRoom: data.fromFullRoom || data.fromRoom || '',
            toFullRoom: data.toFullRoom || data.toRoom || '',
            beforeAmount: Number(data.beforeAmount || 0),
            afterAmount: Number(data.afterAmount || 0),
            beforePrepaid: Number(data.beforePrepaid || 0),
            afterPrepaid: Number(data.afterPrepaid || 0),
            beforeDeposit: Number(data.beforeDeposit || 0),
            afterDeposit: Number(data.afterDeposit || 0),
            balanceDue: Number(data.balanceDue || 0),
            currency: data.currency || reservationCurrency(res),
            reason: 'frontdesk-room-change',
            note: '객실 변경으로 정산 확인 필요',
            affectsSettlement: true,
            settlementStatus: 'pending'
        };
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

    function sameRosterGuest(left, right) {
        const leftId = compactValue(left?.guestId || left?.id || left?.roomingGuestId);
        const rightId = compactValue(right?.guestId || right?.id || right?.roomingGuestId);
        if (leftId && rightId) return leftId === rightId;

        const leftEmail = compactValue(left?.email || left?.guestEmail).toLowerCase();
        const rightEmail = compactValue(right?.email || right?.guestEmail).toLowerCase();
        if (leftEmail && rightEmail && leftEmail === rightEmail) return true;

        const leftPhone = normalizeReservationGuestPhone(left?.phone || left?.mobile || left?.guestPhone).replace(/\D/g, '');
        const rightPhone = normalizeReservationGuestPhone(right?.phone || right?.mobile || right?.guestPhone).replace(/\D/g, '');
        if (leftPhone && rightPhone && leftPhone === rightPhone) return true;

        const leftName = compactValue(left?.name || left?.guestName || left?.roomingGuestName || left?.guest).toLowerCase();
        const rightName = compactValue(right?.name || right?.guestName || right?.roomingGuestName || right?.guest).toLowerCase();
        return !!leftName && leftName === rightName;
    }

    function rosterGuestIndex(entries, candidate) {
        return entries.findIndex(item => sameRosterGuest(item, candidate));
    }

    function normalizeRosterGuest(source, fallbackRole = 'companion') {
        if (!source) return null;
        const item = typeof source === 'string' ? { name: source } : source;
        const name = compactValue(item.name || item.guestName || item.roomingGuestName || item.guest);
        if (!name) return null;
        const nameParts = name.split(/\s+/).filter(Boolean);
        const firstName = compactValue(item.firstName || item.givenName || (nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : name));
        const lastName = compactValue(item.lastName || item.familyName || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''));
        const guestId = compactValue(item.guestId || item.id || item.roomingGuestId);
        return {
            key: guestId ? `id:${guestId}` : `name:${name.toLowerCase()}`,
            guestId,
            id: guestId,
            name,
            firstName,
            lastName,
            phone: compactValue(item.phone || item.mobile || item.guestPhone),
            email: compactValue(item.email || item.guestEmail),
            tier: compactValue(item.tier || item.vip || 'standard'),
            vip: compactValue(item.vip || item.tier || 'standard'),
            country: compactValue(item.country || item.nationality || item.nation),
            specialNotes: compactValue(item.specialNotes || item.guestNote || item.note || item.preferences),
            note: compactValue(item.note || item.specialNotes || item.guestNote || item.preferences),
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

    function normalizeReservationGuestPhone(value) {
        if (typeof window.normalizeGuestPhone === 'function') return window.normalizeGuestPhone(value);
        let text = String(value || '').replace(/[^\d+\-\s()]/g, '');
        text = text.replace(/(?!^)\+/g, '');
        return text.replace(/\s+/g, ' ').trim();
    }

    function isValidReservationGuestPhone(value, required = false) {
        if (typeof window.isValidGuestPhone === 'function') return window.isValidGuestPhone(value, { required });
        const digits = String(value || '').replace(/\D/g, '');
        if (!digits) return !required;
        return digits.length >= 7 && digits.length <= 15;
    }

    function reservationGuestInitials(name) {
        const initials = String(name || '')
            .trim()
            .split(/\s+/)
            .map(part => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
        return initials || 'G';
    }

    function persistentGuestMatch(raw, guestList = []) {
        const item = raw || {};
        const guestId = compactValue(item.guestId || item.id || item.roomingGuestId);
        const email = compactValue(item.email || item.guestEmail).toLowerCase();
        const name = compactValue(item.name || item.guestName || item.roomingGuestName || item.guest).toLowerCase();
        const phoneDigits = normalizeReservationGuestPhone(item.phone || item.mobile || item.guestPhone).replace(/\D/g, '');
        return guestList.find(guest => guestId && String(guest.id || guest.guestId || '') === guestId)
            || guestList.find(guest => email && String(guest.email || '').toLowerCase() === email)
            || guestList.find(guest => {
                const guestName = compactValue(guest.name || guest.guestName).toLowerCase();
                const guestPhoneDigits = normalizeReservationGuestPhone(guest.phone || guest.mobile || '').replace(/\D/g, '');
                return name && phoneDigits && guestName === name && guestPhoneDigits === phoneDigits;
            })
            || null;
    }

    async function persistNewGuestRecord(entry) {
        const firstName = compactValue(entry?.firstName || entry?.givenName);
        const lastName = compactValue(entry?.lastName || entry?.familyName);
        const name = compactValue(entry?.name || entry?.guestName || entry?.guest || [firstName, lastName].filter(Boolean).join(' '));
        const phone = normalizeReservationGuestPhone(entry?.phone || entry?.mobile || entry?.guestPhone);
        const email = compactValue(entry?.email || entry?.guestEmail);
        const nationality = compactValue(entry?.country || entry?.nationality || entry?.nation);
        const specialNotes = compactValue(entry?.specialNotes || entry?.guestNote || entry?.note || entry?.preferences);
        const nowIso = window.PmsDate?.nowIso ? window.PmsDate.nowIso() : new Date().toISOString();
        const id = `G-${nowIso.replace(/\D/g, '').slice(0, 14)}-${Math.floor(Math.random() * 1000)}`;
        const guest = {
            id,
            name,
            firstName: firstName || name.split(/\s+/).slice(0, -1).join(' ') || name,
            lastName: lastName || (name.split(/\s+/).length > 1 ? name.split(/\s+/).slice(-1)[0] : ''),
            init: reservationGuestInitials(name),
            color: '#3B82F6',
            nationality,
            nation: nationality,
            country: nationality,
            tier: 'standard',
            vip: 'standard',
            visits: 0,
            phone,
            email,
            status: 'active',
            document: { type: '', maskedNumber: '', status: 'pending' },
            docStatus: 'pending',
            documentStatus: 'pending',
            specialNotes,
            note: specialNotes,
            preferences: specialNotes,
            lastStayDate: '',
            totalSpend: { amount: 0, currency: 'PHP' },
            spend: 0,
            tags: ['reservation'],
            createdAt: nowIso,
            source: 'reservation-modal'
        };

        if (window.PmsMockApi) {
            await window.PmsMockApi.request('POST', '/crm/guests', { body: guest });
        }

        if (Array.isArray(window.guests)) {
            const exists = window.guests.some(item => String(item.id || item.guestId || '') === id);
            if (!exists) window.guests.unshift(guest);
        } else {
            window.guests = [guest];
        }
        if (Array.isArray(window.GUEST_DB)) {
            const exists = window.GUEST_DB.some(item => String(item.id || item.guestId || '') === id);
            if (!exists) window.GUEST_DB.unshift({ ...guest, spend: 0 });
        }
        try {
            if (typeof window.loadGuestDb === 'function') await window.loadGuestDb(true);
        } catch(e) {
            console.warn('Guest search refresh after reservation guest create failed', e);
        }
        localStorage.setItem('pms_guests', JSON.stringify(window.guests || []));
        return guest;
    }

    async function persistUnifiedRosterGuests() {
        if (!unifiedStayGuestRoster.length) return true;
        const guestList = await reservationGuestList();
        for (let index = 0; index < unifiedStayGuestRoster.length; index += 1) {
            const entry = unifiedStayGuestRoster[index];
            const matched = persistentGuestMatch(entry, guestList);
            if (matched) {
                const guestId = compactValue(matched.id || matched.guestId);
                unifiedStayGuestRoster[index] = {
                    ...entry,
                    id: guestId,
                    guestId,
                    firstName: compactValue(entry.firstName || matched.firstName || matched.givenName || ''),
                    lastName: compactValue(entry.lastName || matched.lastName || matched.familyName || ''),
                    phone: normalizeReservationGuestPhone(entry.phone || matched.phone || matched.mobile || ''),
                    email: compactValue(entry.email || matched.email || ''),
                    country: compactValue(entry.country || matched.country || matched.nationality || matched.nation || ''),
                    tier: compactValue(entry.tier || matched.tier || matched.vip || 'standard'),
                    vip: compactValue(entry.vip || matched.vip || matched.tier || 'standard'),
                    specialNotes: compactValue(entry.specialNotes || entry.note || matched.specialNotes || matched.note || ''),
                    note: compactValue(entry.note || entry.specialNotes || matched.note || matched.specialNotes || '')
                };
                continue;
            }

            if (compactValue(entry.guestId || entry.id)) continue;
            if (!compactValue(entry.firstName) || !compactValue(entry.lastName)) {
                showReservationAlert('신규 고객은 이름과 성을 모두 입력해 주세요.', 'error');
                document.getElementById(!compactValue(entry.firstName) ? 'nrFirstNameEdit' : 'nrLastNameEdit')?.focus();
                return false;
            }
            const phone = normalizeReservationGuestPhone(entry.phone);
            if (!isValidReservationGuestPhone(phone, true)) {
                showReservationAlert('연락처는 숫자와 +, -, 괄호만 입력해 주세요.', 'error');
                document.getElementById('nrPhoneEdit')?.focus();
                return false;
            }
            const created = await persistNewGuestRecord({ ...entry, phone });
            guestList.unshift(created);
            unifiedStayGuestRoster[index] = {
                ...entry,
                id: created.id,
                guestId: created.id,
                firstName: created.firstName,
                lastName: created.lastName,
                phone: created.phone,
                email: created.email,
                country: created.nationality,
                tier: created.tier,
                vip: created.vip,
                specialNotes: created.specialNotes,
                note: created.note
            };
        }
        renderUnifiedGuestRoster();
        return true;
    }

    async function rosterGuestsForReservation(res = null) {
        if (!res) return [];
        const guestList = await reservationGuestList();
        const entries = [];
        const addEntry = (raw, fallbackRole) => {
            const normalized = normalizeRosterGuest(mergeRosterGuestWithRecord(raw, guestList), fallbackRole);
            if (!normalized) return;
            const existingIndex = rosterGuestIndex(entries, normalized);
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

        const seen = [];
        return entries.filter(item => {
            if (!rosterGuestKey(item) || seen.some(existing => sameRosterGuest(existing, item))) return false;
            seen.push(item);
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
        if (count) count.textContent = actionText('guest.count', { count: roster.length });
        if (!roster.length) {
            refreshUnifiedRateQuote();
            list.innerHTML = `<div style="padding:14px;border:1px dashed var(--border);border-radius:8px;background:#fff;color:var(--txt3);font-size:.78rem;font-weight:700;text-align:center">${actionEscapeHtml(actionText('guest.emptyRoster'))}</div>`;
            return;
        }
        list.innerHTML = roster.map(item => {
            const isPrimary = item.role === 'primary';
            const key = encodeURIComponent(rosterGuestKey(item)).replace(/'/g, '%27');
            const meta = [item.phone, item.email].filter(Boolean).join(' · ') || (item.guestId ? actionText('guest.id', { id: item.guestId }) : actionText('guest.newInline'));
            const badgeStyle = isPrimary
                ? 'background:#111827;color:#fff'
                : 'background:#EEF2FF;color:#4338CA';
            const icon = isPrimary ? 'fa-user-check' : 'fa-user-group';
            const roleLabel = isPrimary ? unifiedModalText('guestPrimary') : unifiedModalText('guestCompanion');
            return `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px;background:#fff;border:1px solid var(--border2);border-radius:9px;margin-top:8px">
                <div style="display:flex;align-items:center;gap:10px;min-width:0">
                    <div style="width:36px;height:36px;border-radius:50%;background:${isPrimary ? '#111827' : '#EEF2FF'};color:${isPrimary ? '#fff' : '#4338CA'};display:flex;align-items:center;justify-content:center;flex:0 0 auto"><i class="fa-solid ${icon}" style="font-size:.8rem"></i></div>
                    <div style="min-width:0">
                        <div style="display:flex;align-items:center;gap:7px;min-width:0;flex-wrap:wrap">
                            <span style="font-size:.86rem;font-weight:900;color:var(--txt);word-break:break-word">${actionEscapeHtml(item.name)}</span>
                            <span style="font-size:.65rem;font-weight:900;border-radius:999px;padding:3px 8px;${badgeStyle}">${actionEscapeHtml(roleLabel)}</span>
                        </div>
                        <div style="font-size:.7rem;color:var(--txt3);font-weight:700;margin-top:2px;word-break:break-all">${actionEscapeHtml(meta)}</div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;flex:0 0 auto">
                    ${isPrimary ? '' : `<button type="button" onclick="setUnifiedPrimaryGuest('${key}')" style="height:30px;border:1px solid var(--border);background:#fff;border-radius:6px;padding:0 9px;font-family:var(--font);font-size:.7rem;font-weight:800;color:var(--txt2);cursor:pointer"><i class="fa-solid fa-star"></i> ${actionEscapeHtml(actionText('guest.setPrimary'))}</button>`}
                    <button type="button" onclick="removeUnifiedStayGuest('${key}')" style="width:30px;height:30px;border:1px solid var(--border);background:#fff;border-radius:6px;color:var(--txt3);cursor:pointer" title="${actionEscapeHtml(actionText('guest.delete'))}" aria-label="${actionEscapeHtml(actionText('guest.delete'))}"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>`;
        }).join('');
        refreshUnifiedRateQuote();
    }

    function setUnifiedGuestRoster(entries = []) {
        unifiedStayGuestRoster = [];
        entries.forEach(entry => {
            const normalized = normalizeRosterGuest(entry, entry?.role || 'companion');
            if (!normalized) return;
            const existingIndex = rosterGuestIndex(unifiedStayGuestRoster, normalized);
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
        const mode = widget?._mode || '';
        const selected = widget?.getSelectedGuest ? widget.getSelectedGuest() : null;
        if (selected && (!widget || mode === 'selected')) return selected;
        if (widget && mode !== 'newForm') return null;
        const newFields = widget?.getNewGuestFields ? widget.getNewGuestFields() : null;
        const firstName = compactValue(newFields?.firstName || document.getElementById('nrFirstNameEdit')?.value);
        const lastName = compactValue(newFields?.lastName || document.getElementById('nrLastNameEdit')?.value);
        const name = compactValue(newFields?.name || widget?.getGuestName?.() || document.getElementById('nrGuestEdit')?.value || [firstName, lastName].filter(Boolean).join(' '));
        if (!name) return null;
        return {
            name,
            firstName,
            lastName,
            phone: compactValue(document.getElementById('nrPhoneEdit')?.value),
            email: compactValue(document.getElementById('nrEmailEdit')?.value),
            country: compactValue(document.getElementById('nrNationEdit')?.value),
            nationality: compactValue(document.getElementById('nrNationEdit')?.value),
            tier: 'standard',
            vip: 'standard',
            specialNotes: compactValue(newFields?.specialNotes || document.getElementById('nrNotesEdit')?.value),
            note: compactValue(newFields?.specialNotes || document.getElementById('nrNotesEdit')?.value)
        };
    }

    function upsertUnifiedRosterGuest(source, role = 'companion') {
        const normalized = normalizeRosterGuest(source, role);
        if (!normalized) return null;
        const existingIndex = rosterGuestIndex(unifiedStayGuestRoster, normalized);
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

    function setUnifiedGuestActionBarVisible(visible) {
        const bar = document.getElementById('unifiedGuestCandidateActions');
        if (bar) bar.style.display = visible ? 'flex' : 'none';
    }

    function syncUnifiedGuestActionBar() {
        const mode = window._editGuestWidget?._mode || 'idle';
        setUnifiedGuestActionBarVisible(mode === 'selected' || mode === 'newForm');
    }

    function wireUnifiedGuestWidgetActions(widget) {
        if (!widget) return;
        if (widget.__unifiedGuestActionsWired) {
            syncUnifiedGuestActionBar();
            return;
        }
        const wrap = (method, visibleWhenDone) => {
            if (typeof widget[method] !== 'function') return;
            const original = widget[method].bind(widget);
            widget[method] = async (...args) => {
                const result = await original(...args);
                setUnifiedGuestActionBarVisible(typeof visibleWhenDone === 'function' ? visibleWhenDone(widget) : visibleWhenDone);
                return result;
            };
        };
        wrap('select', true);
        wrap('showNewForm', true);
        wrap('deselect', false);
        wrap('reset', false);
        wrap('search', () => false);
        widget.__unifiedGuestActionsWired = true;
        syncUnifiedGuestActionBar();
    }

    window.addUnifiedSelectedGuest = function(role = 'companion') {
        const candidate = getUnifiedSelectedGuestCandidate();
        if (!candidate || !compactValue(candidate.name)) {
            showReservationAlert('상단에서 투숙객을 검색한 뒤 선택해주세요.', 'error');
            return;
        }
        if ((window._editGuestWidget?._mode || '') === 'newForm' && (!compactValue(candidate.firstName) || !compactValue(candidate.lastName))) {
            showReservationAlert('신규 고객은 이름과 성을 모두 입력해 주세요.', 'error');
            document.getElementById(!compactValue(candidate.firstName) ? 'nrFirstNameEdit' : 'nrLastNameEdit')?.focus();
            return;
        }
        upsertUnifiedRosterGuest(candidate, role === 'primary' ? 'primary' : 'companion');
        if (window._editGuestWidget?.reset) window._editGuestWidget.reset();
        setUnifiedGuestActionBarVisible(false);
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
        const nightlyInput = document.getElementById('unifiedNightlyRate');
        const prepaidInput = document.getElementById('unifiedPrepaid');
        if (!amountInput || !prepaidInput) return;
        const currency = reservationCurrency(res);
        let amount = options.amount;
        if (amount === undefined) amount = reservationAmountValue(res);
        if (!amount && options.suggest) amount = options.suggest;
        const nights = updateUnifiedNightsLabel() || Number(res?.nights || res?.len || 1) || 1;
        const nightly = reservationRateValue(res) || (nights ? Math.round((Number(amount || 0) / nights) * 100) / 100 : Number(amount || 0));
        const prepaid = options.prepaid !== undefined ? options.prepaid : reservationPrepaidValue(res);
        amountInput.dataset.currency = currency;
        if (nightlyInput) nightlyInput.dataset.currency = currency;
        prepaidInput.dataset.currency = currency;
        amountInput.dataset.manualAmount = 'false';
        amountInput.dataset.autoQuoteTotal = '';
        configureUnifiedMoneyInput(amountInput, currency);
        if (nightlyInput) configureUnifiedMoneyInput(nightlyInput, currency);
        configureUnifiedMoneyInput(prepaidInput, currency);
        if (nightlyInput) nightlyInput.value = formatMoneyInputValue(nightly, currency);
        amountInput.value = formatMoneyInputValue(amount, currency);
        prepaidInput.value = formatMoneyInputValue(prepaid, currency);
        const optionRows = Array.isArray(options.prepaidRows) ? options.prepaidRows : [];
        const savedRows = reservationPrepaidRows(res);
        const fallbackRows = prepaidRowsFromLegacyBreakdown(options.prepaidBreakdown, prepaid);
        setPrepaidRows(optionRows.length ? optionRows : (savedRows.length ? savedRows : fallbackRows));
        syncUnifiedBalance();
    }

    function syncUnifiedBalance() {
        const amountInput = document.getElementById('unifiedAmount');
        const nightlyInput = document.getElementById('unifiedNightlyRate');
        const prepaidInput = document.getElementById('unifiedPrepaid');
        const balanceInput = document.getElementById('unifiedBalance');
        const amountDisplay = document.getElementById('unifiedAmountDisplay');
        const prepaidDisplay = document.getElementById('unifiedPrepaidDisplay');
        const balanceDisplay = document.getElementById('unifiedBalanceDisplay');
        const help = document.getElementById('unifiedFinanceHelp');
        if (!amountInput || !prepaidInput || !balanceInput) return;
        const currency = amountInput.dataset.currency || 'PHP';
        if (nightlyInput) {
            const nights = updateUnifiedNightsLabel() || 1;
            const nightly = parseMoneyInput(nightlyInput.value, currency);
            const totalFromNightly = normalizeMoneyAmount(nightly * nights, currency);
            amountInput.value = formatMoneyInputValue(totalFromNightly, currency);
        }
        const total = parseMoneyInput(amountInput.value, currency);
        const prepaidRows = prepaidRowsFromInputs();
        const rowsTotal = prepaidPhpTotalFromRows(prepaidRows);
        const prepaid = prepaidRows.length ? rowsTotal : 0;
        prepaidInput.value = formatMoneyInputValue(prepaid, currency);
        const balance = Math.max(total - prepaid, 0);
        balanceInput.value = formatSettlementMoney(balance, currency);
        if (amountDisplay) amountDisplay.textContent = formatSettlementMoney(total, currency);
        if (prepaidDisplay) prepaidDisplay.textContent = formatSettlementMoney(prepaid, currency);
        if (balanceDisplay) balanceDisplay.textContent = formatSettlementMoney(balance, currency);
        if (help) {
            help.textContent = unifiedModalText('summary', {
                total: formatSettlementMoney(total, currency),
                deposit: formatSettlementMoney(prepaid, currency),
                balance: formatSettlementMoney(balance, currency),
                rows: prepaidRowsText(prepaidRows)
            });
        }
    }

    function configureUnifiedMoneyInput(input, currency = 'PHP') {
        if (!input) return;
        const digits = currencyFractionDigits(currency);
        input.step = digits ? String(1 / (10 ** digits)) : '1';
        input.inputMode = digits ? 'decimal' : 'numeric';
    }

    function normalizeUnifiedMoneyInput(input) {
        if (!input) return;
        const currency = input.dataset.currency || 'PHP';
        input.value = formatMoneyInputValue(parseMoneyInput(input.value, currency), currency);
        syncUnifiedBalance();
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
                const roleLabel = entry.role === 'primary' ? unifiedModalText('guestPrimary') : unifiedModalText('guestCompanion');
                return `<button type="button" onclick="selectUnifiedPrivacyGuest('${encoded}')" style="height:30px;border:1px solid ${active ? 'var(--primary)' : 'var(--border)'};background:${active ? 'var(--primary)' : '#fff'};color:${active ? '#fff' : 'var(--txt2)'};border-radius:999px;padding:0 10px;font-family:var(--font);font-size:.7rem;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:5px;max-width:100%">
                    <i class="fa-solid ${entry.role === 'primary' ? 'fa-user-check' : 'fa-user-group'}" style="font-size:.66rem"></i>
                    <span data-action-i18n="${entry.role === 'primary' ? 'guestPrimary' : 'guestCompanion'}">${roleLabel}</span>
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
                    <div style="font-size:.72rem;color:var(--txt3);font-weight:700;margin-bottom:4px"><span data-action-i18n="guestNameLabel">${actionEscapeHtml(unifiedModalText('guestNameLabel'))}</span></div>
                    <div style="font-size:.88rem;color:var(--txt);font-weight:800;word-break:break-word">${actionEscapeHtml(info.guestName)}</div>
                </div>
                <div style="min-width:0">
                    <div style="font-size:.72rem;color:var(--txt3);font-weight:700;margin-bottom:4px"><span data-action-i18n="guestPhoneLabel">${actionEscapeHtml(unifiedModalText('guestPhoneLabel'))}</span></div>
                    <div style="font-size:.88rem;color:var(--txt);font-weight:800;word-break:break-word">${actionEscapeHtml(info.phone)}</div>
                </div>
                <div style="min-width:0">
                    <div style="font-size:.72rem;color:var(--txt3);font-weight:700;margin-bottom:4px"><span data-action-i18n="guestEmailLabel">${actionEscapeHtml(unifiedModalText('guestEmailLabel'))}</span></div>
                    <div style="font-size:.86rem;color:var(--txt2);font-weight:700;word-break:break-word">${actionEscapeHtml(info.email)}</div>
                </div>
                <div style="min-width:0">
                    <div style="font-size:.72rem;color:var(--txt3);font-weight:700;margin-bottom:4px"><span data-action-i18n="guestIdCheckLabel">${actionEscapeHtml(unifiedModalText('guestIdCheckLabel'))}</span></div>
                    <div style="font-size:.86rem;color:var(--txt2);font-weight:700">${actionEscapeHtml(info.documentStatus)}</div>
                </div>
                <div style="grid-column:1 / -1;min-width:0">
                    <div style="font-size:.72rem;color:var(--txt3);font-weight:700;margin-bottom:4px"><span data-action-i18n="guestNotesLabel">${actionEscapeHtml(unifiedModalText('guestNotesLabel'))}</span></div>
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
    <div class="modal-overlay" id="unifiedResModal" data-no-auto-i18n="true" style="z-index: 9999; display:none;">
        <div class="modal-card" style="width: 550px; max-width: 95vw;">
            <div class="modal-header">
                <div class="modal-title" id="unifiedModalTitle" style="display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap;">
                    <span id="unifiedModalTitleText" style="min-width:0;">${actionEscapeHtml(actionText('modal.editTitle'))}</span>
                    <button id="unifiedBtnPlacard" type="button" class="btn-outline" style="display:none;height:32px;min-height:32px;padding:0 10px;font-size:.74rem;border-radius:8px;gap:5px;" onclick="openReservationPlacardPreview()"><i class="fa-solid fa-id-card-clip"></i> <span data-action-i18n="placardPrint">${actionEscapeHtml(unifiedModalText('placardPrint'))}</span></button>
                </div>
                <button class="modal-close" onclick="closeUnifiedResModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                  <input type="hidden" id="unifiedResId">
                  <input type="hidden" id="unifiedChannel" value="Walk-in">
                  <input type="hidden" id="unifiedGroupId" value="">
                  <input type="hidden" id="unifiedStatus" value="confirmed">
                
                <div id="unifiedGuestSection" style="margin-bottom:20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid var(--border2);">
                    ${typeof renderGuestSearchHTML === 'function' ? renderGuestSearchHTML('Edit') : '<div style="color:red">guest-search.js missing</div>'}
                    <div id="unifiedGuestCandidateActions" style="display:none;gap:8px;align-items:center;justify-content:flex-end;flex-wrap:wrap;margin-top:12px">
                        <button type="button" onclick="addUnifiedSelectedGuest('primary')" style="height:34px;border:none;border-radius:7px;background:#111827;color:#fff;padding:0 13px;font-family:var(--font);font-size:.76rem;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px"><i class="fa-solid fa-user-check"></i> ${actionEscapeHtml(actionText('guest.addPrimary'))}</button>
                        <button type="button" onclick="addUnifiedSelectedGuest('companion')" style="height:34px;border:1px solid var(--border);border-radius:7px;background:#fff;color:var(--txt);padding:0 13px;font-family:var(--font);font-size:.76rem;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px"><i class="fa-solid fa-user-plus"></i> ${actionEscapeHtml(actionText('guest.addCompanion'))}</button>
                    </div>
                    <div id="unifiedStayGuestPanel" style="margin-top:14px;background:#fff;border:1px solid var(--border2);border-radius:10px;padding:12px">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:2px">
                            <div style="font-size:.86rem;font-weight:900;color:var(--txt);display:flex;align-items:center;gap:7px"><i class="fa-solid fa-address-book" style="color:var(--primary)"></i> <span data-action-i18n="guestRosterTitle">${actionEscapeHtml(unifiedModalText('guestRosterTitle'))}</span></div>
                            <div id="unifiedStayGuestCount" style="font-size:.68rem;font-weight:900;color:var(--txt3);background:#f1f5f9;border-radius:999px;padding:4px 8px">${actionEscapeHtml(actionText('guest.count', { count: 0 }))}</div>
                        </div>
                        <div id="unifiedStayGuestList"></div>
                    </div>
                </div>
                <input type="hidden" id="unifiedCompanions">
                <div id="unifiedGuestPrivacyPanel" style="display:none;margin-bottom:20px;background:#fff;border:1px solid var(--border2);border-radius:10px;overflow:hidden;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;background:#f8fafc;border-bottom:1px solid var(--border2);">
                        <div style="font-size:.9rem;font-weight:800;color:var(--txt);display:flex;align-items:center;gap:8px"><i class="fa-solid fa-id-card-clip" style="color:var(--primary)"></i> <span data-action-i18n="guestDetails">${actionEscapeHtml(unifiedModalText('guestDetails'))}</span></div>
                        <div style="font-size:.68rem;color:var(--txt3);font-weight:700"><i class="fa-solid fa-shield-halved"></i> <span data-action-i18n="guestAccessLog">${actionEscapeHtml(unifiedModalText('guestAccessLog'))}</span></div>
                    </div>
                    <div id="unifiedGuestPrivacyBody" style="padding:14px;"></div>
                </div>
                
                <div id="unifiedStayRoomSection" style="display:grid;grid-template-columns:1fr 1fr;gap:18px 20px;margin-bottom:20px;padding:16px;border:1px solid #d5dde8;border-left:4px solid var(--primary);border-radius:12px;background:#fbfdff;box-shadow:0 8px 18px rgba(15,23,42,.04);">
                    <div class="md-item">
                        <div class="md-label" data-action-i18n="checkInDate" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('checkInDate'))}</div>
                        <input type="date" id="unifiedCin" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:600;box-sizing:border-box;background:#fff;">
                        <div id="unifiedCinError" class="unified-stay-error" style="display:none;margin-top:5px;color:#dc2626;font-size:.72rem;font-weight:800;line-height:1.35"></div>
                    </div>
                    <div class="md-item">
                        <div class="md-label" data-action-i18n="checkOutDate" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('checkOutDate'))}</div>
                        <input type="date" id="unifiedCout" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:600;box-sizing:border-box;background:#fff;">
                        <div id="unifiedCoutError" class="unified-stay-error" style="display:none;margin-top:5px;color:#dc2626;font-size:.72rem;font-weight:800;line-height:1.35"></div>
                    </div>
                    <div class="md-item">
                        <div class="md-label" data-action-i18n="checkInTime" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('checkInTime'))}</div>
                        <input type="time" id="unifiedCheckInTime" value="14:00" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:700;box-sizing:border-box;background:#fff;">
                        <div id="unifiedCheckInTimeError" class="unified-stay-error" style="display:none;margin-top:5px;color:#dc2626;font-size:.72rem;font-weight:800;line-height:1.35"></div>
                    </div>
                    <div class="md-item">
                        <div class="md-label" data-action-i18n="checkOutTime" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('checkOutTime'))}</div>
                        <input type="time" id="unifiedCheckOutTime" value="12:00" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:700;box-sizing:border-box;background:#fff;">
                        <div id="unifiedCheckOutTimeError" class="unified-stay-error" style="display:none;margin-top:5px;color:#dc2626;font-size:.72rem;font-weight:800;line-height:1.35"></div>
                    </div>
                    <div class="md-item">
                        <label style="display:flex;align-items:center;gap:8px;height:38px;margin-top:20px;border:1px solid var(--border);border-radius:8px;padding:0 10px;background:#fff;font-size:.8rem;font-weight:900;color:var(--txt);cursor:pointer">
                            <input type="checkbox" id="unifiedLateCheckout" style="width:16px;height:16px;accent-color:var(--primary);">
                            <span data-action-i18n="lateCheckout">${actionEscapeHtml(unifiedModalText('lateCheckout'))}</span>
                        </label>
                    </div>
                    <div class="md-item">
                        <div class="md-label" data-action-i18n="lateCheckoutTime" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('lateCheckoutTime'))}</div>
                        <input type="time" id="unifiedLateCheckoutTime" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:700;box-sizing:border-box;background:#f8fafc;">
                        <div id="unifiedLateCheckoutTimeError" class="unified-stay-error" style="display:none;margin-top:5px;color:#dc2626;font-size:.72rem;font-weight:800;line-height:1.35"></div>
                    </div>
                    <div id="unifiedStayTimeHelp" style="grid-column:1 / -1;margin-top:-10px;font-size:0.72rem;color:var(--txt3);font-weight:700;line-height:1.45"></div>
                    <div class="md-item" style="grid-column:1 / -1;">
                        <label class="md-label" for="unifiedReservationNote" data-action-i18n="reservationNoteLabel" style="display:block;color:var(--txt2);font-size:0.8rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('reservationNoteLabel'))}</label>
                        <textarea id="unifiedReservationNote" data-action-placeholder="reservationNotePlaceholder" placeholder="${actionEscapeHtml(unifiedModalText('reservationNotePlaceholder'))}" style="min-height:68px;border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-family:var(--font);width:100%;font-weight:600;line-height:1.45;box-sizing:border-box;background:#fff;resize:vertical"></textarea>
                    </div>
                    <div class="md-item">
                        <div class="md-label" data-action-i18n="stay" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('stay'))}</div>
                        <div class="md-value" id="unifiedNights" style="font-size:0.9rem;font-weight:700;"></div>
                    </div>
                    <div class="md-item">
                        <div class="md-label" data-action-i18n="room" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('room'))}</div>
                        <select id="unifiedRoom" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:600;box-sizing:border-box;background:#fff;"></select>
                        <div id="unifiedRoomHelp" style="margin-top:6px;font-size:0.72rem;color:var(--txt3);font-weight:600;"></div>
                    </div>
                    <div id="unifiedGroupLinkNotice" style="grid-column:1 / -1;display:none;background:#f8fafc;padding:12px;border:1px solid var(--border2);border-radius:8px;margin:0;">
                        <div class="md-label" data-action-i18n="groupNoticeLabel" style="color:var(--txt2);font-size:0.75rem;margin:0 0 4px 0">${actionEscapeHtml(unifiedModalText('groupNoticeLabel'))}</div>
                        <div id="unifiedGroupLinkText" style="font-size:0.82rem;font-weight:700;color:var(--txt)"></div>
                    </div>
                    <div class="md-item" style="grid-column:1 / -1;display:none">
                        <div class="md-label" style="color:var(--txt2);font-size:0.8rem;margin-bottom:6px">동반 투숙객</div>
                        <textarea id="unifiedCompanionsLegacy" style="min-height:58px;border:1px solid var(--border);border-radius:4px;padding:10px;font-family:var(--font);width:100%;font-weight:600;box-sizing:border-box;background:#fff;resize:vertical" placeholder="동반 투숙객 이름을 쉼표 또는 줄바꿈으로 입력"></textarea>
                        <div style="margin-top:6px;font-size:0.72rem;color:var(--txt3);font-weight:600;">대표투숙객은 위 고객 정보, 동반 투숙객은 목록과 타임라인 아래줄에 표시됩니다.</div>
                    </div>
                    <div style="grid-column:1 / -1;background:#fff;border:1px solid var(--border2);border-radius:10px;padding:14px;">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:.9rem;font-weight:900;color:var(--txt);"><i class="fa-solid fa-file-invoice-dollar" style="color:var(--primary)"></i> <span data-action-i18n="financeTitle">${actionEscapeHtml(unifiedModalText('financeTitle'))}</span></div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;">
                            <div class="md-item">
                                <div class="md-label" data-action-i18n="nightlyRate" style="color:var(--txt2);font-size:0.75rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('nightlyRate'))}</div>
                                <input type="number" min="0" step="1" id="unifiedNightlyRate" oninput="syncUnifiedBalance()" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;font-weight:700;box-sizing:border-box;background:#fff;">
                            </div>
                            <div class="md-item">
                                <div class="md-label" data-action-i18n="roomAmount" style="color:var(--txt2);font-size:0.75rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('roomAmount'))}</div>
                                <input type="hidden" id="unifiedAmount">
                                <div id="unifiedAmountDisplay" style="min-height:38px;display:flex;align-items:center;font-size:0.92rem;font-weight:900;color:var(--txt);">₱0</div>
                            </div>
                            <div class="md-item">
                                <div class="md-label" data-action-i18n="depositTotal" style="color:var(--txt2);font-size:0.75rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('depositTotal'))}</div>
                                <input type="hidden" id="unifiedPrepaid">
                                <div id="unifiedPrepaidDisplay" style="min-height:38px;display:flex;align-items:center;font-size:0.92rem;font-weight:950;color:var(--primary);">₱0</div>
                            </div>
                            <div class="md-item">
                                <div class="md-label" data-action-i18n="balanceDue" style="color:var(--txt2);font-size:0.75rem;margin-bottom:6px">${actionEscapeHtml(unifiedModalText('balanceDue'))}</div>
                                <input type="hidden" id="unifiedBalance">
                                <div id="unifiedBalanceDisplay" style="min-height:38px;display:flex;align-items:center;font-size:0.92rem;font-weight:950;color:var(--primary);">₱0</div>
                            </div>
                        </div>
                        <div style="margin-top:12px;">
                            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;flex-wrap:wrap">
                                <div style="display:flex;align-items:center;gap:7px;font-size:0.78rem;color:var(--txt);font-weight:900;">
                                    <i class="fa-solid fa-wallet" style="color:var(--primary)"></i> <span data-action-i18n="depositRows">${actionEscapeHtml(unifiedModalText('depositRows'))}</span>
                                </div>
                                <button type="button" class="btn-outline" onclick="addUnifiedPrepaidRow()" style="height:32px;padding:0 10px;font-size:.72rem"><i class="fa-solid fa-plus"></i> <span data-action-i18n="addRow">${actionEscapeHtml(unifiedModalText('addRow'))}</span></button>
                            </div>
                            <div id="unifiedPrepaidRows"></div>
                            <div data-action-i18n="rowHelp" style="margin-top:6px;font-size:0.7rem;color:var(--txt3);font-weight:700;line-height:1.45">${actionEscapeHtml(unifiedModalText('rowHelp'))}</div>
                        </div>
                        <div id="unifiedRateQuoteHint" style="margin-top:8px;font-size:0.72rem;color:var(--primary);font-weight:800;line-height:1.45"></div>
                        <div id="unifiedFinanceHelp" style="margin-top:4px;font-size:0.72rem;color:var(--txt3);font-weight:700;line-height:1.45"></div>
                    </div>
                </div>
                <div id="unifiedRoomHistoryPanel" style="display:none;margin-bottom:20px;background:#fff;border:1px solid var(--border2);border-radius:10px;overflow:hidden;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;background:#f8fafc;border-bottom:1px solid var(--border2);">
                        <div style="font-size:.9rem;font-weight:900;color:var(--txt);display:flex;align-items:center;gap:8px"><i class="fa-solid fa-right-left" style="color:var(--primary)"></i> <span data-action-i18n="roomHistory">${actionEscapeHtml(unifiedModalText('roomHistory'))}</span></div>
                        <div id="unifiedRoomHistoryCount" style="font-size:.68rem;color:var(--txt3);font-weight:900;background:#fff;border:1px solid var(--border);border-radius:999px;padding:3px 8px">${actionEscapeHtml(unifiedModalText('historyCount', { count: 0 }))}</div>
                    </div>
                    <div id="unifiedRoomHistoryBody" style="padding:0 14px 12px;"></div>
                </div>
            </div>
            <div class="modal-footer" style="padding: 16px 20px; border-top: 1px solid var(--border2); display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-radius: 0 0 var(--radius-sm) var(--radius-sm);">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                    <button id="unifiedBtnCancel" class="btn-outline" style="color:var(--danger);border-color:var(--danger)" onclick="cancelUnifiedRes()"><i class="fa-solid fa-trash"></i> ${actionEscapeHtml(actionText('button.cancelBooking'))}</button>
                    <span id="unifiedFlowActions" style="display:inline-flex;gap:8px;flex-wrap:wrap"></span>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-outline" onclick="closeUnifiedResModal()" data-i18n-key="Close">${actionEscapeHtml(actionText('button.close'))}</button>
                    <button class="btn-primary-sm" onclick="saveUnifiedRes()" data-i18n-key="Save">${actionEscapeHtml(actionText('button.save'))}</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-overlay" id="reservationPlacardModal" data-no-auto-i18n="true" style="z-index:10010;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(15,23,42,.48);">
        <div class="modal-card" style="width:min(920px,96vw);max-height:92vh;display:flex;flex-direction:column;overflow:hidden;">
            <div class="modal-header">
                <div class="modal-title"><i class="fa-solid fa-id-card-clip" style="color:var(--primary);margin-right:8px"></i><span data-action-i18n="placardPreview">${actionEscapeHtml(unifiedModalText('placardPreview'))}</span></div>
                <button class="modal-close" onclick="closeReservationPlacardPreview()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body" style="padding:18px;background:#f8fafc;overflow:auto;">
                <div id="placardPreviewCanvas" style="width:100%;background:#fff;aspect-ratio:1.4142;display:flex;"></div>
                <div style="margin-top:14px;display:grid;grid-template-columns:minmax(0,1fr);gap:8px;">
                    <label for="placardFlightInput" style="font-size:.82rem;font-weight:900;color:var(--txt2);" data-action-i18n="flight">${actionEscapeHtml(unifiedModalText('flight'))}</label>
                    <input id="placardFlightInput" class="form-input" type="text" placeholder="${actionEscapeHtml(unifiedModalText('placardPlaceholder'))}" data-action-placeholder="placardPlaceholder" oninput="updateReservationPlacardPreview()" style="height:42px;border:1px solid var(--border);border-radius:8px;padding:0 12px;font-family:var(--font);font-weight:800;">
                    <div style="font-size:.72rem;color:var(--txt3);font-weight:700;" data-action-i18n="placardHelp">${actionEscapeHtml(unifiedModalText('placardHelp'))}</div>
                </div>
            </div>
            <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:14px 18px;background:#fff;border-top:1px solid var(--border2);">
                <div id="placardSaveState" style="font-size:.76rem;color:var(--txt3);font-weight:800;"></div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <button class="btn-outline" onclick="closeReservationPlacardPreview()" data-i18n-key="Close">닫기</button>
                    <button class="btn-outline" onclick="applyReservationPlacardFlight()"><i class="fa-solid fa-check"></i> <span data-i18n-key="Save">저장</span></button>
                    <button class="btn-primary-sm" onclick="printReservationPlacardFromPreview()"><i class="fa-solid fa-print"></i> <span data-i18n-key="Print">인쇄</span></button>
                </div>
            </div>
        </div>
    </div>
    `;

    function refreshUnifiedModalTitleI18n() {
        const title = document.getElementById('unifiedModalTitleText');
        if (!title) return;
        const id = document.getElementById('unifiedResId')?.value || '';
        if (!id) {
            title.textContent = actionText('booking.newTitle');
            return;
        }
        const allRes = window.reservations || (typeof reservations !== 'undefined' ? reservations : null);
        const res = Array.isArray(allRes) ? allRes.find(item => item.id === id) : null;
        if (!res) return;
        const isB2B = !!(res.groupId || '');
        const isVip = res.isVip || (res.vip && res.vip.toLowerCase().includes('vip'));
        const b2bBadge = isB2B ? `<span style="background:#111827;color:#fff;font-size:0.65rem;padding:2px 6px;border-radius:4px;margin-left:8px;font-weight:600;vertical-align:middle;letter-spacing:0.5px"><i class="fa-solid fa-building"></i> ${actionEscapeHtml(unifiedModalText('groupLinked'))}</span>` : '';
        const vipBadge = isVip ? `<span style="background:rgba(245,158,11,.15);color:#D97706;font-size:0.65rem;padding:2px 6px;border-radius:4px;margin-left:8px;font-weight:700;vertical-align:middle;"><i class="fa-solid fa-crown"></i> ${actionEscapeHtml(unifiedModalText('vip'))}</span>` : '';
        title.innerHTML = `${reservationModalRoomTitle(res)} ${b2bBadge} ${vipBadge}`;
    }

    function applyUnifiedReservationI18n() {
        const roots = [document.getElementById('unifiedResModal'), document.getElementById('reservationPlacardModal')].filter(Boolean);
        if (!roots.length) return;
        roots.forEach(root => {
            root.querySelectorAll('[data-action-i18n]').forEach(el => {
                const key = el.getAttribute('data-action-i18n');
                el.textContent = unifiedModalText(key);
            });
            root.querySelectorAll('[data-action-placeholder]').forEach(el => {
                const key = el.getAttribute('data-action-placeholder');
                el.setAttribute('placeholder', unifiedModalText(key));
            });
        });
        refreshUnifiedModalTitleI18n();
        if (typeof window.refreshGuestSearchI18n === 'function') window.refreshGuestSearchI18n(document);
        if (typeof applyReservationPlacardI18n === 'function') applyReservationPlacardI18n();
        renderUnifiedGuestRoster();
        renderPrepaidRowsEmpty();
        syncUnifiedLateCheckoutControls();
        syncUnifiedBalance();
        const id = document.getElementById('unifiedResId')?.value || '';
        const allRes = window.reservations || (typeof reservations !== 'undefined' ? reservations : null);
        const res = id && Array.isArray(allRes) ? allRes.find(item => item.id === id) : null;
        renderUnifiedRoomHistory(res || null);
        renderUnifiedFlowActions(res || null);
    }

    function ensureModal() {
        if (!document.getElementById('unifiedResModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            ['unifiedCin', 'unifiedCout'].forEach(id => {
                const input = document.getElementById(id);
                if (input) input.addEventListener('change', () => {
                    if (id === 'unifiedCin' && input.min && input.value && input.value < input.min) input.value = input.min;
                    clearUnifiedStayValidation();
                    window.updateUnifiedStayAndRooms();
                    refreshUnifiedRateQuote();
                });
            });
            const roomInput = document.getElementById('unifiedRoom');
            if (roomInput) roomInput.addEventListener('change', () => refreshUnifiedRateQuote());
            ['unifiedCheckInTime', 'unifiedCheckOutTime', 'unifiedLateCheckoutTime'].forEach(id => {
                const input = document.getElementById(id);
                if (input) input.addEventListener('change', () => {
                    clearUnifiedStayValidation();
                    syncUnifiedLateCheckoutControls();
                });
            });
            const lateToggle = document.getElementById('unifiedLateCheckout');
            if (lateToggle) lateToggle.addEventListener('change', () => {
                clearUnifiedStayValidation();
                syncUnifiedLateCheckoutControls();
            });
            applyReservationPlacardI18n();
            applyUnifiedReservationI18n();
            ['unifiedNightlyRate', 'unifiedPrepaid'].forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    input.addEventListener('input', () => {
                        if (id === 'unifiedNightlyRate') {
                            const amountInput = document.getElementById('unifiedAmount');
                            if (amountInput) amountInput.dataset.manualAmount = 'true';
                        }
                        syncUnifiedBalance();
                    });
                    input.addEventListener('change', () => normalizeUnifiedMoneyInput(input));
                    input.addEventListener('blur', () => normalizeUnifiedMoneyInput(input));
                }
            });
        }
        const checkinInput = document.getElementById('unifiedCin');
        if (checkinInput?.tagName === 'INPUT') checkinInput.min = todayInputValue();
    }

    window.syncUnifiedBalance = syncUnifiedBalance;
    window.syncUnifiedLateCheckoutControls = syncUnifiedLateCheckoutControls;
    window.addUnifiedPrepaidRow = addUnifiedPrepaidRow;
    window.removeUnifiedPrepaidRow = removeUnifiedPrepaidRow;
    window.syncUnifiedPrepaidRows = syncUnifiedPrepaidRows;
    window.applyUnifiedReservationI18n = applyUnifiedReservationI18n;
    window.addEventListener('languagechange', () => setTimeout(applyUnifiedReservationI18n, 0));

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
        text.textContent = unifiedModalText('groupNoticeText', { group: label });
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

    function isOperationalStayWindow(res) {
        const start = parseReservationDate(res?.checkInDate || res?.checkin || res?.cin);
        const end = parseReservationDate(res?.checkOutDate || res?.checkout || res?.cout);
        if (!start || !end) return false;
        const today = todayStart();
        return start <= today && today <= end;
    }

    function reservationCheckInDate(res) {
        return parseReservationDate(res?.checkInDate || res?.checkin || res?.cin);
    }

    function reservationCheckInIsDue(res) {
        const start = reservationCheckInDate(res);
        return !!start && start <= todayStart();
    }

    function canProcessReservationCheckin(res) {
        if (!res || res.isGroupPlaceholder || normalizedReservationStatus(res.status) === 'blocked') return false;
        const status = effectiveReservationStatus(res);
        return ['confirmed', 'pending'].includes(status) && reservationCheckInIsDue(res);
    }

    function canCancelReservation(res) {
        if (!res || res.isGroupPlaceholder || normalizedReservationStatus(res.status) === 'blocked') return false;
        return !['checkedin', 'checkout', 'completed', 'cancelled'].includes(effectiveReservationStatus(res));
    }

    function checkinNotAllowedMessage(res) {
        const status = effectiveReservationStatus(res);
        if (['checkedin', 'checkout', 'completed', 'cancelled'].includes(status)) return actionText('flow.alreadyCheckedIn');
        if (!reservationCheckInIsDue(res)) return actionText('flow.futureCheckinNotAllowed');
        return actionText('flow.alreadyCheckedIn');
    }

    function normalizeRoomValue(value) {
        const text = String(value || '').trim().toLowerCase();
        const compact = text.replace(/[^a-z0-9]/g, '');
        const tail = text.includes('-') ? text.split('-').pop() : text;
        const compactTail = tail.replace(/[^a-z0-9]/g, '');
        const digits = (text.match(/\d+/g) || []).join('');
        return {
            text,
            compact,
            tail,
            compactTail,
            digits,
            strippedDigits: digits.replace(/^0+(?=\d)/, ''),
            hasLetters: /[a-z]/.test(compact)
        };
    }

    function sameRoomValue(left, right) {
        const a = normalizeRoomValue(left);
        const b = normalizeRoomValue(right);
        if (!a.text || !b.text) return false;
        const aKeys = [a.text, a.compact, a.tail, a.compactTail].filter(Boolean);
        const bKeys = new Set([b.text, b.compact, b.tail, b.compactTail].filter(Boolean));
        if (aKeys.some(key => bKeys.has(key))) return true;
        const sameDigits = a.digits && b.digits && (a.digits === b.digits || a.strippedDigits === b.strippedDigits);
        return !!sameDigits && (!a.hasLetters || !b.hasLetters);
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

    function reservationRoomIdForGroup(res) {
        return compactValue(res?.fullRoom || res?.roomId || res?.room || res?.roomNo || res?.roomLabel);
    }

    function reservationModalRoomTitle(res) {
        const room = compactValue(res?.roomNo || res?.roomNumber || res?.roomLabel || res?.room || res?.fullRoom || res?.roomId);
        if (!room) return actionLang() === 'en' ? 'Reservation detail' : '\uC608\uC57D \uC0C1\uC138';
        if (actionLang() === 'en') return /^room\b/i.test(room) ? room : `Room ${room}`;
        return /\uD638$/.test(room) ? room : `${room}\uD638`;
    }

    function allocationRoomId(allocation) {
        return compactValue(allocation?.roomId || allocation?.fullRoom || allocation?.room || allocation?.roomNo || allocation?.roomLabel);
    }

    function normalizeGroupAllocationList(list, beforeRooms, nextRoomId, res) {
        const items = Array.isArray(list) ? list.map(item => ({ ...item })) : [];
        if (!nextRoomId) return items;
        const beforeValues = beforeRooms.filter(Boolean);
        const currentIndex = items.findIndex(item => beforeValues.some(value => sameRoomValue(allocationRoomId(item), value)));
        const nextIndex = items.findIndex(item => sameRoomValue(allocationRoomId(item), nextRoomId));
        if (currentIndex >= 0) {
            items[currentIndex] = {
                ...items[currentIndex],
                roomId: nextRoomId,
                fullRoom: nextRoomId,
                roomLabel: res?.roomNo || res?.roomLabel || nextRoomId,
                type: res?.type || items[currentIndex].type || 'Standard',
                rate: reservationRateValue(res) || items[currentIndex].rate || 0
            };
            if (nextIndex >= 0 && nextIndex !== currentIndex) items.splice(nextIndex, 1);
        } else if (nextIndex < 0) {
            items.push({
                roomId: nextRoomId,
                fullRoom: nextRoomId,
                roomLabel: res?.roomNo || res?.roomLabel || nextRoomId,
                type: res?.type || 'Standard',
                baseRate: reservationRateValue(res) || 0,
                discountPercent: 0,
                rate: reservationRateValue(res) || 0
            });
        }
        const seen = new Set();
        return items.filter(item => {
            const key = normalizeRoomValue(allocationRoomId(item)).strippedDigits || allocationRoomId(item);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    function normalizeGroupRoomingFromReservation(res) {
        if (res?.isGroupPlaceholder && normalizedReservationStatus(res.status) === 'blocked') return [];
        const source = Array.isArray(res?.roomingGuests) && res.roomingGuests.length
            ? res.roomingGuests
            : (compactValue(guestNameForReservation(res)) ? [{
                guestId: res?.guestId || res?.roomingGuestId,
                id: res?.guestId || res?.roomingGuestId,
                name: guestNameForReservation(res),
                phone: res?.guestPhone || res?.phone || res?.mobile,
                email: res?.guestEmail || res?.email,
                role: 'primary'
            }] : []);
        return source.map((item, index) => {
            const raw = typeof item === 'string' ? { name: item } : (item || {});
            const name = compactValue(raw.name || raw.guestName || raw.roomingGuestName || raw.guest);
            if (!name) return null;
            return {
                id: compactValue(raw.guestId || raw.id || raw.roomingGuestId) || `GG-${Date.now()}-${index}`,
                guestId: compactValue(raw.guestId || raw.id || raw.roomingGuestId),
                name,
                phone: compactValue(raw.phone || raw.mobile || raw.guestPhone),
                email: compactValue(raw.email || raw.guestEmail),
                nation: compactValue(raw.nation || raw.country || raw.nationality),
                docStatus: compactValue(raw.docStatus || raw.documentStatus) || 'pending',
                role: rosterGuestRole(raw.role || (index === 0 ? 'primary' : 'companion'))
            };
        }).filter(Boolean);
    }

    async function syncUnifiedGroupReservation(res, context = {}) {
        if (!res?.groupId) return;
        const nextRoomId = reservationRoomIdForGroup(res);
        const beforeRooms = [
            context.beforeRoom,
            context.beforeFullRoom,
            ...(Array.isArray(context.beforeRooms) ? context.beforeRooms : [])
        ].map(compactValue).filter(Boolean);
        const groups = await unifiedGroups();
        const group = groups.find(item => item.id === res.groupId);
        if (!group) return;

        const allocationSource = Array.isArray(group.roomAllocations) && group.roomAllocations.length
            ? group.roomAllocations
            : group.allocations;
        group.roomAllocations = normalizeGroupAllocationList(allocationSource, beforeRooms, nextRoomId, res);
        const legacyAllocationSource = Array.isArray(group.allocations) && group.allocations.length
            ? group.allocations
            : group.roomAllocations;
        group.allocations = normalizeGroupAllocationList(legacyAllocationSource, beforeRooms, nextRoomId, res);
        group.block = group.roomAllocations.length || group.block || 0;

        const list = Array.isArray(group.roomingList) ? group.roomingList.map(item => ({ ...item })) : [];
        if (beforeRooms.length && nextRoomId) {
            list.forEach(item => {
                const roomValue = allocationRoomId(item);
                if (beforeRooms.some(value => sameRoomValue(roomValue, value))) {
                    item.roomId = nextRoomId;
                    item.fullRoom = nextRoomId;
                }
            });
        }

        const rooming = normalizeGroupRoomingFromReservation(res);
        if (rooming.length && nextRoomId) {
            const roomingNames = new Set(rooming.map(item => item.name.toLowerCase()));
            const filtered = list.filter(item => {
                const roomValue = allocationRoomId(item);
                const sameRoom = sameRoomValue(roomValue, nextRoomId) || beforeRooms.some(value => sameRoomValue(roomValue, value));
                const sameGuest = roomingNames.has(compactValue(item.name).toLowerCase());
                return !(sameRoom && (sameGuest || item.role === 'primary'));
            });
            rooming.forEach((item, index) => {
                filtered.push({
                    ...item,
                    id: item.id || `GG-${Date.now()}-${index}`,
                    groupId: res.groupId,
                    roomId: nextRoomId,
                    fullRoom: nextRoomId
                });
            });
            group.roomingList = filtered;
            if (Array.isArray(group.rooming)) group.rooming = filtered;
            group.pickup = Math.max(Number(group.pickup || 0), new Set(filtered.map(item => allocationRoomId(item)).filter(Boolean)).size);
        } else {
            group.roomingList = list;
            if (Array.isArray(group.rooming)) group.rooming = list;
        }

        const actor = currentReservationActor();
        group.history = Array.isArray(group.history) ? group.history : [];
        if (context.roomChanged && nextRoomId) {
            group.history.unshift({
                at: new Date().toLocaleString('ko-KR'),
                action: '타임라인 객실 변경',
                note: `${beforeRooms[0] || '-'} -> ${nextRoomId} · ${actor.name}`
            });
        }
        if (rooming.length) {
            group.history.unshift({
                at: new Date().toLocaleString('ko-KR'),
                action: '타임라인 투숙객 동기화',
                note: `${nextRoomId || '-'} · ${rooming.map(item => item.name).join(', ')}`
            });
        }

        let stored = [];
        try {
            stored = JSON.parse(localStorage.getItem('pms_groups') || '[]');
        } catch(e) {
            stored = [];
        }
        const storedIndex = stored.findIndex(item => item.id === group.id);
        if (storedIndex >= 0) stored[storedIndex] = { ...stored[storedIndex], ...group };
        else stored.unshift(group);
        localStorage.setItem('pms_groups', JSON.stringify(stored));
        try {
            sessionStorage.setItem('pms_selected_group', JSON.stringify(group));
        } catch(e) {}
        try {
            if (window.PmsMockApi) {
                await window.PmsMockApi.request('PATCH', `/groups/events/${encodeURIComponent(group.id)}`, { body: group });
            }
        } catch(e) {
            console.warn('Mock group reservation sync failed', e);
        }
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
        if (options.autoFix && checkin && !checkout) {
            checkout = new Date(checkin);
            checkout.setDate(checkout.getDate() + 1);
            if (checkoutEl?.tagName === 'INPUT') checkoutEl.value = toDateInputValue(checkout);
            else if (checkoutEl) checkoutEl.textContent = toReservationDateText(checkout);
        }
        if (checkoutEl?.tagName === 'INPUT') checkoutEl.removeAttribute('min');
        return { checkin, checkout, valid: !!(checkin && checkout && checkout >= checkin) };
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

    function clearUnifiedStayValidation() {
        ['unifiedCin', 'unifiedCout', 'unifiedCheckInTime', 'unifiedCheckOutTime', 'unifiedLateCheckoutTime'].forEach(id => {
            const input = document.getElementById(id);
            const error = document.getElementById(`${id}Error`);
            input?.removeAttribute('aria-invalid');
            if (input) input.style.borderColor = 'var(--border)';
            if (error) {
                error.textContent = '';
                error.style.display = 'none';
            }
        });
    }

    function setUnifiedStayFieldError(id, message) {
        const input = document.getElementById(id);
        const error = document.getElementById(`${id}Error`);
        if (input) {
            input.setAttribute('aria-invalid', 'true');
            input.style.borderColor = '#dc2626';
        }
        if (error) {
            error.textContent = message;
            error.style.display = 'block';
        }
        return input;
    }

    function validateUnifiedStaySchedule() {
        clearUnifiedStayValidation();
        const range = getUnifiedDateRange({ autoFix: false });
        if (!range.checkin || !range.checkout) {
            return { valid: false, range, message: actionText('booking.dateRequired'), input: null };
        }
        if (range.checkout < range.checkin) {
            const message = unifiedModalText('booking.checkoutBeforeCheckin');
            return { valid: false, range, message, input: setUnifiedStayFieldError('unifiedCout', message) };
        }

        const checkInTime = getUnifiedTimeValue('unifiedCheckInTime', '14:00');
        const checkOutTime = getUnifiedTimeValue('unifiedCheckOutTime', '12:00');
        if (range.checkout.getTime() === range.checkin.getTime() && checkOutTime <= checkInTime) {
            const message = unifiedModalText('booking.checkoutTimeBeforeCheckin');
            return { valid: false, range, message, input: setUnifiedStayFieldError('unifiedCheckOutTime', message) };
        }

        const lateCheckout = !!document.getElementById('unifiedLateCheckout')?.checked;
        const lateCheckoutTime = getUnifiedTimeValue('unifiedLateCheckoutTime', checkOutTime);
        if (lateCheckout && lateCheckoutTime <= checkOutTime) {
            const message = unifiedModalText('booking.lateCheckoutTimeInvalid');
            return { valid: false, range, message, input: setUnifiedStayFieldError('unifiedLateCheckoutTime', message) };
        }
        return { valid: true, range, message: '', input: null };
    }

    function normalizeReservationTime(value, fallback = '') {
        const text = String(value ?? '').trim();
        if (!text) return fallback;
        const match = text.match(/^(\d{1,2})(?::?(\d{2}))?$/);
        if (!match) return fallback;
        const hour = Number(match[1]);
        const minute = Number(match[2] || 0);
        if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return fallback;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    function reservationCheckInTime(res = null) {
        return normalizeReservationTime(res?.checkInTime || res?.arrivalTime || res?.stayTimes?.checkInTime || res?.times?.checkIn, '14:00');
    }

    function reservationCheckOutTime(res = null) {
        return normalizeReservationTime(res?.checkOutTime || res?.departureTime || res?.stayTimes?.checkOutTime || res?.times?.checkOut, '12:00');
    }

    function reservationLateCheckoutEnabled(res = null) {
        return !!(res?.lateCheckout || res?.isLateCheckout || res?.stayTimes?.lateCheckout || res?.lateCheckoutTime || res?.extendedCheckOutTime);
    }

    function reservationLateCheckoutTime(res = null) {
        return normalizeReservationTime(res?.lateCheckoutTime || res?.extendedCheckOutTime || res?.stayTimes?.lateCheckoutTime, reservationCheckOutTime(res));
    }

    function reservationBaseStayTimesLocked(res = null) {
        if (!res) return false;
        return ['checkedin', 'checkout', 'completed'].includes(effectiveReservationStatus(res));
    }

    function setUnifiedTimeValue(id, value, fallback = '') {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = normalizeReservationTime(value, fallback);
    }

    function getUnifiedTimeValue(id, fallback = '') {
        const el = document.getElementById(id);
        return normalizeReservationTime(el?.value, fallback);
    }

    function stayTimeSummaryFromValues(checkInTime, checkOutTime, lateCheckout = false, lateCheckoutTime = '') {
        const params = {
            checkInTime: checkInTime || '-',
            checkOutTime: checkOutTime || '-',
            lateCheckoutTime: lateCheckoutTime || checkOutTime || '-'
        };
        return lateCheckout ? unifiedModalText('timeSummaryLate', params) : unifiedModalText('timeSummary', params);
    }

    function setUnifiedStayTimeValues(res = null, prefill = {}) {
        const source = { ...(res || {}), ...(prefill || {}) };
        setUnifiedTimeValue('unifiedCheckInTime', source.checkInTime || source.arrivalTime || source.stayTimes?.checkInTime, '14:00');
        setUnifiedTimeValue('unifiedCheckOutTime', source.checkOutTime || source.departureTime || source.stayTimes?.checkOutTime, '12:00');
        const lateEl = document.getElementById('unifiedLateCheckout');
        if (lateEl) lateEl.checked = reservationLateCheckoutEnabled(source);
        setUnifiedTimeValue('unifiedLateCheckoutTime', source.lateCheckoutTime || source.extendedCheckOutTime || source.stayTimes?.lateCheckoutTime, reservationCheckOutTime(source));
        syncUnifiedLateCheckoutControls();
    }

    function unifiedStayTimePayload() {
        const checkInTime = getUnifiedTimeValue('unifiedCheckInTime', '14:00');
        const checkOutTime = getUnifiedTimeValue('unifiedCheckOutTime', '12:00');
        const lateCheckout = !!document.getElementById('unifiedLateCheckout')?.checked;
        const lateCheckoutTime = lateCheckout ? getUnifiedTimeValue('unifiedLateCheckoutTime', checkOutTime) : '';
        return {
            checkInTime,
            checkOutTime,
            lateCheckout,
            lateCheckoutTime,
            stayTimes: { checkInTime, checkOutTime, lateCheckout, lateCheckoutTime }
        };
    }

    function lockedBaseStayTimePayload(res, payload) {
        if (!reservationBaseStayTimesLocked(res)) return payload;
        const checkInTime = reservationCheckInTime(res);
        const checkOutTime = reservationCheckOutTime(res);
        const lateCheckout = !!payload.lateCheckout;
        const lateCheckoutTime = lateCheckout ? normalizeReservationTime(payload.lateCheckoutTime, checkOutTime) : '';
        return {
            checkInTime,
            checkOutTime,
            lateCheckout,
            lateCheckoutTime,
            stayTimes: { checkInTime, checkOutTime, lateCheckout, lateCheckoutTime }
        };
    }

    function syncUnifiedLateCheckoutControls() {
        const checkoutEl = document.getElementById('unifiedCheckOutTime');
        const lateEl = document.getElementById('unifiedLateCheckout');
        const lateTimeEl = document.getElementById('unifiedLateCheckoutTime');
        const helpEl = document.getElementById('unifiedStayTimeHelp');
        const enabled = !!lateEl?.checked && !lateEl?.disabled;
        if (enabled && lateTimeEl && !lateTimeEl.value) lateTimeEl.value = checkoutEl?.value || '12:00';
        if (lateTimeEl) {
            lateTimeEl.disabled = !enabled;
            lateTimeEl.style.background = enabled ? '#fff' : '#f8fafc';
            lateTimeEl.style.color = enabled ? 'var(--txt)' : 'var(--txt3)';
        }
        if (helpEl) {
            const payload = unifiedStayTimePayload();
            helpEl.textContent = stayTimeSummaryFromValues(payload.checkInTime, payload.checkOutTime, payload.lateCheckout, payload.lateCheckoutTime);
        }
    }

    function reservationBlocksAvailability(res) {
        const status = normalizedReservationStatus(res?.status);
        return !['cancelled', 'completed'].includes(status) && !reservationShadowedByCompletedStay(res);
    }

    function reservationShadowedByCompletedStay(res) {
        const guest = String(res?.guestName || res?.guest || '').trim().toLowerCase();
        const start = parseReservationDate(res?.checkInDate || res?.checkin || res?.cin);
        if (!guest || !start) return false;
        return reservationList().some(other => {
            if (!other || other.id === res.id || normalizedReservationStatus(other.status) !== 'completed') return false;
            const otherGuest = String(other.guestName || other.guest || '').trim().toLowerCase();
            const end = parseReservationDate(other.checkOutDate || other.checkout || other.cout);
            return otherGuest === guest
                && end?.getTime() === start.getTime()
                && [res.roomId, res.fullRoom, res.room, res.roomNo].some(value =>
                    [other.roomId, other.fullRoom, other.room, other.roomNo].some(otherValue => sameRoomValue(value, otherValue))
                );
        });
    }

    function reservationOverlapsDates(res, checkin, checkout) {
        if (!reservationBlocksAvailability(res)) return false;
        const start = parseReservationDate(res?.checkInDate || res?.checkin || res?.cin);
        const end = parseReservationDate(res?.checkOutDate || res?.checkout || res?.cout);
        if (!start || !end || !checkin || !checkout) return false;
        return checkin < end && start < checkout;
    }

    function roomMaintenanceBlocked(room) {
        return roomOpsStatuses(room).some(status => ['maintenance', 'outofservice', 'outoforder', 'oos'].includes(status));
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

    function roomMatchesValue(room, value) {
        if (!room || !compactValue(value)) return false;
        return [
            room?.id,
            room?.fullRoom,
            room?.roomId,
            room?.number,
            room?.roomNo,
            room?.display,
            room?.displayName,
            room?.roomLabel,
            roomLabel(room)
        ].some(roomValue => sameRoomValue(roomValue, value));
    }

    function roomForValue(value) {
        if (!compactValue(value)) return null;
        return (Array.isArray(window.rooms) ? window.rooms : []).find(room => roomMatchesValue(room, value)) || null;
    }

    function roomTypeDisplay(type) {
        const value = String(type || '').trim();
        return value || 'Standard';
    }

    function refreshUnifiedRoomOptions(preferredValue = '') {
        const roomSelect = document.getElementById('unifiedRoom');
        const help = document.getElementById('unifiedRoomHelp');
        if (!roomSelect) return;
        const previousValue = roomSelect.value || '';
        const requestedValue = preferredValue || previousValue;
        const id = document.getElementById('unifiedResId')?.value;
        const currentRes = id ? reservationList().find(res => res.id === id) : null;
        const { checkin, checkout, valid } = getUnifiedDateRange({ autoFix: false });
        roomSelect.innerHTML = '';

        if (!valid) {
            roomSelect.disabled = true;
            roomSelect.innerHTML = `<option value="">${actionText('booking.roomDateFirst')}</option>`;
            if (help) help.textContent = actionText('booking.roomDateFirst');
            return;
        }

        roomSelect.disabled = false;
        const available = [];
        const conflicts = [];
        const unavailable = [];
        (Array.isArray(window.rooms) ? window.rooms : []).forEach(room => {
            const value = roomLabel(room);
            if (!value) return;
            const conflict = roomConflictForDates(room, checkin, checkout, currentRes);
            const isCurrentRoom = !!(currentRes && roomMatchesReservation(room, currentRes));
            const blocked = !isCurrentRoom && roomMaintenanceBlocked(room);
            const entry = { room, value, conflict: isCurrentRoom ? null : conflict, blocked };
            if (blocked) unavailable.push(entry);
            else if (!currentRes && conflict) conflicts.push(entry);
            else available.push(entry);
        });

        if (!available.length && !conflicts.length && !unavailable.length) {
            roomSelect.disabled = true;
            roomSelect.innerHTML = `<option value="">${actionText('booking.noRooms')}</option>`;
            if (help) help.textContent = actionText('booking.noRooms');
            return;
        }

        const appendOption = ({ room, value, conflict, blocked }) => {
            const opt = document.createElement('option');
            opt.value = value;
            opt.disabled = blocked;
            const moveSuffix = unifiedModalText('roomMoveAllowed');
            const suffix = conflict ? ` - ${currentRes ? moveSuffix : actionText('booking.conflictSuffix')}` : '';
            opt.textContent = `${value} (${roomTypeDisplay(room.type)})${suffix}`;
            roomSelect.appendChild(opt);
        };
        available.forEach(appendOption);
        conflicts.forEach(appendOption);
        unavailable.forEach(appendOption);

        const enabledValues = Array.from(roomSelect.options).filter(option => !option.disabled).map(option => option.value);
        const matchingEnabledValue = value => enabledValues.find(enabled => sameRoomValue(enabled, value)) || '';
        const preferred = requestedValue ? matchingEnabledValue(requestedValue) : '';
        const previous = previousValue ? matchingEnabledValue(previousValue) : '';
        roomSelect.value = preferred || previous || enabledValues[0] || '';
        if (!enabledValues.length) roomSelect.disabled = true;
        if (help) {
            const countText = `${available.length} ${currentRes ? unifiedModalText('roomMoveAllowed') : unifiedModalText('roomAvailable')}`;
            help.textContent = available.length
                ? countText
                : actionText('booking.noRooms');
        }
    }

    window.updateUnifiedStayAndRooms = function(preferredValue = '') {
        updateUnifiedNightsLabel();
        refreshUnifiedRoomOptions(preferredValue || document.getElementById('unifiedRoom')?.value || '');
        refreshUnifiedRateQuote();
    };

    function isRoomInHouse(res) {
        const room = roomForReservation(res);
        return roomOpsStatuses(room).some(status => ['occupied', 'inhouse', 'checkedin'].includes(status));
    }

    function normalizedRoomOpsValue(value) {
        return String(value || '').replace(/[-_\s]/g, '').toLowerCase();
    }

    function roomOpsStatuses(room) {
        return [room?.frontStatus, room?.status, room?.occupancyStatus, room?.roomStatus]
            .map(normalizedRoomOpsValue)
            .filter(Boolean);
    }

    function roomCleaningStatuses(room) {
        return [room?.housekeepingStatus, room?.hkStatus, room?.cleaningStatus, room?.frontStatus, room?.status]
            .map(normalizedRoomOpsValue)
            .filter(Boolean);
    }

    function checkinBlockReasonForRoom(room) {
        if (!room) return actionText('flow.noRoom');
        const statuses = roomOpsStatuses(room);
        if (statuses.some(status => ['oos', 'outofservice', 'outoforder', 'maintenance'].includes(status))) return actionText('flow.maintenanceRoom');
        return '';
    }

    function reservationHasCheckinReadyState(res) {
        const values = [
            res?.cleaningStatus,
            res?.housekeepingStatus,
            res?.frontStatus,
            res?.guestFlag
        ].map(normalizedRoomOpsValue);
        return values.some(status => ['clean', 'vacantclean', 'ready', 'none'].includes(status));
    }

    function checkinBlockReasonForReservation(res, room) {
        if (!room) return actionText('flow.noRoom');
        const statuses = roomOpsStatuses(room);
        const maintenanceBlocked = statuses.some(status => ['oos', 'outofservice', 'outoforder', 'maintenance'].includes(status));
        if (maintenanceBlocked && !reservationHasCheckinReadyState(res)) return actionText('flow.maintenanceRoom');
        if (statuses.some(status => ['occupied', 'inhouse', 'checkedin'].includes(status))) return actionText('flow.occupiedRoom');
        return '';
    }

    function checkinWarningForRoom(room) {
        const statuses = roomCleaningStatuses(room);
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

    function checkoutDateIsFuture(res) {
        const end = parseReservationDate(res?.checkOutDate || res?.checkout || res?.cout);
        if (!end) return false;
        return end > todayStart();
    }

    function reservationCheckOutTimeText(res) {
        return res?.checkOutTime || res?.departureTime || res?.stayTimes?.checkOutTime || res?.times?.checkOut || '12:00';
    }

    function earlyCheckoutConfirmMessage(res) {
        const end = parseReservationDate(res?.checkOutDate || res?.checkout || res?.cout);
        return actionText('flow.earlyCheckoutConfirm', {
            name: guestNameForReservation(res),
            checkoutDate: toDateInputValue(end) || '-',
            checkoutTime: reservationCheckOutTimeText(res)
        });
    }

    function effectiveReservationStatus(res) {
        if (!res) return 'confirmed';
        let status = normalizedReservationStatus(res.status || res.frontStatus || res.roomStatus);
        if (['confirmed', 'pending'].includes(status) && isRoomInHouse(res) && isOperationalStayWindow(res)) status = 'checkedin';
        if (status === 'checkedin' && checkoutDateIsTodayOrPast(res)) return 'checkout';
        return status;
    }

    function isReservationReadOnly(res) {
        if (!res) return false;
        const status = effectiveReservationStatus(res);
        if (['checkedin', 'checkout', 'completed', 'cancelled'].includes(status)) return true;
        return isRoomInHouse(res) && isOperationalStayWindow(res);
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
                            <div style="color:var(--txt);font-size:.9rem;margin-bottom:4px">${actionEscapeHtml(unifiedModalText('readonlyTitle'))}</div>
                            <div>${actionEscapeHtml(unifiedModalText('readonlyBody'))}</div>
                            <div style="margin-top:8px;color:var(--txt)">${actionEscapeHtml(unifiedModalText('readonlyGuestRoom', { guest: guestNameForReservation(res), room: roomLabel }))}</div>
                        </div>
                    </div>`;
            }
        }

        const isEditableGroupBlock = isBlock && !!res?.groupId;
        if (guestSection) guestSection.style.display = (isBlock && !isEditableGroupBlock) ? 'none' : 'block';
        const blockNotice = document.getElementById('unifiedBlockNotice');
        if (blockNotice) blockNotice.style.display = (!locked && isBlock) ? 'block' : 'none';
        const baseStayTimesLocked = reservationBaseStayTimesLocked(res);
        ['unifiedCin', 'unifiedCout', 'unifiedChannel'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.disabled = locked;
            if (el.tagName === 'SELECT' || el.tagName === 'INPUT') el.style.background = locked ? '#f1f5f9' : '#fff';
        });
        ['unifiedCheckInTime', 'unifiedCheckOutTime'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.disabled = baseStayTimesLocked;
            el.title = baseStayTimesLocked ? unifiedModalText('baseTimesLockedTitle') : '';
            el.style.background = baseStayTimesLocked ? '#f1f5f9' : '#fff';
            el.style.color = baseStayTimesLocked ? 'var(--txt2)' : 'var(--txt)';
        });
        const lateToggle = document.getElementById('unifiedLateCheckout');
        if (lateToggle) {
            lateToggle.disabled = ['completed', 'cancelled'].includes(effectiveReservationStatus(res));
            lateToggle.closest('label')?.style.setProperty('background', lateToggle.disabled ? '#f1f5f9' : '#fff');
            lateToggle.closest('label')?.style.setProperty('cursor', lateToggle.disabled ? 'not-allowed' : 'pointer');
        }
        syncUnifiedLateCheckoutControls();
        ['unifiedRoom', 'unifiedCompanions', 'unifiedNightlyRate', 'unifiedAmount', 'unifiedPrepaid'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.disabled = false;
            if (el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.style.background = '#fff';
        });

        const saveBtn = modal.querySelector('button[onclick="saveUnifiedRes()"]');
        if (saveBtn) saveBtn.style.display = 'inline-flex';
        const cancelBtn = document.getElementById('unifiedBtnCancel');
        if (cancelBtn && res) cancelBtn.style.display = canCancelReservation(res) ? 'inline-flex' : 'none';
        else if (locked && cancelBtn) cancelBtn.style.display = 'none';
    }

    function renderUnifiedFlowActions(res = null) {
        const box = document.getElementById('unifiedFlowActions');
        const placardBtn = document.getElementById('unifiedBtnPlacard');
        if (!box) return;
        box.innerHTML = '';
        if (placardBtn) placardBtn.style.display = 'none';
        if (!res || res.isGroupPlaceholder || normalizedReservationStatus(res.status) === 'blocked') return;
        const status = effectiveReservationStatus(res);
        const locked = isReservationReadOnly(res);
        if (status === 'checkedin' || status === 'checkout') {
            box.innerHTML = `<button type="button" class="btn-primary-sm" style="background:#EF4444" onclick="processUnifiedReservationFlow('checkout')"><i class="fa-solid fa-right-from-bracket"></i> ${actionEscapeHtml(unifiedModalText('processCheckout'))}</button>`;
        } else if (!locked && canProcessReservationCheckin(res)) {
            box.innerHTML = `<button type="button" class="btn-primary-sm" onclick="processUnifiedReservationFlow('checkin')"><i class="fa-solid fa-right-to-bracket"></i> ${actionEscapeHtml(unifiedModalText('processCheckin'))}</button>`;
            if (placardBtn) placardBtn.style.display = 'inline-flex';
        }
    }

    function reservationPlacardGuestLine(res = {}) {
        const primary = guestNameForReservation(res) || res.guest || res.guestName || '-';
        const companions = Array.isArray(res.roomingGuests) ? res.roomingGuests : (Array.isArray(res.companions) ? res.companions : []);
        const rawPax = Number(res.pax || res.guests || res.guestCount || res.people || 0);
        const total = Math.max(rawPax || 0, companions.length || 0, 1);
        return total > 1 ? reservationPlacardText('placard.guest.extra', `${primary} 외 ${total - 1}명`, { name: primary, count: total - 1 }) : primary;
    }

    function reservationPlacardFlightLine(res = {}) {
        const savedPlacardFlight = res.placardFlight || res.flightLabel || '';
        if (savedPlacardFlight) return savedPlacardFlight;
        const airline = res.airline || res.flightAirline || res.arrivalAirline || res.departureAirline || '';
        const flight = res.flightNo || res.flightNumber || res.arrivalFlight || res.departureFlight || res.pickupFlight || '';
        const combined = [airline, flight].filter(Boolean).join(' ');
        return combined || res.flight || res.transport || reservationPlacardText('placard.flight.empty', '항공편 미입력');
    }

    function reservationPlacardHotelName() {
        return localStorage.getItem('pms_hotel_name')
            || document.querySelector('.topbar .hotel-name, .topbar-brand, [data-hotel-name]')?.textContent?.trim()
            || 'The Grand Saigon';
    }

    function currentReservationForPlacard(resId = '') {
        const id = resId || document.getElementById('unifiedResId')?.value || '';
        const source = window.reservations || (typeof reservations !== 'undefined' ? reservations : []);
        return (Array.isArray(source) ? source : []).find(item => String(item.id || item.reservationId || '') === String(id));
    }

    function placardValuesFromInputs(res = {}) {
        const flightInput = document.getElementById('placardFlightInput');
        return {
            guest: reservationPlacardGuestLine(res),
            flight: (flightInput?.value || '').trim() || reservationPlacardFlightLine(res),
            hotel: reservationPlacardHotelName()
        };
    }

    function buildReservationPlacardHtml(values, mode = 'preview') {
        const rawGuest = values.guest || '-';
        const guest = actionEscapeHtml(rawGuest);
        const flight = actionEscapeHtml(values.flight || reservationPlacardText('placard.flight.empty', '항공편 미입력'));
        const hotel = actionEscapeHtml(values.hotel || 'The Grand Saigon');
        const guestLength = String(rawGuest).length;
        const printRoot = mode === 'print'
            ? "width:297mm;height:210mm;padding:0;page-break-inside:avoid;"
            : "width:100%;height:100%;padding:0;";
        const guestFont = mode === 'print'
            ? (guestLength > 24 ? '22mm' : guestLength > 16 ? '27mm' : guestLength > 10 ? '32mm' : '40mm')
            : (guestLength > 24 ? '56px' : guestLength > 16 ? '70px' : guestLength > 10 ? '88px' : '108px');
        const infoFont = mode === 'print' ? '15mm' : '40px';
        const infoGap = mode === 'print' ? '10mm' : '28px';
        const lowerPadding = mode === 'print' ? '0 7% 22mm' : '0 7% 44px';
        return `
            <section class="placard-sheet" style="${printRoot}background:#fff;color:#0f172a;font-family:'Inter','Noto Sans KR','Malgun Gothic',sans-serif;display:flex;flex-direction:column;justify-content:stretch;overflow:hidden;">
                <div style="height:50%;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 5%;font-weight:950;font-size:${guestFont};line-height:1;letter-spacing:0;word-break:keep-all;white-space:nowrap;">${guest}</div>
                <div style="height:50%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;text-align:center;gap:${infoGap};padding:${lowerPadding};">
                    <div style="font-weight:900;font-size:${infoFont};line-height:1.08;word-break:keep-all;">${flight}</div>
                    <div style="font-weight:950;font-size:${infoFont};line-height:1.08;word-break:keep-all;">${hotel}</div>
                </div>
            </section>
        `;
    }

    function reservationPlacardText(key, fallback, params) {
        const localMap = {
            'placard.guest.extra': 'placardGuestExtra',
            'placard.flight.empty': 'placardFlightEmpty',
            'placard.preview.unsaved': 'placardUnsaved',
            'placard.saved.state': 'placardSaved',
            'placard.flight.saved.toast': 'placardToast'
        };
        if (localMap[key]) return unifiedModalText(localMap[key], params || {});
        if (typeof window.t === 'function') {
            const translated = window.t(key, params);
            if (translated && translated !== key) return translated;
        }
        return fallback;
    }

    function applyReservationPlacardI18n() {
        const root = document.getElementById('reservationPlacardModal');
        if (!root) return;
        root.querySelectorAll('[data-action-i18n]').forEach(element => {
            const key = element.getAttribute('data-action-i18n');
            element.textContent = unifiedModalText(key);
        });
        root.querySelectorAll('[data-action-placeholder]').forEach(element => {
            const key = element.getAttribute('data-action-placeholder');
            element.setAttribute('placeholder', unifiedModalText(key));
        });
        root.querySelectorAll('[data-i18n-key]').forEach(element => {
            const key = element.getAttribute('data-i18n-key');
            element.textContent = reservationPlacardText(key, element.textContent || key);
        });
        root.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.setAttribute('placeholder', reservationPlacardText(key, element.getAttribute('placeholder') || key));
        });
    }

    window.updateReservationPlacardPreview = function() {
        const res = currentReservationForPlacard();
        const canvas = document.getElementById('placardPreviewCanvas');
        if (!res || !canvas) return;
        canvas.innerHTML = buildReservationPlacardHtml(placardValuesFromInputs(res), 'preview');
        const state = document.getElementById('placardSaveState');
        if (state) state.textContent = reservationPlacardText('placard.preview.unsaved', '미리보기 반영됨 · 저장 전');
    };

    window.openReservationPlacardPreview = function(resId = '') {
        const res = currentReservationForPlacard(resId);
        if (!res) return;
        const modal = document.getElementById('reservationPlacardModal');
        const input = document.getElementById('placardFlightInput');
        const currentFlight = reservationPlacardFlightLine(res);
        if (input) input.value = currentFlight === reservationPlacardText('placard.flight.empty', '항공편 미입력') ? '' : currentFlight;
        applyReservationPlacardI18n();
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
        }
        window.updateReservationPlacardPreview();
        setTimeout(() => input?.focus(), 80);
    };

    window.closeReservationPlacardPreview = function() {
        const modal = document.getElementById('reservationPlacardModal');
        if (!modal) return;
        modal.classList.remove('active');
        modal.style.display = 'none';
    };

    window.applyReservationPlacardFlight = async function(options = {}) {
        const res = currentReservationForPlacard();
        if (!res) return false;
        const input = document.getElementById('placardFlightInput');
        const flight = (input?.value || '').trim();
        res.placardFlight = flight;
        res.flightLabel = flight;
        await persistUnifiedReservation(res);
        const state = document.getElementById('placardSaveState');
        if (state) state.textContent = reservationPlacardText('placard.saved.state', '저장 완료 · 예약 데이터 저장됨');
        if (!options.silent && window.showToast) window.showToast(reservationPlacardText('placard.flight.saved.toast', '플랫카드 항공편이 저장되었습니다.'), 'success');
        return true;
    };

    window.printReservationPlacardFromPreview = async function() {
        const res = currentReservationForPlacard();
        if (!res) return;
        await window.applyReservationPlacardFlight({ silent: true });
        const values = placardValuesFromInputs(res);
        const printWindow = window.open('', '_blank', 'width=900,height=620');
        if (!printWindow) return window.print();
        printWindow.document.write(`
            <!doctype html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <title>${actionEscapeHtml(reservationPlacardText('Placard', '플랫카드'))} - ${actionEscapeHtml(values.guest)}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&family=Noto+Sans+KR:wght@500;700;800;900&display=swap" rel="stylesheet">
                <style>
                    @page{size:A4 landscape;margin:0}
                    *{box-sizing:border-box}
                    html,body{width:297mm;height:210mm}
                    body{margin:0;font-family:'Inter','Noto Sans KR',sans-serif;color:#0f172a;background:#fff;overflow:hidden}
                    @media print{html,body{width:297mm;height:210mm}body{padding:0}.placard-sheet{break-inside:avoid}}
                </style>
            </head>
            <body>
                ${buildReservationPlacardHtml(values, 'print')}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
    };

    window.printReservationPlacard = window.openReservationPlacardPreview;

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

    function refreshUnifiedReservationViews(context = {}) {
        if (typeof window.syncUnifiedReservationPageState === 'function') {
            try {
                window.syncUnifiedReservationPageState(context);
            } catch(e) {
                console.warn('Unified page state sync failed', e);
            }
        }
        if (typeof window.renderTable === 'function') window.renderTable();
        if (typeof window.buildTimeline === 'function') window.buildTimeline();
        if (typeof window.buildMobileView === 'function') window.buildMobileView();
        if (typeof window.renderResTable === 'function') window.renderResTable();
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
        if (action === 'checkin' && !canProcessReservationCheckin(res)) {
            const message = checkinNotAllowedMessage(res);
            showReservationAlert(message, 'error');
            setUnifiedReservationReadonly(isReservationReadOnly(res), res);
            renderUnifiedFlowActions(res);
            return;
        }
        if (action === 'checkout' && !['checkedin', 'checkout'].includes(currentStatus)) {
            const message = actionText('flow.checkoutOnlyInhouse');
            showReservationAlert(message, 'error');
            renderUnifiedFlowActions(res);
            return;
        }
        const room = roomForReservation(res);
        let checkinWarning = '';
        if (action === 'checkin') {
            const blockReason = checkinBlockReasonForReservation(res, room);
            if (blockReason) {
                showReservationAlert(blockReason, 'error');
                return;
            }
            checkinWarning = checkinWarningForRoom(room);
        }

        const label = action === 'checkin' ? actionText('action.checkin') : actionText('action.checkout');
        let confirmMessage = actionText('flow.confirm', { name: guestNameForReservation(res), action: label });
        const confirmOptions = {};
        if (action === 'checkout' && checkoutDateIsFuture(res)) {
            confirmMessage = earlyCheckoutConfirmMessage(res);
            confirmOptions.title = actionText('flow.earlyCheckoutTitle');
            confirmOptions.okText = actionText('flow.earlyCheckoutOk');
            confirmOptions.type = 'error';
        }
        if (checkinWarning) {
            confirmMessage = `${checkinWarning}\n\n${confirmMessage}`;
            confirmOptions.title = actionText('flow.dirtyRoomTitle');
            confirmOptions.okText = actionText('flow.continueCheckin');
        }
        const confirmed = await confirmReservationDialog(confirmMessage, confirmOptions);
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
        logReservationAudit(`reservation.${action}`, {
            reservationId: res.id || res.reservationId || '',
            guestName: guestNameForReservation(res),
            room: room?.roomNo || room?.number || res.roomNo || res.roomNumber || res.room || res.fullRoom || '',
            beforeStatus: currentStatus,
            afterStatus: effectiveReservationStatus(res),
            fields: ['reservationId', 'guestName', 'room', 'status']
        });
        if (window.showToast) {
            const toastKey = checkinWarning ? 'flow.completedRoomNotReady' : 'flow.completed';
            window.showToast(actionText(toastKey, { action: label }), 'success');
        }
        refreshUnifiedReservationViews({ action: `flow:${action}`, reservation: res });
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
        unifiedLastRateQuote = null;
        const allRes = window.reservations || (typeof reservations !== 'undefined' ? reservations : null);
        if (!allRes) {
            showReservationAlert('Error: reservations variable not found!', 'error');
            return;
        }
        setUnifiedReservationReadonly(false);

        // Initialize Guest Search Widget
        if (!window._editGuestWidget && typeof initGuestSearch === 'function') {
            window._editGuestWidget = initGuestSearch('Edit');
        }
        wireUnifiedGuestWidgetActions(window._editGuestWidget);

        const currentRes = resId ? allRes.find(r => r.id === resId) : null;
        const isEditingBlock = !!(currentRes && (normalizedReservationStatus(currentRes.status) === 'blocked' || currentRes.isGroupPlaceholder));
        const isEditableGroupBlock = !!(isEditingBlock && currentRes?.groupId);

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
                        const occupied = !currentRes && roomOpsStatuses(r).some(status => ['occupied', 'inhouse', 'checkedin'].includes(status));
                        opt.disabled = blocked || occupied;
                        opt.textContent = `${r.id} (${roomTypeDisplay(r.type)})${blocked ? ` · ${unifiedModalText('roomBlocked')}` : occupied ? ` · ${unifiedModalText('roomOccupied')}` : ''}`;
                        group.appendChild(opt);
                    });
                    roomSelect.appendChild(group);
                });
            } else {
                window.rooms.forEach(r => {
                    const opt = document.createElement('option');
                    opt.value = r.id;
                    const blocked = !prefillGroupId && allRes.some(res => (res.room === r.id || res.fullRoom === r.id) && res.status === 'blocked' && (!currentRes || res.id !== currentRes.id));
                    const occupied = !currentRes && roomOpsStatuses(r).some(status => ['occupied', 'inhouse', 'checkedin'].includes(status));
                    opt.disabled = blocked || occupied;
                    opt.textContent = `${r.id} (${roomTypeDisplay(r.type)})${blocked ? ` · ${unifiedModalText('roomBlocked')}` : occupied ? ` · ${unifiedModalText('roomOccupied')}` : ''}`;
                    roomSelect.appendChild(opt);
                });
            }
        }
        if (!resId) {
            // NEW BOOKING MODE
            const cancelBtn = document.getElementById('unifiedBtnCancel');
            if (cancelBtn) cancelBtn.style.display = 'none';
            await renderUnifiedGuestPrivacy(null);
            document.getElementById('unifiedModalTitleText').textContent = actionText('booking.newTitle');
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
            setUnifiedStayTimeValues(null, prefill || {});
            const reservationNote = document.getElementById('unifiedReservationNote');
            if (reservationNote) reservationNote.value = compactValue(prefill?.specialNotes || prefill?.notes || prefill?.note);
            const preferredRoom = prefill?.room || prefill?.fullRoom || prefill?.roomId || prefill?.roomNo || prefill?.roomLabel || '';
            window.updateUnifiedStayAndRooms(preferredRoom);
            if (window._editGuestWidget) {
                window._editGuestWidget.reset();
            }
            setUnifiedGuestRoster(await rosterGuestsForReservation(prefill || null));
            setUnifiedFinanceValues(null, {
                amount: Number(prefill?.amount || prefill?.totalAmount?.amount || 0),
                prepaid: Number(prefill?.prepaidAmount || prefill?.paymentPlan?.prepaidAmount || 0),
                prepaidRows: prefill?.prepaidReceivedRows || prefill?.paymentPlan?.prepaidReceivedRows,
                prepaidBreakdown: prefill?.prepaidReceivedBreakdown || prefill?.paymentPlan?.prepaidReceivedBreakdown
            });
            refreshUnifiedRateQuote({ force: !Number(prefill?.amount || prefill?.totalAmount?.amount || 0) });
            renderUnifiedRoomHistory(null);
            renderUnifiedFlowActions(null);
        } else {
            // EDIT BOOKING MODE
            const cancelBtn = document.getElementById('unifiedBtnCancel');
            if (cancelBtn) cancelBtn.style.display = 'inline-flex';
            const res = allRes.find(r => r.id === resId);
            if (!res) {
                showReservationAlert('Error: reservation not found for ID ' + resId, 'error');
                return;
            }
            const effectiveStatus = effectiveReservationStatus(res);
            const isReadonlyReservation = isReservationReadOnly(res);
            
            const linkedGroupId = res.groupId || '';
            const isB2B = !!linkedGroupId;
            const isVip = res.isVip || (res.vip && res.vip.toLowerCase().includes('vip'));
            const groupBadgeText = unifiedModalText('groupLinked');
            const b2bBadge = isB2B ? `<span style="background:#111827;color:#fff;font-size:0.65rem;padding:2px 6px;border-radius:4px;margin-left:8px;font-weight:600;vertical-align:middle;letter-spacing:0.5px"><i class="fa-solid fa-building"></i> ${groupBadgeText}</span>` : '';
            const vipText = unifiedModalText('vip');
            const vipBadge = isVip ? `<span style="background:rgba(245,158,11,.15);color:#D97706;font-size:0.65rem;padding:2px 6px;border-radius:4px;margin-left:8px;font-weight:700;vertical-align:middle;"><i class="fa-solid fa-crown"></i> ${vipText}</span>` : '';
            
            document.getElementById('unifiedModalTitleText').innerHTML = `${reservationModalRoomTitle(res)} ${b2bBadge} ${vipBadge}`;
            document.getElementById('unifiedResId').value = res.id;
            
            if (window.rooms && window.rooms.length === 0) {
                const opt = document.createElement('option');
                opt.value = res.room;
                opt.textContent = res.room;
                roomSelect.appendChild(opt);
            }
            const matchedRoom = roomForValue(res.room || res.fullRoom || res.roomId || res.roomNo || res.roomLabel);
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
                guestSection.style.display = (isEditingBlock && !isEditableGroupBlock) ? 'none' : 'block';
                let blockNotice = document.getElementById('unifiedBlockNotice');
                if (!blockNotice) {
                    blockNotice = document.createElement('div');
                    blockNotice.id = 'unifiedBlockNotice';
                    blockNotice.style.cssText = 'margin-bottom:20px;background:#f8fafc;border:1px solid var(--border2);border-radius:8px;padding:14px;font-size:.82rem;color:var(--txt2);font-weight:700';
                    guestSection.parentElement.insertBefore(blockNotice, guestSection);
                }
                blockNotice.style.display = (isEditingBlock && !isReadonlyReservation) ? 'block' : 'none';
                blockNotice.innerHTML = isEditableGroupBlock
                    ? `<i class="fa-solid fa-building" style="color:var(--primary);margin-right:6px"></i> ${actionEscapeHtml(unifiedModalText('blockEditableNotice'))}`
                    : `<i class="fa-solid fa-building" style="color:var(--primary);margin-right:6px"></i> ${actionEscapeHtml(unifiedModalText('blockLockedNotice'))}`;
            }

            if ((!isEditingBlock || isEditableGroupBlock) && window._editGuestWidget) {
                window._editGuestWidget.reset();
            } else if (window._editGuestWidget) {
                window._editGuestWidget.reset();
            }
        
            document.getElementById('unifiedStatus').value = isEditingBlock ? 'blocked' : (isReadonlyReservation ? effectiveStatus : normalizedReservationStatus(res.status));
            
            await setUnifiedGroupLink(linkedGroupId);
            const channelEl = document.getElementById('unifiedChannel');
            if (channelEl) channelEl.value = res.channel || 'Walk-in';

            setUnifiedDateValue('unifiedCin', res.checkInDate || res.checkin || res.cin);
            setUnifiedDateValue('unifiedCout', res.checkOutDate || res.checkout || res.cout);
            setUnifiedStayTimeValues(res);
            const reservationNote = document.getElementById('unifiedReservationNote');
            if (reservationNote) reservationNote.value = compactValue(res.specialNotes || res.notes || res.note);
            window.updateUnifiedStayAndRooms(targetRoomValue);
            const shouldLoadRoster = !isEditingBlock || (isEditableGroupBlock && !res.isGroupPlaceholder);
            setUnifiedGuestRoster(shouldLoadRoster ? await rosterGuestsForReservation(res) : []);
            setUnifiedFinanceValues(res);
            refreshUnifiedRateQuote();
            setUnifiedReservationReadonly(isReadonlyReservation, res);
            renderUnifiedFlowActions(res);
            await renderUnifiedGuestPrivacy(res);
            renderUnifiedRoomHistory(res);
        }

        // Hide other modals if they are open
        ['resModal', 'resDetailModal', 'editResModal'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.remove('active');
        });
        
        const unifiedModal = document.getElementById('unifiedResModal');
        if (unifiedModal) {
            unifiedModal.style.display = 'flex';
            unifiedModal.classList.add('active');
        }
    };

    window.closeUnifiedResModal = function() {
        const unifiedModal = document.getElementById('unifiedResModal');
        if (unifiedModal) {
            unifiedModal.classList.remove('active');
            unifiedModal.style.display = 'none';
        }
    };

    window.saveUnifiedRes = async function() {
        const id = document.getElementById('unifiedResId').value;
        const allRes = window.reservations || (typeof reservations !== 'undefined' ? reservations : null);
        if (!allRes) return;
        
        let guest = '';
        const currentRes = id ? allRes.find(r => r.id === id) : null;
        const operationalEdit = !!(currentRes && isReservationReadOnly(currentRes));
        const currentIsBlock = !!(currentRes && (normalizedReservationStatus(currentRes.status) === 'blocked' || currentRes.isGroupPlaceholder));
        const isEditableGroupBlockSave = !!(currentIsBlock && currentRes?.groupId);
        const selectedStatusValue = document.getElementById('unifiedStatus')?.value || normalizedReservationStatus(currentRes?.status);
        const isBlockSave = currentIsBlock && selectedStatusValue === 'blocked' && !isEditableGroupBlockSave;
        if (!isBlockSave) {
            let primaryEntry = getUnifiedPrimaryGuestEntry();
            if (!primaryEntry) {
                const candidate = getUnifiedSelectedGuestCandidate();
                if (candidate && compactValue(candidate.name)) {
                    upsertUnifiedRosterGuest(candidate, 'primary');
                    primaryEntry = getUnifiedPrimaryGuestEntry();
                }
            }
            if (!primaryEntry && currentRes && !isEditableGroupBlockSave) {
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
        if (!isBlockSave && !isEditableGroupBlockSave && (!guest || !guest.trim())) {
            showReservationAlert(actionText('guest.required'), 'error');
            return;
        }
        const stayValidation = validateUnifiedStaySchedule();
        const dateRange = stayValidation.range;
        if (!dateRange.checkin || !dateRange.checkout) {
            showReservationAlert(actionText('booking.dateRequired'), 'error');
            return;
        }
        if (!currentRes && dateRange.checkin < todayStart()) {
            showReservationAlert(actionText('booking.pastCheckin'), 'error');
            return;
        }
        if (!stayValidation.valid) {
            stayValidation.input?.focus();
            showReservationAlert(stayValidation.message || actionText('booking.invalidDates'), 'error');
            return;
        }
        updateUnifiedNightsLabel();
        const roomSelect = document.getElementById('unifiedRoom');
        const requestedRoom = roomSelect?.value || '';
        refreshUnifiedRoomOptions(requestedRoom);
        const room = roomSelect?.value || '';
        const selectedOption = roomSelect?.selectedOptions?.[0];
        if (!room || roomSelect?.disabled || selectedOption?.disabled) {
            showReservationAlert(actionText('booking.roomRequired'), 'error');
            return;
        }
        const selectedRoom = roomForValue(room);
        const selectedIsCurrentRoom = !!(currentRes && selectedRoom && roomMatchesReservation(selectedRoom, currentRes));
        const roomConflict = !selectedIsCurrentRoom && !currentRes
            ? roomConflictForDates(selectedRoom || { id: room }, dateRange.checkin, dateRange.checkout, currentRes)
            : null;
        if (roomConflict) {
            const conflictId = compactValue(roomConflict.id || roomConflict.reservationId) || '-';
            const conflictGuest = compactValue(guestNameForReservation(roomConflict)) || '-';
            const conflictStart = compactValue(roomConflict.checkInDate || roomConflict.checkin || roomConflict.cin) || '-';
            const conflictEnd = compactValue(roomConflict.checkOutDate || roomConflict.checkout || roomConflict.cout) || '-';
            showReservationAlert(`${actionText('booking.roomUnavailable')}\n${conflictId} · ${conflictGuest} · ${conflictStart} ~ ${conflictEnd}`, 'error');
            return;
        }
        if (!currentRes && selectedRoom) {
            const bookingBlockReason = checkinBlockReasonForRoom(selectedRoom);
            if (bookingBlockReason) {
                showReservationAlert(bookingBlockReason, 'error');
                return;
            }
            const cleaningWarning = checkinWarningForRoom(selectedRoom);
            if (cleaningWarning) {
                const confirmed = await confirmReservationDialog(
                    `${cleaningWarning}\n\n${actionText('booking.dirtyRoomConfirm')}`,
                    { title: actionText('flow.dirtyRoomTitle'), okText: actionText('button.save') }
                );
                if (!confirmed) return;
            }
        }
        let status = id
            ? (operationalEdit ? normalizedReservationStatus(currentRes?.status) : (document.getElementById('unifiedStatus')?.value || normalizedReservationStatus(currentRes?.status)))
            : 'confirmed';
        if (isEditableGroupBlockSave && guest.trim() && status === 'blocked') status = 'confirmed';
        let channel = document.getElementById('unifiedChannel')?.value || 'Walk-in';
        const groupId = document.getElementById('unifiedGroupId')?.value || '';
        const isB2B = !!groupId;
        const linkedGroupName = isB2B ? (await unifiedGroupName(groupId) || currentRes?.groupName || '') : '';
        let savedRes = null;
        let groupSyncMeta = null;
        const cinText = toReservationDateText(getUnifiedDateInputValue('unifiedCin'));
        const coutText = toReservationDateText(getUnifiedDateInputValue('unifiedCout'));
        const cinIso = getUnifiedDateInputValue('unifiedCin');
        const coutIso = getUnifiedDateInputValue('unifiedCout');
        const stayTimeData = lockedBaseStayTimePayload(currentRes, unifiedStayTimePayload());
        const nights = updateUnifiedNightsLabel() || 1;
        const currency = reservationCurrency(currentRes);
        syncUnifiedBalance();
        const totalAmount = parseMoneyInput(document.getElementById('unifiedAmount')?.value, currency);
        const prepaidReceivedRows = prepaidRowsFromInputs();
        const invalidPrepaidRows = prepaidReceivedRows.filter(row => row.currency !== 'PHP' && Number(row.amount || 0) > 0 && Number(row.phpEquivalent || 0) <= 0);
        if (invalidPrepaidRows.length) {
            showReservationAlert(unifiedModalText('depositPhpRequired'), 'error');
            return;
        }
        const prepaidRowsTotal = prepaidPhpTotalFromRows(prepaidReceivedRows);
        if (prepaidReceivedRows.length && prepaidRowsTotal > totalAmount) {
            showReservationAlert(unifiedModalText('depositExceedsTotal'), 'error');
            return;
        }
        const prepaidAmount = Math.min(prepaidRowsTotal, totalAmount);
        const prepaidReceivedBreakdown = prepaidBreakdownFromRows(prepaidReceivedRows);
        const balanceDue = normalizeMoneyAmount(totalAmount - prepaidAmount, currency);
        const enteredNightlyRate = parseMoneyInput(document.getElementById('unifiedNightlyRate')?.value, currency);
        const nightlyRate = enteredNightlyRate || (nights ? Math.round((totalAmount / nights) * 100) / 100 : totalAmount);
        const rateQuote = unifiedLastRateQuote;
        const manualAmountOverride = !!(rateQuote && totalAmount !== normalizeMoneyAmount(rateQuote.total, currency));
        const shouldWriteGuest = !isBlockSave && (!isEditableGroupBlockSave || !!guest.trim() || getUnifiedCompanionGuestEntries().length > 0);
        if (shouldWriteGuest) {
            const guestsPersisted = await persistUnifiedRosterGuests();
            if (!guestsPersisted) return;
            guest = compactValue(getUnifiedPrimaryGuestEntry()?.name || guest);
        }
        const existingGuestName = compactValue(guestNameForReservation(currentRes));
        const guestPayload = shouldWriteGuest
            ? unifiedRosterPayload(guest)
            : {
                guest: existingGuestName,
                guestId: compactValue(currentRes?.guestId || currentRes?.roomingGuestId),
                companionGuestNames: companionNamesForReservation(currentRes),
                companionGuestIds: Array.isArray(currentRes?.companionGuestIds) ? currentRes.companionGuestIds : [],
                roomingGuestNames: Array.isArray(currentRes?.roomingGuestNames) ? currentRes.roomingGuestNames : (existingGuestName ? [existingGuestName, ...companionNamesForReservation(currentRes)] : []),
                roomingGuests: Array.isArray(currentRes?.roomingGuests) ? currentRes.roomingGuests : [],
                companions: Array.isArray(currentRes?.companions) ? currentRes.companions : []
            };
        guest = guestPayload.guest || guest;
        const companionGuestNames = guestPayload.companionGuestNames;
        const reservationNote = compactValue(document.getElementById('unifiedReservationNote')?.value);
        
        if (isB2B) channel = linkedGroupName || channel || 'Group';
        
        if (!id) {
            // NEW BOOKING MODE
            const nowIso = window.PmsDate?.nowIso ? window.PmsDate.nowIso() : new Date().toISOString();
            const newId = 'RSV-' + nowIso.replace(/\D/g,'').slice(0,14) + '-' + Math.floor(Math.random()*1000);
            const newRes = {
                id: newId,
                createdAt: nowIso,
                updatedAt: nowIso,
                bookingDate: nowIso,
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
                checkInTime: stayTimeData.checkInTime,
                checkOutTime: stayTimeData.checkOutTime,
                lateCheckout: stayTimeData.lateCheckout,
                lateCheckoutTime: stayTimeData.lateCheckoutTime,
                stayTimes: stayTimeData.stayTimes,
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
                discountPercent: rateQuote?.discountPercent || 0,
                roomRateQuote: rateQuote ? { ...rateQuote } : null,
                manualAmountOverride,
                prepaidAmount,
                prepaidReceivedRows,
                prepaidReceivedBreakdown,
                balanceDue,
                paymentPlan: {
                    totalAmount,
                    prepaidAmount,
                    prepaidReceivedRows,
                    prepaidReceivedBreakdown,
                    balanceDue,
                    currency,
                    settlementBasis: 'reservation-room-total',
                    rateQuote: rateQuote ? { ...rateQuote } : null,
                    manualAmountOverride
                },
                roomChangeHistory: [],
                roomMoveHistory: [],
                color: '#3B82F6',
                initials: guest.substring(0,2).toUpperCase(),
                vip: 'Standard'
            };
            newRes.specialNotes = reservationNote;
            newRes.notes = reservationNote;
            newRes.note = reservationNote;
            allRes.unshift(newRes);
            savedRes = newRes;
            if (newRes.groupId) groupSyncMeta = { roomChanged: true, beforeRoom: '', beforeFullRoom: '' };
            logReservationAudit('reservation.create', {
                reservationId: newRes.id,
                guestName: guestNameForReservation(newRes),
                room: newRes.room,
                status: newRes.status,
                checkin: newRes.cin,
                checkout: newRes.cout,
                checkInTime: newRes.checkInTime,
                checkOutTime: newRes.checkOutTime,
                lateCheckout: newRes.lateCheckout,
                lateCheckoutTime: newRes.lateCheckoutTime,
                amount: totalAmount,
                prepaidAmount,
                balanceDue,
                currency,
                fields: ['reservationId', 'guestName', 'room', 'dates', 'stayTimes', 'lateCheckout', 'amount']
            });
            if (window.showToast) window.showToast(actionText('booking.created'), 'success');
        } else {
            // EDIT BOOKING MODE
            const res = allRes.find(r => r.id === id);
            if (res) {
                const beforeRoom = res.room;
                const beforeFullRoom = res.fullRoom || res.roomId || res.room;
                const beforeAmount = reservationAmountValue(res);
                const beforePrepaid = reservationPrepaidValue(res);
                const beforeDeposit = reservationDepositValue(res);
                const beforeStatus = effectiveReservationStatus(res);
                const beforeChannel = compactValue(res.channel);
                const beforeGroupId = compactValue(res.groupId);
                const beforeCinText = toReservationDateText(res.checkInDate || res.checkin || res.cin);
                const beforeCoutText = toReservationDateText(res.checkOutDate || res.checkout || res.cout);
                const beforeCheckInTime = reservationCheckInTime(res);
                const beforeCheckOutTime = reservationCheckOutTime(res);
                const beforeLateCheckout = reservationLateCheckoutEnabled(res);
                const beforeLateCheckoutTime = beforeLateCheckout ? reservationLateCheckoutTime(res) : '';
                const beforeGuest = guestNameForReservation(res);
                const beforeGuestId = compactValue(res.guestId || res.roomingGuestId);
                const beforeCompanionNames = companionNamesForReservation(res);
                const beforeReservationNote = compactValue(res.specialNotes || res.notes || res.note);
                if (shouldWriteGuest) {
                    const nextGuestId = guestPayload.guestId || (beforeGuest === guest ? beforeGuestId : '');
                    res.guest = guest;
                    res.guestName = guest;
                    res.roomingGuestName = guest;
                    res.guestId = nextGuestId;
                    res.roomingGuestId = nextGuestId;
                    if (guest.trim()) res.initials = guest.split(' ').map(n => n[0]).join('');
                    if (res.isGroupPlaceholder && status !== 'blocked' && guest.trim()) {
                        res.isGroupPlaceholder = false;
                        res.groupAssigned = true;
                        if (!res.color || res.color === '#111827') res.color = '#2563EB';
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
                res.checkInTime = stayTimeData.checkInTime;
                res.checkOutTime = stayTimeData.checkOutTime;
                res.lateCheckout = stayTimeData.lateCheckout;
                res.lateCheckoutTime = stayTimeData.lateCheckoutTime;
                res.stayTimes = { ...(res.stayTimes || {}), ...stayTimeData.stayTimes };
                res.nights = nights;
                res.len = nights;
                res.type = selectedRoom?.type || res.type || 'Standard';
                const selectedRoomId = [selectedRoom?.roomId, selectedRoom?.fullRoom, selectedRoom?.id]
                    .find(value => sameRoomValue(value, room)) || room;
                const selectedRoomNo = [selectedRoom?.roomNo, selectedRoom?.number, selectedRoom?.display]
                    .find(value => sameRoomValue(value, room)) || room;
                res.fullRoom = selectedRoomId;
                res.roomId = selectedRoomId;
                res.roomNo = selectedRoomNo;
                res.roomNumber = selectedRoomNo;
                res.roomLabel = [selectedRoom?.displayName, selectedRoom?.roomLabel]
                    .find(value => sameRoomValue(value, room)) || selectedRoomNo;
                res.companionGuestNames = companionGuestNames;
                res.companionGuestIds = guestPayload.companionGuestIds;
                res.roomingGuestNames = guestPayload.roomingGuestNames;
                res.roomingGuests = guestPayload.roomingGuests;
                res.companions = guestPayload.companions;
                res.specialNotes = reservationNote;
                res.notes = reservationNote;
                res.note = reservationNote;
                res.amount = totalAmount;
                res.rate = { amount: nightlyRate, currency };
                res.totalAmount = { amount: totalAmount, currency };
                res.discountPercent = rateQuote?.discountPercent || 0;
                res.roomRateQuote = rateQuote ? { ...rateQuote } : null;
                res.manualAmountOverride = manualAmountOverride;
                res.prepaidAmount = prepaidAmount;
                res.prepaidReceivedRows = prepaidReceivedRows;
                res.prepaidReceivedBreakdown = prepaidReceivedBreakdown;
                res.balanceDue = balanceDue;
                res.paymentPlan = {
                    ...(res.paymentPlan || {}),
                    totalAmount,
                    prepaidAmount,
                    prepaidReceivedRows,
                    prepaidReceivedBreakdown,
                    balanceDue,
                    currency,
                    settlementBasis: 'reservation-room-total',
                    rateQuote: rateQuote ? { ...rateQuote } : null,
                    manualAmountOverride
                };
                const roomChanged = !sameRoomValue(beforeRoom, room) && !sameRoomValue(beforeFullRoom, res.fullRoom);
                if (res.groupId) {
                    groupSyncMeta = {
                        roomChanged,
                        beforeRoom,
                        beforeFullRoom
                    };
                }
                const isPostCheckinEdit = ['checkedin', 'checkout'].includes(beforeStatus);
                const guestChanged = beforeGuest !== guestNameForReservation(res) || beforeGuestId !== compactValue(res.guestId || res.roomingGuestId);
                const companionsChanged = beforeCompanionNames.join('|') !== companionGuestNames.join('|');
                const auditChanges = [];
                const auditFields = [];
                const addAuditChange = (field, label, before, after) => {
                    const beforeText = Array.isArray(before) ? before.join(', ') : String(before ?? '');
                    const afterText = Array.isArray(after) ? after.join(', ') : String(after ?? '');
                    if (beforeText === afterText) return;
                    auditFields.push(field);
                    auditChanges.push({ field, label, before: beforeText || '-', after: afterText || '-' });
                };
                addAuditChange('room', '객실', beforeRoom || beforeFullRoom, room || res.fullRoom);
                addAuditChange('status', '상태', beforeStatus, status);
                addAuditChange('dates', '투숙일', `${beforeCinText} ~ ${beforeCoutText}`, `${cinText} ~ ${coutText}`);
                addAuditChange(
                    'stayTimes',
                    '입퇴실 시간',
                    stayTimeSummaryFromValues(beforeCheckInTime, beforeCheckOutTime, beforeLateCheckout, beforeLateCheckoutTime),
                    stayTimeSummaryFromValues(stayTimeData.checkInTime, stayTimeData.checkOutTime, stayTimeData.lateCheckout, stayTimeData.lateCheckoutTime)
                );
                addAuditChange(
                    'lateCheckout',
                    '레이트 체크아웃',
                    beforeLateCheckout ? (beforeLateCheckoutTime || beforeCheckOutTime) : '없음',
                    stayTimeData.lateCheckout ? (stayTimeData.lateCheckoutTime || stayTimeData.checkOutTime) : '없음'
                );
                addAuditChange('guestName', '대표 투숙객', beforeGuest, guestNameForReservation(res));
                addAuditChange('companionGuestNames', '동반 투숙객', beforeCompanionNames, companionGuestNames);
                addAuditChange('amount', '총 금액', beforeAmount, totalAmount);
                addAuditChange('prepayment', '예치금', beforePrepaid, prepaidAmount);
                addAuditChange('channel', '유입/업체', beforeChannel, channel);
                addAuditChange('group', '단체', beforeGroupId, groupId);
                addAuditChange('note', '예약 메모', beforeReservationNote, reservationNote);
                if (auditChanges.length) {
                    logReservationAudit('reservation.update', {
                        reservationId: res.id,
                        guestName: guestNameForReservation(res),
                        room: res.room,
                        changes: auditChanges,
                        fields: [...new Set(['reservationId', ...auditFields])],
                        currency
                    });
                }
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
                const stayTimesChanged = beforeCheckInTime !== stayTimeData.checkInTime
                    || beforeCheckOutTime !== stayTimeData.checkOutTime
                    || beforeLateCheckout !== stayTimeData.lateCheckout
                    || beforeLateCheckoutTime !== stayTimeData.lateCheckoutTime;
                if (isPostCheckinEdit && stayTimesChanged) {
                    logReservationAudit('reservation.stay_time.adjust', {
                        reservationId: res.id,
                        guestName: guestNameForReservation(res),
                        room: res.room,
                        before: stayTimeSummaryFromValues(beforeCheckInTime, beforeCheckOutTime, beforeLateCheckout, beforeLateCheckoutTime),
                        after: stayTimeSummaryFromValues(stayTimeData.checkInTime, stayTimeData.checkOutTime, stayTimeData.lateCheckout, stayTimeData.lateCheckoutTime),
                        fields: ['reservationId', 'guestName', 'room', 'stayTimes', 'lateCheckout']
                    });
                }
                if (roomChanged) {
                    const move = createRoomChangeRecord(res, {
                        fromRoom: beforeRoom || beforeFullRoom || '',
                        toRoom: room,
                        fromFullRoom: beforeFullRoom || beforeRoom || '',
                        toFullRoom: res.fullRoom || room,
                        beforeAmount,
                        afterAmount: totalAmount,
                        beforePrepaid,
                        afterPrepaid: prepaidAmount,
                        beforeDeposit,
                        afterDeposit: beforeDeposit,
                        balanceDue,
                        currency
                    });
                    res.roomChangeHistory = [...(Array.isArray(res.roomChangeHistory) ? res.roomChangeHistory : []), move];
                    res.roomMoveHistory = [...(Array.isArray(res.roomMoveHistory) ? res.roomMoveHistory : []), move];
                    res.settlementAdjustments = [...(Array.isArray(res.settlementAdjustments) ? res.settlementAdjustments : []), {
                        type: 'room-move',
                        id: move.id,
                        createdAt: move.changedAt,
                        description: `${move.fromRoom} -> ${move.toRoom} 객실 이동`,
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
                res.updatedAt = window.PmsDate?.nowIso ? window.PmsDate.nowIso() : new Date().toISOString();
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
        if (savedRes?.groupId) await syncUnifiedGroupReservation(savedRes, groupSyncMeta || {});
        if (typeof window.syncGroupData === 'function') window.syncGroupData();
        
        closeUnifiedResModal();
        
        refreshUnifiedReservationViews({ action: id ? 'reservation.update' : 'reservation.create', reservation: savedRes });
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
            showReservationAlert(message, 'error');
            return;
        }
        
        const cancelMessage = actionText('cancel.confirm', { name: res.guest || guestNameForReservation(res) });
        const confirmed = await confirmReservationDialog(cancelMessage);
        if (confirmed) {
            const cancelReason = await promptReservationDialog(actionText('cancel.reasonPrompt'), {
                title: actionText('cancel.reasonTitle'),
                placeholder: actionText('cancel.reasonPlaceholder'),
                inputLabel: actionText('cancel.reasonTitle'),
                okText: actionText('cancel.reasonOk'),
                required: true
            });
            if (cancelReason === null) return;
            res.status = 'cancelled';
            res.cancellationReason = cancelReason;
            res.cancelReason = cancelReason;
            logReservationAudit('reservation.cancel', {
                reservationId: res.id,
                guestName: guestNameForReservation(res),
                room: res.room,
                beforeStatus: currentStatus,
                afterStatus: 'cancelled',
                cancelReason,
                fields: ['reservationId', 'guestName', 'room', 'status', 'cancelReason']
            });
            localStorage.setItem('pms_reservations', JSON.stringify(allRes));
            try {
                if (window.PmsMockApi) await window.PmsMockApi.request('PATCH', `/reservations/${encodeURIComponent(resId)}`, { body: { status: 'cancelled', cancellationReason: cancelReason, cancelReason } });
            } catch(e) {
                console.warn('Mock reservation cancel failed', e);
            }
            if (typeof window.syncGroupData === 'function') window.syncGroupData();
            
            if (window.showToast) window.showToast(actionText('cancel.done'), 'success');
            
            closeUnifiedResModal();

            refreshUnifiedReservationViews({ action: 'reservation.cancel', reservation: res });
        }
    };
})();
