import os

def check_logo_dir():
    # Expected path from match_logos.py logic:
    # project_root / 'frontend' / 'public' / 'images' / 'vendors'
    
    base_dir = os.getcwd() # c:\Users\saksa\OneDrive\Desktop\junkyard\junkyard
    frontend_dir = os.path.join(base_dir, 'frontend', 'public', 'images', 'vendors')
    
    print(f"Checking: {frontend_dir}")
    if os.path.exists(frontend_dir):
        files = os.listdir(frontend_dir)
        print(f"✅ Directory exists. Contains {len(files)} files.")
        print("Sample:", files[:5])
    else:
        print("❌ Directory NOT FOUND")
        
        # Search for where 'vendors' might be
        print("Searching for 'vendors' directory...")
        for root, dirs, files in os.walk(base_dir):
            if 'vendors' in dirs and 'images' in root:
                print(f"Found candidate: {os.path.join(root, 'vendors')}")

if __name__ == "__main__":
    check_logo_dir()
