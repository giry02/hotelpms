/**
 * topbar.js — 공통 Topbar 우측 영역(알림, 언어 설정, 호텔 선택) 관리
 */
document.head.insertAdjacentHTML('beforeend', '<style>.topbar h1 { font-size: 1.15rem !important; font-weight: 700 !important; margin: 0 !important; line-height: 1.2 !important; display: block !important; }</style>');
(function() {
    // 상대 경로 계산
    const _pathParts = window.location.pathname.split('/').filter(Boolean);
    const _parentDir = _pathParts[_pathParts.length - 2] || '';
    const _subDirs = ['frontdesk', 'operations', 'crm', 'settings'];
    const BASE = _subDirs.includes(_parentDir) ? '../' : '';

    // 공통 알림 데이터 정의
    window.PMS_Notifications = [
        { type: 'frontdesk', time: { ko: '방금 전', en: 'Just now' }, title: { ko: '체크인 완료', en: 'Check-in Completed' }, desc: { ko: '<span class="timeline-room" style="display:inline-block;background:var(--primary-lt);color:var(--primary-dk);font-weight:700;font-size:0.7rem;padding:2px 6px;border-radius:4px;margin-right:6px">[FT] 1205</span> Nguyen Thi 고객님이 체크인 하셨습니다.', en: '<span class="timeline-room" style="display:inline-block;background:var(--primary-lt);color:var(--primary-dk);font-weight:700;font-size:0.7rem;padding:2px 6px;border-radius:4px;margin-right:6px">[FT] 1205</span> Nguyen Thi checked in.' }, icon: 'fa-right-to-bracket', urgent: false },
        { type: 'housekeeping', time: { ko: '8분 전', en: '8 min ago' }, title: { ko: '객실 상태 변경', en: 'Room Status Updated' }, desc: { ko: '<span class="timeline-room" style="display:inline-block;background:var(--primary-lt);color:var(--primary-dk);font-weight:700;font-size:0.7rem;padding:2px 6px;border-radius:4px;margin-right:6px">[FT] 0904</span> 청소 완료 → 에코 스킵', en: '<span class="timeline-room" style="display:inline-block;background:var(--primary-lt);color:var(--primary-dk);font-weight:700;font-size:0.7rem;padding:2px 6px;border-radius:4px;margin-right:6px">[FT] 0904</span> Cleaned → Eco skip' }, icon: 'fa-broom', urgent: false },
        { type: 'housekeeping', time: { ko: '12분 전', en: '12 min ago' }, title: { ko: '긴급 청소 요청', en: 'Urgent Cleaning Request' }, desc: { ko: '<span class="timeline-room" style="display:inline-block;background:var(--primary-lt);color:var(--primary-dk);font-weight:700;font-size:0.7rem;padding:2px 6px;border-radius:4px;margin-right:6px">[FT] 0807</span> 고객이 수건 교체 및 미니바 정리를 요청했습니다.', en: '<span class="timeline-room" style="display:inline-block;background:var(--primary-lt);color:var(--primary-dk);font-weight:700;font-size:0.7rem;padding:2px 6px;border-radius:4px;margin-right:6px">[FT] 0807</span> Guest requested towels and minibar service.' }, icon: 'fa-triangle-exclamation', urgent: true },
        { type: 'frontdesk', time: { ko: '15분 전', en: '15 min ago' }, title: { ko: '통합 정산 완료', en: 'Folio Settled' }, desc: { ko: '<span class="timeline-room" style="display:inline-block;background:var(--primary-lt);color:var(--primary-dk);font-weight:700;font-size:0.7rem;padding:2px 6px;border-radius:4px;margin-right:6px">[FT] 0612</span> Folio 정산이 완료되었습니다. ($485.00)', en: '<span class="timeline-room" style="display:inline-block;background:var(--primary-lt);color:var(--primary-dk);font-weight:700;font-size:0.7rem;padding:2px 6px;border-radius:4px;margin-right:6px">[FT] 0612</span> Folio settlement completed. ($485.00)' }, icon: 'fa-credit-card', urgent: false },
        { type: 'frontdesk', time: { ko: '22분 전', en: '22 min ago' }, title: { ko: '체크아웃', en: 'Check-out' }, desc: { ko: '<span class="timeline-room" style="display:inline-block;background:var(--primary-lt);color:var(--primary-dk);font-weight:700;font-size:0.7rem;padding:2px 6px;border-radius:4px;margin-right:6px">[OT] 1401</span> Kim Jun 고객님이 체크아웃 하셨습니다.', en: '<span class="timeline-room" style="display:inline-block;background:var(--primary-lt);color:var(--primary-dk);font-weight:700;font-size:0.7rem;padding:2px 6px;border-radius:4px;margin-right:6px">[OT] 1401</span> Kim Jun checked out.' }, icon: 'fa-right-from-bracket', urgent: false },
        { type: 'system', time: { ko: '30분 전', en: '30 min ago' }, title: { ko: 'VIP 승급', en: 'VIP Upgrade' }, desc: { ko: 'Tran Linh 고객님의 등급이 Gold에서 VIP로 승급되었습니다.', en: 'Tran Linh was upgraded from Gold to VIP.' }, icon: 'fa-star', urgent: true },
        { type: 'system', time: { ko: '2시간 전', en: '2 hours ago' }, title: { ko: '신규 예약 접수', en: 'New Reservation Received' }, desc: { ko: 'Agoda를 통해 5/12 ~ 5/14 (2박) 스위트룸 예약이 접수되었습니다.', en: 'A suite reservation for 5/12 ~ 5/14 (2 nights) was received via Agoda.' }, icon: 'fa-book-bookmark', urgent: false }
    ];

    function currentLang() {
        return localStorage.getItem('pms_lang') || window.currentLang || 'ko';
    }

    function localized(value) {
        if (value && typeof value === 'object') return value[currentLang()] || value.en || value.ko || '';
        return value || '';
    }

    function buildTopbarRight() {
        return window.PMS_Notifications.slice(0, 3).map(n => {
            const cssClass = n.urgent ? 'urgent' : (n.type === 'housekeeping' ? 'warning' : '');
            return `
                <div class="notif-item ${cssClass}">
                    <div class="notif-icon"><i class="fa-solid ${n.icon}"></i></div>
                    <div class="notif-content">
                        <div class="n-title">${localized(n.title)}</div>
                        <div class="n-desc" style="font-size:0.8rem;color:var(--txt2);margin-bottom:4px">${localized(n.desc)}</div>
                        <span class="n-time" style="font-size:0.7rem;color:var(--txt3)">${localized(n.time)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function injectTopbar() {
        const topbar = document.querySelector('.topbar');
        if (topbar) {
            const existingH1 = topbar.querySelector('h1');
            const pageTitleKey = existingH1 ? (existingH1.getAttribute('data-i18n-key') || existingH1.textContent) : 'Dashboard';
            const pageTitleText = existingH1 ? existingH1.textContent : '대시보드';

            topbar.innerHTML = `
                <div class="topbar-left">
                    <button class="mobile-menu-btn" onclick="toggleMenu()"><i class="fa-solid fa-bars"></i></button>
                    <h1 data-i18n-key="${pageTitleKey}">${pageTitleText}</h1>
                    <span class="date-badge"><i class="fa-regular fa-calendar"></i> <span class="live-clock"></span></span>
                </div>
                <div class="topbar-right">
                    <div style="font-size:0.85rem;font-weight:700;color:var(--txt);margin-right:8px;display:flex;align-items:center;gap:4px">
                        <i class="fa-solid fa-hotel" style="color:var(--primary)"></i> The Grand Saigon
                    </div>
                    <select class="hotel-select" id="langSelect" onchange="changeLang(this.value)" style="margin-left:8px; width:110px">
                        <option value="ko">🇰🇷 한국어</option>
                        <option value="en">🇺🇸 English</option>
                    </select>
                    <div class="notif-wrap" style="margin-left:8px">
                        <button class="topbar-btn" onclick="toggleNotifications(event)">
                            <i class="fa-regular fa-bell"></i><span class="notif-dot"></span>
                        </button>
                        <div class="notif-dropdown" id="notifDropdown">
                            <div class="notif-header">
                                <h3 data-i18n-key="호텔 알림">호텔 알림</h3>
                                <span data-i18n-key="모두 읽음 처리">모두 읽음 처리</span>
                            </div>
                            <div class="notif-list">
                                ${buildTopbarRight()}
                            </div>
                            <div class="notif-footer" style="text-align:center;padding:12px;border-top:1px solid var(--border2)">
                                <a href="${BASE}notifications.html" style="font-size:0.8rem;font-weight:600;color:var(--primary);text-decoration:none" data-i18n-key="모든 알림 보기 →">모든 알림 보기 →</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // 언어 설정 복원 + 재번역 (inject 후 DOM이 새로 생성되므로 다시 적용)
            const langSelect = document.getElementById('langSelect');
            const lang = currentLang();
            if (langSelect) langSelect.value = lang;
            if (typeof window.changeLang === 'function') window.changeLang(lang);
            window.updateClock();
        }
    }

    window.updateClock = function() {
        const clockEl = document.querySelector('.date-badge .live-clock');
        if(clockEl) {
            const now = new Date();
            const locale = currentLang() === 'en' ? 'en-US' : 'ko-KR';
            const dateStr = now.toLocaleDateString(locale, {year:'numeric',month:'long',day:'numeric',weekday:'short'});
            const timeStr = now.toLocaleTimeString(locale, {hour:'2-digit',minute:'2-digit'});
            clockEl.textContent = `${dateStr} ${timeStr}`;
        }
    }
    setInterval(window.updateClock, 60000);

    window.addEventListener('languagechange', function() {
        window.updateClock();
        const list = document.querySelector('.notif-list');
        if (list) list.innerHTML = buildTopbarRight();
    });

    // 알림창 토글 이벤트
    window.toggleNotifications = function(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('notifDropdown');
        if (dropdown) dropdown.classList.toggle('active');
    };

    // 알림창 외부 클릭 시 닫기
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('notifDropdown');
        const wrap = document.querySelector('.notif-wrap');
        if (dropdown && dropdown.classList.contains('active') && wrap && !wrap.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectTopbar);
    } else {
        injectTopbar();
    }
})();
