import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, ChevronLeft, User, FileText } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import { useAppointmentStore } from '@/store/appointment-store';
import axios from 'axios';
import { API_URL } from '@/constants/config';
import { AppointmentStatus } from '@/types/appointment';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

interface Patient {
  id: number;
  name: string;
  email: string;
}

export default function NewAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const patientId = params.patientId ? Number(params.patientId) : undefined;
  const { user } = useAuthStore();
  const { bookAppointment, isLoading } = useAppointmentStore();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [duration, setDuration] = useState('30');
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');
  const [searchDoctor, setSearchDoctor] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchDoctors();
    fetchPatients();
  }, []);
  
  useEffect(() => {
    // Auto-select the patient if patientId is provided
    if (patientId && patients.length > 0) {
      const foundPatient = patients.find(p => p.id === patientId);
      if (foundPatient) {
        setSelectedPatient(foundPatient);
      }
    }
  }, [patientId, patients]);
  
  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await axios.get(`${API_URL}/practitioners/`);
      // Format the data to match our needs
      const formattedDoctors = response.data.map((doctor: any) => ({
        id: doctor.id,
        name: doctor.name[0]?.text || 'Unknown',
        specialty: doctor.specialty?.[0] || 'General'
      }));
      setDoctors(formattedDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };
  
  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await axios.get(`${API_URL}/patients/`);
      // Format the data to match our needs
      const formattedPatients = response.data.map((patient: any) => ({
        id: patient.id,
        name: patient.name[0]?.text || 'Unknown',
        email: patient.email || ''
      }));
      setPatients(formattedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  const getFormattedTime = () => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const getFormattedDate = () => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchDoctor.toLowerCase())
  );
  
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchPatient.toLowerCase())
  );
  
  const validateForm = () => {
    if (!selectedPatient) {
      setError('Please select a patient');
      return false;
    }
    
    if (!selectedDoctor) {
      setError('Please select a doctor');
      return false;
    }
    
    if (!reason.trim()) {
      setError('Please enter a reason for the appointment');
      return false;
    }
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Please select a future date');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const appointmentData = {
      patient_id: selectedPatient?.id,
      doctor_id: selectedDoctor?.id,
      date: getFormattedDate(),
      time: getFormattedTime(),
      duration: parseInt(duration),
      status: 'scheduled' as AppointmentStatus,
      reason,
      notes: notes || undefined,
      follow_up: false
    };
    
    try {
      const success = await bookAppointment(appointmentData);
      if (success) {
        router.back();
      }
    } catch (error) {
      setError('Failed to book appointment. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search patient by name or email"
              value={searchPatient}
              onChangeText={setSearchPatient}
            />
          </View>
          
          {loadingPatients ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : (
            <ScrollView style={styles.searchResults} nestedScrollEnabled={true}>
              {filteredPatients.map(patient => (
                <TouchableOpacity
                  key={patient.id}
                  style={[
                    styles.searchResultItem,
                    selectedPatient?.id === patient.id && styles.selectedItem
                  ]}
                  onPress={() => setSelectedPatient(patient)}
                >
                  <Text style={styles.itemName}>{patient.name}</Text>
                  <Text style={styles.itemDetail}>{patient.email}</Text>
                </TouchableOpacity>
              ))}
              {filteredPatients.length === 0 && (
                <Text style={styles.noResultsText}>No patients found</Text>
              )}
            </ScrollView>
          )}
          
          {selectedPatient && (
            <View style={styles.selectedItemContainer}>
              <Text style={styles.selectedLabel}>Selected Patient:</Text>
              <Text style={styles.selectedValue}>{selectedPatient.name}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctor Information</Text>
          
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctor by name or specialty"
              value={searchDoctor}
              onChangeText={setSearchDoctor}
            />
          </View>
          
          {loadingDoctors ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : (
            <ScrollView style={styles.searchResults} nestedScrollEnabled={true}>
              {filteredDoctors.map(doctor => (
                <TouchableOpacity
                  key={doctor.id}
                  style={[
                    styles.searchResultItem,
                    selectedDoctor?.id === doctor.id && styles.selectedItem
                  ]}
                  onPress={() => setSelectedDoctor(doctor)}
                >
                  <Text style={styles.itemName}>Dr. {doctor.name}</Text>
                  <Text style={styles.itemDetail}>{doctor.specialty}</Text>
                </TouchableOpacity>
              ))}
              {filteredDoctors.length === 0 && (
                <Text style={styles.noResultsText}>No doctors found</Text>
              )}
            </ScrollView>
          )}
          
          {selectedDoctor && (
            <View style={styles.selectedItemContainer}>
              <Text style={styles.selectedLabel}>Selected Doctor:</Text>
              <Text style={styles.selectedValue}>Dr. {selectedDoctor.name} ({selectedDoctor.specialty})</Text>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>
          
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={Colors.textSecondary} />
            <Text style={styles.inputText}>
              {formatDate(date)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowTimePicker(true)}
          >
            <Clock size={20} color={Colors.textSecondary} />
            <Text style={styles.inputText}>
              {formatTime(time)}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.durationContainer}>
            <Text style={styles.durationLabel}>Duration (minutes):</Text>
            <View style={styles.durationButtons}>
              {['15', '30', '45', '60'].map(dur => (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.durationButton,
                    duration === dur && styles.selectedDuration
                  ]}
                  onPress={() => setDuration(dur)}
                >
                  <Text
                    style={[
                      styles.durationButtonText,
                      duration === dur && styles.selectedDurationText
                    ]}
                  >
                    {dur}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <FileText size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Reason for appointment"
              value={reason}
              onChangeText={setReason}
              multiline
            />
          </View>
          
          <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
            <FileText size={20} color={Colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { height: 80 }]}
              placeholder="Additional notes (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
        
        <Button
          title="Book Appointment"
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitButton}
        />
      </ScrollView>
      
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  errorContainer: {
    backgroundColor: Colors.dangerLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    ...Typography.body,
    color: Colors.danger,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  inputText: {
    ...Typography.body,
    color: Colors.text,
    marginLeft: 8,
  },
  searchResults: {
    maxHeight: 200,
    marginBottom: 12,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedItem: {
    backgroundColor: Colors.primaryLight,
  },
  itemName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  itemDetail: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  noResultsText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 12,
  },
  selectedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
    marginRight: 8,
  },
  selectedValue: {
    ...Typography.body,
    color: Colors.text,
  },
  durationContainer: {
    marginBottom: 12,
  },
  durationLabel: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: 8,
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  selectedDuration: {
    backgroundColor: Colors.primary,
  },
  durationButtonText: {
    ...Typography.body,
    color: Colors.text,
  },
  selectedDurationText: {
    color: '#FFFFFF',
  },
  submitButton: {
    marginTop: 24,
  },
  loader: {
    margin: 16,
  },
}); 