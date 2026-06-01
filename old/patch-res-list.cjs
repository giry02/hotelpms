const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'dashboard', 'frontdesk', 'reservation-list.html');

let content = fs.readFileSync(file, 'utf8');

// Add URL group filter
content = content.replace(
    "let currentFilter = 'all';",
    "let currentFilter = 'all';\nlet currentGroupFilter = new URLSearchParams(window.location.search).get('group');"
);

content = content.replace(
    "if (currentFilter !== 'all' && r.status !== currentFilter) return false;\n        if (search",
    "if (currentFilter !== 'all' && r.status !== currentFilter) return false;\n        if (currentGroupFilter && r.groupId !== currentGroupFilter) return false;\n        if (search"
);

fs.writeFileSync(file, content);
console.log('Patched reservation-list.html');
