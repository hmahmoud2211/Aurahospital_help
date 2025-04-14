import { Doctor, Patient, User } from '@/types/user';

export const mockPatients: Patient[] = [
  {
    id: 'p1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'patient',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    medicalRecordNumber: '293847',
    dateOfBirth: '1981-05-12',
    gender: 'female',
    bloodType: 'A+',
    allergies: ['Penicillin', 'Peanuts'],
    conditions: ['Hypertension', 'Hyperlipidemia', 'Migraine', 'Insomnia'],
    emergencyContact: {
      name: 'John Johnson',
      relationship: 'Spouse',
      phone: '555-123-4567',
    },
  },
  {
    id: 'p2',
    name: 'Robert Garcia',
    email: 'robert.garcia@example.com',
    role: 'patient',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    medicalRecordNumber: '293848',
    dateOfBirth: '1975-08-23',
    gender: 'male',
    bloodType: 'O+',
    allergies: ['Sulfa drugs'],
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    emergencyContact: {
      name: 'Maria Garcia',
      relationship: 'Spouse',
      phone: '555-987-6543',
    },
  },
];

export const mockDoctors: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@example.com',
    role: 'doctor',
    profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    specialty: 'Cardiology',
    hospital: 'Memorial Hospital',
    rating: 4.9,
    licenseNumber: 'MD12345',
    availability: {
      'Monday': [{ start: '08:00', end: '17:00' }],
      'Tuesday': [{ start: '08:00', end: '17:00' }],
      'Wednesday': [{ start: '08:00', end: '17:00' }],
      'Thursday': [{ start: '08:00', end: '17:00' }],
      'Friday': [{ start: '08:00', end: '17:00' }],
    },
  },
  {
    id: 'd2',
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    role: 'doctor',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    specialty: 'Neurology',
    hospital: 'Central Medical Center',
    rating: 4.8,
    licenseNumber: 'MD67890',
    availability: {
      'Monday': [{ start: '09:00', end: '18:00' }],
      'Wednesday': [{ start: '09:00', end: '18:00' }],
      'Friday': [{ start: '09:00', end: '18:00' }],
    },
  },
];

export const mockUsers: User[] = [
  ...mockPatients,
  ...mockDoctors,
  {
    id: 'n1',
    name: 'Jessica Williams',
    email: 'jessica.williams@example.com',
    role: 'nurse',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'a1',
    name: 'David Thompson',
    email: 'david.thompson@example.com',
    role: 'admin',
    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'ph1',
    name: 'Lisa Martinez',
    email: 'lisa.martinez@example.com',
    role: 'pharmacist',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  },
];