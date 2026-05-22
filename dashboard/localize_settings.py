import os, sys

base = r"E:\AI_Project\Hotel_PMS\dashboard"

def r(path):
    with open(path, encoding='utf-8') as f: return f.read()
def w(path, content):
    with open(path, 'w', encoding='utf-8') as f: f.write(content)
def bulk_replace(s, pairs):
    for old, new in pairs:
        s = s.replace(old, new)
    return s

# settings/staff.html
sf = os.path.join(base, "settings", "staff.html")
if os.path.exists(sf):
    c = r(sf)
    c = bulk_replace(c, [
        (">Add Staff<", ">직원 등록<"),
        (">Export<", ">다운로드<"),
        (">Edit<", ">수정<"),
        (">Delete<", ">삭제<"),
        (">Save<", ">저장<"),
        (">Cancel<", ">취소<"),
        (">Close<", ">닫기<"),
        ("On Duty", "근무 중"),
        ("Off Duty", "비근무"),
        ("All Roles", "전체 직책"),
        ("Search staff...", "직원명 검색..."),
        ("Last Login", "최근 접속"),
        ("Total Staff", "전체 직원"),
        ("Active", "재직 중"),
    ])
    w(sf, c)
    print("OK staff.html")

# settings/settings.html
ss = os.path.join(base, "settings", "settings.html")
if os.path.exists(ss):
    c = r(ss)
    c = bulk_replace(c, [
        (">Save Changes<", ">변경사항 저장<"),
        (">Cancel<", ">취소<"),
        (">Close<", ">닫기<"),
        ("Basic Info", "기본 정보"),
        ("Operational Policies", "운영 정책"),
        ("Billing & Tax", "결제 및 세금"),
        ("Hotel Name", "호텔명"),
        ("Hotel Address", "호텔 주소"),
        ("Main Phone", "대표 전화번호"),
        ("Main Email", "대표 이메일"),
        ("Default Check-in", "기본 체크인 시간"),
        ("Default Check-out", "기본 체크아웃 시간"),
        ("Cancellation Policy", "취소 정책"),
        ("Allow Overbooking", "오버부킹 허용"),
        ("Require Deposit", "사전 보증금 필수"),
    ])
    w(ss, c)
    print("OK settings.html")

# operations/rates.html
rt = os.path.join(base, "operations", "rates.html")
if os.path.exists(rt):
    c = r(rt)
    c = bulk_replace(c, [
        (">Save Rates<", ">요금 저장<"),
        (">Export<", ">다운로드<"),
        (">Close<", ">닫기<"),
        (">Apply<", ">적용<"),
        (">Cancel<", ">취소<"),
        ("Default Rates", "기본 요금 설정"),
        ("VIP Discounts", "VIP 할인율 설정"),
        ("Weekday", "평일"),
        ("Weekend/Holiday", "주말/공휴일"),
    ])
    w(rt, c)
    print("OK rates.html")

# frontdesk/reservation-timeline.html
tl = os.path.join(base, "frontdesk", "reservation-timeline.html")
if os.path.exists(tl):
    c = r(tl)
    c = bulk_replace(c, [
        (">New Booking<", ">신규 예약<"),
        (">Today<", ">오늘<"),
        (">Export<", ">다운로드<"),
        (">Close<", ">닫기<"),
        (">Save<", ">저장<"),
        (">Cancel<", ">취소<"),
        (">Confirm<", ">확정<"),
        ("All Channels", "전체 채널"),
        ("All Status", "전체 상태"),
    ])
    w(tl, c)
    print("OK reservation-timeline.html")

# reservation-list.html
rl = os.path.join(base, "frontdesk", "reservation-list.html")
if os.path.exists(rl):
    c = r(rl)
    c = bulk_replace(c, [
        (">New Booking<", ">신규 예약<"),
        (">Export<", ">다운로드<"),
        (">Close<", ">닫기<"),
        (">Save<", ">저장<"),
        (">Cancel<", ">취소<"),
        (">Confirm<", ">확정<"),
        (">Edit<", ">수정<"),
        (">Delete<", ">삭제<"),
        ("All Channels", "전체 채널"),
        ("All Status", "전체 상태"),
        ("Booking List", "예약 목록"),
        ("Booking #", "예약번호"),
        ("Check-in", "체크인"),
        ("Check-out", "체크아웃"),
    ])
    w(rl, c)
    print("OK reservation-list.html")

print("Done!")
