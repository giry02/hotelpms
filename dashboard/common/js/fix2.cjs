const fs = require('fs');
let code = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/crm/guests.html', 'utf8');

const searchRegex = /<script src="\.\.\/common\/js\/ui-components\.js"><\/script>\r?\n\s*<div class="kpi-card blue">/;

const replace = `<script src="../common/js/ui-components.js"></script>
    <script src="../common/js/topbar.js"></script>
</head>
<body>

<div class="main">
    <header class="topbar">
        <h1 data-i18n-key="Guest Management">투숙객 관리</h1>
    </header>

    <div class="content">
        <!-- KPI -->
        <div class="kpi-grid kpi-grid-4">
            <div class="kpi-card blue">`;

code = code.replace(searchRegex, replace);
fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/crm/guests.html', code);
