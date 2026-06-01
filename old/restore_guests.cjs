const fs = require('fs');
let html = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/crm/guests.html', 'utf8');

// I will insert the missing code between the platinum button and the const search = document.getElementById...
let missingCode = `
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
`;

// Looking for the spot to insert:
//         <button class="bs-option" onclick="selectFilter('platinum','Platinum')">
//             <div class="bs-option-icon" style="background:rgba(167,139,250,.1);color:#A78BFA"><i class="fa-solid fa-star"></i></div>
//             <div class="bs-option-label">Platinum<div class="bs-option-desc">상위 Tier Guest</div></div>
//             <i class="fa-solid fa-check bs-option-check"></i>
//         </button>
//     const search = document.getElementById('searchInput').value.toLowerCase();

let anchor = `        </button>
    const search = document.getElementById('searchInput').value.toLowerCase();`;

let replacement = `        </button>` + missingCode + `    const search = document.getElementById('searchInput').value.toLowerCase();`;

if (html.includes(anchor)) {
    html = html.replace(anchor, replacement);
    fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/crm/guests.html', html);
    console.log("Restored missing code successfully");
} else {
    console.log("Could not find anchor!");
}
