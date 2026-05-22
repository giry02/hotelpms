const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('E:/AI_Project/Hotel_PMS/dashboard', function(filePath) {
    if(filePath.endsWith('.html')) {
        let html = fs.readFileSync(filePath, 'utf8');
        
        let relativePath = '';
        let domain = '';
        
        if (filePath.includes('frontdesk')) {
            relativePath = '../common/js/api/';
            domain = 'frontdesk';
        } else if (filePath.includes('crm')) {
            relativePath = '../common/js/api/';
            domain = 'crm';
        } else if (filePath.includes('operations')) {
            relativePath = '../common/js/api/';
            domain = 'operations';
        } else if (filePath.includes('settings')) {
            relativePath = '../common/js/api/';
            domain = 'settings';
        } else {
            relativePath = 'common/js/api/';
            domain = 'dashboard';
        }

        const oldTag1 = '<script src="../common/js/api-store.js"></script>';
        const oldTag2 = '<script src="common/js/api-store.js"></script>';
        
        const newTags = '<script src="' + relativePath + 'api-core.js"></script>\n    <script src="' + relativePath + 'api-' + domain + '.js"></script>';

        let updated = false;
        if(html.includes(oldTag1)) {
            html = html.replace(oldTag1, newTags);
            updated = true;
        }
        if(html.includes(oldTag2)) {
            html = html.replace(oldTag2, newTags);
            updated = true;
        }

        if(updated) {
            fs.writeFileSync(filePath, html);
            console.log('Updated', filePath);
        }
    }
});
