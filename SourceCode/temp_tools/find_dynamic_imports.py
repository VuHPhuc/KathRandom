import re

c = open('won_download/assets/index-v432.js', 'r', encoding='utf-8', errors='ignore').read()
matches = re.findall(r'import\([\'\"].*?[\'\"]\)', c)
print(f"Dynamic imports in index-v432.js: {len(matches)}")
for m in matches:
    print(m)

# Also check stores-v432.js
c2 = open('won_download/assets/stores-v432.js', 'r', encoding='utf-8', errors='ignore').read()
matches2 = re.findall(r'import\([\'\"].*?[\'\"]\)', c2)
print(f"Dynamic imports in stores-v432.js: {len(matches2)}")
for m in matches2:
    print(m)
