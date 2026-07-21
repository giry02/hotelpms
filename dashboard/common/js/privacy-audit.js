(function () {
    const STORAGE_KEY = 'pms_privacy_audit_logs';
    const ROLE_PROFILES = {
        sys_admin: { id: 's1', name: 'Nguyen Kim', roleLabel: { ko: '관리자', en: 'Admin' } },
        sys_gm: { id: 's2', name: 'Robert Ford', roleLabel: { ko: '총괄 매니저', en: 'General Manager' } },
        sys_desk: { id: 's3', name: 'Sarah Connor', roleLabel: { ko: '프론트 데스크', en: 'Front Desk' } },
        sys_housekeeping: { id: 's5', name: 'Maria Garcia', roleLabel: { ko: '하우스키핑', en: 'Housekeeping' } },
        sys_maintenance: { id: 's6', name: 'James Bond', roleLabel: { ko: '시설 보수', en: 'Maintenance' } }
    };
    const SENSITIVE_KEY_PATTERN = /(phone|mobile|email|passport|identity|idNumber|contact|address|birth|dob)/i;
    const OPERATIONAL_ID_KEY_PATTERN = /^(reservationId|folioId|orderId|roomId|tenantId|groupId|eventId|ticketId|auditId|staffId|guestId|reservationNumber|folioNumber|orderNumber)$/i;

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

    function redactString(value) {
        return String(value)
            .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
            .replace(/(\+?\d[\d\s().-]{7,}\d)/g, '[redacted-phone]');
    }

    function sanitizeDetails(value, key = '') {
        if (value === null || value === undefined) return value;
        if (SENSITIVE_KEY_PATTERN.test(key)) return '[redacted]';
        if (typeof value === 'string') {
            // Operational identifiers must remain searchable in the audit log.
            if (OPERATIONAL_ID_KEY_PATTERN.test(key)) return value;
            return redactString(value);
        }
        if (Array.isArray(value)) return value.map(item => sanitizeDetails(item, key));
        if (typeof value === 'object') {
            return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [
                childKey,
                sanitizeDetails(childValue, childKey)
            ]));
        }
        return value;
    }

    function actor() {
        const role = localStorage.getItem('currentUserRole') || window.currentUserRole || 'sys_admin';
        const profile = ROLE_PROFILES[role] || ROLE_PROFILES.sys_admin;
        const lang = localStorage.getItem('pms_lang') || window.currentLang || 'ko';
        return {
            id: localStorage.getItem('mock_user_id') || profile.id || role,
            name: profile.name,
            role,
            roleLabel: profile.roleLabel?.[lang] || profile.roleLabel?.ko || role
        };
    }

    function log(action, details) {
        const entry = {
            id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            action,
            createdAt: nowIso(),
            actor: actor(),
            page: window.location.pathname,
            details: sanitizeDetails(details || {})
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
