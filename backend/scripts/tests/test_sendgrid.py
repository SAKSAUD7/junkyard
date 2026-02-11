
import os
import smtplib
from dotenv import load_dotenv

# Load env directly to be sure
load_dotenv('.env')

api_key = os.environ.get('SENDGRID_API_KEY')
print(f"Loaded API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("ERROR: No API Key found in environment!")
    exit(1)

def test_raw_smtp(port):
    print(f"\n--- Testing Raw SMTP to smtp.sendgrid.net:{port} ---")
    try:
        if port == 465:
            server = smtplib.SMTP_SSL('smtp.sendgrid.net', port)
        else:
            server = smtplib.SMTP('smtp.sendgrid.net', port)
        
        server.set_debuglevel(1)
        
        print("EHLO...")
        server.ehlo()
        
        if port != 465:
            print("STARTTLS...")
            server.starttls()
            print("EHLO (again)...")
            server.ehlo()
            
        print("Login...")
        server.login('apikey', api_key)
        
        print("Sending...")
        from_addr = 'saqeeb.khan20011@gmail.com'
        to_addr = 'saqeeb.khan20011@gmail.com'
        msg = f"Subject: Raw Test {port}\n\nTest from raw script port {port}"
        
        server.sendmail(from_addr, to_addr, msg)
        print("SUCCESS!")
        server.quit()
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False

print("Starting connectivity tests...")
# Try 587 first
if not test_raw_smtp(587):
    # Try 2525
    test_raw_smtp(2525)

