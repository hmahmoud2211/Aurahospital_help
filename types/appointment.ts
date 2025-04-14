import { Doctor, Patient } from './user';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  followUp?: boolean;
  patient?: Patient;
  doctor?: Doctor;
}