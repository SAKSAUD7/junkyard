#!/bin/bash
# Script 01: Setup local development environment for Azure deployment

set -e  # Exit on error

echo "========================================="
echo "Azure CLI Setup & Authentication"
echo "========================================="

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Installing..."
    
    # Detect OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew update && brew install azure-cli
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        echo "Please install Azure CLI from: https://aka.ms/installazurecliwindows"
        exit 1
    fi
else
    echo "✅ Azure CLI already installed"
    az version
fi

# Login to Azure
echo ""
echo "Logging in to Azure..."
az login

# List available subscriptions
echo ""
echo "Available subscriptions:"
az account list --output table

# Prompt for subscription selection
echo ""
read -p "Enter subscription ID to use: " SUBSCRIPTION_ID

# Set active subscription
az account set --subscription "$SUBSCRIPTION_ID"

echo ""
echo "✅ Active subscription:"
az account show --output table

# Install Bicep CLI
echo ""
echo "Installing/Updating Bicep CLI..."
az bicep install
az bicep upgrade

echo ""
echo "✅ Bicep version:"
az bicep version

# Create .azure directory for local config
mkdir -p ~/.azure/junkyard

# Save subscription ID
echo "$SUBSCRIPTION_ID" > ~/.azure/junkyard/subscription_id

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo "Next step: Run ./02-provision-infra.sh <environment>"
echo "Example: ./02-provision-infra.sh dev"
