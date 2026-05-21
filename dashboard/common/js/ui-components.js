// ui-components.js
// Provides global showToast and showConfirm for replacing native alert() and confirm()

(function() {
    // Inject HTML for Toast and Confirm Modal
    const uiHtml = `
    <div id="pms-toast-container" style="position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;"></div>
    
    <div class="modal-overlay" id="pms-confirm-modal" style="z-index:10000;">
        <div class="modal-card" style="max-width:400px;width:95vw">
            <div class="modal-header">
                <div class="modal-title" style="display:flex;align-items:center;gap:8px">
                    <i class="fa-solid fa-circle-question" style="color:var(--primary)"></i> 
                    <span id="pms-confirm-title">Confirm</span>
                </div>
            </div>
            <div class="modal-body" style="padding:24px;font-size:0.95rem;color:var(--txt2);line-height:1.5" id="pms-confirm-message">
                Are you sure?
            </div>
            <div class="modal-footer" style="padding:16px 20px;border-top:1px solid var(--border2);display:flex;justify-content:flex-end;gap:10px;background:#f8fafc;border-radius:0 0 var(--radius-sm) var(--radius-sm)">
                <button class="btn-outline" id="pms-confirm-cancel">취소 (Cancel)</button>
                <button class="btn-primary" id="pms-confirm-ok">확인 (OK)</button>
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
        .pms-toast.error { border-left-color: var(--danger); }
        .pms-toast.success { border-left-color: var(--success); }
        .pms-toast.fade-out { animation: fadeOutRight 0.3s forwards; }
        
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
})();
