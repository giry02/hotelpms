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
    { key:'folio',        icon:'fa-file-invoice-dollar', label:'정산/청구' },
    { key:'ancillary',    icon:'fa-concierge-bell',      label:'부가서비스' },
    { key:'settings',     icon:'fa-gear',                label:'호텔 설정' },
    { key:'staff',        icon:'fa-users-gear',          label:'직원 관리' },
    { key:'billing',      icon:'fa-credit-card',         label:'요금 및 결제' },
];

const _SYSTEM_ROLES = [
    { id:'sys_admin',       name:'Admin',       color:'#6D28D9', desc:'전체 접근',          perms:_ALL_MENUS.map(m=>m.key) }
];

const _DEFAULT_CUSTOM_ROLES = [
    { id:'sys_manager',     name:'Manager',     color:'#1D4ED8', desc:'프론트/운영 관리',   perms:['dashboard','reservation','checkin','crm','rooms','rates','housekeeping','folio','ancillary'] },
    { id:'sys_housekeeper', name:'Housekeeper', color:'#065F46', desc:'하우스키핑 전용',    perms:['dashboard','housekeeping','rooms'] },
];

const _DEFAULT_STAFF = [
    { id:'s1', name:'Nguyen Kim',     init:'NK', email:'kim@hotel.com',   roleId:'sys_admin',       status:'online',  last:'방금 전', color:'#6D28D9' },
    { id:'s2', name:'Tran Minh',      init:'TM', email:'minh@hotel.com',  roleId:'sys_manager',     status:'offline', last:'2시간 전', color:'#1D4ED8' },
    { id:'s3', name:'Park Seo Joon',  init:'PS', email:'park@hotel.com',  roleId:'sys_manager',     status:'online',  last:'5분 전', color:'#1D4ED8' },
    { id:'s4', name:'Sato Yuki',      init:'SY', email:'sato@hotel.com',  roleId:'sys_housekeeper', status:'offline', last:'1일 전', color:'#065F46' },
];

Object.assign(window.PmsAPI, {
    getALL_MENUS: async () => { return JSON.parse(JSON.stringify(_ALL_MENUS)); },
    getSYSTEM_ROLES: async () => { return JSON.parse(JSON.stringify(_SYSTEM_ROLES)); },
    getDEFAULT_CUSTOM_ROLES: async () => { return JSON.parse(JSON.stringify(_DEFAULT_CUSTOM_ROLES)); },
    getDEFAULT_STAFF: async () => { return JSON.parse(JSON.stringify(_DEFAULT_STAFF)); }
});