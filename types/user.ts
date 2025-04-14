export type UserRole = 'patient' | 'doctor' | 'nurse' | 'admin' | 'pharmacist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

export interface Patient extends User {
  role: 'patient';
  medicalRecordNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface Doctor extends User {
  role: 'doctor';
  specialty: string;
  hospital: string;
  rating?: number;
  licenseNumber: string;
  availability?: {
    [day: string]: {
      start: string;
      end: string;
    }[];
  };
}

export interface VitalSigns {
  heartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  glucose?: number;
}