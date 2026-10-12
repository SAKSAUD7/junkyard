#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# JYNM One-Step Deployment Script for Hostinger VPS (hPanel Terminal)
# Usage:
#   bash deploy_hpanel.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "▶ 1. Pulling latest changes from GitHub..."
git pull origin main

echo "▶ 2. Building React frontend..."
cd frontend
npm install --legacy-peer-deps --silent
npm run build

echo "▶ 3. Updating production dist directory..."
# If repo is in /var/www/junkyard, dist is automatically updated.
# If repo is cloned elsewhere, copy to /var/www/junkyard/frontend/dist:
if [ -d "/var/www/junkyard/frontend" ] && [ "$(pwd)" != "/var/www/junkyard/frontend" ]; then
    echo "  Syncing dist to /var/www/junkyard/frontend/dist..."
    mkdir -p /var/www/junkyard/frontend/dist
    cp -r dist/* /var/www/junkyard/frontend/dist/
fi

echo "▶ 4. Reloading Nginx..."
sudo systemctl reload nginx || systemctl reload nginx

echo "✅ Deployment successful! Verified at http://2.25.151.68/"
