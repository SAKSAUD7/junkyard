import psycopg2
import sqlite3

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

def check_azure():
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    tables = ['hollander_hollanderindex', 'hollander_profilevisit', 'hollander_zipcode']
    print("\n🔵 AZURE Counts:")
    for t in tables:
        try:
            cur.execute(f"SELECT count(*) FROM hollander.{t}")
            print(f"{t}: {cur.fetchone()[0]:,}")
        except:
            print(f"{t}: ERROR")
    conn.close()

def check_local():
    conn = sqlite3.connect('db.sqlite3')
    cur = conn.cursor()
    tables = ['hollander_hollanderindex', 'hollander_profilevisit', 'hollander_zipcode']
    print("\n🟢 LOCAL Counts:")
    for t in tables:
        try:
            cur.execute(f"SELECT count(*) FROM {t}")
            print(f"{t}: {cur.fetchone()[0]:,}")
        except:
             print(f"{t}: ERROR")
    conn.close()

check_azure()
check_local()
