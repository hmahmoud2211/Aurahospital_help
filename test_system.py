import asyncio
import requests
import json
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.auth import hash_password
from backend.models import Practitioner, Patient
from tortoise import Tortoise

# API Configuration
API_BASE_URL = 'http://127.0.0.1:8000'

class SystemTester:
    def __init__(self):
        self.results = []
        
    def log_test(self, test_name, status, message=""):
        result = f"{'✅' if status else '❌'} {test_name}: {message}"
        print(result)
        self.results.append(result)
        
    def test_api_connection(self):
        """Test if API server is running"""
        try:
            response = requests.get(f"{API_BASE_URL}/")
            if response.status_code == 200:
                self.log_test("API Connection", True, "Backend server is running")
                return True
            else:
                self.log_test("API Connection", False, f"Server returned status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Connection", False, f"Could not connect to server: {e}")
            return False
    
    def test_nurse_login(self):
        """Test nurse authentication"""
        try:
            data = {
                'username': 'nurse@test.com',
                'password': 'password123'
            }
            
            response = requests.post(
                f"{API_BASE_URL}/auth/token",
                data=data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('user', {}).get('role') == 'nurse':
                    self.log_test("Nurse Authentication", True, f"Login successful for {result['user']['name']}")
                    return result['access_token']
                else:
                    self.log_test("Nurse Authentication", False, f"Wrong role: {result.get('user', {}).get('role')}")
                    return None
            else:
                self.log_test("Nurse Authentication", False, f"Login failed: {response.text}")
                return None
        except Exception as e:
            self.log_test("Nurse Authentication", False, f"Error: {e}")
            return None
    
    def test_patient_login(self):
        """Test patient authentication (if exists)"""
        try:
            data = {
                'username': 'patient@test.com',
                'password': 'password123'
            }
            
            response = requests.post(
                f"{API_BASE_URL}/auth/token",
                data=data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('user', {}).get('role') == 'patient':
                    self.log_test("Patient Authentication", True, f"Login successful for {result['user']['name']}")
                    return result['access_token']
                else:
                    self.log_test("Patient Authentication", False, f"Wrong role: {result.get('user', {}).get('role')}")
                    return None
            else:
                self.log_test("Patient Authentication", False, f"Login failed: {response.text}")
                return None
        except Exception as e:
            self.log_test("Patient Authentication", False, f"Error: {e}")
            return None
    
    def test_pharmacist_login(self):
        """Test pharmacist authentication (if exists)"""
        try:
            data = {
                'username': 'pharmacist@test.com',
                'password': 'password123'
            }
            
            response = requests.post(
                f"{API_BASE_URL}/auth/token",
                data=data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('user', {}).get('role') == 'pharmacist':
                    self.log_test("Pharmacist Authentication", True, f"Login successful for {result['user']['name']}")
                    return result['access_token']
                else:
                    self.log_test("Pharmacist Authentication", False, f"Wrong role: {result.get('user', {}).get('role')}")
                    return None
            else:
                self.log_test("Pharmacist Authentication", False, "No pharmacist test user found (expected)")
                return None
        except Exception as e:
            self.log_test("Pharmacist Authentication", False, f"No pharmacist test user: {e}")
            return None

    def test_laborist_login(self):
        """Test laborist authentication (if exists)"""
        try:
            data = {
                'username': 'lab@test.com',
                'password': 'password123'
            }
            
            response = requests.post(
                f"{API_BASE_URL}/auth/token",
                data=data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('user', {}).get('role') == 'laborist':
                    self.log_test("Laborist Authentication", True, f"Login successful for {result['user']['name']}")
                    return result['access_token']
                else:
                    self.log_test("Laborist Authentication", False, f"Wrong role: {result.get('user', {}).get('role')}")
                    return None
            else:
                self.log_test("Laborist Authentication", False, "No laborist test user found (expected)")
                return None
        except Exception as e:
            self.log_test("Laborist Authentication", False, f"No laborist test user: {e}")
            return None

    async def test_database_records(self):
        """Test database records"""
        try:
            # Initialize database connection
            await Tortoise.init(
                db_url='sqlite://backend/db.sqlite3',
                modules={'models': ['backend.models']}
            )
            
            # Check practitioners
            practitioners = await Practitioner.all()
            nurse_count = 0
            pharmacist_count = 0
            laborist_count = 0
            
            for practitioner in practitioners:
                if practitioner.specialty and "Nursing" in practitioner.specialty:
                    nurse_count += 1
                elif practitioner.specialty and "Pharmacy" in practitioner.specialty:
                    pharmacist_count += 1
                elif practitioner.specialty and "Laboratory" in practitioner.specialty:
                    laborist_count += 1
            
            self.log_test("Database - Nurses", nurse_count > 0, f"Found {nurse_count} nurse(s)")
            self.log_test("Database - Pharmacists", True, f"Found {pharmacist_count} pharmacist(s)")
            self.log_test("Database - Laborists", True, f"Found {laborist_count} laborist(s)")
            
            # Check patients
            patients = await Patient.all()
            self.log_test("Database - Patients", True, f"Found {len(patients)} patient(s)")
            
            await Tortoise.close_connections()
            
        except Exception as e:
            self.log_test("Database Test", False, f"Error: {e}")

    def test_invalid_login(self):
        """Test invalid login credentials"""
        try:
            data = {
                'username': 'invalid@test.com',
                'password': 'wrongpassword'
            }
            
            response = requests.post(
                f"{API_BASE_URL}/auth/token",
                data=data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 401:
                self.log_test("Invalid Login Protection", True, "Invalid credentials properly rejected")
            else:
                self.log_test("Invalid Login Protection", False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test("Invalid Login Protection", False, f"Error: {e}")

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("🏥 AURA HOSPITAL SYSTEM TEST SUMMARY")
        print("="*60)
        
        passed = len([r for r in self.results if r.startswith("✅")])
        failed = len([r for r in self.results if r.startswith("❌")])
        
        print(f"✅ Tests Passed: {passed}")
        print(f"❌ Tests Failed: {failed}")
        print(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            print("\n🎉 ALL TESTS PASSED! System is ready for use.")
            print("\n📋 Test Credentials:")
            print("   Email: nurse@test.com")
            print("   Password: password123")
            print("   Role: Nurse")
        else:
            print(f"\n⚠️  {failed} test(s) failed. Please check the issues above.")

async def main():
    print("🏥 AURA HOSPITAL SYSTEM TESTING")
    print("="*60)
    
    tester = SystemTester()
    
    # Test API connection first
    if not tester.test_api_connection():
        print("\n❌ Backend server is not running!")
        print("Please start the backend with: python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000")
        return
    
    # Test database records
    await tester.test_database_records()
    
    # Test authentication for all roles
    tester.test_nurse_login()
    tester.test_patient_login()
    tester.test_pharmacist_login()
    tester.test_laborist_login()
    
    # Test security
    tester.test_invalid_login()
    
    # Print summary
    tester.print_summary()

if __name__ == '__main__':
    asyncio.run(main()) 