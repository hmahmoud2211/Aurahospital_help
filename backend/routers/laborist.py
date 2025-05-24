from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from datetime import date, datetime
import os
import uuid
import shutil
from ..models import (
    LabTest, Scan, MedicalUpload, LaboristRecord, Appointment, Patient, Practitioner,
    LabTest_Pydantic, Scan_Pydantic, MedicalUpload_Pydantic, LaboristRecord_Pydantic,
    LabTestCreate, LabTestUpdate, ScanCreate, ScanUpdate, LaboristRecordCreate,
    Appointment_Pydantic, Patient_Pydantic, Practitioner_Pydantic
)
from ..auth import get_current_user

router = APIRouter()

# Ensure uploads directory exists
UPLOAD_DIR = "uploads/medical"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Lab Tests Endpoints
@router.get("/lab-tests/", response_model=List[dict])
async def get_lab_tests(
    current_user: dict = Depends(get_current_user),
    patient_id: int = None,
    status: str = None,
    urgent_only: bool = False
):
    """Get lab tests for laborist view"""
    if current_user["role"] not in ["laborist", "practitioner"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = LabTest.all()
    
    # If laborist, show only their assigned tests
    if current_user["role"] == "laborist":
        query = query.filter(laborist_id=current_user["id"])
    
    if patient_id:
        query = query.filter(patient_id=patient_id)
    if status:
        query = query.filter(status=status)
    if urgent_only:
        query = query.filter(urgent=True)
    
    lab_tests = await query.prefetch_related('patient', 'laborist', 'requested_by')
    results = []
    
    for lab_test in lab_tests:
        result = await LabTest_Pydantic.from_tortoise_orm(lab_test)
        patient_details = await Patient_Pydantic.from_tortoise_orm(await lab_test.patient)
        requested_by_details = await Practitioner_Pydantic.from_tortoise_orm(await lab_test.requested_by)
        
        result_dict = result.dict()
        result_dict["patientDetails"] = patient_details.dict()
        result_dict["requestedByDetails"] = requested_by_details.dict()
        
        if lab_test.laborist:
            laborist_details = await Practitioner_Pydantic.from_tortoise_orm(await lab_test.laborist)
            result_dict["laboristDetails"] = laborist_details.dict()
        
        results.append(result_dict)
    
    return results

@router.put("/lab-tests/{test_id}")
async def update_lab_test(
    test_id: int,
    test_update: LabTestUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update lab test (assign laborist, update status, add results)"""
    if current_user["role"] not in ["laborist", "practitioner"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    lab_test = await LabTest.get_or_none(id=test_id)
    if not lab_test:
        raise HTTPException(status_code=404, detail="Lab test not found")
    
    # If laborist, they can only update their own tests or assign themselves
    if current_user["role"] == "laborist":
        if lab_test.laborist_id and lab_test.laborist_id != current_user["id"]:
            raise HTTPException(status_code=403, detail="Can only update your own tests")
        
        # Auto-assign to current laborist if not assigned
        if not lab_test.laborist_id:
            test_update.laborist_id = current_user["id"]
    
    update_data = test_update.dict(exclude_unset=True)
    await lab_test.update_from_dict(update_data).save()
    
    result = await LabTest_Pydantic.from_tortoise_orm(lab_test)
    return result.dict()

# Scans Endpoints
@router.get("/scans/", response_model=List[dict])
async def get_scans(
    current_user: dict = Depends(get_current_user),
    patient_id: int = None,
    status: str = None,
    urgent_only: bool = False
):
    """Get scans for laborist view"""
    if current_user["role"] not in ["laborist", "practitioner"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = Scan.all()
    
    # If laborist, show only their assigned scans
    if current_user["role"] == "laborist":
        query = query.filter(laborist_id=current_user["id"])
    
    if patient_id:
        query = query.filter(patient_id=patient_id)
    if status:
        query = query.filter(status=status)
    if urgent_only:
        query = query.filter(urgent=True)
    
    scans = await query.prefetch_related('patient', 'laborist', 'requested_by')
    results = []
    
    for scan in scans:
        result = await Scan_Pydantic.from_tortoise_orm(scan)
        patient_details = await Patient_Pydantic.from_tortoise_orm(await scan.patient)
        requested_by_details = await Practitioner_Pydantic.from_tortoise_orm(await scan.requested_by)
        
        result_dict = result.dict()
        result_dict["patientDetails"] = patient_details.dict()
        result_dict["requestedByDetails"] = requested_by_details.dict()
        
        if scan.laborist:
            laborist_details = await Practitioner_Pydantic.from_tortoise_orm(await scan.laborist)
            result_dict["laboristDetails"] = laborist_details.dict()
        
        results.append(result_dict)
    
    return results

@router.put("/scans/{scan_id}")
async def update_scan(
    scan_id: int,
    scan_update: ScanUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update scan (assign laborist, update status, add findings)"""
    if current_user["role"] not in ["laborist", "practitioner"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    scan = await Scan.get_or_none(id=scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # If laborist, they can only update their own scans or assign themselves
    if current_user["role"] == "laborist":
        if scan.laborist_id and scan.laborist_id != current_user["id"]:
            raise HTTPException(status_code=403, detail="Can only update your own scans")
        
        # Auto-assign to current laborist if not assigned
        if not scan.laborist_id:
            scan_update.laborist_id = current_user["id"]
    
    update_data = scan_update.dict(exclude_unset=True)
    await scan.update_from_dict(update_data).save()
    
    result = await Scan_Pydantic.from_tortoise_orm(scan)
    return result.dict()

# File Upload Endpoints
@router.post("/upload/")
async def upload_medical_file(
    file: UploadFile = File(...),
    patient_id: int = Form(...),
    lab_test_id: int = Form(None),
    scan_id: int = Form(None),
    description: str = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """Upload medical files (lab results, scan images, etc.)"""
    if current_user["role"] not in ["laborist", "practitioner"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Verify patient exists
    patient = await Patient.get_or_none(id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Verify lab test or scan exists if provided
    if lab_test_id:
        lab_test = await LabTest.get_or_none(id=lab_test_id)
        if not lab_test:
            raise HTTPException(status_code=404, detail="Lab test not found")
    
    if scan_id:
        scan = await Scan.get_or_none(id=scan_id)
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Create database record
    medical_upload = await MedicalUpload.create(
        patient_id=patient_id,
        uploaded_by_id=current_user["id"],
        lab_test_id=lab_test_id,
        scan_id=scan_id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        file_size=file.size,
        description=description
    )
    
    result = await MedicalUpload_Pydantic.from_tortoise_orm(medical_upload)
    return result.dict()

@router.get("/uploads/", response_model=List[dict])
async def get_medical_uploads(
    current_user: dict = Depends(get_current_user),
    patient_id: int = None,
    lab_test_id: int = None,
    scan_id: int = None
):
    """Get medical uploads"""
    if current_user["role"] not in ["laborist", "practitioner", "patient"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = MedicalUpload.all()
    
    if patient_id:
        query = query.filter(patient_id=patient_id)
    if lab_test_id:
        query = query.filter(lab_test_id=lab_test_id)
    if scan_id:
        query = query.filter(scan_id=scan_id)
    
    uploads = await query.prefetch_related('patient', 'uploaded_by', 'lab_test', 'scan')
    results = []
    
    for upload in uploads:
        result = await MedicalUpload_Pydantic.from_tortoise_orm(upload)
        result_dict = result.dict()
        
        # Add related details
        patient_details = await Patient_Pydantic.from_tortoise_orm(await upload.patient)
        uploaded_by_details = await Practitioner_Pydantic.from_tortoise_orm(await upload.uploaded_by)
        
        result_dict["patientDetails"] = patient_details.dict()
        result_dict["uploadedByDetails"] = uploaded_by_details.dict()
        
        results.append(result_dict)
    
    return results

# Laborist Appointments
@router.get("/appointments/", response_model=List[dict])
async def get_laborist_appointments(
    current_user: dict = Depends(get_current_user),
    date: date = None
):
    """Get appointments for laborist"""
    if current_user["role"] != "laborist":
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = Appointment.filter(doctor_id=current_user["id"])
    
    if date:
        query = query.filter(date=date)
    
    appointments = await query.prefetch_related('patient', 'doctor')
    results = []
    
    for appointment in appointments:
        result = await Appointment_Pydantic.from_tortoise_orm(appointment)
        patient_details = await Patient_Pydantic.from_tortoise_orm(await appointment.patient)
        doctor_details = await Practitioner_Pydantic.from_tortoise_orm(await appointment.doctor)
        
        result_dict = result.dict()
        result_dict["patientDetails"] = patient_details.dict()
        result_dict["doctorDetails"] = doctor_details.dict()
        
        results.append(result_dict)
    
    return results

# Laborist Record Management
@router.get("/record/", response_model=dict)
async def get_laborist_record(current_user: dict = Depends(get_current_user)):
    """Get laborist's own record"""
    if current_user["role"] != "laborist":
        raise HTTPException(status_code=403, detail="Access denied")
    
    record = await LaboristRecord.get_or_none(laborist_id=current_user["id"])
    if not record:
        # Create default record if doesn't exist
        record = await LaboristRecord.create(laborist_id=current_user["id"])
    
    result = await LaboristRecord_Pydantic.from_tortoise_orm(record)
    return result.dict()

@router.put("/record/")
async def update_laborist_record(
    record_update: LaboristRecordCreate,
    current_user: dict = Depends(get_current_user)
):
    """Update laborist's own record"""
    if current_user["role"] != "laborist":
        raise HTTPException(status_code=403, detail="Access denied")
    
    record = await LaboristRecord.get_or_none(laborist_id=current_user["id"])
    if not record:
        record = await LaboristRecord.create(**record_update.dict())
    else:
        update_data = record_update.dict(exclude_unset=True)
        await record.update_from_dict(update_data).save()
    
    result = await LaboristRecord_Pydantic.from_tortoise_orm(record)
    return result.dict()

# Patient Search for Laborist
@router.get("/patients/search/")
async def search_patients(
    query: str,
    current_user: dict = Depends(get_current_user)
):
    """Search patients for laborist"""
    if current_user["role"] != "laborist":
        raise HTTPException(status_code=403, detail="Access denied")
    
    patients = await Patient.filter(
        email__icontains=query
    ).limit(10)
    
    results = []
    for patient in patients:
        result = await Patient_Pydantic.from_tortoise_orm(patient)
        results.append(result.dict())
    
    return results 