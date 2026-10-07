c = open('won_download/assets/index-v432.js', 'r', encoding='utf-8', errors='ignore').read()
import re
matches = [m.start() for m in re.finditer(r'Fl\(|Quicksand', c)]
for idx in matches:
    print("--- MATCH IN INDEX ---")
    print(c[max(0, idx-400):min(len(c), idx+1000)])
