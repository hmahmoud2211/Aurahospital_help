from tortoise import fields, models
from tortoise.contrib.pydantic import pydantic_model_creator
from datetime import date
from typing import Optional
from pydantic import BaseModel

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

# Create Pydantic models for API serialization
Patient_Pydantic = pydantic_model_creator(Patient, name="Patient")
PatientIn_Pydantic = pydantic_model_creator(Patient, name="PatientIn", exclude_readonly=True)

Practitioner_Pydantic = pydantic_model_creator(Practitioner, name="Practitioner")
PractitionerIn_Pydantic = pydantic_model_creator(Practitioner, name="PractitionerIn", exclude_readonly=True)

Appointment_Pydantic = pydantic_model_creator(Appointment, name="Appointment")

# Custom Pydantic model for appointment input
class AppointmentIn(BaseModel):
    date: date
    time: str
    duration: int = 30
    status: str = 'scheduled'
    reason: str
    patient: int
    doctor: int
    notes: Optional[str] = None
    follow_up: bool = False 