// Store secrets in Key Vault
param keyVaultName string
@secure()
param dbAdminPassword string
@secure()
param sendGridApiKey string
@secure()
param djangoSecretKey string
@secure()
param storageAccountKey string

resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' existing = {
  name: keyVaultName
}

// Database password
resource dbPasswordSecret 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {
  parent: keyVault
  name: 'db-password'
  properties: {
    value: dbAdminPassword
  }
}

// SendGrid API key
resource sendGridSecret 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {
  parent: keyVault
  name: 'sendgrid-api-key'
  properties: {
    value: sendGridApiKey
  }
}

// Django secret key
resource djangoSecret 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {
  parent: keyVault
  name: 'django-secret-key'
  properties: {
    value: djangoSecretKey
  }
}

// Storage account key
resource storageSecret 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {
  parent: keyVault
  name: 'storage-account-key'
  properties: {
    value: storageAccountKey
  }
}
