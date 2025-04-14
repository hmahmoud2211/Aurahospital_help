import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Patient, VitalSigns } from '@/types/user';
import { mockPatients } from '@/mocks/users';
import { mockVitalSigns } from '@/mocks/medical-records';

interface PatientState {
  currentPatient: Patient | null;
  vitalSigns: {
    current: VitalSigns | null;
    history: Array<Partial<VitalSigns> & { date: string }>;
  };
  isLoading: boolean;
  error: string | null;
  
  setCurrentPatient: (patientId: string) => void;
  updateVitalSigns: (newVitals: Partial<VitalSigns>) => void;
  addVitalSignsHistory: (vitals: Partial<VitalSigns> & { date: string }) => void;
}

// Default empty state to prevent undefined errors
const defaultVitalSigns = {
  current: {
    heartRate: 72,
    bloodPressure: {
      systolic: 120,
      diastolic: 80,
    },
    temperature: 98.6,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    glucose: 98,
  },
  history: [],
};

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      currentPatient: null,
      vitalSigns: defaultVitalSigns,
      isLoading: false,
      error: null,
      
      setCurrentPatient: (patientId) => {
        set({ isLoading: true, error: null });
        
        try {
          // Find patient in mock data
          const patient = mockPatients.find(p => p.id === patientId);
          
          if (patient) {
            set({ 
              currentPatient: patient,
              vitalSigns: mockVitalSigns ? {
                current: mockVitalSigns.current || defaultVitalSigns.current,
                history: mockVitalSigns.history || [],
              } : defaultVitalSigns,
              isLoading: false 
            });
          } else {
            set({ 
              error: 'Patient not found', 
              isLoading: false,
              // Ensure vitalSigns is always defined even when there's an error
              vitalSigns: defaultVitalSigns
            });
          }
        } catch (error) {
          set({ 
            error: 'Failed to load patient data', 
            isLoading: false,
            // Ensure vitalSigns is always defined even when there's an error
            vitalSigns: defaultVitalSigns
          });
        }
      },
      
      updateVitalSigns: (newVitals) => {
        const { vitalSigns } = get();
        
        set({
          vitalSigns: {
            ...vitalSigns,
            current: {
              ...(vitalSigns.current || defaultVitalSigns.current),
              ...newVitals,
            },
          },
        });
      },
      
      addVitalSignsHistory: (vitals) => {
        const { vitalSigns } = get();
        
        set({
          vitalSigns: {
            ...vitalSigns,
            history: [vitals, ...(vitalSigns.history || [])],
          },
        });
      },
    }),
    {
      name: 'patient-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);