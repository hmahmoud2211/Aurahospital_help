import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { mockAppointments, getUpcomingAppointments, getDoctorAppointments } from '@/mocks/appointments';

interface AppointmentState {
  appointments: Appointment[];
  upcomingAppointments: Appointment[];
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
  
  fetchAppointments: (userId: string, userRole: string) => void;
  fetchAppointmentById: (appointmentId: string) => void;
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
      
      fetchAppointments: (userId, userRole) => {
        set({ isLoading: true, error: null });
        
        try {
          let filteredAppointments: Appointment[] = [];
          
          if (userRole === 'patient') {
            filteredAppointments = mockAppointments.filter(
              appointment => appointment.patientId === userId
            );
          } else if (userRole === 'doctor') {
            filteredAppointments = mockAppointments.filter(
              appointment => appointment.doctorId === userId
            );
          }
          
          const upcoming = getUpcomingAppointments(userId);
          
          set({
            appointments: filteredAppointments,
            upcomingAppointments: upcoming,
            isLoading: false,
          });
        } catch (error) {
          set({ error: 'Failed to load appointments', isLoading: false });
        }
      },
      
      fetchAppointmentById: (appointmentId) => {
        set({ isLoading: true, error: null });
        
        try {
          const appointment = mockAppointments.find(a => a.id === appointmentId);
          
          if (appointment) {
            set({ selectedAppointment: appointment, isLoading: false });
          } else {
            set({ error: 'Appointment not found', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to load appointment details', isLoading: false });
        }
      },
      
      bookAppointment: async (appointmentData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate a new appointment ID
          const newId = `a${Math.floor(Math.random() * 10000)}`;
          
          // Create a new appointment
          const newAppointment: Appointment = {
            id: newId,
            patientId: appointmentData.patientId || '',
            doctorId: appointmentData.doctorId || '',
            date: appointmentData.date || '',
            time: appointmentData.time || '',
            duration: appointmentData.duration || 30,
            status: appointmentData.status as AppointmentStatus || 'scheduled',
            reason: appointmentData.reason || '',
            notes: appointmentData.notes,
            followUp: appointmentData.followUp,
            // In a real app, we would fetch these from the database
            patient: appointmentData.patient,
            doctor: appointmentData.doctor,
          };
          
          // Add the new appointment to the list
          const updatedAppointments = [...get().appointments, newAppointment];
          set({ 
            appointments: updatedAppointments,
            isLoading: false 
          });
          
          return true;
        } catch (error) {
          set({ error: 'Failed to book appointment', isLoading: false });
          return false;
        }
      },
      
      cancelAppointment: async (appointmentId) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Find the appointment to cancel
          const appointmentIndex = get().appointments.findIndex(a => a.id === appointmentId);
          
          if (appointmentIndex === -1) {
            set({ error: 'Appointment not found', isLoading: false });
            return false;
          }
          
          // Update the appointment status
          const updatedAppointments = [...get().appointments];
          updatedAppointments[appointmentIndex] = {
            ...updatedAppointments[appointmentIndex],
            status: 'cancelled',
          };
          
          // Update the selected appointment if it's the one being cancelled
          let updatedSelectedAppointment = get().selectedAppointment;
          if (updatedSelectedAppointment && updatedSelectedAppointment.id === appointmentId) {
            updatedSelectedAppointment = {
              ...updatedSelectedAppointment,
              status: 'cancelled',
            };
          }
          
          set({ 
            appointments: updatedAppointments,
            selectedAppointment: updatedSelectedAppointment,
            isLoading: false 
          });
          
          return true;
        } catch (error) {
          set({ error: 'Failed to cancel appointment', isLoading: false });
          return false;
        }
      },
      
      rescheduleAppointment: async (appointmentId, newDate, newTime) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Find the appointment to reschedule
          const appointmentIndex = get().appointments.findIndex(a => a.id === appointmentId);
          
          if (appointmentIndex === -1) {
            set({ error: 'Appointment not found', isLoading: false });
            return false;
          }
          
          // Update the appointment date and time
          const updatedAppointments = [...get().appointments];
          updatedAppointments[appointmentIndex] = {
            ...updatedAppointments[appointmentIndex],
            date: newDate,
            time: newTime,
            status: 'confirmed', // Update status to confirmed after rescheduling
          };
          
          // Update the selected appointment if it's the one being rescheduled
          let updatedSelectedAppointment = get().selectedAppointment;
          if (updatedSelectedAppointment && updatedSelectedAppointment.id === appointmentId) {
            updatedSelectedAppointment = {
              ...updatedSelectedAppointment,
              date: newDate,
              time: newTime,
              status: 'confirmed',
            };
          }
          
          set({ 
            appointments: updatedAppointments,
            selectedAppointment: updatedSelectedAppointment,
            isLoading: false 
          });
          
          return true;
        } catch (error) {
          set({ error: 'Failed to reschedule appointment', isLoading: false });
          return false;
        }
      },
      
      updateAppointmentStatus: async (appointmentId, status) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Find the appointment to update
          const appointmentIndex = get().appointments.findIndex(a => a.id === appointmentId);
          
          if (appointmentIndex === -1) {
            set({ error: 'Appointment not found', isLoading: false });
            return false;
          }
          
          // Update the appointment status
          const updatedAppointments = [...get().appointments];
          updatedAppointments[appointmentIndex] = {
            ...updatedAppointments[appointmentIndex],
            status,
          };
          
          // Update the selected appointment if it's the one being updated
          let updatedSelectedAppointment = get().selectedAppointment;
          if (updatedSelectedAppointment && updatedSelectedAppointment.id === appointmentId) {
            updatedSelectedAppointment = {
              ...updatedSelectedAppointment,
              status,
            };
          }
          
          set({ 
            appointments: updatedAppointments,
            selectedAppointment: updatedSelectedAppointment,
            isLoading: false 
          });
          
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