import re

content = open('won_download/assets/index-v432.js', 'r', encoding='utf-8', errors='ignore').read()
matches = re.findall(r'\[(?:[\'\"]#[0-9a-fA-F]{6}[\'\"],\s*){2,}[\'\"]#[0-9a-fA-F]{6}[\'\"]\]', content)
print(f"Total palettes found: {len(matches)}")
for m in matches[:15]:
    print(m)
