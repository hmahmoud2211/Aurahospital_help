import { ClinicalNote, MedicalRecord, Medication, TreatmentPlan } from '@/types/medical';
import { VitalSigns } from '@/types/user';

// Mock vital signs data with current readings and history
export const mockVitalSigns: {
  current: VitalSigns;
  history: Array<Partial<VitalSigns> & { date: string }>;
} = {
  current: {
    heartRate: 72,
    bloodPressure: {
      systolic: 128,
      diastolic: 78,
    },
    temperature: 98.6,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    glucose: 105,
  },
  history: [
    {
      date: '2023-10-15',
      bloodPressure: {
        systolic: 128,
        diastolic: 78,
      },
      heartRate: 72,
      glucose: 105,
    },
    {
      date: '2023-10-01',
      bloodPressure: {
        systolic: 132,
        diastolic: 82,
      },
      heartRate: 75,
      glucose: 110,
    },
    {
      date: '2023-09-15',
      bloodPressure: {
        systolic: 135,
        diastolic: 85,
      },
      heartRate: 78,
      glucose: 115,
    },
    {
      date: '2023-09-01',
      bloodPressure: {
        systolic: 138,
        diastolic: 88,
      },
      heartRate: 80,
      glucose: 120,
    },
    {
      date: '2023-08-15',
      bloodPressure: {
        systolic: 142,
        diastolic: 90,
      },
      heartRate: 82,
      glucose: 125,
    },
  ],
};

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'record1',
    patientId: 'p1',
    type: 'lab',
    title: 'Complete Blood Count (CBC)',
    date: '2023-09-15T10:30:00Z',
    provider: 'City General Hospital',
    content: 'Normal results for all parameters.',
    fileType: 'application/pdf',
  },
  {
    id: 'record2',
    patientId: 'p1',
    type: 'imaging',
    title: 'Chest X-Ray',
    date: '2023-08-22T14:45:00Z',
    provider: 'Radiology Partners',
    content: 'No abnormalities detected.',
    fileType: 'image/jpeg',
  },
  {
    id: 'record3',
    patientId: 'p1',
    type: 'document',
    title: 'Vaccination Record',
    date: '2023-07-10T09:15:00Z',
    provider: 'Community Health Clinic',
    fileType: 'application/pdf',
  },
  {
    id: 'record4',
    patientId: 'p1',
    type: 'prescription',
    title: 'Lisinopril Prescription',
    date: '2023-09-01T11:00:00Z',
    provider: 'Dr. Michael Chen',
    content: 'Lisinopril 10mg, once daily for hypertension.',
    fileType: 'application/pdf',
  },
  {
    id: 'record5',
    patientId: 'p2', // Different patient
    type: 'lab',
    title: 'Lipid Panel',
    date: '2023-09-05T13:20:00Z',
    provider: 'Metro Medical Lab',
    content: 'Cholesterol levels slightly elevated.',
    fileType: 'application/pdf',
  },
];

export const mockMedications: Medication[] = [
  {
    id: 'med1',
    patientId: 'p1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    startDate: '2023-09-01T00:00:00Z',
    refills: 3,
    refillsRemaining: 2,
    instructions: 'Take in the morning with food',
    isActive: true,
    status: 'active',
  },
  {
    id: 'med2',
    patientId: 'p1',
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily',
    startDate: '2023-08-15T00:00:00Z',
    refills: 2,
    refillsRemaining: 1,
    instructions: 'Take in the evening',
    isActive: true,
    status: 'active',
  },
  {
    id: 'med3',
    patientId: 'p1',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    startDate: '2023-07-10T00:00:00Z',
    endDate: '2023-10-10T00:00:00Z',
    refills: 0,
    refillsRemaining: 0,
    instructions: 'Take with meals',
    isActive: false,
    status: 'completed',
  },
];

export const mockTreatmentPlan: TreatmentPlan = {
  id: 'plan1',
  patientId: 'p1',
  diagnoses: [
    {
      code: 'I10',
      name: 'Essential (primary) hypertension',
      isPrimary: true,
    },
    {
      code: 'E78.5',
      name: 'Hyperlipidemia, unspecified',
      isPrimary: false,
    },
  ],
  goals: [
    {
      id: 'goal1',
      description: 'Maintain blood pressure below 130/80 mmHg',
      isCompleted: false,
    },
    {
      id: 'goal2',
      description: 'Reduce LDL cholesterol to below 100 mg/dL',
      isCompleted: false,
    },
    {
      id: 'goal3',
      description: 'Exercise at least 30 minutes, 5 days per week',
      isCompleted: true,
    },
  ],
  medications: [
    {
      id: 'med1',
      patientId: 'p1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      startDate: '2023-09-01T00:00:00Z',
      refills: 3,
      refillsRemaining: 2,
      instructions: 'Take in the morning with food',
      isActive: true,
      status: 'active',
    },
    {
      id: 'med2',
      patientId: 'p1',
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily',
      startDate: '2023-08-15T00:00:00Z',
      refills: 2,
      refillsRemaining: 1,
      instructions: 'Take in the evening',
      isActive: true,
      status: 'active',
    },
  ],
  instructions: 'Follow DASH diet. Limit sodium intake to less than 2,300 mg per day. Monitor blood pressure at home twice weekly.',
  createdAt: '2023-09-01T10:00:00Z',
  updatedAt: '2023-09-15T14:30:00Z',
};

export const mockClinicalNote: ClinicalNote = {
  id: 'note1',
  patientId: 'p1',
  providerId: 'd1',
  date: '2023-09-15T14:30:00Z',
  subjective: 'Patient reports occasional headaches in the morning. No chest pain or shortness of breath. Compliant with medications.',
  objective: 'BP: 128/78 mmHg, HR: 72 bpm, regular. Weight: 180 lbs. Lungs clear to auscultation bilaterally. Heart: Regular rate and rhythm, no murmurs.',
  assessment: [
    'Essential hypertension, well-controlled on current medication regimen',
    'Hyperlipidemia, improving with statin therapy',
    'Occasional tension headaches, likely not related to hypertension',
  ],
  plan: 'Continue current medications. Recommend stress management techniques for headaches. Follow up in 3 months. Labs ordered: Comprehensive metabolic panel, lipid panel.',
};