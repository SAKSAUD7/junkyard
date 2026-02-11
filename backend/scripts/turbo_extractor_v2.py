import os
import json
import gzip
import time

SOURCE_FILE = os.path.join('backend', 'full_database_dump.json.gz.bak')
OUTPUT_DIR = 'backend'

TARGETS = {
    'hollander.hollanderindex': 'hollander_index.jsonl',
    'hollander.profilevisit': 'profile_visit.jsonl',
    'hollander.zipcode': 'zipcode.jsonl',
    'hollander.vehicleimage': 'vehicle_image.jsonl',
    'hollander.hollanderinterchange': 'interchange.jsonl',
    'hollander.interchange': 'interchange.jsonl',
    'hollander.legacyaccount': 'legacy_account.jsonl',
    'hollander.legacyuser': 'legacy_user.jsonl',
    'users.user': 'users_user.jsonl',
    'hollander.yardmake': 'yard_make.jsonl',
    'hollander.yardparts': 'yard_part.jsonl'
}

def robust_turbo():
    print(f"🚀 ROBUST TURBO EXTRACTOR STARTING")
    
    files = {
        name: open(os.path.join(OUTPUT_DIR, name), 'a', encoding='utf-8') 
        for name in set(TARGETS.values())
    }
    
    counts = {name: 0 for name in set(TARGETS.values())}

    with gzip.open(SOURCE_FILE, 'rt', encoding='utf-8') as f:
        # We read line by line if possible? 
        # The dump is likely a single line or list.
        # Let's try to read char by char until we hit a specific marker?
        # No, too slow.
        
        # Let's read in 10MB chunks and use raw_decode properly.
        # Key: Maintain a buffer.
        
        buffer = ""
        decoder = json.JSONDecoder()
        total_read = 0
        
        while True:
            chunk = f.read(1024 * 1024 * 10) # 10MB
            if not chunk: break
            buffer += chunk
            total_read += len(chunk)
            
            while True:
                # Skip whitespace
                buffer = buffer.lstrip()
                if not buffer: break
                
                # Handle list separators
                if buffer.startswith(','): 
                    buffer = buffer[1:]
                    continue
                if buffer.startswith('['): 
                    buffer = buffer[1:]
                    continue
                if buffer.startswith(']'): 
                    # End of list
                    buffer = ""
                    break
                
                try:
                    obj, idx = decoder.raw_decode(buffer)
                    
                    # Logic
                    model = obj.get('model')
                    if model in TARGETS:
                        fname = TARGETS[model]
                        files[fname].write(json.dumps(obj) + "\n")
                        counts[fname] += 1
                        
                        # Flush occasionally for uploader
                        if counts[fname] % 1000 == 0:
                            files[fname].flush()
                            
                    buffer = buffer[idx:]
                    
                except json.JSONDecodeError:
                    # Not enough data for a full object
                    break
            
            # Progress
            print(f"Processed: {total_read / (1024*1024):.1f} MB | Found: {sum(counts.values())}", end='\r')

    print("\n✅ Done")
    for fname, count in counts.items():
        print(f"  {fname}: {count}")

    for f in files.values(): f.close()

if __name__ == "__main__":
    robust_turbo()
