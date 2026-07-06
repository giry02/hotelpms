(function(){
  const STORAGE_KEY = 'pms_ancillary_vendors';
  const voucherFieldLabels = {
    guest:'투숙객명', room:'객실번호', date:'이용일시', people:'인원', teeTime:'티오프', course:'골프장/업체명',
    pickup:'픽업 위치', vehicle:'차량/차종', item:'이용 항목', amount:'금액', partnerContact:'업체 연락처', address:'업체 주소', memo:'메모'
  };
  const voucherFieldGroups = {
    pos: [
      { title:'전표 기본 정보', icon:'fa-receipt', fields:['guest','room','date','item','amount','memo'] }
    ],
    golf: [
      { title:'공통 정보', icon:'fa-circle-info', fields:['guest','room','date','item','amount','partnerContact','address','memo'] },
      { title:'골프장 이용권', icon:'fa-golf-ball-tee', fields:['people','teeTime','course'] }
    ],
    rentacar: [
      { title:'공통 정보', icon:'fa-circle-info', fields:['guest','room','date','item','amount','partnerContact','address','memo'] },
      { title:'렌터카 인수 정보', icon:'fa-car', fields:['pickup','vehicle'] }
    ]
  };
  const seedVendors = [
    {
      id:'POS-HOTEL', type:'pos', name:'호텔 통합 POS', contact:'F&B / Front Desk', address:'The Grand Saigon 내부 POS', commission:0,
      voucherFields:['guest','room','date','item','amount','memo'], logoDataUrl:'',
      campaignTitle:'객실 정산 연결 POS',
      benefit:'객실별 식음/미니바/세탁 주문을 Folio에 바로 반영',
      operatingHours:'24시간 접수, F&B 제공 시간 06:00~23:00',
      usagePeriod:'상시 운영',
      settlementPolicy:'객실 Folio 합산, 체크아웃 정산',
      frontdeskMemo:'투숙 중 객실만 등록합니다. 체크아웃 예정 객실은 Folio 반영 여부를 먼저 확인하세요.',
      bookingGuide:'객실 선택 후 통합 POS 항목을 등록하고, 주문 상태가 완료되면 정산 내역에 반영합니다.',
      internalNote:'호텔 내부 부서형 업체입니다. 외부 업체 정산 대상이 아닙니다.',
      items:[{ name:'룸서비스 세트', price:8500, desc:'객실 주문' }, { name:'미니바 추가', price:1200, desc:'객실 미니바' }, { name:'영상 서비스', price:1800, desc:'영상/스트리밍' }, { name:'세탁 서비스', price:950, desc:'객실 세탁 접수' }]
    },
    {
      id:'POS-RIVERSIDE', type:'pos', name:'리버사이드 비스트로', contact:'Minh Nguyen / +84 90 118 2233', address:'12 Nguyen Hue St, District 1, Ho Chi Minh City', commission:8,
      voucherFields:['guest','room','date','item','amount','partnerContact','address','memo'], logoDataUrl:'',
      campaignTitle:'투숙객 전용 주변 식당 혜택',
      benefit:'호텔 키 확인 시 세트 메뉴 20% 할인',
      operatingHours:'11:30~22:30',
      usagePeriod:'2026-07-01 ~ 2026-07-31',
      settlementPolicy:'현장 결제 우선, 호텔 예약 대행 시 월말 수수료 정산',
      frontdeskMemo:'고객에게 직접 홍보하지 말고, 프런트에서 식당 문의가 있을 때 업체 연락처와 위치를 확인해 안내합니다.',
      bookingGuide:'필요 시 업체에 좌석 가능 여부를 확인하고 운영 메모에 예약자명/시간을 남깁니다.',
      internalNote:'대시보드 제휴 카드에서 상세를 확인한 뒤 필요할 때만 부가서비스 메모로 연결합니다.',
      items:[{ name:'디너 세트 2인', price:260, desc:'투숙객 전용 메뉴' }, { name:'웰컴 디저트', price:70, desc:'체크인 쿠폰' }, { name:'패밀리 세트', price:420, desc:'4인 기준' }]
    },
    {
      id:'GOLF-SUNVALLEY', type:'golf', name:'썬밸리 CC', contact:'Kim Manager / +63 917 230 4471', address:'Clark Freeport Zone, Pampanga', commission:15,
      voucherFields:['guest','room','date','people','teeTime','course','item','amount','partnerContact','address'], logoDataUrl:'',
      campaignTitle:'제휴 골프장 그린피 혜택',
      benefit:'주중 18홀 그린피 및 카트 패키지 할인',
      operatingHours:'06:00~18:00',
      usagePeriod:'2026-07-01 ~ 2026-08-31',
      settlementPolicy:'프런트 선예약, 이용 후 업체 후불 정산',
      frontdeskMemo:'티오프 시간, 인원, 픽업 여부를 업체와 먼저 확인하고 바우처를 출력해 전달합니다.',
      bookingGuide:'부가서비스 등록에서 골프장 항목을 선택하면 바우처 출력 필드가 자동 적용됩니다.',
      internalNote:'절취용 이용 확인이 필요한 업체입니다. 출력 후 고객 서명란을 확인하세요.',
      items:[{ name:'18홀 그린피', price:450, desc:'주중 18홀' }, { name:'카트 이용권', price:70, desc:'팀 단위 카트' }, { name:'클럽 대여', price:60, desc:'1인 기준' }]
    },
    {
      id:'GOLF-SKY72', type:'golf', name:'스카이72', contact:'Lee Manager / +63 922 558 7811', address:'Andrews Ave, Pasay, Metro Manila', commission:12,
      voucherFields:['guest','room','date','people','teeTime','course','item','amount','partnerContact','address'], logoDataUrl:'',
      campaignTitle:'조조 라운드 패키지',
      benefit:'평일 오전 라운드 카트비 할인',
      operatingHours:'05:30~17:30',
      usagePeriod:'2026-07-01 ~ 2026-07-20',
      settlementPolicy:'예약 확정 후 호텔 Folio 청구 또는 현장 결제',
      frontdeskMemo:'조조 라운드는 전날 18시까지 업체 확정 연락을 받아야 합니다.',
      bookingGuide:'예약 후 티오프와 코스명을 바우처에 반드시 포함합니다.',
      internalNote:'취소 수수료는 이용 전일 18시 이후 발생합니다.',
      items:[{ name:'9홀 라운딩', price:180, desc:'오전 9홀' }, { name:'18홀 패키지', price:520, desc:'그린피+카트' }]
    },
    {
      id:'RENT-LOTTE', type:'rentacar', name:'롯데렌터카', contact:'Park Manager / +63 928 410 9930', address:'NAIA Terminal 3 Arrival Hall, Pasay', commission:13,
      voucherFields:['guest','room','date','pickup','vehicle','item','amount','partnerContact','address'], logoDataUrl:'',
      campaignTitle:'공항 픽업부터 장기 렌트까지',
      benefit:'공항 픽업 및 장기 투숙객 렌트카 특별 요금',
      operatingHours:'05:00~24:00',
      usagePeriod:'2026-07-01 ~ 2026-08-15',
      settlementPolicy:'호텔 예약 대행 후 월말 업체 정산',
      frontdeskMemo:'픽업 장소, 항공편, 차량 인수 시간을 업체에 확정받고 운영 로그에 남깁니다.',
      bookingGuide:'부가서비스 등록에서 렌터카 항목을 선택하면 차량 인수 확인 바우처가 출력됩니다.',
      internalNote:'차량 인수 확인란이 필요한 업체입니다. 고객 서명 후 사본을 보관하세요.',
      items:[{ name:'세단 8시간', price:160, desc:'기사 미포함' }, { name:'공항 픽업', price:90, desc:'편도 픽업' }, { name:'전기차 24시간', price:230, desc:'완충 인도' }]
    },
    {
      id:'RENT-SK', type:'rentacar', name:'SK렌터카', contact:'Choi Manager / +63 917 772 9001', address:'BGC Transport Hub, Taguig', commission:14,
      voucherFields:['guest','room','date','pickup','vehicle','item','amount','partnerContact','address'], logoDataUrl:'',
      campaignTitle:'시내 투어 차량 제휴',
      benefit:'반나절 시내 투어 차량 및 기사 포함 요금',
      operatingHours:'06:00~22:00',
      usagePeriod:'2026-07-01 ~ 2026-07-31',
      settlementPolicy:'이용 확정 건별 업체 정산',
      frontdeskMemo:'시내 투어는 출발/복귀 시간을 고객에게 재확인하고 업체 배차명을 메모합니다.',
      bookingGuide:'차량/차종과 픽업 위치를 바우처에 포함해야 합니다.',
      internalNote:'배차 변경이 잦으므로 출력 직전 업체 확인이 필요합니다.',
      items:[{ name:'SUV 24시간', price:260, desc:'보험 포함' }, { name:'기사 포함 밴', price:320, desc:'8시간 기준' }]
    }
  ];
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function defaultVoucherFields(type) {
    return (voucherFieldGroups[type] || voucherFieldGroups.pos).flatMap(group => group.fields);
  }
  function normalizeVendor(vendor) {
    const seed = seedVendors.find(item => item.id === vendor?.id || (item.type === vendor?.type && item.name === vendor?.name));
    const type = vendor?.type || seed?.type || 'pos';
    const fields = Array.isArray(vendor?.voucherFields) && vendor.voucherFields.length ? [...vendor.voucherFields] : defaultVoucherFields(type);
    if (['golf', 'rentacar', 'pos'].includes(type) && !fields.includes('address') && seed?.voucherFields?.includes('address')) fields.push('address');
    if (['golf', 'rentacar', 'pos'].includes(type) && !fields.includes('partnerContact') && seed?.voucherFields?.includes('partnerContact')) fields.push('partnerContact');
    return {
      ...clone(seed || {}),
      ...clone(vendor || {}),
      type,
      items: Array.isArray(vendor?.items) ? clone(vendor.items) : clone(seed?.items || []),
      voucherFields: fields,
      address: vendor?.address || seed?.address || '',
      logoDataUrl: vendor?.logoDataUrl || seed?.logoDataUrl || ''
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
    const ko = { pos:'통합 POS', golf:'골프장', rentacar:'렌터카' };
    const en = { pos:'POS', golf:'Golf Course', rentacar:'Rent-a-car' };
    return (lang === 'en' ? en : ko)[type] || (lang === 'en' ? 'Ancillary' : '부가서비스');
  }
  function serviceIcon(type) {
    return { pos:'fa-cash-register', golf:'fa-golf-ball-tee', rentacar:'fa-car' }[type] || 'fa-bell-concierge';
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
      vehicle: item.name || '공항 픽업',
      item: item.name || serviceLabel(vendor?.type),
      amount: money(item.price || 0),
      partnerContact: vendor?.contact || '-',
      address: vendor?.address || '주소 미등록',
      memo:'프런트 확인 후 제공'
    };
  }
  window.PmsPartnerVendors = {
    storageKey: STORAGE_KEY,
    seedVendors: clone(seedVendors),
    voucherFieldLabels,
    voucherFieldGroups,
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
