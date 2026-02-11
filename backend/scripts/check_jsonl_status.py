import os

def check_jsonl_status():
    print(f"{'File':<30} | {'Size (MB)':<10} | {'Status'}")
    print("-" * 60)
    
    files = [f for f in os.listdir('backend') if f.endswith('.jsonl')]
    files.sort()
    
    for f in files:
        path = os.path.join('backend', f)
        size_mb = os.path.getsize(path) / (1024 * 1024)
        status = "Empty" if size_mb == 0 else "Has Data"
        print(f"{f:<30} | {size_mb:<10.2f} | {status}")

if __name__ == "__main__":
    check_jsonl_status()
