const fs = require('fs');
const files = [
    'E:/AI_Project/Hotel_PMS/dashboard/dashboard.html',
    'E:/AI_Project/Hotel_PMS/dashboard/operations/folio.html',
    'E:/AI_Project/Hotel_PMS/dashboard/operations/folio-chart.html',
    'E:/AI_Project/Hotel_PMS/dashboard/operations/ancillary.html',
    'E:/AI_Project/Hotel_PMS/dashboard/operations/maintenance.html',
    'E:/AI_Project/Hotel_PMS/dashboard/frontdesk/groups.html',
    'E:/AI_Project/Hotel_PMS/dashboard/settings/staff.html'
];
files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content.replace(/<div class="kpi-value"([^>]*)>([\s\S]*?)<\/div>\s*<div class="kpi-label">([\s\S]*?)<\/div>/g, 
                                '<div class="kpi-body"><div class="kpi-value"$1>$2</div><div class="kpi-label">$3</div></div>');
        // also fix kpi-trend if present
        newContent = newContent.replace(/<div class="kpi-label">([\s\S]*?)<\/div><\/div>\s*<div class="kpi-trend([^>]*)>([\s\S]*?)<\/div>/g,
                                '<div class="kpi-label">$1</div><div class="kpi-trend$2>$3</div></div>');
                                
        // also fix kpi-sub if present
        newContent = newContent.replace(/<div class="kpi-label">([\s\S]*?)<\/div><\/div>\s*<div class="kpi-sub([^>]*)>([\s\S]*?)<\/div>/g,
                                '<div class="kpi-label">$1</div><div class="kpi-sub$2>$3</div></div>');
        
        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log('Fixed ' + file);
        }
    }
});
