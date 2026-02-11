import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.apps import apps

print("=" * 80)
print("LOCAL DATABASE INVENTORY - What Will Be Migrated")
print("=" * 80)

total_records = 0
critical_tables = {}

for model in apps.get_models():
    app_label = model._meta.app_label
    model_name = model._meta.model_name
    count = model.objects.count()
    total_records += count
    
    # Track critical tables
    key = f"{app_label}.{model_name}"
    critical_tables[key] = count
    
    if count > 0:
        print(f"{key:50} {count:>10,}")

print("=" * 80)
print(f"{'TOTAL RECORDS':50} {total_records:>10,}")
print("=" * 80)

# Highlight critical data
print("\n🔍 CRITICAL DATA VERIFICATION:")
print(f"  Vendors (hollander.vendor): {critical_tables.get('hollander.vendor', 0):,}")
print(f"  Leads (leads.lead): {critical_tables.get('leads.lead', 0):,}")
print(f"  Users (users.user): {critical_tables.get('users.user', 0):,}")
print(f"  Makes (common.make): {critical_tables.get('common.make', 0):,}")
print(f"  Models (common.model): {critical_tables.get('common.model', 0):,}")
print(f"  Parts (common.part): {critical_tables.get('common.part', 0):,}")
print(f"  States (common.state): {critical_tables.get('common.state', 0):,}")
print(f"  Cities (common.city): {critical_tables.get('common.city', 0):,}")
