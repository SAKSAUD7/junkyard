import gzip
import shutil
import os

input_file = 'backend/full_database_dump.json'
output_file = 'backend/full_database_dump.json.gz'

if not os.path.exists(input_file):
    print(f"❌ Error: {input_file} does not exist.")
    exit(1)

print(f"📦 Compressing {input_file}...")
with open(input_file, 'rb') as f_in:
    with gzip.open(output_file, 'wb') as f_out:
        shutil.copyfileobj(f_in, f_out)

print(f"✅ Created {output_file}")
print(f"Original size: {os.path.getsize(input_file) / 1024 / 1024:.2f} MB")
print(f"Compressed size: {os.path.getsize(output_file) / 1024 / 1024:.2f} MB")
