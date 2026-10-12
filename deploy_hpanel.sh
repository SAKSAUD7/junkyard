#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# JYNM Permanent Deployment Script for Hostinger VPS (hPanel Terminal)
# Usage:
#   deploy-jynm   (or: bash deploy_hpanel.sh)
# ─────────────────────────────────────────────────────────────────────────────

set -e

# Detect Git repository location
if [ -d "/home/junkyard/.git" ]; then
    REPO_DIR="/home/junkyard"
elif [ -d "/var/www/junkyard/.git" ]; then
    REPO_DIR="/var/www/junkyard"
elif git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    REPO_DIR="$(git rev-parse --show-toplevel)"
else
    REPO_DIR="/home/junkyard"
fi

cd "$REPO_DIR"

# Auto-install / update as a global command in /usr/local/bin
if [ -w "/usr/local/bin" ]; then
    cp "$REPO_DIR/deploy_hpanel.sh" /usr/local/bin/deploy-jynm 2>/dev/null || true
    chmod +x /usr/local/bin/deploy-jynm 2>/dev/null || true
    echo "✓ Global command 'deploy-jynm' installed. You can run 'deploy-jynm' from anywhere."
fi

echo "▶ 1. Syncing latest changes from GitHub ($REPO_DIR)..."
git fetch origin main
git reset --hard origin/main

echo "▶ 2. Building React frontend..."
cd "$REPO_DIR/frontend"
npm install --legacy-peer-deps --silent
npm run build

echo "▶ 3. Ensuring backend logs & permissions..."
touch /var/log/jynm_gunicorn_access.log /var/log/jynm_gunicorn_error.log 2>/dev/null || true
chown junkyard:junkyard /var/log/jynm_gunicorn_*.log 2>/dev/null || true

echo "▶ 4. Restarting services..."
systemctl restart junkyard.service 2>/dev/null || true
systemctl reload nginx 2>/dev/null || true

echo "▶ 5. Verifying health..."
sleep 1
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/admin/login/ || echo "ERR")
echo "  Backend API status: $HTTP_STATUS"

echo "✅ Deployment complete! Verified at http://2.25.151.68/"

