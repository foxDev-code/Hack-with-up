import requests
import json
import time

SUPABASE_URL = "https://vcvykiogaytrtrrjrzvk.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdnlraW9nYXl0cnRycmpyenZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDQxMTIsImV4cCI6MjA3NzQ4MDExMn0.1ZKHBGts5yTDA8A5GCThzOmyZcKl6oHI-BvfrV-2RoI"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdnlraW9nYXl0cnRycmpyenZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTkwNDExMiwiZXhwIjoyMDc3NDgwMTEyfQ.wNrj8IJEux338__0HcVwVpzD9uN86hIK_jQ3xJCMJSk"

print("="*60)
print("METRO मार्ग - AUTHENTICATION SYSTEM DIAGNOSTIC")
print("="*60)

# Test credentials
test_email = f"metroadmin{int(time.time())}@test.com"
test_password = "MetroTest123!"
test_name = "Metro Test User"

print(f"\n1. Creating test account: {test_email}")
print("-" * 60)

# Create user with email auto-confirmation using service role key
signup_response = requests.post(
    f"{SUPABASE_URL}/auth/v1/signup",
    headers={
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "email": test_email,
        "password": test_password,
        "email_confirm": True,
        "user_metadata": {
            "full_name": test_name
        }
    }
)

print(f"Signup Status: {signup_response.status_code}")
if signup_response.status_code in [200, 201]:
    signup_data = signup_response.json()
    print(f"✅ User created successfully!")
    print(f"User ID: {signup_data.get('user', {}).get('id')}")
    print(f"Email: {signup_data.get('user', {}).get('email')}")
    print(f"Email Confirmed: {signup_data.get('user', {}).get('email_confirmed_at', 'Not confirmed')}")
    
    user_id = signup_data.get('user', {}).get('id')
    
    if user_id:
        print(f"\n2. Creating user profile...")
        profile_response = requests.post(
            f"{SUPABASE_URL}/rest/v1/profiles",
            headers={
                "apikey": SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            json={
                "id": user_id,
                "full_name": test_name,
                "metro_card_number": f"MC{int(time.time())}",
                "metro_card_balance": 100
            }
        )
        if profile_response.status_code in [200, 201]:
            print("✅ Profile created successfully!")
        else:
            print(f"⚠️ Profile creation: {profile_response.status_code} - {profile_response.text[:200]}")
else:
    print(f"❌ Signup failed: {signup_response.status_code}")
    print(f"Response: {signup_response.text}")

time.sleep(2)

print(f"\n3. Testing LOGIN with created account...")
print("-" * 60)

login_response = requests.post(
    f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
    headers={
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
    },
    json={
        "email": test_email,
        "password": test_password
    }
)

print(f"Login Status: {login_response.status_code}")
if login_response.status_code == 200:
    login_data = login_response.json()
    print(f"✅ LOGIN SUCCESSFUL!")
    print(f"Session Active: Yes")
else:
    print(f"❌ LOGIN FAILED!")
    print(f"Response: {login_response.text}")

print("\n" + "="*60)
print("TEST ACCOUNT CREDENTIALS (AUTO-CONFIRMED)")
print("="*60)
print(f"Email:    {test_email}")
print(f"Password: {test_password}")
print("="*60)
print("\nLogin at: https://mwty8349ehr8.space.minimax.io/login")
print("="*60)
