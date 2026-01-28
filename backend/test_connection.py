#!/usr/bin/env python
"""
Test script to verify frontend-backend portal connections
Run this after starting both frontend (port 3000) and backend (port 8000)
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_public_endpoints():
    """Test public site endpoints (no auth required)"""
    print("\n=== Testing Public Site Endpoints ===")
    
    tests = [
        ("GET", "/vendors/", "List vendors"),
        ("GET", "/hollander/makes/", "Get vehicle makes"),
        ("GET", "/common/states/", "Get states"),
        ("GET", "/health/", "Health check"),
    ]
    
    for method, endpoint, description in tests:
        try:
            url = f"{BASE_URL}{endpoint}"
            response = requests.get(url)
            status = "✅ PASS" if response.status_code == 200 else f"❌ FAIL ({response.status_code})"
            print(f"{status} - {description}: {url}")
        except Exception as e:
            print(f"❌ ERROR - {description}: {str(e)}")

def test_cors_headers():
    """Test CORS headers are properly set"""
    print("\n=== Testing CORS Configuration ===")
    
    headers = {
        'Origin': 'http://localhost:3000',
    }
    
    try:
        response = requests.get(f"{BASE_URL}/health/", headers=headers)
        cors_header = response.headers.get('Access-Control-Allow-Origin')
        credentials = response.headers.get('Access-Control-Allow-Credentials')
        
        if cors_header:
            print(f"✅ CORS Origin Header: {cors_header}")
        else:
            print("❌ CORS Origin Header: Missing")
            
        if credentials:
            print(f"✅ CORS Credentials: {credentials}")
        else:
            print("⚠️  CORS Credentials: Not set")
            
    except Exception as e:
        print(f"❌ CORS Test Error: {str(e)}")

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("\n=== Testing Auth Endpoints ===")
    
    # Test login endpoint exists
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", 
                                json={"email": "test@test.com", "password": "wrong"})
        # We expect 400/401, not 404
        if response.status_code in [400, 401]:
            print(f"✅ Login endpoint exists (returned {response.status_code})")
        elif response.status_code == 404:
            print(f"❌ Login endpoint not found")
        else:
            print(f"⚠️  Login endpoint returned {response.status_code}")
    except Exception as e:
        print(f"❌ Auth Test Error: {str(e)}")

if __name__ == "__main__":
    print("=" * 60)
    print("Frontend-Backend Connection Test")
    print("=" * 60)
    print(f"Backend URL: {BASE_URL}")
    print(f"Frontend URL: http://localhost:3000")
    print("=" * 60)
    
    test_public_endpoints()
    test_cors_headers()
    test_auth_endpoints()
    
    print("\n" + "=" * 60)
    print("Test Complete!")
    print("=" * 60)
