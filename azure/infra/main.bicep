// Main Bicep template - Orchestrates all Azure resources
// This file is the entry point for infrastructure deployment

targetScope = 'subscription'

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string

@description('Azure region for resources')
param location string = 'centralindia'

@description('Resource group name')
param resourceGroupName string = 'junkyard-rg-${environment}'

@description('Application name prefix')
param appName string = 'junkyard'

@description('Database administrator username')
@secure()
param dbAdminUsername string

@description('Database administrator password')
@secure()
param dbAdminPassword string

@description('SendGrid API key')
@secure()
param sendGridApiKey string

@description('Django secret key')
@secure()
param djangoSecretKey string

// Create resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
  tags: {
    Environment: environment
    Application: 'Junkyard Auto Parts'
    ManagedBy: 'Bicep'
  }
}

// Deploy Key Vault first (needed for secrets)
module keyVault 'modules/keyvault.bicep' = {
  scope: rg
  name: 'keyVault-deployment'
  params: {
    location: location
    environment: environment
    appName: appName
  }
}

// Deploy PostgreSQL Database
module database 'modules/database.bicep' = {
  scope: rg
  name: 'database-deployment'
  params: {
    location: location
    environment: environment
    appName: appName
    administratorLogin: dbAdminUsername
    administratorPassword: dbAdminPassword
  }
}

// Deploy Blob Storage
module storage 'modules/storage.bicep' = {
  scope: rg
  name: 'storage-deployment'
  params: {
    location: location
    environment: environment
    appName: appName
  }
}

// Deploy Application Insights
module monitoring 'modules/monitoring.bicep' = {
  scope: rg
  name: 'monitoring-deployment'
  params: {
    location: location
    environment: environment
    appName: appName
  }
}

// Deploy App Service (Backend)
module appService 'modules/app-service.bicep' = {
  scope: rg
  name: 'appService-deployment'
  params: {
    location: location
    environment: environment
    appName: appName
    keyVaultName: keyVault.outputs.keyVaultName
    dbHost: database.outputs.fqdn
    dbName: database.outputs.databaseName
    storageAccountName: storage.outputs.storageAccountName
    appInsightsConnectionString: monitoring.outputs.connectionString
  }
}

// Deploy Static Web App (Frontend)
module staticWebApp 'modules/static-web-app.bicep' = {
  scope: rg
  name: 'staticWebApp-deployment'
  params: {
    location: location
    environment: environment
    appName: appName
    apiUrl: appService.outputs.defaultHostName
  }
}

// Store secrets in Key Vault
module secrets 'modules/secrets.bicep' = {
  scope: rg
  name: 'secrets-deployment'
  params: {
    keyVaultName: keyVault.outputs.keyVaultName
    dbAdminPassword: dbAdminPassword
    sendGridApiKey: sendGridApiKey
    djangoSecretKey: djangoSecretKey
    storageAccountKey: storage.outputs.primaryKey
  }
  dependsOn: [
    keyVault
  ]
}

// Outputs for reference
output resourceGroupName string = rg.name
output keyVaultName string = keyVault.outputs.keyVaultName
output databaseFqdn string = database.outputs.fqdn
output storageAccountName string = storage.outputs.storageAccountName
output backendUrl string = 'https://${appService.outputs.defaultHostName}'
output frontendUrl string = staticWebApp.outputs.defaultHostname
output appInsightsInstrumentationKey string = monitoring.outputs.instrumentationKey
