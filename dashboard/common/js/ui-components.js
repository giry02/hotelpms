// ui-components.js
// Provides global showToast and showConfirm for replacing native alert() and confirm()

(function() {
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
                <button class="btn-outline" id="pms-confirm-cancel" style="padding:8px 16px;background:#fff;border:1px solid var(--border);color:var(--txt);border-radius:6px;font-weight:600;cursor:pointer;">취소 (Cancel)</button>
                <button class="btn-primary" id="pms-confirm-ok" style="padding:8px 16px;background:var(--primary);border:none;color:#fff;border-radius:6px;font-weight:600;cursor:pointer;">확인 (OK)</button>
            </div>
        </div>
    </div>
    `;

    document.addEventListener('DOMContentLoaded', () => {
        document.body.insertAdjacentHTML('beforeend', uiHtml);
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

    window.showConfirm = function(msg) {
        return new Promise((resolve) => {
            const modal = document.getElementById('pms-confirm-modal');
            if (!modal) return resolve(confirm(msg)); // fallback
            
            document.getElementById('pms-confirm-message').innerHTML = msg.replace(/\n/g, '<br>');
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

    function currentLang() {
        return document.getElementById('langSelect')?.value || window.currentLang || localStorage.getItem('pms_lang') || 'ko';
    }

    window.renderEmptyState = function(options = {}) {
        const isEn = currentLang() === 'en';
        const icon = options.icon || 'fa-inbox';
        const title = options.title || (isEn ? 'No items to display.' : '표시할 항목이 없습니다.');
        const desc = options.desc || (isEn
            ? 'There is no data for the current filter. Change the filter or add a new item.'
            : '현재 조건에 맞는 데이터가 없습니다. 필터를 변경하거나 새 항목을 등록해 주세요.');
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
