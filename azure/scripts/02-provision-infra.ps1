# Azure Infrastructure Provisioning Script for PowerShell
# Step 2: Provision Azure infrastructure using Bicep

param(
  [Parameter(Mandatory = $false)]
  [string]$Environment = "dev",

  [Parameter(Mandatory = $false)]
  [string]$ResourceGroupName = "junkyard",

  [Parameter(Mandatory = $false)]
  [string]$Location = "centralindia",

  [Parameter(Mandatory = $false)]
  [string]$SendGridKey = ""
)

$AppName = "junkyard"
$ResourceGroup = $ResourceGroupName

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Provisioning Azure Infrastructure" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Location: $Location" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Load subscription ID
$subscriptionFile = "$env:USERPROFILE\.azure\junkyard\subscription_id"
if (Test-Path $subscriptionFile) {
  $subscriptionId = Get-Content $subscriptionFile -Raw
  $subscriptionId = $subscriptionId.Trim()
}
else {
  Write-Host "❌ Subscription ID not found. Run .\01-setup-local.ps1 first" -ForegroundColor Red
  exit 1
}

az account set --subscription $subscriptionId

# Generate secrets
Write-Host ""
Write-Host "Generating secure secrets..." -ForegroundColor Cyan

# Generate random passwords
Add-Type -AssemblyName System.Web
$DbPassword = [System.Web.Security.Membership]::GeneratePassword(32, 10)
$DjangoSecret = [System.Web.Security.Membership]::GeneratePassword(50, 15)

Write-Host "✅ Secrets generated" -ForegroundColor Green

# Use provided SendGrid Key or dummy
Write-Host ""
if ([string]::IsNullOrWhiteSpace($SendGridKey)) {
  Write-Host "No SendGrid Key provided, usymmy key." -ForegroundColor Yellow
  $SendGridKey = "dummy-key-for-dev"
}

# Create parameters file
$ParamsDir = "..\infra\parameters"
New-Item -ItemType Directory -Force -Path $ParamsDir | Out-Null
$ParamsFile = "$ParamsDir\$Environment.bicepparam"

$paramsContent = @"
using '../main.bicep'

param environment = '$Environment'
param location = '$Location'
param resourceGroupName = '$ResourceGroup'
param appName = '$AppName'
param dbAdminUsername = '${AppName}_admin'
param dbAdminPassword = '$DbPassword'
param sendGridApiKey = '$SendGridKey'
param djangoSecretKey = '$DjangoSecret'
"@

$paramsContent | Out-File -FilePath $ParamsFile -Encoding UTF8

Write-Host "✅ Parameters file created: $ParamsFile" -ForegroundColor Green

# Deploy infrastructure
Write-Host ""
Write-Host "Deploying Bicep templates..." -ForegroundColor Cyan
Write-Host "This may take 10-15 minutes..." -ForegroundColor Yellow

$deploymentName = "junkyard-$Environment-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

az deployment sub create `
  --name $deploymentName `
  --location $Location `
  --template-file ..\infra\main.bicep `
  --parameters $ParamsFile `
  --output table

# Get outputs
Write-Host ""
Write-Host "Retrieving deployment outputs..." -ForegroundColor Cyan

$outputsDir = "$env:USERPROFILE\.azure\junkyard"
$outputsFile = "$outputsDir\$Environment-outputs.json"

az deployment sub show `
  --name $deploymentName `
  --query properties.outputs `
  --output json | Out-File -FilePath $outputsFile -Encoding UTF8

az deployment sub show `
  --name $deploymentName `
  --query properties.outputs `
  --output table

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Infrastructure Provisioned!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Outputs saved to: $outputsFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next step: Run .\03-configure-secrets.ps1 $Environment" -ForegroundColor Yellow
