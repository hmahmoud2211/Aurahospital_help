import asyncio
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.auth import hash_password
from backend.models import Practitioner, Patient
from tortoise import Tortoise

async def create_all_test_users():
    # Initialize database connection with the same config as main.py
    await Tortoise.init(
        db_url='sqlite://backend/db.sqlite3',
        modules={'models': ['backend.models']}
    )
    
    try:
        print("🏥 Creating test users for Aura Hospital...")
        
        # 1. Create Nurse (already exists but verify)
        existing_nurse = await Practitioner.filter(email='nurse@test.com').first()
        if not existing_nurse:
            nurse = await Practitioner.create(
                name=[{"use": "official", "text": "Sarah Johnson"}],
                email='nurse@test.com',
                identifier=[{"system": "license", "value": "N123456"}],
                telecom=[{"system": "phone", "value": "+1234567890"}],
                specialty=["Nursing"],
                password_hash=hash_password('password123')
            )
            print('✅ Created nurse: Sarah Johnson (N123456)')
        else:
            print('✅ Nurse already exists: Sarah Johnson (N123456)')
        
        # 2. Create Pharmacist
        existing_pharmacist = await Practitioner.filter(email='pharmacist@test.com').first()
        if not existing_pharmacist:
            pharmacist = await Practitioner.create(
                name=[{"use": "official", "text": "Dr. Michael Smith"}],
                email='pharmacist@test.com',
                identifier=[{"system": "license", "value": "F789123"}],
                telecom=[{"system": "phone", "value": "+1234567891"}],
                specialty=["Pharmacy"],
                password_hash=hash_password('password123')
            )
            print('✅ Created pharmacist: Dr. Michael Smith (F789123)')
        else:
            print('✅ Pharmacist already exists: Dr. Michael Smith')
        
        # 3. Create Laborist
        existing_laborist = await Practitioner.filter(email='lab@test.com').first()
        if not existing_laborist:
            laborist = await Practitioner.create(
                name=[{"use": "official", "text": "Dr. Emily Davis"}],
                email='lab@test.com',
                identifier=[{"system": "license", "value": "L456789"}],
                telecom=[{"system": "phone", "value": "+1234567892"}],
                specialty=["Laboratory"],
                password_hash=hash_password('password123')
            )
            print('✅ Created laborist: Dr. Emily Davis (L456789)')
        else:
            print('✅ Laborist already exists: Dr. Emily Davis')
        
        # 4. Create Patient
        existing_patient = await Patient.filter(email='patient@test.com').first()
        if not existing_patient:
            from datetime import date
            patient = await Patient.create(
                name=[{"use": "official", "text": "John Patient"}],
                email='patient@test.com',
                identifier=[{"system": "national_id", "value": "PAT123456"}],
                telecom=[{"system": "phone", "value": "+1234567893"}],
                birth_date=date(1990, 5, 15),
                gender="male",
                password_hash=hash_password('password123')
            )
            print('✅ Created patient: John Patient (PAT123456)')
        else:
            print('✅ Patient already exists: John Patient')
        
        # 5. Create Regular Practitioner
        existing_doctor = await Practitioner.filter(email='doctor@test.com').first()
        if not existing_doctor:
            doctor = await Practitioner.create(
                name=[{"use": "official", "text": "Dr. Anna Wilson"}],
                email='doctor@test.com',
                identifier=[{"system": "license", "value": "D987654"}],
                telecom=[{"system": "phone", "value": "+1234567894"}],
                specialty=["Internal Medicine"],
                password_hash=hash_password('password123')
            )
            print('✅ Created doctor: Dr. Anna Wilson (D987654)')
        else:
            print('✅ Doctor already exists: Dr. Anna Wilson')
        
        print("\n🎉 All test users created successfully!")
        print("\n📋 TEST CREDENTIALS:")
        print("="*50)
        print("👩‍⚕️ NURSE")
        print("   Email: nurse@test.com")
        print("   Password: password123")
        print("   License: N123456")
        print()
        print("💊 PHARMACIST")
        print("   Email: pharmacist@test.com")
        print("   Password: password123")
        print("   License: F789123")
        print()
        print("🔬 LABORIST")
        print("   Email: lab@test.com")
        print("   Password: password123")
        print("   License: L456789")
        print()
        print("🏥 DOCTOR")
        print("   Email: doctor@test.com")
        print("   Password: password123")
        print("   License: D987654")
        print()
        print("👤 PATIENT")
        print("   Email: patient@test.com")
        print("   Password: password123")
        print("   ID: PAT123456")
        print("="*50)
        
    except Exception as e:
        print(f'❌ Error creating test users: {e}')
    finally:
        await Tortoise.close_connections()

if __name__ == '__main__':
    asyncio.run(create_all_test_users()) 