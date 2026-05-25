const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'dashboard', 'frontdesk', 'groups.html');

let content = fs.readFileSync(file, 'utf8');

const oldDOMContent = `document.addEventListener('DOMContentLoaded', async () => {
    try {
        localStorage.removeItem('pms_groups');
        groups = await PmsAPI.getGroups();
        if (typeof window.PmsAPI !== 'undefined' && window.PmsAPI.getReservations) {
            window.reservations = await PmsAPI.getReservations();
        }
        updateFilterCounts();
        renderGroups();
    } catch(e) { console.error(e); }
});`;

const newDOMContent = `document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Remove localStorage wipe so CRUD persists
        // localStorage.removeItem('pms_groups'); 
        groups = await PmsAPI.getGroups();
        if (typeof window.PmsAPI !== 'undefined' && window.PmsAPI.getReservations) {
            window.reservations = await PmsAPI.getReservations();
            
            // Sync group pickup and status based on reservations
            groups.forEach(g => {
                const groupRes = window.reservations.filter(r => r.groupId === g.id || (r.isB2B && r.channel && r.channel.includes(g.name.split(' ')[0])));
                g.pickup = groupRes.length;
                
                if (groupRes.length > 0) {
                    const hasCheckedIn = groupRes.some(r => r.status === 'checkedin');
                    const allCheckedOut = groupRes.every(r => r.status === 'checkout' || r.status === 'departed');
                    if (hasCheckedIn) g.status = 'inhouse';
                    else if (allCheckedOut) g.status = 'departed';
                    else g.status = 'confirmed';
                } else if (g.pickup === 0 && g.status === 'inhouse') {
                    g.status = 'confirmed'; // Reset to confirmed if empty
                }
            });
        }
        updateFilterCounts();
        renderGroups();
    } catch(e) { console.error(e); }
});`;

content = content.replace(oldDOMContent, newDOMContent);

fs.writeFileSync(file, content);
console.log('Patched groups.html for dynamic pickup');
