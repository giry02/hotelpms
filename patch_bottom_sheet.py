import glob

files = glob.glob('dashboard/**/*.html', recursive=True)
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if '.bottom-sheet{' in content:
        content = content.replace(
            '.bottom-sheet{',
            '.bottom-sheet{display:flex;flex-direction:column;'
        )
    if '.bottom-sheet-options{' in content:
        content = content.replace(
            '.bottom-sheet-options{',
            '.bottom-sheet-options{overflow-y:auto;flex:1;'
        )
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
