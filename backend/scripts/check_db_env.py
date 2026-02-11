import os
from dotenv import load_dotenv
import psycopg2

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(base_dir, '.env')

print(f"Loading env from: {env_path}")
load_dotenv(env_path)

db_host = os.environ.get('DB_HOST')
db_user = os.environ.get('DB_USER')
db_pass = os.environ.get('DB_PASSWORD')

print(f"DB_HOST: {db_host}")
print(f"DB_USER: {db_user}")
print(f"DB_PASSWORD set? {'Yes' if db_pass else 'No'}")

try:
    conn = psycopg2.connect(
        host=db_host,
        database=os.environ.get('DB_NAME'),
        user=db_user,
        password=db_pass,
        port=5432,
        sslmode='require'
    )
    print("✅ Connection Successful!")
    conn.close()
except Exception as e:
    print(f"❌ Connection Failed: {e}")
