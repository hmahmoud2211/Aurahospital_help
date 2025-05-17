import { Doctor, Patient } from './user';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id?: string;
  patient_id: number;
  doctor_id: number;
  date: string;
  time: string;
  duration: number; // in minutes
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  followUp?: boolean;
  patientDetails?: Patient;
  doctorDetails?: Doctor;
}