# ============================================================
# deploy_media.ps1 — Upload media files to Hostinger VPS
# Run this ONCE after setting up the VPS to transfer all images
# Usage: .\deploy_media.ps1 -VpsIp "YOUR_VPS_IP" -VpsUser "junkyard"
# ============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIp,

    [string]$VpsUser = "junkyard",
    [string]$LocalMediaPath = "backend\media",
    [string]$RemoteMediaPath = "/home/junkyard/backend/media"
)

Write-Host "🚀 Junkyard Media Upload to VPS" -ForegroundColor Cyan
Write-Host "VPS: $VpsUser@$VpsIp" -ForegroundColor Yellow
Write-Host "Local:  $LocalMediaPath" -ForegroundColor Gray
Write-Host "Remote: $RemoteMediaPath" -ForegroundColor Gray
Write-Host ""

# Check if scp is available
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ERROR: 'scp' not found. Install OpenSSH or use Git Bash." -ForegroundColor Red
    exit 1
}

# Count files to upload
$fileCount = (Get-ChildItem $LocalMediaPath -Recurse -File | Where-Object { $_.Name -ne '.gitkeep' }).Count
$totalMB = [math]::Round((Get-ChildItem $LocalMediaPath -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB, 1)

Write-Host "📦 Files to upload: $fileCount files ($totalMB MB)" -ForegroundColor White
Write-Host ""
Write-Host "Starting upload... (this may take a few minutes)" -ForegroundColor Yellow
Write-Host ""

# Upload vendor_logos (biggest folder)
Write-Host "📁 Uploading vendor_logos..." -ForegroundColor Cyan
scp -r "$LocalMediaPath\vendor_logos" "${VpsUser}@${VpsIp}:${RemoteMediaPath}/"
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ vendor_logos done" -ForegroundColor Green }
else { Write-Host "   ❌ vendor_logos failed" -ForegroundColor Red }

# Upload vendors
Write-Host "📁 Uploading vendors..." -ForegroundColor Cyan
scp -r "$LocalMediaPath\vendors" "${VpsUser}@${VpsIp}:${RemoteMediaPath}/"
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ vendors done" -ForegroundColor Green }
else { Write-Host "   ❌ vendors failed" -ForegroundColor Red }

# Upload ads
Write-Host "📁 Uploading ads..." -ForegroundColor Cyan
scp -r "$LocalMediaPath\ads" "${VpsUser}@${VpsIp}:${RemoteMediaPath}/"
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ ads done" -ForegroundColor Green }
else { Write-Host "   ❌ ads failed" -ForegroundColor Red }

# Upload submissions
Write-Host "📁 Uploading submissions..." -ForegroundColor Cyan
scp -r "$LocalMediaPath\submissions" "${VpsUser}@${VpsIp}:${RemoteMediaPath}/"
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ submissions done" -ForegroundColor Green }
else { Write-Host "   ❌ submissions failed" -ForegroundColor Red }

Write-Host ""
Write-Host "🎉 Upload complete! Now fix permissions on VPS:" -ForegroundColor Green
Write-Host "   ssh ${VpsUser}@${VpsIp} 'chmod -R 755 ${RemoteMediaPath}'" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ All images are now on the VPS at $RemoteMediaPath" -ForegroundColor Green
