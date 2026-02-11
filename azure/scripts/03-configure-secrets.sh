#!/bin/bash
# Script 03: Configure secrets in Azure Key Vault

set -e

ENVIRONMENT=${1:-dev}
APP_NAME="junkyard"

echo "========================================="
echo "Configuring Azure Key Vault Secrets"
echo "Environment: $ENVIRONMENT"
echo "========================================="

# Load outputs
OUTPUTS_FILE=~/.azure/junkyard/${ENVIRONMENT}-outputs.json
if [ ! -f "$OUTPUTS_FILE" ]; then
    echo "❌ Outputs file not found. Run ./02-provision-infra.sh first"
    exit 1
fi

KEY_VAULT_NAME=$(jq -r '.keyVaultName.value' "$OUTPUTS_FILE")

echo "Key Vault: $KEY_VAULT_NAME"

# Grant current user access to Key Vault
echo ""
echo "Granting Key Vault access to current user..."
CURRENT_USER=$(az account show --query user.name -o tsv)
az keyvault set-policy \
  --name "$KEY_VAULT_NAME" \
  --upn "$CURRENT_USER" \
  --secret-permissions get list set delete

# Get App Service principal ID
RESOURCE_GROUP="${APP_NAME}-rg-${ENVIRONMENT}"
APP_SERVICE_NAME="${APP_NAME}-api-${ENVIRONMENT}"

PRINCIPAL_ID=$(az webapp identity show \
  --name "$APP_SERVICE_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query principalId -o tsv)

echo "App Service Principal ID: $PRINCIPAL_ID"

# Grant App Service access to Key Vault
echo ""
echo "Granting Key Vault access to App Service..."
az keyvault set-policy \
  --name "$KEY_VAULT_NAME" \
  --object-id "$PRINCIPAL_ID" \
  --secret-permissions get list

echo ""
echo "✅ Key Vault access configured"
echo ""
echo "Secrets are already stored during infrastructure deployment."
echo "To update a secret manually:"
echo "  az keyvault secret set --vault-name $KEY_VAULT_NAME --name <secret-name> --value <secret-value>"
echo ""
echo "Next step: Run ./04-deploy-backend.sh $ENVIRONMENT"
