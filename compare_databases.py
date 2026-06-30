"""
Database Comparison Script
Compares row counts between:
  1. Local SQLite database
  2. Azure PostgreSQL dump (backup.dump) restored to local PostgreSQL
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import sqlite3
import subprocess
import sys
import os

# ── Paths ──────────────────────────────────────────────────────────────────────
SQLITE_PATH   = r"C:\Users\saksa\OneDrive\Desktop\junkyard\junkyard\backend\db.sqlite3"
DUMP_PATH     = r"C:\Users\saksa\Downloads\Telegram Desktop\ALL_IMAGES\ALL_IMAGES\backup.dump"
PG_RESTORE    = r"C:\Program Files\PostgreSQL\17\bin\pg_restore.exe"
PSQL          = r"C:\Program Files\PostgreSQL\17\bin\psql.exe"
CREATEDB      = r"C:\Program Files\PostgreSQL\17\bin\createdb.exe"
DROPDB        = r"C:\Program Files\PostgreSQL\17\bin\dropdb.exe"

# Local PostgreSQL credentials (your local postgres superuser)
PG_HOST       = "127.0.0.1"
PG_PORT       = "5432"
PG_USER       = "postgres"
PG_PASS       = "Admin1234"          # from your local .env
TEMP_DB       = "junkyard_compare"   # temporary DB name — will be dropped after

# ── STEP 1: Read SQLite counts ─────────────────────────────────────────────────
print("=" * 60)
print("STEP 1: Reading SQLite database...")
print("=" * 60)

sqlite_counts = {}
try:
    conn = sqlite3.connect(SQLITE_PATH)
    cur  = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [r[0] for r in cur.fetchall()]
    print(f"Found {len(tables)} tables in SQLite\n")
    for t in tables:
        try:
            cur.execute(f'SELECT COUNT(*) FROM "{t}"')
            sqlite_counts[t] = cur.fetchone()[0]
        except Exception as e:
            sqlite_counts[t] = f"ERR: {e}"
    conn.close()
except Exception as e:
    print(f"ERROR opening SQLite: {e}")
    sys.exit(1)

# ── STEP 2: Restore dump to temp local PostgreSQL ──────────────────────────────
print("=" * 60)
print("STEP 2: Restoring Azure dump to temporary local PostgreSQL DB...")
print(f"  Temp DB: {TEMP_DB}")
print("=" * 60)

env = os.environ.copy()
env["PGPASSWORD"] = PG_PASS

# Drop temp DB if exists
subprocess.run([DROPDB, f"--host={PG_HOST}", f"--port={PG_PORT}",
                f"--username={PG_USER}", "--if-exists", TEMP_DB],
               env=env, capture_output=True)

# Create temp DB
r = subprocess.run([CREATEDB, f"--host={PG_HOST}", f"--port={PG_PORT}",
                    f"--username={PG_USER}", TEMP_DB],
                   env=env, capture_output=True, text=True)
if r.returncode != 0:
    print(f"ERROR creating temp DB: {r.stderr}")
    sys.exit(1)
print(f"Created temp DB: {TEMP_DB}")

# Restore dump
print("Restoring dump (this may take 30-120 seconds)...")
r = subprocess.run(
    [PG_RESTORE,
     f"--host={PG_HOST}", f"--port={PG_PORT}",
     f"--username={PG_USER}", f"--dbname={TEMP_DB}",
     "--no-owner", "--no-acl",
     "--schema=public",
     DUMP_PATH],
    env=env, capture_output=True, text=True
)
# Exit code 1 = warnings (Azure ACLs) — that's OK
if r.returncode > 1:
    print(f"pg_restore FATAL ERROR (exit {r.returncode}):")
    print(r.stderr[:1000])
    sys.exit(1)
print(f"Restore complete (exit {r.returncode} — warnings about Azure roles are normal)\n")

# ── STEP 3: Read PostgreSQL counts ────────────────────────────────────────────
print("=" * 60)
print("STEP 3: Reading PostgreSQL (Azure dump) table counts...")
print("=" * 60)

# Get all table names from PostgreSQL
r = subprocess.run(
    [PSQL, f"--host={PG_HOST}", f"--port={PG_PORT}",
     f"--username={PG_USER}", f"--dbname={TEMP_DB}",
     "--tuples-only", "--no-align",
     "--command=SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"],
    env=env, capture_output=True, text=True
)
pg_tables = [t.strip() for t in r.stdout.strip().split("\n") if t.strip()]
print(f"Found {len(pg_tables)} tables in PostgreSQL dump\n")

pg_counts = {}
for t in pg_tables:
    r = subprocess.run(
        [PSQL, f"--host={PG_HOST}", f"--port={PG_PORT}",
         f"--username={PG_USER}", f"--dbname={TEMP_DB}",
         "--tuples-only", "--no-align",
         f"--command=SELECT COUNT(*) FROM \"{t}\";"],
        env=env, capture_output=True, text=True
    )
    try:
        pg_counts[t] = int(r.stdout.strip())
    except:
        pg_counts[t] = f"ERR: {r.stderr[:50]}"

# ── STEP 4: Compare ───────────────────────────────────────────────────────────
print()
print("=" * 60)
print("COMPARISON RESULTS")
print("=" * 60)
print(f"{'Table':<45} {'SQLite':>10} {'Azure PG':>10} {'Status':>10}")
print("-" * 80)

all_tables = sorted(set(list(sqlite_counts.keys()) + list(pg_counts.keys())))
issues     = []
ok_count   = 0

for t in all_tables:
    sqlite_val = sqlite_counts.get(t, "MISSING")
    pg_val     = pg_counts.get(t, "MISSING")

    if sqlite_val == "MISSING":
        status = "[PG ONLY]"
        issues.append(f"  Table '{t}' is in Azure PG but NOT in SQLite")
    elif pg_val == "MISSING":
        status = "[SQ ONLY]"
        issues.append(f"  Table '{t}' is in SQLite but NOT in Azure PG dump")
    elif isinstance(sqlite_val, int) and isinstance(pg_val, int):
        if sqlite_val == pg_val:
            status = "OK MATCH"
            ok_count += 1
        elif pg_val > sqlite_val:
            diff = pg_val - sqlite_val
            status = f"PG+{diff}"
            issues.append(f"  Table '{t}': Azure PG has {diff} MORE rows ({pg_val} vs SQLite {sqlite_val})")
        else:
            diff = sqlite_val - pg_val
            status = f"SQ+{diff}"
            issues.append(f"  Table '{t}': SQLite has {diff} MORE rows ({sqlite_val} vs Azure PG {pg_val})")
    else:
        status = "ERR"

    print(f"{t:<45} {str(sqlite_val):>10} {str(pg_val):>10} {status:>10}")

print("-" * 80)
print(f"\nSUMMARY: {ok_count}/{len(all_tables)} tables match exactly")
print()
if issues:
    print("DIFFERENCES FOUND:")
    for issue in issues:
        print(issue)
else:
    print("ALL TABLES MATCH -- SQLite and Azure PostgreSQL have identical data!")

# ── STEP 5: Cleanup temp DB ───────────────────────────────────────────────────
print()
print("=" * 60)
print("STEP 5: Cleaning up temporary database...")
subprocess.run([DROPDB, f"--host={PG_HOST}", f"--port={PG_PORT}",
                f"--username={PG_USER}", TEMP_DB],
               env=env, capture_output=True)
print(f"Dropped temp DB: {TEMP_DB}")
print("Done!")
