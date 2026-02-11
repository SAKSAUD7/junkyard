# 🎯 Next Steps - You're Here!

## ✅ What You've Done
- Created Azure account
- Created a resource group in Azure Portal

## 🚀 What to Do Next

### OPTION 1: Use Automated Scripts (Recommended - Easiest!)

Open **Git Bash** (or Terminal on Mac/Linux) and run these commands:

```bash
# Navigate to scripts folder
cd /c/Users/saksa/OneDrive/Desktop/junkyard/junkyard/azure/scripts

# Make scripts executable
chmod +x *.sh

# Step 1: Login to Azure CLI
./01-setup-local.sh
```

**What happens**: Browser opens, you login, select your subscription.

**Then continue with**:
```bash
# Step 2: Create all Azure services (15 minutes)
./02-provision-infra.sh dev

# Step 3: Configure secrets (2 minutes)
./03-configure-secrets.sh dev

# Step 4: Deploy Django backend (10 minutes)
./04-deploy-backend.sh dev

# Step 5: Deploy React frontend (10 minutes)
./05-deploy-frontend.sh dev
```

---

### OPTION 2: Manual Setup in Azure Portal

If you prefer clicking in the portal, here's what to create:

#### 1. Azure SQL Database
1. In Azure Portal, click **"Create a resource"**
2. Search for **"SQL Database"**
3. Click **Create**
4. Settings:
   - Resource group: Select your existing one
   - Database name: `junkyard_db`
   - Server: Create new
     - Server name: `junkyard-sql-dev`
     - Admin: `junkyard_admin`
     - Password: (choose strong password - save it!)
     - Location: **Central India**
   - Compute + storage: **Basic** (₹400/month)
5. Click **Review + create**

#### 2. App Service (for Django)
1. Create a resource → **Web App**
2. Settings:
   - Name: `junkyard-api-dev`
   - Runtime: **Python 3.11**
   - Region: **Central India**
   - Pricing: **Basic B1** (₹1,200/month)
3. Click **Review + create**

#### 3. Static Web App (for React)
1. Create a resource → **Static Web App**
2. Settings:
   - Name: `junkyard-web-dev`
   - Region: **Central India**
   - Plan: **Free**
3. Click **Review + create**

#### 4. Storage Account (for media files)
1. Create a resource → **Storage Account**
2. Settings:
   - Name: `junkyardstorage` (must be unique)
   - Region: **Central India**
   - Performance: **Standard**
   - Redundancy: **LRS**
3. Click **Review + create**

#### 5. Key Vault (for secrets)
1. Create a resource → **Key Vault**
2. Settings:
   - Name: `junkyard-kv-dev`
   - Region: **Central India**
   - Pricing: **Standard**
3. Click **Review + create**

---

## 💡 My Recommendation

**Use OPTION 1 (Automated Scripts)** because:
- ✅ Faster (15 minutes vs 1 hour)
- ✅ No mistakes
- ✅ Everything configured correctly
- ✅ Secrets automatically secured
- ✅ All services linked together

---

## 🆘 Need Help?

**If you're stuck**, just tell me:
1. Which option you want to use (automated or manual)
2. Any error messages you see

I'll guide you through it step by step!

---

## 📍 Where You Are Now

```
[✅] Create Azure account
[✅] Create resource group
[ ] Install Azure CLI          ← YOU ARE HERE
[ ] Login to Azure
[ ] Create Azure services
[ ] Deploy backend
[ ] Deploy frontend
[ ] Test everything
```

**Next command to run**:
```bash
cd /c/Users/saksa/OneDrive/Desktop/junkyard/junkyard/azure/scripts
./01-setup-local.sh
```
