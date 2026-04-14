"""
Targeted page-level fixes for JYNM light theme.
Fixes remaining dark backgrounds in specific component patterns.
"""
import os
import re

TARGET_DIR = r"c:\Users\saksa\OneDrive\Desktop\junkyard\junkyard\frontend\src"

# Each tuple: (exact_from, exact_to)
TARGETED_FIXES = [
    # ====== ALLVENDORS sticky search bar ======
    (
        "background: 'rgba(6,12,20,0.95)',\n                    backdropFilter: 'blur(20px)',\n                    borderBottom: '1px solid rgba(37,99,235,0.1)',\n                    boxShadow: '0 4px 30px rgba(0,0,0,0.4)'",
        "background: 'rgba(255,255,255,0.97)',\n                    backdropFilter: 'blur(20px)',\n                    borderBottom: '1px solid rgba(15,23,42,0.08)',\n                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)'"
    ),
    # ====== ALLVENDORS vendor card background ======
    (
        "background: 'linear-gradient(135deg, rgba(15,31,56,0.95), rgba(240,245,250,0.9))',",
        "background: '#ffffff',"
    ),
    # ====== ALLVENDORS stat pills border (old neon ref) ======
    (
        "border: `1px solid rgba(${s.color === 'var(--neon-blue)' ? '0,212,255' : '255,107,0'},0.18)`,",
        "border: `1px solid rgba(${s.color === 'var(--neon-blue)' ? '37,99,235' : '234,88,12'},0.2)`,"
    ),
    # ====== About hero stat cards ======
    (
        "background: 'rgba(240,245,250,0.6)', border: '1px solid rgba(37,99,235,0.1)', backdropFilter: 'blur(10px)'",
        "background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)'"
    ),
    # ====== About / features section cards ======
    (
        "background: 'rgba(240,245,250,0.7)', border: '1px solid rgba(37,99,235,0.1)', backdropFilter: 'blur(12px)'",
        "background: '#ffffff', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'"
    ),
    # ====== About hero text: --text-primary on dark hero image ======
    # The h1 in about hero uses var(--text-primary) which is dark. Since it's over a dark hero image, it needs to be white.
    # We target the specific h1 inside hero-content
    (
        "color: 'var(--text-primary)', fontFamily: \"'Outfit', sans-serif\", letterSpacing: '-0.02em', lineHeight: 1.1 }}\n                        >\n                            The Future of",
        "color: '#ffffff', fontFamily: \"'Outfit', sans-serif\", letterSpacing: '-0.02em', lineHeight: 1.1, textShadow: '0 2px 15px rgba(0,0,0,0.5)' }}\n                        >\n                            The Future of"
    ),
    # ====== About hero subtitle p tag ======
    (
        "color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: '600px', margin: '0 auto' }}\n                            We're revolutionizing",
        "color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: '600px', margin: '0 auto' }}\n                            We're revolutionizing"
    ),
    # ====== About hero badge border over dark hero ======
    (
        "background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}\n                         \u003e\n                             \u003cspan style={{ color: 'var(--neon-blue)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: \"'JetBrains Mono', monospace\" }}\u003e\n                                 About Us",
        "background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)' }}\n                         \u003e\n                             \u003cspan style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: \"'JetBrains Mono', monospace\" }}\u003e\n                                 About Us"
    ),
    # ====== General: dark card gradients left over ======
    (
        "background: 'linear-gradient(135deg, rgba(15,31,56,0.9), rgba(240,245,250,0.6))'",
        "background: '#ffffff'"
    ),
    (
        "background: 'linear-gradient(135deg, rgba(15,31,56,0.9), rgba(10,22,40,0.8))'",
        "background: '#ffffff'"
    ),
    (
        "background: 'rgba(15,31,56,0.6)'",
        "background: '#ffffff'"
    ),
    (
        "background: 'rgba(15,31,56,0.8)'",
        "background: '#ffffff'"
    ),
    (
        "background: 'rgba(6,12,20,0.65)'",
        "background: '#ffffff'"
    ),
    (
        "background: 'rgba(6,12,20,0.85)'",
        "background: '#ffffff'"
    ),
    (
        "background: 'rgba(10,22,40,0.8)'",
        "background: '#ffffff'"
    ),
    (
        "background: 'rgba(10,22,40,0.9)'",
        "background: '#ffffff'"
    ),
    # ====== Search page filter background ======
    (
        "background: 'rgba(6,12,20,0.8)'",
        "background: '#ffffff'"
    ),
    (
        "background: 'rgba(6,12,20,0.7)'",
        "background: '#f8fafc'"
    ),
    # ====== LeadForm dark boxes ======
    (
        "background: 'rgba(6,12,20,0.65)'",
        "background: '#ffffff'"
    ),
]

def process_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    for old, new in replacements:
        content = content.replace(old, new)
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    modified = 0
    for root, dirs, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith(('.jsx', '.js', '.tsx')):
                fp = os.path.join(root, file)
                if process_file(fp, TARGETED_FIXES):
                    print(f"Updated: {fp}")
                    modified += 1
    print(f"\nDone. Modified {modified} files.")

if __name__ == '__main__':
    main()
