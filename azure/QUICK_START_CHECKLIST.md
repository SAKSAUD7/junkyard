# 🚀 Azure Deployment - Quick Start Checklist

Follow this checklist to deploy your Junkyard platform to Azure in **11 simple steps**.

---

## ✅ Pre-Deployment Checklist

### 1️⃣ Create Azure Account
- [ ] Go to https://azure.microsoft.com/free/
- [ ] Sign up (get ₹13,300 free credits)
- [ ] Verify you can login to https://portal.azure.com

### 2️⃣ Install Tools
- [ ] Install Azure CLI: `winget install Microsoft.AzureCLI` (Windows)
- [ ] Install Git Bash (Windows only)
- [ ] Verify: `az --version` works
- [ ] Verify: `node --version` shows 18+
- [ ] Verify: `python --version` shows 3.11+

### 3️⃣ Login to Azure
```bash
cd azure/scripts
chmod +x *.sh
./01-setup-local.sh
```
- [ ] Browser opens for Azure login
- [ ] Select your subscription
- [ ] See "✅ Setup Complete!"

---

## 🛠️ Application Setup

### 4️⃣ Update Django Settings
Edit `backend/core/settings.py` - add after line 153:
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

if os.environ.get('AZURE_STORAGE_ACCOUNT_NAME'):
    DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'
    AZURE_ACCOUNT_NAME = os.environ.get('AZURE_STORAGE_ACCOUNT_NAME')
    AZURE_ACCOUNT_KEY = os.environ.get('AZURE_STORAGE_ACCOUNT_KEY')
    AZURE_CONTAINER = os.environ.get('AZURE_STORAGE_CONTAINER', 'media')
    AZURE_CUSTOM_DOMAIN = f'{AZURE_ACCOUNT_NAME}.blob.core.windows.net'
    MEDIA_URL = f'https://{AZURE_CUSTOM_DOMAIN}/{AZURE_CONTAINER}/'
```

- [ ] Code added to settings.py

### 5️⃣ Update Requirements
Add to `backend/requirements.txt`:
```
mssql-django
pyodbc
gunicorn
django-storages[azure]
```
- [ ] Dependencies added

---

## ☁️ Azure Deployment

### 6️⃣ Create Azure Resources (15 min)
```bash
./02-provision-infra.sh dev
```
- [ ] Script running
- [ ] Enter SendGrid key (or press Enter to skip)
- [ ] Wait 10-15 minutes
- [ ] See "✅ Infrastructure Provisioned!"
- [ ] Verify in Azure Portal: 6-7 resources in `junkyard-rg-dev`

### 7️⃣ Configure Secrets (2 min)
```bash
./03-configure-secrets.sh dev
```
- [ ] See "✅ Key Vault access configured"
- [ ] Verify in Portal: Key Vault has 4 secrets

### 8️⃣ Deploy Backend (10 min)
```bash
./04-deploy-backend.sh dev
```
- [ ] Wait 5-10 minutes
- [ ] Copy backend URL shown
- [ ] Test: Open `https://junkyard-api-dev.azurewebsites.net/api/health/`
- [ ] See: `{"status": "ok"}`

### 9️⃣ Setup Database (10 min)
```bash
./06-migrate-db.sh dev
```
- [ ] Migrations complete

Create superuser:
```bash
az webapp ssh --resource-group junkyard-rg-dev --name junkyard-api-dev
cd /home/site/wwwroot
python manage.py createsuperuser
```
- [ ] Superuser created
- [ ] Can login to `/admin/`

### 🔟 Deploy Frontend (10 min)
```bash
./05-deploy-frontend.sh dev
```
- [ ] Wait 5-10 minutes
- [ ] Copy frontend URL shown
- [ ] Test: Open `https://junkyard-web-dev.azurestaticapps.net`
- [ ] Frontend loads successfully

### 1️⃣1️⃣ Verify Everything (5 min)
```bash
./08-health-check.sh dev
```
- [ ] Backend health: ✅
- [ ] Frontend accessible: ✅
- [ ] Database connection: ✅

---

## 🎉 DEPLOYMENT COMPLETE!

### Your Live URLs:
- **Frontend**: `https://junkyard-web-dev.azurestaticapps.net`
- **Backend API**: `https://junkyard-api-dev.azurewebsites.net/api/`
- **Admin Panel**: `https://junkyard-api-dev.azurewebsites.net/admin/`

### Monthly Cost: ₹2,000

---

## 📊 Post-Deployment

### Monitor Your App
```bash
# View live logs
az webapp log tail --name junkyard-api-dev --resource-group junkyard-rg-dev
```

### Check Costs
1. Go to Azure Portal
2. Cost Management + Billing
3. Set budget alert: ₹3,000/month

### Update Your App
**Backend**:
```bash
cd backend
# Make changes
cd ../azure/scripts
./04-deploy-backend.sh dev
```

**Frontend**:
```bash
cd frontend
# Make changes
cd ../azure/scripts
./05-deploy-frontend.sh dev
```

---

## 🗑️ Clean Up (Stop Charges)
```bash
./10-destroy.sh dev
```
Type `DELETE` to confirm.

---

## 🆘 Need Help?

- **Detailed Guide**: See `COMPLETE_DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: Check application logs in Azure Portal
- **Azure Support**: https://portal.azure.com → Help + support

**Total Time**: 2-3 hours (first deployment)
**Difficulty**: Beginner-friendly ⭐⭐☆☆☆
