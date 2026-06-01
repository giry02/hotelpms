const fs = require('fs');

const path = 'dashboard/operations/folio.html';
let content = fs.readFileSync(path, 'utf8');

const oldCheckboxRegex = /<label style="display:flex; align-items:center; gap:6px; margin-left:12px; font-size:0.85rem; font-weight:600; cursor:pointer; color:var\(--txt\);">\s*<input type="checkbox" id="chkUnpaid".*?>\s*미수금\s*<\/label>/s;

const newButton = `<button class="chip" id="btnUnpaidToggle" style="margin-left:12px; border:1px solid var(--danger); color:var(--danger); background:transparent; display:flex; align-items:center; gap:6px;" onclick="
    this.classList.toggle('active'); 
    if(this.classList.contains('active')){
        this.style.background='var(--danger)';
        this.style.color='#fff';
    }else{
        this.style.background='transparent';
        this.style.color='var(--danger)';
    } 
    document.getElementById('chkUnpaid').checked = this.classList.contains('active'); 
    renderFolios();
"><i class="fa-solid fa-exclamation-circle"></i> 미수금만 보기</button>
<input type="checkbox" id="chkUnpaid" style="display:none;">`;

content = content.replace(oldCheckboxRegex, newButton);
fs.writeFileSync(path, content);
console.log('Unpaid checkbox replaced with a button.');
