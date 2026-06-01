import glob, re, sys
sys.stdout.reconfigure(encoding='utf-8')

files = [
    r'E:\AI_Project\Hotel_PMS\admin\system\users.html',
    r'E:\AI_Project\Hotel_PMS\admin\system\audit-logs.html',
    r'E:\AI_Project\Hotel_PMS\admin\system\helpdesk.html',
    r'E:\AI_Project\Hotel_PMS\admin\system\profile.html'
]

for f in files:
    with open(f, 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()
    
    # We find non-ascii substrings
    matches = re.findall(r'[^a-zA-Z0-9<>\n\r\"\'=\{\}\[\]\-\/\.\(\)\:\;\,]{2,}', content)
    unique_matches = set(m.strip() for m in matches if m.strip())
    
    if unique_matches:
        print(f"--- {f} ---")
        for m in unique_matches:
            # check if it contains korean or broken characters
            print(repr(m))
