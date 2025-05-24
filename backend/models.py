from tortoise import fields, models
from tortoise.contrib.pydantic import pydantic_model_creator
from datetime import date
from typing import Optional
from pydantic import BaseModel
from decimal import Decimal

class Patient(models.Model):
    id = fields.IntField(pk=True)
    # FHIR Patient resource fields
    identifier = fields.JSONField(default=list)  # List of identifiers (national_id, etc.)
    active = fields.BooleanField(default=True)
    name = fields.JSONField()  # FHIR HumanName structure
    telecom = fields.JSONField(default=list)  # List of contact points (phone, email)
    email = fields.CharField(max_length=255, unique=True)  # Dedicated email field
    gender = fields.CharField(max_length=10, null=True)
    birth_date = fields.DateField(null=True)
    address = fields.JSONField(null=True)
    marital_status = fields.JSONField(null=True)
    communication = fields.JSONField(default=list)
    password_hash = fields.CharField(max_length=255)  # Store hashed password
    
    class Meta:
        table = "patients"

class Practitioner(models.Model):
    id = fields.IntField(pk=True)
    # FHIR Practitioner resource fields
    identifier = fields.JSONField(default=list)  # List of identifiers (license_number, etc.)
    active = fields.BooleanField(default=True)
    name = fields.JSONField()  # FHIR HumanName structure
    telecom = fields.JSONField(default=list)  # List of contact points (phone, email)
    email = fields.CharField(max_length=255, unique=True)  # Dedicated email field
    gender = fields.CharField(max_length=10, null=True)
    birth_date = fields.DateField(null=True)
    address = fields.JSONField(null=True)
    qualification = fields.JSONField(default=list)  # List of qualifications
    specialty = fields.JSONField(default=list)  # List of specialties
    organization = fields.JSONField(null=True)  # Hospital/Organization reference
    password_hash = fields.CharField(max_length=255)  # Store hashed password
    
    class Meta:
        table = "practitioners"

class Medicine(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    generic_name = fields.CharField(max_length=255)
    brand_name = fields.CharField(max_length=255, null=True)
    manufacturer = fields.CharField(max_length=255)
    dosage_form = fields.CharField(max_length=100)  # tablet, capsule, syrup, injection, etc.
    strength = fields.CharField(max_length=100)  # 500mg, 10ml, etc.
    category = fields.CharField(max_length=100)  # antibiotic, painkiller, etc.
    description = fields.TextField(null=True)
    unit_price = fields.DecimalField(max_digits=10, decimal_places=2)
    current_stock = fields.IntField(default=0)
    minimum_stock = fields.IntField(default=10)
    expiry_date = fields.DateField()
    batch_number = fields.CharField(max_length=100)
    barcode = fields.CharField(max_length=100, null=True)
    prescription_required = fields.BooleanField(default=True)
    active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "medicines"

class Prescription(models.Model):
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='prescriptions')
    prescriber = fields.ForeignKeyField('models.Practitioner', related_name='prescriptions')
    medicine = fields.ForeignKeyField('models.Medicine', related_name='prescriptions')
    dosage = fields.CharField(max_length=100)  # 1 tablet, 2 capsules, etc.
    frequency = fields.CharField(max_length=100)  # twice daily, every 8 hours, etc.
    duration = fields.CharField(max_length=100)  # 7 days, 2 weeks, etc.
    quantity_prescribed = fields.IntField()
    quantity_dispensed = fields.IntField(default=0)
    instructions = fields.TextField(null=True)
    status = fields.CharField(max_length=20, default='pending')  # pending, dispensed, cancelled
    prescribed_date = fields.DatetimeField(auto_now_add=True)
    dispensed_date = fields.DatetimeField(null=True)
    pharmacist = fields.ForeignKeyField('models.Practitioner', related_name='dispensed_prescriptions', null=True)
    
    class Meta:
        table = "prescriptions"

class Appointment(models.Model):
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='appointments')
    doctor = fields.ForeignKeyField('models.Practitioner', related_name='appointments')
    date = fields.DateField()
    time = fields.CharField(max_length=5)  # Format: "HH:MM"
    duration = fields.IntField(default=30)  # Duration in minutes
    status = fields.CharField(max_length=20, default='scheduled')  # scheduled, confirmed, completed, cancelled, no-show
    reason = fields.TextField()
    notes = fields.TextField(null=True)
    follow_up = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "appointments"

# Laborist-specific models
class LabTest(models.Model):
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='lab_tests')
    requested_by = fields.ForeignKeyField('models.Practitioner', related_name='requested_lab_tests')
    laborist = fields.ForeignKeyField('models.Practitioner', related_name='assigned_lab_tests', null=True)
    test_type = fields.CharField(max_length=100)  # blood, urine, stool, etc.
    test_name = fields.CharField(max_length=255)  # Complete Blood Count, etc.
    status = fields.CharField(max_length=20, default='pending')  # pending, in_progress, completed, cancelled
    urgent = fields.BooleanField(default=False)
    scheduled_date = fields.DateField()
    scheduled_time = fields.CharField(max_length=5, null=True)  # Format: "HH:MM"
    completed_date = fields.DatetimeField(null=True)
    instructions = fields.TextField(null=True)
    results = fields.JSONField(null=True)  # Test results data
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "lab_tests"

class Scan(models.Model):
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='scans')
    requested_by = fields.ForeignKeyField('models.Practitioner', related_name='requested_scans')
    laborist = fields.ForeignKeyField('models.Practitioner', related_name='assigned_scans', null=True)
    scan_type = fields.CharField(max_length=100)  # X-ray, CT, MRI, Ultrasound, etc.
    body_part = fields.CharField(max_length=100)  # chest, abdomen, head, etc.
    status = fields.CharField(max_length=20, default='pending')  # pending, in_progress, completed, cancelled
    urgent = fields.BooleanField(default=False)
    scheduled_date = fields.DateField()
    scheduled_time = fields.CharField(max_length=5, null=True)  # Format: "HH:MM"
    completed_date = fields.DatetimeField(null=True)
    instructions = fields.TextField(null=True)
    findings = fields.TextField(null=True)  # Radiologist findings
    image_urls = fields.JSONField(default=list)  # List of image file URLs
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "scans"

class MedicalUpload(models.Model):
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='medical_uploads')
    uploaded_by = fields.ForeignKeyField('models.Practitioner', related_name='uploaded_files')
    lab_test = fields.ForeignKeyField('models.LabTest', related_name='uploaded_files', null=True)
    scan = fields.ForeignKeyField('models.Scan', related_name='uploaded_files', null=True)
    file_name = fields.CharField(max_length=255)
    original_name = fields.CharField(max_length=255)
    file_path = fields.CharField(max_length=500)
    file_type = fields.CharField(max_length=100)  # pdf, image, document, etc.
    file_size = fields.IntField()  # Size in bytes
    description = fields.TextField(null=True)
    uploaded_at = fields.DatetimeField(auto_now_add=True)
    
    class Meta:
        table = "medical_uploads"

class LaboristRecord(models.Model):
    id = fields.IntField(pk=True)
    laborist = fields.OneToOneField('models.Practitioner', related_name='laborist_record')
    department = fields.CharField(max_length=100, default='Laboratory')
    shift = fields.CharField(max_length=20, default='day')  # day, night, rotating
    certifications = fields.JSONField(default=list)  # List of certifications
    experience_years = fields.IntField(default=0)
    specializations = fields.JSONField(default=list)  # Lab specializations
    work_schedule = fields.JSONField(default=dict)  # Weekly schedule
    emergency_contact = fields.JSONField(null=True)
    bio = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "laborist_records"

# Comprehensive Medical Records Models

class MedicalRecord(models.Model):
    """Main medical record that consolidates all patient medical information"""
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='medical_records')
    created_by = fields.ForeignKeyField('models.Practitioner', related_name='created_records')
    last_updated_by = fields.ForeignKeyField('models.Practitioner', related_name='updated_records', null=True)
    record_type = fields.CharField(max_length=50)  # consultation, emergency, discharge, etc.
    title = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    date_of_service = fields.DatetimeField()
    department = fields.CharField(max_length=100)
    facility = fields.CharField(max_length=255)
    chief_complaint = fields.TextField(null=True)  # Primary reason for visit
    clinical_summary = fields.TextField(null=True)  # Overall summary
    treatment_plan = fields.TextField(null=True)
    follow_up_instructions = fields.TextField(null=True)
    discharge_notes = fields.TextField(null=True)
    status = fields.CharField(max_length=20, default='active')  # active, archived, deleted
    confidentiality_level = fields.CharField(max_length=20, default='normal')  # normal, restricted, confidential
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "medical_records"

class PatientAllergy(models.Model):
    """Patient allergies and adverse reactions"""
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='allergies')
    medical_record = fields.ForeignKeyField('models.MedicalRecord', related_name='allergies', null=True)
    allergen = fields.CharField(max_length=255)  # Drug name, food, environmental
    allergen_type = fields.CharField(max_length=50)  # drug, food, environmental, latex, etc.
    reaction = fields.TextField()  # Description of reaction
    severity = fields.CharField(max_length=20)  # mild, moderate, severe, life-threatening
    onset_date = fields.DateField(null=True)
    verified = fields.BooleanField(default=False)  # Clinically verified
    verified_by = fields.ForeignKeyField('models.Practitioner', related_name='verified_allergies', null=True)
    status = fields.CharField(max_length=20, default='active')  # active, inactive, resolved
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "patient_allergies"

class PatientMedication(models.Model):
    """Current and past medications"""
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='medications')
    medical_record = fields.ForeignKeyField('models.MedicalRecord', related_name='medications', null=True)
    medicine = fields.ForeignKeyField('models.Medicine', related_name='patient_medications', null=True)
    medication_name = fields.CharField(max_length=255)  # Generic or brand name
    dosage = fields.CharField(max_length=100)
    frequency = fields.CharField(max_length=100)
    route = fields.CharField(max_length=50)  # oral, injection, topical, etc.
    start_date = fields.DateField()
    end_date = fields.DateField(null=True)
    prescribed_by = fields.ForeignKeyField('models.Practitioner', related_name='prescribed_medications')
    indication = fields.CharField(max_length=255)  # Reason for prescription
    status = fields.CharField(max_length=20, default='active')  # active, completed, discontinued, held
    adherence = fields.CharField(max_length=20, null=True)  # good, poor, unknown
    side_effects = fields.TextField(null=True)
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "patient_medications"

class VitalSigns(models.Model):
    """Patient vital signs measurements"""
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='vital_signs')
    medical_record = fields.ForeignKeyField('models.MedicalRecord', related_name='vital_signs', null=True)
    recorded_by = fields.ForeignKeyField('models.Practitioner', related_name='recorded_vitals')
    measurement_date = fields.DatetimeField()
    systolic_bp = fields.IntField(null=True)  # mmHg
    diastolic_bp = fields.IntField(null=True)  # mmHg
    heart_rate = fields.IntField(null=True)  # beats per minute
    respiratory_rate = fields.IntField(null=True)  # breaths per minute
    body_temperature = fields.DecimalField(max_digits=4, decimal_places=1, null=True)  # Celsius
    oxygen_saturation = fields.IntField(null=True)  # SpO2 percentage
    weight = fields.DecimalField(max_digits=5, decimal_places=2, null=True)  # kg
    height = fields.DecimalField(max_digits=5, decimal_places=2, null=True)  # cm
    bmi = fields.DecimalField(max_digits=4, decimal_places=1, null=True)
    pain_score = fields.IntField(null=True)  # 0-10 pain scale
    blood_glucose = fields.IntField(null=True)  # mg/dL
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    
    class Meta:
        table = "vital_signs"

class Diagnosis(models.Model):
    """Patient diagnoses"""
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='diagnoses')
    medical_record = fields.ForeignKeyField('models.MedicalRecord', related_name='diagnoses', null=True)
    diagnosed_by = fields.ForeignKeyField('models.Practitioner', related_name='made_diagnoses')
    icd_10_code = fields.CharField(max_length=10, null=True)  # ICD-10 diagnosis code
    diagnosis_name = fields.CharField(max_length=255)
    diagnosis_type = fields.CharField(max_length=50)  # primary, secondary, differential, provisional
    onset_date = fields.DateField(null=True)
    resolved_date = fields.DateField(null=True)
    severity = fields.CharField(max_length=20, null=True)  # mild, moderate, severe
    status = fields.CharField(max_length=20, default='active')  # active, resolved, chronic, recurrent
    clinical_notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "diagnoses"

class MedicalProcedure(models.Model):
    """Medical procedures performed"""
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='procedures')
    medical_record = fields.ForeignKeyField('models.MedicalRecord', related_name='procedures', null=True)
    performed_by = fields.ForeignKeyField('models.Practitioner', related_name='performed_procedures')
    assisted_by = fields.ManyToManyField('models.Practitioner', related_name='assisted_procedures')
    cpt_code = fields.CharField(max_length=10, null=True)  # CPT procedure code
    procedure_name = fields.CharField(max_length=255)
    procedure_type = fields.CharField(max_length=100)  # surgical, diagnostic, therapeutic
    body_site = fields.CharField(max_length=100, null=True)
    procedure_date = fields.DatetimeField()
    duration_minutes = fields.IntField(null=True)
    anesthesia_type = fields.CharField(max_length=50, null=True)  # local, general, sedation, none
    complications = fields.TextField(null=True)
    outcome = fields.CharField(max_length=50, null=True)  # successful, complicated, failed
    post_op_instructions = fields.TextField(null=True)
    procedure_notes = fields.TextField(null=True)
    follow_up_required = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)
    
    class Meta:
        table = "medical_procedures"

class ClinicalNote(models.Model):
    """Clinical notes and observations"""
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='clinical_notes')
    medical_record = fields.ForeignKeyField('models.MedicalRecord', related_name='clinical_notes', null=True)
    author = fields.ForeignKeyField('models.Practitioner', related_name='authored_notes')
    note_type = fields.CharField(max_length=50)  # progress, admission, discharge, consultation
    note_date = fields.DatetimeField()
    subjective = fields.TextField(null=True)  # SOAP - Subjective
    objective = fields.TextField(null=True)  # SOAP - Objective
    assessment = fields.TextField(null=True)  # SOAP - Assessment
    plan = fields.TextField(null=True)  # SOAP - Plan
    note_content = fields.TextField()  # Full note content
    priority = fields.CharField(max_length=20, default='routine')  # routine, urgent, critical
    signed = fields.BooleanField(default=False)
    signed_date = fields.DatetimeField(null=True)
    amended = fields.BooleanField(default=False)
    amendment_reason = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "clinical_notes"

class FamilyHistory(models.Model):
    """Patient family medical history"""
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='family_history')
    relationship = fields.CharField(max_length=50)  # mother, father, sibling, grandparent, etc.
    condition = fields.CharField(max_length=255)
    age_of_onset = fields.IntField(null=True)
    age_at_death = fields.IntField(null=True)
    cause_of_death = fields.CharField(max_length=255, null=True)
    status = fields.CharField(max_length=20, default='active')  # active, deceased, unknown
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "family_history"

class SocialHistory(models.Model):
    """Patient social history"""
    id = fields.IntField(pk=True)
    patient = fields.OneToOneField('models.Patient', related_name='social_history')
    smoking_status = fields.CharField(max_length=20, null=True)  # never, former, current
    smoking_packs_per_day = fields.DecimalField(max_digits=3, decimal_places=1, null=True)
    smoking_years = fields.IntField(null=True)
    alcohol_use = fields.CharField(max_length=20, null=True)  # never, occasional, moderate, heavy
    alcohol_drinks_per_week = fields.IntField(null=True)
    drug_use = fields.CharField(max_length=20, null=True)  # never, former, current
    drug_types = fields.JSONField(null=True)  # List of drug types
    occupation = fields.CharField(max_length=255, null=True)
    education_level = fields.CharField(max_length=50, null=True)
    marital_status = fields.CharField(max_length=20, null=True)
    living_situation = fields.CharField(max_length=100, null=True)
    exercise_frequency = fields.CharField(max_length=50, null=True)
    diet_type = fields.CharField(max_length=50, null=True)
    insurance_provider = fields.CharField(max_length=255, null=True)
    emergency_contact = fields.JSONField(null=True)
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "social_history"

class MedicalDocument(models.Model):
    """Medical documents and files"""
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='medical_documents')
    medical_record = fields.ForeignKeyField('models.MedicalRecord', related_name='documents', null=True)
    uploaded_by = fields.ForeignKeyField('models.Practitioner', related_name='uploaded_documents')
    document_type = fields.CharField(max_length=50)  # lab_result, imaging, prescription, insurance, etc.
    title = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    file_name = fields.CharField(max_length=255)
    original_filename = fields.CharField(max_length=255)
    file_path = fields.CharField(max_length=500)
    file_type = fields.CharField(max_length=50)  # pdf, jpg, png, docx, etc.
    file_size = fields.IntField()  # bytes
    mime_type = fields.CharField(max_length=100)
    provider_name = fields.CharField(max_length=255, null=True)
    document_date = fields.DateField(null=True)  # Date of the document content
    extracted_text = fields.TextField(null=True)  # OCR extracted text
    metadata = fields.JSONField(null=True)  # Additional metadata
    tags = fields.JSONField(default=list)  # Searchable tags
    status = fields.CharField(max_length=20, default='active')  # active, archived, deleted
    created_at = fields.DatetimeField(auto_now_add=True)
    
    class Meta:
        table = "medical_documents"

class LabResult(models.Model):
    """Detailed lab test results"""
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='lab_results')
    medical_record = fields.ForeignKeyField('models.MedicalRecord', related_name='lab_results', null=True)
    lab_test = fields.ForeignKeyField('models.LabTest', related_name='detailed_results', null=True)
    test_name = fields.CharField(max_length=255)
    component_name = fields.CharField(max_length=255)  # Individual test component
    result_value = fields.CharField(max_length=100)
    result_unit = fields.CharField(max_length=50, null=True)
    reference_range = fields.CharField(max_length=100, null=True)
    abnormal_flag = fields.CharField(max_length=20, null=True)  # H, L, HH, LL, A
    result_status = fields.CharField(max_length=20, default='final')  # preliminary, final, corrected
    test_date = fields.DatetimeField()
    reported_date = fields.DatetimeField()
    performing_lab = fields.CharField(max_length=255)
    lab_technician = fields.CharField(max_length=255, null=True)
    notes = fields.TextField(null=True)
    
    class Meta:
        table = "lab_results"

class ImagingResult(models.Model):
    """Detailed imaging results"""
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='imaging_results')
    medical_record = fields.ForeignKeyField('models.MedicalRecord', related_name='imaging_results', null=True)
    scan = fields.ForeignKeyField('models.Scan', related_name='detailed_results', null=True)
    study_type = fields.CharField(max_length=100)  # CT, MRI, X-Ray, etc.
    body_region = fields.CharField(max_length=100)
    contrast_used = fields.BooleanField(default=False)
    contrast_type = fields.CharField(max_length=100, null=True)
    technique = fields.TextField(null=True)
    findings = fields.TextField()
    impression = fields.TextField()
    recommendations = fields.TextField(null=True)
    image_count = fields.IntField(default=0)
    image_urls = fields.JSONField(default=list)
    study_date = fields.DatetimeField()
    reported_date = fields.DatetimeField()
    radiologist = fields.ForeignKeyField('models.Practitioner', related_name='interpreted_imaging')
    facility = fields.CharField(max_length=255)
    accession_number = fields.CharField(max_length=100, null=True)
    
    class Meta:
        table = "imaging_results"

# Create Pydantic models for API serialization
Patient_Pydantic = pydantic_model_creator(Patient, name="Patient")
PatientIn_Pydantic = pydantic_model_creator(Patient, name="PatientIn", exclude_readonly=True)

Practitioner_Pydantic = pydantic_model_creator(Practitioner, name="Practitioner")
PractitionerIn_Pydantic = pydantic_model_creator(Practitioner, name="PractitionerIn", exclude_readonly=True)

Medicine_Pydantic = pydantic_model_creator(Medicine, name="Medicine")
MedicineIn_Pydantic = pydantic_model_creator(Medicine, name="MedicineIn", exclude_readonly=True)

Prescription_Pydantic = pydantic_model_creator(Prescription, name="Prescription")
PrescriptionIn_Pydantic = pydantic_model_creator(Prescription, name="PrescriptionIn", exclude_readonly=True)

# Laborist Pydantic models
LabTest_Pydantic = pydantic_model_creator(LabTest, name="LabTest")
LabTestIn_Pydantic = pydantic_model_creator(LabTest, name="LabTestIn", exclude_readonly=True)

Scan_Pydantic = pydantic_model_creator(Scan, name="Scan")
ScanIn_Pydantic = pydantic_model_creator(Scan, name="ScanIn", exclude_readonly=True)

MedicalUpload_Pydantic = pydantic_model_creator(MedicalUpload, name="MedicalUpload")
MedicalUploadIn_Pydantic = pydantic_model_creator(MedicalUpload, name="MedicalUploadIn", exclude_readonly=True)

LaboristRecord_Pydantic = pydantic_model_creator(LaboristRecord, name="LaboristRecord")
LaboristRecordIn_Pydantic = pydantic_model_creator(LaboristRecord, name="LaboristRecordIn", exclude_readonly=True)

# Medical Records Pydantic models
MedicalRecord_Pydantic = pydantic_model_creator(MedicalRecord, name="MedicalRecord")
MedicalRecordIn_Pydantic = pydantic_model_creator(MedicalRecord, name="MedicalRecordIn", exclude_readonly=True)

PatientAllergy_Pydantic = pydantic_model_creator(PatientAllergy, name="PatientAllergy")
PatientAllergyIn_Pydantic = pydantic_model_creator(PatientAllergy, name="PatientAllergyIn", exclude_readonly=True)

PatientMedication_Pydantic = pydantic_model_creator(PatientMedication, name="PatientMedication")
PatientMedicationIn_Pydantic = pydantic_model_creator(PatientMedication, name="PatientMedicationIn", exclude_readonly=True)

VitalSigns_Pydantic = pydantic_model_creator(VitalSigns, name="VitalSigns")
VitalSignsIn_Pydantic = pydantic_model_creator(VitalSigns, name="VitalSignsIn", exclude_readonly=True)

Diagnosis_Pydantic = pydantic_model_creator(Diagnosis, name="Diagnosis")
DiagnosisIn_Pydantic = pydantic_model_creator(Diagnosis, name="DiagnosisIn", exclude_readonly=True)

MedicalProcedure_Pydantic = pydantic_model_creator(MedicalProcedure, name="MedicalProcedure")
MedicalProcedureIn_Pydantic = pydantic_model_creator(MedicalProcedure, name="MedicalProcedureIn", exclude_readonly=True)

ClinicalNote_Pydantic = pydantic_model_creator(ClinicalNote, name="ClinicalNote")
ClinicalNoteIn_Pydantic = pydantic_model_creator(ClinicalNote, name="ClinicalNoteIn", exclude_readonly=True)

FamilyHistory_Pydantic = pydantic_model_creator(FamilyHistory, name="FamilyHistory")
FamilyHistoryIn_Pydantic = pydantic_model_creator(FamilyHistory, name="FamilyHistoryIn", exclude_readonly=True)

SocialHistory_Pydantic = pydantic_model_creator(SocialHistory, name="SocialHistory")
SocialHistoryIn_Pydantic = pydantic_model_creator(SocialHistory, name="SocialHistoryIn", exclude_readonly=True)

MedicalDocument_Pydantic = pydantic_model_creator(MedicalDocument, name="MedicalDocument")
MedicalDocumentIn_Pydantic = pydantic_model_creator(MedicalDocument, name="MedicalDocumentIn", exclude_readonly=True)

LabResult_Pydantic = pydantic_model_creator(LabResult, name="LabResult")
LabResultIn_Pydantic = pydantic_model_creator(LabResult, name="LabResultIn", exclude_readonly=True)

ImagingResult_Pydantic = pydantic_model_creator(ImagingResult, name="ImagingResult")
ImagingResultIn_Pydantic = pydantic_model_creator(ImagingResult, name="ImagingResultIn", exclude_readonly=True)

# Define explicit Pydantic models for Appointment
class AppointmentIn(BaseModel):
    patient_id: int
    doctor_id: int
    date: date
    time: str
    duration: int = 30
    status: str = 'scheduled'
    reason: str
    notes: Optional[str] = None
    follow_up: bool = False

Appointment_Pydantic = pydantic_model_creator(Appointment, name="Appointment")
AppointmentIn_Pydantic = AppointmentIn 

# Define explicit Pydantic models for Medicine operations
class MedicineCreate(BaseModel):
    name: str
    generic_name: str
    brand_name: Optional[str] = None
    manufacturer: str
    dosage_form: str
    strength: str
    category: str
    description: Optional[str] = None
    unit_price: float
    current_stock: int = 0
    minimum_stock: int = 10
    expiry_date: date
    batch_number: str
    barcode: Optional[str] = None
    prescription_required: bool = True
    active: bool = True

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    brand_name: Optional[str] = None
    manufacturer: Optional[str] = None
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    unit_price: Optional[float] = None
    current_stock: Optional[int] = None
    minimum_stock: Optional[int] = None
    expiry_date: Optional[date] = None
    batch_number: Optional[str] = None
    barcode: Optional[str] = None
    prescription_required: Optional[bool] = None
    active: Optional[bool] = None

class PrescriptionCreate(BaseModel):
    patient_id: int
    prescriber_id: int
    medicine_id: int
    dosage: str
    frequency: str
    duration: str
    quantity_prescribed: int
    instructions: Optional[str] = None

class PrescriptionDispense(BaseModel):
    quantity_dispensed: int
    pharmacist_id: int

# Laborist-specific Pydantic models for operations
class LabTestCreate(BaseModel):
    patient_id: int
    requested_by_id: int
    laborist_id: Optional[int] = None
    test_type: str
    test_name: str
    urgent: bool = False
    scheduled_date: date
    scheduled_time: Optional[str] = None
    instructions: Optional[str] = None

class LabTestUpdate(BaseModel):
    laborist_id: Optional[int] = None
    status: Optional[str] = None
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[str] = None
    instructions: Optional[str] = None
    results: Optional[dict] = None
    notes: Optional[str] = None

class ScanCreate(BaseModel):
    patient_id: int
    requested_by_id: int
    laborist_id: Optional[int] = None
    scan_type: str
    body_part: str
    urgent: bool = False
    scheduled_date: date
    scheduled_time: Optional[str] = None
    instructions: Optional[str] = None

class ScanUpdate(BaseModel):
    laborist_id: Optional[int] = None
    status: Optional[str] = None
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[str] = None
    instructions: Optional[str] = None
    findings: Optional[str] = None
    image_urls: Optional[list] = None
    notes: Optional[str] = None

class LaboristRecordCreate(BaseModel):
    department: str = 'Laboratory'
    shift: str = 'day'
    certifications: Optional[list] = None
    experience_years: int = 0
    specializations: Optional[list] = None
    work_schedule: Optional[dict] = None
    emergency_contact: Optional[dict] = None
    bio: Optional[str] = None

# Medical Records Management Models

class MedicalRecordCreate(BaseModel):
    patient_id: int
    created_by_id: int
    record_type: str
    title: str
    description: Optional[str] = None
    date_of_service: str  # ISO datetime string
    department: str
    facility: str
    chief_complaint: Optional[str] = None
    clinical_summary: Optional[str] = None
    treatment_plan: Optional[str] = None
    follow_up_instructions: Optional[str] = None
    discharge_notes: Optional[str] = None
    confidentiality_level: str = 'normal'

class MedicalRecordUpdate(BaseModel):
    last_updated_by_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    chief_complaint: Optional[str] = None
    clinical_summary: Optional[str] = None
    treatment_plan: Optional[str] = None
    follow_up_instructions: Optional[str] = None
    discharge_notes: Optional[str] = None
    status: Optional[str] = None
    confidentiality_level: Optional[str] = None

class PatientAllergyCreate(BaseModel):
    patient_id: int
    medical_record_id: Optional[int] = None
    allergen: str
    allergen_type: str
    reaction: str
    severity: str
    onset_date: Optional[date] = None
    verified: bool = False
    verified_by_id: Optional[int] = None
    notes: Optional[str] = None

class PatientMedicationCreate(BaseModel):
    patient_id: int
    medical_record_id: Optional[int] = None
    medicine_id: Optional[int] = None
    medication_name: str
    dosage: str
    frequency: str
    route: str
    start_date: date
    end_date: Optional[date] = None
    prescribed_by_id: int
    indication: str
    adherence: Optional[str] = None
    side_effects: Optional[str] = None
    notes: Optional[str] = None

class VitalSignsCreate(BaseModel):
    patient_id: int
    medical_record_id: Optional[int] = None
    recorded_by_id: int
    measurement_date: str  # ISO datetime string
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    heart_rate: Optional[int] = None
    respiratory_rate: Optional[int] = None
    body_temperature: Optional[float] = None
    oxygen_saturation: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    bmi: Optional[float] = None
    pain_score: Optional[int] = None
    blood_glucose: Optional[int] = None
    notes: Optional[str] = None

class DiagnosisCreate(BaseModel):
    patient_id: int
    medical_record_id: Optional[int] = None
    diagnosed_by_id: int
    icd_10_code: Optional[str] = None
    diagnosis_name: str
    diagnosis_type: str
    onset_date: Optional[date] = None
    severity: Optional[str] = None
    clinical_notes: Optional[str] = None

class MedicalProcedureCreate(BaseModel):
    patient_id: int
    medical_record_id: Optional[int] = None
    performed_by_id: int
    cpt_code: Optional[str] = None
    procedure_name: str
    procedure_type: str
    body_site: Optional[str] = None
    procedure_date: str  # ISO datetime string
    duration_minutes: Optional[int] = None
    anesthesia_type: Optional[str] = None
    complications: Optional[str] = None
    outcome: Optional[str] = None
    post_op_instructions: Optional[str] = None
    procedure_notes: Optional[str] = None
    follow_up_required: bool = False

class ClinicalNoteCreate(BaseModel):
    patient_id: int
    medical_record_id: Optional[int] = None
    author_id: int
    note_type: str
    note_date: str  # ISO datetime string
    subjective: Optional[str] = None
    objective: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None
    note_content: str
    priority: str = 'routine'

class FamilyHistoryCreate(BaseModel):
    patient_id: int
    relationship: str
    condition: str
    age_of_onset: Optional[int] = None
    age_at_death: Optional[int] = None
    cause_of_death: Optional[str] = None
    notes: Optional[str] = None

class SocialHistoryCreate(BaseModel):
    patient_id: int
    smoking_status: Optional[str] = None
    smoking_packs_per_day: Optional[float] = None
    smoking_years: Optional[int] = None
    alcohol_use: Optional[str] = None
    alcohol_drinks_per_week: Optional[int] = None
    drug_use: Optional[str] = None
    drug_types: Optional[list] = None
    occupation: Optional[str] = None
    education_level: Optional[str] = None
    marital_status: Optional[str] = None
    living_situation: Optional[str] = None
    exercise_frequency: Optional[str] = None
    diet_type: Optional[str] = None
    insurance_provider: Optional[str] = None
    emergency_contact: Optional[dict] = None
    notes: Optional[str] = None

class MedicalDocumentCreate(BaseModel):
    patient_id: int
    medical_record_id: Optional[int] = None
    uploaded_by_id: int
    document_type: str
    title: str
    description: Optional[str] = None
    file_name: str
    original_filename: str
    file_path: str
    file_type: str
    file_size: int
    mime_type: str
    provider_name: Optional[str] = None
    document_date: Optional[date] = None
    extracted_text: Optional[str] = None
    metadata: Optional[dict] = None
    tags: Optional[list] = None

class LabResultCreate(BaseModel):
    patient_id: int
    medical_record_id: Optional[int] = None
    lab_test_id: Optional[int] = None
    test_name: str
    component_name: str
    result_value: str
    result_unit: Optional[str] = None
    reference_range: Optional[str] = None
    abnormal_flag: Optional[str] = None
    result_status: str = 'final'
    test_date: str  # ISO datetime string
    reported_date: str  # ISO datetime string
    performing_lab: str
    lab_technician: Optional[str] = None
    notes: Optional[str] = None

class ImagingResultCreate(BaseModel):
    patient_id: int
    medical_record_id: Optional[int] = None
    scan_id: Optional[int] = None
    study_type: str
    body_region: str
    contrast_used: bool = False
    contrast_type: Optional[str] = None
    technique: Optional[str] = None
    findings: str
    impression: str
    recommendations: Optional[str] = None
    image_count: int = 0
    image_urls: Optional[list] = None
    study_date: str  # ISO datetime string
    reported_date: str  # ISO datetime string
    radiologist_id: int
    facility: str
    accession_number: Optional[str] = None

# Response models for comprehensive patient data
class PatientSummary(BaseModel):
    id: int
    name: dict
    email: str
    gender: Optional[str]
    birth_date: Optional[date]
    age: Optional[int]
    active_allergies: Optional[list] = []
    current_medications: Optional[list] = []
    active_diagnoses: Optional[list] = []
    last_visit: Optional[str] = None
    emergency_contact: Optional[dict] = None

class ComprehensiveMedicalRecord(BaseModel):
    patient_summary: PatientSummary
    medical_records: list
    allergies: list
    medications: list
    vital_signs: list
    diagnoses: list
    procedures: list
    clinical_notes: list
    family_history: list
    social_history: Optional[dict] = None
    lab_results: list
    imaging_results: list
    documents: list 