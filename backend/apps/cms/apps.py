from django.apps import AppConfig


class CmsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.cms'
    verbose_name = 'Website CMS'

    def ready(self):
        """
        Auto-seed CMS default content when Django starts on Azure.
        - Only inserts MISSING entries (get_or_create — never overwrites user edits)
        - Wrapped in try/except so startup never crashes (e.g. during initial migrations)
        - Skipped during management commands that don't need content (migrate, test, etc.)
        """
        import sys
        skip_commands = {
            'migrate', 'makemigrations', 'test', 'shell', 'dbshell',
            'createsuperuser', 'collectstatic', 'showmigrations', 'sqlmigrate',
        }
        if len(sys.argv) > 1 and sys.argv[1] in skip_commands:
            return

        try:
            from .models import SiteContent
            from .default_content import DEFAULT_CMS_CONTENT

            created = 0
            for entry in DEFAULT_CMS_CONTENT:
                obj, was_created = SiteContent.objects.get_or_create(
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
                if was_created:
                    created += 1
                elif not obj.label and entry.get('label'):
                    # Backfill labels non-destructively
                    obj.label = entry['label']
                    obj.save(update_fields=['label'])

            if created:
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f'CMS auto-seed: {created} new default entries added.')

        except Exception:
            # Never crash startup — DB might not be ready yet (e.g. first deploy before migrate)
            pass
