# Complete Azure Deployment Guide - Start to Finish

## 🎯 What You'll Build

By the end of this guide, you'll have:
- ✅ Django backend running on Azure App Service
- ✅ React frontend on Azure Static Web Apps
- ✅ Azure SQL Database for data storage
- ✅ Azure Blob Storage for media files
- ✅ All secrets secured in Azure Key Vault
- ✅ Monitoring via Application Insights

**Total Time**: 2-3 hours (first time)
**Cost**: ₹2,000/month

---

## 📋 STEP 1: Create Azure Account (15 minutes)

### 1.1 Sign Up for Azure
1. Go to https://azure.microsoft.com/free/
2. Click **"Start free"**
3. Sign in with Microsoft account (or create one)
4. Fill in your details:
   - Name
   - Phone number
   - Credit/debit card (for verification, won't be charged)
5. Complete verification

### 1.2 Verify Free Credits
- You get ₹13,300 free credits for 30 days
- Plus 12 months of free services
- Check your credits: https://portal.azure.com → Cost Management

**✅ Checkpoint**: You can log into https://portal.azure.com

---

## 🛠️ STEP 2: Install Required Tools (20 minutes)

### 2.1 Install Azure CLI

**Windows**:
```powershell
# Download and run installer
winget install Microsoft.AzureCLI
```

**Mac**:
```bash
brew update && brew install azure-cli
```

**Linux**:
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### 2.2 Verify Installation
```bash
az --version
```

You should see version 2.x.x

### 2.3 Install Git Bash (Windows Only)
Download from: https://git-scm.com/download/win

### 2.4 Verify Node.js and Python
```bash
node --version  # Should be 18+
python --version  # Should be 3.11+
```

**✅ Checkpoint**: All commands above work without errors

---

## 🔐 STEP 3: Login to Azure (5 minutes)

### 3.1 Open Terminal
- **Windows**: Open Git Bash
- **Mac/Linux**: Open Terminal

### 3.2 Navigate to Project
```bash
cd /c/Users/saksa/OneDrive/Desktop/junkyard/junkyard/azure/scripts
# Or on Mac/Linux:
# cd ~/path/to/junkyard/azure/scripts
```

### 3.3 Make Scripts Executable
```bash
chmod +x *.sh
```

### 3.4 Run Setup Script
```bash
./01-setup-local.sh
```

This will:
1. Check if Azure CLI is installed
2. Open browser for login
3. Show your subscriptions
4. Ask you to select one

### 3.5 Select Subscription
When prompted, copy the **Subscription ID** and paste it.

**Example**:
```
Enter subscription ID to use: abc12345-6789-0def-1234-567890abcdef
```

**✅ Checkpoint**: You see "✅ Setup Complete!"

---

## 📝 STEP 4: Prepare Your Application (15 minutes)

### 4.1 Update Django Settings

Open `backend/core/settings.py` and add this code after line 153:

```python
# Database - Cloud-agnostic configuration
DATABASES = {
    'default': {
        'ENGINE': os.environ.get('DB_ENGINE', 'django.db.backends.sqlite3'),
        'NAME': os.environ.get('DB_NAME', BASE_DIR / 'db.sqlite3'),
        'USER': os.environ.get('DB_USER', ''),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', ''),
        'PORT': os.environ.get('DB_PORT', ''),
        'OPTIONS': {
            'driver': 'ODBC Driver 18 for SQL Server',
            'extra_params': os.environ.get('DB_OPTIONS', ''),
        } if os.environ.get('DB_ENGINE') == 'mssql' else {}
    }
}

# Media files - Cloud-agnostic
if os.environ.get('AZURE_STORAGE_ACCOUNT_NAME'):
    DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'
    AZURE_ACCOUNT_NAME = os.environ.get('AZURE_STORAGE_ACCOUNT_NAME')
    AZURE_ACCOUNT_KEY = os.environ.get('AZURE_STORAGE_ACCOUNT_KEY')
    AZURE_CONTAINER = os.environ.get('AZURE_STORAGE_CONTAINER', 'media')
    AZURE_CUSTOM_DOMAIN = f'{AZURE_ACCOUNT_NAME}.blob.core.windows.net'
    MEDIA_URL = f'https://{AZURE_CUSTOM_DOMAIN}/{AZURE_CONTAINER}/'
```

### 4.2 Update Requirements

Add to `backend/requirements.txt`:
```
mssql-django
pyodbc
gunicorn
django-storages[azure]
```

### 4.3 Test Locally (Optional)
```bash
cd ../../backend
python manage.py check
```

**✅ Checkpoint**: No errors when running `python manage.py check`

---

## ☁️ STEP 5: Create Azure Resources (15 minutes)

### 5.1 Run Infrastructure Provisioning
```bash
cd ../azure/scripts
./02-provision-infra.sh dev
```

### 5.2 What Happens
The script will:
1. Generate secure passwords automatically
2. Ask for your SendGrid API key (press Enter to skip for now)
3. Create a resource group: `junkyard-rg-dev`
4. Deploy all Azure services (takes 10-15 minutes)

**Services Created**:
- ✅ Azure SQL Server + Database
- ✅ Azure App Service (for Django)
- ✅ Azure Static Web App (for React)
- ✅ Azure Blob Storage
- ✅ Azure Key Vault
- ✅ Application Insights

### 5.3 Monitor Progress
You'll see output like:
```
Deploying Bicep templates...
This may take 10-15 minutes...
```

### 5.4 Verify in Azure Portal
1. Go to https://portal.azure.com
2. Click **"Resource groups"** in left menu
3. Click **"junkyard-rg-dev"**
4. You should see 6-7 resources

**✅ Checkpoint**: Resource group exists with all services

---

## 🔑 STEP 6: Configure Secrets (5 minutes)

### 6.1 Run Secrets Configuration
```bash
./03-configure-secrets.sh dev
```

This grants your App Service access to Key Vault.

### 6.2 Verify in Azure Portal
1. Go to Resource Groups → junkyard-rg-dev
2. Click on **"junkyard-kv-dev"** (Key Vault)
3. Click **"Secrets"** in left menu
4. You should see 4 secrets:
   - django-secret-key
   - db-password
   - sendgrid-api-key
   - storage-account-key

**✅ Checkpoint**: All secrets are visible in Key Vault

---

## 🚀 STEP 7: Deploy Backend (10 minutes)

### 7.1 Run Backend Deployment
```bash
./04-deploy-backend.sh dev
```

This will:
1. Install Python dependencies
2. Create startup script
3. Deploy Django to App Service
4. Takes 5-10 minutes

### 7.2 Monitor Deployment
You'll see:
```
Deploying to Azure App Service...
This may take 5-10 minutes...
```

### 7.3 Get Backend URL
At the end, you'll see:
```
URL: https://junkyard-api-dev.azurewebsites.net
Health Check: https://junkyard-api-dev.azurewebsites.net/api/health/
```

### 7.4 Test Backend
Open the health check URL in browser. You should see:
```json
{"status": "ok"}
```

**✅ Checkpoint**: Health check returns `{"status": "ok"}`

---

## 🗄️ STEP 8: Setup Database (10 minutes)

### 8.1 Run Migrations
```bash
./06-migrate-db.sh dev
```

This connects to your App Service and runs Django migrations.

### 8.2 Create Superuser
```bash
# Get resource names
APP_NAME="junkyard"
RESOURCE_GROUP="junkyard-rg-dev"
APP_SERVICE_NAME="junkyard-api-dev"

# SSH into App Service
az webapp ssh --resource-group $RESOURCE_GROUP --name $APP_SERVICE_NAME
```

Inside the SSH session:
```bash
cd /home/site/wwwroot
python manage.py createsuperuser
```

Enter:
- Username: `admin`
- Email: `admin@junkyard.com`
- Password: (choose a strong password)

Type `exit` to close SSH.

### 8.3 Test Admin Panel
Open: `https://junkyard-api-dev.azurewebsites.net/admin/`

Login with the credentials you just created.

**✅ Checkpoint**: You can log into Django admin panel

---

## 🎨 STEP 9: Deploy Frontend (10 minutes)

### 9.1 Run Frontend Deployment
```bash
./05-deploy-frontend.sh dev
```

This will:
1. Build React app
2. Deploy to Static Web Apps
3. Takes 5-10 minutes

### 9.2 Get Frontend URL
At the end, you'll see:
```
URL: https://junkyard-web-dev.azurestaticapps.net
```

### 9.3 Test Frontend
Open the URL in browser. You should see your React app.

**✅ Checkpoint**: Frontend loads successfully

---

## ✅ STEP 10: Verify Everything Works (10 minutes)

### 10.1 Run Health Check Script
```bash
./08-health-check.sh dev
```

This tests:
- ✅ Backend health endpoint
- ✅ Frontend accessibility
- ✅ Database connectivity

### 10.2 Manual Testing

**Test Backend API**:
```bash
curl https://junkyard-api-dev.azurewebsites.net/api/health/
```

**Test Admin Panel**:
1. Go to `https://junkyard-api-dev.azurewebsites.net/admin/`
2. Login with superuser credentials
3. Navigate through admin sections

**Test Frontend**:
1. Go to `https://junkyard-web-dev.azurestaticapps.net`
2. Navigate through pages
3. Test vendor login (use test account: `vendor@example.com` / `VendorPass123!`)

**✅ Checkpoint**: All tests pass

---

## 📊 STEP 11: Monitor Your Deployment (5 minutes)

### 11.1 View Application Insights
1. Go to Azure Portal
2. Resource Groups → junkyard-rg-dev
3. Click **"junkyard-insights-dev"**
4. Click **"Live Metrics"** to see real-time data

### 11.2 View Logs
```bash
# Backend logs
az webapp log tail --name junkyard-api-dev --resource-group junkyard-rg-dev

# Or in Azure Portal:
# App Service → Monitoring → Log stream
```

### 11.3 Check Costs
1. Azure Portal → Cost Management + Billing
2. View current spending
3. Set up budget alerts (recommended: ₹3,000/month)

**✅ Checkpoint**: You can see logs and metrics

---

## 🎉 SUCCESS! Your App is Live

### Your URLs:
- **Frontend**: `https://junkyard-web-dev.azurestaticapps.net`
- **Backend API**: `https://junkyard-api-dev.azurewebsites.net/api/`
- **Admin Panel**: `https://junkyard-api-dev.azurewebsites.net/admin/`

### What You've Deployed:
- ✅ Django REST API on Azure App Service
- ✅ React frontend on Static Web Apps
- ✅ Azure SQL Database
- ✅ Blob Storage for media files
- ✅ Secrets in Key Vault
- ✅ Monitoring with Application Insights

### Monthly Cost: ₹2,000

---

## 🔄 Making Updates

### Update Backend:
```bash
cd backend
# Make your changes
cd ../azure/scripts
./04-deploy-backend.sh dev
```

### Update Frontend:
```bash
cd frontend
# Make your changes
cd ../azure/scripts
./05-deploy-frontend.sh dev
```

---

## 🆘 Troubleshooting

### Backend not starting?
```bash
# Check logs
az webapp log tail --name junkyard-api-dev --resource-group junkyard-rg-dev
```

### Database connection failed?
```bash
# Test connection
az sql db show --name junkyard_db --server junkyard-sql-dev --resource-group junkyard-rg-dev
```

### Frontend not loading?
- Check Static Web App build logs in Azure Portal
- Verify `VITE_API_URL` is set correctly

---

## 🗑️ Clean Up (When Done Testing)

To delete everything and stop charges:
```bash
./10-destroy.sh dev
```

Type `DELETE` when prompted to confirm.

---

## 📚 Next Steps

1. **Production Deployment**: Run same steps with `prod` instead of `dev`
2. **Custom Domain**: Configure your own domain name
3. **CI/CD**: Set up GitHub Actions for automatic deployments
4. **Monitoring**: Configure alerts for errors and performance

**Congratulations! You've successfully deployed to Azure!** 🚀
