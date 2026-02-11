import gzip
import json
import os
import time

backup_path = os.path.join('backend', 'full_database_dump.json.gz.bak')
output_dir = 'backend'

# Targets
TARGETS = {
    'hollander.hollanderindex': 'hollander_index.jsonl',
    'hollander.profilevisit': 'profile_visit.jsonl',
    'hollander.zipcode': 'zipcode.jsonl',
    'hollander.vehicleimage': 'vehicle_image.jsonl',
    'hollander.hollanderinterchange': 'interchange.jsonl',
    'hollander.interchange': 'interchange.jsonl', # Handle alias
    'hollander.legacyaccount': 'legacy_account.jsonl',
    'hollander.legacyuser': 'legacy_user.jsonl',
    'users.user': 'users_user.jsonl',
    'hollander.yardmake': 'yard_make.jsonl', # Re-doing just in case
    'hollander.yardparts': 'yard_part.jsonl'
}

def universal_extractor():
    print(f"🚀 UNIVERSAL EXTRACTOR STARTING: {time.ctime()}")
    print(f"📦 Source: {backup_path}")
    
    files = {}
    counts = {}
    
    try:
        # Open all output files in append mode (or write)
        for model, filename in TARGETS.items():
            path = os.path.join(output_dir, filename)
            if path not in files:
                f = open(path, 'w', encoding='utf-8')
                files[path] = f
                counts[path] = 0
                
        # Single pass
        with gzip.open(backup_path, 'rt', encoding='utf-8') as f:
            decoder = json.JSONDecoder()
            buffer = ""
            chunk_size = 1024 * 1024 * 50 # 50MB chunks
            
            while True:
                chunk = f.read(chunk_size)
                if not chunk: break
                buffer += chunk
                
                while True:
                    try:
                        idx = buffer.find('{')
                        if idx == -1:
                            buffer = ""
                            break
                        
                        obj, end_idx = decoder.raw_decode(buffer[idx:])
                        model = obj.get('model')
                        
                        target_file = None
                        if model in TARGETS:
                            target_file = TARGETS[model]
                            
                        if target_file:
                            path = os.path.join(output_dir, target_file)
                            out = files[path]
                            # Write JSONL
                            out.write(json.dumps(obj) + "\n")
                            out.flush() # Ensure it's available for tails
                            counts[path] += 1
                            
                        buffer = buffer[idx + end_idx:]
                        
                    except json.JSONDecodeError:
                        break
                        
                # Status update
                total = sum(counts.values())
                if total % 100000 == 0:
                    print(f"⚡ Extracted {total:,} records...", end='\r')

        print(f"\n✅ Extraction Complete!")
        for path, count in counts.items():
            print(f"  - {os.path.basename(path)}: {count:,}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        for f in files.values():
            f.close()

if __name__ == "__main__":
    universal_extractor()
