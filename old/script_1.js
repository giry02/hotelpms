
document.addEventListener('DOMContentLoaded', async () => {
    try {
        let rawRooms = await PmsAPI.getAllRooms();
        allRooms = rawRooms.map(r => {
            if (!r.floor) {
                let num = r.number || r.id || '101';
                r.floor = Math.floor(parseInt(num.replace(/\D/g, '')) / 100) || 1;
            }
            if (r.status === 'clean') r.status = 'vacant-clean';
            if (r.status === 'dirty') r.status = 'vacant-dirty';
            if (r.status === 'inspect') r.status = 'vacant-dirty';
            if (!r.building && r.bldgCode) r.building = r.bldgCode;
            if (!r.id) r.id = r.number || r.display;
            return r;
        });
        renderRooms();
        updateFilterCounts();
    } catch(e) { console.error(e); }
});
