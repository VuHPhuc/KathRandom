import re
import urllib.request
import os
import sys

BASE_URL = 'https://wheelofnames.com'
TARGET_DIR = 'won_download'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

os.makedirs(f'{TARGET_DIR}/assets', exist_ok=True)
os.makedirs(f'{TARGET_DIR}/images', exist_ok=True)
os.makedirs(f'{TARGET_DIR}/icons', exist_ok=True)

downloaded = set()
for root, dirs, files in os.walk(TARGET_DIR):
    for f in files:
        rel = os.path.relpath(os.path.join(root, f), TARGET_DIR).replace('\\', '/')
        downloaded.add('/' + rel)

def download_file(rel_path):
    if rel_path in downloaded:
        return
    url = BASE_URL + rel_path
    local_path = os.path.join(TARGET_DIR, rel_path.lstrip('/'))
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            with open(local_path, 'wb') as f:
                f.write(data)
        downloaded.add(rel_path)
        print(f"Downloaded: {rel_path} ({len(data)} bytes)")
    except Exception as e:
        print(f"Error {rel_path}: {e}")

# Scan assets
queue = list(downloaded)
scanned = set()

while queue:
    item = queue.pop(0)
    if item in scanned:
        continue
    scanned.add(item)
    
    local_path = os.path.join(TARGET_DIR, item.lstrip('/'))
    if not os.path.exists(local_path):
        continue
    
    # check extension
    ext = os.path.splitext(item)[1].lower()
    if ext in ['.js', '.css', '.html']:
        try:
            content = open(local_path, 'r', encoding='utf-8', errors='ignore').read()
            # find all paths starting with /assets/ or /images/ or /icons/
            matches = re.findall(r'[\'\"\(](/assets/[^\'\"\)\s\?#]+|/images/[^\'\"\)\s\?#]+|/icons/[^\'\"\)\s\?#]+)[\'\"\)]', content)
            for m in matches:
                if m not in downloaded:
                    download_file(m)
                    queue.append(m)
        except Exception as e:
            pass

print(f"Total downloaded files: {len(downloaded)}")
