# Environment Variable → Azure Key Vault Mapping

This document maps application environment variables to their Azure Key Vault secret names.

## Secret Storage Strategy

- ✅ **Sensitive data**: Stored in Key Vault
- ✅ **Non-sensitive config**: Environment variables in App Service
- ✅ **Access**: App Service uses Managed Identity

## Mapping Table

| Application Variable | Key Vault Secret Name | Description | Example Value |
|---------------------|----------------------|-------------|---------------|
| `SECRET_KEY` | `django-secret-key` | Django secret key | `abc123...` |
| `DB_PASSWORD` | `db-password` | PostgreSQL password | `P@ssw0rd!` |
| `SENDGRID_API_KEY` | `sendgrid-api-key` | SendGrid API key | `SG.abc123...` |
| `AZURE_STORAGE_ACCOUNT_KEY` | `storage-account-key` | Blob storage key | `abc123...` |

## Non-Secret Environment Variables

These are set directly in App Service configuration:

| Variable | Source | Example |
|----------|--------|---------|
| `DEBUG` | App Service Config | `False` |
| `ALLOWED_HOSTS` | App Service Config | `junkyard-api-dev.azurewebsites.net` |
| `DB_ENGINE` | App Service Config | `django.db.backends.postgresql` |
| `DB_HOST` | App Service Config | `junkyard-db-dev.postgres.database.azure.com` |
| `DB_NAME` | App Service Config | `junkyard_db` |
| `DB_USER` | App Service Config | `junkyard_admin` |
| `DB_PORT` | App Service Config | `5432` |
| `AZURE_STORAGE_ACCOUNT_NAME` | App Service Config | `junkyardstorage` |

## How App Service Reads Secrets

App Service uses special syntax to reference Key Vault secrets:

```
@Microsoft.KeyVault(SecretUri=https://junkyard-kv-dev.vault.azure.net/secrets/django-secret-key/)
```

This is configured automatically in the Bicep template.

## Accessing Secrets Manually

### Via Azure CLI

```bash
# List all secrets
az keyvault secret list --vault-name junkyard-kv-dev --output table

# Get a secret value
az keyvault secret show --vault-name junkyard-kv-dev --name django-secret-key --query value -o tsv

# Set a secret
az keyvault secret set --vault-name junkyard-kv-dev --name new-secret --value "secret-value"
```

### Via Azure Portal

1. Navigate to Key Vault: `junkyard-kv-dev`
2. Click "Secrets" in left menu
3. Click secret name to view/edit

## Secret Rotation

### Manual Rotation

```bash
# Generate new secret
NEW_SECRET=$(openssl rand -base64 50)

# Update in Key Vault
az keyvault secret set \
  --vault-name junkyard-kv-dev \
  --name django-secret-key \
  --value "$NEW_SECRET"

# Restart App Service to pick up new value
az webapp restart \
  --name junkyard-api-dev \
  --resource-group junkyard-rg-dev
```

### Automated Rotation

For production, configure automatic rotation:

```bash
# Set expiration date (90 days)
az keyvault secret set \
  --vault-name junkyard-kv-prod \
  --name django-secret-key \
  --value "$SECRET" \
  --expires "$(date -d '+90 days' --iso-8601)"

# Enable notifications
az keyvault secret set-attributes \
  --vault-name junkyard-kv-prod \
  --name django-secret-key \
  --enabled true
```

## Security Best Practices

1. ✅ Never commit secrets to Git
2. ✅ Use Managed Identity for access
3. ✅ Enable soft delete on Key Vault
4. ✅ Rotate secrets every 90 days
5. ✅ Audit secret access via Azure Monitor
6. ✅ Use separate Key Vaults per environment

## Troubleshooting

### App Service can't access Key Vault

```bash
# Grant access to App Service
PRINCIPAL_ID=$(az webapp identity show \
  --name junkyard-api-dev \
  --resource-group junkyard-rg-dev \
  --query principalId -o tsv)

az keyvault set-policy \
  --name junkyard-kv-dev \
  --object-id $PRINCIPAL_ID \
  --secret-permissions get list
```

### Secret not updating

```bash
# Restart App Service
az webapp restart \
  --name junkyard-api-dev \
  --resource-group junkyard-rg-dev
```
