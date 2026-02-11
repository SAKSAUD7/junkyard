#!/bin/bash
# Script 06: Run Django database migrations

set -e

ENVIRONMENT=${1:-dev}
APP_NAME="junkyard"
RESOURCE_GROUP="${APP_NAME}-rg-${ENVIRONMENT}"
APP_SERVICE_NAME="${APP_NAME}-api-${ENVIRONMENT}"

echo "========================================="
echo "Running Database Migrations"
echo "Environment: $ENVIRONMENT"
echo "========================================="

# Run migrations via SSH
echo "Connecting to App Service..."

az webapp ssh \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_SERVICE_NAME" \
  --command "cd /home/site/wwwroot && python manage.py migrate"

echo ""
echo "✅ Migrations completed"
echo ""
echo "To create a superuser, run:"
echo "  az webapp ssh --resource-group $RESOURCE_GROUP --name $APP_SERVICE_NAME"
echo "  Then: python manage.py createsuperuser"
