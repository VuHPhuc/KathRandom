import re

content = open('won_download/assets/index-v432.js', 'r', encoding='utf-8', errors='ignore').read()
css_content = open('won_download/assets/index-BwMAvksz.css', 'r', encoding='utf-8', errors='ignore').read()
html_content = open('won_source.html', 'r', encoding='utf-8', errors='ignore').read()

all_text = content + '\n' + css_content + '\n' + html_content
matches = set(re.findall(r'([a-zA-Z0-9_\-\./]+\.(?:png|svg|jpg|jpeg|ico|webp))', all_text))
for m in sorted(matches):
    if any(m.endswith(ext) for ext in ['.png', '.svg', '.ico']):
        print(m)
