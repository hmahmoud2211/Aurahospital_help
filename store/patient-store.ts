import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Patient, VitalSigns } from '@/types/user';
import { mockPatients } from '@/mocks/users';
import { mockVitalSigns } from '@/mocks/medical-records';
import { useAuthStore } from './auth-store';
import { API_URL } from '@/constants/config';

interface PatientState {
  currentPatient: Patient | null;
  allPatients: Patient[];
  vitalSigns: {
    current: VitalSigns | null;
    history: Array<Partial<VitalSigns> & { date: string }>;
  };
  isLoading: boolean;
  error: string | null;
  
  setCurrentPatient: (patientId: string) => void;
  fetchAllPatients: (doctorId: string) => Promise<void>;
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

// Helper function to get auth headers
const getAuthHeaders = () => {
  const { token } = useAuthStore.getState();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      currentPatient: null,
      allPatients: [],
      vitalSigns: defaultVitalSigns,
      isLoading: false,
      error: null,
      
      setCurrentPatient: (patientId) => {
        set({ isLoading: true, error: null });
        
        try {
          // Find patient in current allPatients first (from API), then fallback to mock data
          const { allPatients } = get();
          let patient = allPatients.find(p => String(p.id) === String(patientId));
          
          // If not found in allPatients, check mock data
          if (!patient) {
            patient = mockPatients.find(p => String(p.id) === String(patientId));
          }
          
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
      
      fetchAllPatients: async (doctorId) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log(`🔍 Fetching all patients for doctor ID: ${doctorId}`);
          
          // Fetch ALL appointments for this doctor (regardless of status or date)
          const appointmentsResponse = await fetch(`${API_URL}/appointments/?doctor_id=${doctorId}`, {
            headers: getAuthHeaders(),
          });
          
          if (!appointmentsResponse.ok) {
            const errorText = await appointmentsResponse.text();
            console.error(`❌ Failed to fetch appointments: ${appointmentsResponse.status} - ${errorText}`);
            throw new Error(`Failed to fetch doctor appointments: ${appointmentsResponse.status}`);
          }
          
          const appointments = await appointmentsResponse.json();
          console.log(`📋 Fetched ${appointments.length} total appointments for doctor:`, appointments);
          
          // Extract unique patient IDs from ALL appointments (past, present, future)
          const allPatientIds = appointments.map((apt: { patient_id: number }) => apt.patient_id);
          const uniquePatientIds = [...new Set(allPatientIds)] as number[];
          console.log(`👥 Found ${uniquePatientIds.length} unique patients with appointments:`, uniquePatientIds);
          
          if (uniquePatientIds.length === 0) {
            console.log('ℹ️ No patients found with appointments for this doctor');
            set({ 
              allPatients: [],
              isLoading: false 
            });
            return;
          }
          
          // Fetch patient details for each unique patient ID
          console.log('🔄 Fetching patient details...');
          const patientPromises = uniquePatientIds.map(async (patientId: number, index: number) => {
            try {
              console.log(`📱 Fetching patient ${index + 1}/${uniquePatientIds.length}: ID ${patientId}`);
              const patientResponse = await fetch(`${API_URL}/users/${patientId}`, {
                headers: getAuthHeaders(),
              });
              
              if (patientResponse.ok) {
                const patient = await patientResponse.json();
                console.log(`✅ Successfully fetched patient ${patientId}:`, patient.name || patient.email);
                return patient;
              } else {
                const errorText = await patientResponse.text();
                console.warn(`⚠️ Failed to fetch patient ${patientId}: ${patientResponse.status} - ${errorText}`);
                return null;
              }
            } catch (error) {
              console.warn(`❌ Network error fetching patient ${patientId}:`, error);
              return null;
            }
          });
          
          const patients = (await Promise.all(patientPromises)).filter(Boolean);
          console.log(`✅ Successfully fetched ${patients.length} patient records out of ${uniquePatientIds.length} patient IDs`);
          
          set({ 
            allPatients: patients,
            isLoading: false 
          });
          
        } catch (error) {
          console.error('❌ Error in fetchAllPatients:', error);
          
          // Try to provide more specific error information
          if (error instanceof TypeError && error.message.includes('fetch')) {
            console.error('🌐 Network error - check if the backend server is running');
            set({ 
              error: 'Unable to connect to server. Please check your connection.',
              allPatients: [],
              isLoading: false 
            });
          } else {
            // Fallback to mock data if API fails
            console.log('🔄 API failed, falling back to mock data for demonstration');
            const assignedPatients = mockPatients.filter(patient => {
              // In demo mode, show all mock patients as if they have appointments
              return true;
            });
            
            set({ 
              allPatients: assignedPatients,
              error: 'Using demo data - API unavailable',
              isLoading: false 
            });
          }
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