const fs = require('fs');
let text = fs.readFileSync('E:/AI_Project/Hotel_PMS/recovered.txt', 'utf8');
text = text.replace(/^\d+:\s+/gm, '');
text = text.replace(/The above content does NOT show.*$/gm, '');
text = text.replace(/^---$/gm, '');

const map = {
    'api-dashboard.js': ['getDailyData', 'getMonthlyData', 'getYoyData', 'getDepts', 'getTrendData'],
    'api-frontdesk.js': ['getGroups', 'getRooms', 'getReservations'],
    'api-operations.js': ['getOrders', 'getTasks', 'getRequests', 'getGolfOrders', 'getRentacarOrders'],
    'api-crm.js': ['getGuests'],
    'api-settings.js': ['getDEFAULT_ROOM_TYPES', 'getAllRooms', 'getAllRoomTypes', 'getALL_MENUS', 'getSYSTEM_ROLES', 'getDEFAULT_CUSTOM_ROLES', 'getDEFAULT_STAFF']
};

for (const [file, methods] of Object.entries(map)) {
    let content = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/api/' + file, 'utf8');
    
    for (const method of methods) {
        const regex = new RegExp(method + '\\s*:\\s*async\\s*\\(\\)\\s*=>\\s*\\{([\\s\\S]*?)\\n\\s*(?:\\w+\\s*:\\s*async\\s*\\(\\)\\s*=>\\s*\\{|\\};|//)', 'g');
        let m;
        let lastMatch = null;
        while ((m = regex.exec(text)) !== null) {
            lastMatch = method + ': async () => {' + m[1];
            if (!lastMatch.endsWith('}')) lastMatch += '}';
            lastMatch += ',';
            regex.lastIndex = regex.lastIndex - m[0].length + method.length + m[1].length; 
        }
        
        if (lastMatch) {
            const dummyRegex = new RegExp(method + '\\s*:\\s*async\\s*\\(\\)\\s*=>\\s*\\{[^}]*\\},?', 'g');
            if (dummyRegex.test(content)) {
                content = content.replace(dummyRegex, lastMatch + '\n');
            } else {
                content = content.replace(/\}\);\s*$/, lastMatch + '\n});');
            }
        } else {
            console.log('Method not found: ' + method);
        }
    }
    fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/common/js/api/' + file, content);
}
console.log('Done mapping extracted methods!');
