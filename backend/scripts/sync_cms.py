"""
sync_cms.py
Safely syncs the CMS schema (adds new keys, removes obsolete keys).

NEVER overwrites user-edited values — only backfills label/content_type metadata.
To force-reset all values to defaults, run: python manage.py seed_cms --force
"""
import os
import sys
import django

# Add the project directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.cms.models import SiteContent
from apps.cms.default_content import DEFAULT_CMS_CONTENT

def sync_cms():
    # ── Remove old keys not in the current defaults ──────────────────────────
    current_keys = {
        f"{item['page']}:{item['section']}:{item['key']}"
        for item in DEFAULT_CMS_CONTENT
    }

    deleted_count = 0
    for content in SiteContent.objects.all():
        key = f"{content.page}:{content.section}:{content.key}"
        if key not in current_keys:
            content.delete()
            deleted_count += 1

    print(f"Deleted {deleted_count} obsolete CMS keys.")

    # ── Add new keys / backfill metadata only — NEVER touch user values ──────
    added_count = 0
    meta_updated_count = 0

    for item in DEFAULT_CMS_CONTENT:
        obj, created = SiteContent.objects.get_or_create(
            page=item['page'],
            section=item['section'],
            key=item['key'],
            defaults={
                'label': item.get('label', ''),
                'value': item.get('value', ''),   # only used on first create
                'content_type': item.get('content_type', 'text'),
            }
        )
        if created:
            added_count += 1
        else:
            # SAFE: only backfill label/content_type — NEVER overwrite value
            changed = False
            if item.get('label') and obj.label != item['label']:
                obj.label = item['label']
                changed = True
            if item.get('content_type') and obj.content_type != item['content_type']:
                obj.content_type = item['content_type']
                changed = True
            if changed:
                obj.save(update_fields=['label', 'content_type'])
                meta_updated_count += 1

    print(f"Added {added_count} new CMS keys.")
    print(f"Updated metadata (label/type only) for {meta_updated_count} existing keys.")
    print("Done! No user-edited values were overwritten.")

if __name__ == '__main__':
    sync_cms()
