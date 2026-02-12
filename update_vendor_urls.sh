#!/bin/bash
# Execute vendor URL update via psql

PGPASSWORD='saksaud@7411' psql \
  --host=junk.postgres.database.azure.com \
  --port=5432 \
  --username=junkyard_admin \
  --dbname=junkyard \
  --set=sslmode=require \
  --command="
-- Check count before update
SELECT COUNT(*) as vendors_to_update
FROM hollander_vendor
WHERE logo IS NOT NULL 
  AND logo != '' 
  AND logo NOT LIKE '%blob.core.windows.net%';

-- Perform update
UPDATE hollander_vendor
SET logo = CONCAT('https://junkyardstoragedev.blob.core.windows.net/media/vendors/', 
                  SUBSTRING(logo FROM '[^/]+\$'))
WHERE logo IS NOT NULL 
  AND logo != '' 
  AND logo NOT LIKE '%blob.core.windows.net%';

-- Verify update
SELECT COUNT(*) as updated_vendors
FROM hollander_vendor
WHERE logo LIKE '%blob.core.windows.net%';
"
