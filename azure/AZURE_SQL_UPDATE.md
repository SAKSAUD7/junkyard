# Azure SQL Database - Updated Configuration

## ✅ Database Changed to Azure SQL Database

Per your request, the deployment architecture now uses **Azure SQL Database** instead of PostgreSQL.

## 📊 Cost Savings

| Database | Tier | Monthly Cost |
|----------|------|--------------|
| ~~PostgreSQL~~ | ~~B_Gen5_1~~ | ~~₹2,500~~ |
| **Azure SQL** | **Basic** | **₹400** |

**Savings**: ₹2,100/month (84% reduction!)

**New Total Cost**: ₹2,000/month (down from ₹4,100/month)

## 🔧 What Changed

### 1. Bicep Templates
- [`database.bicep`](file:///c:/Users/saksa/OneDrive/Desktop/junkyard/junkyard/azure/infra/modules/database.bicep) - Now provisions Azure SQL Server + Database
- [`app-service.bicep`](file:///c:/Users/saksa/OneDrive/Desktop/junkyard/junkyard/azure/infra/modules/app-service.bicep) - Updated connection strings

### 2. Django Configuration
```python
# backend/core/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'mssql',  # Changed from postgresql
        'OPTIONS': {
            'driver': 'ODBC Driver 18 for SQL Server',
        }
    }
}
```

### 3. Dependencies
```txt
# backend/requirements.txt
mssql-django      # Instead of psycopg2-binary
pyodbc            # ODBC driver for SQL Server
```

### 4. Connection Details
- **Host**: `junkyard-sql-dev.database.windows.net`
- **Port**: `1433` (instead of 5432)
- **Driver**: ODBC Driver 18 for SQL Server
- **Encryption**: Enabled (TLS 1.2)

## 🚀 Deployment Unchanged

The deployment process remains **exactly the same**:

```bash
cd azure/scripts
./01-setup-local.sh
./02-provision-infra.sh dev
./03-configure-secrets.sh dev
./04-deploy-backend.sh dev
./05-deploy-frontend.sh dev
```

## 🔐 Security Features

- ✅ TLS 1.2 encryption enforced
- ✅ Firewall rules (Azure services only)
- ✅ Credentials in Key Vault
- ✅ Managed Identity access

## 📝 Django Compatibility

Azure SQL Database is fully compatible with Django via `mssql-django`:
- ✅ Migrations work seamlessly
- ✅ ORM queries supported
- ✅ Admin panel works
- ✅ All Django features available

## 🔄 Still Cloud-Agnostic

The app remains portable:

```python
# Local development (SQLite)
DB_ENGINE=django.db.backends.sqlite3

# Azure (SQL Server)
DB_ENGINE=mssql

# AWS RDS (PostgreSQL)
DB_ENGINE=django.db.backends.postgresql

# GCP Cloud SQL (MySQL)
DB_ENGINE=django.db.backends.mysql
```

**No code changes required** - just environment variables!

## ✨ Benefits of Azure SQL

1. **Lower Cost**: ₹400/month vs ₹2,500/month
2. **Better Integration**: Native Azure service
3. **Familiar**: SQL Server compatibility
4. **Scalable**: Easy to upgrade tiers
5. **Managed**: Automatic backups, patching

## 📚 Updated Documentation

All documentation has been updated:
- [Implementation Plan](file:///c:/Users/saksa/.gemini/antigravity/brain/de605745-8a51-4cb6-ba9f-89a022f31865/implementation_plan.md)
- [Core App Changes](file:///c:/Users/saksa/OneDrive/Desktop/junkyard/junkyard/azure/CORE_APP_CHANGES.md)
- [Environment Example](file:///c:/Users/saksa/OneDrive/Desktop/junkyard/junkyard/azure/env/.env.example)

**Everything is ready to deploy with Azure SQL Database!** 🎉
