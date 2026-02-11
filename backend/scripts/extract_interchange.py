import gzip
import json
import os

backup_path = os.path.join('backend', 'full_database_dump.json.gz.bak')
output_path = os.path.join('backend', 'interchange_recovered.json')

print(f"Extracting interchange from: {backup_path}")

try:
    count = 0
    with open(output_path, 'w', encoding='utf-8') as out:
        out.write("[\n")
        
        with gzip.open(backup_path, 'rt', encoding='utf-8') as f:
            buffer = ""
            decoder = json.JSONDecoder()
            
            while True:
                chunk = f.read(1024 * 1024 * 10)
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
                        
                        # Match both possible model name patterns
                        model = obj.get('model', '')
                        if model in ['hollander.hollanderinterchange', 'hollander.interchange']:
                            if count > 0:
                                out.write(",\n")
                            json.dump(obj, out)
                            count += 1
                            if count % 10000 == 0:
                                print(f"Found {count:,}...", end='\r')
                                out.flush()
                                
                        buffer = buffer[idx + end_idx:]
                        
                    except json.JSONDecodeError:
                        break
        
        out.write("\n]")
        
    print(f"\n✅ Extracted {count:,} interchange records.")
    print(f"Saved to {output_file}")

except Exception as e:
    print(f"\nError: {e}")
