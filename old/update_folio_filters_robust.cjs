const fs = require('fs');

const path = 'dashboard/operations/folio.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace the filter chips HTML using regex
const chipsRegex = /<div class="filter-chips">[\s\S]*?<\/div>/;
const newChips = `<div class="filter-chips" style="display:flex; align-items:center; gap:8px">
                    <button class="chip active" onclick="setDept(this,'all')">전체</button>
                    <button class="chip" onclick="setDept(this,'room')">객실</button>
                    <button class="chip" onclick="setDept(this,'pos')">통합 POS</button>
                    <button class="chip" onclick="setDept(this,'golf')">골프장</button>
                    <button class="chip" onclick="setDept(this,'car')">렌트카</button>
                    
                    <label style="display:flex; align-items:center; gap:6px; margin-left:12px; font-size:0.85rem; font-weight:600; cursor:pointer; color:var(--txt);">
                        <input type="checkbox" id="chkUnpaid" onchange="renderFolios()" style="width:16px; height:16px; accent-color:var(--primary);">
                        미수금
                    </label>
                </div>`;

content = content.replace(chipsRegex, newChips);

// 2. Add 'dept' to the mock data. Let's just use string replacement on each line.
// We'll cycle through ['room', 'room', 'pos', 'golf', 'car']
const depts = ['room', 'room', 'pos', 'golf', 'car', 'room', 'pos'];
let dIdx = 0;
// Only do this if we haven't already added dept (just to be safe)
if (!content.includes("dept:'room'")) {
    content = content.replace(/\{id:'FOL-\d+', room:'.*?'/g, (match) => {
        const dept = depts[dIdx % depts.length];
        dIdx++;
        return match + `, dept:'${dept}'`;
    });
}

// 3. Update Javascript Variables and Functions
content = content.replace("let currentStatus = 'all';", "let currentDept = 'all';");

// Update renderFolios filter logic
const filterRegex = /const filtered = folios\.filter\(f => \{[\s\S]*?return true;\s*\}\);/;
const newFilter = `const filtered = folios.filter(f => {
        const showUnpaidOnly = document.getElementById('chkUnpaid') ? document.getElementById('chkUnpaid').checked : false;
        if (typeof currentDept !== 'undefined' && currentDept !== 'all' && f.dept !== currentDept) return false;
        if (showUnpaidOnly && f.bal <= 0) return false;
        if (search && !f.id.toLowerCase().includes(search) && !f.room.includes(search) && !f.guest.toLowerCase().includes(search)) return false;
        return true;
    });`;
content = content.replace(filterRegex, newFilter);

// Replace setStatus with setDept
const setStatusRegex = /function setStatus\(btn, status\) \{[\s\S]*?renderFolios\(\);\s*\}/;
const newSetDept = `function setDept(btn, dept) {
    currentDept = dept;
    document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    renderFolios();
}`;
content = content.replace(setStatusRegex, newSetDept);

fs.writeFileSync(path, content);
console.log('folio.html correctly updated with new filter logic.');
