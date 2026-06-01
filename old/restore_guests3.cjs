const fs = require('fs');
let html = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/crm/guests.html', 'utf8');

let split1 = html.split('<div class="bottom-sheet-options">');
let pre = split1[0] + '<div class="bottom-sheet-options">\n';
let split2 = split1[1].split('    // Desktop table');
let post = '    // Desktop table' + split2[1];

let missingCode = `        <button class="bs-option selected" onclick="selectFilter('all','전체')">
            <div class="bs-option-icon" style="background:var(--border2);color:var(--txt2)"><i class="fa-solid fa-users"></i></div>
            <div class="bs-option-label">All<div class="bs-option-desc">모든 Tier Guest 표시</div></div>
            <i class="fa-solid fa-check bs-option-check"></i>
        </button>
        <button class="bs-option" onclick="selectFilter('diamond','Diamond')">
            <div class="bs-option-icon" style="background:rgba(96,165,250,.1);color:#60A5FA"><i class="fa-solid fa-gem"></i></div>
            <div class="bs-option-label">Diamond<div class="bs-option-desc">최상위 Tier Guest</div></div>
            <i class="fa-solid fa-check bs-option-check"></i>
        </button>
        <button class="bs-option" onclick="selectFilter('platinum','Platinum')">
            <div class="bs-option-icon" style="background:rgba(167,139,250,.1);color:#A78BFA"><i class="fa-solid fa-star"></i></div>
            <div class="bs-option-label">Platinum<div class="bs-option-desc">상위 Tier Guest</div></div>
            <i class="fa-solid fa-check bs-option-check"></i>
        </button>
        <button class="bs-option" onclick="selectFilter('gold','Gold')">
            <div class="bs-option-icon" style="background:rgba(245,158,11,.1);color:#F59E0B"><i class="fa-solid fa-crown"></i></div>
            <div class="bs-option-label">Gold<div class="bs-option-desc">우수 Tier Guest</div></div>
            <i class="fa-solid fa-check bs-option-check"></i>
        </button>
        <button class="bs-option" onclick="selectFilter('standard','Standard')">
            <div class="bs-option-icon" style="background:rgba(156,163,175,.1);color:#9CA3AF"><i class="fa-solid fa-user"></i></div>
            <div class="bs-option-label">Standard<div class="bs-option-desc">일반 Tier Guest</div></div>
            <i class="fa-solid fa-check bs-option-check"></i>
        </button>
    </div>
</div>

<script>
let guests = [];
PmsAPI.getGuests()
    .then(data => {
        guests = data.map(g => ({
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
        }));
        if(typeof renderGuests === 'function') {
            renderGuests();
            updateFilterCounts();
        }
    })
    .catch(err => console.error(err));

const tierCfg = {
    diamond:{label:'Diamond',icon:'fa-gem',color:'#60A5FA',bg:'rgba(96,165,250,.1)'},
    platinum:{label:'Platinum',icon:'fa-star',color:'#A78BFA',bg:'rgba(167,139,250,.1)'},
    gold:{label:'Gold',icon:'fa-crown',color:'#F59E0B',bg:'rgba(245,158,11,.1)'},
    standard:{label:'Standard',icon:'fa-user',color:'#9CA3AF',bg:'rgba(156,163,175,.1)'}
};

let currentTier = 'all';

function renderGuests() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filtered = guests.filter(g => {
        if (currentTier !== 'all' && g.tier !== currentTier) return false;
        if (search && !g.name.toLowerCase().includes(search) && !g.email.toLowerCase().includes(search) && !g.phone.includes(search)) return false;
        return true;
    });

    const tbody = document.getElementById('guestBody');
    const mobile = document.getElementById('guestMobile');
    const t = tierCfg;

`;

let result = pre + missingCode + post;
fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/crm/guests.html', result);
console.log("guests.html successfully restored and mapping fixed!");
