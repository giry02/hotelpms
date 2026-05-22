const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}
const files = walk('E:/AI_Project/Hotel_PMS/dashboard');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // First, fix instances that have kpi-top, kpi-value, kpi-label, kpi-sub
    const regex1 = /(<div class="kpi-top">[\s\S]*?<\/div>)\s*(<div class="kpi-value"[\s\S]*?<\/div>)\s*(<div class="kpi-label"[\s\S]*?<\/div>)\s*(<div class="kpi-sub"[\s\S]*?<\/div>)/g;
    let newContent = content.replace(regex1, '$1\n                <div class="kpi-body">\n                    $2\n                    $3\n                    $4\n                </div>');
    
    // Then, fix instances that have kpi-top, kpi-value, kpi-label (but no kpi-sub, and not already wrapped in kpi-body)
    const regex2 = /(<div class="kpi-top">[\s\S]*?<\/div>)\s*(<div class="kpi-value"(?![\s\S]*?<\/div>\s*<\/div>)[\s\S]*?<\/div>)\s*(<div class="kpi-label"[\s\S]*?<\/div>)(?!\s*<div class="kpi-sub")/g;
    newContent = newContent.replace(regex2, '$1\n                <div class="kpi-body">\n                    $2\n                    $3\n                </div>');
    
    // There might be some edge cases where we missed it because of the negative lookahead.
    // So let's just do a simpler replacement for any kpi-value + kpi-label that isn't inside a kpi-body
    // Wait, let's just run regex1 and regex2.
    
    // Also, handle the case where it's `<div class="kpi-value" id="...">...`
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Updated ' + file);
    }
});
