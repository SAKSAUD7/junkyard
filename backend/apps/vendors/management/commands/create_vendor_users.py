import os
import django
from django.core.management.base import BaseCommand
from multiprocessing import Pool, cpu_count

def hash_worker(data):
    # data: (v_id, y_id, v_name, final_email)
    import django
    if not django.conf.settings.configured:
        django.setup()
    from django.contrib.auth.hashers import make_password
    
    v_id, y_id, v_name, email = data
    password_raw = f"Vendor@{y_id}!"
    hashed = make_password(password_raw)
    return (v_id, y_id, email, hashed)

class Command(BaseCommand):
    help = 'Create user accounts for all existing vendors (Parallelized & Fixed)'

    def handle(self, *args, **options):
        # Move imports here to avoid AppRegistryNotReady in workers
        from django.contrib.auth import get_user_model
        from apps.hollander.models import Vendor
        from apps.users.models import VendorProfile
        
        User = get_user_model()

        self.stdout.write("Fetching vendor data...")
        vendor_data = list(Vendor.objects.values_list('id', 'yard_id', 'name', 'email'))
        
        existing_profile_vendor_ids = set(VendorProfile.objects.values_list('vendor_id', flat=True))
        existing_emails = set(User.objects.values_list('email', flat=True))
        
        tasks = []
        for v_id, y_id, v_name, v_email in vendor_data:
            if v_id in existing_profile_vendor_ids:
                continue
            
            if not v_email:
                clean_name = "".join(c for c in v_name if c.isalnum()).lower()
                final_email = f"vendor{y_id}@{clean_name}.local"
            else:
                final_email = v_email

            if final_email in existing_emails:
                continue

            tasks.append((v_id, y_id, v_name, final_email))
            existing_emails.add(final_email) 
            
        self.stdout.write(f"Processing {len(tasks)} items with {cpu_count()} cores...")
        
        if not tasks:
            self.stdout.write("No new users to create.")
            return

        with Pool(processes=cpu_count()) as pool:
            results = pool.map(hash_worker, tasks)
            
        self.stdout.write("Hashing complete. Creating DB objects...")
        
        users_to_create = []
        vendor_map = {} 

        for v_id, y_id, email, hashed_pw in results:
            users_to_create.append(User(
                username=email,
                email=email,
                password=hashed_pw,
                user_type='vendor',
                first_name=f"Vendor {y_id}",
                is_active=True
            ))
            vendor_map[email] = v_id
            
        User.objects.bulk_create(users_to_create, batch_size=500)
        
        self.stdout.write("Linking profiles...")
        new_users = User.objects.filter(email__in=vendor_map.keys()).only('id', 'email')
        
        profiles = []
        for user in new_users:
            v_id = vendor_map.get(user.email)
            if v_id:
                profiles.append(VendorProfile(
                    user=user,
                    vendor_id=v_id,
                    is_owner=True
                ))
                
        VendorProfile.objects.bulk_create(profiles, batch_size=500)
        self.stdout.write(self.style.SUCCESS(f"Done. Created {len(profiles)} profiles."))
