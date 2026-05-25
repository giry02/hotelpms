// api-core.js
const API_VERSION = 'v1.4';
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
