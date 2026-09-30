# =============================================================
# Gunicorn Production Configuration — JYNM / junkyardsnearme.com
# Location on server: /home/junkyard/backend/gunicorn.conf.py
# =============================================================

import multiprocessing

# --- Workers ---
# Rule: (2 x CPU cores) + 1
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
threads = 2

# --- Timeouts ---
# 120s = prevent workers hanging on slow DB queries
timeout = 120
keepalive = 5
graceful_timeout = 30

# --- Worker Recycling (CRITICAL — this prevents memory leaks crashing workers) ---
# Each worker restarts after handling 1000 requests, preventing slow memory leaks
max_requests = 1000
max_requests_jitter = 100   # random offset so workers don't all restart at once

# --- Binding ---
bind = "unix:/run/junkyard.sock"   # use socket, faster than TCP
# bind = "127.0.0.1:8000"         # fallback if socket doesn't work

# --- Logging ---
accesslog = "/var/log/jynm_gunicorn_access.log"
errorlog  = "/var/log/jynm_gunicorn_error.log"
loglevel  = "warning"   # only log warnings/errors in production
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s %(D)s'

# --- Process naming ---
proc_name = "junkyard_gunicorn"

# --- Preload (faster restarts, but careful with DB connections) ---
preload_app = False
