import os, re

for fname in os.listdir('won_download/assets'):
    if fname.endswith('.js') and fname != 'stores-v432.js':
        path = os.path.join('won_download/assets', fname)
        c = open(path, 'r', encoding='utf-8', errors='ignore').read()
        if 'Fl(' in c or 'Nl' in c or 'Quicksand' in c:
            print(f"Found in {fname}")
