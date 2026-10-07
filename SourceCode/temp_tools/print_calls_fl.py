c = open('won_download/assets/stores-v432.js', 'r', encoding='utf-8', errors='ignore').read()
import re
matches = [m.start() for m in re.finditer(r'Fl\(', c)]
print(f"Calls to Fl: {len(matches)}")
for idx in matches:
    print("---")
    print(c[max(0, idx-300):min(len(c), idx+1000)])
