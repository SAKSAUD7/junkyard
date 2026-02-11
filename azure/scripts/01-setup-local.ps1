# Azure Setup Script for PowerShell
# Step 1: Setup Azure CLI and Login

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Azure CLI Setup & Authentication" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if Azure CLI is installed
try {
    $azVersion = az version 2>$null
    Write-Host "✅ Azure CLI already installed" -ForegroundColor Green
    az version
} catch {
    Write-Host "❌ Azure CLI not found. Installing..." -ForegroundColor Red
    Write-Host "Please download and install from: https://aka.ms/installazurecliwindows" -ForegroundColor Yellow
    Start-Process "https://aka.ms/installazurecliwindows"
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

# Login to Azure
Write-Host ""
Write-Host "Logging in to Azure..." -ForegroundColor Cyan
az login

# List available subscriptions
Write-Host ""
Write-Host "Available subscriptions:" -ForegroundColor Cyan
az account list --output table

# Prompt for subscription selection
Write-Host ""
$subscriptionId = Read-Host "Enter subscription ID to use"

# Set active subscription
az account set --subscription $subscriptionId

Write-Host ""
Write-Host "✅ Active subscription:" -ForegroundColor Green
az account show --output table

# Install Bicep CLI
Write-Host ""
Write-Host "Installing/Updating Bicep CLI..." -ForegroundColor Cyan
az bicep install
az bicep upgrade

Write-Host ""
Write-Host "✅ Bicep version:" -ForegroundColor Green
az bicep version

# Create .azure directory for local config
$azureDir = "$env:USERPROFILE\.azure\junkyard"
New-Item -ItemType Directory -Force -Path $azureDir | Out-Null

# Save subscription ID
$subscriptionId | Out-File -FilePath "$azureDir\subscription_id" -Encoding UTF8

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Next step: Run .\02-provision-infra.ps1 dev" -ForegroundColor Yellow
