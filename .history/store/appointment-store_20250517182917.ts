import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { API_URL } from '@/constants/config';

interface AppointmentState {
  appointments: Appointment[];
  upcomingAppointments: Appointment[];
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
  
  fetchAppointments: (userId: string, userRole: string) => Promise<void>;
  fetchAppointmentById: (appointmentId: string) => Promise<void>;
  bookAppointment: (appointmentData: Partial<Appointment>) => Promise<boolean>;
  cancelAppointment: (appointmentId: string) => Promise<boolean>;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => Promise<boolean>;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => Promise<boolean>;
}

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
          
          const response = await fetch(`${API_URL}/appointments/?${params.toString()}`);
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
          const response = await fetch(`${API_URL}/appointments/${appointmentId}`);
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
        set({ error: null });
        try {
          const response = await fetch(`${API_URL}/appointments/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData),
          });

          if (!response.ok) {
            let errorMsg = 'Failed to book appointment';
            try {
              const errorData = await response.json();
              errorMsg = errorData.detail || errorMsg;
            } catch {}
            set({ error: errorMsg });
            return false;
          }

          const newAppointment = await response.json();
          set((state) => ({
            appointments: [...state.appointments, newAppointment],
          }));
          return true;
        } catch (error) {
          set({ error: 'Network error. Please try again.' });
          return false;
        }
      },
      
      cancelAppointment: async (appointmentId) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
            method: 'DELETE',
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
            headers: {
              'Content-Type': 'application/json',
            },
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
            headers: {
              'Content-Type': 'application/json',
            },
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