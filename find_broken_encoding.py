import os

bad_files = []
for root, _, files in os.walk(r'E:\AI_Project\Hotel_PMS'):
    for f in files:
        if f.endswith('.html') or f.endswith('.js') or f.endswith('.css'):
            p = os.path.join(root, f)
            try:
                with open(p, 'r', encoding='utf-8') as file:
                    file.read()
            except UnicodeDecodeError:
                bad_files.append(p)

print("Non-UTF-8 Files:")
for b in bad_files:
    print(b)
