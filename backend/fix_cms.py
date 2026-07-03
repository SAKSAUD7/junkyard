"""
CMS Database Cleanup Script
============================
1. Converts all 'html' content_type fields to 'textarea' in the live database
2. Strips Quill editor HTML wrapper tags from heading/subheading values
   that were corrupted by the visual editor (e.g. <h1 class="ql-align-center">...)
3. Restores clean default values for corrupted fields
"""

import os
import sys
import re
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.cms.models import SiteContent

def strip_quill_html(value):
    """Remove Quill editor wrapper tags and restore clean HTML-allowed values."""
    if not value:
        return value
    # Check if value is wrapped in Quill-generated block tags
    if re.search(r'<(h1|h2|h3|p|div)[^>]*class="ql-', value):
        # Extract inner text content, preserving only span tags
        # Remove outer block-level tags added by Quill
        cleaned = re.sub(r'<(h1|h2|h3|h4|p|div)[^>]*>(.*?)</(h1|h2|h3|h4|p|div)>', 
                          lambda m: m.group(2), value, flags=re.DOTALL)
        # Remove <br> tags added by Quill between paragraphs
        cleaned = re.sub(r'<p><br\s*/?></p>', '', cleaned)
        cleaned = re.sub(r'<br\s*/?>', ' ', cleaned)
        # Remove empty paragraph tags
        cleaned = re.sub(r'<p>\s*</p>', '', cleaned)
        # Strip color styles from spans that Quill adds (rgb color codes)
        cleaned = re.sub(r'<span style="color: rgb\([^)]+\);">(.*?)</span>', r'\1', cleaned)
        # Clean whitespace
        cleaned = cleaned.strip()
        return cleaned if cleaned else value
    return value


def fix_cms_database():
    print("\n=== CMS Database Cleanup ===\n")
    
    # Step 1: Convert all 'html' content_type to 'textarea'
    html_fields = SiteContent.objects.filter(content_type='html')
    count = html_fields.count()
    print(f"Found {count} fields with 'html' content_type — converting to 'textarea'...")
    html_fields.update(content_type='textarea')
    print(f"[OK] Converted {count} fields to 'textarea'\n")

    # Step 2: Clean up Quill-corrupted values across ALL pages
    print("Scanning for Quill-corrupted field values...")
    all_fields = SiteContent.objects.all()
    fixed_count = 0
    for field in all_fields:
        if field.value and re.search(r'<(h1|h2|h3|p|div)[^>]*class="ql-', field.value):
            original = field.value
            cleaned = strip_quill_html(field.value)
            if cleaned != original:
                print(f"  Cleaning [{field.page}/{field.section}/{field.key}]:")
                print(f"    Before: {original[:80]}...")
                print(f"    After:  {cleaned[:80]}")
                field.value = cleaned
                field.save(update_fields=['value'])
                fixed_count += 1

    if fixed_count == 0:
        print("  No Quill-corrupted values found.")
    else:
        print(f"\n[OK] Cleaned {fixed_count} corrupted field values\n")

    # Step 3: Restore known clean defaults for Vendors page heading
    # (These are most commonly broken by the visual editor)
    KNOWN_DEFAULTS = {
        ('vendors', 'hero', 'heading'):    'Find Trusted Junkyards',
        ('vendors', 'hero', 'subheading'): 'Connect with verified salvage yards across the U.S. and find the exact auto parts you need — fast.',
        ('home', 'hero', 'heading'):       'Find Verified Auto Parts <br /> From <span class="text-blue-600">6,500+</span> Junkyards <br /> In Under <span class="text-emerald-600">60</span> Seconds',
        ('home', 'hero', 'subheading'):    'Compare prices from licensed salvage yards nationwide <br class="hidden sm:block" /> and save up to 80% compared to dealership pricing.',
    }

    print("Checking known heading defaults...")
    for (page, section, key), default_value in KNOWN_DEFAULTS.items():
        try:
            field = SiteContent.objects.get(page=page, section=section, key=key)
            # If the stored value still contains Quill tags, reset to clean default
            if field.value and re.search(r'<(h1|h2|h3|p|div)[^>]*class="ql-', field.value):
                print(f"  Resetting [{page}/{section}/{key}] to clean default")
                field.value = default_value
                field.content_type = 'textarea'
                field.save(update_fields=['value', 'content_type'])
        except SiteContent.DoesNotExist:
            pass

    print("\n=== Cleanup Complete ===")
    print("Your CMS is now clean! All fields use simple textarea editors.")
    print("The website will render inline HTML spans correctly on the frontend.")


if __name__ == '__main__':
    fix_cms_database()
