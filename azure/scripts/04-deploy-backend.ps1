param(
    [Parameter(Mandatory = $false)]
    [string]$Environment = "dev"
)

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Deploying Django Backend" -ForegroundColor Cyan
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
$ResourceGroup = $outputs.resourceGroupName.value
# Construct App Service Name using naming convention from bicep since it's not explicitly outputted as name
$AppServiceName = "junkyard-api-$Environment" 

Write-Host "Target: $AppServiceName (RG: $ResourceGroup)" -ForegroundColor Cyan

# Navigate to backend
Push-Location "..\..\backend"

# Add requirements if missing -> mssql-django for Azure SQL
$reqFile = "requirements.txt"
$packages = @("mssql-django", "gunicorn", "django-storages[azure]", "whitenoise")
if (Test-Path $reqFile) {
    $currentReqs = Get-Content $reqFile -Raw
    foreach ($pkg in $packages) {
        if ($currentReqs -notmatch $pkg) {
            Add-Content -Path $reqFile -Value $pkg
            Write-Host "Added $pkg to requirements.txt" -ForegroundColor Yellow
        }
    }
}
else {
    Write-Host "requirements.txt not found!" -ForegroundColor Red
    exit 1
}

# Create startup.sh with LF line endings forcefully
$startupScript = "#!/bin/bash`npython manage.py collectstatic --noinput`npython manage.py migrate --noinput`ngunicorn core.wsgi:application --bind=0.0.0.0:8000 --timeout 600"
# Ensure only LF
$startupScript = $startupScript -replace "`r`n", "`n"
[IO.File]::WriteAllText("$PWD\startup.sh", $startupScript)
Write-Host "Created startup.sh" -ForegroundColor Green

# Create Zip
Write-Host "Creating deployment zip..." -ForegroundColor Cyan
$zipPath = "..\backend.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath }

# Exclude typically large/unnecessary folders
# Note: Compress-Archive is simple. For more complex excludes, explicit list is needed.
# We will exclude venv, env, .git, __pycache__, .vscode, and static/media root if present locally
Get-ChildItem -Path . -Exclude "venv", "env", ".git", ".vscode", "__pycache__", "*.pyc", "*.sqlite3", ".DS_Store" | Compress-Archive -DestinationPath $zipPath -Force

# Deploy
Write-Host "Deploying to Azure App Service..." -ForegroundColor Cyan
# Using config-zip is robust for CI/CD style
az webapp deployment source config-zip --resource-group $ResourceGroup --name $AppServiceName --src $zipPath

# Configure Start Command explicitly (redundant if using startup-file config, but good verify)
Write-Host "Configuring startup command..." -ForegroundColor Cyan
az webapp config set --resource-group $ResourceGroup --name $AppServiceName --startup-file "startup.sh"

# Cleanup
Remove-Item $zipPath -Force
Remove-Item "startup.sh" -Force
Pop-Location

$AppUrl = "https://$AppServiceName.azurewebsites.net"
Write-Host ""
Write-Host "✅ Backend Deployed!" -ForegroundColor Green
Write-Host "URL: $AppUrl"
Write-Host "Health: $AppUrl/api/health/"
Write-Host "Next step: Run .\06-migrate-db.ps1 (if separate migration needed) or check logs." -ForegroundColor Yellow
