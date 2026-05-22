const fs = require('fs');
let code = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/api-store.js', 'utf8');

const guestsData = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/data/guests.json', 'utf8');

const replacement = `const _fallbackGuests = ${guestsData};
window.PmsAPI = {`;

code = code.replace('window.PmsAPI = {', replacement);

const searchFetch = `    getGuests: async () => { 
        try {
            let res = await fetch('../common/data/guests.json');
            if(!res.ok) res = await fetch('./common/data/guests.json');
            if(res.ok) return await res.json();
        } catch(e) { console.warn('Fetch failed for guests'); }
        return [];
    },`;

code = code.replace(searchFetch, `    getGuests: async () => { return initStorage('pms_guests', _fallbackGuests); },`);

fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/api-store.js', code);
