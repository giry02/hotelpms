import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");
const outputDir = path.join(root, "outputs", "erd");
const { chromium } = await import(pathToFileURL(path.join(root, "node_modules", "playwright", "index.mjs")).href);

const paths = {
  svg: path.join(outputDir, "Hotel_PMS_Logical_ERD.svg"),
  png: path.join(outputDir, "Hotel_PMS_Logical_ERD.png"),
  html: path.join(outputDir, "Hotel_PMS_Logical_ERD.html"),
  mermaid: path.join(outputDir, "Hotel_PMS_Logical_ERD.mmd"),
};

const areas = {
  platform: { title: "플랫폼 관리", color: "#4F46E5", fill: "#EEF2FF" },
  hotel: { title: "호텔 운영 기준정보", color: "#0F766E", fill: "#ECFDF5" },
  sales: { title: "예약 / 고객 / 단체", color: "#B45309", fill: "#FFF7ED" },
  ops: { title: "운영 / 정산 / 지원", color: "#2563EB", fill: "#EFF6FF" },
};

const entities = [
  {
    id: "platformAccount",
    title: "플랫폼 관리자",
    subtitle: "Super Admin 계정",
    area: "platform",
    x: 80,
    y: 160,
    attrs: ["관리자", "역할", "계정상태"],
  },
  {
    id: "tenant",
    title: "입점 호텔",
    subtitle: "PMS 사용 호텔",
    area: "platform",
    x: 390,
    y: 160,
    attrs: ["호텔명", "국가/도시", "운영상태", "기본통화"],
  },
  {
    id: "subscription",
    title: "구독/계약",
    subtitle: "플랜 및 계약기간",
    area: "platform",
    x: 700,
    y: 160,
    attrs: ["플랜", "계약기간", "청구상태"],
  },
  {
    id: "adCampaign",
    title: "광고 캠페인",
    subtitle: "플랫폼 광고",
    area: "platform",
    x: 1010,
    y: 160,
    attrs: ["광고주", "집행기간", "타겟", "성과"],
  },
  {
    id: "audit",
    title: "감사 로그",
    subtitle: "변경/접근 이력",
    area: "platform",
    x: 1320,
    y: 160,
    attrs: ["행위자", "작업", "발생시각"],
  },
  {
    id: "building",
    title: "동/건물",
    subtitle: "호텔 내 공간 단위",
    area: "hotel",
    x: 80,
    y: 510,
    attrs: ["건물명", "층수", "사용여부"],
  },
  {
    id: "roomType",
    title: "객실 유형",
    subtitle: "판매/요금 기준",
    area: "hotel",
    x: 390,
    y: 510,
    attrs: ["유형명", "기준/최대인원", "기본요금"],
  },
  {
    id: "room",
    title: "객실",
    subtitle: "실제 객실",
    area: "hotel",
    x: 700,
    y: 510,
    attrs: ["객실번호", "프론트상태", "청소상태"],
  },
  {
    id: "ratePolicy",
    title: "요금 정책",
    subtitle: "일자별/계약 요금",
    area: "hotel",
    x: 1010,
    y: 510,
    attrs: ["숙박일", "요금", "통화", "정책구분"],
  },
  {
    id: "staffRole",
    title: "직원/권한",
    subtitle: "운영 사용자 RBAC",
    area: "hotel",
    x: 1320,
    y: 510,
    attrs: ["직원", "부서", "역할", "메뉴권한"],
  },
  {
    id: "guest",
    title: "고객",
    subtitle: "투숙객 프로필",
    area: "sales",
    x: 80,
    y: 880,
    attrs: ["성명", "연락처", "국적", "문서상태"],
  },
  {
    id: "membership",
    title: "멤버십",
    subtitle: "VIP 등급/혜택",
    area: "sales",
    x: 390,
    y: 880,
    attrs: ["등급", "승급기준", "혜택"],
  },
  {
    id: "company",
    title: "B2B 업체",
    subtitle: "기업/여행사",
    area: "sales",
    x: 700,
    y: 880,
    attrs: ["업체명", "계약조건", "정산방식"],
  },
  {
    id: "groupEvent",
    title: "단체/행사",
    subtitle: "행사 및 객실 블록",
    area: "sales",
    x: 1010,
    y: 880,
    attrs: ["행사명", "투숙기간", "블록수", "상태"],
  },
  {
    id: "reservation",
    title: "예약",
    subtitle: "개별/단체 투숙 예약",
    area: "sales",
    x: 545,
    y: 1210,
    attrs: ["체크인/아웃", "예약상태", "채널", "예상금액"],
  },
  {
    id: "allocation",
    title: "객실 배정",
    subtitle: "룸잉/배정 결과",
    area: "sales",
    x: 1010,
    y: 1210,
    attrs: ["배정객실", "투숙객", "배정상태"],
  },
  {
    id: "folio",
    title: "Folio",
    subtitle: "투숙 정산 장부",
    area: "ops",
    x: 80,
    y: 1600,
    attrs: ["정산상태", "잔액", "청구대상"],
  },
  {
    id: "charge",
    title: "청구 항목",
    subtitle: "객실료/서비스/세금",
    area: "ops",
    x: 390,
    y: 1600,
    attrs: ["항목", "금액", "반영시각"],
  },
  {
    id: "payment",
    title: "결제",
    subtitle: "수납/환불",
    area: "ops",
    x: 700,
    y: 1600,
    attrs: ["결제수단", "승인번호", "금액"],
  },
  {
    id: "serviceOrder",
    title: "부가서비스 주문",
    subtitle: "POS/골프/렌터카/룸서비스",
    area: "ops",
    x: 1010,
    y: 1600,
    attrs: ["서비스유형", "주문상태", "금액"],
  },
  {
    id: "housekeeping",
    title: "하우스키핑 작업",
    subtitle: "청소/점검 업무",
    area: "ops",
    x: 1320,
    y: 1480,
    attrs: ["작업상태", "담당자", "예정시각"],
  },
  {
    id: "maintenance",
    title: "시설 보수",
    subtitle: "수리 요청/처리",
    area: "ops",
    x: 1320,
    y: 1720,
    attrs: ["요청내용", "우선순위", "처리상태"],
  },
  {
    id: "nightAudit",
    title: "일일 마감",
    subtitle: "영업일 정산 확정",
    area: "ops",
    x: 390,
    y: 1920,
    attrs: ["마감일", "매출", "미수", "마감상태"],
  },
  {
    id: "noticeSupport",
    title: "공지/지원",
    subtitle: "공지사항 및 문의",
    area: "ops",
    x: 1010,
    y: 1920,
    attrs: ["게시범위", "문의유형", "처리상태"],
  },
];

const relations = [
  ["platformAccount", "tenant", "관리", "1:N"],
  ["tenant", "subscription", "계약", "1:N"],
  ["tenant", "adCampaign", "노출 대상", "N:M"],
  ["tenant", "audit", "이력 보유", "1:N"],
  ["tenant", "building", "보유", "1:N"],
  ["tenant", "roomType", "정의", "1:N"],
  ["building", "room", "포함", "1:N"],
  ["roomType", "room", "분류", "1:N"],
  ["roomType", "ratePolicy", "요금 적용", "1:N"],
  ["tenant", "staffRole", "사용자 운영", "1:N"],
  ["tenant", "guest", "고객 보유", "1:N"],
  ["membership", "guest", "등급 부여", "1:N"],
  ["tenant", "company", "거래처 관리", "1:N"],
  ["company", "groupEvent", "주관/계약", "1:N"],
  ["guest", "reservation", "예약자", "1:N"],
  ["room", "reservation", "객실 지정", "1:N"],
  ["roomType", "reservation", "유형 예약", "1:N"],
  ["groupEvent", "reservation", "단체 예약", "1:N"],
  ["groupEvent", "allocation", "룸잉 구성", "1:N"],
  ["reservation", "allocation", "배정", "1:N"],
  ["room", "allocation", "객실 배정", "1:N"],
  ["reservation", "folio", "정산 생성", "1:1"],
  ["guest", "folio", "청구 대상", "1:N"],
  ["folio", "charge", "항목 포함", "1:N"],
  ["folio", "payment", "수납", "1:N"],
  ["reservation", "serviceOrder", "서비스 주문", "1:N"],
  ["folio", "serviceOrder", "청구 연결", "1:N"],
  ["room", "housekeeping", "청소 작업", "1:N"],
  ["room", "maintenance", "보수 요청", "1:N"],
  ["staffRole", "housekeeping", "담당", "1:N"],
  ["staffRole", "maintenance", "담당", "1:N"],
  ["tenant", "nightAudit", "영업일 마감", "1:N"],
  ["tenant", "noticeSupport", "공지/문의", "1:N"],
];

const entityById = new Map(entities.map((entity) => [entity.id, entity]));

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function center(entity) {
  return { x: entity.x + 125, y: entity.y + 72 };
}

function anchor(from, to) {
  const a = center(from);
  const b = center(to);
  const w = 250;
  const h = 132;
  if (Math.abs(a.x - b.x) > Math.abs(a.y - b.y)) {
    return {
      start: { x: a.x < b.x ? from.x + w : from.x, y: a.y },
      end: { x: a.x < b.x ? to.x : to.x + w, y: b.y },
    };
  }
  return {
    start: { x: a.x, y: a.y < b.y ? from.y + h : from.y },
    end: { x: b.x, y: a.y < b.y ? to.y : to.y + h },
  };
}

function relationPath(from, to) {
  const { start, end } = anchor(from, to);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const curve = Math.abs(start.x - end.x) > Math.abs(start.y - end.y)
    ? `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`
    : `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
  return { curve, midX, midY };
}

function renderEntity(entity) {
  const area = areas[entity.area];
  return `
    <g class="entity">
      <rect x="${entity.x}" y="${entity.y}" width="250" height="132" rx="16" fill="#FFFFFF" stroke="${area.color}" stroke-width="1.3" filter="url(#shadow)" />
      <rect x="${entity.x}" y="${entity.y}" width="250" height="42" rx="16" fill="${area.color}" />
      <path d="M ${entity.x} ${entity.y + 28} L ${entity.x + 250} ${entity.y + 28} L ${entity.x + 250} ${entity.y + 42} L ${entity.x} ${entity.y + 42} Z" fill="${area.color}" />
      <text x="${entity.x + 16}" y="${entity.y + 25}" class="entity-title">${esc(entity.title)}</text>
      <text x="${entity.x + 16}" y="${entity.y + 62}" class="entity-subtitle">${esc(entity.subtitle)}</text>
      ${entity.attrs.map((attr, index) => `
        <text x="${entity.x + 20}" y="${entity.y + 84 + index * 16}" class="attr">• ${esc(attr)}</text>
      `).join("")}
    </g>`;
}

function renderRelation(rel, index) {
  const [fromId, toId, verb, card] = rel;
  const from = entityById.get(fromId);
  const to = entityById.get(toId);
  const { curve, midX, midY } = relationPath(from, to);
  const color = index % 2 === 0 ? "#64748B" : "#94A3B8";
  return `
    <g class="relation">
      <path d="${curve}" fill="none" stroke="${color}" stroke-width="1.45" opacity="0.72" marker-end="url(#arrow)" />
      <rect x="${midX - 52}" y="${midY - 16}" width="104" height="30" rx="15" fill="#FFFFFF" stroke="#E2E8F0" opacity="0.96" />
      <text x="${midX}" y="${midY - 2}" class="rel-card">${esc(card)}</text>
      <text x="${midX}" y="${midY + 11}" class="rel-verb">${esc(verb)}</text>
    </g>`;
}

function renderSvg() {
  const width = 1640;
  const height = 2200;
  const bands = [
    ["platform", 40, 110, 1560, 255],
    ["hotel", 40, 430, 1560, 275],
    ["sales", 40, 790, 1560, 560],
    ["ops", 40, 1410, 1560, 600],
  ].map(([key, x, y, w, h]) => {
    const area = areas[key];
    return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${area.fill}" stroke="${area.color}" stroke-width="1.1" opacity="0.72" />
      <text x="${x + 22}" y="${y + 34}" class="band-title" fill="${area.color}">${esc(area.title)}</text>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#0F172A" flood-opacity="0.11" />
    </filter>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 0 0 L 8 4 L 0 8 z" fill="#64748B" />
    </marker>
    <style>
      .title { font: 900 32px "Noto Sans KR", "Segoe UI", Arial, sans-serif; fill:#0F172A; }
      .subtitle { font: 700 14px "Noto Sans KR", "Segoe UI", Arial, sans-serif; fill:#475569; }
      .band-title { font: 900 17px "Noto Sans KR", "Segoe UI", Arial, sans-serif; }
      .entity-title { font: 900 15px "Noto Sans KR", "Segoe UI", Arial, sans-serif; fill:#FFFFFF; }
      .entity-subtitle { font: 800 12px "Noto Sans KR", "Segoe UI", Arial, sans-serif; fill:#334155; }
      .attr { font: 600 11px "Noto Sans KR", "Segoe UI", Arial, sans-serif; fill:#475569; }
      .rel-card { font: 900 10px "Segoe UI", Arial, sans-serif; fill:#334155; text-anchor:middle; }
      .rel-verb { font: 700 10px "Noto Sans KR", "Segoe UI", Arial, sans-serif; fill:#64748B; text-anchor:middle; }
      .legend { font: 800 12px "Noto Sans KR", "Segoe UI", Arial, sans-serif; fill:#334155; }
    </style>
  </defs>
  <rect width="${width}" height="${height}" fill="#F8FAFC" />
  <text x="58" y="54" class="title">Hotel PMS 논리 ERD</text>
  <text x="58" y="82" class="subtitle">업무 개념 중심 데이터 모델 · 컬럼 타입/물리 PK/FK 제외 · 운영 DB 설계 전 단계</text>
  <g transform="translate(950 34)">
    ${Object.entries(areas).map(([key, area], index) => `
      <rect x="${index * 162}" y="0" width="16" height="16" rx="4" fill="${area.color}" />
      <text x="${index * 162 + 24}" y="13" class="legend">${esc(area.title)}</text>
    `).join("")}
  </g>
  ${bands}
  <g>${relations.map(renderRelation).join("")}</g>
  <g>${entities.map(renderEntity).join("")}</g>
  <text x="58" y="2076" class="subtitle">논리도 기준: 엔티티는 업무 대상, 속성은 대표 속성만 표기했습니다. 실제 컬럼명/타입/인덱스는 물리 ERD와 테이블 정의서에서 확정합니다.</text>
</svg>`;
}

function renderMermaid() {
  const lines = ["erDiagram"];
  for (const entity of entities) {
    const name = entity.title.replace(/[ /]/g, "_");
    lines.push(`  ${name} {`);
    for (const attr of entity.attrs) lines.push(`    string ${attr.replace(/[ /]/g, "_")}`);
    lines.push("  }");
  }
  for (const [fromId, toId, verb, card] of relations) {
    const from = entityById.get(fromId).title.replace(/[ /]/g, "_");
    const to = entityById.get(toId).title.replace(/[ /]/g, "_");
    const mermaidRel = card === "1:1" ? "||--||" : card === "N:M" ? "}o--o{" : "||--o{";
    lines.push(`  ${from} ${mermaidRel} ${to} : "${verb}"`);
  }
  return lines.join("\n");
}

async function renderPng(svg) {
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>html,body{margin:0;background:#f8fafc}svg{display:block}</style></head><body>${svg}</body></html>`;
  await fs.writeFile(paths.html, html, "utf8");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1640, height: 2200 }, deviceScaleFactor: 1 });
  await page.goto(`file://${paths.html.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: paths.png, fullPage: true });
  await browser.close();
}

await fs.mkdir(outputDir, { recursive: true });
const svg = renderSvg();
await fs.writeFile(paths.svg, svg, "utf8");
await fs.writeFile(paths.mermaid, renderMermaid(), "utf8");
await renderPng(svg);

console.log(JSON.stringify({ outputDir, entities: entities.length, relations: relations.length, files: paths }, null, 2));
