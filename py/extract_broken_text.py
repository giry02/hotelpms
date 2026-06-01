import re
import os

files = [
    r'E:\AI_Project\Hotel_PMS\dashboard\settings\billing.html',
    r'E:\AI_Project\Hotel_PMS\dashboard\settings\notices.html',
    r'E:\AI_Project\Hotel_PMS\dashboard\settings\support.html'
]

broken_texts = set()

for path in files:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Find all substrings that contain non-ASCII characters
            # (including Korean/Hanja/etc)
            matches = re.findall(r'>([^<]*[^\x00-\x7F]+[^<]*)<', content)
            for m in matches:
                m = m.strip()
                if m:
                    broken_texts.add(m)
            # Also check attributes like placeholder="...", title="..."
            attr_matches = re.findall(r'placeholder="([^"]*[^\x00-\x7F]+[^"]*)"', content)
            for m in attr_matches:
                broken_texts.add(m.strip())

with open('broken_text_list.txt', 'w', encoding='utf-8') as out_f:
    for i, text in enumerate(sorted(list(broken_texts))):
        out_f.write(f"{i}: {text}\n")
