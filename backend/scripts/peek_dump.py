import gzip
import json
import os

path = os.path.join('backend', 'full_database_dump.json.gz.bak')

try:
    with gzip.open(path, 'rt', encoding='utf-8') as f:
        # Read the first 1000 characters to see structure
        print(f.read(1000))
except Exception as e:
    print(f"Error reading dump: {e}")
