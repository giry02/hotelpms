import os
import glob
import re

base_dir = r"e:\AI_Project\Hotel_PMS\dashboard"
css_dir = os.path.join(base_dir, "common", "css")

css_basenames = [os.path.basename(f) for f in glob.glob(os.path.join(css_dir, "*.css"))]

html_files = glob.glob(os.path.join(base_dir, "**", "*.html"), recursive=True)

for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    html_dir = os.path.dirname(html_file)
    rel_path_to_css_dir = os.path.relpath(css_dir, html_dir).replace('\\', '/')
    
    def replacer(match):
        prefix = match.group(1) # href="
        quote = match.group(2)  # "
        path = match.group(3)   # dashboard.css
        basename = os.path.basename(path)
        
        if basename in css_basenames:
            if 'cdnjs.cloudflare.com' in path:
                return match.group(0)
            return f'{prefix}{rel_path_to_css_dir}/{basename}{quote}'
        return match.group(0)
        
    # Regex to match href="somepath/file.css"
    new_content = re.sub(r'(href=(["\']))([^"\']+\.css)\2', replacer, content)
    
    if new_content != content:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated CSS links in {os.path.basename(html_file)}")
