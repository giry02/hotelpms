(function () {
    const data = window.MANUAL_DATA;
    let lang = localStorage.getItem('hotelManualLang') || 'ko';
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    function t(value) {
        if (value == null) return '';
        if (typeof value === 'string') return value;
        return value[lang] || value.ko || value.en || '';
    }

    function list(items) {
        return (items || []).map((item, index) => `<li data-no="${index + 1}">${t(item)}</li>`).join('');
    }

    function chips(items) {
        return (items || []).map(item => `<span class="chip"><i class="fa-solid fa-check"></i>${t(item)}</span>`).join('');
    }

    function iconFor(type) {
        return {
            common: 'fa-layer-group',
            frontdesk: 'fa-calendar-check',
            crm: 'fa-address-book',
            operations: 'fa-bed',
            billing: 'fa-file-invoice-dollar',
            ancillary: 'fa-concierge-bell',
            settings: 'fa-gear',
            admin: 'fa-shield-halved',
            ads: 'fa-rectangle-ad'
        }[type] || 'fa-circle-dot';
    }

    function allScreens() {
        return data.groups.flatMap(group => group.screens.map(screen => ({ ...screen, group })));
    }

    function allPopups() {
        return allScreens().flatMap(screen =>
            (screen.popups || []).map(popup => ({ ...popup, screen }))
        );
    }

    function setUiTexts() {
        const ui = data.ui[lang];
        document.documentElement.lang = lang;
        $$('[data-ui]').forEach(el => {
            const key = el.dataset.ui;
            if (ui[key]) el.textContent = ui[key];
        });
        $$('[data-ui-placeholder]').forEach(el => {
            const key = el.dataset.uiPlaceholder;
            if (ui[key]) el.setAttribute('placeholder', ui[key]);
        });
        $('#languageName').textContent = ui.languageName;
    }

    function renderQuickGuide() {
        $('#quickGuide').innerHTML = data.quickGuide.map(item => `
            <article class="guide-item">
                <i class="fa-solid ${item.icon}"></i>
                <div>
                    <strong>${t(item.title)}</strong>
                    <p>${t(item.body)}</p>
                </div>
            </article>
        `).join('');
    }

    function renderTree() {
        $('#manualTree').innerHTML = data.groups.map(group => `
            <section class="tree-group">
                <h2 class="tree-group-title">${t(group.title)}</h2>
                <div class="tree-group-list">
                    ${group.screens.map(screen => `
                        <a class="tree-link" href="#${screen.id}">
                            <i class="fa-solid ${iconFor(group.type)}"></i>
                            <span>${t(screen.title)}</span>
                        </a>
                    `).join('')}
                </div>
            </section>
        `).join('');
    }

    function renderScreen(screen, group) {
        const popups = screen.popups || [];
        return `
            <article class="screen-card" id="${screen.id}" data-search="${[
                t(screen.title), t(screen.summary), t(group.title), screen.path,
                ...(screen.steps || []).map(t),
                ...popups.map(p => `${t(p.name)} ${t(p.purpose)}`)
            ].join(' ').toLowerCase()}">
                <header class="screen-header">
                    <div class="screen-title-wrap">
                        <span class="screen-icon"><i class="fa-solid ${iconFor(group.type)}"></i></span>
                        <div>
                            <h3>${t(screen.title)}</h3>
                            <p class="screen-summary">${t(screen.summary)}</p>
                        </div>
                    </div>
                    <a class="screen-link" href="../${screen.path}" target="_blank" rel="noreferrer">
                        <i class="fa-solid fa-up-right-from-square"></i>
                        <span>${data.ui[lang].openScreen}</span>
                    </a>
                </header>
                <div class="screen-body">
                    <div class="screen-map" aria-hidden="true">
                        <span class="pin p1">1</span>
                        <span class="pin p2">2</span>
                        <span class="pin p3">3</span>
                        <span class="pin p4">4</span>
                        <div class="map-caption">${data.ui[lang].numberGuide}</div>
                    </div>
                    <div class="manual-columns">
                        <section class="manual-block">
                            <h4><i class="fa-solid fa-user-check"></i>${data.ui[lang].audience}</h4>
                            <div class="chip-row">${chips(screen.audience)}</div>
                        </section>
                        <section class="manual-block">
                            <h4><i class="fa-solid fa-list-check"></i>${data.ui[lang].checkpoints}</h4>
                            <ul class="manual-list">${list(screen.checkpoints)}</ul>
                        </section>
                        <section class="manual-block wide">
                            <h4><i class="fa-solid fa-route"></i>${data.ui[lang].workflow}</h4>
                            <ul class="manual-list">${list(screen.steps)}</ul>
                        </section>
                        <section class="manual-block wide">
                            <h4><i class="fa-solid fa-window-restore"></i>${data.ui[lang].popupSection}</h4>
                            ${popups.length ? `
                                <div class="popup-grid">
                                    ${popups.map(popup => `
                                        <div class="popup-card">
                                            <strong>${t(popup.name)}</strong>
                                            <p>${t(popup.purpose)}</p>
                                            <p><b>${data.ui[lang].trigger}</b> ${t(popup.trigger)}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `<div class="chip">${data.ui[lang].noPopup}</div>`}
                        </section>
                        <section class="manual-block wide">
                            <h4><i class="fa-solid fa-shield-halved"></i>${data.ui[lang].notes}</h4>
                            <ul class="manual-list">${list(screen.notes)}</ul>
                        </section>
                    </div>
                </div>
            </article>
        `;
    }

    function renderContent() {
        $('#manualContent').innerHTML = data.groups.map(group => `
            <section class="group-section" id="group-${group.id}">
                <div class="group-head">
                    <div>
                        <h2>${t(group.title)}</h2>
                        <p>${t(group.desc)}</p>
                    </div>
                    <span class="screen-count-pill">${group.screens.length} ${data.ui[lang].screensUnit}</span>
                </div>
                <div class="screen-list">
                    ${group.screens.map(screen => renderScreen(screen, group)).join('')}
                </div>
            </section>
        `).join('');
    }

    function renderPopupIndex() {
        const popups = allPopups();
        $('#popupIndex').innerHTML = `
            <section class="popup-section" id="popup-all">
                <h2>${data.ui[lang].popupIndexTitle}</h2>
                <p>${data.ui[lang].popupIndexIntro}</p>
                <div class="popup-index-grid">
                    ${popups.map(popup => `
                        <article class="popup-index-card">
                            <a href="#${popup.screen.id}">${t(popup.screen.title)}</a>
                            <strong>${t(popup.name)}</strong>
                            <p>${t(popup.purpose)}</p>
                        </article>
                    `).join('')}
                </div>
            </section>
        `;
    }

    function render() {
        setUiTexts();
        renderQuickGuide();
        renderTree();
        renderContent();
        renderPopupIndex();
        $('#screenCount').textContent = allScreens().length;
        $('#popupCount').textContent = allPopups().length;
        $$('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
        applySearch();
    }

    function applySearch() {
        const q = ($('#manualSearch')?.value || '').trim().toLowerCase();
        let visible = 0;
        $$('.screen-card').forEach(card => {
            const show = !q || card.dataset.search.includes(q);
            card.classList.toggle('hidden-by-search', !show);
            if (show) visible += 1;
        });
        $$('.group-section').forEach(group => {
            const hasVisible = !!$('.screen-card:not(.hidden-by-search)', group);
            group.classList.toggle('hidden-by-search', !hasVisible);
        });
        let empty = $('#emptySearch');
        if (!visible && q) {
            if (!empty) {
                empty = document.createElement('div');
                empty.id = 'emptySearch';
                empty.className = 'empty-search';
                $('#manualContent').after(empty);
            }
            empty.textContent = data.ui[lang].emptySearch;
        } else if (empty) {
            empty.remove();
        }
    }

    function bindEvents() {
        $$('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                lang = btn.dataset.lang;
                localStorage.setItem('hotelManualLang', lang);
                render();
            });
        });
        $('#manualSearch').addEventListener('input', applySearch);
        $('#printManual').addEventListener('click', () => window.print());
        $('#toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        document.addEventListener('scroll', () => {
            const cards = $$('.screen-card:not(.hidden-by-search)');
            let activeId = '';
            cards.forEach(card => {
                if (card.getBoundingClientRect().top < 180) activeId = card.id;
            });
            $$('.tree-link').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`));
        }, { passive: true });
    }

    bindEvents();
    render();
})();
