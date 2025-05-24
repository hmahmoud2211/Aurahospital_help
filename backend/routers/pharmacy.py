from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import date, datetime
from ..models import (
    Medicine, Prescription, Patient, Practitioner,
    Medicine_Pydantic, MedicineCreate, MedicineUpdate,
    Prescription_Pydantic, PrescriptionCreate, PrescriptionDispense
)
from ..auth import get_current_user

router = APIRouter()

# Medicine Management
@router.get("/medicines/", response_model=List[dict])
async def get_medicines(
    current_user: dict = Depends(get_current_user),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    low_stock: bool = Query(False),
    expired: bool = Query(False)
):
    """Get all medicines with optional filtering"""
    query = Medicine.all()
    
    if category:
        query = query.filter(category=category)
    
    if search:
        query = query.filter(name__icontains=search)
    
    if low_stock:
        query = query.filter(current_stock__lte=Medicine.minimum_stock)
    
    if expired:
        query = query.filter(expiry_date__lt=date.today())
    
    medicines = await query
    results = []
    
    for medicine in medicines:
        medicine_data = await Medicine_Pydantic.from_tortoise_orm(medicine)
        medicine_dict = medicine_data.dict()
        # Convert Decimal to float for JSON serialization
        medicine_dict["unit_price"] = float(medicine_dict["unit_price"])
        results.append(medicine_dict)
    
    return results

@router.get("/medicines/{medicine_id}", response_model=dict)
async def get_medicine(medicine_id: int, current_user: dict = Depends(get_current_user)):
    """Get a specific medicine by ID"""
    medicine = await Medicine.get_or_none(id=medicine_id)
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    medicine_data = await Medicine_Pydantic.from_tortoise_orm(medicine)
    medicine_dict = medicine_data.dict()
    medicine_dict["unit_price"] = float(medicine_dict["unit_price"])
    return medicine_dict

@router.post("/medicines/", response_model=dict)
async def create_medicine(
    medicine_data: MedicineCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new medicine (pharmacist only)"""
    if current_user.get("role") != "pharmacist":
        raise HTTPException(status_code=403, detail="Only pharmacists can add medicines")
    
    medicine = await Medicine.create(**medicine_data.dict())
    medicine_pydantic = await Medicine_Pydantic.from_tortoise_orm(medicine)
    medicine_dict = medicine_pydantic.dict()
    medicine_dict["unit_price"] = float(medicine_dict["unit_price"])
    return medicine_dict

@router.put("/medicines/{medicine_id}", response_model=dict)
async def update_medicine(
    medicine_id: int,
    medicine_data: MedicineUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update medicine information (pharmacist only)"""
    if current_user.get("role") != "pharmacist":
        raise HTTPException(status_code=403, detail="Only pharmacists can update medicines")
    
    medicine = await Medicine.get_or_none(id=medicine_id)
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    update_data = medicine_data.dict(exclude_unset=True)
    if update_data:
        await medicine.update_from_dict(update_data).save()
    
    medicine_pydantic = await Medicine_Pydantic.from_tortoise_orm(medicine)
    medicine_dict = medicine_pydantic.dict()
    medicine_dict["unit_price"] = float(medicine_dict["unit_price"])
    return medicine_dict

@router.delete("/medicines/{medicine_id}")
async def delete_medicine(
    medicine_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Deactivate a medicine (pharmacist only)"""
    if current_user.get("role") != "pharmacist":
        raise HTTPException(status_code=403, detail="Only pharmacists can delete medicines")
    
    medicine = await Medicine.get_or_none(id=medicine_id)
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    medicine.active = False
    await medicine.save()
    return {"message": "Medicine deactivated successfully"}

# Prescription Management
@router.get("/prescriptions/", response_model=List[dict])
async def get_prescriptions(
    current_user: dict = Depends(get_current_user),
    status: Optional[str] = Query(None),
    patient_id: Optional[int] = Query(None)
):
    """Get prescriptions with patient and medicine details"""
    query = Prescription.all().prefetch_related('patient', 'prescriber', 'medicine', 'pharmacist')
    
    if status:
        query = query.filter(status=status)
    
    if patient_id:
        query = query.filter(patient_id=patient_id)
    
    prescriptions = await query
    results = []
    
    for prescription in prescriptions:
        prescription_data = await Prescription_Pydantic.from_tortoise_orm(prescription)
        prescription_dict = prescription_data.dict()
        
        # Add related data
        if prescription.patient:
            patient_name = ""
            if prescription.patient.name and len(prescription.patient.name) > 0:
                patient_name = prescription.patient.name[0].get("text", "")
            prescription_dict["patient_name"] = patient_name
            prescription_dict["patient_email"] = prescription.patient.email
        
        if prescription.prescriber:
            prescriber_name = ""
            if prescription.prescriber.name and len(prescription.prescriber.name) > 0:
                prescriber_name = prescription.prescriber.name[0].get("text", "")
            prescription_dict["prescriber_name"] = prescriber_name
        
        if prescription.medicine:
            prescription_dict["medicine_name"] = prescription.medicine.name
            prescription_dict["medicine_strength"] = prescription.medicine.strength
            prescription_dict["medicine_form"] = prescription.medicine.dosage_form
        
        if prescription.pharmacist:
            pharmacist_name = ""
            if prescription.pharmacist.name and len(prescription.pharmacist.name) > 0:
                pharmacist_name = prescription.pharmacist.name[0].get("text", "")
            prescription_dict["pharmacist_name"] = pharmacist_name
        
        results.append(prescription_dict)
    
    return results

@router.get("/prescriptions/{prescription_id}", response_model=dict)
async def get_prescription(
    prescription_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific prescription with full details"""
    prescription = await Prescription.get_or_none(id=prescription_id).prefetch_related(
        'patient', 'prescriber', 'medicine', 'pharmacist'
    )
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    prescription_data = await Prescription_Pydantic.from_tortoise_orm(prescription)
    prescription_dict = prescription_data.dict()
    
    # Add related data
    if prescription.patient:
        patient_name = ""
        if prescription.patient.name and len(prescription.patient.name) > 0:
            patient_name = prescription.patient.name[0].get("text", "")
        prescription_dict["patient_name"] = patient_name
        prescription_dict["patient_email"] = prescription.patient.email
    
    if prescription.prescriber:
        prescriber_name = ""
        if prescription.prescriber.name and len(prescription.prescriber.name) > 0:
            prescriber_name = prescription.prescriber.name[0].get("text", "")
        prescription_dict["prescriber_name"] = prescriber_name
    
    if prescription.medicine:
        prescription_dict["medicine_name"] = prescription.medicine.name
        prescription_dict["medicine_strength"] = prescription.medicine.strength
        prescription_dict["medicine_form"] = prescription.medicine.dosage_form
        prescription_dict["medicine_price"] = float(prescription.medicine.unit_price)
    
    return prescription_dict

@router.post("/prescriptions/", response_model=dict)
async def create_prescription(
    prescription_data: PrescriptionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new prescription (doctors only)"""
    if current_user.get("role") not in ["practitioner", "pharmacist"]:
        raise HTTPException(status_code=403, detail="Only practitioners can create prescriptions")
    
    # Verify patient exists
    patient = await Patient.get_or_none(id=prescription_data.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Verify prescriber exists
    prescriber = await Practitioner.get_or_none(id=prescription_data.prescriber_id)
    if not prescriber:
        raise HTTPException(status_code=404, detail="Prescriber not found")
    
    # Verify medicine exists
    medicine = await Medicine.get_or_none(id=prescription_data.medicine_id)
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    prescription = await Prescription.create(
        patient=patient,
        prescriber=prescriber,
        medicine=medicine,
        dosage=prescription_data.dosage,
        frequency=prescription_data.frequency,
        duration=prescription_data.duration,
        quantity_prescribed=prescription_data.quantity_prescribed,
        instructions=prescription_data.instructions
    )
    
    prescription_pydantic = await Prescription_Pydantic.from_tortoise_orm(prescription)
    return prescription_pydantic.dict()

@router.post("/prescriptions/{prescription_id}/dispense")
async def dispense_prescription(
    prescription_id: int,
    dispense_data: PrescriptionDispense,
    current_user: dict = Depends(get_current_user)
):
    """Dispense a prescription (pharmacist only)"""
    if current_user.get("role") != "pharmacist":
        raise HTTPException(status_code=403, detail="Only pharmacists can dispense prescriptions")
    
    prescription = await Prescription.get_or_none(id=prescription_id).prefetch_related('medicine')
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    if prescription.status == "dispensed":
        raise HTTPException(status_code=400, detail="Prescription already dispensed")
    
    # Check if enough stock is available
    if prescription.medicine.current_stock < dispense_data.quantity_dispensed:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Get pharmacist
    pharmacist = await Practitioner.get_or_none(id=dispense_data.pharmacist_id)
    if not pharmacist:
        raise HTTPException(status_code=404, detail="Pharmacist not found")
    
    # Update prescription
    prescription.quantity_dispensed = dispense_data.quantity_dispensed
    prescription.status = "dispensed"
    prescription.dispensed_date = datetime.now()
    prescription.pharmacist = pharmacist
    await prescription.save()
    
    # Update medicine stock
    prescription.medicine.current_stock -= dispense_data.quantity_dispensed
    await prescription.medicine.save()
    
    return {"message": "Prescription dispensed successfully"}

# Inventory Reports
@router.get("/reports/inventory/")
async def get_inventory_report(current_user: dict = Depends(get_current_user)):
    """Get inventory report with stock levels"""
    medicines = await Medicine.filter(active=True)
    
    total_medicines = len(medicines)
    low_stock_count = len([m for m in medicines if m.current_stock <= m.minimum_stock])
    expired_count = len([m for m in medicines if m.expiry_date < date.today()])
    total_value = sum([float(m.unit_price) * m.current_stock for m in medicines])
    
    return {
        "total_medicines": total_medicines,
        "low_stock_count": low_stock_count,
        "expired_count": expired_count,
        "total_value": total_value,
        "medicines": [
            {
                "id": m.id,
                "name": m.name,
                "current_stock": m.current_stock,
                "minimum_stock": m.minimum_stock,
                "expiry_date": m.expiry_date,
                "unit_price": float(m.unit_price),
                "total_value": float(m.unit_price) * m.current_stock,
                "status": "expired" if m.expiry_date < date.today() else 
                         "low_stock" if m.current_stock <= m.minimum_stock else "normal"
            }
            for m in medicines
        ]
    }

@router.get("/reports/sales/")
async def get_sales_report(
    current_user: dict = Depends(get_current_user),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    """Get sales report for dispensed prescriptions"""
    query = Prescription.filter(status="dispensed").prefetch_related('medicine')
    
    if start_date:
        query = query.filter(dispensed_date__gte=start_date)
    if end_date:
        query = query.filter(dispensed_date__lte=end_date)
    
    prescriptions = await query
    
    total_sales = 0
    medicine_sales = {}
    
    for prescription in prescriptions:
        if prescription.medicine:
            sale_amount = float(prescription.medicine.unit_price) * prescription.quantity_dispensed
            total_sales += sale_amount
            
            medicine_name = prescription.medicine.name
            if medicine_name not in medicine_sales:
                medicine_sales[medicine_name] = {
                    "quantity": 0,
                    "amount": 0
                }
            medicine_sales[medicine_name]["quantity"] += prescription.quantity_dispensed
            medicine_sales[medicine_name]["amount"] += sale_amount
    
    return {
        "total_sales": total_sales,
        "total_prescriptions": len(prescriptions),
        "medicine_sales": medicine_sales
    } 