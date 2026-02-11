<#
.SYNOPSIS
Migrates local SQLite database to Azure Database for PostgreSQL using Django commands.

.DESCRIPTION
This script:
1. Dumps the local SQLite database to a JSON file (using dumpdata).
2. Sets environment variables to connect to Azure PostgreSQL.
3. Runs migrations on Azure to create the schema.
4. Loads the dumped data into Azure (using loaddata).

.PARAMETER AzureHost
Azure PostgreSQL server hostname.

.PARAMETER AzureUser
Azure PostgreSQL admin username.

.PARAMETER AzureDbName
Target database name on Azure (default: postgres).
#>

param(
    [string]$AzureHost,
    [string]$AzureUser,
    [string]$AzureDbName = "postgres"
)

# Configuration
$ErrorActionPreference = "Stop"
$DumpFile = "data_for_migration.json"

# Function to check command availability
function Check-Command($cmd) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Error "Command '$cmd' not found. Please ensure Python/Django is installed and in your PATH."
        exit 1
    }
}

Check-Command "python"

# Get Inputs if missing
if ([string]::IsNullOrWhiteSpace($AzureHost)) {
    $AzureHost = Read-Host "Enter Azure Host (e.g., junkyard-db.postgres.database.azure.com)"
}
if ([string]::IsNullOrWhiteSpace($AzureUser)) {
    $AzureUser = Read-Host "Enter Azure Admin Username"
}

# Credentials
$AzurePassword = Read-Host "Enter Azure Password" -AsSecureString
$AzurePasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($AzurePassword))

# Step 1: Dump Local Data
Write-Host "`n[1/4] Dumping local data to $DumpFile..." -ForegroundColor Cyan
# Exclude contenttypes and permissions to avoid conflicts during load
$ExcludeApps = "--exclude auth.permission --exclude contenttypes"
try {
    # Unset DB env vars to ensure we use local SQLite
    $env:DB_ENGINE = $null
    $env:DB_HOST = $null
    $env:DB_USER = $null
    $env:DB_PASSWORD = $null
    
    python manage.py dumpdata $ExcludeApps --indent 2 --output $DumpFile
    Write-Host "Dump created successfully." -ForegroundColor Green
}
catch {
    Write-Error "Failed to dump local database."
    exit 1
}

# Step 2: Configure for Azure
Write-Host "`n[2/4] configuring environment for Azure..." -ForegroundColor Cyan
$env:DB_ENGINE = "django.db.backends.postgresql"
$env:DB_NAME = $AzureDbName
$env:DB_USER = $AzureUser
$env:DB_PASSWORD = $AzurePasswordPlain
$env:DB_HOST = $AzureHost
$env:DB_PORT = "5432"
$env:DB_SSLMODE = "require"

# Step 3: Run Migrations on Azure
Write-Host "`n[3/4] Running migrations on Azure Database..." -ForegroundColor Cyan
try {
    python manage.py migrate
    Write-Host "Migrations completed successfully." -ForegroundColor Green
}
catch {
    Write-Error "Failed to run migrations on Azure. Check connection details and firewall rules."
    exit 1
}

# Step 4: Load Data into Azure
Write-Host "`n[4/4] Loading data into Azure Database (this may take a while)..." -ForegroundColor Cyan
try {
    # Increase verbosity to see progress
    python manage.py loaddata $DumpFile
    Write-Host "Data loaded successfully!" -ForegroundColor Green
}
catch {
    Write-Error "Failed to load data. Check for integrity errors or timeouts."
    exit 1
}
finally {
    # Cleanup Env Vars
    $env:DB_ENGINE = $null
    $env:DB_NAME = $null
    $env:DB_USER = $null
    $env:DB_PASSWORD = $null
    $env:DB_HOST = $null
    $env:DB_PORT = $null
    $env:DB_SSLMODE = $null
    
    Write-Host "`nMigration Process Finished." -ForegroundColor Yellow
}
