import gzip
import json
import os
import time
import sys

backup_path = os.path.join('backend', 'full_database_dump.json.gz.bak')
output_dir = 'backend'

# Targets
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

def universal_extractor_v2():
    print(f"🚀 UNIVERSAL EXTRACTOR V2 STARTING: {time.ctime()}")
    print(f"📦 Source: {backup_path}")
    
    files = {}
    counts = {}
    
    try:
        # Open output files
        for model, filename in TARGETS.items():
            path = os.path.join(output_dir, filename)
            if path not in files:
                # Open in 'a' append mode to not overwrite what might have been written?
                # No, 'w' to restart clean if valid.
                f = open(path, 'w', encoding='utf-8')
                files[path] = f
                counts[path] = 0
                
        # Read
        with gzip.open(backup_path, 'rt', encoding='utf-8') as f:
            decoder = json.JSONDecoder()
            buffer = ""
            chunk_size = 1024 * 1024 * 5 # 5MB chunks for responsiveness
            
            total_read = 0
            
            while True:
                chunk = f.read(chunk_size)
                if not chunk: break
                buffer += chunk
                total_read += len(chunk)
                
                while True:
                    try:
                        idx = buffer.find('{')
                        if idx == -1:
                            # Keep last part of buffer if no object found? 
                            # Or discard if partial?
                            # json stream usually has objects separated by commas or brackets.
                            # We need to be careful not to discard valid partial data.
                            # Just break to read more.
                            break
                        
                        # Optimization: Skip whitespace/commas
                        # idx is '{'.
                        
                        obj, end_idx = decoder.raw_decode(buffer[idx:])
                        
                        # Process object
                        model = obj.get('model')
                        if model and model in TARGETS:
                            target_file = TARGETS[model]
                            path = os.path.join(output_dir, target_file)
                            out = files[path]
                            out.write(json.dumps(obj) + "\n")
                            out.flush()
                            counts[path] += 1
                        
                        buffer = buffer[idx + end_idx:]
                        
                    except json.JSONDecodeError:
                        break
                        
                # Status update to stdout
                sys.stdout.write(f"\r⚡ Processed {total_read/(1024*1024):.1f} MB source... Models Found: {sum(counts.values()):,}")
                sys.stdout.flush()

        print(f"\n✅ Extraction V2 Complete!")
        for path, count in counts.items():
            print(f"  - {os.path.basename(path)}: {count:,}")
            
    except Exception as e:
        print(f"\n❌ Error V2: {e}")
    finally:
        for f in files.values():
            if not f.closed: f.close()

if __name__ == "__main__":
    universal_extractor_v2()
