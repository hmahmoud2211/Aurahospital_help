import requests
import json

# Test if server is running
try:
    response = requests.get("http://localhost:8000/")
    print(f"Server status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Server connection error: {e}")
    exit(1)

# Test registration
test_user = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "patient",
    "dateOfBirth": "1990-01-01",
    "phone": "123456789"
}

try:
    reg_response = requests.post(
        "http://localhost:8000/auth/register",
        json=test_user
    )
    print(f"\nRegistration status: {reg_response.status_code}")
    print(f"Registration response: {reg_response.text}")
except Exception as e:
    print(f"Registration error: {e}")

# Test login
try:
    login_data = {
        "username": test_user["email"],
        "password": test_user["password"]
    }
    
    login_response = requests.post(
        "http://localhost:8000/auth/token",
        data=login_data
    )
    print(f"\nLogin status: {login_response.status_code}")
    print(f"Login response: {login_response.text}")
    
    if login_response.status_code == 200:
        token_data = login_response.json()
        print(f"Login successful!")
        print(f"User: {token_data.get('user')}")
    else:
        print("Login failed!")
        
except Exception as e:
    print(f"Login error: {e}") 