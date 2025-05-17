from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, date
from ..models import Appointment, Patient, Practitioner, Appointment_Pydantic, AppointmentIn
from tortoise.exceptions import DoesNotExist
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    # Try to find user in both Patient and Practitioner models
    patient = await Patient.filter(email=token_data.email).first()
    if patient:
        return patient
    
    practitioner = await Practitioner.filter(email=token_data.email).first()
    if practitioner:
        return practitioner
    
    raise credentials_exception

@router.post("/appointments/", response_model=Appointment_Pydantic)
async def create_appointment(appointment: AppointmentIn, current_user = Depends(get_current_user)):
    # Verify patient exists
    try:
        patient = await Patient.get(id=appointment.patient)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Verify doctor exists
    try:
        doctor = await Practitioner.get(id=appointment.doctor)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Check if the time slot is available
    existing_appointment = await Appointment.filter(
        doctor=doctor,
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
    
    return await Appointment_Pydantic.from_tortoise_orm(appointment_obj)

@router.get("/appointments/", response_model=List[Appointment_Pydantic])
async def get_appointments(current_user = Depends(get_current_user)):
    # If user is a patient, return their appointments
    if isinstance(current_user, Patient):
        appointments = await Appointment.filter(patient=current_user)
    # If user is a doctor, return their appointments
    elif isinstance(current_user, Practitioner):
        appointments = await Appointment.filter(doctor=current_user)
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view appointments")
    
    return [await Appointment_Pydantic.from_tortoise_orm(appointment) for appointment in appointments]

@router.get("/appointments/{appointment_id}", response_model=Appointment_Pydantic)
async def get_appointment(appointment_id: int, current_user = Depends(get_current_user)):
    try:
        appointment = await Appointment.get(id=appointment_id)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check if user has permission to view this appointment
    if isinstance(current_user, Patient) and appointment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this appointment")
    if isinstance(current_user, Practitioner) and appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this appointment")
    
    return await Appointment_Pydantic.from_tortoise_orm(appointment)

@router.put("/appointments/{appointment_id}", response_model=Appointment_Pydantic)
async def update_appointment(
    appointment_id: int,
    appointment_update: AppointmentIn,
    current_user = Depends(get_current_user)
):
    try:
        appointment = await Appointment.get(id=appointment_id)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check if user has permission to update this appointment
    if isinstance(current_user, Patient) and appointment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this appointment")
    if isinstance(current_user, Practitioner) and appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this appointment")
    
    # Update appointment fields
    appointment.date = appointment_update.date
    appointment.time = appointment_update.time
    appointment.duration = appointment_update.duration
    appointment.status = appointment_update.status
    appointment.reason = appointment_update.reason
    appointment.notes = appointment_update.notes
    appointment.follow_up = appointment_update.follow_up
    
    await appointment.save()
    return await Appointment_Pydantic.from_tortoise_orm(appointment)

@router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: int, current_user = Depends(get_current_user)):
    try:
        appointment = await Appointment.get(id=appointment_id)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check if user has permission to delete this appointment
    if isinstance(current_user, Patient) and appointment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this appointment")
    if isinstance(current_user, Practitioner) and appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this appointment")
    
    await appointment.delete()
    return {"message": "Appointment deleted successfully"} 