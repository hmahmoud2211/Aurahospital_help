import asyncio
import hashlib
from datetime import date, datetime, timedelta
from backend.models import Practitioner, Patient, LabTest, Scan, LaboristRecord
from tortoise import Tortoise

# Simple password hashing (temporary solution)
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

async def create_test_laborist():
    # Initialize database
    await Tortoise.init(
        db_url="sqlite://db.sqlite3",
        modules={"models": ["backend.models"]}
    )
    await Tortoise.generate_schemas()

    # Create test laborist
    laborist = await Practitioner.create(
        name=[{
            "use": "official",
            "text": "Dr. Sarah Laboratory"
        }],
        email="sarah.lab@aurahospital.com",
        identifier=[{
            "system": "license",
            "value": "L123456"  # License starts with L for laborist
        }],
        telecom=[{
            "system": "phone",
            "value": "+1-555-0103"
        }],
        specialty=["Laboratory"],
        password_hash=hash_password("password123")
    )

    # Create laborist record
    laborist_record = await LaboristRecord.create(
        laborist=laborist,
        specialization=["Clinical Laboratory", "Radiology", "Pathology"],
        certifications=["Medical Laboratory Scientist", "Radiologic Technologist"],
        experience_years=8,
        work_schedule={
            "monday": {"start": "08:00", "end": "17:00"},
            "tuesday": {"start": "08:00", "end": "17:00"},
            "wednesday": {"start": "08:00", "end": "17:00"},
            "thursday": {"start": "08:00", "end": "17:00"},
            "friday": {"start": "08:00", "end": "17:00"}
        },
        contact_info={
            "department": "Laboratory Services",
            "extension": "5103"
        }
    )

    # Create another laborist
    laborist2 = await Practitioner.create(
        name=[{
            "use": "official",
            "text": "Dr. Michael Radiology"
        }],
        email="michael.rad@aurahospital.com",
        identifier=[{
            "system": "license",
            "value": "L789012"  # License starts with L for laborist
        }],
        telecom=[{
            "system": "phone",
            "value": "+1-555-0104"
        }],
        specialty=["Laboratory"],
        password_hash=hash_password("password123")
    )

    # Create laborist record for second laborist
    laborist_record2 = await LaboristRecord.create(
        laborist=laborist2,
        specialization=["Radiology", "Medical Imaging"],
        certifications=["Radiologic Technologist", "CT Technologist"],
        experience_years=12,
        work_schedule={
            "monday": {"start": "06:00", "end": "15:00"},
            "tuesday": {"start": "06:00", "end": "15:00"},
            "wednesday": {"start": "06:00", "end": "15:00"},
            "thursday": {"start": "06:00", "end": "15:00"},
            "friday": {"start": "06:00", "end": "15:00"},
            "saturday": {"start": "08:00", "end": "12:00"}
        },
        contact_info={
            "department": "Radiology Department",
            "extension": "5104"
        }
    )

    # Get a test patient (create one if doesn't exist)
    patient = await Patient.get_or_none(email="patient@example.com")
    if not patient:
        patient = await Patient.create(
            name=[{
                "use": "official",
                "text": "Test Patient"
            }],
            email="patient@example.com",
            identifier=[{
                "system": "national_id",
                "value": "123456789"
            }],
            telecom=[{
                "system": "phone",
                "value": "+1-555-0001"
            }],
            birth_date=date(1990, 5, 15),
            password_hash=hash_password("patient123")
        )

    # Get a test doctor (create one if doesn't exist)
    doctor = await Practitioner.get_or_none(email="doctor@example.com")
    if not doctor:
        doctor = await Practitioner.create(
            name=[{
                "use": "official",
                "text": "Dr. John Smith"
            }],
            email="doctor@example.com",
            identifier=[{
                "system": "license",
                "value": "D123456"
            }],
            telecom=[{
                "system": "phone",
                "value": "+1-555-0002"
            }],
            specialty=["General Medicine"],
            password_hash=hash_password("doctor123")
        )

    # Create sample lab tests
    lab_tests = [
        {
            "patient": patient,
            "test_type": "Blood Test",
            "test_name": "Complete Blood Count (CBC)",
            "requested_by": doctor,
            "scheduled_date": date.today() + timedelta(days=1),
            "notes": "Routine checkup - monitor blood cell counts",
            "urgent": False
        },
        {
            "patient": patient,
            "laborist": laborist,
            "test_type": "Blood Test",
            "test_name": "Lipid Panel",
            "requested_by": doctor,
            "scheduled_date": date.today(),
            "status": "in_progress",
            "notes": "Check cholesterol levels",
            "urgent": False
        },
        {
            "patient": patient,
            "laborist": laborist,
            "test_type": "Urine Test",
            "test_name": "Urinalysis",
            "requested_by": doctor,
            "scheduled_date": date.today() - timedelta(days=1),
            "completed_date": datetime.now() - timedelta(hours=2),
            "status": "completed",
            "results": {
                "protein": "Negative",
                "glucose": "Negative",
                "specific_gravity": "1.020",
                "color": "Yellow",
                "clarity": "Clear"
            },
            "notes": "Normal results",
            "urgent": False
        }
    ]

    for lab_test_data in lab_tests:
        await LabTest.create(**lab_test_data)

    # Create sample scans
    scans = [
        {
            "patient": patient,
            "scan_type": "X-Ray",
            "body_part": "Chest",
            "requested_by": doctor,
            "scheduled_date": date.today() + timedelta(days=2),
            "notes": "Check for respiratory issues",
            "urgent": False
        },
        {
            "patient": patient,
            "laborist": laborist2,
            "scan_type": "CT Scan",
            "body_part": "Abdomen",
            "requested_by": doctor,
            "scheduled_date": date.today(),
            "status": "in_progress",
            "notes": "Investigate abdominal pain",
            "urgent": True
        },
        {
            "patient": patient,
            "laborist": laborist2,
            "scan_type": "Ultrasound",
            "body_part": "Heart",
            "requested_by": doctor,
            "scheduled_date": date.today() - timedelta(days=3),
            "completed_date": datetime.now() - timedelta(days=2),
            "status": "completed",
            "findings": "Normal cardiac function. No abnormalities detected.",
            "notes": "Echocardiogram complete",
            "urgent": False
        }
    ]

    for scan_data in scans:
        await Scan.create(**scan_data)

    print("✅ Test laborists and sample data created successfully!")
    print("\n📋 Created Laborists:")
    print(f"   • Dr. Sarah Laboratory (sarah.lab@aurahospital.com) - License: L123456")
    print(f"   • Dr. Michael Radiology (michael.rad@aurahospital.com) - License: L789012")
    print("\n🧪 Created Lab Tests:")
    print(f"   • CBC (pending)")
    print(f"   • Lipid Panel (in progress)")
    print(f"   • Urinalysis (completed)")
    print("\n🏥 Created Scans:")
    print(f"   • Chest X-Ray (pending)")
    print(f"   • Abdominal CT Scan (in progress)")
    print(f"   • Cardiac Ultrasound (completed)")

    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(create_test_laborist()) 