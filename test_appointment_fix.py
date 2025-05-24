import requests
import json

# Configuration
API_BASE_URL = "http://localhost:8000"

def test_login_and_appointment():
    """Test login and authenticated appointment booking"""
    print("🔐 Testing authenticated appointment booking...")
    
    # Step 1: Login to get token
    login_data = {
        'username': 'nurse@test.com',
        'password': 'password123'
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/token",
            data=login_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        if response.status_code == 200:
            auth_data = response.json()
            access_token = auth_data['access_token']
            user_id = auth_data['user']['id']
            print(f"✅ Login successful! User ID: {user_id}")
            
            # Step 2: Book appointment with authentication
            appointment_data = {
                "patient_id": user_id,
                "doctor_id": 1,
                "date": "2025-05-26",
                "time": "14:30",
                "duration": 30,
                "status": "scheduled",
                "reason": "Test authenticated appointment",
                "notes": "This is a test appointment with authentication",
                "follow_up": False
            }
            
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {access_token}'
            }
            
            response = requests.post(
                f"{API_BASE_URL}/api/appointments/",
                json=appointment_data,
                headers=headers
            )
            
            if response.status_code == 200:
                appointment = response.json()
                print("✅ Authenticated appointment booking successful!")
                print(f"   Appointment ID: {appointment.get('id')}")
                print(f"   Patient: {appointment.get('patientDetails', {}).get('name', 'Unknown')}")
                print(f"   Doctor: {appointment.get('doctorDetails', {}).get('name', 'Unknown')}")
                return True
            else:
                print(f"❌ Authenticated appointment booking failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during authenticated test: {e}")
        return False

def test_public_appointment():
    """Test public appointment endpoint (no authentication required)"""
    print("\n🌐 Testing public appointment booking...")
    
    appointment_data = {
        "patient_id": 1,  # Assuming patient with ID 1 exists
        "doctor_id": 1,   # Assuming doctor with ID 1 exists
        "date": "2025-05-27",
        "time": "10:00",
        "duration": 30,
        "status": "scheduled",
        "reason": "Test public appointment",
        "notes": "This is a test appointment without authentication",
        "follow_up": False
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/appointments/public",
            json=appointment_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            appointment = response.json()
            print("✅ Public appointment booking successful!")
            print(f"   Appointment ID: {appointment.get('id')}")
            print(f"   Patient: {appointment.get('patientDetails', {}).get('name', 'Unknown')}")
            print(f"   Doctor: {appointment.get('doctorDetails', {}).get('name', 'Unknown')}")
            return True
        else:
            print(f"❌ Public appointment booking failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during public test: {e}")
        return False

def test_appointment_endpoints():
    """Test both appointment booking methods"""
    print("🏥 Testing Appointment Booking Fixes")
    print("=" * 50)
    
    # Test authenticated booking
    auth_success = test_login_and_appointment()
    
    # Test public booking
    public_success = test_public_appointment()
    
    print("\n📊 Test Results:")
    print("=" * 50)
    print(f"✅ Authenticated Booking: {'PASSED' if auth_success else 'FAILED'}")
    print(f"✅ Public Booking: {'PASSED' if public_success else 'FAILED'}")
    
    if auth_success and public_success:
        print("\n🎉 All tests passed! The 401 error has been fixed!")
        print("\n📝 Solutions implemented:")
        print("   1. ✅ Added authentication token to frontend requests")
        print("   2. ✅ Created public endpoint for testing without auth")
        print("   3. ✅ Updated appointment store with proper auth headers")
    else:
        print("\n⚠️  Some tests failed. Check the error messages above.")
    
    return auth_success and public_success

if __name__ == "__main__":
    test_appointment_endpoints() 