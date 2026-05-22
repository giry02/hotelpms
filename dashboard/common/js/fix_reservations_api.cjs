const fs = require('fs');

const path = 'E:/AI_Project/Hotel_PMS/dashboard/common/js/api-store.js';
let code = fs.readFileSync(path, 'utf8');

const tResData = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/data/timelineReservations.json', 'utf8');
const resData = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/data/reservations.json', 'utf8');

const fallbackBlock = `
const _fallbackTimelineReservations = ${tResData};
const _fallbackReservations = ${resData};
window.PmsAPI = {`;

code = code.replace('window.PmsAPI = {', fallbackBlock);

const newMethods = `
    getTimelineReservations: async () => { return initStorage('pms_timeline_res', _fallbackTimelineReservations); },
    getReservations: async () => { return initStorage('pms_reservations', _fallbackReservations); },
`;

// replace getReservations definition
const oldGetRes = `    getReservations: async () => { 
        try {
            let res = await fetch('../common/data/reservations.json');
            if(!res.ok) res = await fetch('./common/data/reservations.json');
            if(res.ok) {
                const data = await res.json();
                if(data.length > 10) return data; 
            }
        } catch(e) { console.warn('Fetch failed for reservations'); }
        return [];
    },`;

code = code.replace(oldGetRes, newMethods);

fs.writeFileSync(path, code);
