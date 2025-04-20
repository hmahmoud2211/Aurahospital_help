import { create } from 'zustand';

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'checkup' | 'followup' | 'consultation';
  notes?: string;
}

interface AppointmentState {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
  fetchAppointments: (userId: string) => Promise<void>;
  scheduleAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  selectAppointment: (appointment: Appointment) => void;
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,

  fetchAppointments: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/appointments/${userId}`);
      const appointments = await response.json();
      set({ appointments, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch appointments', loading: false });
    }
  },

  scheduleAppointment: async (appointment) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });
      const newAppointment = await response.json();
      set((state) => ({
        appointments: [...state.appointments, newAppointment],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to schedule appointment', loading: false });
    }
  },

  cancelAppointment: async (appointmentId: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        appointments: state.appointments.filter((apt) => apt.id !== appointmentId),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to cancel appointment', loading: false });
    }
  },

  selectAppointment: (appointment: Appointment) => {
    set({ selectedAppointment: appointment });
  },
})); 