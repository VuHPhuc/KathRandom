import os

for fname in os.listdir('won_download/assets'):
    if fname.endswith('.js'):
        path = os.path.join('won_download/assets', fname)
        c = open(path, 'r', encoding='utf-8', errors='ignore').read()
        for term in ['requestAnimationFrame', 'pointerChangesColor', 'drawWheel']:
            count = c.count(term)
            if count > 0:
                print(f"{fname}: {term} found {count} times")
