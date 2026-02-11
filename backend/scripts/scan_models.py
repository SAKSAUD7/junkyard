import gzip
import json
import os
from collections import Counter

backup_path = os.path.join('backend', 'full_database_dump.json.gz.bak')

def scan_model_names():
    print(f"🔍 Scanning model names in {backup_path}...")
    model_counts = Counter()
    
    try:
        with gzip.open(backup_path, 'rt', encoding='utf-8') as f:
            decoder = json.JSONDecoder()
            buffer = ""
            count = 0
            
            while count < 50000: # Scan first 50k objects to get a good sample of table names
                chunk = f.read(1024 * 1024)
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
                        if model:
                            model_counts[model] += 1
                        count += 1
                        buffer = buffer[idx + end_idx:]
                    except json.JSONDecodeError:
                        break
                        
        print("\n📊 Found Models (Sample):")
        for model, count in model_counts.most_common():
            print(f"  - {model}: {count}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    scan_model_names()
