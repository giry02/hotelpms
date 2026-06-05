// api-settings.js
window.PmsAPI = window.PmsAPI || {};

const _ALL_MENUS = [
    { key:'dashboard',    icon:'fa-gauge-high',          label:'대시보드' },
    { key:'reservation',  icon:'fa-calendar-days',       label:'예약 관리' },
    { key:'checkin',      icon:'fa-right-to-bracket',    label:'체크인/아웃' },
    { key:'crm',          icon:'fa-users',               label:'고객 CRM' },
    { key:'rooms',        icon:'fa-bed',                 label:'객실 관리' },
    { key:'rates',        icon:'fa-tags',                label:'요금 캘린더' },
    { key:'housekeeping', icon:'fa-broom',               label:'하우스키핑' },
    { key:'maintenance',  icon:'fa-toolbox',             label:'시설보수' },
    { key:'folio',        icon:'fa-file-invoice-dollar', label:'정산/청구' },
    { key:'ancillary',    icon:'fa-concierge-bell',      label:'부가서비스' },
    { key:'settings',     icon:'fa-gear',                label:'호텔 설정' },
    { key:'staff',        icon:'fa-users-gear',          label:'직원 관리' },
    { key:'billing',      icon:'fa-credit-card',         label:'요금 및 결제' },
];

const _SYSTEM_ROLES = [
    { id:'sys_admin',       name:'Admin',           color:'#6D28D9', desc:'전체 접근',          isSystem: true, perms:_ALL_MENUS.map(m=>m.key) },
    { id:'sys_gm',          name:'General Manager', color:'#111827', desc:'총괄 매니저',        isSystem: true, perms:['dashboard','reservation','checkin','crm','rooms','rates','housekeeping','maintenance','folio','ancillary','settings','staff','billing'] },
    { id:'sys_desk',        name:'Front Desk',      color:'#2563EB', desc:'프론트 데스크',      isSystem: true, perms:['dashboard','reservation','checkin','crm','rooms','folio','ancillary'] },
    { id:'sys_housekeeping',name:'Housekeeping',    color:'#059669', desc:'하우스키핑',         isSystem: true, perms:['housekeeping'] },
    { id:'sys_maintenance', name:'Maintenance',     color:'#D97706', desc:'유지보수 및 시설',   isSystem: true, perms:['housekeeping', 'maintenance'] }
];

const _DEFAULT_CUSTOM_ROLES = [];

const _DEFAULT_STAFF = [
    { id:'s1', name:'Nguyen Kim',     init:'NK', email:'kim@hotel.com',    roleId:'sys_admin',        status:'online',  last:'방금 전', color:'#6D28D9' },
    { id:'s2', name:'Robert Ford',    init:'RF', email:'gm@hotel.com',     roleId:'sys_gm',           status:'online',  last:'10분 전', color:'#111827' },
    { id:'s3', name:'Sarah Connor',   init:'SC', email:'desk1@hotel.com',  roleId:'sys_desk',         status:'online',  last:'방금 전', color:'#2563EB' },
    { id:'s4', name:'John Smith',     init:'JS', email:'desk2@hotel.com',  roleId:'sys_desk',         status:'offline', last:'2시간 전', color:'#2563EB' },
    { id:'s5', name:'Maria Garcia',   init:'MG', email:'house@hotel.com',  roleId:'sys_housekeeping', status:'online',  last:'30분 전', color:'#059669' },
    { id:'s6', name:'James Bond',     init:'JB', email:'maint@hotel.com',  roleId:'sys_maintenance',  status:'offline', last:'1일 전', color:'#D97706' },
    { id:'s7', name:'김철수',         init:'CS', email:'maint2@hotel.com', roleId:'sys_maintenance',  status:'online',  last:'방금 전', color:'#D97706' },
    { id:'s8', name:'이영호',         init:'YH', email:'maint3@hotel.com', roleId:'sys_maintenance',  status:'online',  last:'10분 전', color:'#D97706' }
];

const _MAINTENANCE_TYPES = [
    { id: 'mt1', name: '전기/조명' },
    { id: 'mt2', name: '배관/수도' },
    { id: 'mt3', name: '에어컨/냉난방' },
    { id: 'mt4', name: '가구/비품' },
    { id: 'mt5', name: '도어/잠금장치' },
    { id: 'mt6', name: '엘리베이터' },
    { id: 'mt7', name: '기타' }
];

const _DEFAULT_HOTEL_SETTINGS = {
    id: 'TENANT-GRAND-SAIGON',
    name: 'The Grand Saigon',
    country: 'Vietnam',
    city: 'Ho Chi Minh',
    timezone: 'Asia/Seoul',
    defaultCurrency: 'USD',
    stayoverCleaningPolicy: {
        mode: 'request_only',
        longStayNights: 2,
        intervalDays: 2,
        weeklyDays: [1, 3, 5],
        createForMakeUpRequest: true,
        skipDndNoService: true,
        linenChangeIntervalDays: 3,
        towelChangeMode: 'daily'
    }
};

function mergeHotelSettings(base, override) {
    const next = {
        ..._DEFAULT_HOTEL_SETTINGS,
        ...(base || {}),
        ...(override || {})
    };
    next.stayoverCleaningPolicy = {
        ..._DEFAULT_HOTEL_SETTINGS.stayoverCleaningPolicy,
        ...(base && base.stayoverCleaningPolicy ? base.stayoverCleaningPolicy : {}),
        ...(override && override.stayoverCleaningPolicy ? override.stayoverCleaningPolicy : {})
    };
    return next;
}

Object.assign(window.PmsAPI, {
    getHotelSettings: async () => {
        let apiSettings = {};
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/settings/hotel');
                apiSettings = window.PmsMockApi.data(env) || {};
            }
        } catch(e) {
            console.warn('Mock hotel settings fallback', e);
        }

        let stored = {};
        try {
            stored = JSON.parse(localStorage.getItem('pms_hotel_settings') || '{}');
        } catch(e) {}

        return mergeHotelSettings(apiSettings, stored);
    },
    saveHotelSettings: async (settings) => {
        const merged = mergeHotelSettings(await window.PmsAPI.getHotelSettings(), settings || {});
        localStorage.setItem('pms_hotel_settings', JSON.stringify(merged));
        if (merged.defaultCurrency) localStorage.setItem('pms_default_currency', merged.defaultCurrency);
        try {
            if (window.PmsMockApi) {
                await window.PmsMockApi.request('PUT', '/settings/hotel', { body: merged });
            }
        } catch(e) {
            console.warn('Mock hotel settings save fallback', e);
        }
        return merged;
    },
    getALL_MENUS: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/settings/menus');
                const menus = window.PmsMockApi.items(env);
                if (menus.length) return menus;
            }
        } catch(e) {
            console.warn('Mock menus fallback', e);
        }
        return JSON.parse(JSON.stringify(_ALL_MENUS));
    },
    getSYSTEM_ROLES: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/settings/roles');
                const roles = window.PmsMockApi.items(env).filter(role => role.isSystem !== false);
                if (roles.length) return roles;
            }
        } catch(e) {
            console.warn('Mock system roles fallback', e);
        }
        return JSON.parse(JSON.stringify(_SYSTEM_ROLES));
    },
    getDEFAULT_CUSTOM_ROLES: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/settings/roles');
                return window.PmsMockApi.items(env).filter(role => role.isSystem === false);
            }
        } catch(e) {
            console.warn('Mock custom roles fallback', e);
        }
        return JSON.parse(JSON.stringify(_DEFAULT_CUSTOM_ROLES));
    },
    getDEFAULT_STAFF: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/settings/staff');
                const staff = window.PmsMockApi.items(env);
                if (staff.length) return staff;
            }
        } catch(e) {
            console.warn('Mock staff fallback', e);
        }
        return JSON.parse(JSON.stringify(_DEFAULT_STAFF));
    },
    getMAINTENANCE_TYPES: async () => {
        try {
            if (window.PmsMockApi) {
                const env = await window.PmsMockApi.request('GET', '/settings/maintenance-types');
                const types = window.PmsMockApi.items(env);
                if (types.length) return types;
            }
        } catch(e) {
            console.warn('Mock maintenance types fallback', e);
        }
        return JSON.parse(JSON.stringify(_MAINTENANCE_TYPES));
    }
});
