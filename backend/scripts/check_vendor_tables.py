import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

def check(table):
    try:
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
        cur = conn.cursor()
        cur.execute(f'SELECT count(*) FROM "{table}"')
        count = cur.fetchone()[0]
        print(f"{table:<30}: {count:,}")
        conn.close()
    except Exception as e:
        print(f"{table:<30}: ERROR - {e}")

print("Checking vendor tables...")
check('hollander_vendor')
check('hollander_profile_visit')
