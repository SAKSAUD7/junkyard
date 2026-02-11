# Step-by-Step Deployment Guide

## Prerequisites

- Azure subscription
- Azure CLI installed
- Git installed
- Node.js 18+ installed
- Python 3.11+ installed

## Deployment Steps

### Step 1: Setup Azure CLI (5 minutes)

```bash
cd azure/scripts
chmod +x *.sh
./01-setup-local.sh
```

**What this does:**
- Installs Azure CLI (if needed)
- Logs you into Azure
- Sets active subscription
- Installs Bicep CLI

### Step 2: Provision Infrastructure (10-15 minutes)

```bash
./02-provision-infra.sh dev
```

**What this creates:**
- Resource Group
- PostgreSQL Database
- Blob Storage Account
- Key Vault
- App Service
- Static Web App
- Application Insights

**Cost**: ~₹4,100/month for dev environment

### Step 3: Configure Secrets (2 minutes)

```bash
./03-configure-secrets.sh dev
```

**What this does:**
- Grants Key Vault access to App Service
- Verifies secret storage
- Sets up managed identity

### Step 4: Deploy Backend (10 minutes)

```bash
./04-deploy-backend.sh dev
```

**What this does:**
- Installs Python dependencies
- Creates startup script
- Deploys Django app to App Service
- Configures environment variables

### Step 5: Run Database Migrations (2 minutes)

```bash
./06-migrate-db.sh dev
```

**What this does:**
- Connects to App Service via SSH
- Runs `python manage.py migrate`
- Creates database schema

### Step 6: Create Superuser

```bash
# SSH into App Service
APP_NAME="junkyard"
ENVIRONMENT="dev"
RESOURCE_GROUP="${APP_NAME}-rg-${ENVIRONMENT}"
APP_SERVICE_NAME="${APP_NAME}-api-${ENVIRONMENT}"

az webapp ssh --resource-group $RESOURCE_GROUP --name $APP_SERVICE_NAME

# Inside SSH session:
cd /home/site/wwwroot
python manage.py createsuperuser
```

### Step 7: Deploy Frontend (5 minutes)

```bash
./05-deploy-frontend.sh dev
```

**What this does:**
- Builds React app with production config
- Deploys to Azure Static Web Apps
- Configures API URL

### Step 8: Verify Deployment (2 minutes)

```bash
./08-health-check.sh dev
```

**What this checks:**
- Backend health endpoint
- Frontend accessibility
- Database connectivity

## Post-Deployment

### Access Your Application

Get URLs from deployment outputs:

```bash
cat ~/.azure/junkyard/dev-outputs.json
```

- **Frontend**: `https://junkyard-web-dev.azurestaticapps.net`
- **Backend API**: `https://junkyard-api-dev.azurewebsites.net/api/`
- **Admin Panel**: `https://junkyard-api-dev.azurewebsites.net/admin/`

### Monitor Application

```bash
# View logs
az webapp log tail --name junkyard-api-dev --resource-group junkyard-rg-dev

# View metrics in Azure Portal
az monitor metrics list --resource <app-service-id>
```

## Troubleshooting

### Backend not starting

```bash
# Check logs
az webapp log tail --name junkyard-api-dev --resource-group junkyard-rg-dev

# SSH into container
az webapp ssh --name junkyard-api-dev --resource-group junkyard-rg-dev
```

### Database connection issues

```bash
# Test connection
az postgres flexible-server connect \
  --name junkyard-db-dev \
  --admin-user junkyard_admin \
  --database junkyard_db
```

### Frontend not loading

- Check Static Web App build logs in Azure Portal
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in Django

## Updating Deployment

### Update Backend

```bash
cd backend
# Make changes
cd ../azure/scripts
./04-deploy-backend.sh dev
```

### Update Frontend

```bash
cd frontend
# Make changes
cd ../azure/scripts
./05-deploy-frontend.sh dev
```

## Scaling

### Scale App Service

```bash
# Scale up (more powerful)
az appservice plan update \
  --name junkyard-plan-dev \
  --resource-group junkyard-rg-dev \
  --sku P1v2

# Scale out (more instances)
az appservice plan update \
  --name junkyard-plan-dev \
  --resource-group junkyard-rg-dev \
  --number-of-workers 3
```

### Scale Database

```bash
az postgres flexible-server update \
  --name junkyard-db-dev \
  --resource-group junkyard-rg-dev \
  --sku-name Standard_D4s_v3
```

## Cleanup

### Delete Everything

```bash
./10-destroy.sh dev
```

This deletes ALL Azure resources for the environment.
