# GitHub + Azure Integration Guide

## 🎯 Complete Setup: Automated Deployment + GitHub CI/CD

This guide covers:
1. **Manual deployment** using scripts (one-time setup)
2. **GitHub Actions** for automatic deployments on every push

---

## PART 1: Initial Deployment (Do This First)

### Step 1: Open Git Bash

```bash
# Navigate to scripts
cd /c/Users/saksa/OneDrive/Desktop/junkyard/junkyard/azure/scripts

# Make executable
chmod +x *.sh
```

### Step 2: Login to Azure

```bash
./01-setup-local.sh
```

**Follow prompts:**
- Browser opens → Login with your Azure account
- Copy your Subscription ID when shown
- Paste it when prompted

### Step 3: Create All Azure Services

```bash
./02-provision-infra.sh dev
```

**What happens:**
- Generates secure passwords automatically
- Asks for SendGrid API key (press Enter to skip for now)
- Creates all Azure resources (15 minutes)
- Saves outputs to `~/.azure/junkyard/dev-outputs.json`

**Services created:**
- ✅ Azure SQL Database
- ✅ App Service (Django)
- ✅ Static Web App (React)
- ✅ Blob Storage
- ✅ Key Vault
- ✅ Application Insights

### Step 4: Configure Secrets

```bash
./03-configure-secrets.sh dev
```

Grants App Service access to Key Vault.

### Step 5: Update Your Code

Edit `backend/core/settings.py` - add after the existing `DATABASES` definition (around line 153):

```python
# Replace the existing DATABASES with this cloud-agnostic version
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

# Add Azure Blob Storage support
if os.environ.get('AZURE_STORAGE_ACCOUNT_NAME'):
    DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'
    AZURE_ACCOUNT_NAME = os.environ.get('AZURE_STORAGE_ACCOUNT_NAME')
    AZURE_ACCOUNT_KEY = os.environ.get('AZURE_STORAGE_ACCOUNT_KEY')
    AZURE_CONTAINER = os.environ.get('AZURE_STORAGE_CONTAINER', 'media')
    AZURE_CUSTOM_DOMAIN = f'{AZURE_ACCOUNT_NAME}.blob.core.windows.net'
    MEDIA_URL = f'https://{AZURE_CUSTOM_DOMAIN}/{AZURE_CONTAINER}/'
```

Add to `backend/requirements.txt`:
```
mssql-django
pyodbc
gunicorn
django-storages[azure]
```

### Step 6: Deploy Backend

```bash
./04-deploy-backend.sh dev
```

Wait 5-10 minutes. You'll get a URL like:
`https://junkyard-api-dev.azurewebsites.net`

### Step 7: Setup Database

```bash
./06-migrate-db.sh dev
```

Create superuser:
```bash
az webapp ssh --resource-group junkyard-rg-dev --name junkyard-api-dev
cd /home/site/wwwroot
python manage.py createsuperuser
exit
```

### Step 8: Deploy Frontend

```bash
./05-deploy-frontend.sh dev
```

Wait 5-10 minutes. You'll get a URL like:
`https://junkyard-web-dev.azurestaticapps.net`

### Step 9: Verify

```bash
./08-health-check.sh dev
```

**✅ Your app is now live!**

---

## PART 2: Connect GitHub for Auto-Deployment

### Step 1: Push Code to GitHub

```bash
cd /c/Users/saksa/OneDrive/Desktop/junkyard/junkyard

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit with Azure deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/junkyard.git
git branch -M main
git push -u origin main
```

### Step 2: Get Azure Publish Profile

```bash
# Download publish profile
az webapp deployment list-publishing-profiles \
  --name junkyard-api-dev \
  --resource-group junkyard-rg-dev \
  --xml > publish-profile.xml

# Copy the contents
cat publish-profile.xml
```

Copy the entire XML output.

### Step 3: Add GitHub Secrets

1. Go to your GitHub repo
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:

**Secret 1: AZURE_WEBAPP_PUBLISH_PROFILE**
- Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
- Value: Paste the XML from publish-profile.xml

**Secret 2: AZURE_STATIC_WEB_APPS_API_TOKEN**
```bash
# Get Static Web App token
az staticwebapp secrets list \
  --name junkyard-web-dev \
  --resource-group junkyard-rg-dev \
  --query properties.apiKey -o tsv
```
- Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
- Value: Paste the token

**Secret 3: VITE_API_URL**
- Name: `VITE_API_URL`
- Value: `https://junkyard-api-dev.azurewebsites.net`

### Step 4: Enable GitHub Actions

The workflow file is already created at `.github/workflows/azure-deploy.yml`

Push it to GitHub:
```bash
git add .github/workflows/azure-deploy.yml
git commit -m "Add GitHub Actions workflow"
git push
```

### Step 5: Test Auto-Deployment

Make a change and push:

**For backend deployment:**
```bash
# Make a change in backend
git add backend/
git commit -m "[backend] Update API"
git push
```

**For frontend deployment:**
```bash
# Make a change in frontend
git add frontend/
git commit -m "[frontend] Update UI"
git push
```

**For both:**
```bash
git commit -m "[backend][frontend] Update both"
git push
```

---

## 🎉 You're Done!

### What You Have Now:

1. **Live Application**
   - Frontend: `https://junkyard-web-dev.azurestaticapps.net`
   - Backend: `https://junkyard-api-dev.azurewebsites.net`
   - Admin: `https://junkyard-api-dev.azurewebsites.net/admin/`

2. **Automated Deployments**
   - Push to GitHub → Automatically deploys to Azure
   - Separate workflows for backend/frontend
   - Manual trigger option available

3. **Cost**: ₹2,000/month

### Deployment Workflow:

```
Local Changes → Git Commit → Git Push → GitHub Actions → Azure Deployment
```

### Monitor Deployments:

- **GitHub**: Repository → Actions tab
- **Azure**: Portal → App Service → Deployment Center

---

## 🔄 Daily Workflow

```bash
# Make changes to your code
cd backend  # or frontend

# Test locally
python manage.py runserver  # or npm run dev

# Commit and push
git add .
git commit -m "[backend] Your changes"
git push

# GitHub Actions automatically deploys to Azure!
```

---

## 🆘 Troubleshooting

### GitHub Actions failing?
- Check Actions tab for error logs
- Verify all secrets are set correctly
- Ensure publish profile is valid

### Deployment not updating?
- Check if commit message has `[backend]` or `[frontend]`
- Manually trigger: GitHub → Actions → Run workflow

### Need to redeploy manually?
```bash
cd azure/scripts
./04-deploy-backend.sh dev  # Backend
./05-deploy-frontend.sh dev  # Frontend
```

---

## 📚 Next Steps

1. **Production Deployment**: Repeat with `prod` environment
2. **Custom Domain**: Configure in Azure Portal
3. **SSL Certificate**: Auto-provisioned by Azure
4. **Monitoring**: Set up alerts in Application Insights

**Congratulations! You have a fully automated deployment pipeline!** 🚀
