// api-crm.js
window.PmsAPI = window.PmsAPI || {};

function normalizeCrmTier(tier) {
    const value = String(tier || 'standard').toLowerCase();
    if (value.includes('diamond')) return 'diamond';
    if (value.includes('platinum')) return 'platinum';
    if (value.includes('gold') || value === 'vip') return 'gold';
    if (value.includes('silver')) return 'silver';
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

function crmIsBlacklisted(guest) {
    const tags = Array.isArray(guest?.tags) ? guest.tags.map(tag => String(tag).toLowerCase()) : [];
    const blacklist = guest?.blacklist && typeof guest.blacklist === 'object' ? guest.blacklist : {};
    return Boolean(
        guest?.blacklisted ||
        guest?.isBlacklisted ||
        blacklist.active ||
        String(guest?.status || '').toLowerCase() === 'blacklisted' ||
        tags.includes('blacklist') ||
        tags.includes('blacklisted')
    );
}

function normalizeCrmGuest(guest, index) {
    const blacklist = guest.blacklist && typeof guest.blacklist === 'object' ? guest.blacklist : {};
    const blacklisted = crmIsBlacklisted(guest);
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
        specialNotes: guest.specialNotes || '',
        blacklisted,
        isBlacklisted: blacklisted,
        blacklistReason: guest.blacklistReason || blacklist.reason || '',
        blacklistRegisteredAt: guest.blacklistRegisteredAt || blacklist.registeredAt || '',
        blacklistRegisteredBy: guest.blacklistRegisteredBy || blacklist.registeredBy || '',
        blacklistUpdatedAt: guest.blacklistUpdatedAt || blacklist.updatedAt || '',
        blacklistUpdatedBy: guest.blacklistUpdatedBy || blacklist.updatedBy || '',
        blacklistHistory: Array.isArray(guest.blacklistHistory)
            ? guest.blacklistHistory
            : (Array.isArray(blacklist.history) ? blacklist.history : [])
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
    getMembershipTiers: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/crm/membership-tiers');
                const tiers = crmItems(env);
                if (tiers.length) return tiers;
            }
        } catch(e) {
            console.warn('Mock membership tiers fallback', e);
        }
        try {
            const res = await fetch('../data/api/v1/crm/membership-tiers.json', { cache: 'no-store' });
            if (res.ok) {
                const env = await res.json();
                return crmItems(env);
            }
        } catch(e) {
            console.warn('Fetch failed for membership tiers', e);
        }
        return [];
    },

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
        const normalizeHistory = (env) => {
            const order = { standard: 0, silver: 1, gold: 2, platinum: 3, diamond: 4 };
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
                    dir: order[to] > order[from] ? 'up' : order[to] < order[from] ? 'down' : 'change',
                    changeType,
                    reason: localized(item.reason),
                    by: changedBy
                };
            }).filter(Boolean);
        };
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/crm/tier-history');
                const history = normalizeHistory(env);
                if (history.length) return history;
            }
        } catch(e) {
            console.warn('Mock tier history fallback', e);
        }
        try {
            const res = await fetch('../data/api/v1/crm/tier-history.json', { cache: 'no-store' });
            if (res.ok) {
                const env = await res.json();
                return normalizeHistory(env);
            }
        } catch(e) {
            console.warn('Fetch failed for tier history', e);
        }
        return [];
    }
});
