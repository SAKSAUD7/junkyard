import os
import re

TARGET_DIR = r"c:\Users\saksa\OneDrive\Desktop\junkyard\junkyard\frontend\src"

REPLACEMENTS = [
    # 1. Fix typo from previous script
    (r"24df", "245"),
    
    # 2. Fix faint texts that were missed
    (r"#aabbcc", "var(--text-secondary)"),
    (r"text-white\/(?:60|70|80|90)", "text-slate-600"),
    (r"text-white\/30", "text-slate-400"),
    
    # 3. Replace Tailwind explicit dark backgrounds
    (r"bg-dark-900\/\d+", "bg-white/90"),
    (r"bg-dark-900", "bg-white"),
    (r"bg-dark-950", "bg-slate-50"),
    (r"bg-dark-800", "bg-slate-100"),
    (r"bg-gray-900", "bg-white"),
    (r"bg-gray-800", "bg-slate-50"),
    (r"text-white", "text-slate-800"),  # We'll bravely replace text-white for total light mode switch, then fix buttons specifically if needed. Wait, actually, let's just replace it where it follows specific dark classes.
    # Actually, replacing text-white blindly will turn button text black (e.g. bg-blue-600 text-white). 
    # Let's use a regex to NOT replace text-white if it's accompanied by bg-blue or bg-teal.
    # A safer approach: I won't globally replace text-white. I'll rely on the specific fixes.
]

# We need to selectively replace text-white
def fix_text_white(content):
    # If the element has bg-blue, bg-teal, bg-red, etc., keep text-white.
    # Otherwise, replace text-white with text-slate-800.
    # As this implies complex AST parsing, let's just do a blanket replace and fix the primary button class.
    content = re.sub(r"\btext-white\b", "text-slate-800", content)
    # Restore text-white for buttons and icons
    content = re.sub(r"bg-blue-(\d00) text-slate-800", r"bg-blue-\1 text-white", content)
    content = re.sub(r"bg-teal-(\d00) text-slate-800", r"bg-teal-\1 text-white", content)
    content = re.sub(r"bg-green-(\d00) text-slate-800", r"bg-green-\1 text-white", content)
    content = re.sub(r"bg-amber-(\d00) text-slate-800", r"bg-amber-\1 text-white", content)
    content = re.sub(r"bg-red-(\d00) text-slate-800", r"bg-red-\1 text-white", content)
    content = re.sub(r"text-slate-800( mb-2)", r"text-slate-800\1", content) # just examples
    
    # Specific fix for LeadForm success checkmark
    content = content.replace('text-slate-800" fill="none"', 'text-white" fill="none"')
    
    # Specific fix for buttons with gradient
    content = content.replace('from-blue-600 to-teal-600 text-slate-800', 'from-blue-600 to-teal-600 text-white')
    content = content.replace('from-blue-500 to-cyan-500 text-slate-800', 'from-blue-500 to-cyan-500 text-white')
    content = content.replace('from-blue-600 hover:to-cyan-600 text-slate-800', 'from-blue-600 hover:to-cyan-600 text-white')
    content = content.replace('from-blue-600 to-cyan-600 text-slate-800', 'from-blue-600 to-cyan-600 text-white')
    content = content.replace('to-teal-600 rounded-t-xl p-2 md:p-3 text-center shadow-md', 'to-teal-600 rounded-t-xl p-2 md:p-3 text-center shadow-md text-white')
    
    # Hero Navbar Brand text fix
    # Since text-white in Navbar might be gone, we mapped var(--text-primary).
    return content

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    for pattern, replacement in REPLACEMENTS:
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
        
    content = fix_text_white(content)

    # Some remaining gradient fixes for light mode
    content = content.replace('from-gray-900 to-gray-800', 'from-white to-slate-50')
    content = content.replace('from-gray-900 via-gray-800 to-gray-900', 'from-white via-slate-50 to-white')
    content = content.replace('shadow-gray-900/10', 'shadow-slate-200/50')
    content = content.replace('border-white/10', 'border-slate-200')
    content = content.replace('border-white/20', 'border-slate-300')
    content = content.replace('border-white/30', 'border-slate-300')

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    modified_count = 0
    for root, dirs, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith(".jsx") or file.endswith(".js") or file.endswith(".tsx"):
                filepath = os.path.join(root, file)
                if process_file(filepath):
                    print(f"Updated: {filepath}")
                    modified_count += 1
                    
    print(f"\nDone! Modified {modified_count} files for contrast mapping.")

if __name__ == "__main__":
    main()
