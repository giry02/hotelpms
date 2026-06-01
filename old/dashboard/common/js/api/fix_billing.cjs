const fs = require('fs');
let content = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/settings/billing.html', 'utf8');

// Step 1: Fix broken <head> - inject proper CSS links
const brokenHead = '<html lang="ko">\n<head>\n<meta charset="utf-8"/>\n            padding: 20px 24px;';
const fixedHead = `<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>요금 및 결제 — Hotel PMS</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="../common/css/dashboard.css">
    <link rel="stylesheet" href="../common/css/settings.css">
    <script src="../common/js/i18n.js"><\/script>
    <script src="../common/js/sidebar.js"><\/script>
<style>
        .billing-warning {
            background: #FEF2F2; border: 1px solid #FECACA; border-radius: var(--radius);
            padding: 20px 24px;`;

content = content.replace(brokenHead, fixedHead);

// Step 2: Remove duplicate script tags already moved to head
content = content.replace(/<script src="\.\.\/common\/js\/i18n\.js"><\/script>\s*\n?/g, '');
content = content.replace(/<script src="\.\.\/common\/js\/sidebar\.js"><\/script>\s*\n?/g, '');

// Step 3: Fix toggleMenu
content = content.replace(/PMS_Sidebar\.toggle\(\)/g, 'toggleMenu()');

// Step 4: Fix formatCardNumber (v undefined)
content = content.replace(
    '    el.value = v.match(/.{1,4}/g)?.join(\' \') || v;\n}',
    '    let v = el.value.replace(/\\D/g,\'\').substring(0,16);\n    el.value = v.match(/.{1,4}/g)?.join(\' \') || v;\n}'
);

// Step 5: Fix updatePreview (num undefined)
content = content.replace(
    '    const name = document.getElementById(\'inputCardName\').value  || \'이름 입력\';',
    '    const num  = document.getElementById(\'inputCardNumber\').value.replace(/\\s/g,\'\') || \'\';\n    const name = document.getElementById(\'inputCardName\').value  || \'이름 입력\';'
);

// Step 6: Fix submitPayment (.btn-danger -> .btn-danger-sm)
content = content.replace(
    "const btn = document.querySelector('#payModalOverlay .btn-danger');",
    "const btn = document.querySelector('#payModalOverlay .btn-danger-sm');"
);

// Step 7: Fix topbar lang select (it's empty) - add lang select
content = content.replace(
    '<div class="topbar-right"></div>',
    `<div class="topbar-right">
    <select class="hotel-select" id="langSelect" onchange="changeLang(this.value)" style="margin-left:8px; width:110px">
        <option value="ko">🇰🇷 한국어</option>
        <option value="en">🇺🇸 English</option>
    </select>
</div>`
);

fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/settings/billing.html', content);
console.log('billing.html fixed successfully!');
