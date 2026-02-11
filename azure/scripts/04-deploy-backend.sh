#!/bin/bash
# Script 04: Deploy Django backend to Azure App Service

set -e

ENVIRONMENT=${1:-dev}
APP_NAME="junkyard"
RESOURCE_GROUP="${APP_NAME}-rg-${ENVIRONMENT}"
APP_SERVICE_NAME="${APP_NAME}-api-${ENVIRONMENT}"

echo "========================================="
echo "Deploying Django Backend"
echo "Environment: $ENVIRONMENT"
echo "========================================="

# Navigate to backend directory
cd ../../backend

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt
pip install psycopg2-binary gunicorn django-storages[azure]

# Update requirements.txt
echo "psycopg2-binary" >> requirements.txt
echo "gunicorn" >> requirements.txt
echo "django-storages[azure]" >> requirements.txt

# Create startup script for Azure
cat > startup.sh <<'EOF'
#!/bin/bash
python manage.py collectstatic --noinput
python manage.py migrate --noinput
gunicorn core.wsgi:application --bind=0.0.0.0:8000 --timeout 600
EOF

chmod +x startup.sh

# Deploy to App Service
echo ""
echo "Deploying to Azure App Service..."
echo "This may take 5-10 minutes..."

az webapp up \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_SERVICE_NAME" \
  --runtime "PYTHON:3.11" \
  --sku B1 \
  --location centralindia

# Configure startup command
az webapp config set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_SERVICE_NAME" \
  --startup-file "startup.sh"

# Get app URL
APP_URL=$(az webapp show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_SERVICE_NAME" \
  --query defaultHostName -o tsv)

echo ""
echo "========================================="
echo "✅ Backend Deployed!"
echo "========================================="
echo "URL: https://$APP_URL"
echo "Health Check: https://$APP_URL/api/health/"
echo ""
echo "Next step: Run ./06-migrate-db.sh $ENVIRONMENT"
