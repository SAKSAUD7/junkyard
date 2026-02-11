# Azure Deployment Guide

## 🚀 Junkyard Auto Parts Platform - Azure Deployment

This directory contains **100% isolated Azure deployment infrastructure**. The core application (`/backend`, `/frontend`) remains completely cloud-agnostic.

## 📋 Quick Start

### 🚀 New to Azure? Start Here!

**📖 Complete Step-by-Step Guide**: [COMPLETE_DEPLOYMENT_GUIDE.md](COMPLETE_DEPLOYMENT_GUIDE.md)
- Beginner-friendly with detailed explanations
- Every step with screenshots and examples
- Troubleshooting tips included

**✅ Quick Checklist**: [QUICK_START_CHECKLIST.md](QUICK_START_CHECKLIST.md)
- Simple checkbox format
- Copy-paste commands ready
- 11 steps to live deployment

### ⚡ Already Know Azure? Deploy in 5 Commands

```bash
cd azure/scripts

# 1. Setup Azure CLI and login
./01-setup-local.sh

# 2. Provision all Azure infrastructure
./02-provision-infra.sh dev

# 3. Configure secrets in Key Vault
./03-configure-secrets.sh dev

# 4. Deploy backend API
./04-deploy-backend.sh dev

# 5. Deploy frontend
./05-deploy-frontend.sh dev
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Azure Front Door (Optional)              │
│                    CDN + WAF + SSL Termination               │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼────────┐  ┌────▼──────────┐
│ Static Web App │  │  App Service  │
│   (Frontend)   │  │   (Backend)   │
│  React + Vite  │  │ Django + DRF  │
└────────────────┘  └───────┬───────┘
                            │
                    ┌───────┴────────┐
                    │                │
            ┌───────▼──────┐  ┌─────▼────────┐
            │  Azure SQL   │  │ Blob Storage │
            │   Database   │  │ Media Files  │
            └──────────────┘  └──────────────┘
                    │
            ┌───────▼──────┐
            │  Key Vault   │
            │   Secrets    │
            └──────────────┘
```

## 📁 Directory Structure

```
/azure/
├── README.md                    # This file
├── ARCHITECTURE.md              # Detailed architecture docs
├── env/                         # Environment configurations
├── infra/                       # Bicep Infrastructure as Code
├── scripts/                     # Deployment automation
├── pipelines/                   # CI/CD workflows
├── docker/                      # Container definitions
├── secrets/                     # Secret management docs
└── docs/                        # Additional documentation
```

## 🔐 Security

- All secrets stored in Azure Key Vault
- Managed Identity for service-to-service auth
- HTTPS enforced everywhere
- Database firewall rules
- CORS properly configured

## 💰 Cost Estimate (India Central Region)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| App Service | B1 Basic | ₹1,200 |
| Static Web Apps | Free | ₹0 |
| Azure SQL Database | Basic | ₹400 |
| Blob Storage | Standard | ₹150 |
| Key Vault | Standard | ₹50 |
| Monitoring | Pay-as-you-go | ₹200 |
| **Total** | | **₹2,000/month** |

## 🔄 Portability

### Remove Azure (Delete in 1 Command)
```bash
rm -rf azure/
```
Core app continues to work with local services.

### Add AWS/GCP Later
1. Create `/aws` or `/gcp` folder
2. Reuse same Docker images
3. Update environment variables only

## 📚 Documentation

- [Deployment Guide](docs/deployment-guide.md) - Step-by-step instructions
- [Architecture](ARCHITECTURE.md) - Detailed architecture
- [Troubleshooting](docs/troubleshooting.md) - Common issues
- [Monitoring](docs/monitoring.md) - How to monitor
- [Exit Strategy](docs/exit-strategy.md) - Migrate off Azure

## 🆘 Support

For issues specific to Azure deployment, check:
1. [Troubleshooting Guide](docs/troubleshooting.md)
2. Azure Portal logs
3. Application Insights

For application issues, refer to main project README.
