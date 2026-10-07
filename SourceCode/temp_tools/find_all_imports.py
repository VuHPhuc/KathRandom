import os, re

for fname in os.listdir('won_download/assets'):
    if fname.endswith('.js'):
        path = os.path.join('won_download/assets', fname)
        c = open(path, 'r', encoding='utf-8', errors='ignore').read()
        matches = re.findall(r'from\s*[\'\"].*?[\'\"]', c)
        for m in matches:
            print(f"{fname}: {m}")
