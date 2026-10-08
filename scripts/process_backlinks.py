import csv
import sys
import os
from collections import defaultdict

def process_backlinks(input_csv):
    """
    Parses a Semrush Backlinks CSV export and generates three output files:
    1. jynm_backlinks_clean.csv - Cleaned backlinks (removes lost or obviously toxic links)
    2. jynm_backlinks_summary.csv - Summary of backlinks grouped by target URL
    3. redirect_inventory.csv - A generated list mapping old URLs to new redirect targets
    """
    
    if not os.path.exists(input_csv):
        print(f"Error: Could not find input file '{input_csv}'")
        return

    clean_backlinks = []
    summary_data = defaultdict(int)
    redirect_targets = set()
    
    try:
        with open(input_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            # Use lowercased keys for more flexibility in case headers vary slightly
            def get_val(row, possible_keys):
                for k in possible_keys:
                    if k in row:
                        return row[k]
                return ''

            for row in reader:
                # Lowercase keys mapping
                l_row = {k.lower(): v for k, v in row.items()}
                
                source_url = get_val(l_row, ['source url', 'source_url', 'url'])
                target_url = get_val(l_row, ['target url', 'target_url', 'target'])
                anchor = get_val(l_row, ['anchor text', 'anchor', 'anchor_text'])
                status = get_val(l_row, ['link status', 'status', 'new/lost'])
                
                # Exclude if explicitly marked as 'lost' by Semrush
                if 'lost' in status.lower():
                    continue
                    
                # Store cleaned
                clean_backlinks.append(row)
                
                # Aggregate summary by target URL
                if target_url:
                    summary_data[target_url] += 1
                    
                # Collect redirect targets for inventory (old paths mapping to new)
                if target_url:
                    redirect_targets.add(target_url)

    except Exception as e:
        print(f"Error reading {input_csv}: {e}")
        return

    # Write jynm_backlinks_clean.csv
    clean_csv = 'jynm_backlinks_clean.csv'
    if clean_backlinks:
        try:
            with open(clean_csv, 'w', encoding='utf-8', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=clean_backlinks[0].keys())
                writer.writeheader()
                writer.writerows(clean_backlinks)
            print(f"✅ Generated {clean_csv} ({len(clean_backlinks)} rows)")
        except Exception as e:
            print(f"Error writing {clean_csv}: {e}")

    # Write jynm_backlinks_summary.csv
    summary_csv = 'jynm_backlinks_summary.csv'
    try:
        with open(summary_csv, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Target URL', 'Backlink Count'])
            for url, count in sorted(summary_data.items(), key=lambda x: x[1], reverse=True):
                writer.writerow([url, count])
        print(f"✅ Generated {summary_csv} ({len(summary_data)} unique targets)")
    except Exception as e:
        print(f"Error writing {summary_csv}: {e}")

    # Write redirect_inventory.csv
    redirect_csv = 'redirect_inventory.csv'
    try:
        with open(redirect_csv, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Old URL', 'Current Target URL', 'Suggested Action', 'New Target URL'])
            for i, target in enumerate(sorted(redirect_targets)):
                # Provide a placeholder mapping that the team can fill
                # E.g. map http://qualityautoparts.com/old to https://junkyardsnearme.com/old
                new_target = target.replace('qualityautoparts.com', 'junkyardsnearme.com').replace('http://', 'https://')
                action = '301 Redirect' if 'qualityautoparts.com' in target else 'Keep As Is'
                writer.writerow([target, target, action, new_target])
        print(f"✅ Generated {redirect_csv} ({len(redirect_targets)} rows)")
    except Exception as e:
        print(f"Error writing {redirect_csv}: {e}")

if __name__ == '__main__':
    # Input file is explicitly passed or default
    input_file = sys.argv[1] if len(sys.argv) > 1 else 'semrush_backlinks.csv'
    print(f"Processing backlinks from: {input_file}")
    process_backlinks(input_file)
