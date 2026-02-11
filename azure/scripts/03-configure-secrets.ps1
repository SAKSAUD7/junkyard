param(
    [Parameter(Mandatory = $false)]
    [string]$Environment = "dev"
)

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Configuring Azure Key Vault Secrets" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Load outputs
$outputsDir = "$env:USERPROFILE\.azure\.junkyard"  # Correction: The setup script created .azure\junkyard (no dot before junkyard). 
# Wait, 01-setup-local.ps1: $azureDir = "$env:USERPROFILE\.azure\junkyard"
# 02-provision-infra.ps1: $outputsDir = "$env:USERPROFILE\.azure\junkyard"
$outputsDir = "$env:USERPROFILE\.azure\junkyard"
$outputsFile = "$outputsDir\$Environment-outputs.json"

if (-not (Test-Path $outputsFile)) {
    Write-Host "❌ Outputs file not found. Run .\02-provision-infra.ps1 first" -ForegroundColor Red
    exit 1
}

# Read JSON
try {
    $outputs = Get-Content $outputsFile -Raw | ConvertFrom-Json
}
catch {
    Write-Host "❌ Failed to parse outputs JSON." -ForegroundColor Red
    exit 1
}

$KeyVaultName = $outputs.keyVaultName.value
$ResourceGroup = $outputs.resourceGroupName.value

Write-Host "Key Vault: $KeyVaultName" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor Cyan

# Grant current user access
Write-Host ""
Write-Host "Granting Key Vault access to current user..." -ForegroundColor Cyan
$CurrentUser = az account show --query user.name -o tsv
az keyvault set-policy --name $KeyVaultName --upn $CurrentUser --secret-permissions get list set delete

# Get App Service Principal ID
$AppServiceName = "junkyard-api-$Environment"

Write-Host ""
Write-Host "Getting App Service Identity for $AppServiceName..." -ForegroundColor Cyan
try {
    $PrincipalId = az webapp identity show --name $AppServiceName --resource-group $ResourceGroup --query principalId -o tsv 2>$null
}
catch {
    Write-Host "Error finding webapp identity." -ForegroundColor Red
}

if (-not $PrincipalId) {
    Write-Host "⚠️  Could not get Principal ID for $AppServiceName. It might not be created yet or Identity not enabled." -ForegroundColor Yellow
}
else {
    Write-Host "App Service Principal ID: $PrincipalId" -ForegroundColor Green
    
    # Grant App Service access
    Write-Host ""
    Write-Host "Granting Key Vault access to App Service..." -ForegroundColor Cyan
    az keyvault set-policy --name $KeyVaultName --object-id $PrincipalId --secret-permissions get list
}

Write-Host ""
Write-Host "✅ Key Vault access configured" -ForegroundColor Green
Write-Host "Next step: Deploy Backend" -ForegroundColor Yellow
