// api-core.js
const API_VERSION = 'v2.0'; // Bumped to force reset system roles

if (localStorage.getItem('pms_api_version') !== API_VERSION) {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('pms_')) localStorage.removeItem(key);
    });
    localStorage.setItem('pms_api_version', API_VERSION);
}

function initStorage(key, fallbackData) {
    let data = localStorage.getItem(key);
    if (!data) {
        localStorage.setItem(key, JSON.stringify(fallbackData));
        return fallbackData;
    }
    return JSON.parse(data);
}

window.PmsAPI = window.PmsAPI || {};

Object.assign(window.PmsAPI, {
    // Session Mock: Change to 's5' (housekeeping) or 's1' (admin) for testing
    getCurrentUser: async () => {
        // Defaults to Admin if not explicitly set in localStorage for testing
        const override = localStorage.getItem('mock_user_id') || 's1'; 
        const staffList = await window.PmsAPI.getDEFAULT_STAFF();
        return staffList.find(s => s.id === override) || staffList[0];
    }
});
