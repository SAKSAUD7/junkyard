import csv
import os
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Generate sitemap.xml, robots.txt, and llms.txt from a URL list CSV'

    def add_arguments(self, parser):
        parser.add_argument('urls_csv', type=str, help='Path to final_working_urls CSV')
        parser.add_argument('--output-dir', type=str, default='../frontend/public', help='Output directory for SEO files')
        parser.add_argument('--domain', type=str, default='https://junkyardnearme.com', help='Base domain name')

    def handle(self, *args, **options):
        urls_csv = options['urls_csv']
        output_dir = os.path.abspath(os.path.join(settings.BASE_DIR, options['output_dir']))
        domain = options['domain'].rstrip('/')
        
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        sitemap_path = os.path.join(output_dir, 'sitemap.xml')
        robots_path = os.path.join(output_dir, 'robots.txt')
        llms_path = os.path.join(output_dir, 'llms.txt')
        
        # Read working URLs
        urls = []
        try:
            with open(urls_csv, mode='r', encoding='utf-8-sig') as f:
                # Based on standard CSV if it doesn't have headers, or if it does
                reader = csv.reader(f)
                lines = list(reader)
                
                # Check for header
                start_idx = 0
                if lines and 'url' in lines[0][0].lower():
                    start_idx = 1
                    
                for row in lines[start_idx:]:
                    if not row:
                        continue
                    url = row[0].strip()
                    # ensure absolute url format
                    if not url.startswith('http'):
                        if not url.startswith('/'):
                            url = '/' + url
                        url = domain + url
                    urls.append(url)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error reading CSV: {e}"))
            return

        urls = list(set(urls)) # dedup
        urls.sort()
        
        # 1. Generate Sitemap
        today = datetime.now().strftime('%Y-%m-%d')
        sitemap_content = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        ]
        
        for url in urls:
            sitemap_content.append('  <url>')
            sitemap_content.append(f'    <loc>{url}</loc>')
            # Optionally add priority/changefreq based on path length or pattern
            if len(url.split('/')) <= 4:
                 sitemap_content.append('    <priority>0.8</priority>')
                 sitemap_content.append('    <changefreq>daily</changefreq>')
            else:
                 sitemap_content.append('    <priority>0.5</priority>')
                 sitemap_content.append('    <changefreq>weekly</changefreq>')
            sitemap_content.append(f'    <lastmod>{today}</lastmod>')
            sitemap_content.append('  </url>')
            
        sitemap_content.append('</urlset>')
        
        with open(sitemap_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sitemap_content))
            
        self.stdout.write(self.style.SUCCESS(f"Generated {sitemap_path} with {len(urls)} URLs."))

        # 2. Generate robots.txt
        robots_content = f"""User-agent: *
Allow: /

Sitemap: {domain}/sitemap.xml
"""
        with open(robots_path, 'w', encoding='utf-8') as f:
            f.write(robots_content)
        self.stdout.write(self.style.SUCCESS(f"Generated {robots_path}"))
            
        # 3. Generate llms.txt
        llms_content = f"""# Junkyards Near Me

This platform helps users find local junkyards, auto salvage yards, and recycle centers.
We serve {len(urls)} location and vendor detail pages.

## Sitemaps
Full Site Map: {domain}/sitemap.xml
"""
        with open(llms_path, 'w', encoding='utf-8') as f:
            f.write(llms_content)
        self.stdout.write(self.style.SUCCESS(f"Generated {llms_path}"))
