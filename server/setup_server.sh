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

# ---- 2. Update systemd service to use gunicorn.conf.py ----
echo "🔧 Updating junkyard.service..."
# Read current ExecStart and update it
CURRENT_EXEC=$(grep "ExecStart" "$SERVICE_FILE" | head -1)
echo "Current: $CURRENT_EXEC"

# Write new systemd service
cat > "$SERVICE_FILE" << 'SYSTEMD_EOF'
[Unit]
Description=Junkyard Gunicorn
After=network.target postgresql-16.service
Requires=postgresql-16.service

[Service]
User=junkyard
Group=junkyard
WorkingDirectory=/home/junkyard/backend
EnvironmentFile=/home/junkyard/backend/.env
ExecStart=/home/junkyard/backend/venv/bin/gunicorn \
    --config /home/junkyard/backend/gunicorn.conf.py \
    core.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SYSTEMD_EOF

echo "✅ Service file updated."

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
