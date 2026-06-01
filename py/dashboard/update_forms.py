import os
import re

base_path = r"E:\AI_Project\Hotel_PMS\dashboard"

# 1. Update reservation-list.html to make steps scrollable instead of paginated
res_file = os.path.join(base_path, "frontdesk", "reservation-list.html")
with open(res_file, 'r', encoding='utf-8') as f:
    res_content = f.read()

# Make all steps display block and add bottom margin
res_content = res_content.replace('id="step2-content" style="display:none"', 'id="step2-content" style="display:block;margin-top:24px;padding-top:24px;border-top:1px dashed var(--border)"')
res_content = res_content.replace('id="step3-content" style="display:none"', 'id="step3-content" style="display:block;margin-top:24px;padding-top:24px;border-top:1px dashed var(--border)"')

# Hide the stepper tab header (or make it just a title)
res_content = re.sub(r'<!-- Stepper Header -->.*?<div class="modal-body"', r'<div class="modal-body"', res_content, flags=re.DOTALL)

# Update the footer buttons to only show Submit
res_content = re.sub(r'<button id="btnPrev".*?</button>', '', res_content)
res_content = re.sub(r'<button id="btnNext".*?</button>', '', res_content)
res_content = res_content.replace('id="btnSubmit" class="btn-primary-sm" style="display:none"', 'id="btnSubmit" class="btn-primary-sm"')

# Also remove the `goToStep` logic from JS since it's no longer needed, or just let it be. 
# We'll remove the disabled state from Submit button.
# Actually, the user should be able to submit anytime or only after guest is selected?
# Let's just enable the submit button by default or handle it in JS.
res_content = res_content.replace("document.getElementById('btnNext').disabled = false;", "")
res_content = res_content.replace("document.getElementById('btnNext').disabled = true;", "")

with open(res_file, 'w', encoding='utf-8') as f:
    f.write(res_content)
print("Updated reservation-list.html for scrollable booking flow.")


# 2. Update golf.html to add Total Price and Commission fields
golf_file = os.path.join(base_path, "operations", "golf.html")
with open(golf_file, 'r', encoding='utf-8') as f:
    golf_content = f.read()

golf_billing = """
            <hr style="border:none;border-top:1px solid var(--border2)">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">총 요금 (Total Price) <span style="color:var(--danger)">*</span></label>
                    <input type="number" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%" placeholder="예: 150000">
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">호텔 수익/수수료 (Hotel Commission) <span style="color:var(--danger)">*</span></label>
                    <input type="number" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%" value="30000">
                </div>
            </div>
"""
# Replace the existing Expected Commission field with the new billing block
golf_content = re.sub(r'<div style="display:flex;flex-direction:column;gap:6px">\s*<label[^>]*>예상 수수료.*?</label>.*?</span>\s*</div>', golf_billing, golf_content, flags=re.DOTALL)
with open(golf_file, 'w', encoding='utf-8') as f:
    f.write(golf_content)
print("Updated golf.html billing fields.")


# 3. Update rentacar.html to add Total Price and Commission fields
rent_file = os.path.join(base_path, "operations", "rentacar.html")
with open(rent_file, 'r', encoding='utf-8') as f:
    rent_content = f.read()

rent_billing = """
            <hr style="border:none;border-top:1px solid var(--border2)">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">총 요금 (Total Price) <span style="color:var(--danger)">*</span></label>
                    <input type="number" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%" placeholder="예: 80000">
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">호텔 수익/수수료 (Hotel Commission) <span style="color:var(--danger)">*</span></label>
                    <input type="number" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%" placeholder="예: 15000">
                </div>
            </div>
"""

# Append the billing block before the closing div of the modal body
rent_content = re.sub(r'(<div style="display:flex;flex-direction:column;gap:6px">\s*<label[^>]*>픽업 / 반납 장소.*?</label>.*?</div>\s*)(</div>\s*<div class="modal-footer")', r'\1' + rent_billing + r'\2', rent_content, flags=re.DOTALL)

with open(rent_file, 'w', encoding='utf-8') as f:
    f.write(rent_content)
print("Updated rentacar.html billing fields.")
