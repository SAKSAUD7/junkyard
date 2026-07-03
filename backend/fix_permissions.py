import os
import sys
import django
from django.db import connection

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def check_permissions():
    with connection.cursor() as cursor:
        # Get current user
        cursor.execute("SELECT current_user;")
        current_user = cursor.fetchone()[0]
        
        # Get owner of leads_lead
        cursor.execute("""
            SELECT tableowner 
            FROM pg_tables 
            WHERE tablename = 'leads_lead';
        """)
        row = cursor.fetchone()
        owner = row[0] if row else "unknown"
        
        # Get DB name
        cursor.execute("SELECT current_database();")
        db_name = cursor.fetchone()[0]

        print("--------------------------------------------------")
        print(f"Database Name: {db_name}")
        print(f"Current App User: {current_user}")
        print(f"Table Owner: {owner}")
        print("--------------------------------------------------")
        
        if current_user != owner:
            print("\n🚨 PERMISSION MISMATCH DETECTED 🚨")
            print(f"The app is connecting as '{current_user}', but the tables are owned by '{owner}'.")
            print(f"This prevents Django from updating the database schema.")
            print("\n✅ TO FIX THIS, RUN THIS COMMAND IN YOUR HOSTINGER TERMINAL (AS ROOT):")
            print(f"""
sudo -u postgres psql -d {db_name} -c "REASSIGN OWNED BY {owner} TO {current_user};"
""")
        else:
            print("Ownership looks correct, trying to migrate manually...")

if __name__ == '__main__':
    check_permissions()
