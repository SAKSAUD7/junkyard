from django.core.management.base import BaseCommand
from apps.hollander.models import Vendor
import json
import os
import sys

class Command(BaseCommand):
    help = 'Restore ALL legacy vendors from _yard.json'

    def handle(self, *args, **options):
        # Paths
        yard_json_path = r'c:\Users\saksa\Videos\jynm_json\jynm_json\_yard.json'
        
        if not os.path.exists(yard_json_path):
            self.stdout.write(self.style.ERROR(f"File not found at {yard_json_path}"))
            return

        # 1. Parse _yard.json
        self.stdout.write("Reading _yard.json...")
        try:
            with open(yard_json_path, 'r', encoding='utf-8') as f:
                yards_data = json.load(f)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to load _yard.json: {e}"))
            return

        self.stdout.write(f"Found {len(yards_data)} total vendors in legacy file. Starting full restore...")

        # 3. Restore
        restored_count = 0
        error_count = 0
        
        for yard in yards_data:
            try:
                # ID Handling
                raw_id = yard.get('YardID')
                if not raw_id: continue
                
                try:
                    yard_id = int(str(raw_id).strip())
                except ValueError:
                    continue
                    
                if yard_id == 0: continue
                
                # Field Mapping
                name = yard.get('Name') or f"Vendor {yard_id}"
                
                # Check for "Firstname" "Lastname" if Name is empty?
                if not name or name.strip() == "":
                    fname = yard.get('Firstname') or ""
                    lname = yard.get('Lastname') or ""
                    if fname or lname:
                        name = f"{fname} {lname}".strip()
                
                # Address
                addr = yard.get('Address') or ''
                city = yard.get('City') or ''
                state = yard.get('State') or ''
                zip_code = yard.get('Zip') or ''
                
                # Contact
                phone = yard.get('Phone') or ''
                email = yard.get('Email') or ''
                website = yard.get('Website') or ''
                
                # Enrichment
                desc = yard.get('Description') or ''
                logo = yard.get('Logo') or ''
                
                # Boolean Flags
                is_active = str(yard.get('IsActive', '0')) in ['1', 'true', '-1'] # -1 often true in legacy DBs
                is_featured = str(yard.get('IsFeatured', '0')) in ['1', 'true', '-1'] 
                is_top_rated = str(yard.get('IsTopRated', '0')) in ['1', 'true', '-1']
                is_trusted = str(yard.get('IsTrusted', '0')) in ['1', 'true', '-1']

                # Create/Update Vendor
                Vendor.objects.update_or_create(
                    id=yard_id,
                    defaults={
                        'yard_id': yard_id,
                        'name': name[:200],
                        'address': addr[:255],
                        'city': city[:100],
                        'state': state[:10],
                        'zip_code': zip_code[:20],
                        'phone': phone[:50],
                        'email': email[:254],
                        'website': website[:200],
                        'description': desc,
                        'logo': logo if logo else "/images/logo-placeholder.png",
                        
                        'is_active': is_active,
                        'is_featured': is_featured,
                        'is_top_rated': is_top_rated,
                        'is_trusted': is_trusted,
                        
                        # Set default ratings if not present (logic can be improved if rating data exists elsewhere)
                        'rating': '100%',
                        'rating_stars': 5,
                        'rating_percentage': 100
                    }
                )
                
                restored_count += 1
                if restored_count % 100 == 0:
                    self.stdout.write(f"Processed {restored_count}...")
                        
            except Exception as e:
                # self.stdout.write(self.style.WARNING(f"Error on yard {yard.get('YardID')}: {e}"))
                error_count += 1
                
        self.stdout.write(self.style.SUCCESS(f"✅ Full Restore Complete! Input: {len(yards_data)} | Restored/Updated: {restored_count} | Skipped/Errors: {error_count}"))
