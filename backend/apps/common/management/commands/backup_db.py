"""Pre-deployment database backup, so a migration can always be rolled back."""
import os
import shutil
import subprocess
from datetime import datetime

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import connections


class Command(BaseCommand):
    help = ('Dump the default database to backups/predeploy_<timestamp>.dump. '
            'Runs as the app user during deploy-jynm, before migrate.')

    def add_arguments(self, parser):
        parser.add_argument('--dir', default=None,
                            help='Destination directory (default: <repo>/backups)')
        parser.add_argument('--keep', type=int, default=10,
                            help='How many recent backups to retain')

    def handle(self, *args, **opts):
        db = connections['default'].settings_dict
        engine = db.get('ENGINE', '')
        out_dir = opts['dir'] or os.path.join(settings.BASE_DIR, '..', 'backups')
        os.makedirs(out_dir, exist_ok=True)
        dest = os.path.join(out_dir, f"predeploy_{datetime.now():%Y%m%d_%H%M%S}.dump")

        try:
            if 'sqlite' in engine:
                src = db['NAME']
                if not os.path.isabs(src):
                    src = os.path.join(str(settings.BASE_DIR), src)
                shutil.copy2(src, dest)
            elif 'postgresql' in engine:
                # Password goes through the environment, never argv or stdout.
                env = dict(os.environ, PGPASSWORD=str(db.get('PASSWORD') or ''))
                subprocess.run(
                    ['pg_dump', '--no-password',
                     '-h', str(db.get('HOST') or 'localhost'),
                     '-p', str(db.get('PORT') or 5432),
                     '-U', str(db.get('USER') or ''),
                     '-f', dest, str(db['NAME'])],
                    env=env, check=True, capture_output=True, text=True)
                if not os.path.getsize(dest):
                    raise CommandError('pg_dump produced an empty file')
            else:
                raise CommandError(f'Unsupported engine for backup: {engine}')
        except subprocess.CalledProcessError as exc:
            if os.path.exists(dest):
                os.remove(dest)
            # pg_dump echoes the database name but not the password.
            raise CommandError(f'pg_dump failed: {(exc.stderr or "").strip()[:300]}')

        retained = sorted(
            (f for f in os.listdir(out_dir) if f.startswith('predeploy_')),
            key=lambda f: os.path.getmtime(os.path.join(out_dir, f)),
            reverse=True,
        )
        for stale in retained[max(1, opts['keep']):]:
            os.remove(os.path.join(out_dir, stale))

        self.stdout.write(self.style.SUCCESS(
            f'backup written: {dest} ({os.path.getsize(dest)} bytes, '
            f'{min(len(retained), max(1, opts["keep"]))} retained)'))
