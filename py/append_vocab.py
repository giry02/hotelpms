import re
import os

extra_vocab = {
    # Dashboard groups and labels
    "Main": "메인",
    "Front Desk": "프론트 데스크",
    "Guest & CRM": "투숙객 및 CRM",
    "Operations": "운영 관리",
    "Settings": "설정",
    "Dashboard": "대시보드",
    "Reservations": "예약 타임라인",
    "Booking List": "예약 목록",
    "Check-in/out": "체크인/아웃",
    "Guest CRM": "투숙객 관리",
    "VIP Members": "VIP 멤버십",
    "Room Mgmt": "객실 관리",
    "Room Types": "객실 유형",
    "Rates Calendar": "요금 캘린더",
    "Housekeeping": "하우스키핑",
    "Folio & Billing": "통합 정산",
    "Folio List": "정산 목록",
    "Revenue Analytics": "매출 분석",
    "Ancillary Svcs": "부가서비스",
    "Room Service": "룸서비스",
    "Golf": "골프",
    "Rent-a-car": "렌터카",
    "Hotel Settings": "호텔 설정",
    "Staff Mgmt": "직원 관리",
    "Billing & Payment": "요금 및 결제",
    "Notices": "공지사항",
    "Support": "고객지원",
    
    # Admin groups and labels
    "Tenant Mgmt": "입점사 관리",
    "Ad Network": "광고 네트워크",
    "System": "시스템",
    "Platform Status": "플랫폼 현황",
    "Hotel List": "호텔 목록",
    "New Registration": "신규 입점 등록",
    "Campaigns": "캠페인 목록",
    "New Campaign": "캠페인 등록",
    "Ad Billing": "광고 정산",
    "Admin Accounts": "어드민 계정",
    "Subscription & Billing": "구독 및 결제",
    "Customer Support": "고객 지원",
    "Notice Mgmt": "공지사항 관리",
    "Audit Logs": "감사 로그",
    "Platform Owner": "플랫폼 소유자",
    "Super Admin": "슈퍼 관리자"
}

injection_script = "\n// --- Added Missing Sidebar Vocabulary ---\n"
injection_script += "Object.assign(window.translations.ko, {\n"
for en, ko in extra_vocab.items():
    injection_script += f'    "{en}": "{ko}",\n'
injection_script += "});\n"
injection_script += "Object.assign(window.translations.en, {\n"
for en, ko in extra_vocab.items():
    injection_script += f'    "{en}": "{en}",\n'
injection_script += "});\n"

files_to_update = [
    r'E:\AI_Project\Hotel_PMS\dashboard\common\js\i18n.js',
    r'E:\AI_Project\Hotel_PMS\admin\common\js\admin-i18n.js'
]

for filepath in files_to_update:
    if os.path.exists(filepath):
        with open(filepath, 'a', encoding='utf-8') as f:
            f.write(injection_script)
        print(f"Appended missing vocabulary to {filepath}")
    else:
        print(f"File not found: {filepath}")
