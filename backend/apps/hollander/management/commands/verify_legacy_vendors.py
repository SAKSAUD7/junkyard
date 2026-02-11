from django.core.management.base import BaseCommand
from apps.hollander.models import Vendor
import xml.etree.ElementTree as ET
import os
import re
import json

class Command(BaseCommand):
    help = 'Verify that all vendors from the legacy sitemap exist in the current database'

    def handle(self, *args, **options):
        sitemap_path = r'c:\Users\saksa\OneDrive\Desktop\jynm\sitemap.xml'
        
        if not os.path.exists(sitemap_path):
            self.stdout.write(self.style.ERROR(f"Sitemap not found at {sitemap_path}"))
            return

        # 1. Extract IDs from Sitemap
        self.stdout.write("Parsing legacy sitemap...")
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
        
        # Handle namespaces if present (sitemaps usually have them)
        ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        
        legacy_ids = set()
        legacy_urls = {} # map id -> url
        
        # Try with namespace
        urls = root.findall('sm:url', ns)
        if not urls:
            # Try without namespace fallback
            urls = root.findall('url')

        for url_elem in urls:
            loc = url_elem.find('sm:loc', ns)
            if loc is None:
                loc = url_elem.find('loc')
                
            if loc is not None and loc.text:
                url = loc.text
                # Match /junkyards/STATE/ID-SLUG
                match = re.search(r'/junkyards/[^/]+/(\d+)-', url)
                if match:
                    vendor_id = int(match.group(1))
                    legacy_ids.add(vendor_id)
                    legacy_urls[vendor_id] = url

        self.stdout.write(f"Found {len(legacy_ids)} unique vendor IDs in legacy sitemap.")

        # 2. Check Database
        self.stdout.write("Checking database for these IDs...")
        existing_ids = set(Vendor.objects.filter(id__in=legacy_ids).values_list('id', flat=True))
        
        missing_ids = legacy_ids - existing_ids
        
        # 3. Report
        if missing_ids:
            self.stdout.write(self.style.WARNING(f"❌ Missing {len(missing_ids)} vendors from the database!"))
            self.stdout.write("Missing IDs:")
            for vid in sorted(list(missing_ids)):
                self.stdout.write(f" - ID: {vid} (URL: {legacy_urls.get(vid)})")
                
            # Optional: detailed report to file
            report_path = r'c:\Users\saksa\OneDrive\Desktop\junkyard\missing_vendors_report.json'
            with open(report_path, 'w') as f:
                json.dump({
                    'total_legacy': len(legacy_ids),
                    'total_missing': len(missing_ids),
                    'missing_ids': sorted(list(missing_ids)),
                    'missing_urls': [legacy_urls[mid] for mid in missing_ids]
                }, f, indent=2)
            self.stdout.write(f"Detailed report saved to {report_path}")
            
        else:
            self.stdout.write(self.style.SUCCESS(f"✅ All {len(legacy_ids)} legacy vendors are present in the database!"))
