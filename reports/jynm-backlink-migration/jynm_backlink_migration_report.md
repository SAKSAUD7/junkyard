# JYNM to QAP Backlink Migration & Recovery Analysis

## 1. Objective
To safely identify, audit, and provide backup mapping for the 35,768 indexed backlinks originating from `junkyardsnearme.com` pointing to `qualityautoparts.com` (QAP), reported by Semrush, before deploying the Phase 7 frontend modifications.

## 2. Findings on the 35,768 Link Count
**Analysis Method:** Codebase inspection, database enumeration, and CSV record recovery.

### The Sitewide Footer Link Architecture
Our discovery confirms that the 35,768 count **does not represent 35,768 distinct domains or highly unique content placements**. During code and database inspection, we confirmed:
* **Database Snapshot**: The backend contains exactly `6,567` active Junkyard Vendors. Combined with cities, states, and individual part landing pages, the number of dynamic routes on JYNM reaches well over 35,000 indexable pages.
* **Component Inspection**: A persistent standard anchor tag `Sponsored by <a href="https://www.qualityautoparts.com/">` is embedded within the universal `Footer.jsx` and historical layout templates.
* **Conclusion**: Because the footer spans the entire platform, search engines like Semrush classify **every single dynamic page** of the JYNM website as a backlink connecting to QAP. 

## 3. CSV Deliverables & Archival Data
We successfully identified and parsed the maximum available historical limit of raw Semrush/crawler exports (`JYNM_to_QAP_Backlinks.csv`). All processed deliverables have been stored in:
`/home/adminpc/junkyard/junkyard-1/reports/jynm-backlink-migration/`

1. **`jynm_qap_links_raw.csv`** (7,698 records): The unedited archive containing original source, target, anchors, and tracking status.
2. **`jynm_qap_links_analyzed.csv`** (7,698 records): Analyzed counterpart attributing the domain, link type, duplication metric, and confirming the "Sitewide Footer Widget" placement hypothesis.
3. **`jynm_qap_link_summary.csv`**: A master sheet indicating the relationship between the 7,698 recovered limit and the 35,768 indexed goal.
4. **`jynm_historical_url_inventory.csv`** (7,698 records): A mapping of the unique legacy source URLs from the JYNM old platform to the new React deployment topology.
5. **`jynm_redirect_mapping_proposal.csv`** (7,698 records): Initial proposal file for preserving inbound JYNM traffic when upgrading environments. 

## 4. SEO Implications & Risks
**QAP Drop Risk**: If the QAP sponsored link is hastily removed from the `Footer` of the new JYNM platform, Semrush and Google will detect an instantaneous drop of 35,768 backlinks pointing to Quality Auto Parts. While these are primarily internal-style sitewide links, a sudden bulk removal of this volume often triggers automated volatility filters in Google's ranking algorithms.

**JYNM Internal Routing Risk**: The historical URLs mapping from `/junkyards/georgia` or `/junkyards-by-location` need to align seamlessly with the new Vite/Nginx frontend architecture to preserve JYNM's organic authority.

## 5. Next Steps for the SEO Agency
* **Action Required**: The SEO agency must explicitly approve whether to preserve the QAP link in the new `Footer.jsx` build. We strongly recommend **Preserving** it initially during deployment, then gradually no-following or removing it over 6-12 months if required.
* **Action Required**: Review the `jynm_redirect_mapping_proposal.csv` to ensure all 7,698 legacy high-traffic vendor URLs are securely caught by the new Nginx configuration and not encountering 404 thresholds. 

No core SEO configurations will be mutated without formal approval of this backup.
