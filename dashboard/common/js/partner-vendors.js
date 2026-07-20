(function(){
  const STORAGE_KEY = 'pms_ancillary_vendors';
  const SERVICE_TYPES = ['pos', 'golf', 'rentacar', 'restaurant', 'other'];

  const voucherFieldLabels = {
    guest:'투숙객명', room:'객실번호', date:'이용일시', people:'인원', teeTime:'티오프', course:'골프장/업체명',
    pickup:'픽업 위치', vehicle:'차량/차종', item:'이용 항목', amount:'금액', partnerContact:'업체 연락처', location:'업체 위치', address:'업체 주소',
    benefit:'혜택', terms:'사용 조건', memo:'메모'
  };

  const voucherFieldGroups = {
    pos: [],
    golf: [
      { title:'공통 정보', icon:'fa-circle-info', fields:['guest','room','date','item','amount','partnerContact','address','memo'] },
      { title:'골프장 이용권', icon:'fa-golf-ball-tee', fields:['people','teeTime','course'] }
    ],
    rentacar: [
      { title:'공통 정보', icon:'fa-circle-info', fields:['guest','room','date','item','amount','partnerContact','address','memo'] },
      { title:'렌터카 인수 정보', icon:'fa-car', fields:['pickup','vehicle'] }
    ],
    restaurant: [
      { title:'쿠폰 기본 정보', icon:'fa-ticket', fields:['guest','room','date','item','amount','partnerContact','location','address','benefit','terms','memo'] }
    ],
    other: []
  };

  const initialVoucherFieldsByType = {
    golf: ['guest','room','date','item','people','teeTime','course']
  };

  const seedVendors = [
    {
      id:'POS-HOTEL', type:'pos', name:'호텔 통합 POS', contact:'F&B / Front Desk', contactPerson:'F&B / Front Desk',
      contactPhone:'내선 700', contactEmail:'pos@grandsaigon.local', address:'The Grand Saigon 내부 POS', location:'호텔 내부',
      commission:0, voucherFields:[], logoDataUrl:'',
      campaignTitle:'객실 정산 연결 POS',
      benefit:'객실별 식음/미니바/세탁 주문을 Folio에 바로 반영',
      operatingHours:'24시간 접수, F&B 제공 시간 06:00~23:00',
      usagePeriod:'상시 운영',
      settlementPolicy:'객실 Folio 합산, 체크아웃 정산',
      frontdeskMemo:'투숙 중 객실만 등록합니다. 체크아웃 예정 객실은 Folio 반영 여부를 먼저 확인하세요.',
      bookingGuide:'객실 선택 후 통합 POS 항목을 등록하고, 주문 상태가 완료되면 정산 내역에 반영합니다.',
      detailContentHtml:{
        ko:'<h4>내부 운영 메모</h4><p>통합 POS는 외부 광고 계약 대상이 아니라 호텔 내부 주문을 객실 Folio로 연결하기 위한 운영 항목입니다.</p>',
        en:'<h4>Internal operation note</h4><p>Hotel POS is not an external advertising contract. It connects in-house orders to guest Folios.</p>'
      },
      items:[
        { name:'룸서비스 세트', price:8500, desc:'객실 주문' },
        { name:'미니바 추가', price:1200, desc:'객실 미니바' },
        { name:'영상 서비스', price:1800, desc:'영상/스트리밍' },
        { name:'세탁 서비스', price:950, desc:'객실 세탁 접수' }
      ]
    },
    {
      id:'GOLF-SUNVALLEY', type:'golf', name:'썬밸리 CC', contact:'Kim Manager / +63 917 230 4471',
      contactPerson:'Kim Manager', contactPhone:'+63 917 230 4471', contactEmail:'sales@sunvalleycc.ph',
      address:'Clark Freeport Zone, Pampanga', location:'Clark Freeport Zone', commission:15,
      voucherFields:['guest','room','date','item','people','teeTime','course'], logoDataUrl:'',
      campaignTitle:'제휴 골프장 그린피 혜택',
      benefit:'주중 18홀 그린피 및 카트 패키지 할인',
      operatingHours:'06:00~18:00',
      usagePeriod:'2026-07-01 ~ 2026-08-31',
      settlementPolicy:'프런트 선예약, 이용 후 업체 후불 정산',
      frontdeskMemo:'담당자가 업체 연락처로 제휴 가능 여부, 픽업 제공 범위, 취소 수수료를 먼저 확인해야 합니다.',
      bookingGuide:'담당자에게 연락해 그린피, 카트, 클럽 대여, 픽업 연계 가능 여부를 확인한 뒤 골프장 업체/항목으로 등록합니다.',
      detailContentHtml:{
        ko:'<div class="partner-promo-visual partner-promo-visual--golf"><div class="partner-promo-visual__media"><span>Sunvalley CC</span><strong>VIP & 단체 골프 제휴</strong><p>클락 프리포트에서 즐기는 18홀 라운드</p></div><div class="partner-promo-visual__copy"><small>호텔 제휴 검토용 안내</small><h3>프런트에서 바로 연결 가능한 골프장 제휴 제안</h3><p>단체 고객과 VIP 투숙객의 골프 문의가 들어오면 담당자가 즉시 연락해 티타임, 카트 포함 여부, 취소 조건을 확인할 수 있도록 정리한 광고입니다.</p><div class="partner-promo-visual__chips"><span>주중/주말 그린피 확인</span><span>티타임 사전 협의</span><span>바우처 출력 가능</span></div><ul><li>계약 전 카트 포함 여부와 우천 취소 기준을 확인합니다.</li><li>바우처에는 업체 주소, 연락처, 코스명, 티오프 시간이 표시됩니다.</li><li>계약 확정 후 업체/항목 관리에서 실제 판매 항목으로 등록합니다.</li></ul></div></div>',
        en:'<div class="partner-promo-visual partner-promo-visual--golf"><div class="partner-promo-visual__media"><span>Sunvalley CC</span><strong>VIP & Group Golf Partnership</strong><p>18-hole rounds in Clark Freeport</p></div><div class="partner-promo-visual__copy"><small>Hotel partnership review</small><h3>Golf partner offer ready for front desk follow-up</h3><p>This ad gives hotel staff a clear contact point for group and VIP golf requests, including tee-time confirmation, cart inclusion, and cancellation terms.</p></div></div>'
      },
      items:[
        { name:'18홀 그린피', price:450, desc:'주중 18홀', holes:'18홀', basePeople:4 },
        { name:'카트 이용권', price:70, desc:'팀 단위 카트', holes:'18홀', basePeople:4 },
        { name:'클럽 대여', price:60, desc:'1인 기준', holes:'18홀', basePeople:1 }
      ]
    },
    {
      id:'GOLF-SKY72', type:'golf', name:'스카이72', contact:'Lee Manager / +63 922 558 7811',
      contactPerson:'Lee Manager', contactPhone:'+63 922 558 7811', contactEmail:'partner@sky72golf.ph',
      address:'Andrews Ave, Pasay, Metro Manila', location:'Pasay / Andrews Ave', commission:12,
      voucherFields:['guest','room','date','item','people','teeTime','course'], logoDataUrl:'',
      campaignTitle:'조조 라운드 패키지',
      benefit:'평일 오전 라운드 카트비 할인',
      operatingHours:'05:30~17:30',
      usagePeriod:'2026-07-01 ~ 2026-07-20',
      settlementPolicy:'예약 확정 후 호텔 Folio 청구 또는 현장 결제',
      frontdeskMemo:'조조 라운드 제공 시간, 카트비 포함 여부, 취소 마감 시간을 업체와 먼저 확인해야 합니다.',
      bookingGuide:'담당자에게 연락해 평일 오전 슬롯과 호텔 고객 적용 조건을 확인한 뒤 골프장 업체/항목으로 등록합니다.',
      detailContentHtml:{
        ko:'<div class="partner-promo-visual partner-promo-visual--golf partner-promo-visual--early"><div class="partner-promo-visual__media"><span>Sky72 Golf</span><strong>조조 라운드 패키지</strong><p>이른 출발 고객을 위한 오전 티타임 제안</p></div><div class="partner-promo-visual__copy"><small>호텔 제휴 검토용 안내</small><h3>평일 오전 라운드 문의를 바로 계약 검토로 연결</h3><p>조조 라운드를 원하는 투숙객에게 제공 시간, 카트비 포함 여부, 취소 마감 시간을 확인한 뒤 호텔 조건에 맞는 상품으로 등록할 수 있습니다.</p></div></div>',
        en:'<h4>Early round package</h4><p>Morning tee-time offer for hotel guests.</p>'
      },
      items:[
        { name:'9홀 라운드', price:180, desc:'오전 9홀', holes:'9홀', basePeople:2 },
        { name:'18홀 패키지', price:520, desc:'그린피+카트', holes:'18홀', basePeople:4 }
      ]
    },
    {
      id:'RENT-LOTTE', type:'rentacar', name:'롯데렌터카', contact:'Park Manager / +63 928 410 9930',
      contactPerson:'Park Manager', contactPhone:'+63 928 410 9930', contactEmail:'hotel.sales@lotterent.ph',
      address:'NAIA Terminal 3 Arrival Hall, Pasay', location:'NAIA Terminal 3 / 호텔 로비 픽업', commission:13,
      voucherFields:['guest','room','date','pickup','vehicle','item','amount','partnerContact','address'], logoDataUrl:'',
      campaignTitle:'공항 픽업부터 장기 렌트까지',
      benefit:'공항 픽업 및 장기 투숙객 렌트카 연계 요금',
      operatingHours:'05:00~24:00',
      usagePeriod:'2026-07-01 ~ 2026-08-15',
      settlementPolicy:'호텔 예약 대행 후 월말 업체 정산',
      frontdeskMemo:'차량 종류, 보험 포함 여부, 공항 픽업 가능 시간, 취소 조건을 먼저 확인해야 합니다.',
      bookingGuide:'담당자에게 차량별 요금, 기사 포함 여부, 픽업 장소 지원 범위를 확인한 뒤 렌터카 업체/항목으로 등록합니다.',
      detailContentHtml:{
        ko:'<div class="partner-promo-visual partner-promo-visual--rentacar"><div class="partner-promo-visual__media"><span>Lotte Rent-a-car</span><strong>Airport & City Transfer</strong><p>공항 픽업과 시내 이동을 한 번에</p></div><div class="partner-promo-visual__copy"><small>호텔 제휴 검토용 안내</small><h3>차량 조건과 요금을 바로 비교하는 렌터카 제휴</h3><p>픽업 위치, 차량 등급, 기사 포함 여부를 명확히 확인하고 투숙객 요청에 맞게 예약할 수 있습니다.</p><div class="partner-promo-visual__chips"><span>차량별 금액</span><span>픽업 위치</span><span>기사 포함 확인</span></div></div></div>',
        en:'<h4>Rent-a-car partner offer</h4><p>Vehicle rates and pickup conditions for airport and city transfer requests.</p>'
      },
      items:[
        { name:'세단 기본 대여', price:160, desc:'1시간 기준 단가', vehicleClass:'세단', pickupBase:'호텔 로비' },
        { name:'공항 픽업 기본료', price:90, desc:'편도 기본료', vehicleClass:'세단', pickupBase:'NAIA Terminal 3' },
        { name:'전기차 기본 대여', price:230, desc:'1시간 기준 단가', vehicleClass:'전기차', pickupBase:'호텔 로비' }
      ]
    },
    {
      id:'RENT-SK', type:'rentacar', name:'SK렌터카', contact:'Choi Manager / +63 917 772 9001',
      contactPerson:'Choi Manager', contactPhone:'+63 917 772 9001', contactEmail:'partners@skrent.ph',
      address:'BGC Transport Hub, Taguig', location:'BGC Transport Hub', commission:14,
      voucherFields:['guest','room','date','pickup','vehicle','item','amount','partnerContact','address'], logoDataUrl:'',
      campaignTitle:'시내 투어 차량 제휴',
      benefit:'반나절 시내 투어 차량 및 기사 포함 요금',
      operatingHours:'06:00~22:00',
      usagePeriod:'2026-07-01 ~ 2026-07-31',
      settlementPolicy:'이용 확정 건별 업체 정산',
      frontdeskMemo:'시내 투어 가능 구간, 기사 포함 조건, 초과 시간 요금을 업체와 먼저 확인해야 합니다.',
      bookingGuide:'담당자에게 차량/기사 운영 조건과 호텔 고객 적용 요금을 확인한 뒤 렌터카 업체/항목으로 등록합니다.',
      detailContentHtml:{
        ko:'<h4>광고 제안</h4><p>반나절 시내 투어와 기사 포함 차량 문의를 호텔 담당자가 빠르게 검토할 수 있도록 만든 제휴 광고입니다.</p>',
        en:'<h4>Ad offer</h4><p>This partner ad helps hotel staff review half-day city tour and chauffeur-included vehicle requests.</p>'
      },
      items:[
        { name:'SUV 기본 대여', price:260, desc:'1시간 기준 단가', vehicleClass:'SUV', pickupBase:'BGC Transport Hub' },
        { name:'기사 포함 밴 기본 대여', price:320, desc:'1시간 기준 단가', vehicleClass:'기사 포함 밴', pickupBase:'호텔 로비' }
      ]
    },
    {
      id:'REST-RIVERSIDE', type:'restaurant', name:'리버사이드 비스트로', contact:'Minh Nguyen / +84 90 118 2233',
      contactPerson:'Minh Nguyen', contactPhone:'+84 90 118 2233', contactEmail:'partners@riversidebistro.vn',
      address:'12 Nguyen Hue St, District 1, Ho Chi Minh City', location:'호텔 도보 6분 / Nguyen Hue St', commission:8,
      voucherFields:[], logoDataUrl:'',
      campaignTitle:'투숙객 전용 레스토랑 디너 혜택',
      benefit:'디너 세트, 웰컴 디저트, 패밀리 메뉴 제휴 할인',
      operatingHours:'11:30~22:30',
      usagePeriod:'2026-07-01 ~ 2026-08-31',
      settlementPolicy:'프런트 예약 확인 후 업체 후불 정산',
      frontdeskMemo:'방문 시간, 인원, 좌석 가능 여부, 쿠폰 적용 메뉴를 업체 담당자에게 먼저 확인합니다.',
      bookingGuide:'담당자에게 연락해 메뉴와 좌석 가능 여부를 확인한 뒤 음식점 업체/항목으로 등록합니다.',
      detailContentHtml:{
        ko:'<div class="partner-promo-visual partner-promo-visual--restaurant"><div class="partner-promo-visual__media"><span>Riverside Bistro</span><strong>호텔 투숙객 디너 혜택</strong><p>도심 야경과 함께하는 제휴 메뉴</p></div><div class="partner-promo-visual__copy"><small>호텔 제휴 검토용 안내</small><h3>프런트에서 바로 안내 가능한 주변 음식점 혜택</h3><p>투숙객에게 위치, 운영 시간, 메뉴별 가격을 한 번에 안내하고 예약 또는 쿠폰 적용 여부를 확인할 수 있습니다.</p><div class="partner-promo-visual__chips"><span>위치 안내</span><span>메뉴 금액 표시</span><span>제휴 할인</span></div><ul><li>대표 메뉴와 금액을 항목별로 관리합니다.</li><li>방문 전 좌석 가능 여부와 적용 조건을 확인합니다.</li><li>단체 식사 요청은 담당자 연락처와 함께 남깁니다.</li></ul></div></div>',
        en:'<h4>Restaurant partner offer</h4><p>Shows guest-facing restaurant location, menu prices, and benefit details for front desk booking support.</p>'
      },
      items:[
        { name:'디너 세트 2인', price:260, desc:'투숙객 전용 메뉴', benefit:'호텔 투숙객 디저트 2개 무료', terms:'방문 전 예약 필수, 쿠폰 1매당 1회 사용' },
        { name:'웰컴 디저트', price:70, desc:'체크인 쿠폰', benefit:'웰컴 디저트 1개 제공', terms:'체크인 당일부터 체크아웃일까지 사용 가능' },
        { name:'패밀리 세트', price:420, desc:'4인 기준', benefit:'음료 4잔 무료', terms:'4인 방문 기준, 다른 할인과 중복 사용 불가' }
      ]
    },
    {
      id:'OTHER-CONCIERGE', type:'other', name:'컨시어지 기타 서비스', contact:'Front Desk / 내선 0',
      contactPerson:'Front Desk', contactPhone:'내선 0', contactEmail:'frontdesk@grandsaigon.local',
      address:'The Grand Saigon Concierge Desk', location:'호텔 로비 컨시어지', commission:0,
      voucherFields:[], logoDataUrl:'',
      campaignTitle:'기타 요청 관리',
      benefit:'향후 티켓, 현장 지원, 심부름, 특별 요청을 업체/항목 단위로 관리',
      operatingHours:'24시간 접수',
      usagePeriod:'상시 운영',
      settlementPolicy:'요청별 Folio 반영 또는 현장 결제',
      frontdeskMemo:'다양한 요청을 추가할 수 있도록 업체와 항목을 자유롭게 등록합니다.',
      bookingGuide:'업체를 만들고 메뉴/항목별 금액과 설명을 등록한 뒤 객실에 부가서비스로 반영합니다.',
      detailContentHtml:{
        ko:'<h4>기타 서비스 관리</h4><p>향후 추가될 티켓, 현장 지원, 특별 요청 등을 업체와 항목 단위로 자유롭게 관리합니다.</p>',
        en:'<h4>Other service management</h4><p>Flexible vendor and item management for future ancillary service types.</p>'
      },
      items:[
        { name:'티켓 대행 수수료', price:120, desc:'공연/투어 티켓 예약 대행' },
        { name:'특별 요청 처리', price:80, desc:'컨시어지 요청 기본 처리비' }
      ]
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function hasInitialVoucherFields(type) {
    return Object.prototype.hasOwnProperty.call(initialVoucherFieldsByType, type);
  }
  function initialVoucherFields(type) {
    return hasInitialVoucherFields(type) ? [...initialVoucherFieldsByType[type]] : [];
  }
  function defaultVoucherFields(type) {
    if (type === 'pos' || type === 'other') return [];
    if (type === 'restaurant') return ['guest','room','date','item','amount','partnerContact','location','address','benefit','terms'];
    if (hasInitialVoucherFields(type)) return initialVoucherFields(type);
    return (voucherFieldGroups[type] || []).flatMap(group => group.fields);
  }
  function normalizeVendorItems(type, items = [], seedItems = []) {
    const source = Array.isArray(items) && items.length ? items : seedItems;
    const seeded = seedItems.map(seedItem => {
      const item = source.find(candidate => candidate?.name === seedItem.name) || seedItem;
      return { ...clone(seedItem), ...clone(item || {}), category: item?.category || seedItem.category || type };
    });
    const custom = source
      .filter(item => item?.name && !seedItems.some(seedItem => seedItem.name === item.name))
      .map(item => ({ ...clone(item), category: item.category || type }));
    return [...seeded, ...custom];
  }
  function normalizeVendor(vendor) {
    const incoming = vendor?.id === 'POS-RIVERSIDE' || vendor?.name === '리버사이드 비스트로'
      ? { ...vendor, id:'REST-RIVERSIDE', type:'restaurant' }
      : vendor;
    const seed = seedVendors.find(item => item.id === incoming?.id || (item.type === incoming?.type && item.name === incoming?.name));
    const type = SERVICE_TYPES.includes(incoming?.type) ? incoming.type : (seed?.type || 'pos');
    const fields = type === 'pos' || type === 'other'
      ? []
      : (Array.isArray(incoming?.voucherFields) && incoming.voucherFields.length ? [...incoming.voucherFields] : defaultVoucherFields(type));
    if (type === 'rentacar') {
      if (!fields.includes('address')) fields.push('address');
      if (!fields.includes('partnerContact')) fields.push('partnerContact');
    }
    return {
      ...clone(seed || {}),
      ...clone(incoming || {}),
      type,
      items: normalizeVendorItems(type, incoming?.items, seed?.items || []),
      voucherFields: fields,
      address: incoming?.address || seed?.address || '',
      location: incoming?.location || seed?.location || incoming?.address || seed?.address || '',
      logoDataUrl: incoming?.logoDataUrl || seed?.logoDataUrl || ''
    };
  }
  function load() {
    let vendors = [];
    try { vendors = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e) { vendors = []; }
    if (!Array.isArray(vendors)) vendors = [];
    const merged = vendors.map(normalizeVendor);
    seedVendors.forEach(seed => {
      if (!merged.some(vendor => vendor.id === seed.id || (vendor.type === seed.type && vendor.name === seed.name))) {
        merged.push(normalizeVendor(seed));
      }
    });
    return merged;
  }
  function save(vendors) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(vendors) ? vendors.map(normalizeVendor) : []));
  }
  function serviceLabel(type, lang = 'ko') {
    const ko = { pos:'통합 POS', restaurant:'음식점', golf:'골프장', rentacar:'렌터카', other:'기타' };
    const en = { pos:'POS', restaurant:'Restaurant', golf:'Golf Course', rentacar:'Rent-a-car', other:'Other' };
    return (lang === 'en' ? en : ko)[type] || (lang === 'en' ? 'Ancillary' : '부가서비스');
  }
  function serviceIcon(type) {
    return {
      pos:'fa-cash-register',
      restaurant:'fa-utensils',
      golf:'fa-golf-ball-tee',
      rentacar:'fa-car',
      other:'fa-box-open'
    }[type] || 'fa-bell-concierge';
  }
  function money(value) {
    return `₱${Number(value || 0).toLocaleString('en')}`;
  }
  function sampleVoucherData(vendor) {
    const item = (vendor?.items || [])[0] || { name: serviceLabel(vendor?.type), price: 0 };
    return {
      guest:'Lee Hannah',
      room:'0801',
      date:'2026-07-08 14:30',
      people:'2명',
      teeTime:'07:30',
      course: vendor?.name || '썬밸리 CC',
      pickup:'호텔 로비',
      vehicle: item.vehicleClass || item.name || '공항 픽업',
      item: item.name || serviceLabel(vendor?.type),
      amount: money(item.price || 0),
      partnerContact: vendor?.contact || '-',
      address: vendor?.address || '주소 미등록',
      memo:'프런트 확인 후 제공'
    };
  }

  window.PmsPartnerVendors = {
    storageKey: STORAGE_KEY,
    serviceTypes: [...SERVICE_TYPES],
    seedVendors: clone(seedVendors),
    voucherFieldLabels,
    voucherFieldGroups,
    hasInitialVoucherFields,
    initialVoucherFields,
    defaultVoucherFields,
    normalizeVendor,
    load,
    save,
    serviceLabel,
    serviceIcon,
    money,
    sampleVoucherData
  };
})();
