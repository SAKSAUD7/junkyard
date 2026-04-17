"""
Management command: seed_cms
Automatically seeds all CMS default content into the database.
Safe to re-run — uses get_or_create so it never overwrites edited values.

Usage:
    python manage.py seed_cms
    python manage.py seed_cms --force   (overwrites existing values)
"""
from django.core.management.base import BaseCommand
from apps.cms.models import SiteContent
from apps.cms.default_content import DEFAULT_CMS_CONTENT


class Command(BaseCommand):
    help = 'Seed default CMS content for all pages. Safe to re-run (uses get_or_create).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Overwrite existing values with defaults (use with caution)',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        created_count = 0
        updated_count = 0

        for entry in DEFAULT_CMS_CONTENT:
            obj, created = SiteContent.objects.get_or_create(
                page=entry['page'],
                section=entry['section'],
                key=entry['key'],
                defaults={
                    'value': entry.get('value', ''),
                    'content_type': entry.get('content_type', 'text'),
                    'label': entry.get('label', ''),
                    'is_active': True,
                }
            )
            if created:
                created_count += 1
            elif force:
                # Only force-overwrite if flag is set
                changed = False
                if entry.get('label') and obj.label != entry['label']:
                    obj.label = entry['label']
                    changed = True
                if entry.get('content_type') and obj.content_type != entry['content_type']:
                    obj.content_type = entry['content_type']
                    changed = True
                if changed:
                    obj.save()
                    updated_count += 1
            else:
                # Always update label if empty (non-destructive meta fix)
                if entry.get('label') and not obj.label:
                    obj.label = entry['label']
                    obj.save()

        total = SiteContent.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f'CMS seed complete: {created_count} created, {updated_count} updated, {total} total entries'
            )
        )
