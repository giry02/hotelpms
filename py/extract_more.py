import re

def extract(path):
    broken = set()
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        matches = re.findall(r'>([^<]*[^\x00-\x7F]+[^<]*)<', content)
        for m in matches:
            if m.strip(): broken.add(m.strip())
        attr_matches = re.findall(r'placeholder="([^"]*[^\x00-\x7F]+[^"]*)"', content)
        for m in attr_matches:
            if m.strip(): broken.add(m.strip())
    return sorted(list(broken))

with open('broken_notices.txt', 'w', encoding='utf-8') as f:
    for i, text in enumerate(extract(r'E:\AI_Project\Hotel_PMS\dashboard\settings\notices.html')):
        f.write(f"{i}: {text}\n")

with open('broken_support.txt', 'w', encoding='utf-8') as f:
    for i, text in enumerate(extract(r'E:\AI_Project\Hotel_PMS\dashboard\settings\support.html')):
        f.write(f"{i}: {text}\n")
