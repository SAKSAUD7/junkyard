# Junkyards Near Me: Backlink SEO Strategy

This document outlines the standard operating procedure (SOP) for managing, tracking, and optimizing incoming backlinks to the Junkyard application platform. 

## Source of Truth
- **Verified Backlinks**: `junkyardsnearme_backlinks.csv`
  - This file serves as the definitive list of high-quality, verified backlinks pointing to our domain. Add manually vetted partners, vendors, and organic high-DA links here to protect SEO.
- **SQL Discovery Dump**: `backlinks_from_sql.txt`
  - Raw unverified server/database hits and logs that must be parsed before inclusion in the SEO suite.
- **Cleaned Prospects**: `new_cleaned_backlinks.csv`
  - Contains newly isolated, deduplicated backlinks that are not in our known inventory.

## Link Validation Process
As of the latest audit, over 9,104 unrecorded backlinks were identified from raw SQL dumps. A bulk reachability validation (`validate_backlinks.py`) verified that approximately:
- **~6,348** domains actively resolve to the platform (HTTP 200).
- **~2,755** domains are dead links, timeouts, or connection failures.

### Action Items for Marketing/SEO:
1. Review the `validated_backlinks.csv` list to identify high-Domain Authority (DA) partners.
2. Reach out to identified partners to optimize anchor text (e.g., ensuring they use "Junkyard Locator" instead of naked links).

## Spam Management & Disavow Strategy
Toxic backlinks (porn, casinos, spam networks, low-trust TLDs like `.ru`, `.cn`, `.xyz`) can hurt the domain's trust score and organic rankings heavily. 

- **Disavow File**: `disavow.txt`
- **Latest Action**: We algorithmically identified and exported 214 high-risk toxic domains linking to our site.

**How to Apply the Disavow List:**
1. Navigate to the Google Search Console (GSC) [Disavow Links Tool](https://search.google.com/search-console/disavow-links).
2. Select your property (`https://www.junkyardsnearme.com`).
3. Upload the `disavow.txt` file located in your project root.
4. Google will begin ignoring these incoming links, safeguarding your domain's organic ranking.

## Ongoing Cadence
Run the validation and cleaning scripts every month to ensure the backlink ecosystem remains healthy, avoiding toxic link injections.
