from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
# from passlib.context import CryptContext
import hashlib
from backend.models import Patient, Practitioner
from pydantic import BaseModel
from tortoise.exceptions import DoesNotExist
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string

router = APIRouter(prefix="/auth", tags=["auth"])

# Security
SECRET_KEY = "your-secret-key-here"  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Email configuration
SMTP_SERVER = "smtp.gmail.com"  # Gmail's SMTP server
SMTP_PORT = 587  # Gmail's SMTP port
SMTP_USERNAME = "biomedicalwork49@gmail.com"  # Your Gmail address
SMTP_PASSWORD = "bvnr tjdk mejr stdb"  # Your Gmail app password

# Store verification codes (in production, use Redis or a database)
verification_codes = {}

# Simple password hashing (temporary solution)
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hashlib.sha256(password.encode()).hexdigest() == hashed

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def generate_verification_code():
    return ''.join(random.choices(string.digits, k=6))

def send_verification_email(email: str, code: str):
    print(f"Attempting to send verification code to: {email}")
    print(f"Generated code: {code}")
    
    msg = MIMEMultipart()
    msg['From'] = SMTP_USERNAME
    msg['To'] = email
    msg['Subject'] = "Password Reset Verification Code"

    body = f"""
    Hello,

    Your verification code for password reset is: {code}

    This code will expire in 10 minutes.

    If you didn't request this code, please ignore this email.

    Best regards,
    Your Hospital Team
    """
    
    msg.attach(MIMEText(body, 'plain'))

    try:
        print(f"Connecting to SMTP server: {SMTP_SERVER}:{SMTP_PORT}")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        print("TLS started")
        print(f"Attempting to login with username: {SMTP_USERNAME}")
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        print("Login successful")
        server.send_message(msg)
        print("Email sent successfully")
        server.quit()
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@router.post("/register")
async def register(user_data: dict):
    try:
        # Check if user already exists
        if await Patient.filter(email=user_data["email"]).exists():
            raise HTTPException(status_code=400, detail="Email already registered")
        if await Practitioner.filter(email=user_data["email"]).exists():
            raise HTTPException(status_code=400, detail="Email already registered")

        # Hash password
        hashed_password = hash_password(user_data["password"])
        
        # Determine user role based on license number or explicit role
        user_role = user_data.get("role", "patient")
        license_number = user_data.get("licenseNumber", "")
        
        # If license number starts with 'F', user is a pharmacist
        # If license number starts with 'L', user is a laborist
        if license_number.startswith('F'):
            user_role = "pharmacist"
        elif license_number.startswith('L'):
            user_role = "laborist"
        elif license_number and user_role == "patient":
            user_role = "practitioner"
        
        # Create user based on role
        if user_role == "patient":
            user = await Patient.create(
                name=[{
                    "use": "official",
                    "text": user_data["name"]
                }],
                email=user_data["email"],
                identifier=[{
                    "system": "national_id",
                    "value": user_data.get("nationalId", "")
                }],
                telecom=[{
                    "system": "phone",
                    "value": user_data.get("phone", "")
                }],
                birth_date=datetime.strptime(user_data["dateOfBirth"], "%Y-%m-%d").date(),
                password_hash=hashed_password
            )
        else:
            # Both practitioners and pharmacists are stored in Practitioner table
            specialty_list = []
            if user_role == "pharmacist":
                specialty_list = ["Pharmacy"]
            elif user_role == "laborist":
                specialty_list = ["Laboratory"]
            elif user_data.get("specialty"):
                specialty_list = [user_data["specialty"]]
            
            user = await Practitioner.create(
                name=[{
                    "use": "official",
                    "text": user_data["name"]
                }],
                email=user_data["email"],
                identifier=[{
                    "system": "license",
                    "value": license_number
                }],
                telecom=[{
                    "system": "phone",
                    "value": user_data.get("phone", "")
                }],
                specialty=specialty_list,
                password_hash=hashed_password
            )

        return {"message": "User created successfully", "user_id": user.id, "role": user_role}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Try to find user in both Patient and Practitioner models
    user = None
    user_role = None
    
    # Check Patient table first
    patient = await Patient.get_or_none(email=form_data.username)
    if patient:
        user = patient
        user_role = "patient"
    else:
        # Check Practitioner table
        practitioner = await Practitioner.get_or_none(email=form_data.username)
        if practitioner:
            user = practitioner
            # Determine if practitioner is a pharmacist
            license_number = ""
            if practitioner.identifier:
                for identifier in practitioner.identifier:
                    if identifier.get("system") == "license":
                        license_number = identifier.get("value", "")
                        break
            
            # Check if pharmacist by license number or specialty
            is_pharmacist = (
                license_number.startswith('F') or 
                (practitioner.specialty and "Pharmacy" in practitioner.specialty)
            )
            
            # Check if laborist by license number or specialty
            is_laborist = (
                license_number.startswith('L') or 
                (practitioner.specialty and "Laboratory" in practitioner.specialty)
            )
            
            if is_pharmacist:
                user_role = "pharmacist"
            elif is_laborist:
                user_role = "laborist"
            else:
                user_role = "practitioner"
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "id": user.id, "role": user_role},
        expires_delta=access_token_expires
    )

    # Extract name from FHIR HumanName structure
    name = ""
    if isinstance(user.name, list) and len(user.name) > 0:
        name = user.name[0].get("text", "")
    elif isinstance(user.name, dict):
        name = user.name.get("text", "")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": name,
            "role": user_role
        }
    }

class UserDetails(BaseModel):
    email: str
    mobileNumber: str

@router.post("/auth/verify-details")
async def verify_user_details(details: UserDetails):
    try:
        # Check if user exists with the provided email
        patient = await Patient.filter(email=details.email).first()
        practitioner = await Practitioner.filter(email=details.email).first()
        
        if not patient and not practitioner:
            raise HTTPException(status_code=404, detail="User not found with this email")
        
        # Verify mobile number
        user = patient or practitioner
        if user.telecom and any(t.get('value') == details.mobileNumber for t in user.telecom):
            return {"message": "Details verified successfully", "userId": user.id}
        else:
            raise HTTPException(status_code=400, detail="Mobile number does not match our records")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ResetCodeRequest(BaseModel):
    email: str
    mobileNumber: str

@router.post("/send-reset-code")
async def send_reset_code(request: ResetCodeRequest):
    try:
        # Check if user exists with the provided email
        patient = await Patient.filter(email=request.email).first()
        practitioner = await Practitioner.filter(email=request.email).first()
        
        if not patient and not practitioner:
            raise HTTPException(status_code=404, detail="User not found with this email")
        
        # Verify mobile number
        user = patient or practitioner
        if not user.telecom or not any(t.get('value') == request.mobileNumber for t in user.telecom):
            raise HTTPException(status_code=400, detail="Mobile number does not match our records")
        
        # Generate verification code
        code = generate_verification_code()
        
        # Store the code with expiration (10 minutes)
        verification_codes[request.email] = {
            'code': code,
            'expires': datetime.utcnow() + timedelta(minutes=10)
        }
        
        # Send verification code via email
        send_verification_email(request.email, code)
        
        return {"message": "Verification code sent successfully"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class VerifyCodeRequest(BaseModel):
    email: str
    mobileNumber: str
    code: str

@router.post("/verify-reset-code")
async def verify_reset_code(request: VerifyCodeRequest):
    try:
        # Check if verification code exists and is valid
        stored_data = verification_codes.get(request.email)
        if not stored_data:
            raise HTTPException(status_code=400, detail="No verification code found. Please request a new code.")
        
        # Check if code has expired
        if datetime.utcnow() > stored_data['expires']:
            del verification_codes[request.email]
            raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new code.")
        
        # Verify the code
        if stored_data['code'] != request.code:
            raise HTTPException(status_code=400, detail="Invalid verification code")
        
        # Generate a temporary token for password reset
        reset_token = create_access_token(
            data={"sub": request.email, "purpose": "password_reset"},
            expires_delta=timedelta(minutes=15)
        )
        
        # Remove the used code
        del verification_codes[request.email]
        
        return {"message": "Code verified successfully", "token": reset_token}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ResetPasswordRequest(BaseModel):
    email: str
    mobileNumber: str
    newPassword: str

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        # Find the user
        patient = await Patient.filter(email=request.email).first()
        practitioner = await Practitioner.filter(email=request.email).first()
        if not patient and not practitioner:
            raise HTTPException(status_code=404, detail="User not found")
        # Verify mobile number
        user = patient or practitioner
        if not user.telecom or not any(t.get('value') == request.mobileNumber for t in user.telecom):
            raise HTTPException(status_code=400, detail="Mobile number does not match our records")
        # Hash the new password
        hashed_password = hash_password(request.newPassword)
        # Update the user's password
        user.password_hash = hashed_password
        await user.save()
        return {"message": "Password reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("id")
        user_role: str = payload.get("role")
        if email is None or user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Get user from database based on role
    if user_role == "patient":
        user = await Patient.get_or_none(id=user_id)
    else:
        user = await Practitioner.get_or_none(id=user_id)
    
    if user is None:
        raise credentials_exception
    
    return {"id": user.id, "email": user.email, "role": user_role}

async def get_current_practitioner(token: str = Depends(oauth2_scheme)):
    """Get current practitioner user (excludes patients)"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("id")
        user_role: str = payload.get("role")
        if email is None or user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Ensure user is not a patient
    if user_role == "patient":
        raise HTTPException(
            status_code=403,
            detail="Access denied. Only practitioners can access this resource."
        )
    
    # Get practitioner from database
    practitioner = await Practitioner.get_or_none(id=user_id)
    
    if practitioner is None:
        raise credentials_exception
    
    return practitioner 