import gzip
import json
import os

backup_path = os.path.join('backend', 'full_database_dump.json.gz.bak')
output_make = os.path.join('backend', 'yard_make_recovered.json')
output_part = os.path.join('backend', 'yard_part_recovered.json')

print(f"Extracting linkage tables from: {backup_path}")

try:
    count_make = 0
    count_part = 0
    
    with open(output_make, 'w', encoding='utf-8') as f_make, open(output_part, 'w', encoding='utf-8') as f_part:
        f_make.write("[\n")
        f_part.write("[\n")
        
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
                        model = obj.get('model', '')
                        
                        if model == 'hollander.yardmake':
                            if count_make > 0: f_make.write(",\n")
                            json.dump(obj, f_make)
                            count_make += 1
                        elif model == 'hollander.yardparts':
                            if count_part > 0: f_part.write(",\n")
                            json.dump(obj, f_part)
                            count_part += 1
                            
                        if (count_make + count_part) % 10000 == 0:
                            print(f"Found {count_make:,} makes, {count_part:,} parts...", end='\r')
                                
                        buffer = buffer[idx + end_idx:]
                        
                    except json.JSONDecodeError:
                        break
        
        f_make.write("\n]")
        f_part.write("\n]")
        
    print(f"\n✅ Extracted {count_make:,} YardMake and {count_part:,} YardPart records.")

except Exception as e:
    print(f"\nError: {e}")
