#!/bin/bash
# Script 05: Deploy React frontend to Azure Static Web Apps

set -e

ENVIRONMENT=${1:-dev}
APP_NAME="junkyard"

echo "========================================="
echo "Deploying React Frontend"
echo "Environment: $ENVIRONMENT"
echo "========================================="

# Load outputs
OUTPUTS_FILE=~/.azure/junkyard/${ENVIRONMENT}-outputs.json
BACKEND_URL=$(jq -r '.backendUrl.value' "$OUTPUTS_FILE")

echo "Backend URL: $BACKEND_URL"

# Navigate to frontend directory
cd ../../frontend

# Create .env file for build
cat > .env.production <<EOF
VITE_API_URL=${BACKEND_URL}
EOF

# Install dependencies
echo ""
echo "Installing Node dependencies..."
npm install

# Build frontend
echo ""
echo "Building React app..."
npm run build

# Get Static Web App deployment token
RESOURCE_GROUP="${APP_NAME}-rg-${ENVIRONMENT}"
STATIC_WEB_APP_NAME="${APP_NAME}-web-${ENVIRONMENT}"

DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name "$STATIC_WEB_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.apiKey -o tsv)

# Deploy using SWA CLI
echo ""
echo "Deploying to Azure Static Web Apps..."

npx @azure/static-web-apps-cli deploy \
  --deployment-token "$DEPLOYMENT_TOKEN" \
  --app-location "." \
  --output-location "dist" \
  --env production

# Get frontend URL
FRONTEND_URL=$(az staticwebapp show \
  --name "$STATIC_WEB_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query defaultHostname -o tsv)

echo ""
echo "========================================="
echo "✅ Frontend Deployed!"
echo "========================================="
echo "URL: https://$FRONTEND_URL"
echo ""
echo "Next step: Run ./08-health-check.sh $ENVIRONMENT"
