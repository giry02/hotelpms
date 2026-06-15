// Dashboard chart renderer. Data is derived from the same API resources used by the operational screens.
(function () {
    const DAY_LABELS = {
        Mon: "월", Tue: "화", Wed: "수", Thu: "목", Fri: "금", Sat: "토", Sun: "일"
    };
    const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const SERVICE_META = {
        pos: { ko: "통합 POS", en: "POS", icon: "fa-cash-register", color: "#10B981" },
        golf: { ko: "골프장", en: "Golf", icon: "fa-golf-ball-tee", color: "#8B5CF6" },
        car: { ko: "렌트카", en: "Rent-a-car", icon: "fa-car", color: "#F59E0B" }
    };

    let weekData = [];
    let monthData = [];
    let weeklySvcData = [];
    let ancillaryWeeklyActive = false;
    let currentLang = window.currentLang || localStorage.getItem("pms_lang") || "ko";
    window.svcData = [];

    function tr(key) {
        return typeof window.t === "function" ? window.t(key) : key;
    }

    function serviceKey(service) {
        return service.key || "pos";
    }

    function serviceLabel(service) {
        const key = serviceKey(service);
        return SERVICE_META[key]?.[currentLang === "en" ? "en" : "ko"] || service.name || key;
    }

    function formatMoney(amount) {
        const value = Math.round(Number(amount || 0));
        return typeof window.pmsFormatCurrency === "function"
            ? window.pmsFormatCurrency(value)
            : `₱${value.toLocaleString("en-US")}`;
    }

    function apiItems(envelope) {
        if (Array.isArray(envelope)) return envelope;
        if (Array.isArray(envelope?.data?.items)) return envelope.data.items;
        if (Array.isArray(envelope?.data)) return envelope.data;
        return [];
    }

    function localIso(date) {
        if (!date && window.PmsDate?.todayIso) return window.PmsDate.todayIso();
        date = date || new Date();
        const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return shifted.toISOString().slice(0, 10);
    }

    function parseIso(value) {
        if (!value) return null;
        const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function addDays(isoDate, days) {
        const date = parseIso(isoDate) || new Date();
        date.setDate(date.getDate() + days);
        return localIso(date);
    }

    function latestIso(values) {
        return values
            .map(parseIso)
            .filter(Boolean)
            .sort((a, b) => b - a)[0];
    }

    function latestOccupiedIso(reservations) {
        const dates = [];
        reservations.forEach((reservation) => {
            const status = String(reservation.status || "").toLowerCase();
            if (["cancelled", "canceled", "no-show"].includes(status)) return;
            const checkIn = parseIso(reservation.checkInDate || reservation.checkin || reservation.cin);
            const checkOut = parseIso(reservation.checkOutDate || reservation.checkout || reservation.cout);
            if (!checkIn || !checkOut) return;
            const current = new Date(checkIn);
            let guard = 0;
            while (current < checkOut && guard < 370) {
                dates.push(localIso(current));
                current.setDate(current.getDate() + 1);
                guard += 1;
            }
        });
        const latest = latestIso(dates);
        return latest ? localIso(latest) : "";
    }

    function chooseRoomAnchorIso(reservations) {
        const today = window.PmsDate?.todayIso ? window.PmsDate.todayIso() : localIso();
        if (occupiedCountOn(reservations, today) > 0) return today;
        const latestOccupied = latestOccupiedIso(reservations);
        if (latestOccupied) return latestOccupied;
        const latestReservation = latestIso(reservations.flatMap((reservation) => [
            reservation.checkInDate,
            reservation.checkOutDate
        ]));
        return latestReservation ? localIso(latestReservation) : today;
    }

    function weekStartIso(anchorIso) {
        const date = parseIso(anchorIso) || new Date();
        const daysSinceMonday = (date.getDay() + 6) % 7;
        date.setDate(date.getDate() - daysSinceMonday);
        return localIso(date);
    }

    function dayKey(isoDate) {
        const date = parseIso(isoDate) || new Date();
        return DAY_KEYS[date.getDay()];
    }

    function roomIdOf(reservation) {
        return reservation.roomId || reservation.fullRoom || reservation.roomNo || reservation.room || reservation.id;
    }

    function isActiveStayOn(reservation, isoDate) {
        const status = String(reservation.status || "").toLowerCase();
        if (["cancelled", "canceled", "no-show"].includes(status)) return false;
        const checkIn = parseIso(reservation.checkInDate || reservation.checkin || reservation.cin);
        const checkOut = parseIso(reservation.checkOutDate || reservation.checkout || reservation.cout);
        const target = parseIso(isoDate);
        if (!checkIn || !checkOut || !target) return false;
        return checkIn <= target && target < checkOut;
    }

    function occupiedCountOn(reservations, isoDate) {
        const rooms = new Set();
        reservations.forEach((reservation) => {
            if (isActiveStayOn(reservation, isoDate)) rooms.add(roomIdOf(reservation));
        });
        return rooms.size;
    }

    function buildWeekData(reservations, anchorIso) {
        const weekStart = weekStartIso(anchorIso);
        return Array.from({ length: 7 }, (_, index) => {
            const iso = addDays(weekStart, index);
            const key = dayKey(iso);
            return {
                day: key,
                label: DAY_LABELS[key],
                occ: occupiedCountOn(reservations, iso),
                prev: occupiedCountOn(reservations, addDays(iso, -7))
            };
        });
    }

    function buildMonthData(reservations, anchorIso) {
        const anchor = parseIso(anchorIso) || new Date();
        const year = anchor.getFullYear();
        const month = anchor.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: lastDay }, (_, index) => {
            const date = new Date(year, month, index + 1);
            const iso = localIso(date);
            return {
                day: `${month + 1}/${index + 1}`,
                occ: occupiedCountOn(reservations, iso)
            };
        });
    }

    function trendValue(row, key) {
        const value = row?.[key];
        if (value && typeof value === "object") return Number(value.v || 0);
        return Number(value || 0);
    }

    function normalizeServices(totals) {
        const sum = Object.values(totals).reduce((total, value) => total + Number(value || 0), 0);
        return Object.keys(SERVICE_META).map((key) => ({
            key,
            name: SERVICE_META[key].ko,
            val: Number(totals[key] || 0),
            pct: sum ? Math.round(Number(totals[key] || 0) / sum * 100) : 0,
            icon: SERVICE_META[key].icon,
            color: SERVICE_META[key].color
        }));
    }

    function buildAncillaryServices(trendItems, anchorIso, isWeekly) {
        const dates = new Set(Array.from({ length: isWeekly ? 7 : 1 }, (_, index) => addDays(anchorIso, isWeekly ? index - 6 : 0)));
        const totals = { pos: 0, golf: 0, car: 0 };
        trendItems.forEach((item) => {
            if (!dates.has(item.date)) return;
            Object.keys(totals).forEach((key) => {
                totals[key] += trendValue(item, key);
            });
        });
        return normalizeServices(totals);
    }

    function emptyDashboardData() {
        weeklySvcData = normalizeServices({ pos: 0, golf: 0, car: 0 });
        return {
            weekData: [],
            monthData: [],
            svcData: normalizeServices({ pos: 0, golf: 0, car: 0 })
        };
    }

    async function loadDashboardData() {
        if (!window.PmsMockApi && !window.PmsAPI) return emptyDashboardData();
        const [reservationsResult, trendEnvelope] = await Promise.all([
            window.PmsAPI?.getReservations
                ? window.PmsAPI.getReservations()
                : window.PmsMockApi.request("GET", "/reservations").then(apiItems),
            window.PmsMockApi.request("GET", "/reports/revenue-trend")
        ]);
        const reservations = apiItems(reservationsResult);
        const trendItems = apiItems(trendEnvelope);
        const roomAnchorIso = chooseRoomAnchorIso(reservations);
        const latestTrendDate = latestIso(trendItems.map((item) => item.date));
        const todayIso = window.PmsDate?.todayIso ? window.PmsDate.todayIso() : localIso();
        const hasTodayRevenue = trendItems.some((item) => item.date === todayIso);
        const revenueAnchorIso = hasTodayRevenue ? todayIso : (latestTrendDate ? localIso(latestTrendDate) : roomAnchorIso);
        weeklySvcData = buildAncillaryServices(trendItems, revenueAnchorIso, true);
        return {
            weekData: buildWeekData(reservations, roomAnchorIso),
            monthData: buildMonthData(reservations, roomAnchorIso),
            svcData: buildAncillaryServices(trendItems, revenueAnchorIso, false)
        };
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
        const shareGrid = document.getElementById("svcShareGrid");
        if (!list) return;
        const services = Array.isArray(data) ? data : normalizeServices({ pos: 0, golf: 0, car: 0 });
        list.innerHTML = "";
        if (shareGrid) shareGrid.innerHTML = "";
        services.forEach((service) => {
            const row = document.createElement("div");
            row.className = "svc-row";
            const label = serviceLabel(service);
            const tooltipTitle = `${tr("Ancillary Rev")} - ${label}`;
            const tooltipContent = `
                    <div style="display:flex;justify-content:space-between;gap:20px"><span>${tr("Revenue Amount")}:</span><strong style="color:${service.color}">${formatMoney(service.val)}</strong></div>
                <div style="display:flex;justify-content:space-between;gap:20px"><span>${tr("Share")}:</span><strong>${service.pct}%</strong></div>`;
            row.innerHTML = `
                <div class="svc-icon" style="background:${service.color}1A;color:${service.color}"><i class="fa-solid ${service.icon}"></i></div>
                <div class="svc-bar-bg"><div class="svc-bar" style="width:${service.pct}%;background:${service.color}"></div></div>
                <div class="svc-val">${formatMoney(service.val)}</div>`;
            attachChartTooltip(row, tooltipTitle, tooltipContent);
            list.appendChild(row);

            if (shareGrid) {
                const summary = document.createElement("div");
                summary.className = "svc-share-card";
                summary.innerHTML = `
                    <div class="svc-icon" style="background:${service.color}1A;color:${service.color}"><i class="fa-solid ${service.icon}"></i></div>
                    <div class="svc-share-name">${label}</div>
                    <div class="svc-share">${service.pct}%</div>`;
                attachChartTooltip(summary, tooltipTitle, tooltipContent);
                shareGrid.appendChild(summary);
            }
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
        ancillaryWeeklyActive = Boolean(isWeekly);
        const total = document.getElementById("ancillaryTotal");
        const label = document.getElementById("ancillaryLabel");
        const data = ancillaryWeeklyActive ? weeklySvcData : window.svcData;
        document.querySelectorAll("#ancillaryBtns button").forEach((button, index) => {
            button.classList.toggle("active", index === (ancillaryWeeklyActive ? 1 : 0));
        });
        if (total) total.textContent = formatMoney(data.reduce((sum, service) => sum + service.val, 0));
        if (label) {
            const labelKey = ancillaryWeeklyActive ? "Weekly Ancillary Revenue" : "Today's Ancillary Revenue";
            label.setAttribute("data-i18n-key", labelKey);
            label.textContent = tr(labelKey);
        }
        renderServiceBreakdown(data);
    }
    window.toggleAncillary = toggleAncillary;

    window.addEventListener("languagechange", () => {
        currentLang = window.currentLang || localStorage.getItem("pms_lang") || currentLang;
        renderRoomChart(document.querySelector("#roomChartBtns button:nth-child(2)")?.classList.contains("active") ? monthData : weekData, document.querySelector("#roomChartBtns button:nth-child(2)")?.classList.contains("active"));
        toggleAncillary(ancillaryWeeklyActive);
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
            console.warn("Dashboard API data load failed", error);
            const fallback = emptyDashboardData();
            weekData = fallback.weekData;
            monthData = fallback.monthData;
            window.svcData = fallback.svcData;
        }

        renderRoomChart(weekData, false);
        toggleAncillary(false);

        document.querySelectorAll("#roomChartBtns button").forEach((button, index) => {
            button.addEventListener("click", () => {
                document.querySelectorAll("#roomChartBtns button").forEach((item) => item.classList.remove("active"));
                button.classList.add("active");
                renderRoomChart(index === 1 ? monthData : weekData, index === 1);
            });
        });
    });
})();
