import re
import os

for fname in os.listdir('won_download/assets'):
    if fname.endswith('.js'):
        path = os.path.join('won_download/assets', fname)
        c = open(path, 'r', encoding='utf-8', errors='ignore').read()
        if 'Fatima' in c:
            print(f"Found 'Fatima' in {fname}!")
            # Find snippet around Fatima
            idx = c.find('Fatima')
            print(c[max(0, idx-200):min(len(c), idx+200)])
