import os

def count_records():
    files = [f for f in os.listdir('backend') if f.endswith('.jsonl')]
    print(f"{'File':<30} | {'Extracted Count':<15} | {'Size (MB)':<10}")
    print("-" * 65)
    
    for f in files:
        path = os.path.join('backend', f)
        size_mb = os.path.getsize(path) / (1024 * 1024)
        
        # Count lines for accurate record count
        count = 0
        try:
            with open(path, 'rb') as fp:
                for _ in fp:
                    count += 1
        except:
            pass
            
        print(f"{f:<30} | {count:<15,d} | {size_mb:<10.2f}")

if __name__ == "__main__":
    count_records()
