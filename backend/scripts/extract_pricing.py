import gzip
import json
import os

backup_path = os.path.join('backend', 'full_database_dump.json.gz.bak')
output_path = os.path.join('backend', 'pricing_recovered.json')

print(f"Extracting pricing from: {backup_path}")

try:
    pricing = []
    
    with gzip.open(backup_path, 'rt', encoding='utf-8') as f:
        buffer = ""
        decoder = json.JSONDecoder()
        
        while True:
            chunk = f.read(1024 * 1024 * 5) # 5MB chunk for speed
            if not chunk:
                break
            
            buffer += chunk
            
            while True:
                try:
                    idx = 0
                    while idx < len(buffer) and buffer[idx] in ' \t\n\r,[]':
                        idx += 1
                    
                    if idx >= len(buffer):
                        buffer = ""
                        break 
                        
                    buffer = buffer[idx:]
                    obj, idx = decoder.raw_decode(buffer)
                    
                    # Check if it's pricing
                    if obj.get('model') == 'hollander.partpricing':
                        pricing.append(obj)
                        if len(pricing) % 1000 == 0:
                            print(f"Found {len(pricing)}...", end='\r')
                            
                    buffer = buffer[idx:]
                    
                except json.JSONDecodeError:
                    break
        
    print(f"\n✅ Extracted {len(pricing)} pricing records.")
    
    with open(output_path, 'w', encoding='utf-8') as out:
        json.dump(pricing, out, indent=2)
        
    print(f"Saved to {output_path}")

except Exception as e:
    print(f"Error: {e}")
