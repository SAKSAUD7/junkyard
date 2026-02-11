import gzip
import json
import os
import time

backup_path = os.path.join('backend', 'full_database_dump.json.gz.bak')
output_profile = os.path.join('backend', 'profile_visit_recovered.json')
output_interchange = os.path.join('backend', 'interchange_recovered.json')
output_yardmake = os.path.join('backend', 'yard_make_recovered.json')
output_yardpart = os.path.join('backend', 'yard_part_recovered.json')
output_images = os.path.join('backend', 'vehicle_images_recovered.json')

# Model mapping
TARGET_MODELS = {
    'hollander.profile_visit': output_profile,
    'hollander.hollanderinterchange': output_interchange,
    'hollander.interchange': output_interchange,
    'hollander.yardmake': output_yardmake,
    'hollander.yardparts': output_yardpart,
    'hollander.vehicleimage': output_images
}

def mega_extractor():
    start_time = time.time()
    print(f"🚀 MEGA EXTRACTOR STARTING (FINAL PASS): {time.ctime()}")
    print(f"📦 Source: {backup_path}")
    
    files = {}
    counts = {}
    
    try:
        # Open all output files
        unique_paths = list(set(TARGET_MODELS.values()))
        for path in unique_paths:
            f = open(path, 'w', encoding='utf-8')
            f.write("[\n")
            files[path] = f
            counts[path] = 0
                
        # Single pass through compressed backup
        with gzip.open(backup_path, 'rt', encoding='utf-8') as f:
            decoder = json.JSONDecoder()
            buffer = ""
            
            chunk_size = 1024 * 1024 * 20 # 20MB
            
            while True:
                chunk = f.read(chunk_size)
                if not chunk:
                    break
                
                buffer += chunk
                
                while True:
                    try:
                        idx = buffer.find('{')
                        if idx == -1:
                            buffer = ""
                            break
                        
                        obj, end_idx = decoder.raw_decode(buffer[idx:])
                        model = obj.get('model', '')
                        
                        if model in TARGET_MODELS:
                            path = TARGET_MODELS[model]
                            out = files[path]
                            if counts[path] > 0:
                                out.write(",\n")
                            json.dump(obj, out)
                            counts[path] += 1
                            
                            total_found = sum(counts.values())
                            if total_found % 10000 == 0:
                                elapsed = time.time() - start_time
                                print(f"🔍 Progress: {total_found:,} extracted in {elapsed:.0f}s...", end='\r')
                                
                        buffer = buffer[idx + end_idx:]
                        
                    except json.JSONDecodeError:
                        break
        
        # Close all
        for path, f in files.items():
            f.write("\n]")
            f.close()
            print(f"✅ Extracted {counts[path]:,} records to {os.path.basename(path)}")
            
        print(f"🏁 MEGA EXTRACTION COMPLETE in {time.time() - start_time:.1f}s")

    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {e}")
        # Clean up
        for f in files.values():
            if not f.closed: f.close()

if __name__ == "__main__":
    mega_extractor()
