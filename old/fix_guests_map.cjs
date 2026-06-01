const fs = require('fs');
let html = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/crm/guests.html', 'utf8');

// I will just use regex to fix the guests mapping
html = html.replace(/guests = data\.map\(g => \(\{\s*name: g\.name,\s*init: g\.name\.substring\(0,2\)\.toUpperCase\(\),\s*color: '#3B82F6',\s*nation: g\.country,\s*tier: g\.tier\.toLowerCase\(\),\s*visits: g\.visits,\s*last: g\.lastStay,\s*spend: g\.spend,\s*email: g\.email,\s*phone: g\.phone\s*\}\)\);/g, 
`guests = data.map(g => ({
            name: g.name,
            init: g.name ? g.name.substring(0,2).toUpperCase() : '??',
            color: g.color || '#3B82F6',
            nation: g.nation || g.country || '',
            tier: g.tier ? g.tier.toLowerCase() : 'standard',
            visits: g.visits || 0,
            last: g.last || g.lastStay || '-',
            spend: g.spend || 0,
            email: g.email || '-',
            phone: g.phone || '-'
        }));`);

fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/crm/guests.html', html);
console.log("Fixed guests mapping");
