const fs = require('fs');

// 1. CRM
let crm = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/api/api-crm.js', 'utf8');
if (!crm.includes('getHistory')) {
    crm = crm.replace(/\n\}\);/, `,
    getHistory: async () => { return []; }
});`);
    fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/api/api-crm.js', crm);
}

// 2. Settings
let settings = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/api/api-settings.js', 'utf8');
if (!settings.includes('getALL_MENUS')) {
    settings = settings.replace(/\n\}$/m, ''); // remove last }
    settings += `
Object.assign(window.PmsAPI, {
    getALL_MENUS: async () => { return [ {id:'m1', name:'대시보드'}, {id:'m2', name:'객실 현황'} ]; },
    getSYSTEM_ROLES: async () => { return [ {id:'r1', name:'System Admin'}, {id:'r2', name:'Front Desk'} ]; },
    getDEFAULT_CUSTOM_ROLES: async () => { return []; },
    getDEFAULT_STAFF: async () => { return [ {id:'s1', name:'Admin', role:'System Admin'} ]; }
});
`;
    fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/api/api-settings.js', settings);
}

// 3. Operations
let ops = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/api/api-operations.js', 'utf8');
if (!ops.includes('getGolfOrders')) {
    ops = ops.replace(/\n\}\);/, `,
    getGolfOrders: async () => { return []; },
    getRentacarOrders: async () => { return []; },
    getRequests: async () => { return []; },
    getOrders: async () => { return []; },
    getDailyData: async () => { return []; },
    getMonthlyData: async () => { return []; },
    getYoyData: async () => { return []; },
    getDepts: async () => { return []; },
    getTrendData: async () => { return []; },
    getAllRooms: async () => { return []; },
    getAllRoomTypes: async () => { return []; },
    getReservations: async () => { return []; },
    getDEFAULT_ROOM_TYPES: async () => { return []; }
});`);
    fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/api/api-operations.js', ops);
}

console.log("Missing APIs injected");
