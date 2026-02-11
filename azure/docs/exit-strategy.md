# Exit Strategy - Migrating Off Azure

## Philosophy

The `/azure` folder is **100% isolated**. Your core application (`/backend`, `/frontend`) has ZERO Azure dependencies.

## How to Remove Azure (10 Minutes)

### Step 1: Export Data (5 minutes)

```bash
# Backup database
az postgres flexible-server db dump \
  --name junkyard-db-prod \
  --resource-group junkyard-rg-prod \
  --output-file backup.sql

# Download media files
az storage blob download-batch \
  --account-name junkyardstorage \
  --source media \
  --destination ./media-backup
```

### Step 2: Delete Azure Folder (1 second)

```bash
rm -rf azure/
```

### Step 3: Update Environment Variables (2 minutes)

```bash
# backend/.env
DB_ENGINE=django.db.backends.postgresql
DB_HOST=localhost
DB_NAME=junkyard_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_PORT=5432

# Remove Azure storage config
unset AZURE_STORAGE_ACCOUNT_NAME
unset AZURE_STORAGE_ACCOUNT_KEY
```

### Step 4: Run Locally (2 minutes)

```bash
# Start local PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:14

# Import data
psql -h localhost -U postgres < backup.sql

# Run backend
cd backend
python manage.py runserver

# Run frontend
cd frontend
npm run dev
```

**Done!** Your app runs locally with zero Azure code.

## Migrate to AWS

### Step 1: Create `/aws` Folder

```bash
mkdir -p aws/{infra,scripts,docs}
```

### Step 2: Reuse Docker Images

The same Docker images work on:
- AWS ECS/Fargate
- AWS App Runner
- AWS Elastic Beanstalk

### Step 3: Replace Infrastructure

```bash
# aws/infra/main.tf (Terraform)
resource "aws_db_instance" "postgres" {
  engine = "postgres"
  # ... same database, different provider
}

resource "aws_ecs_service" "backend" {
  # ... same Django app, different hosting
}

resource "aws_s3_bucket" "media" {
  # ... same media files, different storage
}
```

### Step 4: Update Environment Variables

```bash
# AWS RDS
DB_HOST=junkyard.abc123.us-east-1.rds.amazonaws.com

# AWS S3 (using django-storages)
AWS_STORAGE_BUCKET_NAME=junkyard-media
AWS_S3_REGION_NAME=us-east-1
```

**No code changes required!**

## Migrate to GCP

### Step 1: Create `/gcp` Folder

```bash
mkdir -p gcp/{infra,scripts,docs}
```

### Step 2: Use Cloud Run

```bash
# Deploy same Docker image
gcloud run deploy junkyard-api \
  --image gcr.io/project/junkyard-backend \
  --platform managed
```

### Step 3: Use Cloud SQL

```bash
# Same PostgreSQL, different provider
gcloud sql instances create junkyard-db \
  --database-version=POSTGRES_14
```

### Step 4: Use Cloud Storage

```bash
# Same media files, different bucket
gsutil mb gs://junkyard-media
```

## Migrate to Self-Hosted

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: junkyard_db
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  backend:
    build: ./backend
    environment:
      DB_HOST: db
      DB_NAME: junkyard_db

  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: http://backend:8000

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
```

### Kubernetes

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: junkyard-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: django
        image: junkyard/backend:latest
        env:
        - name: DB_HOST
          value: postgres-service
```

## What Remains Cloud-Agnostic

✅ **Core Application**
- Django backend code
- React frontend code
- Database models
- API endpoints
- Business logic

✅ **Docker Images**
- Same images work everywhere
- No cloud-specific layers

✅ **Environment Variables**
- Same config pattern
- Only values change

## What Changes Per Cloud

❌ **Infrastructure Code**
- Bicep → Terraform → CloudFormation
- Different syntax, same resources

❌ **Deployment Scripts**
- Azure CLI → AWS CLI → gcloud
- Different commands, same actions

❌ **Service Names**
- App Service → ECS → Cloud Run
- Different names, same containers

## Cost Comparison

| Service | Azure | AWS | GCP |
|---------|-------|-----|-----|
| Compute | App Service B1 | t3.small EC2 | Cloud Run |
| Cost | ₹1,200/mo | ₹1,000/mo | ₹800/mo |
| Database | PostgreSQL B1 | db.t3.micro | db-f1-micro |
| Cost | ₹2,500/mo | ₹2,000/mo | ₹1,800/mo |
| Storage | Blob LRS | S3 Standard | Cloud Storage |
| Cost | ₹150/mo | ₹120/mo | ₹100/mo |
| **Total** | **₹3,850/mo** | **₹3,120/mo** | **₹2,700/mo** |

## Conclusion

Your application is **truly portable**:
- Delete `/azure` folder → runs locally
- Create `/aws` folder → runs on AWS
- Create `/gcp` folder → runs on GCP
- Use Docker Compose → runs anywhere

**Zero vendor lock-in achieved!** 🎉
