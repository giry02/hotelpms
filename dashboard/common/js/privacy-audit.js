(function () {
    const STORAGE_KEY = 'pms_privacy_audit_logs';
    const ROLE_PROFILES = {
        sys_admin: { id: 's1', name: 'Nguyen Kim', roleLabel: 'Admin' },
        sys_gm: { id: 's2', name: 'Robert Ford', roleLabel: 'General Manager' },
        sys_desk: { id: 's3', name: 'Sarah Connor', roleLabel: 'Front Desk' },
        sys_housekeeping: { id: 's5', name: 'Maria Garcia', roleLabel: 'Housekeeping' },
        sys_maintenance: { id: 's6', name: 'James Bond', roleLabel: 'Maintenance' }
    };

    function nowIso() {
        if (window.PmsDate && typeof window.PmsDate.nowIso === 'function') {
            return window.PmsDate.nowIso();
        }
        return new Date().toISOString();
    }

    function readLogs() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function writeLogs(logs) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-500)));
    }

    function actor() {
        const role = localStorage.getItem('currentUserRole') || window.currentUserRole || 'sys_admin';
        const profile = ROLE_PROFILES[role] || ROLE_PROFILES.sys_admin;
        return {
            id: localStorage.getItem('mock_user_id') || profile.id || role,
            name: profile.name,
            role,
            roleLabel: profile.roleLabel
        };
    }

    function log(action, details) {
        const entry = {
            id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            action,
            createdAt: nowIso(),
            actor: actor(),
            page: window.location.pathname,
            details: details || {}
        };
        const logs = readLogs();
        logs.push(entry);
        writeLogs(logs);
        window.dispatchEvent(new CustomEvent('pms:privacy-audit', { detail: entry }));
        return entry;
    }

    window.PmsPrivacyAudit = {
        storageKey: STORAGE_KEY,
        log,
        list: readLogs,
        clear: () => localStorage.removeItem(STORAGE_KEY)
    };
})();
