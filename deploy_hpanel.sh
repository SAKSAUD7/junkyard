#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# JYNM Permanent Deployment Script for Hostinger VPS (hPanel Terminal)
# Usage:
#   deploy-jynm            # refuses to run on a dirty working tree
#   deploy-jynm --force    # reset anyway (local edits are lost)
#   deploy-jynm --skip-backup
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

FORCE=0
SKIP_BACKUP=0
for arg in "$@"; do
    case "$arg" in
        --force) FORCE=1 ;;
        --skip-backup) SKIP_BACKUP=1 ;;
        *) echo "Unknown option: $arg" >&2; exit 2 ;;
    esac
done

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

BACKEND_DIR="$REPO_DIR/backend"
APP_USER="junkyard"

# Pick the interpreter the service actually uses.
if [ -x "$REPO_DIR/venv/bin/python" ]; then
    PY="$REPO_DIR/venv/bin/python"
elif [ -x "$BACKEND_DIR/venv/bin/python" ]; then
    PY="$BACKEND_DIR/venv/bin/python"
elif systemctl cat junkyard.service >/dev/null 2>&1; then
    # Read the interpreter straight out of the unit's ExecStart so manage.py
    # runs with the same Django install gunicorn uses.
    PY="$(systemctl cat junkyard.service 2>/dev/null \
          | sed -n 's/.*ExecStart=[^"]*\([^[:space:]]*python[^[:space:]]*\).*/\1/p' | head -1)"
    [ -x "$PY" ] || PY="python3"
else
    PY="python3"
fi
echo "  manage.py interpreter: $PY"

# Auto-install / update as a global command in /usr/local/bin.
# Never `cp` over the file that is currently executing: bash reads a script
# lazily, so truncating it mid-run makes the shell resume at a stale byte
# offset inside the new content and parse half a line. That is exactly how a
# deploy aborted with "deploy-jynm: line 29: =/home/junkyard/backend: No such
# file or directory" before it reached step 1. Rename instead - rename swaps
# the directory entry and leaves the inode the running shell holds untouched.
install_wrapper() {
    [ -w "/usr/local/bin" ] || return 0
    if cmp -s "$REPO_DIR/deploy_hpanel.sh" /usr/local/bin/deploy-jynm 2>/dev/null; then
        echo "  wrapper /usr/local/bin/deploy-jynm is already up to date"
        return 0
    fi
    tmp="/usr/local/bin/.deploy-jynm.$$.tmp"
    if cp "$REPO_DIR/deploy_hpanel.sh" "$tmp" && chmod +x "$tmp" && mv -f "$tmp" /usr/local/bin/deploy-jynm; then
        echo "✓ Global command 'deploy-jynm' installed. You can run 'deploy-jynm' from anywhere."
    else
        rm -f "$tmp" 2>/dev/null || true
        echo "  ! could not update /usr/local/bin/deploy-jynm - this run continues with $REPO_DIR/deploy_hpanel.sh"
    fi
}
install_wrapper

echo "▶ 1. Syncing latest changes from GitHub ($REPO_DIR)..."
git fetch origin main
# git reset --hard discards uncommitted work. Refuse rather than lose an
# operator's hotfix silently; --force is the explicit opt-out.
# Untracked files are excluded on purpose: MEDIA_ROOT uploads and collected
# staticfiles live in the working tree on every healthy deploy, reset --hard
# leaves them untouched, and counting them made the guard reject every run.
DIRTY="$(git status --porcelain --untracked-files=no || true)"
if [ -n "$DIRTY" ] && [ "$FORCE" -eq 0 ]; then
    echo "✗ Working tree has uncommitted changes to tracked files:"
    echo "$DIRTY" | head -20
    echo "  Commit or stash them, or re-run with --force to discard."
    exit 1
fi
git reset --hard origin/main
echo "  Now at $(git log -1 --oneline)"

echo "▶ 2. Building React frontend..."
cd "$REPO_DIR/frontend"
npm install --legacy-peer-deps --silent
npm run build

echo "▶ 3. Database backup + schema sync..."
cd "$BACKEND_DIR"
if [ "$SKIP_BACKUP" -eq 0 ]; then
    sudo -u "$APP_USER" -n "$PY" manage.py backup_db \
        || echo "  ! backup failed - fix it or re-run with --skip-backup"
else
    echo "  backup skipped (--skip-backup)"
fi

# Migrations are part of deployment: a model column that never reaches the
# schema makes every INSERT that touches it fail with a 500 in production.
UNAPPLIED="$(sudo -u "$APP_USER" -n "$PY" manage.py showmigrations --plan 2>/dev/null | grep -c '^\[ \]' || true)"
echo "  Unapplied migrations: ${UNAPPLIED:-unknown}"
if [ "${UNAPPLIED:-0}" -gt 0 ]; then
    sudo -u "$APP_USER" -n "$PY" manage.py migrate --noinput
    echo "  ✓ migrations applied"
else
    echo "  ✓ schema already up to date"
fi

echo "▶ 4. Ensuring backend logs & permissions..."
touch /var/log/jynm_gunicorn_access.log /var/log/jynm_gunicorn_error.log 2>/dev/null || true
chown junkyard:junkyard /var/log/jynm_gunicorn_*.log 2>/dev/null || true

echo "▶ 5. Restarting services..."
systemctl restart junkyard.service 2>/dev/null || true
systemctl reload nginx 2>/dev/null || true

echo "▶ 6. Verifying health..."
sleep 1
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/admin/login/ || echo "ERR")
echo "  Backend API status: $HTTP_STATUS"
# A lead POST that 500s is the failure this step exists to catch; an empty body
# is rejected by validation (400) before any DB write, so it creates nothing.
LEAD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H 'Content-Type: application/json' -d '{}' \
    http://127.0.0.1:8000/api/leads/ || echo "ERR")
if [ "$LEAD_STATUS" = "400" ]; then
    echo "  ✓ /api/leads/ reachable and validating (400 on empty payload)"
else
    echo "  ! /api/leads/ returned $LEAD_STATUS for an empty payload (expected 400)"
fi

echo "✅ Deployment complete! Verified at http://2.25.151.68/"
