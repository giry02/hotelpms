const fs = require('fs');

const apiPath = 'E:/AI_Project/Hotel_PMS/dashboard/common/js/api/api-frontdesk.js';
let code = fs.readFileSync(apiPath, 'utf8');

const groupsFallback = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/data/frontdesk/groups.json', 'utf8');

const getGroupsCode = `,
    getGroups: async () => {
        try {
            let res = await fetch('../data/frontdesk/groups.json');
            if(res.ok) return await res.json();
        } catch(e) {}
        return initStorage('pms_groups', ${groupsFallback});
    }
});`;

code = code.replace(/\n\}\);/, getGroupsCode);

fs.writeFileSync(apiPath, code);
