import { Doctor, Patient } from './user';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id?: number;
  patient_id: number;
  doctor_id: number;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  follow_up: boolean;
  created_at?: string;
  updated_at?: string;
  patientDetails?: any;
  doctorDetails?: any;
}