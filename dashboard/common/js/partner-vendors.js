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
  const lockedVoucherFieldsByType = {
    golf: ['guest','room','date','item','people','teeTime','course']
  };
  function isVoucherFieldsLocked(type) {
    return Object.prototype.hasOwnProperty.call(lockedVoucherFieldsByType, type);
  }
  function fixedVoucherFields(type, fields = []) {
    return isVoucherFieldsLocked(type) ? [...lockedVoucherFieldsByType[type]] : [...fields];
  }
  const seedVendors = [
    {
      id:'POS-HOTEL', type:'pos', name:'호텔 통합 POS', contact:'F&B / Front Desk', contactPerson:'F&B / Front Desk', contactPhone:'내선 700', contactEmail:'pos@grandsaigon.local', address:'The Grand Saigon 내부 POS', commission:0,
      voucherFields:[], logoDataUrl:'',
      campaignTitle:'객실 정산 연결 POS',
      benefit:'객실별 식음/미니바/세탁 주문을 Folio에 바로 반영',
      operatingHours:'24시간 접수, F&B 제공 시간 06:00~23:00',
      usagePeriod:'상시 운영',
      settlementPolicy:'객실 Folio 합산, 체크아웃 정산',
      frontdeskMemo:'투숙 중 객실만 등록합니다. 체크아웃 예정 객실은 Folio 반영 여부를 먼저 확인하세요.',
      bookingGuide:'객실 선택 후 통합 POS 항목을 등록하고, 주문 상태가 완료되면 정산 내역에 반영합니다.',
      internalNote:'호텔 내부 부서형 업체입니다. 외부 업체 정산 대상이 아닙니다.',
      detailContentHtml:{
        ko:'<h4>내부 운영 메모</h4><p>통합 POS는 외부 광고 계약 대상이 아니라 호텔 내부 주문을 객실 Folio로 연결하기 위한 운영 항목입니다.</p>',
        en:'<h4>Internal operation note</h4><p>Hotel POS is not an external advertising contract. It connects in-house orders to guest Folios.</p>'
      },
      items:[{ name:'룸서비스 세트', price:8500, desc:'객실 주문' }, { name:'미니바 추가', price:1200, desc:'객실 미니바' }, { name:'영상 서비스', price:1800, desc:'영상/스트리밍' }, { name:'세탁 서비스', price:950, desc:'객실 세탁 접수' }]
    },
    {
      id:'POS-RIVERSIDE', type:'pos', name:'리버사이드 비스트로', contact:'Minh Nguyen / +84 90 118 2233', contactPerson:'Minh Nguyen', contactPhone:'+84 90 118 2233', contactEmail:'partners@riversidebistro.vn', address:'12 Nguyen Hue St, District 1, Ho Chi Minh City', commission:8,
      voucherFields:[], logoDataUrl:'',
      campaignTitle:'투숙객 전용 레스토랑 디너 혜택',
      benefit:'디너 세트, 웰컴 디저트, 패밀리 메뉴 제휴 할인',
      operatingHours:'11:30~22:30',
      usagePeriod:'2026-07-01 ~ 2026-08-31',
      settlementPolicy:'프런트 예약 확인 후 업체 후불 정산',
      frontdeskMemo:'방문 시간, 인원, 좌석 가능 여부, 쿠폰 적용 메뉴를 업체 담당자에게 먼저 확인합니다.',
      bookingGuide:'담당자에게 연락해 디너 세트와 디저트 쿠폰 적용 가능 여부를 확인한 뒤 계약이 확정되면 통합 POS 항목으로 등록합니다.',
      internalNote:'외부 레스토랑 제휴 검토용 광고입니다.',
      detailContentHtml:{
        ko:'<h4>제휴 검토 요약</h4><p>호텔 투숙객에게 주변 레스토랑 디너 세트와 웰컴 디저트 혜택을 안내하기 위한 제휴 광고입니다.</p>',
        en:'<h4>Partnership review summary</h4><p>This ad promotes dinner set and welcome dessert benefits for hotel guests at a nearby restaurant partner.</p>'
      },
      items:[{ name:'디너 세트 2인', price:260, desc:'투숙객 전용 메뉴' }, { name:'웰컴 디저트', price:70, desc:'체크인 쿠폰' }, { name:'패밀리 세트', price:420, desc:'4인 기준' }]
    },
    {
      id:'GOLF-SUNVALLEY', type:'golf', name:'썬밸리 CC', contact:'Kim Manager / +63 917 230 4471', contactPerson:'Kim Manager', contactPhone:'+63 917 230 4471', contactEmail:'sales@sunvalleycc.ph', address:'Clark Freeport Zone, Pampanga', commission:15,
      voucherFields:['guest','room','date','item','people','teeTime','course'], logoDataUrl:'',
      campaignTitle:'제휴 골프장 그린피 혜택',
      benefit:'주중 18홀 그린피 및 카트 패키지 할인',
      operatingHours:'06:00~18:00',
      usagePeriod:'2026-07-01 ~ 2026-08-31',
      settlementPolicy:'프런트 선예약, 이용 후 업체 후불 정산',
      frontdeskMemo:'호텔 담당자가 업체 연락처로 제휴 가능 여부, 티타임 제공 범위, 취소 수수료를 먼저 확인해야 합니다.',
      bookingGuide:'담당자에게 연락해 그린피, 카트, 클럽 대여, 픽업 연계 가능 여부를 확인한 뒤 계약이 확정되면 골프장 업체/항목으로 등록합니다.',
      internalNote:'계약 전 검토용 광고입니다.',
      detailContentHtml:{
        ko:'<div class="partner-promo-visual partner-promo-visual--golf"><div class="partner-promo-visual__media"><span>Sunvalley CC</span><strong>VIP & 단체 골프 제휴</strong><p>클락 프리포트에서 즐기는 18홀 라운드</p></div><div class="partner-promo-visual__copy"><small>호텔 제휴 검토용 안내</small><h3>프런트에서 바로 연결 가능한 골프장 제휴 제안</h3><p>단체 고객과 VIP 투숙객의 골프 문의가 들어오면 담당자가 즉시 연락해 티타임, 카트 포함 여부, 취소 조건을 확인할 수 있도록 정리한 광고입니다.</p><div class="partner-promo-visual__chips"><span>주중/주말 그린피 확인</span><span>티타임 사전 협의</span><span>바우처 출력 가능</span></div><ul><li>계약 전 카트 포함 여부와 우천 취소 기준을 확인합니다.</li><li>바우처에는 업체 주소, 연락처, 코스명, 티오프 시간이 표시됩니다.</li><li>계약 확정 후 업체/항목 관리에서 실제 판매 항목으로 등록합니다.</li></ul></div></div>',
        en:'<div class="partner-promo-visual partner-promo-visual--golf"><div class="partner-promo-visual__media"><span>Sunvalley CC</span><strong>VIP & Group Golf Partnership</strong><p>18-hole rounds in Clark Freeport</p></div><div class="partner-promo-visual__copy"><small>Hotel partnership review</small><h3>Golf partner offer ready for front desk follow-up</h3><p>This ad gives hotel staff a clear contact point for group and VIP golf requests, including tee-time confirmation, cart inclusion, and cancellation terms.</p><div class="partner-promo-visual__chips"><span>Green fee check</span><span>Tee-time coordination</span><span>Voucher ready</span></div><ul><li>Confirm cart inclusion and rain cancellation rules before signing.</li><li>Voucher output includes vendor address, contact, course, and tee time.</li><li>After contract approval, register sellable items in vendor management.</li></ul></div></div>'
      },
      items:[{ name:'18홀 그린피', price:450, desc:'주중 18홀' }, { name:'카트 이용권', price:70, desc:'팀 단위 카트' }, { name:'클럽 대여', price:60, desc:'1인 기준' }]
    },
    {
      id:'GOLF-SKY72', type:'golf', name:'스카이72', contact:'Lee Manager / +63 922 558 7811', contactPerson:'Lee Manager', contactPhone:'+63 922 558 7811', contactEmail:'partner@sky72golf.ph', address:'Andrews Ave, Pasay, Metro Manila', commission:12,
      voucherFields:['guest','room','date','item','people','teeTime','course'], logoDataUrl:'',
      campaignTitle:'조조 라운드 패키지',
      benefit:'평일 오전 라운드 카트비 할인',
      operatingHours:'05:30~17:30',
      usagePeriod:'2026-07-01 ~ 2026-07-20',
      settlementPolicy:'예약 확정 후 호텔 Folio 청구 또는 현장 결제',
      frontdeskMemo:'조조 라운드 제공 시간, 카트비 포함 여부, 취소 마감 시간을 업체와 먼저 확인해야 합니다.',
      bookingGuide:'담당자에게 연락해 평일 오전 슬롯과 호텔 고객 적용 조건을 확인한 뒤 계약이 확정되면 골프장 업체/항목으로 등록합니다.',
      internalNote:'계약 전 검토용 광고입니다.',
      detailContentHtml:{
        ko:'<div class="partner-promo-visual partner-promo-visual--golf partner-promo-visual--early"><div class="partner-promo-visual__media"><span>Sky72 Golf</span><strong>조조 라운드 패키지</strong><p>이른 출발 고객을 위한 오전 티타임 제안</p></div><div class="partner-promo-visual__copy"><small>호텔 제휴 검토용 안내</small><h3>평일 오전 라운드 문의를 바로 계약 검토로 연결</h3><p>조조 라운드를 원하는 투숙객에게 제공 시간, 카트비 포함 여부, 취소 마감 시간을 확인한 뒤 호텔 조건에 맞는 상품으로 등록할 수 있습니다.</p><div class="partner-promo-visual__chips"><span>오전 티타임</span><span>카트비 확인</span><span>취소 기준 확인</span></div><ul><li>담당자에게 연락해 평일 오전 슬롯을 먼저 확인합니다.</li><li>확정된 조건만 부가서비스 항목으로 등록합니다.</li><li>실제 이용 시 현장 입력 정보와 바우처 출력 항목을 남깁니다.</li></ul></div></div>',
        en:'<div class="partner-promo-visual partner-promo-visual--golf partner-promo-visual--early"><div class="partner-promo-visual__media"><span>Sky72 Golf</span><strong>Early Round Package</strong><p>Morning tee-time offer for early guests</p></div><div class="partner-promo-visual__copy"><small>Hotel partnership review</small><h3>Turn weekday morning golf requests into a clear contract workflow</h3><p>Staff can verify early-round hours, cart fee inclusion, and cancellation deadlines before registering approved offers as sellable ancillary items.</p><div class="partner-promo-visual__chips"><span>Morning tee time</span><span>Cart fee check</span><span>Cancellation rules</span></div><ul><li>Contact the vendor first to confirm weekday morning slots.</li><li>Register only confirmed terms as ancillary items.</li><li>Capture field details and voucher fields when the service is used.</li></ul></div></div>'
      },
      items:[{ name:'9홀 라운딩', price:180, desc:'오전 9홀' }, { name:'18홀 패키지', price:520, desc:'그린피+카트' }]
    },
    {
      id:'RENT-LOTTE', type:'rentacar', name:'롯데렌터카', contact:'Park Manager / +63 928 410 9930', contactPerson:'Park Manager', contactPhone:'+63 928 410 9930', contactEmail:'hotel.sales@lotterent.ph', address:'NAIA Terminal 3 Arrival Hall, Pasay', commission:13,
      voucherFields:['guest','room','date','pickup','vehicle','item','amount','partnerContact','address'], logoDataUrl:'',
      campaignTitle:'공항 픽업부터 장기 렌트까지',
      benefit:'공항 픽업 및 장기 투숙객 렌트카 특별 요금',
      operatingHours:'05:00~24:00',
      usagePeriod:'2026-07-01 ~ 2026-08-15',
      settlementPolicy:'호텔 예약 대행 후 월말 업체 정산',
      frontdeskMemo:'호텔 담당자가 업체 연락처로 차량 종류, 보험 포함 여부, 공항 픽업 가능 시간, 취소 조건을 먼저 확인해야 합니다.',
      bookingGuide:'담당자에게 연락해 차량별 요금, 기사 포함 여부, 픽업 장소 지원 범위를 확인한 뒤 계약이 확정되면 렌터카 업체/항목으로 등록합니다.',
      internalNote:'계약 전 검토용 광고입니다.',
      detailContentHtml:{
        ko:'<h4>제휴 검토 요약</h4><p>공항 픽업과 장기 렌터카 문의가 많은 호텔에서 담당자가 차량 조건과 계약 요율을 검토하기 위한 광고입니다.</p><h4>계약 전 확인사항</h4><ul><li>차량 종류별 기본 요금과 시간 초과 요금</li><li>보험 포함 여부와 기사 포함 여부</li><li>공항 픽업 위치, 대기 시간, 긴급 연락처</li></ul>',
        en:'<h4>Partnership review summary</h4><p>This ad helps hotel staff review vehicle terms and contract rates for airport pickup and long-stay rental requests.</p><h4>Before signing</h4><ul><li>Base rate and overtime rate by vehicle type</li><li>Insurance and chauffeur inclusion</li><li>Airport pickup point, waiting time, and emergency contact</li></ul>'
      },
      items:[{ name:'세단 8시간', price:160, desc:'기사 미포함' }, { name:'공항 픽업', price:90, desc:'편도 픽업' }, { name:'전기차 24시간', price:230, desc:'완충 인도' }]
    },
    {
      id:'RENT-SK', type:'rentacar', name:'SK렌터카', contact:'Choi Manager / +63 917 772 9001', contactPerson:'Choi Manager', contactPhone:'+63 917 772 9001', contactEmail:'partners@skrent.ph', address:'BGC Transport Hub, Taguig', commission:14,
      voucherFields:['guest','room','date','pickup','vehicle','item','amount','partnerContact','address'], logoDataUrl:'',
      campaignTitle:'시내 투어 차량 제휴',
      benefit:'반나절 시내 투어 차량 및 기사 포함 요금',
      operatingHours:'06:00~22:00',
      usagePeriod:'2026-07-01 ~ 2026-07-31',
      settlementPolicy:'이용 확정 건별 업체 정산',
      frontdeskMemo:'시내 투어 가능 구간, 기사 포함 조건, 초과 시간 요금을 업체와 먼저 확인해야 합니다.',
      bookingGuide:'담당자에게 연락해 차량/기사 운영 조건과 호텔 고객 적용 요금을 확인한 뒤 계약이 확정되면 렌터카 업체/항목으로 등록합니다.',
      internalNote:'계약 전 검토용 광고입니다.',
      detailContentHtml:{
        ko:'<h4>광고 제안</h4><p>반나절 시내 투어와 기사 포함 차량 문의를 호텔 담당자가 빠르게 검토할 수 있도록 만든 제휴 광고입니다.</p><h4>호텔 확인사항</h4><p>차량별 가능 인원, 기사 포함 시간, 초과 요금, 취소 기준을 계약 전에 확인합니다.</p>',
        en:'<h4>Ad offer</h4><p>This partner ad helps hotel staff review half-day city tour and chauffeur-included vehicle requests.</p><h4>Hotel checklist</h4><p>Confirm vehicle capacity, included chauffeur hours, overtime fees, and cancellation rules before signing.</p>'
      },
      items:[{ name:'SUV 24시간', price:260, desc:'보험 포함' }, { name:'기사 포함 밴', price:320, desc:'8시간 기준' }]
    }
  ];
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function defaultVoucherFields(type) {
    if (type === 'pos') return [];
    if (isVoucherFieldsLocked(type)) return fixedVoucherFields(type);
    return (voucherFieldGroups[type] || voucherFieldGroups.pos).flatMap(group => group.fields);
  }
  function normalizeVendor(vendor) {
    const seed = seedVendors.find(item => item.id === vendor?.id || (item.type === vendor?.type && item.name === vendor?.name));
    const type = vendor?.type || seed?.type || 'pos';
    const fields = fixedVoucherFields(type, type === 'pos' ? [] : (Array.isArray(vendor?.voucherFields) && vendor.voucherFields.length ? [...vendor.voucherFields] : defaultVoucherFields(type)));
    if (type !== 'golf' && ['rentacar', 'pos'].includes(type) && !fields.includes('address') && seed?.voucherFields?.includes('address')) fields.push('address');
    if (type !== 'golf' && ['rentacar', 'pos'].includes(type) && !fields.includes('partnerContact') && seed?.voucherFields?.includes('partnerContact')) fields.push('partnerContact');
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
