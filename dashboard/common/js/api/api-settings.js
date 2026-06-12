window.PmsAPI = window.PmsAPI || {};

const EMPTY_HOTEL_SETTINGS = {
    id: '',
    name: '',
    country: '',
    city: '',
    timezone: '',
    defaultCurrency: '',
    defaultCurrencyLocked: false,
    adminContact: {
        name: '',
        roleId: '',
        email: '',
        phone: '',
        recoveryEnabled: true
    },
    stayoverCleaningPolicy: {
        mode: 'request_only',
        longStayNights: 0,
        intervalDays: 0,
        weeklyDays: [],
        createForMakeUpRequest: true,
        skipDndNoService: true,
        linenChangeIntervalDays: 0,
        towelChangeMode: ''
    }
};

function cloneSettings(value) {
    return JSON.parse(JSON.stringify(value));
}

function mergeHotelSettings(base, override) {
    const next = {
        ...cloneSettings(EMPTY_HOTEL_SETTINGS),
        ...(base || {}),
        ...(override || {})
    };
    next.stayoverCleaningPolicy = {
        ...cloneSettings(EMPTY_HOTEL_SETTINGS.stayoverCleaningPolicy),
        ...(base?.stayoverCleaningPolicy || {}),
        ...(override?.stayoverCleaningPolicy || {})
    };
    next.adminContact = {
        ...cloneSettings(EMPTY_HOTEL_SETTINGS.adminContact),
        ...(base?.adminContact || {}),
        ...(override?.adminContact || {})
    };
    return next;
}

async function listFromApi(path) {
    if (!window.PmsMockApi) return [];
    const env = await window.PmsMockApi.request('GET', path);
    return window.PmsMockApi.items(env);
}

async function dataFromApi(path) {
    if (!window.PmsMockApi) return null;
    const env = await window.PmsMockApi.request('GET', path);
    return window.PmsMockApi.data(env);
}

Object.assign(window.PmsAPI, {
    getHotelSettings: async () => {
        let apiSettings = {};
        try {
            apiSettings = await dataFromApi('/settings/hotel') || {};
        } catch (e) {
            console.warn('Hotel settings API load failed', e);
        }

        let stored = {};
        try {
            stored = JSON.parse(localStorage.getItem('pms_hotel_settings') || '{}');
        } catch (e) {
            stored = {};
        }

        return mergeHotelSettings(apiSettings, stored);
    },

    saveHotelSettings: async (settings) => {
        const current = await window.PmsAPI.getHotelSettings();
        const requested = { ...(settings || {}) };
        if (current.defaultCurrencyLocked && current.defaultCurrency) {
            requested.defaultCurrency = current.defaultCurrency;
            requested.defaultCurrencyLocked = true;
        }
        const merged = mergeHotelSettings(current, requested);
        localStorage.setItem('pms_hotel_settings', JSON.stringify(merged));
        if (merged.defaultCurrency) localStorage.setItem('pms_default_currency', merged.defaultCurrency);
        try {
            if (window.PmsMockApi) await window.PmsMockApi.request('PUT', '/settings/hotel', { body: merged });
        } catch (e) {
            console.warn('Hotel settings API save failed', e);
        }
        return merged;
    },

    getALL_MENUS: async () => {
        try {
            return await listFromApi('/settings/menus');
        } catch (e) {
            console.warn('Menus API load failed', e);
            return [];
        }
    },

    getSYSTEM_ROLES: async () => {
        try {
            return (await listFromApi('/settings/roles')).filter(role => role.isSystem !== false);
        } catch (e) {
            console.warn('System roles API load failed', e);
            return [];
        }
    },

    getDEFAULT_CUSTOM_ROLES: async () => {
        try {
            return (await listFromApi('/settings/roles')).filter(role => role.isSystem === false);
        } catch (e) {
            console.warn('Custom roles API load failed', e);
            return [];
        }
    },

    getDEFAULT_STAFF: async () => {
        try {
            return await listFromApi('/settings/staff');
        } catch (e) {
            console.warn('Staff API load failed', e);
            return [];
        }
    },

    getMAINTENANCE_TYPES: async () => {
        try {
            return await listFromApi('/settings/maintenance-types');
        } catch (e) {
            console.warn('Maintenance types API load failed', e);
            return [];
        }
    }
});
