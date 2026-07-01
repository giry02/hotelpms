// ui-components.js
// Provides global showToast and showConfirm for replacing native alert() and confirm()

(function() {
    const DEFAULT_MESSAGES = {
        ko: {
            'ui.confirm.title': '확인',
            'ui.confirm.default': '계속 진행할까요?',
            'ui.confirm.cancel': '취소',
            'ui.confirm.ok': '확인',
            'ui.empty.title': '표시할 항목이 없습니다.',
            'ui.empty.desc': '새 항목을 등록해 주세요.'
        },
        en: {
            'ui.confirm.title': 'Confirm',
            'ui.confirm.default': 'Do you want to continue?',
            'ui.confirm.cancel': 'Cancel',
            'ui.confirm.ok': 'OK',
            'ui.empty.title': 'No items to display.',
            'ui.empty.desc': 'Register a new item to continue.'
        }
    };

    function currentLang() {
        return (window.currentLang || localStorage.getItem('pms_lang') || document.getElementById('langSelect')?.value || 'ko') === 'en'
            ? 'en'
            : 'ko';
    }

    function formatText(value, params) {
        let text = String(value || '');
        if (params && typeof params === 'object') {
            Object.keys(params).forEach(key => {
                text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key]);
            });
        }
        return text;
    }

    function uiText(key, params) {
        if (typeof window.t === 'function') {
            const translated = window.t(key, params);
            if (translated && translated !== key) return translated;
        }
        const lang = currentLang();
        const value = DEFAULT_MESSAGES[lang]?.[key] || DEFAULT_MESSAGES.en[key] || key;
        return formatText(value, params);
    }

    function escapeHtml(text) {
        return String(text || '').replace(/[&<>"']/g, ch => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch]));
    }

    const modalScrollLock = {
        locked: false,
        scrollY: 0,
        bodyStyle: {},
        htmlStyle: {}
    };

    function modalIsVisible(el) {
        if (!el || !el.classList?.contains('active')) return false;
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
    }

    function activeModalExists() {
        return Array.from(document.querySelectorAll('.modal-overlay.active')).some(modalIsVisible);
    }

    function setModalScrollLock(locked) {
        if (!document.body || !document.documentElement) return;
        if (locked && !modalScrollLock.locked) {
            modalScrollLock.locked = true;
            modalScrollLock.scrollY = window.scrollY || window.pageYOffset || 0;
            modalScrollLock.bodyStyle = {
                overflow: document.body.style.overflow,
                position: document.body.style.position,
                top: document.body.style.top,
                left: document.body.style.left,
                right: document.body.style.right,
                width: document.body.style.width,
                paddingRight: document.body.style.paddingRight
            };
            modalScrollLock.htmlStyle = {
                overflow: document.documentElement.style.overflow
            };
            const scrollbarGap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${modalScrollLock.scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
            if (scrollbarGap) document.body.style.paddingRight = `${scrollbarGap}px`;
            return;
        }
        if (!locked && modalScrollLock.locked) {
            const restoreY = modalScrollLock.scrollY || 0;
            Object.assign(document.body.style, modalScrollLock.bodyStyle);
            Object.assign(document.documentElement.style, modalScrollLock.htmlStyle);
            modalScrollLock.locked = false;
            modalScrollLock.scrollY = 0;
            window.scrollTo(0, restoreY);
        }
    }

    function syncModalScrollLock() {
        setModalScrollLock(activeModalExists());
    }

    function installModalScrollLockObserver() {
        syncModalScrollLock();
        const observer = new MutationObserver(syncModalScrollLock);
        observer.observe(document.body, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
        window.__pmsModalScrollLockObserver = observer;
        window.addEventListener('beforeunload', () => setModalScrollLock(false));
        window.PmsModalScrollLock = { sync: syncModalScrollLock };
    }

    function installModalFunctionHooks() {
        let hookedOpen = null;
        let hookedClose = null;
        setInterval(() => {
            syncModalScrollLock();
            if (typeof window.openModal === 'function' && window.openModal !== hookedOpen && !window.openModal.__pmsScrollLockWrapped) {
                const originalOpen = window.openModal;
                const wrappedOpen = function(...args) {
                    const result = originalOpen.apply(this, args);
                    syncModalScrollLock();
                    return result;
                };
                wrappedOpen.__pmsScrollLockWrapped = true;
                wrappedOpen.__pmsOriginal = originalOpen;
                window.openModal = wrappedOpen;
                hookedOpen = wrappedOpen;
            }
            if (typeof window.closeModal === 'function' && window.closeModal !== hookedClose && !window.closeModal.__pmsScrollLockWrapped) {
                const originalClose = window.closeModal;
                const wrappedClose = function(...args) {
                    const result = originalClose.apply(this, args);
                    syncModalScrollLock();
                    return result;
                };
                wrappedClose.__pmsScrollLockWrapped = true;
                wrappedClose.__pmsOriginal = originalClose;
                window.closeModal = wrappedClose;
                hookedClose = wrappedClose;
            }
        }, 200);
    }

    // Inject HTML for Toast and Confirm Modal
    const uiHtml = `
    <div id="pms-toast-container" style="position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;"></div>
    
    <div class="modal-overlay" id="pms-confirm-modal" style="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(15,23,42,0.6);z-index:10000;align-items:center;justify-content:center;">
        <div class="modal-card" style="background:#fff;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.15);overflow:hidden;max-width:400px;width:95vw">
            <div class="modal-header" style="padding:16px 20px;border-bottom:1px solid var(--border2,#e2e8f0);display:flex;align-items:center;">
                <div class="modal-title" style="font-size:1.1rem;font-weight:700;display:flex;align-items:center;gap:8px">
                    <i class="fa-solid fa-circle-question" style="color:var(--primary)"></i> 
                    <span id="pms-confirm-title">Confirm</span>
                </div>
            </div>
            <div class="modal-body" style="padding:24px;font-size:0.95rem;color:var(--txt2);line-height:1.5" id="pms-confirm-message">
                Are you sure?
            </div>
            <div class="modal-footer" style="padding:16px 20px;border-top:1px solid var(--border2);display:flex;justify-content:flex-end;gap:10px;background:#f8fafc;border-radius:0 0 var(--radius-sm) var(--radius-sm)">
                <button class="btn-outline" id="pms-confirm-cancel" style="padding:8px 16px;background:#fff;border:1px solid var(--border);color:var(--txt);border-radius:6px;font-weight:600;cursor:pointer;">Cancel</button>
                <button class="btn-primary" id="pms-confirm-ok" style="padding:8px 16px;background:var(--primary);border:none;color:#fff;border-radius:6px;font-weight:600;cursor:pointer;">OK</button>
            </div>
        </div>
    </div>
    `;

    document.addEventListener('DOMContentLoaded', () => {
        document.body.insertAdjacentHTML('beforeend', uiHtml);
        installModalScrollLockObserver();
        installModalFunctionHooks();
    });

    // CSS for Toast
    const style = document.createElement('style');
    style.innerHTML = `
        .pms-toast {
            background: #fff;
            color: var(--txt);
            padding: 14px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            font-size: 0.9rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 12px;
            border-left: 4px solid var(--primary);
            animation: slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            pointer-events: auto;
        }
        .pms-toast.error { border-left-color: var(--danger, #ef4444); }
        .pms-toast.success { border-left-color: var(--success, #10b981); }
        .pms-toast.fade-out { animation: fadeOutRight 0.3s forwards; }
        .modal-overlay.active { display: flex !important; }
        
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);

    window.showToast = function(msg, type = 'success') {
        if (typeof window.pmsRuntimeText === 'function') msg = window.pmsRuntimeText(msg);
        const container = document.getElementById('pms-toast-container');
        if (!container) return alert(msg); // fallback
        
        const icon = type === 'error' ? '<i class="fa-solid fa-circle-exclamation" style="color:var(--danger)"></i>' : '<i class="fa-solid fa-circle-check" style="color:var(--success)"></i>';
        
        const toast = document.createElement('div');
        toast.className = `pms-toast ${type}`;
        toast.innerHTML = `${icon} <span>${msg}</span>`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    window.showConfirm = function(msg, options = {}) {
        return new Promise((resolve) => {
            const modal = document.getElementById('pms-confirm-modal');
            if (!modal) return resolve(confirm(msg)); // fallback

            document.getElementById('pms-confirm-title').textContent = options.title || uiText('ui.confirm.title');
            document.getElementById('pms-confirm-message').innerHTML = escapeHtml(msg || uiText('ui.confirm.default')).replace(/\n/g, '<br>');
            document.getElementById('pms-confirm-cancel').textContent = options.cancelText || uiText('ui.confirm.cancel');
            document.getElementById('pms-confirm-ok').textContent = options.okText || uiText('ui.confirm.ok');
            modal.classList.add('active');
            
            const btnOk = document.getElementById('pms-confirm-ok');
            const btnCancel = document.getElementById('pms-confirm-cancel');
            
            const cleanup = () => {
                btnOk.replaceWith(btnOk.cloneNode(true));
                btnCancel.replaceWith(btnCancel.cloneNode(true));
                modal.classList.remove('active');
            };
            
            btnOk.onclick = () => { cleanup(); resolve(true); };
            btnCancel.onclick = () => { cleanup(); resolve(false); };
        });
    };

    window.renderEmptyState = function(options = {}) {
        const icon = options.icon || 'fa-inbox';
        const title = options.title || uiText('ui.empty.title');
        const desc = options.desc || uiText('ui.empty.desc');
        const compact = options.compact ? ' compact' : '';
        return `
            <div class="pms-empty-state${compact}">
                <div class="pms-empty-icon"><i class="fa-solid ${icon}"></i></div>
                <div class="pms-empty-title">${title}</div>
                <div class="pms-empty-desc">${desc}</div>
            </div>`;
    };

    function tableColspan(table) {
        return Math.max(1, table?.querySelectorAll('thead th').length || 1);
    }

    function hasVisibleNativeEmptyState(tbody) {
        const scope = tbody.closest('.card, .content') || document.body;
        return Array.from(scope.querySelectorAll('#emptyState, .empty-state:not(.pms-empty-state)')).some(el => {
            const style = getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && el.textContent.trim();
        });
    }

    function fillEmptyTables() {
        document.querySelectorAll('table tbody').forEach(tbody => {
            if (tbody.closest('[aria-hidden="true"], .template')) return;
            if (hasVisibleNativeEmptyState(tbody)) return;
            const rows = Array.from(tbody.children).filter(el => el.nodeType === 1);
            const realRows = rows.filter(row => !row.hasAttribute('data-pms-empty-row'));
            if (realRows.length > 0) {
                rows.filter(row => row.hasAttribute('data-pms-empty-row')).forEach(row => row.remove());
                return;
            }
            if (rows.some(row => row.hasAttribute('data-pms-empty-row'))) return;
            const table = tbody.closest('table');
            const row = document.createElement('tr');
            row.setAttribute('data-pms-empty-row', 'true');
            row.innerHTML = `<td colspan="${tableColspan(table)}">${window.renderEmptyState({ compact: true })}</td>`;
            tbody.appendChild(row);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(fillEmptyTables, 250);
        const observer = new MutationObserver(() => {
            clearTimeout(window.__pmsEmptyStateTimer);
            window.__pmsEmptyStateTimer = setTimeout(fillEmptyTables, 80);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
