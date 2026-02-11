import gzip
import json
import os

backup_path = os.path.join('backend', 'full_database_dump.json.gz.bak')
print(f"Inspecting: {backup_path}")

try:
    with gzip.open(backup_path, 'rt', encoding='utf-8') as f:
        # It's likely a large JSON list
        # We can't load it all into memory easily if 1GB
        # But we can try to read chunk by chunk or use ijson if available
        # Or just read the first few lines to see format
        
        # Checking first 1000 chars
        content = f.read(1000)
        print(f"Header: {content[:200]}...")
        
        # If it is standard Django dumpdata (list of objects)
        # We need to scan for model: "hollander.vendor"
        
        f.seek(0)
        count = 0
        vendor_count = 0
        
        # Simple scan for "model": "hollander.vendor" provided it is formatted nicely
        # If minified, this is hard.
        
        # Let's try to stream parse
        # Since standard json lib expects full document, we might need a trick
        # or manual scan
        
        # Just searching for occurrences of the string
        chunk_size = 1024 * 1024 # 1MB
        import re
        vendor_pattern = re.compile(r'"model":\s*"hollander\.vendor"')
        
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            matches = vendor_pattern.findall(chunk)
            vendor_count += len(matches)
            # Handle boundary overlap? Ignore for rough count
            
            count += 1
            if count % 100 == 0:
                print(f"Read {count} MB...", end='\r')
                
        print(f"\nFound {vendor_count} vendor records in backup.")

except Exception as e:
    print(f"Error: {e}")
