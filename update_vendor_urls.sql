-- ============================================================================
-- VENDOR LOGO URL UPDATE - Azure Blob Storage Migration
-- ============================================================================
-- 
-- Purpose: Update all vendor logo URLs to point to Azure Blob Storage
-- Run this in: Azure Portal → PostgreSQL "junk" → Query editor
-- 
-- What it does:
--   - Extracts filename from existing logo paths
--   - Constructs Azure Blob Storage URL
--   - Updates only vendors that don't already have Azure URLs
-- 
-- Expected result: ~6,567 vendor records updated
-- ============================================================================

-- STEP 1: Preview what will be updated (SAFE - read-only)
SELECT 
    id,
    name,
    logo AS old_logo,
    CONCAT('https://junkyardstoragedev.blob.core.windows.net/media/vendors/', 
           SUBSTRING(logo FROM '[^/]+$')) AS new_logo
FROM hollander_vendor
WHERE logo IS NOT NULL 
  AND logo != '' 
  AND logo NOT LIKE '%blob.core.windows.net%'
LIMIT 10;

-- STEP 2: Check how many will be updated
SELECT COUNT(*) as vendors_to_update
FROM hollander_vendor
WHERE logo IS NOT NULL 
  AND logo != '' 
  AND logo NOT LIKE '%blob.core.windows.net%';

-- STEP 3: Perform the update (MODIFIES DATA)
UPDATE hollander_vendor
SET logo = CONCAT('https://junkyardstoragedev.blob.core.windows.net/media/vendors/', 
                  SUBSTRING(logo FROM '[^/]+$'))
WHERE logo IS NOT NULL 
  AND logo != '' 
  AND logo NOT LIKE '%blob.core.windows.net%';

-- STEP 4: Verify the update was successful
SELECT COUNT(*) as updated_vendors
FROM hollander_vendor
WHERE logo LIKE '%blob.core.windows.net%';

-- STEP 5: View sample updated records
SELECT id, name, logo
FROM hollander_vendor
WHERE logo LIKE '%blob.core.windows.net%'
LIMIT 5;

-- STEP 6: Check for any remaining old paths (should be 0)
SELECT COUNT(*) as remaining_old_paths
FROM hollander_vendor
WHERE logo IS NOT NULL 
  AND logo != '' 
  AND logo NOT LIKE '%blob.core.windows.net%';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Total vendors
SELECT COUNT(*) as total_vendors FROM hollander_vendor;

-- Vendors with logos
SELECT COUNT(*) as vendors_with_logos 
FROM hollander_vendor 
WHERE logo IS NOT NULL AND logo != '';

-- Vendors with Azure Blob URLs
SELECT COUNT(*) as azure_blob_urls 
FROM hollander_vendor 
WHERE logo LIKE '%blob.core.windows.net%';

-- Success rate
SELECT 
    COUNT(*) FILTER (WHERE logo LIKE '%blob.core.windows.net%') as azure_urls,
    COUNT(*) FILTER (WHERE logo IS NOT NULL AND logo != '') as total_with_logos,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE logo LIKE '%blob.core.windows.net%') / 
        NULLIF(COUNT(*) FILTER (WHERE logo IS NOT NULL AND logo != ''), 0),
        2
    ) as success_percentage
FROM hollander_vendor;
