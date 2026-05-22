// api-dashboard.js
window.PmsAPI = window.PmsAPI || {};
Object.assign(window.PmsAPI, {
    getWeekData: async () => {
        try {
            let res = await fetch('../data/dashboard/dashboard.json');
            if(res.ok) {
                const data = await res.json();
                if(data.weekData) return data.weekData;
            }
        } catch(e) { console.warn('Fetch failed for dashboard'); }
        // Fallback
        return initStorage('pms_week', [
            {day:'Mon', label:'월', occ:102, prev:96},
            {day:'Tue', label:'화', occ:94,  prev:88},
            {day:'Wed', label:'수', occ:110, prev:101},
            {day:'Thu', label:'목', occ:106, prev:99},
            {day:'Fri', label:'금', occ:114, prev:105},
            {day:'Sat', label:'토', occ:118, prev:112},
            {day:'Sun', label:'일', occ:98,  prev:95}
        ]);
    },
    getMonthData: async () => {
        try {
            let res = await fetch('../data/dashboard/dashboard.json');
            if(res.ok) {
                const data = await res.json();
                if(data.monthData) return data.monthData;
            }
        } catch(e) { }
        return initStorage('pms_month', [
            {day:'5/1',occ:88},{day:'5/2',occ:91},{day:'5/3',occ:95},{day:'5/4',occ:105},
            {day:'5/5',occ:108},{day:'5/6',occ:112},{day:'5/7',occ:98},{day:'5/8',occ:90},
            {day:'5/9',occ:93},{day:'5/10',occ:97},{day:'5/11',occ:102},{day:'5/12',occ:106},
            {day:'5/13',occ:114},{day:'5/14',occ:118},{day:'5/15',occ:98},{day:'5/16',occ:85},
            {day:'5/17',occ:89},{day:'5/18',occ:94},{day:'5/19',occ:100},{day:'5/20',occ:107},
            {day:'5/21',occ:115},{day:'5/22',occ:119},{day:'5/23',occ:96},{day:'5/24',occ:88},
            {day:'5/25',occ:92},{day:'5/26',occ:97},{day:'5/27',occ:103},{day:'5/28',occ:112},
            {day:'5/29',occ:120},{day:'5/30',occ:115},{day:'5/31',occ:98}
        ]);
    },
    getDailyData: async () => { return []; },
    getMonthlyData: async () => { return []; },
    getYoyData: async () => { return []; },
    getDepts: async () => { return []; },
    getTrendData: async () => { return []; },
    getOrders: async () => { return []; },
    getGuests: async () => { return []; }
});