import os, re

for fname in os.listdir('won_download/assets'):
    if fname.endswith('.js'):
        path = os.path.join('won_download/assets', fname)
        c = open(path, 'r', encoding='utf-8', errors='ignore').read()
        if 'pointerChangesColor' in c:
            print(f"Found pointerChangesColor in {fname}")
            idx = c.find('pointerChangesColor')
            print(c[max(0, idx-500):min(len(c), idx+1000)])
