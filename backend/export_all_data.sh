#!/bin/bash

# Complete Database Export Script
# This exports EVERYTHING from your local database

echo "🚀 Starting complete database export..."
echo "This may take several minutes for 6000+ vendors..."

# Export all data except auto-generated tables
python manage.py dumpdata \
  --natural-foreign \
  --natural-primary \
  --indent 2 \
  --exclude auth.permission \
  --exclude contenttypes \
  --exclude sessions.session \
  --exclude admin.logentry \
  > full_database_dump.json

# Check file size
FILE_SIZE=$(wc -c < full_database_dump.json)
FILE_SIZE_MB=$((FILE_SIZE / 1024 / 1024))

echo "✅ Export complete!"
echo "📦 File: full_database_dump.json"
echo "📊 Size: ${FILE_SIZE_MB}MB"
echo ""
echo "Next steps:"
echo "1. Upload this file to backend/ directory in your repo"
echo "2. Commit and push to GitHub"
echo "3. Azure will automatically import it on next deployment"
