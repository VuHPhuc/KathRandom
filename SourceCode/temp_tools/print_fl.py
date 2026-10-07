c = open('won_download/assets/stores-v432.js', 'r', encoding='utf-8', errors='ignore').read()
idx = c.find('function Fl(')
print(c[max(0, idx-1000):min(len(c), idx+1000)])
