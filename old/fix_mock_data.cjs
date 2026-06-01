const fs = require('fs');
const p = 'dashboard/common/js/api/api-operations.js';
let c = fs.readFileSync(p, 'utf8');

const repl = `
    getDailyData: async () => { return [{date:'5.16',room:18000,fnb:2000,spa:1500,other:800},{date:'5.17',room:19000,fnb:2200,spa:1600,other:900},{date:'5.18',room:21000,fnb:2500,spa:1800,other:1100},{date:'5.19',room:24000,fnb:3000,spa:2000,other:1200},{date:'5.20',room:25000,fnb:3200,spa:2100,other:1300},{date:'5.21',room:22000,fnb:2800,spa:1900,other:1000},{date:'5.22',room:20000,fnb:2400,spa:1700,other:900}]; },
    getMonthlyData: async () => { return [{m:'1월',v:650000},{m:'2월',v:580000},{m:'3월',v:620000},{m:'4월',v:670000},{m:'5월',v:690000},{m:'6월',v:0},{m:'7월',v:0},{m:'8월',v:0},{m:'9월',v:0},{m:'10월',v:0},{m:'11월',v:0},{m:'12월',v:0}]; },
    getYoyData: async () => { return [{m:1,ly:620000,ty:650000},{m:2,ly:550000,ty:580000},{m:3,ly:600000,ty:620000},{m:4,ly:630000,ty:670000},{m:5,ly:650000,ty:690000},{m:6,ly:680000,ty:0},{m:7,ly:720000,ty:0},{m:8,ly:750000,ty:0},{m:9,ly:610000,ty:0},{m:10,ly:640000,ty:0},{m:11,ly:620000,ty:0},{m:12,ly:700000,ty:0}]; },
    getDepts: async () => { 
        return [
            {name:'객실 (Rooms)',sub:'Room Revenue',pct:72,amt:118260,icon:'fa-bed',color:'var(--primary)',lt:'var(--primary-lt)'},
            {name:'통합 POS',sub:'F&B, Retail',pct:15,amt:24630,icon:'fa-cash-register',color:'var(--success)',lt:'rgba(16,185,129,0.15)'},
            {name:'골프장 (Golf)',sub:'Green Fee, Cart',pct:8,amt:13140,icon:'fa-golf-ball-tee',color:'var(--purple)',lt:'rgba(139,92,246,0.15)'},
            {name:'렌트카 (Rent-a-car)',sub:'Car Rentals',pct:5,amt:8220,icon:'fa-car',color:'var(--orange)',lt:'rgba(245,158,11,0.15)'}
        ]; 
    },
    getTrendData: async () => { return [{date:'2026-05-22',amount:25000,diff:5.2},{date:'2026-05-21',amount:23760,diff:-2.1},{date:'2026-05-20',amount:24270,diff:1.8},{date:'2026-05-19',amount:23840,diff:8.4},{date:'2026-05-18',amount:22000,diff:-5.5},{date:'2026-05-17',amount:23280,diff:12.1},{date:'2026-05-16',amount:20760,diff:0}]; },
`;

c = c.replace(/getDailyData: async \(\) => \{ return \[\]; \},\s*getMonthlyData: async \(\) => \{ return \[\]; \},\s*getYoyData: async \(\) => \{ return \[\]; \},\s*getDepts: async \(\) => \{ return \[\]; \},\s*getTrendData: async \(\) => \{ return \[\]; \},/, repl); 
fs.writeFileSync(p, c);
console.log("Mock data injected into api-operations.js");

// Replace title in folio-chart.html (reports.html)
['dashboard/operations/folio-chart.html', 'dashboard/operations/reports.html'].forEach(f => {
    let html = fs.readFileSync(f, 'utf8');
    html = html.replace('<div class="card-title"><i class="fa-solid fa-building"></i> 부서별 매출</div>', '<div class="card-title"><i class="fa-solid fa-building"></i> 항목별 매출</div>');
    fs.writeFileSync(f, html);
});
console.log("Renamed 부서별 매출 to 항목별 매출 in reports.html");
