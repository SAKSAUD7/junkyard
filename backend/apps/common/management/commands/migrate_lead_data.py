from django.core.management.base import BaseCommand
from apps.hollander.models import Make, Model, PartType, Zipcode
import sqlite3
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Migrate reference data for Lead Forms from SQLite to Azure SQL'

    def handle(self, *args, **options):
        sqlite_path = os.path.join(settings.BASE_DIR, 'db.sqlite3')
        if not os.path.exists(sqlite_path):
            self.stdout.write(self.style.ERROR(f"SQLite DB not found at {sqlite_path}"))
            return

        self.stdout.write(f"Reading from {sqlite_path}...")
        conn = sqlite3.connect(sqlite_path)
        cursor = conn.cursor()

        # 1. Migrate Makes
        self.migrate_makes(cursor)
        
        # 2. Migrate Models
        self.migrate_models(cursor)
        
        # 3. Migrate Part Types
        self.migrate_parts(cursor)
        
        conn.close()
        self.stdout.write(self.style.SUCCESS("Migration Complete!"))

    def migrate_makes(self, cursor):
        self.stdout.write("Migrating Makes...")
        try:
            cursor.execute("SELECT make_id, make_name FROM hollander_make")
            rows = cursor.fetchall()
            self.stdout.write(f"Found {len(rows)} makes in SQLite")
            
            objs = [
                Make(make_id=row[0], make_name=row[1])
                for row in rows
            ]
            
            # Using bulk_create with ignore_conflicts (Postgres/SQLite) or managing manually
            # MSSQL doesn't support ignore_conflicts=True fully in older Django, but Django 5 does?
            # Safer to iterate or check. For speed, try bulk_create.
            try:
                Make.objects.bulk_create(objs, ignore_conflicts=True)
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Bulk create failed, trying individual: {e}"))
                for obj in objs:
                    Make.objects.get_or_create(make_id=obj.make_id, defaults={'make_name': obj.make_name})
                    
            self.stdout.write(f"Current Makes in DB: {Make.objects.count()}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error migrating makes: {e}"))

    def migrate_models(self, cursor):
        self.stdout.write("Migrating Models...")
        try:
            cursor.execute("SELECT model_id, make_id, model_name FROM hollander_model")
            rows = cursor.fetchall()
            self.stdout.write(f"Found {len(rows)} models in SQLite")
            
            # Need to ensure Makes exist first (handled above)
            objs = []
            for row in rows:
                objs.append(Model(
                    model_id=row[0], 
                    make_id=row[1], 
                    model_name=row[2]
                ))
            
            batch_size = 1000
            total_migrated = 0
            for i in range(0, len(objs), batch_size):
                batch = objs[i:i+batch_size]
                try:
                    Model.objects.bulk_create(batch, ignore_conflicts=True)
                    total_migrated += len(batch)
                    self.stdout.write(f"Migrated {total_migrated} models...", ending='\r')
                except Exception as e:
                    # If batch fails, try one by one?
                    self.stdout.write(self.style.WARNING(f"Batch failed: {e}"))
            
            self.stdout.write(f"\nCurrent Models in DB: {Model.objects.count()}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error migrating models: {e}"))

    def migrate_parts(self, cursor):
        self.stdout.write("Migrating Part Types...")
        try:
            cursor.execute("SELECT part_id, part_name FROM hollander_part_type")
            rows = cursor.fetchall()
            self.stdout.write(f"Found {len(rows)} parts in SQLite")
            
            objs = [
                PartType(part_id=row[0], part_name=row[1])
                for row in rows
            ]
            
            try:
                PartType.objects.bulk_create(objs, ignore_conflicts=True)
            except Exception as e:
                 for obj in objs:
                    PartType.objects.get_or_create(part_id=obj.part_id, defaults={'part_name': obj.part_name})

            self.stdout.write(f"Current Parts in DB: {PartType.objects.count()}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error migrating parts: {e}"))
