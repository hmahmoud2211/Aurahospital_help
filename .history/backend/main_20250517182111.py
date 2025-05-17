from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from backend.auth import router as auth_router
from backend.models import Patient, Practitioner
from typing import List, Dict, Any
from .routers import appointments

app = FastAPI(
    title="Aura Hospital API",
    description="FHIR-compliant Healthcare API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(appointments.router, prefix="/api", tags=["appointments"])

# Database configuration
TORTOISE_ORM = {
    "connections": {
        "default": "sqlite://db.sqlite3"
    },
    "apps": {
        "models": {
            "models": ["backend.models", "aerich.models"],
            "default_connection": "default",
        }
    }
}

# Register Tortoise ORM
register_tortoise(
    app,
    config=TORTOISE_ORM,
    generate_schemas=True,
    add_exception_handlers=True,
)

@app.get("/")
async def root():
    return {"message": "Welcome to Aura Hospital API"}

# Patient endpoints
@app.post("/patients/")
async def create_patient(patient_data: Dict[str, Any]):
    patient = await Patient.create(**patient_data)
    return await patient

@app.get("/patients/", response_model=List[Dict[str, Any]])
async def get_patients():
    patients = await Patient.all()
    return [await patient for patient in patients]

@app.get("/patients/{patient_id}", response_model=Dict[str, Any])
async def get_patient(patient_id: int):
    patient = await Patient.get_or_none(id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return await patient

# Practitioner endpoints
@app.post("/practitioners/")
async def create_practitioner(practitioner_data: Dict[str, Any]):
    practitioner = await Practitioner.create(**practitioner_data)
    return await practitioner

@app.get("/practitioners/", response_model=List[Dict[str, Any]])
async def get_practitioners():
    practitioners = await Practitioner.all()
    return [await practitioner for practitioner in practitioners]

@app.get("/practitioners/{practitioner_id}", response_model=Dict[str, Any])
async def get_practitioner(practitioner_id: int):
    practitioner = await Practitioner.get_or_none(id=practitioner_id)
    if not practitioner:
        raise HTTPException(status_code=404, detail="Practitioner not found")
    return await practitioner

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
 