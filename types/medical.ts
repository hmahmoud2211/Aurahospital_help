export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    refills: number;
    instructions?: string;
    isActive: boolean;
  }
  
  export interface MedicalRecord {
    id: string;
    patientId: string;
    type: 'lab' | 'imaging' | 'note' | 'prescription' | 'document';
    title: string;
    date: string;
    provider: string;
    content?: string;
    fileUrl?: string;
    fileType?: string;
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