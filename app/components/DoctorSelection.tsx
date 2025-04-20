import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availableDays: string[];
  imageUrl?: string;
  description?: string;
}

interface DoctorSelectionProps {
  onSelectDoctor: (doctor: Doctor) => void;
}

const doctors: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    description: 'Specializes in cardiovascular diseases with 15 years of experience',
    imageUrl: 'https://example.com/dr-johnson.jpg'
  },
  {
    id: 'd2',
    name: 'Dr. Michael Chen',
    specialty: 'General Medicine',
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    description: 'Family physician with expertise in preventive care',
    imageUrl: 'https://example.com/dr-chen.jpg'
  },
  {
    id: 'd3',
    name: 'Dr. Emily Brown',
    specialty: 'Pediatrics',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    description: 'Child healthcare specialist with a focus on developmental medicine',
    imageUrl: 'https://example.com/dr-brown.jpg'
  }
];

const DoctorSelection: React.FC<DoctorSelectionProps> = ({ onSelectDoctor }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Select a Doctor</Text>
      {doctors.map((doctor) => (
        <TouchableOpacity
          key={doctor.id}
          style={styles.doctorCard}
          onPress={() => onSelectDoctor(doctor)}
        >
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.specialty}>{doctor.specialty}</Text>
            <Text style={styles.description}>{doctor.description}</Text>
            <Text style={styles.availability}>
              Available: {doctor.availableDays.join(', ')}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  title: {
    ...Typography.h1,
    marginBottom: 20,
    color: Colors.text,
  },
  doctorCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: 4,
  },
  specialty: {
    ...Typography.body,
    color: Colors.primary,
    marginBottom: 4,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  availability: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});

export default DoctorSelection; 