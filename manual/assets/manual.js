(function () {
    const data = window.MANUAL_DATA;
    const currentScope = window.MANUAL_SCOPE || 'all';
    let currentLang = localStorage.getItem('hotelManualLang') || 'ko';
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const pinPatterns = [
        { side: 'left', style: '--y: 18%;', color: '' },
        { side: 'top', style: '--x: 82%;', color: 'purple' },
        { side: 'top', style: '--x: 36%;', color: '' },
        { side: 'right', style: '--y: 38%;', color: 'green' },
        { side: 'left', style: '--y: 58%;', color: 'orange' },
        { side: 'bottom', style: '--x: 72%;', color: 'purple' }
    ];

    const ui = {
        ko: {
            subtitle: '전체 화면 사용 매뉴얼',
            title: 'Hotel PMS 전체 화면 매뉴얼',
            intro: '실제 화면 스크린샷에 번호를 표시하고, 각 번호별 기능 설명과 관련 팝업을 함께 정리했습니다.',
            lead: '좌측 목차에서 화면을 선택하거나 검색어로 화면/팝업을 찾을 수 있습니다. 각 화면은 실제 스크린샷, 번호별 사용 설명, 관련 팝업 설명 순서로 구성됩니다.',
            docType: 'SCREEN MANUAL',
            screenUnit: '화면',
            popupUnit: '팝업',
            openScreen: '화면 열기',
            screenshotTitle: '화면 번호 보기',
            numberedItems: '화면 번호별 설명',
            popupTitle: '관련 팝업/모달',
            popupIndex: '팝업/모달 전체 색인',
            trigger: '진입',
            noPopup: '별도 팝업 없음',
            missingShot: '스크린샷 준비 중',
            empty: '검색 결과가 없습니다. 다른 키워드로 다시 검색해 주세요.',
            search: '화면, 기능, 팝업 검색',
            summary: [
                ['fa-camera-retro', '실제 스크린샷', '각 화면을 브라우저에서 캡처해 매뉴얼에 배치했습니다.'],
                ['fa-location-dot', '번호 콜아웃', '화면 가장자리 번호와 아래 설명 번호가 연결됩니다.'],
                ['fa-window-restore', '팝업 포함', '주요 모달, 팝업, 바텀시트의 목적과 진입 위치를 함께 정리했습니다.'],
                ['fa-language', '한/영 전환', 'KR/EN 버튼으로 동일 매뉴얼을 한국어와 영어로 볼 수 있습니다.']
            ]
        },
        en: {
            subtitle: 'Full Screen User Manual',
            title: 'Hotel PMS Full Screen Manual',
            intro: 'Each manual section uses a real screenshot with numbered callouts, feature descriptions, and related popup explanations.',
            lead: 'Use the left table of contents or search to find screens and popups. Each section contains a live screenshot, numbered guidance, and related popup notes.',
            docType: 'SCREEN MANUAL',
            screenUnit: 'screens',
            popupUnit: 'popups',
            openScreen: 'Open Screen',
            screenshotTitle: 'Numbered Screenshot',
            numberedItems: 'Numbered Feature Guide',
            popupTitle: 'Related Popups / Modals',
            popupIndex: 'Popup / Modal Index',
            trigger: 'Entry',
            noPopup: 'No separate popup',
            missingShot: 'Screenshot pending',
            empty: 'No result found. Try another keyword.',
            search: 'Search screen, feature, or popup',
            summary: [
                ['fa-camera-retro', 'Real Screenshots', 'Each screen is captured from the browser and placed in the manual.'],
                ['fa-location-dot', 'Numbered Callouts', 'Numbers around the screenshot match the guide below.'],
                ['fa-window-restore', 'Popup Coverage', 'Major modals, popups, and bottom sheets include purpose and entry point.'],
                ['fa-language', 'Language Toggle', 'Use KR/EN to view the same manual in Korean or English.']
            ]
        }
    };

    const scopeUi = {
        hotel: {
            ko: {
                subtitle: '호텔관리 사용 매뉴얼',
                title: 'Hotel PMS 호텔관리 매뉴얼',
                intro: '호텔 운영자가 사용하는 대시보드, 예약, 객실, 정산, CRM, 설정 화면과 주요 팝업을 업무 흐름별로 정리했습니다.',
                lead: '좌측 목차에서 호텔 운영 화면을 선택하거나 검색어로 화면/팝업을 찾을 수 있습니다. 어드민 화면은 별도 매뉴얼에서 확인합니다.',
                docType: 'HOTEL MANUAL',
                popupIndex: '호텔관리 팝업/모달 색인',
                documentTitle: 'Hotel PMS Hotel Operation Manual'
            },
            en: {
                subtitle: 'Hotel Operation Manual',
                title: 'Hotel PMS Hotel Operation Manual',
                intro: 'Screens and major popups used by hotel operators are organized by operational workflow.',
                lead: 'Use the left table of contents or search to find hotel operation screens and popups. Admin screens are documented in a separate manual.',
                docType: 'HOTEL MANUAL',
                popupIndex: 'Hotel Popup / Modal Index',
                documentTitle: 'Hotel PMS Hotel Operation Manual'
            }
        },
        admin: {
            ko: {
                subtitle: '어드민 사용 매뉴얼',
                title: 'Hotel PMS 어드민 매뉴얼',
                intro: '플랫폼 운영자가 사용하는 입점 호텔, 광고, 결제, 연동, 고객지원, 공지, 관리자 감사 로그 화면을 별도로 정리했습니다.',
                lead: '좌측 목차에서 어드민 화면을 선택하거나 검색어로 화면/팝업을 찾을 수 있습니다. 호텔 운영 화면과 분리해 플랫폼 관리 기준으로 확인합니다.',
                docType: 'ADMIN MANUAL',
                popupIndex: '어드민 팝업/모달 색인',
                documentTitle: 'Hotel PMS Admin Manual'
            },
            en: {
                subtitle: 'Admin Manual',
                title: 'Hotel PMS Admin Manual',
                intro: 'Platform administration screens for tenants, ads, billing, integrations, support, notices, and audit logs are documented separately.',
                lead: 'Use the left table of contents or search to find admin screens and popups. Hotel operation screens are separated into the hotel manual.',
                docType: 'ADMIN MANUAL',
                popupIndex: 'Admin Popup / Modal Index',
                documentTitle: 'Hotel PMS Admin Manual'
            }
        }
    };

    function txt(value) {
        if (value == null) return '';
        if (typeof value === 'string') return value;
        return value[currentLang] || value.ko || value.en || '';
    }

    function activeUi() {
        return { ...ui[currentLang], ...(scopeUi[currentScope]?.[currentLang] || {}) };
    }

    function scopedGroups() {
        if (currentScope === 'admin') return data.groups.filter(group => group.type === 'admin');
        if (currentScope === 'hotel') return data.groups.filter(group => group.type !== 'admin');
        return data.groups;
    }

    function screens() {
        return scopedGroups().flatMap(group => group.screens.map(screen => ({ ...screen, group })));
    }

    function popups() {
        return screens().flatMap(screen => (screen.popups || []).map(popup => ({ ...popup, screen })));
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    function setStaticText() {
        const langUi = activeUi();
        document.documentElement.lang = currentLang;
        document.body.dataset.manualScope = currentScope;
        if (langUi.documentTitle) document.title = langUi.documentTitle;
        $$('[data-i18n-ui]').forEach(el => {
            const key = el.getAttribute('data-i18n-ui');
            if (langUi[key]) el.textContent = langUi[key];
        });
        $('[data-manual-search]').placeholder = langUi.search;
        $('[data-empty-search]').textContent = langUi.empty;
        $('[data-screen-count]').textContent = screens().length;
        $('[data-popup-count]').textContent = popups().length;
        $$('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === currentLang));
    }

    function renderSummary() {
        $('[data-summary-grid]').innerHTML = ui[currentLang].summary.map(([icon, title, body]) => `
            <div class="summary-card">
                <div class="summary-icon"><i class="fa-solid ${icon}"></i></div>
                <strong>${escapeHtml(title)}</strong>
                <p>${escapeHtml(body)}</p>
            </div>
        `).join('');
    }

    function renderNav() {
        const langUi = activeUi();
        $('[data-manual-nav]').innerHTML = scopedGroups().map(group => `
            <div class="nav-group">
                <p class="nav-group-title">${escapeHtml(txt(group.title))}</p>
                ${group.screens.map(screen => `
                    <a class="nav-link" href="#${escapeHtml(screen.id)}">
                        <i class="fa-solid fa-layer-group"></i>
                        <span>${escapeHtml(txt(screen.title))}</span>
                    </a>
                `).join('')}
            </div>
        `).join('') + `
            <div class="nav-group">
                <p class="nav-group-title">Popup</p>
                <a class="nav-link" href="#popup-index"><i class="fa-solid fa-window-restore"></i><span>${escapeHtml(langUi.popupIndex)}</span></a>
            </div>
        `;
    }

    function calloutItems(screen) {
        const steps = (screen.steps || []).slice(0, 6);
        const checkpoints = screen.checkpoints || [];
        return steps.map((step, index) => ({
            title: step,
            details: [
                checkpoints[index % Math.max(checkpoints.length, 1)],
                (screen.notes || [])[index % Math.max((screen.notes || []).length, 1)]
            ].filter(Boolean)
        }));
    }

    function renderPins(count) {
        return pinPatterns.slice(0, Math.max(1, Math.min(count, pinPatterns.length))).map((pin, index) => `
            <span class="pin ${pin.side} ${pin.color}" style="${pin.style}">${index + 1}</span>
        `).join('');
    }

    function renderPopupCards(screen) {
        if (!screen.popups || !screen.popups.length) {
            return `<div class="popup-card"><strong>${escapeHtml(ui[currentLang].noPopup)}</strong><p>${escapeHtml(txt(screen.summary))}</p></div>`;
        }
        return screen.popups.map((popup, index) => `
            <div class="popup-card" data-search-target data-keywords="${escapeHtml(`${txt(screen.title)} ${txt(popup.name)} ${txt(popup.purpose)} ${txt(popup.trigger)}`)}">
                <div class="item-head">
                    <span class="num popup-num">P${index + 1}</span>
                    <strong>${escapeHtml(txt(popup.name))}</strong>
                </div>
                <p>${escapeHtml(txt(popup.purpose))}</p>
                <div class="popup-trigger"><b>${escapeHtml(ui[currentLang].trigger)}:</b> ${escapeHtml(txt(popup.trigger))}</div>
            </div>
        `).join('');
    }

    function renderScreen(screen) {
        const items = calloutItems(screen);
        const screenshot = `screenshots/${screen.id}.jpg`;
        const keywordText = [
            txt(screen.group.title),
            txt(screen.title),
            txt(screen.summary),
            screen.path,
            ...items.flatMap(item => [txt(item.title), ...item.details.map(txt)]),
            ...(screen.popups || []).flatMap(popup => [txt(popup.name), txt(popup.purpose), txt(popup.trigger)])
        ].join(' ');
        return `
            <section class="section screen-manual" id="${escapeHtml(screen.id)}" data-search-target data-keywords="${escapeHtml(keywordText)}">
                <p class="screen-kicker">${escapeHtml(txt(screen.group.title))}</p>
                <div class="screen-title-row">
                    <div>
                        <h2>${escapeHtml(txt(screen.title))}</h2>
                        <p class="screen-desc">${escapeHtml(txt(screen.summary))}</p>
                    </div>
                    <a class="screen-open" href="../${escapeHtml(screen.path)}" target="_blank" rel="noreferrer">
                        <i class="fa-solid fa-up-right-from-square"></i>${escapeHtml(ui[currentLang].openScreen)}
                    </a>
                </div>
                <div class="screenshot-wrap">
                    <div class="annotated-shot">
                        <div class="image-frame">
                            <img src="${escapeHtml(screenshot)}" alt="${escapeHtml(txt(screen.title))}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'shot-missing',textContent:'${escapeHtml(ui[currentLang].missingShot)}'}))">
                        </div>
                        ${renderPins(items.length)}
                    </div>
                </div>
                <h3 class="popup-section-title"><i class="fa-solid fa-list-ol"></i>${escapeHtml(ui[currentLang].numberedItems)}</h3>
                <div class="grid">
                    ${items.map((item, index) => `
                        <div class="item" data-search-target data-keywords="${escapeHtml(`${txt(screen.title)} ${txt(item.title)} ${item.details.map(txt).join(' ')}`)}">
                            <div class="item-head"><span class="num">${index + 1}</span><h3>${escapeHtml(txt(item.title))}</h3></div>
                            <p>${escapeHtml(txt(item.details[0] || screen.summary))}</p>
                            <ul>${item.details.slice(1).map(detail => `<li>${escapeHtml(txt(detail))}</li>`).join('')}</ul>
                        </div>
                    `).join('')}
                </div>
                <h3 class="popup-section-title"><i class="fa-solid fa-window-restore"></i>${escapeHtml(ui[currentLang].popupTitle)}</h3>
                <div class="popup-grid">
                    ${renderPopupCards(screen)}
                </div>
            </section>
        `;
    }

    function renderContent() {
        $('[data-manual-content]').innerHTML = screens().map(renderScreen).join('');
    }

    function renderPopupIndex() {
        $('[data-popup-index]').innerHTML = popups().map(popup => `
            <div class="popup-index-card" data-search-target data-keywords="${escapeHtml(`${txt(popup.screen.title)} ${txt(popup.name)} ${txt(popup.purpose)} ${txt(popup.trigger)}`)}">
                <a href="#${escapeHtml(popup.screen.id)}">${escapeHtml(txt(popup.screen.title))}</a>
                <strong>${escapeHtml(txt(popup.name))}</strong>
                <p>${escapeHtml(txt(popup.purpose))}</p>
            </div>
        `).join('');
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function applySearch() {
        const keyword = normalize($('[data-manual-search]')?.value || '');
        const targets = $$('[data-search-target]');
        let visibleCount = 0;
        targets.forEach(target => {
            const text = normalize(`${target.textContent || ''} ${target.dataset.keywords || ''}`);
            const matched = !keyword || text.includes(keyword);
            target.classList.toggle('is-hidden', !matched);
            if (matched) visibleCount += 1;
        });
        $('[data-empty-search]').style.display = visibleCount ? 'none' : 'block';
    }

    function render() {
        setStaticText();
        renderSummary();
        renderNav();
        renderContent();
        renderPopupIndex();
        applySearch();
    }

    $('[data-manual-search]').addEventListener('input', applySearch);
    $('[data-print]').addEventListener('click', () => window.print());
    $$('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.dataset.lang;
            localStorage.setItem('hotelManualLang', currentLang);
            render();
        });
    });
    document.addEventListener('scroll', () => {
        let active = '';
        $$('.screen-manual:not(.is-hidden)').forEach(section => {
            if (section.getBoundingClientRect().top < 180) active = section.id;
        });
        $$('.nav-link').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${active}`));
    }, { passive: true });

    render();
})();
