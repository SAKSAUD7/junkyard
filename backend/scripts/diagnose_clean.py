import os

def check_status_clean():
    # 1. Find match_logos.py
    with open('backend/found_logo_path.txt', 'w') as out:
        for root, dirs, files in os.walk('backend'):
            if 'match_logos.py' in files:
                path = os.path.join(root, 'match_logos.py')
                out.write(path)
                break
    
    # 2. Sizes
    with open('backend/pipeline_sizes.txt', 'w') as out:
        files = [f for f in os.listdir('backend') if f.endswith('.jsonl')]
        files.sort()
        for f in files:
            path = os.path.join('backend', f)
            size = os.path.getsize(path)
            out.write(f"{f}: {size} bytes\n")

if __name__ == "__main__":
    check_status_clean()
