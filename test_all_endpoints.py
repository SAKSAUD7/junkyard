"""
Comprehensive API Endpoint Verification Script
Tests all backend endpoints to ensure frontend can connect properly
"""
import requests
import json
import sys
import io

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Backend URL
BACKEND_URL = "https://junkyardnearme-g6ghdqf5g8gvd2eq.centralindia-01.azurewebsites.net"

# Test endpoints
ENDPOINTS = {
    "Health Check": "/api/health/",
    "Makes List": "/api/common/makes/",
    "Models List": "/api/hollander/models/?make_id=1",
    "Parts List": "/api/hollander/parts/",
    "Years List": "/api/hollander/years/?make_id=1&model_id=1",
    "Zipcode Lookup": "/api/hollander/zipcode/lookup/?zip=10001",
    "States List": "/api/common/states/",
}

def test_endpoint(name, path):
    """Test a single endpoint"""
    url = f"{BACKEND_URL}{path}"
    try:
        response = requests.get(url, timeout=10)
        status = response.status_code
        
        if status == 200:
            try:
                data = response.json()
                # Get count or length
                if isinstance(data, dict):
                    count = data.get('count', len(data.get('results', [])))
                elif isinstance(data, list):
                    count = len(data)
                else:
                    count = "N/A"
                
                print(f"[OK] {name}")
                print(f"     Status: 200")
                print(f"     Count: {count}")
                return True
            except:
                print(f"[OK] {name}")
                print(f"     Status: 200")
                print(f"     Response: {response.text[:100]}")
                return True
        else:
            print(f"[FAIL] {name}")
            print(f"       Status: {status}")
            return False
            
    except Exception as e:
        print(f"[ERROR] {name}")
        print(f"        {str(e)}")
        return False

def main():
    print("="*60)
    print("Backend API Endpoint Verification")
    print("="*60)
    print(f"Backend URL: {BACKEND_URL}\n")
    
    results = {}
    for name, path in ENDPOINTS.items():
        results[name] = test_endpoint(name, path)
        print()
    
    # Summary
    print("="*60)
    print("Summary")
    print("="*60)
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    print(f"Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n[SUCCESS] All endpoints working!")
    else:
        print("\n[WARNING] Some endpoints failed")
        print("\nFailed endpoints:")
        for name, success in results.items():
            if not success:
                print(f"  - {name}")

if __name__ == "__main__":
    main()
