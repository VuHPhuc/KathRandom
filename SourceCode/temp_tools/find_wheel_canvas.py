import os, re

for fname in os.listdir('won_download/assets'):
    if fname.endswith('.js'):
        path = os.path.join('won_download/assets', fname)
        c = open(path, 'r', encoding='utf-8', errors='ignore').read()
        for kw in ['canvas', 'wheel', 'spin', 'pointer']:
            matches = len(re.findall(kw, c, re.IGNORECASE))
            if matches > 0:
                print(f"{fname}: '{kw}' found {matches} times")
