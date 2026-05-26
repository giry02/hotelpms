// dashboard.js - extracted from dashboard.html inline script
import { apiClient } from "../common/api-client.js";

let weekData = [];
let monthData = [];
let currentLang = 'ko';

function renderRoomChart(data, isMonthly) {
    const bc        = document.getElementById('barChart');
    const tableCard = document.getElementById('weeklyTableCard');
    const tableDiv  = document.getElementById('weeklyTable');
    const titleEl   = document.getElementById('roomChartTitle');
    if (!bc) return;

    const isEn = currentLang === 'en';
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-chart-column"></i> ${isMonthly ? (isEn?'Monthly':'월간') : (isEn?'Weekly':'주간')} ${isEn?'Room Status':'객실 현황'}`;
    bc.innerHTML = '';
    if (tableDiv) tableDiv.innerHTML = '';

    // 월간: 오른쪽 카드 숨기고 차트 All 너비 / 주간: 복원
    if (tableCard) tableCard.style.display = isMonthly ? 'none' : '';
    const row = document.getElementById('roomChartRow');
    if (row) row.style.gridTemplateColumns = isMonthly ? '1fr' : '2fr 1fr';

    // 월간 차트
    if (isMonthly) {
        bc.style.cssText = 'height:220px;width:100%;overflow-x:auto;overflow-y:hidden;display:block';
        const maxVal = Math.max(...data.map(d => d.occ));
        const inner  = document.createElement('div');
        const minW   = 32 * data.length;
        inner.style.cssText = `display:flex;align-items:flex-end;gap:3px;height:100%;width:${minW > bc.offsetWidth ? minW+'px' : '100%'};min-width:100%`;
        data.forEach(d => {
            const g = document.createElement('div');
            g.style.cssText = 'flex:1;min-width:28px;display:flex;flex-direction:column;align-items:center;height:100%';
            g.style.cursor = 'pointer';
            g.innerHTML = `<div style="font-size:.56rem;font-weight:700;color:var(--txt);flex-shrink:0;margin-bottom:2px">${d.occ}</div><div style="flex:1;width:100%;display:flex;align-items:flex-end"><div style="height:${(d.occ/maxVal*100).toFixed(0)}%;width:100%;background:var(--primary);border-radius:3px 3px 0 0;transition:opacity 0.2s" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1"></div></div><div style="font-size:.56rem;color:var(--txt2);margin-top:3px;flex-shrink:0">${d.day}</div>`;
            g.onclick = (e) => toggleChartDataLayer(e, `월간 객실 통계 - ${d.day}`, `<div style="display:flex;justify-content:space-between;gap:20px;"><span>점유 객실:</span> <strong style="color:var(--primary)">${d.occ}실</strong></div><div style="display:flex;justify-content:space-between;gap:20px;"><span>가동률:</span> <strong>${(d.occ/150*100).toFixed(1)}%</strong></div>`);
            inner.appendChild(g);
        });
        bc.appendChild(inner);
        return;
    }

    // 주간 이중 막대 차트 — 고정 높이로 렌더링
    bc.style.cssText = 'width:100%;height:200px;display:flex;align-items:flex-end;gap:6px;overflow:visible';
    const maxVal = Math.max(...data.map(d => Math.max(d.occ, d.prev)));
    data.forEach(d => {
        const oP = (d.occ/maxVal*100).toFixed(0), prP = (d.prev/maxVal*100).toFixed(0);
        const diff = d.occ - d.prev, isUp = diff >= 0;
        const g = document.createElement('div');
        g.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;height:100%';
        g.style.cursor = 'pointer';
        g.innerHTML = `<div style="flex:1;width:100%;display:flex;align-items:flex-end;gap:2px"><div style="flex:1;height:${oP}%;background:var(--primary);border-radius:3px 3px 0 0;transition:opacity 0.2s" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1"></div><div style="flex:1;height:${prP}%;background:#D1D5DB;border-radius:3px 3px 0 0;transition:opacity 0.2s" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1"></div></div><div style="font-size:.65rem;color:var(--txt2);margin-top:4px;flex-shrink:0">${d.label}</div><div style="font-size:.58rem;font-weight:600;color:${isUp?'var(--success)':'var(--danger)'};margin-top:1px;flex-shrink:0">${isUp?'+':''}${diff}</div>`;
        g.onclick = (e) => toggleChartDataLayer(e, `주간 객실 통계 - ${d.label}`, `<div style="display:flex;justify-content:space-between;gap:20px;"><span>금주 점유:</span> <strong style="color:var(--primary)">${d.occ}실</strong></div><div style="display:flex;justify-content:space-between;gap:20px;"><span>전주 점유:</span> <strong style="color:#D1D5DB">${d.prev}실</strong></div><div style="display:flex;justify-content:space-between;gap:20px;margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.1)"><span>전주 대비:</span> <strong style="color:${isUp?'#10B981':'#EF4444'}">${isUp?'+':''}${diff}실</strong></div>`);
        bc.appendChild(g);
    });

    // Day 미니 카드 — 한 줄: [Day] [숫자] [증감]
    if (!tableDiv) return;
    const total = data.reduce((a,d) => ({occ:a.occ+d.occ, prev:a.prev+d.prev}), {occ:0,prev:0});
    const items = [...data, {label:'합계', occ:total.occ, prev:total.prev, isTotal:true}];

    items.forEach((d, i) => {
        const diff = d.occ - d.prev, isUp = diff >= 0;
        const isEn = currentLang === 'en';
        const el = document.createElement('div');
        const isTotal = d.isTotal;

        const dispLabel = isTotal
            ? (isEn ? 'Total' : '합계')
            : (isEn ? d.day : d.label);

        if (isTotal) {
            el.style.cssText = 'display:flex;flex-direction:column;justify-content:center;align-items:center;padding:10px 6px;border-radius:10px;background:linear-gradient(135deg,var(--primary) 0%,#2563EB 100%);text-align:center';
            el.innerHTML = `
                <div style="font-size:.85rem;font-weight:700;color:rgba(255,255,255,.85);letter-spacing:.5px;margin-bottom:4px">${dispLabel}</div>
                <div style="font-size:1.7rem;font-weight:800;color:#fff;line-height:1">${d.occ}</div>
                <div style="margin-top:5px;padding:2px 8px;border-radius:20px;font-size:.72rem;font-weight:700;background:rgba(255,255,255,.2);color:#fff">${isUp?'+':''}${diff}</div>`;
        } else {
            const isSat = d.day === 'Sat';
            const isSun = d.day === 'Sun';
            const labelColor = isSat ? '#3B82F6' : isSun ? '#EF4444' : 'var(--txt2)';
            const cardBg     = isSat ? 'rgba(59,130,246,.07)' : isSun ? 'rgba(239,68,68,.07)' : 'var(--bg)';
            const borderClr  = isSat ? 'rgba(59,130,246,.25)' : isSun ? 'rgba(239,68,68,.25)' : 'transparent';
            el.style.cssText = `display:flex;flex-direction:column;justify-content:center;align-items:center;padding:10px 6px;border-radius:10px;background:${cardBg};border:1px solid ${borderClr};text-align:center`;
            el.innerHTML = `
                <div style="font-size:.9rem;font-weight:800;color:${labelColor};letter-spacing:.5px;margin-bottom:4px">${dispLabel}</div>
                <div style="font-size:1.35rem;font-weight:800;color:var(--txt);line-height:1">${d.occ}</div>
                <div style="margin-top:5px;padding:2px 8px;border-radius:20px;font-size:.68rem;font-weight:700;background:${isUp?'rgba(16,185,129,.12)':'rgba(239,68,68,.12)'};color:${isUp?'var(--success)':'var(--danger)'}">${isUp?'+':''}${diff}</div>`;
        }
        tableDiv.appendChild(el);
    });
}

// Initial render (data will be fetched elsewhere)
// renderRoomChart(weekData, false);

// 주간/월간 버튼 (인덱스로 판단 — 언어 무관)
const roomBtns = document.querySelectorAll('#roomChartBtns button');
roomBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
        roomBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const monthly = idx === 1; // 0=주간, 1=월간
        renderRoomChart(monthly ? monthData : weekData, monthly);
    });
});

// ===== SERVICE BREAKDOWN =====
window.svcData = [
    { name: '스파', val: 540, pct: 42, icon: 'fa-spa', color: '#EC4899' },
    { name: '외부 대행', val: 320, pct: 25, icon: 'fa-golf-ball-tee', color: '#10B981' },
    { name: 'Room Service', val: 215, pct: 17, icon: 'fa-utensils', color: '#F59E0B' },
    { name: '미니바', val: 120, pct: 9, icon: 'fa-wine-glass', color: '#8B5CF6' },
    { name: '세탁', val: 90, pct: 7, icon: 'fa-shirt', color: '#3B82F6' }
];
const svcBk = document.getElementById('svcBreakdown');
if(svcBk) {
    svcData.forEach(s => {
        const row = document.createElement('div');
        row.className = 'svc-row';
        row.style.cursor = 'pointer';
        row.style.transition = 'background 0.2s';
        row.onmouseover = () => row.style.background = 'rgba(0,0,0,0.02)';
        row.onmouseout = () => row.style.background = 'transparent';
        row.innerHTML = `
            <div class="svc-icon" style="background:${s.color}1A; color:${s.color}"><i class="fa-solid ${s.icon}"></i></div>
            <div class="svc-name">${s.name}</div>
            <div class="svc-bar-bg"><div class="svc-bar" style="width:0; background:${s.color}"></div></div>
            <div class="svc-val">$${s.val}</div>
        `;
        row.onclick = (e) => toggleChartDataLayer(e, `부대시설 매출 - ${s.name}`, `<div style="display:flex;justify-content:space-between;gap:20px;"><span>매출액:</span> <strong style="color:${s.color}">$${s.val}</strong></div><div style="display:flex;justify-content:space-between;gap:20px;"><span>비중:</span> <strong>${s.pct}%</strong></div>`);
        svcBk.appendChild(row);
        setTimeout(() => {
            row.querySelector('.svc-bar').style.width = s.pct + '%';
        }, 300);
    });
}

function toggleAncillary(isWeekly) {
    const isEn = currentLang === 'en';
    const totalEl = document.getElementById('ancillaryTotal');
    const labelEl = document.getElementById('ancillaryLabel');
    const svcBk = document.getElementById('svcBreakdown');
    
    if(isWeekly) {
        totalEl.textContent = '$8,450';
        labelEl.textContent = isEn ? "Weekly Total Revenue" : "주간 총 Ancillary Rev";
        window.svcData = [
            { name: '스파', val: 3200, pct: 38, icon: 'fa-spa', color: '#EC4899' },
            { name: '외부 대행', val: 2400, pct: 28, icon: 'fa-golf-ball-tee', color: '#10B981' },
            { name: 'Room Service', val: 1500, pct: 18, icon: 'fa-utensils', color: '#F59E0B' },
            { name: '미니바', val: 850, pct: 10, icon: 'fa-wine-glass', color: '#8B5CF6' },
            { name: '세탁', val: 500, pct: 6, icon: 'fa-shirt', color: '#3B82F6' }
        ];
    } else {
        totalEl.textContent = '$1,285';
        labelEl.textContent = isEn ? "Today's Total Revenue" : "Today 총 Ancillary Rev";
        window.svcData = [
            { name: '스파', val: 540, pct: 42, icon: 'fa-spa', color: '#EC4899' },
            { name: '외부 대행', val: 320, pct: 25, icon: 'fa-golf-ball-tee', color: '#10B981' },
            { name: 'Room Service', val: 215, pct: 17, icon: 'fa-utensils', color: '#F59E0B' },
            { name: '미니바', val: 120, pct: 9, icon: 'fa-wine-glass', color: '#8B5CF6' },
            { name: '세탁', val: 90, pct: 7, icon: 'fa-shirt', color: '#3B82F6' }
        ];
    }
    // re-render breakdown
    if(svcBk) {
        svcBk.innerHTML = '';
        const dict = Object.assign({}, window.translations ? window.translations[currentLang] : {}, translations[currentLang] || translations.ko);
        window.svcData.forEach(s => {
            const name = dict[s.name] || s.name;
            const row = document.createElement('div');
            row.className = 'svc-row';
            row.style.cursor = 'pointer';
            row.style.transition = 'background 0.2s';
            row.onmouseover = () => row.style.background = 'rgba(0,0,0,0.02)';
            row.onmouseout = () => row.style.background = 'transparent';
            row.innerHTML = `
                <div class="svc-icon" style="background:${s.color}1A; color:${s.color}"><i class="fa-solid ${s.icon}"></i></div>
                <div class="svc-name">${name}</div>
                <div class="svc-bar-bg"><div class="svc-bar" style="width:0; background:${s.color}"></div></div>
                <div class="svc-val">$${s.val}</div>
            `;
            row.onclick = (e) => toggleChartDataLayer(e, `부대시설 매출 - ${name}`, `<div style="display:flex;justify-content:space-between;gap:20px;"><span>매출액:</span> <strong style="color:${s.color}">$${s.val}</strong></div><div style="display:flex;justify-content:space-between;gap:20px;"><span>비중:</span> <strong>${s.pct}%</strong></div>`);
            svcBk.appendChild(row);
            setTimeout(() => {
                row.querySelector('.svc-bar').style.width = s.pct + '%';
            }, 50);
        });
    }
}

// CARD ACTION TOGGLE
document.querySelectorAll('.card-actions').forEach(group => {
    group.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});

// MOBILE MENU TOGGLE
function toggleMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// NOTIFICATION TOGGLE
function toggleNotifications(e) {
    e.stopPropagation();
    document.getElementById('notifDropdown').classList.toggle('active');
}
// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('notifDropdown');
    const wrap = document.querySelector('.notif-wrap');
    if (dropdown.classList.contains('active') && !wrap.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// i18n setup
const translations = {
    ko: {
        // ... (same as original translations object omitted for brevity)
    },
    en: {
        // ... (same as original translations object omitted for brevity)
    }
};
function setupI18n() {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const textNodes = [];
    while(node = walk.nextNode()) {
        if(node.nodeValue.trim()) textNodes.push(node);
    }
    textNodes.forEach(n => {
        const txt = n.nodeValue.trim();
        const lang = currentLang;
        const dict = translations[lang] || {};
        if(dict[txt]) n.nodeValue = dict[txt];
    });
}
setupI18n();

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await apiClient.request('data/dashboard/dashboard.json');
        weekData = data.weekData || [];
        monthData = data.monthData || [];
        window.svcData = data.svcData || window.svcData;
        
        renderRoomChart(weekData, false);
        
        // Re-render service breakdown if data exists
        const svcBk = document.getElementById('svcBreakdown');
        if(svcBk && window.svcData) {
            svcBk.innerHTML = '';
            const dict = Object.assign({}, window.translations ? window.translations[currentLang] : {}, translations[currentLang] || translations.ko);
            window.svcData.forEach(s => {
                const name = dict[s.name] || s.name;
                const row = document.createElement('div');
                row.className = 'svc-row';
                row.style.cursor = 'pointer';
                row.style.transition = 'background 0.2s';
                row.onmouseover = () => row.style.background = 'rgba(0,0,0,0.02)';
                row.onmouseout = () => row.style.background = 'transparent';
                row.innerHTML = `
                    <div class="svc-icon" style="background:${s.color}1A; color:${s.color}"><i class="fa-solid ${s.icon}"></i></div>
                    <div class="svc-name">${name}</div>
                    <div class="svc-bar-bg"><div class="svc-bar" style="width:${s.pct}%; background:${s.color}"></div></div>
                    <div class="svc-val">$${s.val}</div>
                `;
                row.onclick = (e) => toggleChartDataLayer(e, `부대시설 매출 - ${name}`, `<div style="display:flex;justify-content:space-between;gap:20px;"><span>매출액:</span> <strong style="color:${s.color}">$${s.val}</strong></div><div style="display:flex;justify-content:space-between;gap:20px;"><span>비중:</span> <strong>${s.pct}%</strong></div>`);
                svcBk.appendChild(row);
            });
        }
    } catch(e) { 
        console.error('Failed to fetch dashboard data:', e);
        // Fallback to render dummy data if fetch fails (e.g. running from file://)
        weekData = [
            { day: "Mon", label: "월", occ: 102, prev: 96 },
            { day: "Tue", label: "화", occ: 94, prev: 88 },
            { day: "Wed", label: "수", occ: 110, prev: 101 },
            { day: "Thu", label: "목", occ: 106, prev: 99 },
            { day: "Fri", label: "금", occ: 114, prev: 105 },
            { day: "Sat", label: "토", occ: 118, prev: 112 },
            { day: "Sun", label: "일", occ: 98, prev: 95 }
        ];
        monthData = Array.from({length: 31}, (_, i) => ({ day: `5/${i+1}`, occ: 80 + Math.floor(Math.random()*40) }));
        window.svcData = [
            { name: "스파", val: 540, pct: 42, icon: "fa-spa", color: "#EC4899" },
            { name: "외부 대행", val: 320, pct: 25, icon: "fa-golf-ball-tee", color: "#10B981" },
            { name: "Room Service", val: 215, pct: 17, icon: "fa-utensils", color: "#F59E0B" },
            { name: "미니바", val: 120, pct: 9, icon: "fa-wine-glass", color: "#8B5CF6" },
            { name: "세탁", val: 90, pct: 7, icon: "fa-shirt", color: "#3B82F6" }
        ];
        
        renderRoomChart(weekData, false);
        
        // Re-render service breakdown
        const svcBk = document.getElementById('svcBreakdown');
        if(svcBk && window.svcData) {
            svcBk.innerHTML = '';
            const dict = Object.assign({}, window.translations ? window.translations[currentLang] : {}, translations[currentLang] || translations.ko);
            window.svcData.forEach(s => {
                const name = dict[s.name] || s.name;
                const row = document.createElement('div');
                row.className = 'svc-row';
                row.style.cursor = 'pointer';
                row.style.transition = 'background 0.2s';
                row.onmouseover = () => row.style.background = 'rgba(0,0,0,0.02)';
                row.onmouseout = () => row.style.background = 'transparent';
                row.innerHTML = `
                    <div class="svc-icon" style="background:${s.color}1A; color:${s.color}"><i class="fa-solid ${s.icon}"></i></div>
                    <div class="svc-name">${name}</div>
                    <div class="svc-bar-bg"><div class="svc-bar" style="width:${s.pct}%; background:${s.color}"></div></div>
                    <div class="svc-val">$${s.val}</div>
                `;
                svcBk.appendChild(row);
            });
        }
    }
});
