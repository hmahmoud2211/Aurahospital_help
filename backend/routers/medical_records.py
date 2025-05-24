from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime, date
import os
import uuid

from backend.models import (
    # Models
    Patient, Practitioner, MedicalRecord, PatientAllergy, PatientMedication, 
    VitalSigns, Diagnosis, MedicalProcedure, ClinicalNote, FamilyHistory, 
    SocialHistory, MedicalDocument, LabResult, ImagingResult,
    
    # Pydantic models
    MedicalRecord_Pydantic, MedicalRecordCreate, MedicalRecordUpdate,
    PatientAllergy_Pydantic, PatientAllergyCreate,
    PatientMedication_Pydantic, PatientMedicationCreate,
    VitalSigns_Pydantic, VitalSignsCreate,
    Diagnosis_Pydantic, DiagnosisCreate,
    MedicalProcedure_Pydantic, MedicalProcedureCreate,
    ClinicalNote_Pydantic, ClinicalNoteCreate,
    FamilyHistory_Pydantic, FamilyHistoryCreate,
    SocialHistory_Pydantic, SocialHistoryCreate,
    MedicalDocument_Pydantic, MedicalDocumentCreate,
    LabResult_Pydantic, LabResultCreate,
    ImagingResult_Pydantic, ImagingResultCreate,
    PatientSummary, ComprehensiveMedicalRecord
)
from backend.auth import get_current_practitioner

router = APIRouter()

# Medical Records Management

@router.post("/medical-records", response_model=MedicalRecord_Pydantic)
async def create_medical_record(
    record: MedicalRecordCreate,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Create a new medical record"""
    try:
        # Verify patient exists
        patient = await Patient.get_or_none(id=record.patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Verify creator exists
        creator = await Practitioner.get_or_none(id=record.created_by_id)
        if not creator:
            raise HTTPException(status_code=404, detail="Practitioner not found")
        
        # Create medical record
        medical_record = await MedicalRecord.create(
            patient=patient,
            created_by=creator,
            record_type=record.record_type,
            title=record.title,
            description=record.description,
            date_of_service=datetime.fromisoformat(record.date_of_service),
            department=record.department,
            facility=record.facility,
            chief_complaint=record.chief_complaint,
            clinical_summary=record.clinical_summary,
            treatment_plan=record.treatment_plan,
            follow_up_instructions=record.follow_up_instructions,
            discharge_notes=record.discharge_notes,
            confidentiality_level=record.confidentiality_level
        )
        
        return await MedicalRecord_Pydantic.from_tortoise_orm(medical_record)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating medical record: {str(e)}")

@router.get("/medical-records/{record_id}", response_model=MedicalRecord_Pydantic)
async def get_medical_record(
    record_id: int,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Get a specific medical record"""
    medical_record = await MedicalRecord.get_or_none(id=record_id)
    if not medical_record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    return await MedicalRecord_Pydantic.from_tortoise_orm(medical_record)

@router.put("/medical-records/{record_id}", response_model=MedicalRecord_Pydantic)
async def update_medical_record(
    record_id: int,
    update_data: MedicalRecordUpdate,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Update a medical record"""
    medical_record = await MedicalRecord.get_or_none(id=record_id)
    if not medical_record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    # Update fields
    if update_data.last_updated_by_id:
        updater = await Practitioner.get_or_none(id=update_data.last_updated_by_id)
        if updater:
            medical_record.last_updated_by = updater
    
    update_dict = update_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        if field != 'last_updated_by_id' and hasattr(medical_record, field):
            setattr(medical_record, field, value)
    
    await medical_record.save()
    return await MedicalRecord_Pydantic.from_tortoise_orm(medical_record)

# Patient Allergies

@router.post("/allergies", response_model=PatientAllergy_Pydantic)
async def create_allergy(
    allergy: PatientAllergyCreate,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Create a new patient allergy record"""
    try:
        patient = await Patient.get_or_none(id=allergy.patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        medical_record = None
        if allergy.medical_record_id:
            medical_record = await MedicalRecord.get_or_none(id=allergy.medical_record_id)
        
        verified_by = None
        if allergy.verified_by_id:
            verified_by = await Practitioner.get_or_none(id=allergy.verified_by_id)
        
        new_allergy = await PatientAllergy.create(
            patient=patient,
            medical_record=medical_record,
            allergen=allergy.allergen,
            allergen_type=allergy.allergen_type,
            reaction=allergy.reaction,
            severity=allergy.severity,
            onset_date=allergy.onset_date,
            verified=allergy.verified,
            verified_by=verified_by,
            notes=allergy.notes
        )
        
        return await PatientAllergy_Pydantic.from_tortoise_orm(new_allergy)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating allergy: {str(e)}")

@router.get("/patients/{patient_id}/allergies", response_model=List[PatientAllergy_Pydantic])
async def get_patient_allergies(
    patient_id: int,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Get all allergies for a patient"""
    patient = await Patient.get_or_none(id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    allergies = await PatientAllergy.filter(patient_id=patient_id, status="active")
    return [await PatientAllergy_Pydantic.from_tortoise_orm(allergy) for allergy in allergies]

# Patient Medications

@router.post("/medications", response_model=PatientMedication_Pydantic)
async def create_medication(
    medication: PatientMedicationCreate,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Create a new patient medication record"""
    try:
        patient = await Patient.get_or_none(id=medication.patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        prescribed_by = await Practitioner.get_or_none(id=medication.prescribed_by_id)
        if not prescribed_by:
            raise HTTPException(status_code=404, detail="Prescriber not found")
        
        medical_record = None
        if medication.medical_record_id:
            medical_record = await MedicalRecord.get_or_none(id=medication.medical_record_id)
        
        new_medication = await PatientMedication.create(
            patient=patient,
            medical_record=medical_record,
            medication_name=medication.medication_name,
            dosage=medication.dosage,
            frequency=medication.frequency,
            route=medication.route,
            start_date=medication.start_date,
            end_date=medication.end_date,
            prescribed_by=prescribed_by,
            indication=medication.indication,
            adherence=medication.adherence,
            side_effects=medication.side_effects,
            notes=medication.notes
        )
        
        return await PatientMedication_Pydantic.from_tortoise_orm(new_medication)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating medication: {str(e)}")

@router.get("/patients/{patient_id}/medications", response_model=List[PatientMedication_Pydantic])
async def get_patient_medications(
    patient_id: int,
    active_only: bool = True,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Get all medications for a patient"""
    patient = await Patient.get_or_none(id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    query = PatientMedication.filter(patient_id=patient_id)
    if active_only:
        query = query.filter(status="active")
    
    medications = await query
    return [await PatientMedication_Pydantic.from_tortoise_orm(med) for med in medications]

# Vital Signs

@router.post("/vital-signs", response_model=VitalSigns_Pydantic)
async def create_vital_signs(
    vitals: VitalSignsCreate,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Record vital signs for a patient"""
    try:
        patient = await Patient.get_or_none(id=vitals.patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        recorded_by = await Practitioner.get_or_none(id=vitals.recorded_by_id)
        if not recorded_by:
            raise HTTPException(status_code=404, detail="Practitioner not found")
        
        medical_record = None
        if vitals.medical_record_id:
            medical_record = await MedicalRecord.get_or_none(id=vitals.medical_record_id)
        
        # Calculate BMI if height and weight provided
        bmi = None
        if vitals.weight and vitals.height:
            height_m = vitals.height / 100  # Convert cm to meters
            bmi = round(vitals.weight / (height_m * height_m), 1)
        
        new_vitals = await VitalSigns.create(
            patient=patient,
            medical_record=medical_record,
            recorded_by=recorded_by,
            measurement_date=datetime.fromisoformat(vitals.measurement_date),
            systolic_bp=vitals.systolic_bp,
            diastolic_bp=vitals.diastolic_bp,
            heart_rate=vitals.heart_rate,
            respiratory_rate=vitals.respiratory_rate,
            body_temperature=vitals.body_temperature,
            oxygen_saturation=vitals.oxygen_saturation,
            weight=vitals.weight,
            height=vitals.height,
            bmi=bmi or vitals.bmi,
            pain_score=vitals.pain_score,
            blood_glucose=vitals.blood_glucose,
            notes=vitals.notes
        )
        
        return await VitalSigns_Pydantic.from_tortoise_orm(new_vitals)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recording vital signs: {str(e)}")

@router.get("/patients/{patient_id}/vital-signs", response_model=List[VitalSigns_Pydantic])
async def get_patient_vital_signs(
    patient_id: int,
    limit: int = 10,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Get vital signs for a patient"""
    patient = await Patient.get_or_none(id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    vitals = await VitalSigns.filter(patient_id=patient_id).order_by('-measurement_date').limit(limit)
    return [await VitalSigns_Pydantic.from_tortoise_orm(vital) for vital in vitals]

# Diagnoses

@router.post("/diagnoses", response_model=Diagnosis_Pydantic)
async def create_diagnosis(
    diagnosis: DiagnosisCreate,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Create a new diagnosis for a patient"""
    try:
        patient = await Patient.get_or_none(id=diagnosis.patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        diagnosed_by = await Practitioner.get_or_none(id=diagnosis.diagnosed_by_id)
        if not diagnosed_by:
            raise HTTPException(status_code=404, detail="Practitioner not found")
        
        medical_record = None
        if diagnosis.medical_record_id:
            medical_record = await MedicalRecord.get_or_none(id=diagnosis.medical_record_id)
        
        new_diagnosis = await Diagnosis.create(
            patient=patient,
            medical_record=medical_record,
            diagnosed_by=diagnosed_by,
            icd_10_code=diagnosis.icd_10_code,
            diagnosis_name=diagnosis.diagnosis_name,
            diagnosis_type=diagnosis.diagnosis_type,
            onset_date=diagnosis.onset_date,
            severity=diagnosis.severity,
            clinical_notes=diagnosis.clinical_notes
        )
        
        return await Diagnosis_Pydantic.from_tortoise_orm(new_diagnosis)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating diagnosis: {str(e)}")

@router.get("/patients/{patient_id}/diagnoses", response_model=List[Diagnosis_Pydantic])
async def get_patient_diagnoses(
    patient_id: int,
    active_only: bool = True,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Get all diagnoses for a patient"""
    patient = await Patient.get_or_none(id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    query = Diagnosis.filter(patient_id=patient_id)
    if active_only:
        query = query.filter(status="active")
    
    diagnoses = await query.order_by('-created_at')
    return [await Diagnosis_Pydantic.from_tortoise_orm(dx) for dx in diagnoses]

# Clinical Notes

@router.post("/clinical-notes", response_model=ClinicalNote_Pydantic)
async def create_clinical_note(
    note: ClinicalNoteCreate,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Create a new clinical note"""
    try:
        patient = await Patient.get_or_none(id=note.patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        author = await Practitioner.get_or_none(id=note.author_id)
        if not author:
            raise HTTPException(status_code=404, detail="Author not found")
        
        medical_record = None
        if note.medical_record_id:
            medical_record = await MedicalRecord.get_or_none(id=note.medical_record_id)
        
        new_note = await ClinicalNote.create(
            patient=patient,
            medical_record=medical_record,
            author=author,
            note_type=note.note_type,
            note_date=datetime.fromisoformat(note.note_date),
            subjective=note.subjective,
            objective=note.objective,
            assessment=note.assessment,
            plan=note.plan,
            note_content=note.note_content,
            priority=note.priority
        )
        
        return await ClinicalNote_Pydantic.from_tortoise_orm(new_note)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating clinical note: {str(e)}")

@router.get("/patients/{patient_id}/clinical-notes", response_model=List[ClinicalNote_Pydantic])
async def get_patient_clinical_notes(
    patient_id: int,
    note_type: Optional[str] = None,
    limit: int = 20,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Get clinical notes for a patient"""
    patient = await Patient.get_or_none(id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    query = ClinicalNote.filter(patient_id=patient_id)
    if note_type:
        query = query.filter(note_type=note_type)
    
    notes = await query.order_by('-note_date').limit(limit)
    return [await ClinicalNote_Pydantic.from_tortoise_orm(note) for note in notes]

# Comprehensive Patient Medical Record

@router.get("/patients/{patient_id}/comprehensive", response_model=ComprehensiveMedicalRecord)
async def get_comprehensive_medical_record(
    patient_id: int,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Get comprehensive medical record for a patient"""
    try:
        patient = await Patient.get_or_none(id=patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Calculate age
        age = None
        if patient.birth_date:
            today = date.today()
            age = today.year - patient.birth_date.year - ((today.month, today.day) < (patient.birth_date.month, patient.birth_date.day))
        
        # Get all related data
        medical_records = await MedicalRecord.filter(patient_id=patient_id).order_by('-date_of_service')
        allergies = await PatientAllergy.filter(patient_id=patient_id, status="active")
        medications = await PatientMedication.filter(patient_id=patient_id, status="active")
        vital_signs = await VitalSigns.filter(patient_id=patient_id).order_by('-measurement_date').limit(10)
        diagnoses = await Diagnosis.filter(patient_id=patient_id, status="active")
        procedures = await MedicalProcedure.filter(patient_id=patient_id).order_by('-procedure_date')
        clinical_notes = await ClinicalNote.filter(patient_id=patient_id).order_by('-note_date').limit(20)
        family_history = await FamilyHistory.filter(patient_id=patient_id)
        social_history = await SocialHistory.get_or_none(patient_id=patient_id)
        lab_results = await LabResult.filter(patient_id=patient_id).order_by('-test_date').limit(20)
        imaging_results = await ImagingResult.filter(patient_id=patient_id).order_by('-study_date').limit(20)
        documents = await MedicalDocument.filter(patient_id=patient_id, status="active").order_by('-created_at')
        
        # Get last visit date
        last_visit = None
        if medical_records:
            last_visit = medical_records[0].date_of_service.isoformat()
        
        # Build patient summary
        patient_summary = PatientSummary(
            id=patient.id,
            name=patient.name,
            email=patient.email,
            gender=patient.gender,
            birth_date=patient.birth_date,
            age=age,
            active_allergies=[allergy.allergen for allergy in allergies],
            current_medications=[med.medication_name for med in medications],
            active_diagnoses=[dx.diagnosis_name for dx in diagnoses],
            last_visit=last_visit,
            emergency_contact=social_history.emergency_contact if social_history else None
        )
        
        # Convert to Pydantic objects
        comprehensive_record = ComprehensiveMedicalRecord(
            patient_summary=patient_summary,
            medical_records=[await MedicalRecord_Pydantic.from_tortoise_orm(rec) for rec in medical_records],
            allergies=[await PatientAllergy_Pydantic.from_tortoise_orm(allergy) for allergy in allergies],
            medications=[await PatientMedication_Pydantic.from_tortoise_orm(med) for med in medications],
            vital_signs=[await VitalSigns_Pydantic.from_tortoise_orm(vital) for vital in vital_signs],
            diagnoses=[await Diagnosis_Pydantic.from_tortoise_orm(dx) for dx in diagnoses],
            procedures=[await MedicalProcedure_Pydantic.from_tortoise_orm(proc) for proc in procedures],
            clinical_notes=[await ClinicalNote_Pydantic.from_tortoise_orm(note) for note in clinical_notes],
            family_history=[await FamilyHistory_Pydantic.from_tortoise_orm(fh) for fh in family_history],
            social_history=await SocialHistory_Pydantic.from_tortoise_orm(social_history) if social_history else None,
            lab_results=[await LabResult_Pydantic.from_tortoise_orm(result) for result in lab_results],
            imaging_results=[await ImagingResult_Pydantic.from_tortoise_orm(result) for result in imaging_results],
            documents=[await MedicalDocument_Pydantic.from_tortoise_orm(doc) for doc in documents]
        )
        
        return comprehensive_record
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching comprehensive medical record: {str(e)}")

# Document Upload with OCR integration

@router.post("/documents/upload", response_model=MedicalDocument_Pydantic)
async def upload_medical_document(
    patient_id: int = Form(...),
    document_type: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    provider_name: Optional[str] = Form(None),
    document_date: Optional[str] = Form(None),  # ISO date string
    extracted_text: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),  # JSON string of tags
    file: UploadFile = File(...),
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Upload a medical document with OCR support"""
    try:
        # Verify patient exists
        patient = await Patient.get_or_none(id=patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Create upload directory if it doesn't exist
        upload_dir = "uploads/medical_documents"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Parse tags if provided
        tags_list = []
        if tags:
            import json
            try:
                tags_list = json.loads(tags)
            except:
                tags_list = [tags]  # Single tag as string
        
        # Parse document date
        doc_date = None
        if document_date:
            try:
                doc_date = datetime.fromisoformat(document_date).date()
            except:
                pass
        
        # Create document record
        document = await MedicalDocument.create(
            patient=patient,
            uploaded_by=current_practitioner,
            document_type=document_type,
            title=title,
            description=description,
            file_name=unique_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_type=file_extension.lstrip('.'),
            file_size=len(content),
            mime_type=file.content_type,
            provider_name=provider_name,
            document_date=doc_date,
            extracted_text=extracted_text,
            tags=tags_list
        )
        
        return await MedicalDocument_Pydantic.from_tortoise_orm(document)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")

@router.get("/patients/{patient_id}/documents", response_model=List[MedicalDocument_Pydantic])
async def get_patient_documents(
    patient_id: int,
    document_type: Optional[str] = None,
    current_practitioner: Practitioner = Depends(get_current_practitioner)
):
    """Get all documents for a patient"""
    patient = await Patient.get_or_none(id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    query = MedicalDocument.filter(patient_id=patient_id, status="active")
    if document_type:
        query = query.filter(document_type=document_type)
    
    documents = await query.order_by('-created_at')
    return [await MedicalDocument_Pydantic.from_tortoise_orm(doc) for doc in documents] 