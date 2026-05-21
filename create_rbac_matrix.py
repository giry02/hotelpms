import pandas as pd
import os

def create_rbac_excel(output_dir):
    os.makedirs(output_dir, exist_ok=True)

    # ===================================================================
    # 권한 범례:
    #   C  = Create (생성)
    #   R  = Read (조회)
    #   U  = Update (수정)
    #   D  = Delete (삭제)
    #   -  = 접근 불가
    #   *  = 본인 담당 건만
    # ===================================================================

    # 역할(Role) 정의
    roles = [
        "총지배인\n(GM)",
        "프론트\n매니저",
        "프론트\n직원",
        "HK\n매니저",
        "HK\n직원",
        "서비스\n매니저",
        "회계\n매니저",
    ]

    # [화면ID, 1Depth, 2Depth, 기능명, GM, 프론트매니저, 프론트직원, HK매니저, HK직원, 서비스매니저, 회계매니저]
    rbac_data = [
        # --- 대시보드 ---
        ["HT-DASH-01", "대시보드", "호텔 대시보드", "KPI 현황 조회 (OCC, ADR, RevPAR)",
         "R", "R", "R", "R", "-", "R", "R"],
        ["HT-DASH-01", "대시보드", "호텔 대시보드", "매출 통계 차트 조회",
         "R", "R", "-", "-", "-", "-", "R"],

        # --- 예약 및 프론트 ---
        ["HT-RES-01", "예약 및 프론트", "예약 타임라인", "간트 차트 조회",
         "R", "R", "R", "R", "-", "-", "-"],
        ["HT-RES-02", "예약 및 프론트", "신규 예약", "예약 생성",
         "CRUD", "CRUD", "CR", "-", "-", "-", "-"],
        ["HT-RES-03", "예약 및 프론트", "예약 상세", "예약 수정/취소",
         "CRUD", "CRUD", "RU", "-", "-", "-", "-"],
        ["HT-RES-03", "예약 및 프론트", "예약 상세", "체크인 처리",
         "CRUD", "CRUD", "RU", "-", "-", "-", "-"],
        ["HT-RES-03", "예약 및 프론트", "예약 상세", "체크아웃 처리",
         "CRUD", "CRUD", "RU", "-", "-", "-", "-"],
        ["HT-RES-03", "예약 및 프론트", "예약 상세", "객실 배정/변경",
         "CRUD", "CRUD", "R", "-", "-", "-", "-"],
        ["HT-RES-04", "예약 및 프론트", "예약 목록", "예약 검색/필터/CSV 내보내기",
         "R", "R", "R", "-", "-", "-", "R"],

        # --- CRM 및 멤버십 ---
        ["HT-CRM-01", "CRM 및 멤버십", "투숙객 목록", "투숙객 검색/VIP 필터",
         "R", "R", "R", "-", "-", "-", "-"],
        ["HT-CRM-02", "CRM 및 멤버십", "투숙객 원장 상세", "개인정보 조회",
         "R", "R", "R", "-", "-", "-", "-"],
        ["HT-CRM-02", "CRM 및 멤버십", "투숙객 원장 상세", "선호사항(Memo) 수정",
         "CRUD", "CRUD", "RU", "-", "-", "-", "-"],
        ["HT-CRM-02", "CRM 및 멤버십", "투숙객 원장 상세", "VIP 등급/누적 데이터 조회",
         "R", "R", "R", "-", "-", "-", "R"],
        ["HT-CRM-02", "CRM 및 멤버십", "투숙객 원장 상세", "투숙 이력 조회",
         "R", "R", "R", "-", "-", "-", "R"],
        ["HT-CRM-03", "CRM 및 멤버십", "투숙객 등록", "신규 투숙객 등록",
         "CRUD", "CRUD", "CR", "-", "-", "-", "-"],
        ["HT-CRM-04", "CRM 및 멤버십", "VIP 등급 관리", "승급 기준 현황 모니터링",
         "R", "R", "-", "-", "-", "-", "-"],

        # --- 객실 및 요금 ---
        ["HT-ROOM-01", "객실 및 요금", "객실 인벤토리", "객실 목록/상태 조회",
         "R", "R", "R", "R", "R", "-", "-"],
        ["HT-ROOM-02", "객실 및 요금", "객실 상세", "객실 상태 변경 (available/maintenance 등)",
         "CRUD", "CRUD", "RU", "RU", "-", "-", "-"],
        ["HT-ROOM-02", "객실 및 요금", "객실 상세", "객실 정보/편의시설 수정",
         "CRUD", "RU", "-", "-", "-", "-", "-"],
        ["HT-ROOM-03", "객실 및 요금", "객실 유형 관리", "객실 유형 CRUD",
         "CRUD", "-", "-", "-", "-", "-", "-"],
        ["HT-RATE-01", "객실 및 요금", "요금 캘린더", "일자/시즌별 요금 설정",
         "CRUD", "-", "-", "-", "-", "-", "R"],
        ["HT-RATE-01", "객실 및 요금", "요금 캘린더", "요금 조회",
         "R", "R", "R", "-", "-", "-", "R"],
        ["HT-RATE-02", "객실 및 요금", "VIP 할인율 설정", "등급별 할인율 설정/수정",
         "CRUD", "-", "-", "-", "-", "-", "-"],
        ["HT-RATE-02", "객실 및 요금", "VIP 할인율 설정", "할인율 조회",
         "R", "R", "R", "-", "-", "-", "R"],

        # --- 통합 정산 (Folio) ---
        ["HT-FOL-01", "통합 정산", "정산 목록", "전체 Folio 검색/조회",
         "R", "R", "R", "-", "-", "-", "R"],
        ["HT-FOL-02", "통합 정산", "통합 영수증", "통합 과금 명세 조회",
         "R", "R", "R", "-", "-", "R", "R"],
        ["HT-FOL-03", "통합 정산", "부가 과금 추가", "내부 부가서비스 수기 과금",
         "CRUD", "CRUD", "CRU", "-", "-", "CRU*", "-"],
        ["HT-FOL-03", "통합 정산", "부가 과금 추가", "외부 대행 서비스 과금",
         "CRUD", "CRUD", "CRU", "-", "-", "CRU*", "-"],
        ["HT-FOL-03", "통합 정산", "부가 과금 추가", "과금 항목 삭제",
         "CRUD", "CRUD", "-", "-", "-", "-", "-"],
        ["HT-FOL-04", "통합 정산", "정산 완료", "최종 결제 및 정산 처리",
         "CRUD", "CRUD", "-", "-", "-", "-", "RU"],
        ["HT-FOL-04", "통합 정산", "정산 완료", "환불 처리",
         "CRUD", "CRUD", "-", "-", "-", "-", "RU"],

        # --- 부가서비스 관리 ---
        ["HT-SVC-01", "부가서비스", "서비스 카탈로그", "내부 서비스 목록 조회",
         "R", "R", "R", "-", "-", "R", "-"],
        ["HT-SVC-02", "부가서비스", "서비스 등록/수정", "서비스 항목/단가 CRUD",
         "CRUD", "-", "-", "-", "-", "CRUD", "-"],
        ["HT-EXT-01", "부가서비스", "외부 대행 목록", "외부 서비스 목록 조회",
         "R", "R", "R", "-", "-", "R", "-"],
        ["HT-EXT-02", "부가서비스", "외부 대행 등록", "외부 서비스/제휴업체 등록",
         "CRUD", "-", "-", "-", "-", "CRUD", "-"],
        ["HT-EXT-03", "부가서비스", "외부 대행 상세", "예약 접수 및 수수료 관리",
         "CRUD", "RU", "-", "-", "-", "CRUD", "R"],

        # --- 하우스키핑 ---
        ["HT-HK-01", "하우스키핑", "HK 보드", "객실 청소 상태 보드 조회",
         "R", "R", "R", "R", "R", "-", "-"],
        ["HT-HK-01", "하우스키핑", "HK 보드", "청소 상태 변경 (dirty/cleaning/clean 등)",
         "CRUD", "-", "-", "CRUD", "RU*", "-", "-"],
        ["HT-HK-02", "하우스키핑", "객실 HK 상세", "상태 변경 이력 조회",
         "R", "R", "-", "R", "R*", "-", "-"],
        ["HT-HK-02", "하우스키핑", "객실 HK 상세", "수리 요청 등록",
         "CRUD", "-", "-", "CRUD", "CR*", "-", "-"],
        ["HT-HK-02", "하우스키핑", "객실 HK 상세", "메모 입력",
         "CRUD", "-", "-", "CRUD", "CRU*", "-", "-"],

        # --- 설정 ---
        ["HT-SET-01", "호텔 설정", "기본 설정", "호텔 정보/타임존/환율 설정",
         "CRUD", "-", "-", "-", "-", "-", "-"],
        ["HT-SET-01", "호텔 설정", "기본 설정", "호텔 기본 정보 조회",
         "R", "R", "-", "-", "-", "-", "R"],
        ["HT-SET-02", "호텔 설정", "직원 관리", "직원 계정 목록 조회",
         "R", "R", "-", "-", "-", "-", "-"],
        ["HT-SET-02", "호텔 설정", "직원 관리", "직원 권한/부서 변경",
         "CRUD", "-", "-", "-", "-", "-", "-"],
        ["HT-SET-02", "호텔 설정", "직원 관리", "직원 활성/비활성 제어",
         "CRUD", "-", "-", "-", "-", "-", "-"],
        ["HT-SET-03", "호텔 설정", "직원 등록", "신규 직원 계정 생성",
         "CRUD", "-", "-", "-", "-", "-", "-"],
    ]

    columns = ["화면 ID", "1 Depth", "2 Depth", "세부 기능"] + roles

    df_rbac = pd.DataFrame(rbac_data, columns=columns)

    # ===================================================================
    # 역할 정의 시트 데이터
    # ===================================================================
    role_def_data = [
        ["총지배인 (GM)", "admin", "General Manager",
         "호텔 전체 운영 총괄. 모든 메뉴 접근 가능. 요금/할인율/직원 관리 등 시스템 설정 최종 권한 보유.",
         "모든 메뉴", "전체 CRUD"],
        ["프론트 매니저", "manager", "Front Desk Manager",
         "프론트 데스크 운영 책임. 예약 관리, 체크인/아웃, 정산 처리 전반을 관리. 객실 상태 변경 가능. 요금/설정 변경은 불가.",
         "대시보드, 예약, CRM, 객실(제한), 정산, 부가서비스(조회), HK(조회)", "해당 영역 CRUD, 설정 Read Only"],
        ["프론트 직원", "staff", "Front Desk Staff",
         "예약 생성 및 체크인/아웃 현장 실무 담당. 투숙객 등록 및 수기 과금 처리 가능. 예약 삭제/정산 완료 처리는 불가.",
         "예약(생성/수정), CRM(등록/조회), 정산(과금추가), 객실(조회), HK(조회)", "제한적 CRU, 삭제 불가"],
        ["HK 매니저", "manager", "Housekeeping Manager",
         "하우스키핑 부서 책임자. HK 보드에서 전체 객실 청소 상태 관리, 수리 요청 등록, 직원 배정. 객실 물리 상태 변경 권한.",
         "대시보드(조회), 객실(상태조회), HK 보드(전체)", "HK 영역 CRUD, 기타 Read Only"],
        ["HK 직원", "staff", "Housekeeping Staff",
         "본인 담당 객실의 청소 상태 변경 및 메모 입력. 담당 외 객실은 조회만 가능.",
         "HK 보드(담당 객실), 객실 인벤토리(조회)", "담당 건 RU, 본인 외 Read Only"],
        ["서비스 매니저", "manager", "Service Manager",
         "부가서비스(내부/외부) 카탈로그 관리 및 단가 설정. 투숙객 대상 부가 과금 처리 가능. 예약/정산 완료 권한 없음.",
         "대시보드(조회), 부가서비스(전체), 정산(과금추가/조회)", "서비스 영역 CRUD, 정산 제한적 CRU"],
        ["회계 매니저", "manager", "Accounting Manager",
         "정산/결제 관련 데이터 접근. 요금 캘린더 조회, Folio 정산 완료/환불 처리 승인. 예약·CRM 직접 조작 불가.",
         "대시보드(매출), 정산(전체), 요금(조회), 설정(조회)", "정산 RU, 기타 Read Only"],
    ]

    role_def_columns = ["역할명(KO)", "시스템 Role", "역할명(EN)", "역할 설명",
                        "접근 가능 영역 요약", "권한 수준"]

    df_roles = pd.DataFrame(role_def_data, columns=role_def_columns)

    # ===================================================================
    # 엑셀 생성
    # ===================================================================
    xlsx_path = os.path.join(output_dir, "권한_매트릭스_PMS.xlsx")

    with pd.ExcelWriter(xlsx_path, engine='xlsxwriter') as writer:
        df_rbac.to_excel(writer, index=False, sheet_name='권한 매트릭스')
        df_roles.to_excel(writer, index=False, sheet_name='역할 정의')

        workbook = writer.book

        # ----- 공통 서식 -----
        header_fmt = workbook.add_format({
            'bold': True, 'bg_color': '#1B2A4A', 'font_color': '#FFFFFF',
            'border': 1, 'align': 'center', 'valign': 'vcenter',
            'font_size': 10, 'font_name': 'Malgun Gothic', 'text_wrap': True
        })
        cell_c = workbook.add_format({
            'valign': 'vcenter', 'align': 'center', 'border': 1,
            'font_size': 10, 'font_name': 'Malgun Gothic'
        })
        cell_l = workbook.add_format({
            'valign': 'vcenter', 'align': 'left', 'border': 1,
            'text_wrap': True, 'font_size': 10, 'font_name': 'Malgun Gothic'
        })

        # 권한 레벨별 색상 서식
        fmt_crud = workbook.add_format({
            'valign': 'vcenter', 'align': 'center', 'border': 1,
            'bg_color': '#C6EFCE', 'font_color': '#006100', 'bold': True,
            'font_size': 10, 'font_name': 'Malgun Gothic'
        })
        fmt_read = workbook.add_format({
            'valign': 'vcenter', 'align': 'center', 'border': 1,
            'bg_color': '#BDD7EE', 'font_color': '#1F4E79',
            'font_size': 10, 'font_name': 'Malgun Gothic'
        })
        fmt_partial = workbook.add_format({
            'valign': 'vcenter', 'align': 'center', 'border': 1,
            'bg_color': '#FFF2CC', 'font_color': '#7F6003',
            'font_size': 10, 'font_name': 'Malgun Gothic'
        })
        fmt_none = workbook.add_format({
            'valign': 'vcenter', 'align': 'center', 'border': 1,
            'bg_color': '#F2F2F2', 'font_color': '#BFBFBF',
            'font_size': 10, 'font_name': 'Malgun Gothic'
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

        def get_perm_fmt(val):
            v = val.strip()
            if v == '-':
                return fmt_none
            elif v == 'CRUD':
                return fmt_crud
            elif v == 'R':
                return fmt_read
            else:
                return fmt_partial

        # ===================================================================
        # 권한 매트릭스 시트 포맷팅
        # ===================================================================
        ws = writer.sheets['권한 매트릭스']
        for col_num, val in enumerate(df_rbac.columns):
            ws.write(0, col_num, val, header_fmt)

        current_depth = ""
        ci = -1
        for row in range(len(df_rbac)):
            d1 = df_rbac.iloc[row, 1]
            if d1 != current_depth:
                current_depth = d1
                ci = (ci + 1) % len(depth_fmts)

            ws.write(row+1, 0, df_rbac.iloc[row, 0], cell_c)              # 화면 ID
            ws.write(row+1, 1, df_rbac.iloc[row, 1], depth_fmts[ci])      # 1 Depth
            ws.write(row+1, 2, df_rbac.iloc[row, 2], cell_c)              # 2 Depth
            ws.write(row+1, 3, df_rbac.iloc[row, 3], cell_l)              # 세부 기능

            # 역할별 권한 (색상 분기)
            for c in range(4, 4 + len(roles)):
                perm = str(df_rbac.iloc[row, c])
                ws.write(row+1, c, perm, get_perm_fmt(perm))

        ws.set_column('A:A', 14)
        ws.set_column('B:B', 16)
        ws.set_column('C:C', 20)
        ws.set_column('D:D', 40)
        ws.set_column('E:E', 10)
        ws.set_column('F:F', 10)
        ws.set_column('G:G', 10)
        ws.set_column('H:H', 10)
        ws.set_column('I:I', 10)
        ws.set_column('J:J', 10)
        ws.set_column('K:K', 10)
        ws.autofilter(0, 0, len(df_rbac), len(df_rbac.columns) - 1)
        ws.freeze_panes(1, 4)
        ws.set_row(0, 40)

        # ===================================================================
        # 역할 정의 시트 포맷팅
        # ===================================================================
        ws2 = writer.sheets['역할 정의']
        for col_num, val in enumerate(df_roles.columns):
            ws2.write(0, col_num, val, header_fmt)

        role_bg_colors = ['#C6EFCE', '#BDD7EE', '#FFF2CC', '#E8DAEF', '#F2F2F2', '#FDEBD0', '#FDE8E8']
        for row in range(len(df_roles)):
            bg = role_bg_colors[row % len(role_bg_colors)]
            role_fmt = workbook.add_format({
                'valign': 'vcenter', 'align': 'center', 'border': 1,
                'bg_color': bg, 'bold': True,
                'font_size': 10, 'font_name': 'Malgun Gothic'
            })
            ws2.write(row+1, 0, df_roles.iloc[row, 0], role_fmt)
            ws2.write(row+1, 1, df_roles.iloc[row, 1], cell_c)
            ws2.write(row+1, 2, df_roles.iloc[row, 2], cell_c)
            ws2.write(row+1, 3, df_roles.iloc[row, 3], cell_l)
            ws2.write(row+1, 4, df_roles.iloc[row, 4], cell_l)
            ws2.write(row+1, 5, df_roles.iloc[row, 5], cell_c)

        ws2.set_column('A:A', 16)
        ws2.set_column('B:B', 14)
        ws2.set_column('C:C', 24)
        ws2.set_column('D:D', 70)
        ws2.set_column('E:E', 50)
        ws2.set_column('F:F', 28)
        ws2.set_row(0, 30)

        # ===================================================================
        # 범례 시트
        # ===================================================================
        legend_data = [
            ["CRUD", "Create + Read + Update + Delete (전체 권한)", "#C6EFCE"],
            ["CRU", "Create + Read + Update (삭제 불가)", "#FFF2CC"],
            ["CR", "Create + Read (수정/삭제 불가)", "#FFF2CC"],
            ["RU", "Read + Update (생성/삭제 불가)", "#FFF2CC"],
            ["RU*", "Read + Update, 본인 담당 건만", "#FFF2CC"],
            ["CRU*", "Create + Read + Update, 본인 담당 건만", "#FFF2CC"],
            ["CR*", "Create + Read, 본인 담당 건만", "#FFF2CC"],
            ["R", "Read Only (조회만 가능)", "#BDD7EE"],
            ["R*", "Read Only, 본인 담당 건만", "#BDD7EE"],
            ["-", "접근 불가 (메뉴 비노출)", "#F2F2F2"],
        ]

        legend_ws = workbook.add_worksheet('범례')
        legend_ws.write(0, 0, "권한 코드", header_fmt)
        legend_ws.write(0, 1, "설명", header_fmt)
        legend_ws.write(0, 2, "색상 의미", header_fmt)

        for i, (code, desc, bg) in enumerate(legend_data):
            code_fmt = workbook.add_format({
                'valign': 'vcenter', 'align': 'center', 'border': 1,
                'bg_color': bg, 'bold': True,
                'font_size': 11, 'font_name': 'Malgun Gothic'
            })
            legend_ws.write(i+1, 0, code, code_fmt)
            legend_ws.write(i+1, 1, desc, cell_l)
            color_labels = {
                '#C6EFCE': '초록 = 전체 권한',
                '#FFF2CC': '노랑 = 부분 권한',
                '#BDD7EE': '파랑 = 조회 전용',
                '#F2F2F2': '회색 = 접근 불가'
            }
            legend_ws.write(i+1, 2, color_labels.get(bg, ''), cell_c)

        legend_ws.set_column('A:A', 14)
        legend_ws.set_column('B:B', 50)
        legend_ws.set_column('C:C', 24)
        legend_ws.set_row(0, 30)

    print(f"Done: {xlsx_path}")

if __name__ == "__main__":
    create_rbac_excel(r"e:\AI_Project\Hotel_PMS\output")
