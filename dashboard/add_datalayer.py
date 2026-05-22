import os
import re

file_path = r'E:\AI_Project\Hotel_PMS\dashboard\dashboard.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Data Layer DOM and JS at the end of body
data_layer_html = """
<!-- Chart Data Layer Tooltip -->
<div id="chartDataLayer" style="position:fixed; display:none; background:rgba(15,23,42,0.9); color:#fff; padding:12px 16px; border-radius:8px; font-size:0.85rem; z-index:9999; box-shadow:0 10px 25px rgba(0,0,0,0.3); pointer-events:none; backdrop-filter:blur(4px); transition:opacity 0.15s; opacity:0; transform:translate(-50%, -100%); margin-top:-15px;">
    <div id="chartDataTitle" style="font-weight:700; margin-bottom:6px; color:#9CA3AF; font-size:0.75rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px;"></div>
    <div id="chartDataContent" style="line-height:1.5;"></div>
</div>

<script>
const chartTooltip = document.getElementById('chartDataLayer');
const chartTooltipTitle = document.getElementById('chartDataTitle');
const chartTooltipContent = document.getElementById('chartDataContent');
let activeChartData = null;

function toggleChartDataLayer(e, title, content) {
    e.stopPropagation();
    if (activeChartData === title && chartTooltip.style.opacity === '1') {
        hideChartDataLayer();
        return;
    }
    chartTooltip.style.display = 'block';
    // Force reflow
    void chartTooltip.offsetWidth;
    chartTooltip.style.opacity = '1';
    chartTooltipTitle.innerHTML = title;
    chartTooltipContent.innerHTML = content;
    
    // Position
    let x = e.clientX;
    let y = e.clientY;
    
    chartTooltip.style.left = x + 'px';
    chartTooltip.style.top = y + 'px';
    activeChartData = title;
}

function hideChartDataLayer() {
    chartTooltip.style.opacity = '0';
    activeChartData = null;
    setTimeout(() => { 
        if(chartTooltip.style.opacity === '0') chartTooltip.style.display = 'none'; 
    }, 150);
}

document.addEventListener('click', hideChartDataLayer);
</script>
"""

if "id=\"chartDataLayer\"" not in content:
    content = content.replace('</body>', data_layer_html + '\n</body>')

# 2. Update renderRoomChart (Monthly)
monthly_old = """g.innerHTML = `<div style="font-size:.56rem;font-weight:700;color:var(--txt);flex-shrink:0;margin-bottom:2px">${d.occ}</div><div style="flex:1;width:100%;display:flex;align-items:flex-end"><div style="height:${(d.occ/maxVal*100).toFixed(0)}%;width:100%;background:var(--primary);border-radius:3px 3px 0 0"></div></div><div style="font-size:.56rem;color:var(--txt2);margin-top:3px;flex-shrink:0">${d.day}</div>`;"""

monthly_new = """g.style.cursor = 'pointer';
            g.innerHTML = `<div style="font-size:.56rem;font-weight:700;color:var(--txt);flex-shrink:0;margin-bottom:2px">${d.occ}</div><div style="flex:1;width:100%;display:flex;align-items:flex-end"><div style="height:${(d.occ/maxVal*100).toFixed(0)}%;width:100%;background:var(--primary);border-radius:3px 3px 0 0;transition:opacity 0.2s" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1"></div></div><div style="font-size:.56rem;color:var(--txt2);margin-top:3px;flex-shrink:0">${d.day}</div>`;
            g.onclick = (e) => toggleChartDataLayer(e, `월간 객실 통계 - ${d.day}`, `<div style="display:flex;justify-content:space-between;gap:20px;"><span>점유 객실:</span> <strong style="color:var(--primary)">${d.occ}실</strong></div><div style="display:flex;justify-content:space-between;gap:20px;"><span>가동률:</span> <strong>${(d.occ/150*100).toFixed(1)}%</strong></div>`);"""

content = content.replace(monthly_old, monthly_new)

# 3. Update renderRoomChart (Weekly)
weekly_old = """g.innerHTML = `<div style="flex:1;width:100%;display:flex;align-items:flex-end;gap:2px"><div style="flex:1;height:${oP}%;background:var(--primary);border-radius:3px 3px 0 0"></div><div style="flex:1;height:${prP}%;background:#D1D5DB;border-radius:3px 3px 0 0"></div></div><div style="font-size:.65rem;color:var(--txt2);margin-top:4px;flex-shrink:0">${d.label}</div><div style="font-size:.58rem;font-weight:600;color:${isUp?'var(--success)':'var(--danger)'};margin-top:1px;flex-shrink:0">${isUp?'+':''}${diff}</div>`;"""

weekly_new = """g.style.cursor = 'pointer';
        g.innerHTML = `<div style="flex:1;width:100%;display:flex;align-items:flex-end;gap:2px"><div style="flex:1;height:${oP}%;background:var(--primary);border-radius:3px 3px 0 0;transition:opacity 0.2s" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1"></div><div style="flex:1;height:${prP}%;background:#D1D5DB;border-radius:3px 3px 0 0;transition:opacity 0.2s" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1"></div></div><div style="font-size:.65rem;color:var(--txt2);margin-top:4px;flex-shrink:0">${d.label}</div><div style="font-size:.58rem;font-weight:600;color:${isUp?'var(--success)':'var(--danger)'};margin-top:1px;flex-shrink:0">${isUp?'+':''}${diff}</div>`;
        g.onclick = (e) => toggleChartDataLayer(e, `주간 객실 통계 - ${d.label}`, `<div style="display:flex;justify-content:space-between;gap:20px;"><span>금주 점유:</span> <strong style="color:var(--primary)">${d.occ}실</strong></div><div style="display:flex;justify-content:space-between;gap:20px;"><span>전주 점유:</span> <strong style="color:#D1D5DB">${d.prev}실</strong></div><div style="display:flex;justify-content:space-between;gap:20px;margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.1)"><span>전주 대비:</span> <strong style="color:${isUp?'#10B981':'#EF4444'}">${isUp?'+':''}${diff}실</strong></div>`);"""

content = content.replace(weekly_old, weekly_new)

# 4. Update svcBreakdown
svc_old = """        row.innerHTML = `
            <div class="svc-icon" style="background:${s.color}1A; color:${s.color}"><i class="fa-solid ${s.icon}"></i></div>
            <div class="svc-name">${s.name}</div>
            <div class="svc-bar-bg"><div class="svc-bar" style="width:0; background:${s.color}"></div></div>
            <div class="svc-val">$${s.val}</div>
        `;
        svcBk.appendChild(row);"""

svc_new = """        row.style.cursor = 'pointer';
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
        svcBk.appendChild(row);"""

content = content.replace(svc_old, svc_new)

# 5. Update svcBreakdown inside changeLang loop
svc_lang_old = """            row.innerHTML = `
                <div class="svc-icon" style="background:${s.color}1A; color:${s.color}"><i class="fa-solid ${s.icon}"></i></div>
                <div class="svc-name">${name}</div>
                <div class="svc-bar-bg"><div class="svc-bar" style="width:${s.pct}%; background:${s.color}"></div></div>
                <div class="svc-val">$${s.val}</div>
            `;
            document.getElementById('svcBreakdown').appendChild(row);"""

svc_lang_new = """            row.style.cursor = 'pointer';
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
            document.getElementById('svcBreakdown').appendChild(row);"""

content = content.replace(svc_lang_old, svc_lang_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated dashboard.html successfully.")
