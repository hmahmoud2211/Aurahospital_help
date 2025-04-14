import { Appointment } from '@/types/appointment';
import { mockDoctors, mockPatients } from './users';

export const mockAppointments: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    doctorId: 'd1',
    date: '2023-10-11',
    time: '14:30',
    duration: 30,
    status: 'confirmed',
    reason: 'Follow-up on cardiogram results',
    notes: 'Patient has been experiencing chest pain after exercise. Need to review recent test results.',
    patient: mockPatients[0],
    doctor: mockDoctors[0],
  },
  {
    id: 'a2',
    patientId: 'p2',
    doctorId: 'd1',
    date: '2023-10-11',
    time: '16:00',
    duration: 30,
    status: 'confirmed',
    reason: 'Blood pressure monitoring',
    patient: mockPatients[1],
    doctor: mockDoctors[0],
  },
  {
    id: 'a3',
    patientId: 'p1',
    doctorId: 'd2',
    date: '2023-10-18',
    time: '10:30',
    duration: 45,
    status: 'scheduled',
    reason: 'Headache consultation',
    patient: mockPatients[0],
    doctor: mockDoctors[1],
  },
  {
    id: 'a4',
    patientId: 'p1',
    doctorId: 'd3',
    date: '2023-09-25',
    time: '09:15',
    duration: 30,
    status: 'completed',
    reason: 'Annual physical examination',
    notes: 'All vitals normal. Recommended lifestyle changes to reduce cholesterol.',
    patient: mockPatients[0],
    doctor: mockDoctors[2],
  },
  {
    id: 'a5',
    patientId: 'p1',
    doctorId: 'd1',
    date: '2023-09-10',
    time: '11:00',
    duration: 30,
    status: 'cancelled',
    reason: 'Chest pain follow-up',
    patient: mockPatients[0],
    doctor: mockDoctors[0],
  },
  {
    id: 'a6',
    patientId: 'p2',
    doctorId: 'd2',
    date: '2023-10-20',
    time: '15:45',
    duration: 45,
    status: 'scheduled',
    reason: 'Migraine treatment consultation',
    patient: mockPatients[1],
    doctor: mockDoctors[1],
  },
  {
    id: 'a7',
    patientId: 'p1',
    doctorId: 'd4',
    date: '2023-10-25',
    time: '13:30',
    duration: 60,
    status: 'scheduled',
    reason: 'Skin rash examination',
    patient: mockPatients[0],
    doctor: mockDoctors[3],
  },
];

export const getUpcomingAppointments = (patientId: string) => {
  const now = new Date();
  return mockAppointments
    .filter(appointment => appointment.patientId === patientId)
    .filter(appointment => {
      const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
      return appointmentDate > now;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
};

export const getDoctorAppointments = (doctorId: string, date: string) => {
  return mockAppointments
    .filter(appointment => appointment.doctorId === doctorId && appointment.date === date)
    .sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
      return timeA[1] - timeB[1];
    });
};

export const getAvailableTimeSlots = (doctorId: string, date: string) => {
  // All possible time slots
  const allTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];
  
  // Get booked appointments for this doctor on this date
  const bookedAppointments = getDoctorAppointments(doctorId, date);
  
  // Filter out booked time slots
  return allTimeSlots.filter(timeSlot => {
    return !bookedAppointments.some(appointment => {
      const appointmentTime = appointment.time;
      const appointmentEndTime = addMinutesToTime(appointmentTime, appointment.duration);
      const timeSlotEndTime = addMinutesToTime(timeSlot, 30); // Assuming 30-minute slots
      
      // Check if the time slot overlaps with any appointment
      return (
        (timeSlot >= appointmentTime && timeSlot < appointmentEndTime) ||
        (timeSlotEndTime > appointmentTime && timeSlotEndTime <= appointmentEndTime) ||
        (timeSlot <= appointmentTime && timeSlotEndTime >= appointmentEndTime)
      );
    });
  });
};

// Helper function to add minutes to a time string (format: "HH:MM")
const addMinutesToTime = (timeString: string, minutes: number) => {
  const [hours, mins] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};