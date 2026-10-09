#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# JYNM Atomic Frontend Deploy Script
# Usage (run from repo root on local machine or VPS):
#   bash deploy.sh
#
# What it does:
#  1. Builds the React/Vite frontend
#  2. Verifies all assets referenced in index.html actually exist in dist/
#  3. On VPS: atomically swaps the public dir so index.html + assets are always
#     in sync — no stale-chunk MIME-type errors
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

FRONTEND_DIR="$(cd "$(dirname "$0")/frontend" && pwd)"
DIST_DIR="$FRONTEND_DIR/dist"

# ── Step 1: Build ─────────────────────────────────────────────────────────────
echo "▶ Building frontend..."
cd "$FRONTEND_DIR"
npm install --legacy-peer-deps --silent
npm run build

echo "✅ Build complete — output in $DIST_DIR"

# ── Step 2: Integrity check — confirm index.html assets exist on disk ─────────
echo "▶ Verifying asset integrity..."
MISSING=0
while IFS= read -r asset; do
    FILE="$DIST_DIR${asset}"
    if [[ ! -f "$FILE" ]]; then
        echo "  ❌ MISSING: $FILE"
        MISSING=$((MISSING + 1))
    fi
done < <(grep -oP '(?<=src="|href=")[^"]+(?:\.js|\.css)' "$DIST_DIR/index.html" 2>/dev/null || true)

if [[ $MISSING -gt 0 ]]; then
    echo "❌ Deploy aborted — $MISSING assets referenced in index.html are missing from dist/"
    exit 1
fi
echo "✅ All assets verified"

# ── Step 3: VPS atomic deploy (skip if no VPS_HOST set) ──────────────────────
VPS_HOST="${VPS_HOST:-}"
VPS_USER="${VPS_USER:-root}"
VPS_WEB_ROOT="${VPS_WEB_ROOT:-/var/www/junkyard/frontend/dist}"

if [[ -z "$VPS_HOST" ]]; then
    echo ""
    echo "ℹ  VPS_HOST not set — skipping remote deploy."
    echo "   To deploy to your VPS, run:"
    echo "     VPS_HOST=2.25.151.68 VPS_USER=root VPS_WEB_ROOT=/var/www/junkyard/frontend/dist bash deploy.sh"
    echo ""
    echo "   Or SSH to your VPS and run these commands:"
    echo "     cd /path/to/junkyard-1"
    echo "     git pull origin main"
    echo "     cd frontend && npm install --legacy-peer-deps && npm run build"
    echo "     # Atomic swap:"
    echo "     cp -r dist /var/www/junkyard/frontend/dist_new"
    echo "     mv /var/www/junkyard/frontend/dist /var/www/junkyard/frontend/dist_old"
    echo "     mv /var/www/junkyard/frontend/dist_new /var/www/junkyard/frontend/dist"
    echo "     systemctl reload nginx"
    echo "     rm -rf /var/www/junkyard/frontend/dist_old"
    exit 0
fi

echo "▶ Deploying to $VPS_USER@$VPS_HOST:$VPS_WEB_ROOT..."

# Upload new build to a staging directory
rsync -az --delete "$DIST_DIR/" "$VPS_USER@$VPS_HOST:${VPS_WEB_ROOT}_new/"

# Atomic swap on the remote server
ssh "$VPS_USER@$VPS_HOST" bash << EOF
set -e
if [[ -d "${VPS_WEB_ROOT}" ]]; then
    mv "${VPS_WEB_ROOT}" "${VPS_WEB_ROOT}_old"
fi
mv "${VPS_WEB_ROOT}_new" "${VPS_WEB_ROOT}"
systemctl reload nginx
echo "✅ Nginx reloaded"
# Cleanup old build after brief grace period (keeps requests in-flight from failing)
sleep 5
rm -rf "${VPS_WEB_ROOT}_old"
echo "✅ Old dist cleaned up"
EOF

echo ""
echo "🚀 Deploy complete!"
echo "   Verify: curl -sI http://${VPS_HOST}/assets/ | grep Content-Type"
