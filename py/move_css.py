import os
import glob
import re
import shutil

base_dir = r"e:\AI_Project\Hotel_PMS\dashboard"
css_dir = os.path.join(base_dir, "common", "css")

os.makedirs(css_dir, exist_ok=True)

# 1. Find all CSS files and move them to common/css
css_files = glob.glob(os.path.join(base_dir, "**", "*.css"), recursive=True)
css_basenames = []

for css_file in css_files:
    if "common\\css" in css_file or "common/css" in css_file.replace("\\", "/"):
        continue
    basename = os.path.basename(css_file)
    css_basenames.append(basename)
    new_path = os.path.join(css_dir, basename)
    shutil.move(css_file, new_path)
    print(f"Moved {basename} to common/css/")

# If already moved in a previous run
if not css_basenames:
    css_basenames = [os.path.basename(f) for f in glob.glob(os.path.join(css_dir, "*.css"))]

# 2. Update all HTML files
html_files = glob.glob(os.path.join(base_dir, "**", "*.html"), recursive=True)

for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    html_dir = os.path.dirname(html_file)
    rel_path_to_css_dir = os.path.relpath(css_dir, html_dir).replace('\\', '/')
    
    def replacer(match):
        prefix = match.group(1) # href=" or href='
        path = match.group(2)
        quote = match.group(3)
        basename = os.path.basename(path)
        if basename in css_basenames:
            # Avoid fontawesome css replacement
            if 'cdnjs.cloudflare.com' in path:
                return match.group(0)
            return f'{prefix}{rel_path_to_css_dir}/{basename}{quote}'
        return match.group(0)
        
    # Regex to match href="somepath/file.css"
    new_content = re.sub(r'(href=(["\']))([^"\']+\.css)\2', replacer, content)
    
    if new_content != content:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated links in {os.path.basename(html_file)}")
