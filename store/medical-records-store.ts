import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClinicalNote, MedicalRecord, Medication, TreatmentPlan } from '@/types/medical';
import { mockMedicalRecords, mockMedications, mockTreatmentPlan, mockClinicalNote } from '@/mocks/medical-records';

interface MedicalRecordsState {
  records: MedicalRecord[];
  medications: Medication[];
  treatmentPlan: TreatmentPlan | null;
  clinicalNotes: ClinicalNote[];
  selectedRecord: MedicalRecord | null;
  isLoading: boolean;
  error: string | null;
  
  fetchMedicalRecords: (patientId: string) => void;
  fetchMedications: (patientId: string) => void;
  fetchTreatmentPlan: (patientId: string) => void;
  fetchClinicalNotes: (patientId: string) => void;
  uploadMedicalRecord: (record: Partial<MedicalRecord>) => Promise<boolean>;
  requestMedicationRefill: (medicationId: string) => Promise<boolean>;
  deleteRecord: (recordId: string) => Promise<boolean>;
  selectRecord: (recordId: string) => void;
  addPrescription: (prescription: Partial<Medication>) => Promise<boolean>;
}

export const useMedicalRecordsStore = create<MedicalRecordsState>()(
  persist(
    (set, get) => ({
      records: [],
      medications: [],
      treatmentPlan: null,
      clinicalNotes: [],
      selectedRecord: null,
      isLoading: false,
      error: null,
      
      fetchMedicalRecords: (patientId) => {
        set({ isLoading: true, error: null });
        
        try {
          const filteredRecords = mockMedicalRecords.filter(
            record => record.patientId === patientId
          );
          
          set({ records: filteredRecords, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to load medical records', isLoading: false });
        }
      },
      
      fetchMedications: (patientId) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would filter medications by patientId
          // For now, just use mock data
          set({ medications: mockMedications, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to load medications', isLoading: false });
        }
      },
      
      fetchTreatmentPlan: (patientId) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would fetch the treatment plan by patientId
          // For now, just use mock data if it matches the patientId
          if (mockTreatmentPlan.patientId === patientId) {
            set({ treatmentPlan: mockTreatmentPlan, isLoading: false });
          } else {
            set({ treatmentPlan: null, isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to load treatment plan', isLoading: false });
        }
      },
      
      fetchClinicalNotes: (patientId) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would filter clinical notes by patientId
          // For now, just use mock data if it matches the patientId
          if (mockClinicalNote.patientId === patientId) {
            set({ clinicalNotes: [mockClinicalNote], isLoading: false });
          } else {
            set({ clinicalNotes: [], isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to load clinical notes', isLoading: false });
        }
      },
      
      uploadMedicalRecord: async (record) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, we would upload the record to a server
          // For now, just add it to our local state
          const newRecord: MedicalRecord = {
            id: `record-${Date.now()}`,
            patientId: record.patientId || '',
            type: record.type || 'document',
            title: record.title || 'Untitled Document',
            date: record.date || new Date().toISOString(),
            provider: record.provider || 'Self-uploaded',
            fileType: record.fileType,
            fileUrl: record.fileUrl,
          };
          
          set(state => ({
            records: [...state.records, newRecord],
            isLoading: false
          }));
          
          return true;
        } catch (error) {
          set({ error: 'Failed to upload medical record', isLoading: false });
          return false;
        }
      },
      
      requestMedicationRefill: async (medicationId) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, we would request a refill here
          // For now, just simulate success
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ error: 'Failed to request medication refill', isLoading: false });
          return false;
        }
      },
      
      deleteRecord: async (recordId) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Filter out the record with the given ID
          set(state => ({
            records: state.records.filter(record => record.id !== recordId),
            isLoading: false
          }));
          
          return true;
        } catch (error) {
          set({ error: 'Failed to delete record', isLoading: false });
          return false;
        }
      },
      
      selectRecord: (recordId) => {
        const { records } = get();
        const record = records.find(r => r.id === recordId) || null;
        set({ selectedRecord: record });
      },
      
      addPrescription: async (prescription) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, we would add the prescription to a server
          // For now, just add it to our local state
          const newMedication: Medication = {
            id: prescription.id || `med-${Date.now()}`,
            patientId: prescription.patientId || '',
            name: prescription.name || 'Untitled Medication',
            dosage: prescription.dosage || '',
            frequency: prescription.frequency || '',
            startDate: prescription.startDate || new Date().toISOString(),
            endDate: prescription.endDate || '',
            instructions: prescription.instructions || '',
            status: prescription.status || 'active',
            refillsRemaining: prescription.refillsRemaining || 0,
          };
          
          set(state => ({
            medications: [...state.medications, newMedication],
            isLoading: false
          }));
          
          return true;
        } catch (error) {
          set({ error: 'Failed to add prescription', isLoading: false });
          return false;
        }
      },
    }),
    {
      name: 'medical-records-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);