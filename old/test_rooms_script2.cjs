const fs = require('fs');
const html = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/operations/rooms.html', 'utf8');
const scripts = [...html.matchAll(/<script>(.*?)<\/script>/gs)].map(m => m[1]);

console.log("Found " + scripts.length + " inline scripts.");
try {
    scripts.forEach(s => {
        require('vm').runInNewContext(s, {
            document: { 
                addEventListener: () => {}, 
                querySelectorAll: () => [], 
                getElementById: () => null 
            },
            window: {},
            console,
            statusConfig: {},
            currentLang: 'ko',
            translations: {},
            allRooms: [],
            PmsAPI: { getAllRooms: () => [] }
        });
    });
    console.log('Syntax OK');
} catch(e) {
    console.error(e);
}
