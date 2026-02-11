#!/bin/bash
# Script 10: Destroy all Azure resources

set -e

ENVIRONMENT=${1:-dev}
APP_NAME="junkyard"
RESOURCE_GROUP="${APP_NAME}-rg-${ENVIRONMENT}"

echo "========================================="
echo "⚠️  DESTROY AZURE RESOURCES"
echo "Environment: $ENVIRONMENT"
echo "Resource Group: $RESOURCE_GROUP"
echo "========================================="
echo ""
echo "This will DELETE ALL resources in the resource group:"
echo "  - App Service"
echo "  - PostgreSQL Database"
echo "  - Blob Storage"
echo "  - Key Vault"
echo "  - Static Web App"
echo "  - Application Insights"
echo ""
read -p "Are you ABSOLUTELY SURE? Type 'DELETE' to confirm: " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Deleting resource group..."
az group delete \
  --name "$RESOURCE_GROUP" \
  --yes \
  --no-wait

echo ""
echo "✅ Deletion initiated (running in background)"
echo ""
echo "To check status:"
echo "  az group show --name $RESOURCE_GROUP"
echo ""
echo "To remove Azure folder from project:"
echo "  rm -rf azure/"
