// api-crm.js
window.PmsAPI = window.PmsAPI || {};

function normalizeCrmTier(tier) {
    const value = String(tier || 'standard').toLowerCase();
    if (value.includes('diamond')) return 'diamond';
    if (value.includes('platinum')) return 'platinum';
    if (value.includes('gold') || value === 'vip') return 'gold';
    return 'standard';
}

function crmInitial(name) {
    return String(name || 'G')
        .split(/\s+/)
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function crmAmount(value) {
    if (window.PmsMockApi && window.PmsMockApi.amountValue) return window.PmsMockApi.amountValue(value);
    if (value && typeof value === 'object') return Number(value.amount || 0);
    return Number(value || 0);
}

function normalizeCrmGuest(guest, index) {
    return {
        ...guest,
        init: guest.init || crmInitial(guest.name),
        color: guest.color || ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'][index % 4],
        nation: guest.nationality || guest.nation || '',
        tier: normalizeCrmTier(guest.tier || guest.vip),
        visits: guest.visits || 1,
        last: guest.lastStayDate || guest.last || '',
        spend: crmAmount(guest.totalSpend || guest.spend),
        vip: guest.vip || guest.tier || 'standard',
        docStatus: (guest.document && guest.document.status) || guest.docStatus || 'pending',
        documentStatus: (guest.document && guest.document.status) || guest.documentStatus || 'pending',
        specialNotes: guest.specialNotes || ''
    };
}

function crmItems(env) {
    if (window.PmsMockApi && window.PmsMockApi.items) return window.PmsMockApi.items(env);
    if (Array.isArray(env?.data?.items)) return env.data.items;
    if (Array.isArray(env?.data)) return env.data;
    if (Array.isArray(env)) return env;
    return [];
}

Object.assign(window.PmsAPI, {
    getGuests: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/crm/guests');
                const guests = crmItems(env).map(normalizeCrmGuest);
                if (guests.length) return guests;
            }
        } catch(e) {
            console.warn('Mock guests fallback', e);
        }
        try {
            const res = await fetch('../data/api/v1/crm/guests.json', { cache: 'no-store' });
            if (res.ok) {
                const env = await res.json();
                return crmItems(env).map(normalizeCrmGuest);
            }
        } catch(e) {
            console.warn('Fetch failed for guests', e);
        }
        return [];
    },

    getHistory: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/crm/tier-history');
                const order = { standard: 0, gold: 1, platinum: 2, diamond: 3 };
                const localized = (value) => {
                    if (value && typeof value === 'object') {
                        const lang = localStorage.getItem('pms_lang') || window.currentLang || 'ko';
                        return value[lang] || value.ko || value.en || '';
                    }
                    return value || '';
                };
                return crmItems(env).map((item, index) => {
                    const from = normalizeCrmTier(item.beforeTier || item.from);
                    const to = normalizeCrmTier(item.afterTier || item.to);
                    const rawChangeType = String(item.changeType || item.type || '').toLowerCase();
                    const changedBy = item.by || item.changedBy || 'System';
                    const changeType = rawChangeType === 'manual' || (!rawChangeType && changedBy && changedBy !== 'System') ? 'manual' : 'auto';
                    if (order[to] < order[from] && changeType !== 'manual') return null;
                    const name = item.guestName || item.name || item.guestId || 'Guest';
                    return {
                        ...item,
                        date: item.changedAt || item.date || '',
                        name,
                        init: item.init || crmInitial(name),
                        color: item.color || ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'][index % 4],
                        from,
                        to,
                        dir: order[to] > order[from] ? 'up' : 'change',
                        changeType,
                        reason: localized(item.reason),
                        by: changedBy
                    };
                }).filter(Boolean);
            }
        } catch(e) {
            console.warn('Mock tier history fallback', e);
        }
        return [];
    }
});
