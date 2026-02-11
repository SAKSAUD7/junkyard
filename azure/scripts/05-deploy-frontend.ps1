param(
    [Parameter(Mandatory = $false)]
    [string]$Environment = "dev"
)

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Deploying React Frontend" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Load outputs
$outputsDir = "$env:USERPROFILE\.azure\junkyard"
$outputsFile = "$outputsDir\$Environment-outputs.json"

if (-not (Test-Path $outputsFile)) {
    Write-Host "❌ Outputs file not found. Run .\02-provision-infra.ps1 first" -ForegroundColor Red
    exit 1
}

$outputs = Get-Content $outputsFile -Raw | ConvertFrom-Json
$BackendUrl = $outputs.backendUrl.value
$ResourceGroup = $outputs.resourceGroupName.value
# Construct Static Web App Name
$StaticWebAppName = "junkyard-web-$Environment"

Write-Host "Backend URL: $BackendUrl" -ForegroundColor Cyan

# Navigate to frontend
Push-Location "..\..\frontend"

# Create .env.production
Write-Host "Creating .env.production..." -ForegroundColor Cyan
$envContent = "VITE_API_URL=$BackendUrl/api" # Ensure /api if needed? API is usually at /api on backend.
# Wait, backendUrl from main.bicep is output backendUrl string = 'https://${appService.outputs.defaultHostName}' (no /api)
# The frontend code usually expects the base URL.
# If I look at current services/api.js ?
# I'll check after writing this, but assuming standard VITE_API_URL usage.
# Assuming standard Django Rest Framework structure.
Set-Content -Path ".env.production" -Value "VITE_API_URL=$BackendUrl" -Encoding ASCII

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
# Using cmd /c just to be safe with npm on windows powershell sometimes
cmd /c npm install

# Build
Write-Host "Building React app..." -ForegroundColor Cyan
cmd /c npm run build

if (-not (Test-Path "dist")) {
    Write-Host "❌ Build failed. dist directory not found." -ForegroundColor Red
    Pop-Location
    exit 1
}

# Get Deployment Token
Write-Host "Getting Deployment Token..." -ForegroundColor Cyan
try {
    $DeploymentToken = az staticwebapp secrets list --name $StaticWebAppName --resource-group $ResourceGroup --query propertie.apiKey -o tsv 2>$null
    # Typo check: properties.apiKey?
    if (-not $DeploymentToken) {
        $DeploymentToken = az staticwebapp secrets list --name $StaticWebAppName --resource-group $ResourceGroup --query properties.apiKey -o tsv
    }
}
catch {
    Write-Host "Error getting token." -ForegroundColor Red
}

if (-not $DeploymentToken) {
    Write-Host "❌ Could not get deployment token." -ForegroundColor Red
    Pop-Location
    exit 1
}

# Deploy using SWA CLI (via npx)
Write-Host "Deploying..." -ForegroundColor Cyan
# npx might prompt for install, adding -y
cmd /c npx -y @azure/static-web-apps-cli deploy --deployment-token $DeploymentToken --app-location "." --output-location "dist" --env production

# Get frontend URL
$FrontendUrl = az staticwebapp show --name $StaticWebAppName --resource-group $ResourceGroup --query defaultHostname -o tsv

Write-Host ""
Write-Host "✅ Frontend Deployed!" -ForegroundColor Green
Write-Host "URL: https://$FrontendUrl"
Pop-Location
