import gzip
import json
import os

backup_path = os.path.join('backend', 'full_database_dump.json.gz.bak')
output_path = os.path.join('backend', 'profile_visit_recovered.json')

print(f"Extracting profile visits from: {backup_path}")

try:
    # Use a more efficient extraction:
    # 1. Find the start of a "hollander.profile_visit" object.
    # 2. Extract the object string.
    # 3. Batch write periodically.
    
    count = 0
    batch = []
    
    # We will write as a JSON array [{},{},...] but by manual string wrapping
    # to allow incremental writes.
    with open(output_path, 'w', encoding='utf-8') as out:
        out.write("[\n") # Start of array
        
        with gzip.open(backup_path, 'rt', encoding='utf-8') as f:
            buffer = ""
            decoder = json.JSONDecoder()
            
            while True:
                chunk = f.read(1024 * 1024 * 10) # 10MB chunk
                if not chunk:
                    break
                
                buffer += chunk
                
                while True:
                    try:
                        # Skip until {
                        idx = buffer.find('{')
                        if idx == -1:
                            buffer = ""
                            break
                        
                        # Optimization: only attempt decode if "profile_visit" is in the chunk
                        # and reasonably close to the start.
                        # This is risky if objects are very large, but profile_visit is small.
                        
                        obj, end_idx = decoder.raw_decode(buffer[idx:])
                        
                        if obj.get('model') == 'hollander.profile_visit':
                            if count > 0:
                                out.write(",\n")
                            json.dump(obj, out)
                            count += 1
                            if count % 10000 == 0:
                                print(f"Found {count:,}...", end='\r')
                                out.flush() # Ensure it's on disk
                                
                        buffer = buffer[idx + end_idx:]
                        
                    except json.JSONDecodeError:
                        break
        
        out.write("\n]") # End of array
        
    print(f"\n✅ Extracted {count:,} profile visit records.")
    print(f"Saved to {output_path}")

except Exception as e:
    print(f"\nError: {e}")
