import gzip
import json
import os

backup_path = os.path.join('backend', 'full_database_dump.json.gz.bak')
output_path = os.path.join('backend', 'vendors_recovered.json')

print(f"Extracting vendors from: {backup_path}")

try:
    # We will use a generator to read the file and look for "model": "hollander.vendor"
    # Since it's a huge list, we can't load it all.
    # We will read line by line if it's formatted. If it's one long line, we are in trouble.
    # Often dumpdata is one long line.
    
    # Strategy: Read chunks, find "model": "hollander.vendor", backtrack to find start of object "{" 
    # and forward to find end "}".
    
    # Better Strategy: The file likely starts with "[".
    # Then objects separated by ",".
    # We can try to rely on "model" keys.
    
    vendors = []
    
    with gzip.open(backup_path, 'rt', encoding='utf-8') as f:
        # Read the file as a string (hopefully memory allows 1-2GB text?)
        # 1GB compressed might be 10GB uncompressed. Too big.
        
        # Let's try a very simple state machine parser
        buffer = ""
        decoder = json.JSONDecoder()
        
        while True:
            chunk = f.read(1024 * 1024) # 1MB chunk
            if not chunk:
                break
            
            buffer += chunk
            
            # Try to parse objects from the buffer
            while True:
                try:
                    # Skip whitespace/comma/brackets at start
                    idx = 0
                    while idx < len(buffer) and buffer[idx] in ' \t\n\r,[]':
                        idx += 1
                    
                    if idx >= len(buffer):
                        buffer = "" # Consumed all interesting parts
                        break 
                        
                    buffer = buffer[idx:]
                    
                    # Try to decode one object
                    obj, idx = decoder.raw_decode(buffer)
                    
                    # Check if it's a vendor
                    if obj.get('model') == 'hollander.vendor':
                        vendors.append(obj)
                        if len(vendors) % 100 == 0:
                            print(f"Found {len(vendors)}...", end='\r')
                            
                    # Remove parsed object from buffer
                    buffer = buffer[idx:]
                    
                except json.JSONDecodeError:
                    # Not enough data for a full object, need more chunks
                    break
        
    print(f"\n✅ Extracted {len(vendors)} vendor records.")
    
    with open(output_path, 'w', encoding='utf-8') as out:
        json.dump(vendors, out, indent=2)
        
    print(f"Saved to {output_path}")

except Exception as e:
    print(f"Error: {e}")
