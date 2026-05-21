import pandas as pd

# Load original excel
excel_path = 'e:/AI_Project/Hotel_PMS/output/메뉴구조도_PMS.xlsx'
df = pd.read_excel(excel_path)

# Ensure columns exist for tracking
df['구현된 파일 (File Path)'] = ''
df['구현 방식 (Implementation)'] = ''
df['상태 (Status)'] = 'Missing'

# Mapping defined by logic
mapping = {
    'HT-DASH-01': ('dashboard/dashboard.html', 'Separate Page', 'Implemented'),
    
    'HT-RES-01': ('dashboard/frontdesk/reservation-timeline.html', 'Separate Page', 'Implemented'),
    'HT-RES-02': ('dashboard/frontdesk/reservation-list.html', 'Modal (newResModal)', 'Implemented (Changed to Modal)'),
    'HT-RES-03': ('dashboard/frontdesk/checkin.html', 'Separate Page / Modal', 'Implemented'),
    'HT-RES-04': ('dashboard/frontdesk/reservation-list.html', 'Separate Page', 'Implemented'),
    
    'HT-CRM-01': ('dashboard/crm/guests.html', 'Separate Page', 'Implemented'),
    'HT-CRM-02': ('dashboard/crm/guests.html', 'Modal / Card Expansion', 'Implemented (Changed to Modal)'),
    'HT-CRM-03': ('dashboard/crm/guests.html', 'Modal (addGuestModal)', 'Implemented (Changed to Modal)'),
    'HT-CRM-04': ('dashboard/crm/membership.html', 'Separate Page + Modal', 'Implemented'),
    
    'HT-ROOM-01': ('dashboard/operations/rooms.html', 'Separate Page', 'Implemented'),
    'HT-ROOM-02': ('dashboard/operations/rooms.html', 'Modal / UI Toggle', 'Implemented (Changed to Modal)'),
    'HT-ROOM-03': ('dashboard/operations/rooms.html', 'Modal (roomTypeModal)', 'Implemented (Changed to Modal)'),
    
    'HT-RATE-01': ('dashboard/operations/rates.html', 'Separate Page (PC Only)', 'Implemented'),
    'HT-RATE-02': ('dashboard/operations/rates.html', 'Modal (vipDiscountModal)', 'Implemented (Changed to Modal)'),
    
    'HT-FOL-01': ('dashboard/operations/folio.html', 'Separate Page', 'Implemented'),
    'HT-FOL-02': ('dashboard/operations/folio.html', 'Modal (invoiceModal)', 'Implemented (Changed to Modal)'),
    'HT-FOL-03': ('dashboard/operations/folio.html', 'Modal (paymentModal)', 'Implemented (Changed to Modal)'),
    'HT-FOL-04': ('dashboard/operations/folio.html', 'Modal / Button Action', 'Implemented (Changed to Modal)'),
    
    'HT-SVC-01': ('dashboard/operations/ancillary.html', 'Modal (catalogModal)', 'Implemented (Changed to Modal)'),
    'HT-SVC-02': ('dashboard/operations/ancillary.html', 'Modal (addOrderModal)', 'Implemented (Changed to Modal)'),
    'HT-EXT-01': ('dashboard/operations/ancillary.html', 'Tab / Section', 'Implemented (Merged with Ancillary)'),
    'HT-EXT-02': ('dashboard/operations/ancillary.html', 'Modal', 'Implemented (Changed to Modal)'),
    'HT-EXT-03': ('dashboard/operations/ancillary.html', 'Modal', 'Implemented (Changed to Modal)'),
    
    'HT-HK-01': ('dashboard/operations/housekeeping.html', 'Separate Page', 'Implemented'),
    'HT-HK-02': ('dashboard/operations/housekeeping.html', 'Inline Button Actions', 'Implemented (Changed to Inline Action)'),
    
    'HT-SET-01': ('dashboard/settings/settings.html', 'Separate Page (Tabs)', 'Implemented'),
    'HT-SET-02': ('dashboard/settings/staff.html', 'Separate Page', 'Implemented'),
    'HT-SET-03': ('dashboard/settings/staff.html', 'Modal (addStaffModal)', 'Implemented (Changed to Modal)'),
}

for idx, row in df.iterrows():
    hid = row['화면 ID']
    if hid in mapping:
        df.at[idx, '구현된 파일 (File Path)'] = mapping[hid][0]
        df.at[idx, '구현 방식 (Implementation)'] = mapping[hid][1]
        df.at[idx, '상태 (Status)'] = mapping[hid][2]

# Create changes summary
changes_data = [
    {"변경 항목": "전체 완료 (All Implemented)", "원래 기획": "총 28개 화면", "실제 구현": "100% 반영 완료", "사유": "모든 누락 기능을 추가하여 전체 개발 스코프 완료됨"},
    {"변경 항목": "New Reservation (신규 예약)", "원래 기획": "별도 페이지 (HT-RES-02)", "실제 구현": "reservation-list.html 내 모달(Modal) 팝업", "사유": "페이지 이동 없는 SPA(Single Page Application) UX 지향하여 작업 속도 향상"},
    {"변경 항목": "Guest Registration (고객 등록 & 수동 VIP 지정)", "원래 기획": "별도 페이지 (HT-CRM-03)", "실제 구현": "guests.html 내 모달(Modal) 팝업", "사유": "목록 화면에서 직관적인 폼 입력을 지원. 추가로 수동 VIP 부여 기능(override) 반영"},
    {"변경 항목": "VIP Criteria (승급 기준 관리)", "원래 기획": "단순 조회 (HT-CRM-04)", "실제 구현": "membership.html 내 승급 기준 편집 모달 추가", "사유": "운영 편의성을 위해 시스템 자동 승급 마지노선(조건)을 관리자가 수정할 수 있도록 기능 보강"},
    {"변경 항목": "Invoice & Payment (정산/결제)", "원래 기획": "여러 서브페이지 분리 (HT-FOL-02,03,04)", "실제 구현": "folio.html 하나에 명세서 및 결제 팝업 병합", "사유": "통합 정산의 워크플로우를 단순화하여 하나의 테이블에서 모든 결제 수행"},
    {"변경 항목": "Service Catalog (부가서비스 항목 관리)", "원래 기획": "별도 페이지 (HT-SVC-01, HT-EXT-01)", "실제 구현": "ancillary.html 하나로 통합 + Catalog 관리 팝업 추가", "사유": "오더 등록 시 오타/오기입을 막기 위해 팝업에서 드롭다운(Select) 방식으로 아이템을 관리하도록 개선"},
    {"변경 항목": "Rates Calendar (요금 캘린더 & VIP 할인)", "원래 기획": "별도 페이지 (HT-RATE-01, HT-RATE-02)", "실제 구현": "rates.html (PC 전용 스프레드시트) 및 내부 VIP 팝업 구현", "사유": "매트릭스 캘린더 특성상 모바일에서는 열람 제한 처리. VIP 자동 할인율 설정은 페이지 이동 없이 모달로 통합"},
    {"변경 항목": "Room Types (객실 유형 관리)", "원래 기획": "별도 페이지 (HT-ROOM-03)", "실제 구현": "rooms.html 내 모달(Modal) 팝업", "사유": "별도 페이지 뎁스를 줄이고 객실 목록 관리와 연계성 강화"},
    {"변경 항목": "Staff Registration (직원 등록)", "원래 기획": "별도 페이지 (HT-SET-03)", "실제 구현": "staff.html 내 모달(Modal) 팝업", "사유": "페이지 리로드 없이 권한 및 정보 등록 처리"}
]

df_changes = pd.DataFrame(changes_data)

# Save to new Excel
output_path = 'e:/AI_Project/Hotel_PMS/output/메뉴구조도_PMS_Updated.xlsx'
with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
    df.to_excel(writer, sheet_name='Menu_Structure_Mapping', index=False)
    df_changes.to_excel(writer, sheet_name='Changes_and_Missing', index=False)

print(f"Updated Excel saved to {output_path}")
