c = open('won_download/assets/stores-v432.js', 'r', encoding='utf-8', errors='ignore').read()
import re
matches = [m.start() for m in re.finditer(r'canvas', c, re.IGNORECASE)]
print(f"Occurrences of canvas in stores-v432.js: {len(matches)}")
for idx in matches:
    print("---")
    print(c[max(0, idx-100):min(len(c), idx+150)])
