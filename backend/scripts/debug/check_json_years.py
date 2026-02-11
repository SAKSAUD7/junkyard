
import json
import os

path = r"c:\Users\saksa\Videos\jynm_json\jynm_json\years_by_make_model.json"
if not os.path.exists(path):
    print("File not found")
    exit()

with open(path, "r", encoding='utf-8') as f:
    data = json.load(f)

print(f"Total Makes: {len(data)}")
if "Chevrolet" in data:
    print("--- Chevrolet Sample ---")
    ct = 0
    for model, years in data["Chevrolet"].items():
        print(f"{model}: {years}")
        ct += 1
        if ct >= 10: break
else:
    print("Chevrolet NOT in JSON")
