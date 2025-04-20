import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MedicalChatbot } from '../services/MedicalChatbot';
import { useAuthStore } from '../stores/authStore';

interface AppointmentSlot {
  id: string;
  date: string;
  time: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  isAvailable: boolean;
}

const AppointmentScheduler: React.FC = () => {
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string>('');
  const { isLoggedIn, userId } = useAuthStore();
  const chatbot = new MedicalChatbot();

  const fetchAvailableSlots = async () => {
    try {
      const slots = await chatbot.getAvailableAppointments(undefined, selectedDate);
      setAvailableSlots(slots);
      setError('');
    } catch (err) {
      setError('Failed to fetch available slots. Please try again.');
      console.error('Error fetching slots:', err);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, [selectedDate]);

  const handleBookAppointment = async (slot: AppointmentSlot) => {
    if (!isLoggedIn || !userId) {
      setError('Please log in to book an appointment');
      return;
    }

    try {
      const appointment = await chatbot.bookAppointment(userId, slot.id, 'General checkup');
      if (appointment) {
        // Refresh available slots after booking
        fetchAvailableSlots();
        setError('Appointment booked successfully!');
      } else {
        setError('Failed to book appointment. Please try again.');
      }
    } catch (err) {
      setError('Error booking appointment. Please try again.');
      console.error('Error booking appointment:', err);
    }
  };

  const renderTimeSlot = (slot: AppointmentSlot) => (
    <TouchableOpacity
      key={slot.id}
      style={[
        styles.timeSlot,
        !slot.isAvailable && styles.unavailableSlot
      ]}
      onPress={() => slot.isAvailable && handleBookAppointment(slot)}
      disabled={!slot.isAvailable}
    >
      <Text style={styles.timeText}>{slot.time}</Text>
      <Text style={styles.doctorText}>{slot.doctorName}</Text>
      <Text style={styles.specialtyText}>{slot.specialty}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule an Appointment</Text>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <View style={styles.dateSelector}>
        <TouchableOpacity
          onPress={() => {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() - 1);
            setSelectedDate(date.toISOString().split('T')[0]);
          }}
        >
          <Text style={styles.dateButton}>Previous Day</Text>
        </TouchableOpacity>
        
        <Text style={styles.dateText}>
          {new Date(selectedDate).toLocaleDateString()}
        </Text>
        
        <TouchableOpacity
          onPress={() => {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() + 1);
            setSelectedDate(date.toISOString().split('T')[0]);
          }}
        >
          <Text style={styles.dateButton}>Next Day</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.slotsContainer}>
        {availableSlots.length > 0 ? (
          availableSlots.map(renderTimeSlot)
        ) : (
          <Text style={styles.noSlots}>No available slots for this date</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
  },
  slotsContainer: {
    flex: 1,
  },
  timeSlot: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  unavailableSlot: {
    opacity: 0.5,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '500',
  },
  doctorText: {
    fontSize: 16,
    marginTop: 4,
  },
  specialtyText: {
    fontSize: 14,
    color: '#666',
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  noSlots: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 32,
  },
});

export default AppointmentScheduler; 