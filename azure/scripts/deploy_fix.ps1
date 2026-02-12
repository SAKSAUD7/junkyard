param(
    [string]$Environment = "dev"
)

$ErrorActionPreference = "Stop"
Write-Host "Manual Deployment Fix for Junkyard Backend" -ForegroundColor Cyan

# Hardcoded Inputs
$ResourceGroup = "junkyard"
$AppServiceName = "junkyard-api-dev"

# Navigate to backend
if (Test-Path "backend") {
    Push-Location "backend"
}
else {
    Write-Host "Cannot find backend directory in $PWD" -ForegroundColor Red
    exit 1
}

# Add requirements if missing
$reqFile = "requirements.txt"
$packages = @("mssql-django", "gunicorn", "django-storages[azure]", "whitenoise")
if (Test-Path $reqFile) {
    $currentReqs = Get-Content $reqFile -Raw
    foreach ($pkg in $packages) {
        if ($currentReqs -notmatch $pkg) {
            Add-Content -Path $reqFile -Value "`n$pkg"
            Write-Host "Added $pkg to requirements.txt" -ForegroundColor Yellow
        }
    }
}

# Create startup.sh
$startupScript = "#!/bin/bash`ncd /home/site/wwwroot`npython manage.py collectstatic --noinput`npython manage.py migrate --noinput`ngunicorn core.wsgi:application --bind=0.0.0.0:8000 --timeout 600"
$startupScript = $startupScript -replace "`r`n", "`n"
[IO.File]::WriteAllText("$PWD\startup.sh", $startupScript)
Write-Host "Created startup.sh" -ForegroundColor Green

# Create Zip
$zipPath = "..\backend_deploy.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath }

# Exclude typically large/unnecessary folders
Get-ChildItem -Path . -Exclude "venv", "env", ".git", ".vscode", "__pycache__", "*.pyc", "*.sqlite3", ".DS_Store" | Compress-Archive -DestinationPath $zipPath -Force

# Deploy
Write-Host "Deploying to Azure App Service ($AppServiceName)..." -ForegroundColor Cyan
az webapp deployment source config-zip --resource-group $ResourceGroup --name $AppServiceName --src $zipPath

# Configure Start Command
az webapp config set --resource-group $ResourceGroup --name $AppServiceName --startup-file "startup.sh"

# Cleanup
Remove-Item $zipPath -Force
Remove-Item "startup.sh" -Force
Pop-Location

Write-Host "✅ Backend Deployed Successfully!" -ForegroundColor Green
