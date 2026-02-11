import os

def check_status_and_read_logo_script():
    # 1. Find and Read match_logos.py
    print("--- Reading match_logos.py ---")
    found_path = None
    for root, dirs, files in os.walk('backend'):
        if 'match_logos.py' in files:
            found_path = os.path.join(root, 'match_logos.py')
            print(f"FOUND: {found_path}")
            print("-" * 20)
            try:
                with open(found_path, 'r', encoding='utf-8') as f:
                    print(f.read())
            except Exception as e:
                print(f"Error reading file: {e}")
            print("-" * 20)
            break
            
    if not found_path:
        print("❌ match_logos.py NOT FOUND")

    # 2. Check JSONL Files
    print("\n--- Pipeline Progress (JSONL Sizes) ---")
    files = [f for f in os.listdir('backend') if f.endswith('.jsonl')]
    files.sort()
    for f in files:
        path = os.path.join('backend', f)
        size_mb = os.path.getsize(path) / (1024*1024)
        print(f"{f:<25} : {size_mb:.2f} MB")

if __name__ == "__main__":
    check_status_and_read_logo_script()
