import pandas as pd
import os

def create_pms_ia_excel(output_dir):
    os.makedirs(output_dir, exist_ok=True)

    # ===================================================================
    # Sheet 1: 호텔 관리자 (Hotel Admin & Staff) 메뉴구조도
    # ===================================================================
    hotel_data = [
        # --- 대시보드 ---
        ["대시보드", "호텔 대시보드", "", "HT-DASH-01", "/hotel/dashboard",
         "오늘의 체크인/아웃 현황, 객실 점유율(OCC), ADR, RevPAR 핵심 KPI 카드 및 주간 추이 차트 시각화",
         "admin, manager", "✅", "호텔 로그인 후 기본 랜딩 페이지"],

        # --- 예약 및 프론트 ---
        ["예약 및 프론트", "예약 타임라인", "", "HT-RES-01", "/hotel/reservations",
         "날짜(X축) × 객실(Y축) 매트릭스 형태의 간트 차트. 예약 상태별 색상 구분(확정/체크인/취소). 드래그로 날짜 이동 가능",
         "admin, manager, staff", "✅", "핵심 화면. 모바일에서는 가로 스크롤 지원"],
        ["예약 및 프론트", "신규 예약", "", "HT-RES-02", "/hotel/reservations/new",
         "객실 유형 선택, 투숙 일자 설정, 투숙객 검색/신규 등록, VIP 할인율 자동 적용 계산 미리보기",
         "admin, manager, staff", "✅", "VIP 등급 인식하여 할인가 실시간 표시"],
        ["예약 및 프론트", "예약 상세", "", "HT-RES-03", "/hotel/reservations/:id",
         "예약 정보 조회/수정, 체크인·체크아웃 처리 버튼, 객실 배정/변경, Folio 연결 바로가기",
         "admin, manager, staff", "✅", "체크인 시 Room 상태 자동 변경"],
        ["예약 및 프론트", "예약 목록", "", "HT-RES-04", "/hotel/reservations/list",
         "전체 예약 리스트 테이블. 날짜/상태/투숙객명 필터 검색, CSV 내보내기 기능",
         "admin, manager", "❌", "PC 화면 최적화 (테이블 형태)"],

        # --- CRM 및 멤버십 ---
        ["CRM 및 멤버십", "투숙객 목록", "", "HT-CRM-01", "/hotel/guests",
         "전체 투숙객 원장 검색. VIP 등급 필터, 이름/전화번호/여권번호 검색, 누적 투숙 횟수 정렬",
         "admin, manager", "❌", ""],
        ["CRM 및 멤버십", "투숙객 원장 상세", "", "HT-CRM-02", "/hotel/guests/:id",
         "개인정보(여권, 연락처), 선호 사항(Memo), VIP 등급 배지, 누적 투숙 횟수(total_stays), 누적 결제액(total_spent), 과거 투숙 이력 타임라인",
         "admin, manager", "✅", "체크아웃 완료 시 자동 집계 데이터 표시"],
        ["CRM 및 멤버십", "투숙객 등록", "", "HT-CRM-03", "/hotel/guests/new",
         "신규 고객 등록 폼. 여권 스캔 입력, 연락처, 국적, 선호사항 메모 입력",
         "admin, manager, staff", "✅", ""],
        ["CRM 및 멤버십", "VIP 등급 관리", "", "HT-CRM-04", "/hotel/guests/vip-settings",
         "VIP 승급 기준(Standard/Silver/Gold/VIP) 확인. 등급별 투숙 횟수·결제액 임계값 표시 (시스템 설정값 조회)",
         "admin", "❌", "승급은 자동 처리, 여기선 현황 모니터링"],

        # --- 객실 및 요금 ---
        ["객실 및 요금", "객실 인벤토리", "", "HT-ROOM-01", "/hotel/rooms",
         "전체 객실 목록. 객실 유형/층/상태별 필터, 현재 투숙 상태 및 하우스키핑 상태 뱃지 표시",
         "admin, manager", "❌", ""],
        ["객실 및 요금", "객실 상세", "", "HT-ROOM-02", "/hotel/rooms/:id",
         "개별 객실 정보 수정, 현재 상태(available/occupied/maintenance) 변경, 편의시설(amenities) 설정",
         "admin, manager", "✅", ""],
        ["객실 및 요금", "객실 유형 관리", "", "HT-ROOM-03", "/hotel/room-types",
         "객실 유형(Deluxe, Suite 등) CRUD. 기본/최대 인원, 편의시설 정의",
         "admin", "❌", ""],
        ["객실 및 요금", "요금 캘린더", "", "HT-RATE-01", "/hotel/rates",
         "일자/시즌별 객실 유형 기본 요금(USD) 설정. 달력 UI에서 날짜 범위 선택 후 일괄 설정. 시즌 태그(peak/off_peak/normal) 지정",
         "admin", "❌", "PC 전용. 넓은 달력 UI 필요"],
        ["객실 및 요금", "VIP 할인율 설정", "", "HT-RATE-02", "/hotel/rates/vip-discount",
         "VIP 등급별(Silver/Gold/VIP) 할인율(%) 매핑. 객실 유형별 차등 할인율 설정 가능",
         "admin", "❌", "예약 생성 시 이 할인율이 자동 적용"],

        # --- 통합 정산 ---
        ["통합 정산(Folio)", "정산 목록", "", "HT-FOL-01", "/hotel/folios",
         "전체 Folio 리스트. 결제상태(open/partial/settled) 필터, 투숙객명·예약번호 검색",
         "admin, manager", "❌", ""],
        ["통합 정산(Folio)", "통합 영수증", "", "HT-FOL-02", "/hotel/folios/:id",
         "Booking 기준 통합 과금 명세. [객실료(VIP할인 적용) + 내부 부가서비스 + 외부 대행 서비스] 항목별 리스트 및 합산 총액(USD/로컬 통화)",
         "admin, manager, staff", "✅", "하나의 영수증으로 모든 과금 병합"],
        ["통합 정산(Folio)", "부가 과금 추가", "", "HT-FOL-03", "/hotel/folios/:id/add-charge",
         "직원이 현재 투숙 중인 객실에 부가 요금(룸서비스, 미니바, 세탁 등) 수기 추가. 서비스 카탈로그에서 항목 선택 후 수량·금액 입력",
         "admin, manager, staff", "✅", "1차 핵심 기능. 모바일 터치 최적화"],
        ["통합 정산(Folio)", "정산 완료 처리", "", "HT-FOL-04", "/hotel/folios/:id/settle",
         "최종 결제 처리. 결제수단 선택, 정산 완료 시 VIP 승급 트리거 자동 실행(total_stays/total_spent 갱신 및 등급 재산정)",
         "admin, manager", "✅", "체크아웃 연동. Room 상태 자동 변경"],

        # --- 부가서비스 ---
        ["부가서비스 관리", "서비스 카탈로그", "", "HT-SVC-01", "/hotel/services",
         "내부 부가서비스(룸서비스, 미니바, 세탁, 스파 등) 항목 목록. 카테고리별 분류, 단가(USD) 표시, 활성/비활성 토글",
         "admin", "❌", ""],
        ["부가서비스 관리", "서비스 등록/수정", "", "HT-SVC-02", "/hotel/services/new",
         "부가서비스 항목 등록. 카테고리 선택, 영문명/현지어명, USD 단가 입력",
         "admin", "❌", ""],
        ["부가서비스 관리", "외부 대행 목록", "", "HT-EXT-01", "/hotel/external-services",
         "골프, 렌터카, 로컬 투어, 픽업 등 외부 제휴 서비스 목록. 제휴업체명, 기본요금, 수수료율 표시",
         "admin, manager", "❌", "도메인별 독립 관리 (KI 원칙 준수)"],
        ["부가서비스 관리", "외부 대행 등록/수정", "", "HT-EXT-02", "/hotel/external-services/new",
         "외부 대행 서비스 등록. 유형(골프/렌터카/투어/픽업), 제휴업체, 기본요금(USD), 수수료율(%) 입력",
         "admin", "❌", ""],
        ["부가서비스 관리", "외부 대행 상세", "", "HT-EXT-03", "/hotel/external-services/:id",
         "개별 외부 서비스 상세. 예약 접수 이력, 수수료/대행 요금 정산 현황 관리",
         "admin, manager", "✅", ""],

        # --- 하우스키핑 ---
        ["하우스키핑", "HK 보드", "", "HT-HK-01", "/hotel/housekeeping",
         "전체 객실 상태 보드. 큰 컬러 카드 UI로 청소 전(dirty)/청소 중(cleaning)/완료(clean)/점검(inspected)/수리(out_of_order) 실시간 표시. 터치 한 번으로 상태 변경",
         "manager, staff", "✅", "모바일 터치 최적화 핵심 화면. 48px 이상 터치 타겟"],
        ["하우스키핑", "객실 HK 상세", "", "HT-HK-02", "/hotel/housekeeping/:roomId",
         "개별 객실 하우스키핑 상세. 상태 변경 이력 로그, 메모 입력, 수리 요청 등록",
         "staff", "✅", ""],

        # --- 설정 ---
        ["호텔 설정", "기본 설정", "", "HT-SET-01", "/hotel/settings",
         "호텔 기본 정보(이름, 주소), 로컬 타임존 설정, 기준 통화 및 USD 환율 세팅, 세금률 설정",
         "admin", "❌", ""],
        ["호텔 설정", "직원 관리", "", "HT-SET-02", "/hotel/settings/staff",
         "직원 계정 목록. 부서/권한(admin/manager/staff) 설정, 활성/비활성 제어, 마지막 로그인 시간 표시",
         "admin", "❌", ""],
        ["호텔 설정", "직원 등록", "", "HT-SET-03", "/hotel/settings/staff/new",
         "신규 직원 계정 생성. 이메일, 이름, 부서 배정, 권한(Role) 부여",
         "admin", "❌", "범용 Auth API 연동"],
    ]

    # ===================================================================
    # Sheet 2: 최종 관리자 (Super Admin) 메뉴구조도
    # ===================================================================
    super_data = [
        # --- 통합 대시보드 ---
        ["통합 대시보드", "플랫폼 현황", "", "SA-DASH-01", "/super-admin",
         "전체 가입 호텔 수, 플랫폼 총 거래액(USD), 국가/지역별 호텔 분포 지도, 총 광고 수익 요약 카드, 최근 7일 트래픽 추이 차트",
         "super_admin", "플랫폼 로그인 후 기본 랜딩 페이지"],

        # --- 테넌트 관리 ---
        ["테넌트(호텔) 관리", "호텔 목록", "", "SA-TNT-01", "/super-admin/tenants",
         "전체 입점 호텔 리스트. 국가/도시 필터, 플랜 유형(free/standard/premium) 필터, 상태(pending/active/suspended) 배지 표시",
         "super_admin", ""],
        ["테넌트(호텔) 관리", "호텔 상세", "", "SA-TNT-02", "/super-admin/tenants/:id",
         "개별 호텔 상세 정보. 계약 기간 관리, 플랜 변경, 활성화/정지 제어 토글, 해당 호텔의 매출 요약 차트, 과금 현황 이력",
         "super_admin", "입점 심사 및 계약 관리 핵심 화면"],
        ["테넌트(호텔) 관리", "신규 입점 등록", "", "SA-TNT-03", "/super-admin/tenants/new",
         "신규 호텔 입점 신청 처리. 호텔명, 국가/도시, 타임존, 통화, 플랜 유형 설정, 계약 기간 입력 후 승인",
         "super_admin", "승인 시 hotel_id 자동 발급"],

        # --- 광고 네트워크 ---
        ["광고 네트워크 관리", "캠페인 목록", "", "SA-AD-01", "/super-admin/ads",
         "전체 광고 캠페인 리스트. 활성/비활성 필터, 광고주명 검색, 노출 기간별 정렬, CPM/CPC 단가 표시",
         "super_admin", "핵심 수익 모델"],
        ["광고 네트워크 관리", "캠페인 등록", "", "SA-AD-02", "/super-admin/ads/new",
         "신규 광고 캠페인 등록. 광고주명, 다국어 배너 업로드(KO/EN/현지어), 클릭 랜딩 URL, CPM/CPC 단가(USD), 노출 시작·종료일(UTC 기준, 타임존 변환 표시)",
         "super_admin", "다국어 배너 필수 등록"],
        ["광고 네트워크 관리", "캠페인 상세/수정", "", "SA-AD-03", "/super-admin/ads/:id",
         "캠페인 수정. 배너 교체, 노출 기간 변경, 타겟팅 설정 수정, 실시간 노출/클릭 현황 미니 차트",
         "super_admin", ""],
        ["광고 네트워크 관리", "타겟팅 설정", "", "SA-AD-04", "/super-admin/ads/:id/targeting",
         "국가 > 도시 2-Depth 지역 타겟팅 설정. 특정 호텔 단위 송출 가중치(Weight, 1~10) 설정. 다중 타겟 추가/삭제 UI",
         "super_admin", "타겟팅 엔진 핵심 화면"],
        ["광고 네트워크 관리", "광고 정산", "", "SA-AD-05", "/super-admin/ads/billing",
         "기간별 노출(Impression)/클릭(Click) 집계 테이블. 캠페인별 CPM·CPC 과금 산출, 광고주 청구액(USD) 합산 리포트. CSV 내보내기",
         "super_admin", "광고주별 청구서 생성 기반 데이터"],

        # --- 시스템 관리 ---
        ["시스템 관리", "공지사항 관리", "", "SA-SYS-01", "/super-admin/notices",
         "시스템 공지사항 CRUD. 대상 지정(전체/Super Admin/Hotel Admin), 발행 상태 토글, 발행일시 관리",
         "super_admin", "입점 호텔 공지 배포"],
        ["시스템 관리", "감사 로그", "", "SA-SYS-02", "/super-admin/audit-logs",
         "전체 시스템 에러 로그, 관리자 작업 이력 모니터링. 액터/액션/대상 필터 검색, 시간순 정렬, 상세 변경 데이터(before/after) JSON 뷰",
         "super_admin", "보안 감사 및 문제 추적"],
    ]

    # ===================================================================
    # DataFrame 생성
    # ===================================================================
    columns_hotel = [
        "1 Depth", "2 Depth", "3 Depth", "화면 ID",
        "URL Path", "주요 기능 및 설명", "접근 권한(Role)", "모바일 최적화", "비고"
    ]
    columns_super = [
        "1 Depth", "2 Depth", "3 Depth", "화면 ID",
        "URL Path", "주요 기능 및 설명", "접근 권한(Role)", "비고"
    ]

    df_hotel = pd.DataFrame(hotel_data, columns=columns_hotel)
    df_super = pd.DataFrame(super_data, columns=columns_super)

    xlsx_path = os.path.join(output_dir, "메뉴구조도_PMS.xlsx")

    with pd.ExcelWriter(xlsx_path, engine='xlsxwriter') as writer:
        df_hotel.to_excel(writer, index=False, sheet_name='호텔 관리자')
        df_super.to_excel(writer, index=False, sheet_name='최종 관리자(Super Admin)')

        workbook = writer.book

        # ----- 공통 서식 정의 -----
        header_fmt = workbook.add_format({
            'bold': True, 'bg_color': '#1B2A4A', 'font_color': '#FFFFFF',
            'border': 1, 'align': 'center', 'valign': 'vcenter',
            'font_size': 11, 'font_name': 'Malgun Gothic'
        })
        cell_center = workbook.add_format({
            'valign': 'vcenter', 'align': 'center', 'border': 1,
            'font_size': 10, 'font_name': 'Malgun Gothic'
        })
        cell_left = workbook.add_format({
            'valign': 'vcenter', 'align': 'left', 'border': 1,
            'text_wrap': True, 'font_size': 10, 'font_name': 'Malgun Gothic'
        })
        cell_url = workbook.add_format({
            'valign': 'vcenter', 'align': 'left', 'border': 1,
            'font_size': 10, 'font_name': 'Consolas', 'font_color': '#1D4ED8'
        })

        # 1-Depth 구분 배경색
        depth_colors = ['#E8F0FE', '#EAEDED', '#FDE8E8', '#FEF3CD', '#D4EDDA', '#E8DAEF', '#FDEBD0', '#D1ECF1']
        depth_fmts = []
        for c in depth_colors:
            depth_fmts.append(workbook.add_format({
                'valign': 'vcenter', 'align': 'center', 'border': 1,
                'bg_color': c, 'bold': True,
                'font_size': 10, 'font_name': 'Malgun Gothic'
            }))

        # 모바일 최적화 뱃지 서식
        mobile_yes = workbook.add_format({
            'valign': 'vcenter', 'align': 'center', 'border': 1,
            'font_size': 10, 'font_name': 'Malgun Gothic',
            'bg_color': '#D4EDDA', 'font_color': '#155724'
        })
        mobile_no = workbook.add_format({
            'valign': 'vcenter', 'align': 'center', 'border': 1,
            'font_size': 10, 'font_name': 'Malgun Gothic',
            'bg_color': '#F8D7DA', 'font_color': '#721C24'
        })

        # ===================================================================
        # 호텔 관리자 시트 포맷팅
        # ===================================================================
        ws_hotel = writer.sheets['호텔 관리자']
        for col_num, val in enumerate(df_hotel.columns):
            ws_hotel.write(0, col_num, val, header_fmt)

        current_depth = ""
        ci = -1
        for row in range(len(df_hotel)):
            d1 = df_hotel.iloc[row, 0]
            if d1 != current_depth:
                current_depth = d1
                ci = (ci + 1) % len(depth_fmts)

            ws_hotel.write(row+1, 0, df_hotel.iloc[row, 0], depth_fmts[ci])       # 1 Depth
            ws_hotel.write(row+1, 1, df_hotel.iloc[row, 1], cell_center)           # 2 Depth
            ws_hotel.write(row+1, 2, df_hotel.iloc[row, 2], cell_center)           # 3 Depth
            ws_hotel.write(row+1, 3, df_hotel.iloc[row, 3], cell_center)           # 화면 ID
            ws_hotel.write(row+1, 4, df_hotel.iloc[row, 4], cell_url)             # URL Path
            ws_hotel.write(row+1, 5, df_hotel.iloc[row, 5], cell_left)            # 설명
            ws_hotel.write(row+1, 6, df_hotel.iloc[row, 6], cell_center)           # 권한
            # 모바일 최적화 색상 분기
            mob = df_hotel.iloc[row, 7]
            ws_hotel.write(row+1, 7, mob, mobile_yes if mob == "✅" else mobile_no)
            ws_hotel.write(row+1, 8, df_hotel.iloc[row, 8], cell_left)            # 비고

        ws_hotel.set_column('A:A', 18)
        ws_hotel.set_column('B:B', 20)
        ws_hotel.set_column('C:C', 12)
        ws_hotel.set_column('D:D', 14)
        ws_hotel.set_column('E:E', 34)
        ws_hotel.set_column('F:F', 70)
        ws_hotel.set_column('G:G', 22)
        ws_hotel.set_column('H:H', 14)
        ws_hotel.set_column('I:I', 40)
        ws_hotel.autofilter(0, 0, len(df_hotel), len(df_hotel.columns) - 1)
        ws_hotel.freeze_panes(1, 0)
        ws_hotel.set_row(0, 30)

        # ===================================================================
        # 최종 관리자 시트 포맷팅
        # ===================================================================
        ws_super = writer.sheets['최종 관리자(Super Admin)']
        for col_num, val in enumerate(df_super.columns):
            ws_super.write(0, col_num, val, header_fmt)

        current_depth = ""
        ci = -1
        for row in range(len(df_super)):
            d1 = df_super.iloc[row, 0]
            if d1 != current_depth:
                current_depth = d1
                ci = (ci + 1) % len(depth_fmts)

            ws_super.write(row+1, 0, df_super.iloc[row, 0], depth_fmts[ci])
            ws_super.write(row+1, 1, df_super.iloc[row, 1], cell_center)
            ws_super.write(row+1, 2, df_super.iloc[row, 2], cell_center)
            ws_super.write(row+1, 3, df_super.iloc[row, 3], cell_center)
            ws_super.write(row+1, 4, df_super.iloc[row, 4], cell_url)
            ws_super.write(row+1, 5, df_super.iloc[row, 5], cell_left)
            ws_super.write(row+1, 6, df_super.iloc[row, 6], cell_center)
            ws_super.write(row+1, 7, df_super.iloc[row, 7], cell_left)

        ws_super.set_column('A:A', 20)
        ws_super.set_column('B:B', 20)
        ws_super.set_column('C:C', 12)
        ws_super.set_column('D:D', 14)
        ws_super.set_column('E:E', 36)
        ws_super.set_column('F:F', 75)
        ws_super.set_column('G:G', 16)
        ws_super.set_column('H:H', 40)
        ws_super.autofilter(0, 0, len(df_super), len(df_super.columns) - 1)
        ws_super.freeze_panes(1, 0)
        ws_super.set_row(0, 30)

    print(f"✅ 생성 완료: {xlsx_path}")

if __name__ == "__main__":
    create_pms_ia_excel(r"e:\AI_Project\Hotel_PMS\output")
