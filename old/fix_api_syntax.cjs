const fs = require('fs');
const p = 'dashboard/common/js/api/api-operations.js';
let c = fs.readFileSync(p, 'utf8');

const badStr = `},{date:'2026-05-21',amount:23760,diff:-2.1},{date:'2026-05-20',amount:24270,diff:1.8},{date:'2026-05-19',amount:23840,diff:8.4},{date:'2026-05-18',amount:22000,diff:-5.5},{date:'2026-05-17',amount:23280,diff:12.1},{date:'2026-05-16',amount:20760,diff:0}]; },`;

if (c.includes(badStr)) {
    c = c.replace(badStr, '');
    fs.writeFileSync(p, c);
    console.log("Fixed!");
} else {
    console.log("Bad string not found.");
}
