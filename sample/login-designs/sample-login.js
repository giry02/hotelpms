const themeCopy = {
    golf: {
        sceneName: "골프장 배경",
        icon: "fa-hotel"
    },
    beach: {
        sceneName: "해변 배경",
        icon: "fa-hotel"
    },
    resort: {
        sceneName: "리조트 배경",
        icon: "fa-hotel"
    },
    green: {
        sceneName: "그린 풍경 배경",
        icon: "fa-hotel"
    },
    night: {
        sceneName: "로비·야경 배경",
        icon: "fa-hotel"
    }
};

const hotelCopy = {
    title: "Hotel PMS",
    eyebrow: "Cloud Hotel Management",
    lead: "예약 등록부터 객실 현황, 투숙객 관리, 수납과 마감 정산까지 호텔 운영 흐름을 한 화면에서 연결합니다.",
    metrics: [
        { title: "예약 관리", desc: "신규 예약 · 변경 · 체크인" },
        { title: "객실 운영", desc: "투숙 상태 · 청소 · 방 변경" },
        { title: "정산 관리", desc: "예치금 · 다통화 수납 · 마감" }
    ]
};

const layoutCopy = {
    blend: "중앙 정렬형",
    focus: "이미지 포커스형"
};

function renderSampleLogin() {
    const body = document.body;
    const theme = body.dataset.theme || "golf";
    const layout = body.dataset.layout || "blend";
    const copy = themeCopy[theme] || themeCopy.golf;
    const layoutLabel = layoutCopy[layout] || layoutCopy.blend;
    const root = document.getElementById("sampleLoginRoot");
    if (!root) return;

    document.title = `${layoutLabel} - ${copy.sceneName}`;
    root.innerHTML = `
        <a class="back-link" href="index.html"><i class="fa-solid fa-arrow-left"></i> 시안 목록</a>
        <div class="login-scene layout-${layout}">
            <section class="visual-pane">
                <div class="brand-mark">
                    <span class="brand-icon"><i class="fa-solid ${copy.icon}"></i></span>
                    <span>HOTEL PMS</span>
                </div>
                <div class="visual-copy">
                    <span class="visual-eyebrow"><i class="fa-solid fa-star"></i>${hotelCopy.eyebrow}</span>
                    <h1>${hotelCopy.title}</h1>
                    <p>${hotelCopy.lead}</p>
                </div>
                <div class="visual-metrics">
                    ${hotelCopy.metrics.map(item => `<div class="metric"><b>${item.title}</b><span>${item.desc}</span></div>`).join("")}
                </div>
            </section>
            <main class="auth-pane">
                <section class="login-card">
                    <div class="card-top">
                        <div>
                            <h2>로그인</h2>
                            <p>The Grand Saigon 운영 시스템</p>
                        </div>
                        <span class="lang-pill"><i class="fa-solid fa-globe"></i> KR</span>
                    </div>
                    <div class="field">
                        <label>이메일</label>
                        <div class="input-shell">
                            <i class="fa-regular fa-envelope"></i>
                            <input value="admin@hotel.com" aria-label="email">
                        </div>
                    </div>
                    <div class="field">
                        <label>비밀번호</label>
                        <div class="input-shell">
                            <i class="fa-solid fa-lock"></i>
                            <input value="password123!" type="password" aria-label="password">
                            <i class="fa-regular fa-eye"></i>
                        </div>
                    </div>
                    <div class="form-row">
                        <label><input type="checkbox" checked> 로그인 유지</label>
                        <a href="#">비밀번호 재설정</a>
                    </div>
                    <button class="login-button" type="button"><i class="fa-solid fa-right-to-bracket"></i> 로그인</button>
                    <div class="support-strip">
                        <span class="support-chip">예약</span>
                        <span class="support-chip">정산</span>
                        <span class="support-chip">객실</span>
                    </div>
                    <div class="secondary-action">
                        호텔 입점이 필요하신가요? <strong>입점 신청</strong>
                    </div>
                </section>
            </main>
        </div>
    `;
}

renderSampleLogin();
