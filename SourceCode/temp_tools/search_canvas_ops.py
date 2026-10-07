c = open('won_download/assets/stores-v432.js', 'r', encoding='utf-8', errors='ignore').read()
import re

for op in ['\\.arc\\(', '\\.beginPath\\(', 'drawImage', 'fillText', 'strokeText', 'pointer', 'tick']:
    matches = len(re.findall(op, c))
    print(f"op '{op}': {matches} matches")
