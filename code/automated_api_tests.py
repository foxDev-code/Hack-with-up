#!/usr/bin/env python3
"""
Metro मार्ग - Automated API Testing Script
Tests the complete booking flow via API calls
"""

import requests
import json
import time

# Configuration
BASE_URL = "https://436biumjtosk.space.minimax.io"
SUPABASE_URL = "https://vcvykiogaytrtrrjrzvk.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdnlraW9nYXl0cnRycmpyenZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDQxMTIsImV4cCI6MjA3NzQ4MDExMn0.1ZKHBGts5yTDA8A5GCThzOmyZcKl6oHI-BvfrV-2RoI"

# Test credentials
TEST_EMAIL = "demo@metromar.com"
TEST_PASSWORD = "Demo123456!"

def print_header(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def print_test(name, status, details=""):
    symbol = "✅" if status else "❌"
    print(f"{symbol} {name}")
    if details:
        print(f"   {details}")

# Test counters
tests_passed = 0
tests_failed = 0
total_tests = 0

print_header("Metro मार्ग - API Testing Suite")
print(f"Target: {BASE_URL}")
print(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")

# TEST 1: Authentication
print_header("TEST 1: User Authentication")
total_tests += 1

try:
    login_response = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        },
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
    )
    
    if login_response.status_code == 200:
        login_data = login_response.json()
        access_token = login_data.get('access_token')
        user_id = login_data.get('user', {}).get('id')
        
        print_test("Login API Call", True, f"Status: {login_response.status_code}")
        print_test("Access Token Received", True, f"Token length: {len(access_token)}")
        print_test("User ID Retrieved", True, f"User: {user_id}")
        tests_passed += 1
    else:
        print_test("Authentication", False, f"Status: {login_response.status_code}")
        tests_failed += 1
        print(f"Response: {login_response.text}")
except Exception as e:
    print_test("Authentication", False, str(e))
    tests_failed += 1
    access_token = None

# TEST 2: Fetch Stations
if access_token:
    print_header("TEST 2: Fetch Stations")
    total_tests += 1
    
    try:
        stations_response = requests.get(
            f"{SUPABASE_URL}/rest/v1/stations",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {access_token}"
            }
        )
        
        if stations_response.status_code == 200:
            stations = stations_response.json()
            print_test("Fetch Stations", True, f"Retrieved {len(stations)} stations")
            tests_passed += 1
            
            # Select test stations
            if len(stations) >= 2:
                from_station = stations[0]['id']
                to_station = stations[1]['id']
                print(f"   Test route: {stations[0]['name']} → {stations[1]['name']}")
            else:
                print_test("Station Selection", False, "Not enough stations")
                from_station = to_station = None
        else:
            print_test("Fetch Stations", False, f"Status: {stations_response.status_code}")
            tests_failed += 1
            from_station = to_station = None
    except Exception as e:
        print_test("Fetch Stations", False, str(e))
        tests_failed += 1
        from_station = to_station = None

# TEST 3: Payment Intent Creation
if access_token and from_station and to_station:
    print_header("TEST 3: Payment Intent Creation")
    total_tests += 1
    
    try:
        payment_data = {
            "amount": 60,  # 2 adults = ₹60
            "currency": "inr",
            "fromStationId": from_station,
            "toStationId": to_station,
            "passengers": {
                "adult": 2,
                "senior": 0,
                "child": 0
            },
            "paymentMethod": "upi"
        }
        
        payment_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/create-payment-intent",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json=payment_data
        )
        
        if payment_response.status_code == 200:
            payment_result = payment_response.json()
            client_secret = payment_result.get('data', {}).get('clientSecret')
            payment_intent_id = payment_result.get('data', {}).get('paymentIntentId')
            is_demo = payment_result.get('data', {}).get('isDemoMode', False)
            
            print_test("Payment Intent Created", True)
            print_test("Client Secret Received", bool(client_secret))
            print_test("Payment Intent ID", bool(payment_intent_id), f"ID: {payment_intent_id}")
            print_test("Demo Mode", is_demo, "Using demo payment (no Stripe keys)")
            tests_passed += 1
        else:
            print_test("Payment Intent Creation", False, f"Status: {payment_response.status_code}")
            print(f"Response: {payment_response.text}")
            tests_failed += 1
    except Exception as e:
        print_test("Payment Intent Creation", False, str(e))
        tests_failed += 1

# TEST 4: Error Handling
print_header("TEST 4: Error Handling Validation")

error_tests = [
    {
        "name": "Invalid Amount (Negative)",
        "data": {"amount": -10, "fromStationId": "test", "toStationId": "test2", "passengers": {"adult": 1}},
        "expected_error": "INVALID_AMOUNT"
    },
    {
        "name": "Same Station Route",
        "data": {"amount": 30, "fromStationId": "same", "toStationId": "same", "passengers": {"adult": 1}},
        "expected_error": "INVALID_ROUTE"
    },
    {
        "name": "No Passengers",
        "data": {"amount": 30, "fromStationId": "test", "toStationId": "test2", "passengers": {"adult": 0}},
        "expected_error": "NO_PASSENGERS"
    }
]

for error_test in error_tests:
    total_tests += 1
    try:
        error_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/create-payment-intent",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json=error_test["data"]
        )
        
        if error_response.status_code >= 400:
            error_data = error_response.json()
            error_code = error_data.get('error', {}).get('code', '')
            
            if error_test["expected_error"] in error_code:
                print_test(f"Error: {error_test['name']}", True, f"Code: {error_code}")
                tests_passed += 1
            else:
                print_test(f"Error: {error_test['name']}", False, f"Got: {error_code}")
                tests_failed += 1
        else:
            print_test(f"Error: {error_test['name']}", False, "Expected error but got success")
            tests_failed += 1
    except Exception as e:
        print_test(f"Error: {error_test['name']}", False, str(e))
        tests_failed += 1

# Final Summary
print_header("TEST SUMMARY")
print(f"\nTotal Tests: {total_tests}")
print(f"Passed:      {tests_passed} ✅")
print(f"Failed:      {tests_failed} ❌")
print(f"Success Rate: {(tests_passed/total_tests*100):.1f}%")

if tests_failed == 0:
    print("\n🎉 ALL TESTS PASSED! Platform is working correctly.")
else:
    print(f"\n⚠️  {tests_failed} test(s) failed. Review errors above.")

print("\n" + "="*60)
print("Testing Complete")
print("="*60)
