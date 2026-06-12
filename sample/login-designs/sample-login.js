const themeCopy = {
    golf: {
        title: "Fairway Operations",
        eyebrow: "Golf Resort PMS",
        lead: "골프장 부대시설과 객실 운영을 한 흐름으로 묶는 차분한 그린 톤 로그인입니다.",
        metrics: ["Tee time", "Room folio", "Member care"],
        icon: "fa-golf-ball-tee"
    },
    beach: {
        title: "Coastal Front Desk",
        eyebrow: "Beach Hotel PMS",
        lead: "해변 리조트의 밝은 첫인상을 살리고, 로그인 폼은 선명하게 분리한 타입입니다.",
        metrics: ["Ocean view", "Guest stay", "PHP billing"],
        icon: "fa-water"
    },
    resort: {
        title: "Resort Cloud Desk",
        eyebrow: "Resort PMS",
        lead: "풀빌라와 리조트 운영에 어울리는 따뜻한 톤으로 고급스럽게 구성했습니다.",
        metrics: ["Villa room", "POS charge", "Concierge"],
        icon: "fa-hotel"
    },
    green: {
        title: "Garden Stay Control",
        eyebrow: "Nature Stay PMS",
        lead: "숲과 정원 이미지를 이용해 편안하지만 업무 화면다운 집중감을 유지한 타입입니다.",
        metrics: ["Clean rooms", "Guest list", "Night audit"],
        icon: "fa-leaf"
    },
    night: {
        title: "Night Shift Console",
        eyebrow: "Urban Hotel PMS",
        lead: "로비와 야경 분위기에 맞춘 어두운 배경 위 반투명 업무 콘솔 느낌입니다.",
        metrics: ["Late check-in", "Cash handover", "Audit ready"],
        icon: "fa-city"
    }
};

const layoutCopy = {
    split: "좌측 이미지형",
    blend: "반투명 믹스형"
};

function renderSampleLogin() {
    const body = document.body;
    const theme = body.dataset.theme || "golf";
    const layout = body.dataset.layout || "split";
    const copy = themeCopy[theme] || themeCopy.golf;
    const layoutLabel = layoutCopy[layout] || layoutCopy.split;
    const root = document.getElementById("sampleLoginRoot");
    if (!root) return;

    document.title = `${layoutLabel} - ${copy.eyebrow}`;
    root.innerHTML = `
        <a class="back-link" href="index.html"><i class="fa-solid fa-arrow-left"></i> 시안 목록</a>
        <div class="login-scene layout-${layout}">
            <section class="visual-pane">
                <div class="brand-mark">
                    <span class="brand-icon"><i class="fa-solid ${copy.icon}"></i></span>
                    <span>HOTEL PMS</span>
                </div>
                <div class="visual-copy">
                    <span class="visual-eyebrow"><i class="fa-solid fa-star"></i>${copy.eyebrow}</span>
                    <h1>${copy.title}</h1>
                    <p>${copy.lead}</p>
                </div>
                <div class="visual-metrics">
                    ${copy.metrics.map(item => `<div class="metric"><b>${item}</b><span>운영 핵심 접근</span></div>`).join("")}
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
