#!/bin/bash
# =============================================================
# JYNM Self-Healing Health Monitor
# Install: /home/junkyard/server/healthcheck.sh
# Cron (as root): * * * * * /home/junkyard/server/healthcheck.sh
# =============================================================

LOG_FILE="/var/log/jynm_healthcheck.log"
SITE_URL="https://junkyardsnearme.com"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

log() { echo "[$DATE] $1" >> "$LOG_FILE"; }

restart_service() {
    log "🔴 $1 is DOWN — restarting..."
    systemctl restart "$1"
    sleep 5
    if systemctl is-active --quiet "$1"; then
        log "✅ $1 recovered."
    else
        log "❌ CRITICAL: $1 failed to restart!"
    fi
}

# 1. Check PostgreSQL first (DB must be up before app)
if ! systemctl is-active --quiet postgresql-16; then
    restart_service postgresql-16
    sleep 10   # give DB time before app tries to connect
fi

# 2. Check Gunicorn
if ! systemctl is-active --quiet junkyard; then
    restart_service junkyard
    sleep 5
fi

# 3. Check Nginx
if ! systemctl is-active --quiet nginx; then
    restart_service nginx
fi

# 4. Live HTTP health check on the actual domain
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "$SITE_URL/api/health/")

if [ "$HTTP_STATUS" == "200" ]; then
    log "✅ Site OK (HTTP 200)"
else
    log "🔴 Site returned HTTP $HTTP_STATUS — force restarting junkyard + nginx..."
    systemctl restart junkyard
    sleep 6
    systemctl restart nginx
    sleep 3
    HTTP2=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "$SITE_URL/api/health/")
    log "🔄 After restart: HTTP $HTTP2"
fi

# 5. Keep log file small (max 500 lines)
LINE_COUNT=$(wc -l < "$LOG_FILE" 2>/dev/null || echo 0)
if [ "$LINE_COUNT" -gt 500 ]; then
    tail -500 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi
