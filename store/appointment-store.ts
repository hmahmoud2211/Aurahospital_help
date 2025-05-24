import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { API_URL } from '@/constants/config';
import { useAuthStore } from './auth-store';

interface AppointmentState {
  appointments: Appointment[];
  upcomingAppointments: Appointment[];
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
  
  fetchAppointments: (userId: string, userRole: string) => Promise<void>;
  fetchAppointmentById: (appointmentId: number) => Promise<void>;
  bookAppointment: (appointmentData: Partial<Appointment>) => Promise<boolean>;
  cancelAppointment: (appointmentId: number) => Promise<boolean>;
  rescheduleAppointment: (appointmentId: number, newDate: string, newTime: string) => Promise<boolean>;
  updateAppointmentStatus: (appointmentId: number, status: AppointmentStatus) => Promise<boolean>;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const { token } = useAuthStore.getState();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      appointments: [],
      upcomingAppointments: [],
      selectedAppointment: null,
      isLoading: false,
      error: null,
      
      fetchAppointments: async (userId, userRole) => {
        set({ isLoading: true, error: null });
        
        try {
          const params = new URLSearchParams();
          if (userRole === 'patient') {
            params.append('patient_id', userId);
          } else if (userRole === 'doctor') {
            params.append('doctor_id', userId);
          }
          
          const response = await fetch(`${API_URL}/appointments/?${params.toString()}`, {
            headers: getAuthHeaders(),
          });
          if (!response.ok) {
            throw new Error('Failed to fetch appointments');
          }
          
          const appointments = await response.json();
          
          // Filter upcoming appointments
          const now = new Date();
          const upcoming = appointments.filter((appointment: Appointment) => {
            const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
            return appointmentDate > now && appointment.status !== 'cancelled';
          });
          
          set({
            appointments,
            upcomingAppointments: upcoming,
            isLoading: false,
          });
        } catch (error) {
          set({ error: 'Failed to load appointments', isLoading: false });
        }
      },
      
      fetchAppointmentById: async (appointmentId) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
            headers: getAuthHeaders(),
          });
          if (!response.ok) {
            throw new Error('Failed to fetch appointment details');
          }
          
          const appointment = await response.json();
          set({ selectedAppointment: appointment, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to load appointment details', isLoading: false });
        }
      },
      
      bookAppointment: async (appointmentData) => {
        set({ isLoading: true, error: null });
        try {
          console.log('📅 Booking appointment with auth token...');
          
          const response = await fetch(`${API_URL}/appointments/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(appointmentData),
          });

          console.log('📅 Response status:', response.status);

          if (!response.ok) {
            let errorMsg = 'Failed to book appointment';
            try {
              const errorData = await response.json();
              errorMsg = errorData.detail || errorMsg;
              console.log('📅 Error response:', errorData);
            } catch {}
            set({ error: errorMsg, isLoading: false });
            return false;
          }

          const newAppointment = await response.json();
          console.log('📅 Appointment booked successfully:', newAppointment);
          
          set((state) => ({
            appointments: [...state.appointments, newAppointment],
            isLoading: false,
          }));
          return true;
        } catch (error) {
          console.error('📅 Network error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Network error. Please try again.',
            isLoading: false 
          });
          return false;
        }
      },
      
      cancelAppointment: async (appointmentId) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          
          if (!response.ok) {
            throw new Error('Failed to cancel appointment');
          }
          
          set((state) => ({
            appointments: state.appointments.filter((apt) => apt.id !== appointmentId),
            isLoading: false,
          }));
          
          return true;
        } catch (error) {
          set({ error: 'Failed to cancel appointment', isLoading: false });
          return false;
        }
      },
      
      rescheduleAppointment: async (appointmentId, newDate, newTime) => {
        set({ isLoading: true, error: null });
        
        try {
          const appointment = get().appointments.find((apt) => apt.id === appointmentId);
          if (!appointment) {
            throw new Error('Appointment not found');
          }
          
          const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              ...appointment,
              date: newDate,
              time: newTime,
              status: 'confirmed',
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to reschedule appointment');
          }
          
          const updatedAppointment = await response.json();
          set((state) => ({
            appointments: state.appointments.map((apt) =>
              apt.id === appointmentId ? updatedAppointment : apt
            ),
            isLoading: false,
          }));
          
          return true;
        } catch (error) {
          set({ error: 'Failed to reschedule appointment', isLoading: false });
          return false;
        }
      },
      
      updateAppointmentStatus: async (appointmentId, status) => {
        set({ isLoading: true, error: null });
        
        try {
          const appointment = get().appointments.find((apt) => apt.id === appointmentId);
          if (!appointment) {
            throw new Error('Appointment not found');
          }
          
          const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              ...appointment,
              status,
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update appointment status');
          }
          
          const updatedAppointment = await response.json();
          set((state) => ({
            appointments: state.appointments.map((apt) =>
              apt.id === appointmentId ? updatedAppointment : apt
            ),
            isLoading: false,
          }));
          
          return true;
        } catch (error) {
          set({ error: 'Failed to update appointment status', isLoading: false });
          return false;
        }
      },
    }),
    {
      name: 'appointment-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);