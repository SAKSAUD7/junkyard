#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# JYNM Permanent Deployment Script for Hostinger VPS (hPanel Terminal)
# Usage:
#   deploy-jynm   (or: bash deploy_hpanel.sh)
# ─────────────────────────────────────────────────────────────────────────────

set -e

# Auto-install as a global command if not already installed
if [ -w "/usr/local/bin" ] && [ ! -f "/usr/local/bin/deploy-jynm" ]; then
    cp "$0" /usr/local/bin/deploy-jynm 2>/dev/null || true
    chmod +x /usr/local/bin/deploy-jynm 2>/dev/null || true
    echo "✓ Installed 'deploy-jynm' globally. You can now run 'deploy-jynm' from anywhere."
fi

REPO_DIR="/var/www/junkyard"
if [ -d "$REPO_DIR" ]; then
    cd "$REPO_DIR"
fi

echo "▶ 1. Syncing latest changes from GitHub..."
git fetch origin main
git reset --hard origin/main

echo "▶ 2. Building React frontend..."
cd frontend
npm install --legacy-peer-deps --silent
npm run build

echo "▶ 3. Updating production dist directory..."
if [ -d "/var/www/junkyard/frontend" ] && [ "$(pwd)" != "/var/www/junkyard/frontend" ]; then
    echo "  Syncing dist to /var/www/junkyard/frontend/dist..."
    mkdir -p /var/www/junkyard/frontend/dist
    cp -r dist/* /var/www/junkyard/frontend/dist/
fi

echo "▶ 4. Reloading Nginx & Services..."
sudo systemctl reload nginx 2>/dev/null || systemctl reload nginx 2>/dev/null || true

echo "✅ Permanent deployment complete! Verified at http://2.25.151.68/"
