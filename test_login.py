import requests
import json

# Test data
test_patient = {
    "name": "Test Patient",
    "email": "test@example.com",
    "password": "testpassword123",
    "role": "patient",
    "dateOfBirth": "1990-01-01",
    "nationalId": "123456789",
    "phone": "555-0123"
}

# First, register a test user
try:
    register_response = requests.post(
        "http://localhost:8000/auth/register",
        json=test_patient
    )
    print(f"Register response: {register_response.status_code}")
    print(f"Register data: {register_response.text}")
except Exception as e:
    print(f"Register error: {e}")

# Test login
try:
    login_data = {
        "username": test_patient["email"],
        "password": test_patient["password"]
    }
    
    login_response = requests.post(
        "http://localhost:8000/auth/token",
        data=login_data,  # Note: OAuth2PasswordRequestForm expects form data, not JSON
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    print(f"Login response: {login_response.status_code}")
    print(f"Login data: {login_response.text}")
    
    if login_response.status_code == 200:
        token_data = login_response.json()
        print(f"Access token: {token_data.get('access_token')}")
        print(f"User info: {token_data.get('user')}")
except Exception as e:
    print(f"Login error: {e}") 