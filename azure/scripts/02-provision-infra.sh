#!/bin/bash
# Script 02: Provision Azure infrastructure using Bicep

set -e

ENVIRONMENT=${1:-dev}
LOCATION="centralindia"
APP_NAME="junkyard"
RESOURCE_GROUP="${APP_NAME}-rg-${ENVIRONMENT}"

echo "========================================="
echo "Provisioning Azure Infrastructure"
echo "Environment: $ENVIRONMENT"
echo "Location: $LOCATION"
echo "========================================="

# Load subscription ID
SUBSCRIPTION_ID=$(cat ~/.azure/junkyard/subscription_id 2>/dev/null || echo "")
if [ -z "$SUBSCRIPTION_ID" ]; then
    echo "❌ Subscription ID not found. Run ./01-setup-local.sh first"
    exit 1
fi

az account set --subscription "$SUBSCRIPTION_ID"

# Generate secrets
echo ""
echo "Generating secure secrets..."
DB_PASSWORD=$(openssl rand -base64 32)
DJANGO_SECRET=$(openssl rand -base64 50)

echo "✅ Secrets generated"

# Prompt for SendGrid API key
echo ""
read -p "Enter SendGrid API Key (or press Enter to skip): " SENDGRID_KEY
SENDGRID_KEY=${SENDGRID_KEY:-"dummy-key-for-dev"}

# Create parameters file
PARAMS_FILE="../infra/parameters/${ENVIRONMENT}.bicepparam"
mkdir -p ../infra/parameters

cat > "$PARAMS_FILE" <<EOF
using '../main.bicep'

param environment = '${ENVIRONMENT}'
param location = '${LOCATION}'
param resourceGroupName = '${RESOURCE_GROUP}'
param appName = '${APP_NAME}'
param dbAdminUsername = '${APP_NAME}_admin'
param dbAdminPassword = '${DB_PASSWORD}'
param sendGridApiKey = '${SENDGRID_KEY}'
param djangoSecretKey = '${DJANGO_SECRET}'
EOF

echo "✅ Parameters file created: $PARAMS_FILE"

# Deploy infrastructure
echo ""
echo "Deploying Bicep templates..."
echo "This may take 10-15 minutes..."

az deployment sub create \
  --name "junkyard-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)" \
  --location "$LOCATION" \
  --template-file ../infra/main.bicep \
  --parameters "$PARAMS_FILE" \
  --output table

# Get outputs
echo ""
echo "Retrieving deployment outputs..."

DEPLOYMENT_NAME=$(az deployment sub list --query "[?contains(name, 'junkyard-${ENVIRONMENT}')].name" -o tsv | head -1)

az deployment sub show \
  --name "$DEPLOYMENT_NAME" \
  --query properties.outputs \
  --output table

# Save outputs to file
az deployment sub show \
  --name "$DEPLOYMENT_NAME" \
  --query properties.outputs \
  --output json > ~/.azure/junkyard/${ENVIRONMENT}-outputs.json

echo ""
echo "========================================="
echo "✅ Infrastructure Provisioned!"
echo "========================================="
echo "Outputs saved to: ~/.azure/junkyard/${ENVIRONMENT}-outputs.json"
echo ""
echo "Next step: Run ./03-configure-secrets.sh $ENVIRONMENT"
