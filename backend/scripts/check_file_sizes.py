import os

def check_file(path):
    if os.path.exists(path):
        size = os.path.getsize(path)
        print(f"{path}: {size:,} bytes")
    else:
        print(f"{path}: NOT FOUND")

check_file('backend/full_database_dump.json.gz.bak')
