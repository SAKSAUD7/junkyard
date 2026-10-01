import csv
import time
from googlesearch import search
import urllib.parse

# The queries to find auto websites accepting guest posts or directory submissions
queries = [
    '"automotive" "write for us"',
    '"auto repair" "guest post"',
    '"car blog" "submit an article"',
    '"auto parts" "add your site"',
    '"mechanic" "become a contributor"'
]

if __name__ == "__main__":
    all_links = set()
    
    print("🚀 Starting AI Backlink Harvester for QAP using googlesearch-python...")
    for q in queries:
        print(f"[*] Searching for: {q}")
        try:
            # Using the googlesearch module which handles headers/delays better automatically
            results = search(q, num_results=50, lang="en")
            
            count = 0
            for url in results:
                if "google.com" not in url:
                    all_links.add(url)
                    count += 1
            
            print(f"  -> Found {count} links for this query.")
            
            # Additional safety sleep
            time.sleep(3)
            
        except Exception as e:
            print(f"[!] Error fetching {q}: {e}")
            
    print(f"\n✅ Collection complete! Total unique URLs found: {len(all_links)}")
    print("💾 Saving to qap_scraped_targets.csv...")
    
    with open("qap_scraped_targets.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Target URL", "Status"])
        for link in all_links:
            writer.writerow([urllib.parse.unquote(link.strip()), "Needs DA Check"])
            
    print("\n🎉 DONE! The CSV has been populated. Open it up and copy the links to a DA checker!")
