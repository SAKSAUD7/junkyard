#!/bin/bash
# Script 08: Health check and verification

set -e

ENVIRONMENT=${1:-dev}

echo "========================================="
echo "Running Health Checks"
echo "Environment: $ENVIRONMENT"
echo "========================================="

# Load outputs
OUTPUTS_FILE=~/.azure/junkyard/${ENVIRONMENT}-outputs.json
BACKEND_URL=$(jq -r '.backendUrl.value' "$OUTPUTS_FILE")
FRONTEND_URL=$(jq -r '.frontendUrl.value' "$OUTPUTS_FILE")

echo "Backend: $BACKEND_URL"
echo "Frontend: https://$FRONTEND_URL"
echo ""

# Check backend health
echo "Checking backend health..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/api/health/")

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Backend is healthy (HTTP $HTTP_CODE)"
else
    echo "❌ Backend health check failed (HTTP $HTTP_CODE)"
fi

# Check frontend
echo ""
echo "Checking frontend..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$FRONTEND_URL")

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Frontend is accessible (HTTP $HTTP_CODE)"
else
    echo "❌ Frontend check failed (HTTP $HTTP_CODE)"
fi

# Check database connection
echo ""
echo "Checking database connection..."
APP_NAME="junkyard"
RESOURCE_GROUP="${APP_NAME}-rg-${ENVIRONMENT}"
APP_SERVICE_NAME="${APP_NAME}-api-${ENVIRONMENT}"

az webapp ssh \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_SERVICE_NAME" \
  --command "cd /home/site/wwwroot && python manage.py check --database default" \
  && echo "✅ Database connection successful" \
  || echo "❌ Database connection failed"

echo ""
echo "========================================="
echo "Health Check Complete"
echo "========================================="
echo ""
echo "Access your application:"
echo "  Frontend: https://$FRONTEND_URL"
echo "  Backend API: $BACKEND_URL/api/"
echo "  Admin Panel: $BACKEND_URL/admin/"
