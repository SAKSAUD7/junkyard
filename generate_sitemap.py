import json
from datetime import date

today = date.today().isoformat()
base = 'https://nice-pebble-067605800.7.azurestaticapps.net'

# Static pages
static_pages = [
    ('/', '1.0', 'daily'),
    ('/browse', '0.9', 'daily'),
    ('/vendors', '0.9', 'daily'),
    ('/search', '0.9', 'daily'),
    ('/blog', '0.8', 'weekly'),
    ('/about', '0.7', 'monthly'),
    ('/contact', '0.7', 'monthly'),
    ('/faq', '0.6', 'monthly'),
    ('/how-it-works', '0.6', 'monthly'),
    ('/privacy', '0.5', 'monthly'),
    ('/terms', '0.5', 'monthly'),
    ('/quote', '0.7', 'monthly'),
    ('/add-a-yard', '0.6', 'monthly'),
    ('/signin', '0.4', 'monthly'),
    ('/signup', '0.4', 'monthly'),
]

# US States for browse pages
states = [
    'alabama','alaska','arizona','arkansas','california','colorado','connecticut',
    'delaware','florida','georgia','hawaii','idaho','illinois','indiana','iowa',
    'kansas','kentucky','louisiana','maine','maryland','massachusetts','michigan',
    'minnesota','mississippi','missouri','montana','nebraska','nevada',
    'new-hampshire','new-jersey','new-mexico','new-york','north-carolina',
    'north-dakota','ohio','oklahoma','oregon','pennsylvania','rhode-island',
    'south-carolina','south-dakota','tennessee','texas','utah','vermont',
    'virginia','washington','west-virginia','wisconsin','wyoming'
]

urls = []
for path, priority, freq in static_pages:
    urls.append(f'  <url>\n    <loc>{base}{path}</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>{freq}</changefreq>\n    <priority>{priority}</priority>\n  </url>')

for state in states:
    urls.append(f'  <url>\n    <loc>{base}/browse/{state}</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>')

header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
footer = '\n</urlset>'
sitemap = header + '\n'.join(urls) + footer

with open('frontend/public/sitemap.xml', 'w') as f:
    f.write(sitemap)

print(f'Generated sitemap with {len(urls)} URLs')
