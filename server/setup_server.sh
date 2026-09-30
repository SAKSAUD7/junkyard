#!/bin/bash
# =============================================================
# JYNM Server Setup — Run ONCE after git pull on Hostinger VPS
# Run as root:  bash /home/junkyard/server/setup_server.sh
# =============================================================

set -e
REPO="/home/junkyard"
SERVER_DIR="$REPO/server"
SERVICE_FILE="/etc/systemd/system/junkyard.service"

echo "🚀 JYNM Server Setup Starting..."

# ---- 1. Copy Gunicorn config ----
echo "📋 Installing gunicorn config..."
cp "$SERVER_DIR/gunicorn.conf.py" "$REPO/backend/gunicorn.conf.py"

# ---- 2. Update ExecStart in systemd service to use gunicorn.conf.py ----
echo "🔧 Updating ExecStart in junkyard.service..."
CURRENT_EXEC=$(grep "ExecStart" "$SERVICE_FILE" | head -1)
echo "Current: $CURRENT_EXEC"

# Extract the gunicorn binary path from the existing ExecStart
GUNICORN_BIN=$(echo "$CURRENT_EXEC" | grep -oP '/\S+/gunicorn')

if [ -z "$GUNICORN_BIN" ]; then
    echo "⚠️  Could not detect gunicorn path. Skipping ExecStart update."
    echo "   Manually update ExecStart to add: --config /home/junkyard/backend/gunicorn.conf.py"
else
    # Replace ExecStart line only, preserve rest of service file
    sed -i "s|^ExecStart=.*|ExecStart=$GUNICORN_BIN --config /home/junkyard/backend/gunicorn.conf.py core.wsgi:application|" "$SERVICE_FILE"
    echo "✅ Service ExecStart updated to use gunicorn.conf.py"
fi

# ---- 3. Install healthcheck script ----
echo "📦 Installing healthcheck.sh..."
chmod +x "$SERVER_DIR/healthcheck.sh"

# ---- 4. Add healthcheck to root cron (runs every minute) ----
echo "⏱️  Setting up cron job..."
CRON_JOB="* * * * * $SERVER_DIR/healthcheck.sh"
# Only add if not already present
(crontab -l 2>/dev/null | grep -v "healthcheck.sh"; echo "$CRON_JOB") | crontab -
echo "✅ Cron job installed."

# ---- 5. Reload + Restart ----
echo "🔄 Reloading systemd and restarting services..."
systemctl daemon-reload
systemctl restart junkyard
systemctl restart nginx

# ---- 6. Verify ----
sleep 5
echo ""
echo "==== SERVICE STATUS ===="
systemctl is-active postgresql-16 && echo "✅ postgresql-16: active" || echo "❌ postgresql-16: FAILED"
systemctl is-active junkyard      && echo "✅ junkyard: active"      || echo "❌ junkyard: FAILED"
systemctl is-active nginx         && echo "✅ nginx: active"         || echo "❌ nginx: FAILED"
echo ""
echo "==== SITE HTTP CHECK ===="
HTTP=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "https://junkyardsnearme.com/api/health/")
echo "HTTP Status: $HTTP"
[ "$HTTP" == "200" ] && echo "✅ SITE IS LIVE" || echo "⚠️  Site returned $HTTP"
echo ""
echo "✅ Setup complete. Monitor logs: tail -f /var/log/jynm_healthcheck.log"
