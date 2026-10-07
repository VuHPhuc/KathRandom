import re

c = open('won_download/assets/index-v432.js', 'r', encoding='utf-8', errors='ignore').read()
matches = re.findall(r'from\s*[\'\"].*?[\'\"]', c)
print(f"Imports in index-v432.js: {len(matches)}")
for m in matches:
    print(m)
