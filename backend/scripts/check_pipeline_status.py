import os

def check_status():
    # 1. Find match_logos.py
    print("--- Searching for match_logos.py ---")
    found = False
    for root, dirs, files in os.walk('backend'):
        if 'match_logos.py' in files:
            print(os.path.join(root, 'match_logos.py'))
            found = True
            break
    if not found:
        print("❌ match_logos.py NOT FOUND")

    # 2. Check JSONL files
    print("\n--- Checking JSONL Files ---")
    files = [f for f in os.listdir('backend') if f.endswith('.jsonl')]
    if not files:
        print("❌ No JSONL files found.")
    else:
        for f in files:
            path = os.path.join('backend', f)
            size = os.path.getsize(path) / (1024*1024)
            print(f"{f}: {size:.2f} MB")
            
            # Check if empty
            if size == 0:
                print(f"  ⚠️ EMPTY")
            else:
                try:
                    with open(path, 'r', encoding='utf-8') as content:
                        line = content.readline().strip()
                        print(f"  ✅ Content: {line[:50]}...")
                except Exception as e:
                    print(f"  ❌ Read Error: {e}")

if __name__ == "__main__":
    check_status()
