// Dashboard chart renderer. Kept as a classic script so dashboard.html also works from file://.
(function () {
    const DAY_LABELS = {
        Mon: "월", Tue: "화", Wed: "수", Thu: "목", Fri: "금", Sat: "토", Sun: "일"
    };
    const SERVICE_LABELS = {
        spa: { ko: "스파", en: "Spa" },
        golf: { ko: "골프 예약", en: "Golf Booking" },
        roomService: { ko: "룸서비스", en: "Room Service" },
        minibar: { ko: "미니바", en: "Minibar" },
        laundry: { ko: "세탁", en: "Laundry" }
    };
    const SERVICE_NAME_TO_KEY = {
        "스파": "spa",
        "Spa": "spa",
        "골프 예약": "golf",
        "Golf Booking": "golf",
        "룸서비스": "roomService",
        "Room Service": "roomService",
        "미니바": "minibar",
        "Minibar": "minibar",
        "세탁": "laundry",
        "Laundry": "laundry"
    };

    const DEFAULT_SERVICE_DATA = [];

    const WEEKLY_SERVICE_DATA = [];

    const FALLBACK_DASHBOARD_DATA = { weekData: [], monthData: [], svcData: [] };

    let weekData = [];
    let monthData = [];
    let currentLang = window.currentLang || localStorage.getItem("pms_lang") || "ko";
    window.svcData = [];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function isBrokenText(value) {
        return !value || /[?�]/.test(String(value));
    }

    function tr(key) {
        return typeof window.t === "function" ? window.t(key) : key;
    }

    function serviceKey(service, index) {
        return service.key || SERVICE_NAME_TO_KEY[service.name] || DEFAULT_SERVICE_DATA[index]?.key || "roomService";
    }

    function serviceLabel(service, index) {
        const key = serviceKey(service, index);
        return SERVICE_LABELS[key]?.[currentLang === "en" ? "en" : "ko"] || service.name;
    }

    function normalizeDashboardData(data) {
        const fallback = clone(FALLBACK_DASHBOARD_DATA);
        const next = data && typeof data === "object" ? data : fallback;
        const serviceDefaults = DEFAULT_SERVICE_DATA;

        return {
            weekData: (next.weekData && next.weekData.length ? next.weekData : fallback.weekData).map((item) => ({
                day: item.day,
                label: isBrokenText(item.label) ? (DAY_LABELS[item.day] || item.day) : item.label,
                occ: Number(item.occ || 0),
                prev: Number(item.prev || 0)
            })),
            monthData: (next.monthData && next.monthData.length ? next.monthData : fallback.monthData).map((item) => ({
                day: item.day,
                occ: Number(item.occ || 0)
            })),
            svcData: (next.svcData && next.svcData.length ? next.svcData : fallback.svcData).map((item, index) => ({
                key: item.key || SERVICE_NAME_TO_KEY[item.name] || serviceDefaults[index]?.key || "roomService",
                name: isBrokenText(item.name) ? serviceDefaults[index]?.name || `서비스 ${index + 1}` : item.name,
                val: Number(item.val || 0),
                pct: Number(item.pct || 0),
                icon: item.icon || serviceDefaults[index]?.icon || "fa-circle",
                color: item.color || serviceDefaults[index]?.color || "#2563EB"
            }))
        };
    }

    async function loadDashboardData() {
        if (location.protocol === "file:") {
            return normalizeDashboardData(null);
        }
        const response = await fetch("data/dashboard/dashboard.json", { cache: "no-store" });
        if (!response.ok) throw new Error(`Dashboard data load failed: ${response.status}`);
        return normalizeDashboardData(await response.json());
    }

    function renderRoomChart(data, isMonthly) {
        const chart = document.getElementById("barChart");
        const tableCard = document.getElementById("weeklyTableCard");
        const table = document.getElementById("weeklyTable");
        const title = document.getElementById("roomChartTitle");
        if (!chart) return;

        const isEn = currentLang === "en";
        if (title) {
            title.innerHTML = `<i class="fa-solid fa-chart-column"></i> ${isMonthly ? (isEn ? "Monthly" : "월간") : (isEn ? "Weekly" : "주간")} ${isEn ? "Room Status" : "객실 현황"}`;
        }

        chart.innerHTML = "";
        if (table) table.innerHTML = "";
        if (tableCard) tableCard.style.display = isMonthly ? "none" : "";

        const row = document.getElementById("roomChartRow");
        if (row) row.style.gridTemplateColumns = isMonthly ? "1fr" : "2fr 1fr";

        if (isMonthly) {
            chart.style.cssText = "height:220px;width:100%;overflow-x:auto;overflow-y:hidden;display:block";
            const maxVal = Math.max(...data.map((item) => item.occ), 1);
            const inner = document.createElement("div");
            const minWidth = 32 * data.length;
            inner.style.cssText = `display:flex;align-items:flex-end;gap:3px;height:100%;width:${minWidth > chart.offsetWidth ? `${minWidth}px` : "100%"};min-width:100%`;

            data.forEach((item) => {
                const bar = document.createElement("div");
                bar.style.cssText = "flex:1;min-width:28px;display:flex;flex-direction:column;align-items:center;height:100%;cursor:pointer";
                const tooltipTitle = `${tr("Monthly Room Statistics")} - ${item.day}`;
                const tooltipContent = `
                    <div style="display:flex;justify-content:space-between;gap:20px"><span>${tr("Active Rooms")}:</span><strong style="color:var(--primary)">${item.occ}</strong></div>
                    <div style="display:flex;justify-content:space-between;gap:20px"><span>${tr("Occupancy Rate")}:</span><strong>${(item.occ / 150 * 100).toFixed(1)}%</strong></div>`;
                bar.innerHTML = `
                    <div style="font-size:.56rem;font-weight:700;color:var(--txt);flex-shrink:0;margin-bottom:2px">${item.occ}</div>
                    <div style="flex:1;width:100%;display:flex;align-items:flex-end">
                        <div style="height:${Math.round(item.occ / maxVal * 100)}%;width:100%;background:var(--primary);border-radius:3px 3px 0 0;transition:opacity .2s"></div>
                    </div>
                    <div style="font-size:.56rem;color:var(--txt2);margin-top:3px;flex-shrink:0">${item.day}</div>`;
                attachChartTooltip(bar, tooltipTitle, tooltipContent);
                inner.appendChild(bar);
            });
            chart.appendChild(inner);
            return;
        }

        chart.style.cssText = "width:100%;height:200px;display:flex;align-items:flex-end;gap:6px;overflow:visible";
        const maxVal = Math.max(...data.map((item) => Math.max(item.occ, item.prev)), 1);

        data.forEach((item) => {
            const occHeight = Math.round(item.occ / maxVal * 100);
            const prevHeight = Math.round(item.prev / maxVal * 100);
            const diff = item.occ - item.prev;
            const isUp = diff >= 0;
            const group = document.createElement("div");
            group.style.cssText = "flex:1;display:flex;flex-direction:column;align-items:center;height:100%;cursor:pointer";
            const displayLabel = isEn ? item.day : item.label;
            const tooltipTitle = `${tr("Weekly Room Statistics")} - ${displayLabel}`;
            const tooltipContent = `
                <div style="display:flex;justify-content:space-between;gap:20px"><span>${tr("This Week")}:</span><strong style="color:var(--primary)">${item.occ}</strong></div>
                <div style="display:flex;justify-content:space-between;gap:20px"><span>${tr("Last Week")}:</span><strong style="color:#D1D5DB">${item.prev}</strong></div>
                <div style="display:flex;justify-content:space-between;gap:20px;margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,.1)"><span>${tr("vs Last Week")}:</span><strong style="color:${isUp ? "#10B981" : "#EF4444"}">${isUp ? "+" : ""}${diff}</strong></div>`;
            group.innerHTML = `
                <div style="flex:1;width:100%;display:flex;align-items:flex-end;gap:2px">
                    <div style="flex:1;height:${occHeight}%;background:var(--primary);border-radius:3px 3px 0 0;transition:opacity .2s"></div>
                    <div style="flex:1;height:${prevHeight}%;background:#D1D5DB;border-radius:3px 3px 0 0;transition:opacity .2s"></div>
                </div>
                <div style="font-size:.65rem;color:var(--txt2);margin-top:4px;flex-shrink:0">${displayLabel}</div>
                <div style="font-size:.58rem;font-weight:600;color:${isUp ? "var(--success)" : "var(--danger)"};margin-top:1px;flex-shrink:0">${isUp ? "+" : ""}${diff}</div>`;
            attachChartTooltip(group, tooltipTitle, tooltipContent);
            chart.appendChild(group);
        });

        if (!table) return;
        const total = data.reduce((sum, item) => ({ occ: sum.occ + item.occ, prev: sum.prev + item.prev }), { occ: 0, prev: 0 });
        [...data, { label: isEn ? "Total" : "합계", day: "Total", occ: total.occ, prev: total.prev, isTotal: true }].forEach((item) => {
            const diff = item.occ - item.prev;
            const isUp = diff >= 0;
            const card = document.createElement("div");
            if (item.isTotal) {
                card.style.cssText = "display:flex;flex-direction:column;justify-content:center;align-items:center;padding:10px 6px;border-radius:10px;background:linear-gradient(135deg,var(--primary) 0%,#2563EB 100%);text-align:center";
                card.innerHTML = `<div style="font-size:.85rem;font-weight:700;color:rgba(255,255,255,.85);margin-bottom:4px">${item.label}</div><div style="font-size:1.7rem;font-weight:800;color:#fff;line-height:1">${item.occ}</div><div style="margin-top:5px;padding:2px 8px;border-radius:20px;font-size:.72rem;font-weight:700;background:rgba(255,255,255,.2);color:#fff">${isUp ? "+" : ""}${diff}</div>`;
            } else {
                const isSat = item.day === "Sat";
                const isSun = item.day === "Sun";
                const labelColor = isSat ? "#3B82F6" : isSun ? "#EF4444" : "var(--txt2)";
                const cardBg = isSat ? "rgba(59,130,246,.07)" : isSun ? "rgba(239,68,68,.07)" : "var(--bg)";
                const borderColor = isSat ? "rgba(59,130,246,.25)" : isSun ? "rgba(239,68,68,.25)" : "transparent";
                card.style.cssText = `display:flex;flex-direction:column;justify-content:center;align-items:center;padding:10px 6px;border-radius:10px;background:${cardBg};border:1px solid ${borderColor};text-align:center`;
                card.innerHTML = `<div style="font-size:.9rem;font-weight:800;color:${labelColor};margin-bottom:4px">${isEn ? item.day : item.label}</div><div style="font-size:1.35rem;font-weight:800;color:var(--txt);line-height:1">${item.occ}</div><div style="margin-top:5px;padding:2px 8px;border-radius:20px;font-size:.68rem;font-weight:700;background:${isUp ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)"};color:${isUp ? "var(--success)" : "var(--danger)"}">${isUp ? "+" : ""}${diff}</div>`;
            }
            table.appendChild(card);
        });
    }

    function renderServiceBreakdown(data) {
        const list = document.getElementById("svcBreakdown");
        if (!list) return;
        list.innerHTML = "";
        data.forEach((service) => {
            const row = document.createElement("div");
            row.className = "svc-row";
            row.style.cursor = "pointer";
            const label = serviceLabel(service, data.indexOf(service));
            const tooltipTitle = `${tr("Ancillary Rev")} - ${label}`;
            const tooltipContent = `
                <div style="display:flex;justify-content:space-between;gap:20px"><span>${tr("Revenue Amount")}:</span><strong style="color:${service.color}">$${service.val.toLocaleString()}</strong></div>
                <div style="display:flex;justify-content:space-between;gap:20px"><span>${tr("Share")}:</span><strong>${service.pct}%</strong></div>`;
            row.innerHTML = `
                <div class="svc-icon" style="background:${service.color}1A;color:${service.color}"><i class="fa-solid ${service.icon}"></i></div>
                <div class="svc-name">${label}</div>
                <div class="svc-bar-bg"><div class="svc-bar" style="width:${service.pct}%;background:${service.color}"></div></div>
                <div class="svc-val">$${service.val.toLocaleString()}</div>`;
            attachChartTooltip(row, tooltipTitle, tooltipContent);
            list.appendChild(row);
        });
    }

    function attachChartTooltip(element, title, content) {
        element.tabIndex = 0;
        const show = (event) => {
            if (typeof window.showChartDataLayer === "function") {
                window.showChartDataLayer(event, title, content);
            } else if (typeof window.toggleChartDataLayer === "function") {
                window.toggleChartDataLayer(event, title, content);
            }
        };
        const move = (event) => {
            if (typeof window.positionChartDataLayer === "function") {
                window.positionChartDataLayer(event);
            }
        };
        const hide = () => {
            if (typeof window.hideChartDataLayer === "function") window.hideChartDataLayer();
        };
        element.addEventListener("mouseenter", show);
        element.addEventListener("mousemove", move);
        element.addEventListener("mouseleave", hide);
        element.addEventListener("focus", show);
        element.addEventListener("blur", hide);
        element.addEventListener("click", show);
    }

    function toggleAncillary(isWeekly) {
        const total = document.getElementById("ancillaryTotal");
        const label = document.getElementById("ancillaryLabel");
        const data = isWeekly ? WEEKLY_SERVICE_DATA : window.svcData;
        if (total) total.textContent = isWeekly ? "$8,450" : "$1,285";
        if (label) label.textContent = isWeekly ? tr("Weekly Ancillary Revenue") : tr("Today's Ancillary Revenue");
        renderServiceBreakdown(data);
    }
    window.toggleAncillary = toggleAncillary;

    window.addEventListener("languagechange", () => {
        currentLang = window.currentLang || localStorage.getItem("pms_lang") || currentLang;
        renderRoomChart(document.querySelector("#roomChartBtns button:nth-child(2)")?.classList.contains("active") ? monthData : weekData, document.querySelector("#roomChartBtns button:nth-child(2)")?.classList.contains("active"));
        renderServiceBreakdown(window.svcData);
    });
    document.addEventListener("change", (event) => {
        if (event.target && event.target.id === "langSelect") {
            currentLang = event.target.value;
            window.dispatchEvent(new Event("languagechange"));
        }
    });

    window.toggleMenu = window.toggleMenu || function () {
        document.querySelector(".sidebar")?.classList.toggle("active");
        document.querySelector(".sidebar-overlay")?.classList.toggle("active");
    };

    window.toggleNotifications = window.toggleNotifications || function (event) {
        event?.stopPropagation();
        document.getElementById("notifDropdown")?.classList.toggle("active");
    };

    document.addEventListener("click", function (event) {
        const dropdown = document.getElementById("notifDropdown");
        const wrap = document.querySelector(".notif-wrap");
        if (dropdown?.classList.contains("active") && wrap && !wrap.contains(event.target)) {
            dropdown.classList.remove("active");
        }
    });

    document.addEventListener("DOMContentLoaded", async () => {
        try {
            const data = await loadDashboardData();
            weekData = data.weekData;
            monthData = data.monthData;
            window.svcData = data.svcData;
        } catch (error) {
            console.warn("Dashboard data fallback used", error);
            const fallback = normalizeDashboardData(FALLBACK_DASHBOARD_DATA);
            weekData = fallback.weekData;
            monthData = fallback.monthData;
            window.svcData = fallback.svcData;
        }

        renderRoomChart(weekData, false);
        renderServiceBreakdown(window.svcData);

        document.querySelectorAll("#roomChartBtns button").forEach((button, index) => {
            button.addEventListener("click", () => {
                document.querySelectorAll("#roomChartBtns button").forEach((item) => item.classList.remove("active"));
                button.classList.add("active");
                renderRoomChart(index === 1 ? monthData : weekData, index === 1);
            });
        });
    });
})();
