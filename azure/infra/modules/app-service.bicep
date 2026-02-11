// Azure App Service for Django Backend
param location string
param environment string
param appName string
param keyVaultName string
param dbHost string
param dbName string
param storageAccountName string
param appInsightsConnectionString string

var appServiceName = '${appName}-api-${environment}'
var appServicePlanName = '${appName}-plan-${environment}'

// App Service Plan (Linux)
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: environment == 'prod' ? 'P1v2' : 'B1'
    tier: environment == 'prod' ? 'PremiumV2' : 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true // Required for Linux
  }
}

// App Service (Web App)
resource appService 'Microsoft.Web/sites@2022-03-01' = {
  name: appServiceName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.11'
      alwaysOn: environment == 'prod'
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
      appSettings: [
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
        {
          name: 'WEBSITE_HTTPLOGGING_RETENTION_DAYS'
          value: '7'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        // Django settings
        {
          name: 'DEBUG'
          value: environment == 'dev' ? 'True' : 'False'
        }
        {
          name: 'SECRET_KEY'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVaultName}.vault.azure.net/secrets/django-secret-key/)'
        }
        {
          name: 'ALLOWED_HOSTS'
          value: '${appServiceName}.azurewebsites.net'
        }
        // Database
        {
          name: 'DB_ENGINE'
          value: 'mssql'
        }
        {
          name: 'DB_HOST'
          value: dbHost
        }
        {
          name: 'DB_NAME'
          value: dbName
        }
        {
          name: 'DB_USER'
          value: '${appName}_admin'
        }
        {
          name: 'DB_PASSWORD'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVaultName}.vault.azure.net/secrets/db-password/)'
        }
        {
          name: 'DB_PORT'
          value: '1433'
        }
        {
          name: 'DB_OPTIONS'
          value: 'driver=ODBC Driver 18 for SQL Server;Encrypt=yes;TrustServerCertificate=no'
        }
        // Storage
        {
          name: 'AZURE_STORAGE_ACCOUNT_NAME'
          value: storageAccountName
        }
        {
          name: 'AZURE_STORAGE_ACCOUNT_KEY'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVaultName}.vault.azure.net/secrets/storage-account-key/)'
        }
        {
          name: 'AZURE_STORAGE_CONTAINER'
          value: 'media'
        }
        // Email
        {
          name: 'SENDGRID_API_KEY'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVaultName}.vault.azure.net/secrets/sendgrid-api-key/)'
        }
        // Monitoring
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsightsConnectionString
        }
      ]
    }
  }
}

output appServiceId string = appService.id
output defaultHostName string = appService.properties.defaultHostName
output principalId string = appService.identity.principalId
