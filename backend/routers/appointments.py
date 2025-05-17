from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import date
from ..models import Appointment, Appointment_Pydantic, AppointmentIn_Pydantic, Patient, Practitioner, Practitioner_Pydantic, Patient_Pydantic
from ..auth import get_current_user

router = APIRouter()

@router.post("/appointments/", response_model=dict)
async def create_appointment(appointment: AppointmentIn_Pydantic, current_user: dict = Depends(get_current_user)):
    print("Received appointment payload:", appointment)
    # Verify the patient exists
    patient = await Patient.get_or_none(id=appointment.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Verify the doctor exists
    doctor = await Practitioner.get_or_none(id=appointment.doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Check if the time slot is available
    existing_appointment = await Appointment.filter(
        doctor_id=appointment.doctor_id,
        date=appointment.date,
        time=appointment.time
    ).first()
    
    if existing_appointment:
        raise HTTPException(status_code=400, detail="This time slot is already booked")
    
    # Create the appointment
    appointment_obj = await Appointment.create(
        patient=patient,
        doctor=doctor,
        date=appointment.date,
        time=appointment.time,
        duration=appointment.duration,
        status=appointment.status,
        reason=appointment.reason,
        notes=appointment.notes,
        follow_up=appointment.follow_up
    )
    result = await Appointment_Pydantic.from_tortoise_orm(appointment_obj)
    doctor_details = await Practitioner_Pydantic.from_tortoise_orm(doctor)
    patient_details = await Patient_Pydantic.from_tortoise_orm(patient)
    result_dict = result.dict()
    result_dict["doctorDetails"] = doctor_details.dict()
    result_dict["patientDetails"] = patient_details.dict()
    return result_dict

@router.get("/appointments/", response_model=List[dict])
async def get_appointments(
    current_user: dict = Depends(get_current_user),
    patient_id: int = None,
    doctor_id: int = None,
    date: date = None
):
    query = Appointment.all()
    
    if patient_id:
        query = query.filter(patient_id=patient_id)
    if doctor_id:
        query = query.filter(doctor_id=doctor_id)
    if date:
        query = query.filter(date=date)
    
    appointments = await query.prefetch_related('patient', 'doctor')
    results = []
    for appointment in appointments:
        result = await Appointment_Pydantic.from_tortoise_orm(appointment)
        doctor_details = await Practitioner_Pydantic.from_tortoise_orm(await appointment.doctor)
        patient_details = await Patient_Pydantic.from_tortoise_orm(await appointment.patient)
        result_dict = result.dict()
        result_dict["doctorDetails"] = doctor_details.dict()
        result_dict["patientDetails"] = patient_details.dict()
        results.append(result_dict)
    return results

@router.get("/appointments/{appointment_id}", response_model=dict)
async def get_appointment(appointment_id: int, current_user: dict = Depends(get_current_user)):
    appointment = await Appointment.get_or_none(id=appointment_id).prefetch_related('patient', 'doctor')
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    result = await Appointment_Pydantic.from_tortoise_orm(appointment)
    doctor_details = await Practitioner_Pydantic.from_tortoise_orm(await appointment.doctor)
    patient_details = await Patient_Pydantic.from_tortoise_orm(await appointment.patient)
    result_dict = result.dict()
    result_dict["doctorDetails"] = doctor_details.dict()
    result_dict["patientDetails"] = patient_details.dict()
    return result_dict

@router.put("/appointments/{appointment_id}", response_model=dict)
async def update_appointment(
    appointment_id: int,
    appointment_update: AppointmentIn_Pydantic,
    current_user: dict = Depends(get_current_user)
):
    appointment = await Appointment.get_or_none(id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check if the new time slot is available (if date or time is being changed)
    if appointment_update.date != appointment.date or appointment_update.time != appointment.time:
        existing_appointment = await Appointment.filter(
            doctor_id=appointment_update.doctor_id,
            date=appointment_update.date,
            time=appointment_update.time
        ).exclude(id=appointment_id).first()
        
        if existing_appointment:
            raise HTTPException(status_code=400, detail="This time slot is already booked")
    
    await appointment.update_from_dict({
        "patient_id": appointment_update.patient_id,
        "doctor_id": appointment_update.doctor_id,
        "date": appointment_update.date,
        "time": appointment_update.time,
        "duration": appointment_update.duration,
        "status": appointment_update.status,
        "reason": appointment_update.reason,
        "notes": appointment_update.notes,
        "follow_up": appointment_update.follow_up
    }).save()
    result = await Appointment_Pydantic.from_tortoise_orm(appointment)
    doctor_details = await Practitioner_Pydantic.from_tortoise_orm(await appointment.doctor)
    patient_details = await Patient_Pydantic.from_tortoise_orm(await appointment.patient)
    result_dict = result.dict()
    result_dict["doctorDetails"] = doctor_details.dict()
    result_dict["patientDetails"] = patient_details.dict()
    return result_dict

@router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: int, current_user: dict = Depends(get_current_user)):
    appointment = await Appointment.get_or_none(id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    await appointment.delete()
    return {"message": "Appointment deleted successfully"} 