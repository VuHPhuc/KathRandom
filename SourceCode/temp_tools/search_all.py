import os, re

for root, dirs, files in os.walk('won_download'):
    for f in files:
        path = os.path.join(root, f)
        try:
            c = open(path, 'r', encoding='utf-8', errors='ignore').read()
            for op in ['\\.arc\\(', 'beginPath', 'requestAnimationFrame', 'wheel']:
                m = len(re.findall(op, c))
                if m > 0:
                    print(f"{f}: {op} -> {m}")
        except:
            pass
