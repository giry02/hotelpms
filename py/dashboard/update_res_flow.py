import os
import re

file_path = r"E:\AI_Project\Hotel_PMS\dashboard\frontdesk\reservation-list.html"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

modal_new = """<!-- New Booking Stepper Modal -->
<div class="modal-overlay" id="newResModal" onclick="if(event.target===this) closeModal('newResModal')">
    <div class="modal-card" style="max-width:700px;width:95vw">
        <div class="modal-header">
            <h3 class="modal-title">신규 예약 등록 (New Booking)</h3>
            <button class="modal-close" onclick="closeModal('newResModal')"><i class="fa-solid fa-xmark"></i></button>
        </div>
        
        <!-- Stepper Header -->
        <div style="display:flex;justify-content:center;gap:30px;padding:20px;border-bottom:1px solid var(--border2);background:#f8fafc">
            <div id="step1-tab" style="font-weight:700;color:var(--primary)"><i class="fa-solid fa-1" style="background:var(--primary);color:#fff;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:0.75rem"></i> 고객 검색</div>
            <div id="step2-tab" style="font-weight:600;color:var(--txt3)"><i class="fa-solid fa-2" style="background:var(--txt3);color:#fff;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:0.75rem"></i> 예약 정보</div>
            <div id="step3-tab" style="font-weight:600;color:var(--txt3)"><i class="fa-solid fa-3" style="background:var(--txt3);color:#fff;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:0.75rem"></i> 확인 및 결제</div>
        </div>

        <div class="modal-body" style="padding:20px;display:flex;flex-direction:column;gap:16px;max-height:60vh;overflow-y:auto">
            
            <!-- STEP 1: Guest Search -->
            <div id="step1-content">
                <div style="display:flex;gap:10px;margin-bottom:16px">
                    <input type="text" id="resGuestSearch" style="flex:1;height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font)" placeholder="이름, 이메일, 전화번호 검색...">
                    <button class="btn-primary-sm" onclick="searchGuest()"><i class="fa-solid fa-magnifying-glass"></i> 검색</button>
                </div>
                
                <div id="guestSearchResults" style="border:1px solid var(--border);border-radius:4px;padding:16px;background:#f8fafc;text-align:center;color:var(--txt2)">
                    검색어를 입력해 주세요.
                </div>
                
                <div id="newGuestForm" style="display:none;margin-top:16px;border:1px solid var(--primary);border-radius:4px;padding:16px;background:#eff6ff">
                    <h4 style="margin-bottom:12px;color:var(--primary)"><i class="fa-solid fa-user-plus"></i> 신규 고객 등록</h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--txt2)">이름 (First Name)*</label>
                            <input type="text" id="newGFName" style="width:100%;height:34px;border:1px solid var(--border);border-radius:4px;padding:0 8px">
                        </div>
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--txt2)">성 (Last Name)*</label>
                            <input type="text" id="newGLName" style="width:100%;height:34px;border:1px solid var(--border);border-radius:4px;padding:0 8px">
                        </div>
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--txt2)">연락처*</label>
                            <input type="text" id="newGPhone" style="width:100%;height:34px;border:1px solid var(--border);border-radius:4px;padding:0 8px">
                        </div>
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--txt2)">국적</label>
                            <input type="text" id="newGNation" style="width:100%;height:34px;border:1px solid var(--border);border-radius:4px;padding:0 8px">
                        </div>
                    </div>
                    <div style="margin-top:12px;display:flex;justify-content:flex-end">
                        <button class="btn-primary-sm" onclick="saveNewGuest()">저장 및 선택</button>
                    </div>
                </div>
            </div>

            <!-- STEP 2: Stay Details -->
            <div id="step2-content" style="display:none">
                <div style="background:var(--bg);padding:12px;border-radius:4px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;border:1px solid var(--border)">
                    <div>
                        <span style="font-size:0.75rem;color:var(--txt3)">선택된 고객:</span>
                        <strong id="selectedGuestName" style="margin-left:8px;font-size:1.05rem;color:var(--txt)">-</strong>
                        <span id="selectedGuestTier" class="role-badge" style="background:var(--primary-lt);color:var(--primary);margin-left:8px"></span>
                    </div>
                    <button class="btn-outline-sm" onclick="goToStep(1)">변경</button>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                    <div>
                        <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">Check-in *</label>
                        <input type="date" style="width:100%;height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font)">
                    </div>
                    <div>
                        <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">Check-out *</label>
                        <input type="date" style="width:100%;height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font)">
                    </div>
                    <div>
                        <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">Room Type *</label>
                        <select style="width:100%;height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);background:#fff">
                            <option>Standard Double</option>
                            <option>Deluxe King</option>
                            <option>Executive Suite</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">요금제 (Rate Plan) *</label>
                        <select style="width:100%;height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);background:#fff">
                            <option>BAR (Best Available Rate)</option>
                            <option>Corporate Rate</option>
                            <option>OTA Promo</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- STEP 3: Confirm -->
            <div id="step3-content" style="display:none">
                <div style="background:#f8fafc;padding:20px;border-radius:4px;border:1px solid var(--border)">
                    <h4 style="margin-bottom:16px">요금 및 결제 정보</h4>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                        <span>객실 요금 (Total Room Rate)</span>
                        <strong style="color:var(--txt)">₩ 240,000</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                        <span>세금 및 봉사료 (Tax & Svc)</span>
                        <strong style="color:var(--txt)">₩ 24,000</strong>
                    </div>
                    <hr style="border:none;border-top:1px solid var(--border);margin:12px 0">
                    <div style="display:flex;justify-content:space-between;font-size:1.1rem;font-weight:700">
                        <span>총 결제 예정 금액</span>
                        <span style="color:var(--primary)">₩ 264,000</span>
                    </div>
                    <div style="margin-top:20px">
                        <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">보증금(Deposit) 결제 방식</label>
                        <select style="width:100%;height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);background:#fff;margin-top:6px">
                            <option>카드 결제 (현장)</option>
                            <option>온라인 결제 완료 (OTA)</option>
                            <option>보증금 없음 (무통장)</option>
                        </select>
                    </div>
                </div>
            </div>

        </div>
        
        <div class="modal-footer" style="padding:16px 20px;border-top:1px solid var(--border2);display:flex;justify-content:space-between;background:#f8fafc;border-radius:0 0 var(--radius-sm) var(--radius-sm)">
            <button class="btn-outline" onclick="closeModal('newResModal')">취소 (Cancel)</button>
            <div>
                <button id="btnPrev" class="btn-outline" style="display:none;margin-right:8px" onclick="goPrev()">이전</button>
                <button id="btnNext" class="btn-primary-sm" onclick="goNext()" disabled>다음 단계 (Next) <i class="fa-solid fa-arrow-right"></i></button>
                <button id="btnSubmit" class="btn-primary-sm" style="display:none" onclick="submitReservation()"><i class="fa-solid fa-check"></i> 예약 확정</button>
            </div>
        </div>
    </div>
</div>
"""

script_new = """<script>
let currentStep = 1;
let selectedGuest = null;

function searchGuest() {
    const q = document.getElementById('resGuestSearch').value;
    const res = document.getElementById('guestSearchResults');
    if(q.trim() === '') {
        res.innerHTML = '검색어를 입력해 주세요.';
        return;
    }
    
    // Dummy Search Logic
    if(q.includes('Tran') || q.includes('Lin')) {
        res.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#fff;border:1px solid var(--border);border-radius:4px;text-align:left">
                <div>
                    <strong>Tran Linh</strong> <span class="role-badge" style="background:var(--purple-lt);color:var(--purple);margin-left:6px">Diamond</span><br>
                    <span style="font-size:0.8rem;color:var(--txt2)">+84 91 888 9999 | Vietnam | 방문 24회</span>
                </div>
                <button class="btn-primary-sm" onclick="selectGuest('Tran Linh', 'Diamond')">선택</button>
            </div>
        `;
        document.getElementById('newGuestForm').style.display = 'none';
    } else {
        res.innerHTML = `<div style="color:var(--danger);margin-bottom:12px">검색 결과가 없습니다.</div>
            <button class="btn-outline-sm" onclick="document.getElementById('newGuestForm').style.display='block'">신규 고객 등록하기</button>`;
    }
}

function selectGuest(name, tier) {
    selectedGuest = { name, tier };
    document.getElementById('selectedGuestName').textContent = name;
    document.getElementById('selectedGuestTier').textContent = tier;
    document.getElementById('btnNext').disabled = false;
    showToast(`${name} 고객이 선택되었습니다.`);
}

function saveNewGuest() {
    const fn = document.getElementById('newGFName').value;
    const ln = document.getElementById('newGLName').value;
    if(!fn || !ln) {
        showToast('이름과 성을 입력해주세요.', 'error');
        return;
    }
    const fullName = `${fn} ${ln}`;
    selectGuest(fullName, 'Standard');
    document.getElementById('newGuestForm').style.display = 'none';
    document.getElementById('resGuestSearch').value = fullName;
    document.getElementById('guestSearchResults').innerHTML = `<div style="color:var(--success);font-weight:600">신규 고객 등록 완료</div>`;
}

function goToStep(step) {
    currentStep = step;
    
    // Update Tabs
    [1,2,3].forEach(i => {
        const t = document.getElementById(`step${i}-tab`);
        if(i === step) {
            t.style.color = 'var(--primary)';
            t.style.fontWeight = '700';
            t.querySelector('i').style.background = 'var(--primary)';
        } else {
            t.style.color = 'var(--txt3)';
            t.style.fontWeight = '600';
            t.querySelector('i').style.background = 'var(--txt3)';
        }
        document.getElementById(`step${i}-content`).style.display = (i === step) ? 'block' : 'none';
    });

    // Update Buttons
    document.getElementById('btnPrev').style.display = (step > 1) ? 'inline-block' : 'none';
    if(step === 3) {
        document.getElementById('btnNext').style.display = 'none';
        document.getElementById('btnSubmit').style.display = 'inline-block';
    } else {
        document.getElementById('btnNext').style.display = 'inline-block';
        document.getElementById('btnSubmit').style.display = 'none';
    }
}

function goNext() { if(currentStep < 3) goToStep(currentStep + 1); }
function goPrev() { if(currentStep > 1) goToStep(currentStep - 1); }

function submitReservation() {
    showToast('예약이 성공적으로 등록되었습니다.');
    closeModal('newResModal');
    // Reset stepper
    setTimeout(() => {
        goToStep(1);
        selectedGuest = null;
        document.getElementById('btnNext').disabled = true;
        document.getElementById('resGuestSearch').value = '';
        document.getElementById('guestSearchResults').innerHTML = '검색어를 입력해 주세요.';
    }, 500);
}
</script>
</body>"""

content = re.sub(r'<!-- Add Reservation Modal -->.*?</div>\s*</div>\s*</div>', modal_new, content, flags=re.IGNORECASE|re.DOTALL)
content = re.sub(r'<div class="modal-overlay" id="newResModal".*?</div>\s*</div>\s*</div>', modal_new, content, flags=re.IGNORECASE|re.DOTALL)

content = content.replace("</body>", script_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected Guest-First Reservation Workflow")
