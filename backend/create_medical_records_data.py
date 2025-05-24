import asyncio
import sys
import os
from datetime import datetime, date, timedelta
import random

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tortoise import Tortoise
from models import (
    Patient, Practitioner, MedicalRecord, PatientAllergy, PatientMedication,
    VitalSigns, Diagnosis, MedicalProcedure, ClinicalNote, FamilyHistory,
    SocialHistory, MedicalDocument, LabResult, ImagingResult, Medicine
)

# Database configuration
TORTOISE_ORM = {
    "connections": {
        "default": "sqlite://db.sqlite3"
    },
    "apps": {
        "models": {
            "models": ["models", "aerich.models"],
            "default_connection": "default",
        }
    }
}

async def create_comprehensive_medical_data():
    """Create comprehensive medical records test data"""
    
    # Initialize Tortoise ORM
    await Tortoise.init(config=TORTOISE_ORM)
    await Tortoise.generate_schemas()
    
    print("Creating comprehensive medical records data...")
    
    # Get existing patients and practitioners
    patients = await Patient.all().limit(5)
    practitioners = await Practitioner.all()
    
    if not patients or not practitioners:
        print("No patients or practitioners found. Please create some first.")
        return
    
    # Create medical records for each patient
    for patient in patients:
        print(f"Creating medical records for patient {patient.id}...")
        
        # Create main medical record
        medical_record = await MedicalRecord.create(
            patient=patient,
            created_by=random.choice(practitioners),
            record_type="consultation",
            title=f"Annual Physical Examination - {datetime.now().year}",
            description="Comprehensive annual physical examination with routine screenings",
            date_of_service=datetime.now() - timedelta(days=random.randint(1, 30)),
            department="Internal Medicine",
            facility="Aura Hospital Main Campus",
            chief_complaint="Annual routine physical examination",
            clinical_summary="Patient presents for annual physical examination. Generally feeling well with no acute complaints.",
            treatment_plan="Continue current medications, lifestyle modifications discussed, follow-up in 1 year",
            follow_up_instructions="Return in 1 year for annual exam, or sooner if concerns arise"
        )
        
        # Create allergies
        allergies_data = [
            {
                "allergen": "Penicillin",
                "allergen_type": "drug",
                "reaction": "Skin rash and hives",
                "severity": "moderate"
            },
            {
                "allergen": "Shellfish",
                "allergen_type": "food",
                "reaction": "Swelling and difficulty breathing",
                "severity": "severe"
            },
            {
                "allergen": "Pollen",
                "allergen_type": "environmental",
                "reaction": "Sneezing, runny nose, watery eyes",
                "severity": "mild"
            }
        ]
        
        for allergy_data in random.sample(allergies_data, k=random.randint(1, 2)):
            await PatientAllergy.create(
                patient=patient,
                medical_record=medical_record,
                allergen=allergy_data["allergen"],
                allergen_type=allergy_data["allergen_type"],
                reaction=allergy_data["reaction"],
                severity=allergy_data["severity"],
                onset_date=date.today() - timedelta(days=random.randint(365, 3650)),
                verified=True,
                verified_by=random.choice(practitioners)
            )
        
        # Create medications
        medications_data = [
            {
                "medication_name": "Lisinopril 10mg",
                "dosage": "10mg",
                "frequency": "Once daily",
                "route": "oral",
                "indication": "Hypertension"
            },
            {
                "medication_name": "Metformin 500mg",
                "dosage": "500mg",
                "frequency": "Twice daily with meals",
                "route": "oral",
                "indication": "Type 2 Diabetes"
            },
            {
                "medication_name": "Atorvastatin 20mg",
                "dosage": "20mg",
                "frequency": "Once daily in evening",
                "route": "oral",
                "indication": "High cholesterol"
            },
            {
                "medication_name": "Omeprazole 20mg",
                "dosage": "20mg",
                "frequency": "Once daily before breakfast",
                "route": "oral",
                "indication": "GERD"
            }
        ]
        
        for med_data in random.sample(medications_data, k=random.randint(1, 3)):
            await PatientMedication.create(
                patient=patient,
                medical_record=medical_record,
                medication_name=med_data["medication_name"],
                dosage=med_data["dosage"],
                frequency=med_data["frequency"],
                route=med_data["route"],
                start_date=date.today() - timedelta(days=random.randint(30, 1095)),
                prescribed_by=random.choice(practitioners),
                indication=med_data["indication"],
                adherence="good"
            )
        
        # Create vital signs (multiple entries)
        for i in range(3):
            measurement_date = datetime.now() - timedelta(days=random.randint(1, 90))
            await VitalSigns.create(
                patient=patient,
                medical_record=medical_record if i == 0 else None,
                recorded_by=random.choice(practitioners),
                measurement_date=measurement_date,
                systolic_bp=random.randint(110, 150),
                diastolic_bp=random.randint(70, 95),
                heart_rate=random.randint(60, 100),
                respiratory_rate=random.randint(12, 20),
                body_temperature=round(random.uniform(36.1, 37.2), 1),
                oxygen_saturation=random.randint(95, 100),
                weight=round(random.uniform(50.0, 120.0), 1),
                height=round(random.uniform(150.0, 190.0), 1),
                pain_score=random.randint(0, 3),
                blood_glucose=random.randint(80, 140)
            )
        
        # Create diagnoses
        diagnoses_data = [
            {
                "icd_10_code": "I10",
                "diagnosis_name": "Essential Hypertension",
                "diagnosis_type": "primary",
                "severity": "mild"
            },
            {
                "icd_10_code": "E11.9",
                "diagnosis_name": "Type 2 Diabetes Mellitus",
                "diagnosis_type": "primary",
                "severity": "moderate"
            },
            {
                "icd_10_code": "E78.5",
                "diagnosis_name": "Hyperlipidemia",
                "diagnosis_type": "secondary",
                "severity": "mild"
            },
            {
                "icd_10_code": "K21.9",
                "diagnosis_name": "Gastroesophageal Reflux Disease",
                "diagnosis_type": "secondary",
                "severity": "mild"
            }
        ]
        
        for dx_data in random.sample(diagnoses_data, k=random.randint(1, 2)):
            await Diagnosis.create(
                patient=patient,
                medical_record=medical_record,
                diagnosed_by=random.choice(practitioners),
                icd_10_code=dx_data["icd_10_code"],
                diagnosis_name=dx_data["diagnosis_name"],
                diagnosis_type=dx_data["diagnosis_type"],
                onset_date=date.today() - timedelta(days=random.randint(365, 2190)),
                severity=dx_data["severity"],
                clinical_notes=f"Patient diagnosed with {dx_data['diagnosis_name']} during routine examination."
            )
        
        # Create clinical notes
        note_types = ["progress", "consultation", "discharge"]
        for note_type in random.sample(note_types, k=2):
            await ClinicalNote.create(
                patient=patient,
                medical_record=medical_record,
                author=random.choice(practitioners),
                note_type=note_type,
                note_date=datetime.now() - timedelta(days=random.randint(1, 30)),
                subjective="Patient reports feeling well overall with good energy levels.",
                objective="Vitals stable, physical examination unremarkable.",
                assessment="Chronic conditions well-controlled, patient compliant with medications.",
                plan="Continue current treatment plan, follow-up as scheduled.",
                note_content=f"{note_type.capitalize()} note: Patient evaluation and management discussion.",
                priority="routine"
            )
        
        # Create family history
        family_conditions = [
            {"relationship": "mother", "condition": "Breast Cancer", "age_of_onset": 58},
            {"relationship": "father", "condition": "Heart Disease", "age_of_onset": 65},
            {"relationship": "sibling", "condition": "Diabetes", "age_of_onset": 45},
            {"relationship": "grandparent", "condition": "Stroke", "age_of_onset": 78}
        ]
        
        for fh_data in random.sample(family_conditions, k=random.randint(1, 3)):
            await FamilyHistory.create(
                patient=patient,
                relationship=fh_data["relationship"],
                condition=fh_data["condition"],
                age_of_onset=fh_data["age_of_onset"],
                notes=f"Family history significant for {fh_data['condition']} in {fh_data['relationship']}"
            )
        
        # Create social history
        smoking_statuses = ["never", "former", "current"]
        alcohol_uses = ["never", "occasional", "moderate"]
        await SocialHistory.create(
            patient=patient,
            smoking_status=random.choice(smoking_statuses),
            smoking_packs_per_day=random.uniform(0, 1) if random.choice([True, False]) else None,
            alcohol_use=random.choice(alcohol_uses),
            alcohol_drinks_per_week=random.randint(0, 7),
            occupation=random.choice(["Teacher", "Engineer", "Nurse", "Manager", "Retired"]),
            education_level=random.choice(["High School", "Bachelor's", "Master's", "PhD"]),
            marital_status=random.choice(["single", "married", "divorced", "widowed"]),
            exercise_frequency=random.choice(["daily", "weekly", "monthly", "rarely"]),
            diet_type=random.choice(["regular", "vegetarian", "low-sodium", "diabetic"]),
            insurance_provider="Blue Cross Blue Shield",
            emergency_contact={
                "name": "Emergency Contact",
                "relationship": "spouse",
                "phone": "+1-555-0123"
            }
        )
        
        # Create lab results
        lab_tests = [
            {
                "test_name": "Complete Blood Count",
                "components": [
                    {"component": "WBC", "value": "7.2", "unit": "10^3/uL", "range": "4.0-11.0"},
                    {"component": "RBC", "value": "4.8", "unit": "10^6/uL", "range": "4.2-5.8"},
                    {"component": "Hemoglobin", "value": "14.5", "unit": "g/dL", "range": "12.0-16.0"}
                ]
            },
            {
                "test_name": "Basic Metabolic Panel",
                "components": [
                    {"component": "Glucose", "value": "95", "unit": "mg/dL", "range": "70-100"},
                    {"component": "Creatinine", "value": "1.0", "unit": "mg/dL", "range": "0.6-1.2"},
                    {"component": "Sodium", "value": "140", "unit": "mEq/L", "range": "135-145"}
                ]
            }
        ]
        
        for lab_test in lab_tests:
            test_date = datetime.now() - timedelta(days=random.randint(1, 90))
            for component in lab_test["components"]:
                await LabResult.create(
                    patient=patient,
                    medical_record=medical_record,
                    test_name=lab_test["test_name"],
                    component_name=component["component"],
                    result_value=component["value"],
                    result_unit=component["unit"],
                    reference_range=component["range"],
                    abnormal_flag="N" if random.random() > 0.2 else "H",
                    test_date=test_date,
                    reported_date=test_date + timedelta(hours=4),
                    performing_lab="Aura Hospital Laboratory"
                )
        
        # Create imaging results
        imaging_studies = [
            {
                "study_type": "Chest X-Ray",
                "body_region": "Chest",
                "findings": "Normal chest radiograph. Heart size within normal limits. Lungs clear bilaterally.",
                "impression": "Normal chest X-ray"
            },
            {
                "study_type": "Abdominal Ultrasound",
                "body_region": "Abdomen",
                "findings": "Normal liver, gallbladder, and kidneys. No abnormalities detected.",
                "impression": "Normal abdominal ultrasound"
            }
        ]
        
        for imaging in random.sample(imaging_studies, k=1):
            study_date = datetime.now() - timedelta(days=random.randint(1, 180))
            await ImagingResult.create(
                patient=patient,
                medical_record=medical_record,
                study_type=imaging["study_type"],
                body_region=imaging["body_region"],
                contrast_used=False,
                findings=imaging["findings"],
                impression=imaging["impression"],
                study_date=study_date,
                reported_date=study_date + timedelta(hours=2),
                radiologist=random.choice(practitioners),
                facility="Aura Hospital Radiology Department"
            )
        
        # Create medical documents
        document_types = [
            {
                "type": "lab_result",
                "title": "Complete Blood Count Report",
                "description": "Recent CBC lab results"
            },
            {
                "type": "imaging",
                "title": "Chest X-Ray Report",
                "description": "Routine chest X-ray examination"
            },
            {
                "type": "prescription",
                "title": "Current Medications List",
                "description": "Updated list of current medications"
            }
        ]
        
        for doc_data in random.sample(document_types, k=2):
            await MedicalDocument.create(
                patient=patient,
                medical_record=medical_record,
                uploaded_by=random.choice(practitioners),
                document_type=doc_data["type"],
                title=doc_data["title"],
                description=doc_data["description"],
                file_name=f"document_{random.randint(1000, 9999)}.pdf",
                original_filename=f"{doc_data['title'].replace(' ', '_')}.pdf",
                file_path=f"/uploads/documents/document_{random.randint(1000, 9999)}.pdf",
                file_type="pdf",
                file_size=random.randint(50000, 500000),
                mime_type="application/pdf",
                provider_name="Aura Hospital",
                document_date=date.today() - timedelta(days=random.randint(1, 30)),
                tags=[doc_data["type"], "routine", "2024"]
            )
    
    print("✅ Comprehensive medical records data created successfully!")
    print(f"Created medical records for {len(patients)} patients")
    
    # Show summary
    total_records = await MedicalRecord.all().count()
    total_allergies = await PatientAllergy.all().count()
    total_medications = await PatientMedication.all().count()
    total_vitals = await VitalSigns.all().count()
    total_diagnoses = await Diagnosis.all().count()
    total_lab_results = await LabResult.all().count()
    total_imaging = await ImagingResult.all().count()
    total_documents = await MedicalDocument.all().count()
    
    print(f"\nSummary:")
    print(f"- Medical Records: {total_records}")
    print(f"- Allergies: {total_allergies}")
    print(f"- Medications: {total_medications}")
    print(f"- Vital Signs: {total_vitals}")
    print(f"- Diagnoses: {total_diagnoses}")
    print(f"- Lab Results: {total_lab_results}")
    print(f"- Imaging Results: {total_imaging}")
    print(f"- Documents: {total_documents}")
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(create_comprehensive_medical_data()) 