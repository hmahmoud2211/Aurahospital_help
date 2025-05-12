export interface Medication {
    id: string;
    patientId: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    refills?: number;
    refillsRemaining?: number;
    instructions?: string;
    isActive?: boolean;
    status?: 'active' | 'completed' | 'cancelled' | 'pending';
  }
  
  export interface MedicalRecord {
    id: string;
    patientId: string;
    type: 'lab' | 'imaging' | 'note' | 'prescription' | 'document' | 'vaccination';
    title: string;
    date: string;
    provider: string;
    content?: string;
    fileUrl?: string;
    fileType?: string;
    annotations?: Array<{
      id: string;
      doctorId: string;
      text: string;
      position: { x: number; y: number };
      createdAt: string;
    }>;
    tags?: string[];
    doctorNotes?: Array<{
      id: string;
      doctorId: string;
      doctorName: string;
      note: string;
      createdAt: string;
      isPrivate: boolean;
    }>;
    aiInsights?: {
      summary: string;
      status: 'normal' | 'abnormal' | 'critical' | 'inconclusive';
      highlights: Array<{
        parameter: string;
        value: string;
        status: 'normal' | 'abnormal' | 'critical';
        explanation?: string;
      }>;
    };
  }
  
  export interface TreatmentPlan {
    id: string;
    patientId: string;
    diagnoses: {
      code: string;
      name: string;
      isPrimary: boolean;
    }[];
    goals: {
      id: string;
      description: string;
      isCompleted: boolean;
    }[];
    medications: Medication[];
    instructions?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ClinicalNote {
    id: string;
    patientId: string;
    providerId: string;
    date: string;
    subjective: string;
    objective: string;
    assessment: string[];
    plan: string;
  }