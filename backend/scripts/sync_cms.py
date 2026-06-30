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
    # Remove old keys not in the current default
    current_keys = [f"{item['page']}:{item['section']}:{item['key']}" for item in DEFAULT_CMS_CONTENT]
    
    deleted_count = 0
    for content in SiteContent.objects.all():
        key = f"{content.page}:{content.section}:{content.key}"
        if key not in current_keys:
            content.delete()
            deleted_count += 1
            
    print(f"Deleted {deleted_count} obsolete CMS keys.")
    
    # Add new keys
    added_count = 0
    updated_count = 0
    for item in DEFAULT_CMS_CONTENT:
        obj, created = SiteContent.objects.get_or_create(
            page=item['page'],
            section=item['section'],
            key=item['key'],
            defaults={
                'label': item['label'],
                'value': item['value'],
                'content_type': item['content_type']
            }
        )
        if created:
            added_count += 1
        else:
            # Overwrite values to ensure the frontend looks correct by default (since we're rebuilding the schema)
            # This is specifically requested by the user to "redo the entire CMS"
            obj.label = item['label']
            obj.value = item['value']
            obj.content_type = item['content_type']
            obj.save()
            updated_count += 1
            
    print(f"Added {added_count} new CMS keys.")
    print(f"Updated {updated_count} existing CMS keys to match new defaults.")
    print("Done!")

if __name__ == '__main__':
    sync_cms()
