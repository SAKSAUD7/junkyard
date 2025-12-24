"""
Vendor Logo Matcher - Database-First Approach
==============================================

This script matches vendor logos from the frontend images directory
to vendors in the database using strict, conservative matching rules.

RULES:
- Only process vendors that exist in the database
- Only assign logos when a confident match is found
- Ignore all unmatched images
- Never guess or force matches
- Preserve existing data integrity

Usage:
    python manage.py shell < match_vendor_logos.py
"""

from apps.vendors.models import Vendor
import os
import re
from pathlib import Path

# Configuration
FRONTEND_LOGOS_DIR = Path(__file__).parent.parent.parent / 'frontend' / 'public' / 'images' / 'vendors'
DRY_RUN = True  # Set to False to actually update database

def normalize_name(name):
    """
    Normalize vendor name for matching.
    
    Examples:
        "Auto Recycling Mall" -> "auto-recycling-mall"
        "C & H Auto Salvage" -> "c-h-auto-salvage"
        "Chuck & Eddie's Quality Used Auto Parts" -> "chuck-eddies-quality-used-auto-parts"
    """
    if not name:
        return ""
    
    # Convert to lowercase
    normalized = name.lower()
    
    # Remove possessive apostrophes
    normalized = normalized.replace("'s", "s")
    normalized = normalized.replace("'", "")
    
    # Replace ampersands
    normalized = normalized.replace(" & ", "-")
    normalized = normalized.replace("&", "-")
    
    # Replace periods, commas, and other punctuation
    normalized = re.sub(r'[.,!?;:()\[\]{}]', '', normalized)
    
    # Replace spaces and multiple hyphens with single hyphen
    normalized = re.sub(r'[\s_]+', '-', normalized)
    normalized = re.sub(r'-+', '-', normalized)
    
    # Remove leading/trailing hyphens
    normalized = normalized.strip('-')
    
    return normalized

def find_logo_file(vendor_name, logos_dir):
    """
    Attempt to find a matching logo file for a vendor.
    
    Returns:
        str: Relative path to logo if found, None otherwise
    """
    if not os.path.exists(logos_dir):
        return None
    
    normalized = normalize_name(vendor_name)
    if not normalized:
        return None
    
    # Get all files in the directory
    try:
        files = os.listdir(logos_dir)
    except Exception as e:
        print(f"Error reading directory: {e}")
        return None
    
    # Try exact match first
    for ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp']:
        exact_match = f"{normalized}{ext}"
        if exact_match in files:
            return f"/images/vendors/{exact_match}"
    
    # Try case-insensitive match
    normalized_lower = normalized.lower()
    for filename in files:
        file_lower = filename.lower()
        name_part = os.path.splitext(file_lower)[0]
        
        if name_part == normalized_lower:
            return f"/images/vendors/{filename}"
    
    # Try partial match (vendor name is contained in filename)
    # Only if vendor name is substantial (>10 chars to avoid false positives)
    if len(normalized) > 10:
        for filename in files:
            file_lower = filename.lower()
            name_part = os.path.splitext(file_lower)[0]
            
            # Check if normalized name is in the filename
            if normalized_lower in name_part or name_part in normalized_lower:
                # Additional confidence check: similarity ratio
                if len(name_part) > 0:
                    overlap = len(set(normalized_lower.split('-')) & set(name_part.split('-')))
                    total_words = len(set(normalized_lower.split('-')))
                    
                    # Require at least 60% word overlap
                    if total_words > 0 and (overlap / total_words) >= 0.6:
                        return f"/images/vendors/{filename}"
    
    return None

def match_vendor_logos():
    """
    Main function to match logos to vendors.
    """
    print("=" * 80)
    print("VENDOR LOGO MATCHING - DATABASE-FIRST APPROACH")
    print("=" * 80)
    print()
    
    # Get all vendors from database
    vendors = Vendor.objects.all()
    total_vendors = vendors.count()
    
    print(f"📊 Total vendors in database: {total_vendors}")
    print(f"📁 Logo directory: {FRONTEND_LOGOS_DIR}")
    print(f"🔍 Dry run mode: {DRY_RUN}")
    print()
    
    if not os.path.exists(FRONTEND_LOGOS_DIR):
        print(f"❌ ERROR: Logo directory not found: {FRONTEND_LOGOS_DIR}")
        return
    
    # Count available logo files
    try:
        logo_files = [f for f in os.listdir(FRONTEND_LOGOS_DIR) if os.path.isfile(os.path.join(FRONTEND_LOGOS_DIR, f))]
        print(f"📁 Total logo files available: {len(logo_files)}")
        print()
    except Exception as e:
        print(f"❌ ERROR reading logo directory: {e}")
        return
    
    # Statistics
    matched = 0
    not_matched = 0
    already_has_logo = 0
    updated = 0
    
    print("🔄 Processing vendors...")
    print()
    
    for vendor in vendors:
        # Skip if vendor already has a custom logo (not placeholder)
        if vendor.logo and vendor.logo != "/images/logo-placeholder.png":
            already_has_logo += 1
            continue
        
        # Try to find matching logo
        logo_path = find_logo_file(vendor.name, FRONTEND_LOGOS_DIR)
        
        if logo_path:
            matched += 1
            print(f"✅ MATCH: {vendor.name}")
            print(f"   → {logo_path}")
            
            if not DRY_RUN:
                vendor.logo = logo_path
                vendor.save(update_fields=['logo'])
                updated += 1
        else:
            not_matched += 1
            if not_matched <= 10:  # Show first 10 unmatched
                print(f"⚠️  NO MATCH: {vendor.name}")
                print(f"   Normalized: {normalize_name(vendor.name)}")
    
    print()
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total vendors processed:     {total_vendors}")
    print(f"Already had custom logo:     {already_has_logo}")
    print(f"Logos successfully matched:  {matched}")
    print(f"Vendors without match:       {not_matched}")
    
    if DRY_RUN:
        print()
        print(f"⚠️  DRY RUN MODE - No changes were made to the database")
        print(f"   Set DRY_RUN = False to apply changes")
    else:
        print()
        print(f"✅ Database updated: {updated} vendors")
    
    print()
    print(f"📊 Match rate: {(matched / total_vendors * 100):.1f}%")
    print(f"📁 Unused images: {len(logo_files) - matched} (will be ignored)")
    print()

# Run the matcher
if __name__ == "__main__":
    match_vendor_logos()
