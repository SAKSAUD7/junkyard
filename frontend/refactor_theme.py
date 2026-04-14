import os
import re

TARGET_DIR = r"c:\Users\saksa\OneDrive\Desktop\junkyard\junkyard\frontend\src"

REPLACEMENTS = [
    # Backgrounds & Cards
    (r"#020408", "var(--bg-base)"),
    (r"#060c14", "var(--bg-elevated)"),
    (r"#0a1628", "var(--bg-surface)"),
    
    # Text
    (r"#e8f0fe", "var(--text-primary)"),
    (r"#8899aa", "var(--text-secondary)"),
    (r"#445566", "var(--text-muted)"),
    
    # Neon -> Vibrant variables
    (r"#00d4ff", "var(--neon-blue)"),
    (r"#ff6b00", "var(--neon-orange)"),
    
    # RGBA Glassmorphism mappings (Dynamic capturing of opacity)
    # Void background (rgba(2,4,8, x))
    (r"rgba\(2,\s*4,\s*8,\s*([0-9.]+)\)", r"rgba(255,255,255,\1)"),
    
    # Surface/Card background (rgba(10,22,40, x))
    (r"rgba\(10,\s*22,\s*40,\s*([0-9.]+)\)", r"rgba(240,24df,250,\1)"),
    
    # Neon Blue RGBA (rgba(0,212,255, x))
    (r"rgba\(0,\s*212,\s*255,\s*([0-9.]+)\)", r"rgba(37,99,235,\1)"),
    
    # Neon Orange RGBA (rgba(255,107,0, x))
    (r"rgba\(255,\s*107,\s*0,\s*([0-9.]+)\)", r"rgba(234,88,12,\1)"),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    for pattern, replacement in REPLACEMENTS:
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    modified_count = 0
    for root, dirs, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith(".jsx") or file.endswith(".js") or file.endswith(".css"):
                if file == "index.css" or file == "vendor.css":
                    continue # Skip theme files as we already hand-updated them
                filepath = os.path.join(root, file)
                if process_file(filepath):
                    print(f"Updated: {filepath}")
                    modified_count += 1
                    
    print(f"\nDone! Modified {modified_count} files.")

if __name__ == "__main__":
    main()
