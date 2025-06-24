import requests
import json

# Configuration
API_BASE_URL = "http://localhost:8000"

def test_appointment_booking():
    """Test appointment booking with detailed debugging"""
    print("🔍 Testing appointment booking system...\n")
    
    # Step 1: Test the public endpoint first (without authentication)
    print("📋 Step 1: Testing public appointment booking (no auth required)")
    print("-" * 60)
    
    appointment_data = {
        "patient_id": 1,
        "doctor_id": 1, 
        "date": "2025-01-26",
        "time": "14:00",
        "duration": 30,
        "status": "scheduled",
        "reason": "Test public appointment booking",
        "notes": "Testing appointment booking functionality",
        "follow_up": False
    }
    
    print(f"📤 Sending data to /api/appointments/public:")
    print(json.dumps(appointment_data, indent=2))
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/appointments/public",
            json=appointment_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n📥 Response status: {response.status_code}")
        print(f"📥 Response headers: {dict(response.headers)}")
        print(f"📥 Response body:")
        
        try:
            response_json = response.json()
            print(json.dumps(response_json, indent=2))
        except:
            print(response.text)
            
        if response.status_code == 200:
            print("✅ Public appointment booking SUCCESSFUL!")
        else:
            print(f"❌ Public appointment booking FAILED with status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error during public appointment test: {e}")
    
    print("\n" + "="*80 + "\n")
    
    # Step 2: Test the main endpoint (with potential auth issues)
    print("📋 Step 2: Testing main appointment booking endpoint (/api/appointments/)")
    print("-" * 60)
    
    print(f"📤 Sending same data to /api/appointments/:")
    print(json.dumps(appointment_data, indent=2))
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/appointments/",
            json=appointment_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n📥 Response status: {response.status_code}")
        print(f"📥 Response headers: {dict(response.headers)}")
        print(f"📥 Response body:")
        
        try:
            response_json = response.json()
            print(json.dumps(response_json, indent=2))
        except:
            print(response.text)
            
        if response.status_code == 200:
            print("✅ Main appointment booking SUCCESSFUL!")
        elif response.status_code == 422:
            print("❌ Main appointment booking FAILED with 422 (Validation Error)")
            print("🔍 This suggests the data format doesn't match what the endpoint expects")
        else:
            print(f"❌ Main appointment booking FAILED with status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error during main appointment test: {e}")
    
    print("\n" + "="*80 + "\n")
    
    # Step 3: Check if patients/doctors exist
    print("📋 Step 3: Checking if patient and doctor exist")
    print("-" * 60)
    
    try:
        patients_response = requests.get(f"{API_BASE_URL}/patients/")
        print(f"Patients endpoint status: {patients_response.status_code}")
        if patients_response.status_code == 200:
            patients = patients_response.json()
            print(f"Found {len(patients)} patients")
            if patients:
                print(f"First patient: {patients[0]}")
        
        doctors_response = requests.get(f"{API_BASE_URL}/practitioners/")
        print(f"Practitioners endpoint status: {doctors_response.status_code}")
        if doctors_response.status_code == 200:
            doctors = doctors_response.json()
            print(f"Found {len(doctors)} practitioners/doctors")
            if doctors:
                print(f"First doctor: {doctors[0]}")
        
    except Exception as e:
        print(f"❌ Error checking users: {e}")

if __name__ == "__main__":
    test_appointment_booking() 