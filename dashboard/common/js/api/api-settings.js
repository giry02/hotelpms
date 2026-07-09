window.PmsAPI = window.PmsAPI || {};

const HOTEL_MENU_KEYS = [
    'dashboard',
    'reservation',
    'checkin',
    'crm',
    'groups',
    'rooms',
    'rates',
    'housekeeping',
    'maintenance',
    'folio',
    'ancillary',
    'operationLogs',
    'settings',
    'staff',
    'billing'
];

function defaultHotelFeatureFlags() {
    return HOTEL_MENU_KEYS.reduce((flags, key) => {
        flags[key] = true;
        return flags;
    }, {});
}

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
    operationalPolicy: {
        defaultCheckinTime: '15:00',
        defaultCheckoutTime: '11:00',
        cancellationPolicy: 'free_48h'
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
    },
    featureFlags: defaultHotelFeatureFlags(),
    menuPolicy: {
        enabledMenus: [...HOTEL_MENU_KEYS],
        disabledMenus: []
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
    next.operationalPolicy = {
        ...cloneSettings(EMPTY_HOTEL_SETTINGS.operationalPolicy),
        ...(base?.operationalPolicy || {}),
        ...(override?.operationalPolicy || {})
    };
    const featureFlags = {
        ...defaultHotelFeatureFlags(),
        ...(base?.featureFlags || {}),
        ...(override?.featureFlags || {})
    };
    const mergedPolicy = {
        ...(base?.menuPolicy || {}),
        ...(override?.menuPolicy || {})
    };
    const menuKeys = Array.from(new Set([
        ...HOTEL_MENU_KEYS,
        ...Object.keys(featureFlags),
        ...((Array.isArray(mergedPolicy.enabledMenus) && mergedPolicy.enabledMenus) || []),
        ...((Array.isArray(mergedPolicy.disabledMenus) && mergedPolicy.disabledMenus) || [])
    ])).filter(Boolean);
    const enabledMenus = Array.isArray(mergedPolicy.enabledMenus)
        ? new Set(mergedPolicy.enabledMenus.filter(Boolean))
        : new Set(menuKeys.filter(key => featureFlags[key] !== false));
    if (Array.isArray(mergedPolicy.disabledMenus)) {
        mergedPolicy.disabledMenus.filter(Boolean).forEach(key => enabledMenus.delete(key));
    }
    menuKeys.forEach(key => {
        if (featureFlags[key] === false) enabledMenus.delete(key);
    });
    const disabledMenus = menuKeys.filter(key => !enabledMenus.has(key));
    disabledMenus.forEach(key => {
        featureFlags[key] = false;
    });
    enabledMenus.forEach(key => {
        featureFlags[key] = featureFlags[key] !== false;
    });
    next.featureFlags = featureFlags;
    next.menuPolicy = {
        enabledMenus: menuKeys.filter(key => enabledMenus.has(key)),
        disabledMenus
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
    HOTEL_MENU_KEYS,

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
