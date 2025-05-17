from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import date
from ..models import Appointment, Appointment_Pydantic, AppointmentIn_Pydantic, Patient, Practitioner
from ..auth import get_current_user

router = APIRouter()

@router.post("/appointments/", response_model=Appointment_Pydantic)
async def create_appointment(appointment: AppointmentIn_Pydantic, current_user: dict = Depends(get_current_user)):
    print("Received appointment payload:", appointment)
    # Verify the patient exists
    patient = await Patient.get_or_none(id=appointment.patient)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Verify the doctor exists
    doctor = await Practitioner.get_or_none(id=appointment.doctor)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Check if the time slot is available
    existing_appointment = await Appointment.filter(
        doctor_id=appointment.doctor,
        date=appointment.date,
        time=appointment.time
    ).first()
    
    if existing_appointment:
        raise HTTPException(status_code=400, detail="This time slot is already booked")
    
    # Create the appointment
    appointment_obj = await Appointment.create(**appointment.dict(exclude_unset=True))
    return await Appointment_Pydantic.from_tortoise_orm(appointment_obj)

@router.get("/appointments/", response_model=List[Appointment_Pydantic])
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
    return [await Appointment_Pydantic.from_tortoise_orm(appointment) for appointment in appointments]

@router.get("/appointments/{appointment_id}", response_model=Appointment_Pydantic)
async def get_appointment(appointment_id: int, current_user: dict = Depends(get_current_user)):
    appointment = await Appointment.get_or_none(id=appointment_id).prefetch_related('patient', 'doctor')
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return await Appointment_Pydantic.from_tortoise_orm(appointment)

@router.put("/appointments/{appointment_id}", response_model=Appointment_Pydantic)
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
            doctor_id=appointment_update.doctor,
            date=appointment_update.date,
            time=appointment_update.time
        ).exclude(id=appointment_id).first()
        
        if existing_appointment:
            raise HTTPException(status_code=400, detail="This time slot is already booked")
    
    await appointment.update_from_dict(appointment_update.dict(exclude_unset=True)).save()
    return await Appointment_Pydantic.from_tortoise_orm(appointment)

@router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: int, current_user: dict = Depends(get_current_user)):
    appointment = await Appointment.get_or_none(id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    await appointment.delete()
    return {"message": "Appointment deleted successfully"} 