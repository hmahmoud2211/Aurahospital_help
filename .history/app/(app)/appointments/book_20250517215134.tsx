import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, ChevronLeft, ChevronRight, User, FileText } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useAppointmentStore } from '@/store/appointment-store';
import { useAuthStore } from '@/store/auth-store';
import { TextInput } from 'react-native';
import { AppointmentStatus } from '@/types/appointment';
import { API_URL } from '@/constants/config';

export default function BookAppointmentScreen() {
  const router = useRouter();
  const { bookAppointment, isLoading, fetchAppointments } = useAppointmentStore();
  const { user } = useAuthStore();
  
  const [specialty, setSpecialty] = useState('Cardiology');
  const [doctors, setDoctors] = useState<any[]>([]); // fetched doctors
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDoctorList, setShowDoctorList] = useState(false);
  const [showSpecialtyList, setShowSpecialtyList] = useState(false);
  
  useEffect(() => {
    // Set default date to today
    const today = new Date();
    setSelectedDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  }, []);
  
  useEffect(() => {
    // Fetch doctors from backend
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${API_URL.replace('/api','')}/practitioners/`);
        const data = await response.json();
        setDoctors(data);
        if (data.length > 0) setSelectedDoctor(data[0]);
      } catch (error) {
        setDoctors([]);
      }
    };
    fetchDoctors();
  }, []);
  
  const specialties = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Pediatrics',
    'Psychiatry',
  ];
  
  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor || !reason) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to book an appointment');
        router.push('/login');
        return;
      }

      const appointmentData = {
        date: selectedDate,
        time: selectedTime,
        duration: 30, // Default duration in minutes
        status: 'scheduled',
        reason: reason,
        patient: parseInt(String(user?.id || '1')), // Convert to string first, then to integer
        doctor: parseInt(String(selectedDoctor.id)), // Convert to string first, then to integer
        notes: null,
        follow_up: false
      };

      console.log('Sending appointment data:', appointmentData);

      const response = await fetch(`${API_URL}/appointments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          alert('Your session has expired. Please log in again.');
          router.push('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to book appointment');
      }

      const data = await response.json();
      console.log('Appointment booked successfully:', data);
      alert('Appointment booked successfully!');
      router.push('/appointments');
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      alert(error.message || 'Failed to book appointment. Please try again.');
    }
  };
  
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay() || 7; // Convert Sunday (0) to 7 for easier calculation
  };
  
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };
  
  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };
  
  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  
  const isDateSelectable = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    return date >= today;
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 1; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = formatDateString(year, month, i);
      const isSelected = dateString === selectedDate;
      const isSelectable = isDateSelectable(dateString);
      
      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.calendarDay,
            isSelected && styles.calendarDaySelected,
            !isSelectable && styles.calendarDayDisabled,
          ]}
          onPress={() => isSelectable && setSelectedDate(dateString)}
          disabled={!isSelectable}
        >
          <Text
            style={[
              styles.calendarDayText,
              isSelected && styles.calendarDayTextSelected,
              !isSelectable && styles.calendarDayTextDisabled,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };
  
  const timeSlots = [
    { display: '9:00 AM', value: '09:00' },
    { display: '10:00 AM', value: '10:00' },
    { display: '11:00 AM', value: '11:00' },
    { display: '1:00 PM', value: '13:00' },
    { display: '2:00 PM', value: '14:00' },
    { display: '3:00 PM', value: '15:00' },
    { display: '4:00 PM', value: '16:00' },
    { display: '5:00 PM', value: '17:00' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title="Book Appointment" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Specialty</Text>
          <TouchableOpacity 
            style={styles.dropdownContainer}
            onPress={() => setShowSpecialtyList(!showSpecialtyList)}
          >
            <Text style={styles.dropdownText}>{specialty}</Text>
            <ChevronDown size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          {showSpecialtyList && (
            <View style={styles.dropdownList}>
              {specialties.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.dropdownItem,
                    specialty === item && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setSpecialty(item);
                    setShowSpecialtyList(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      specialty === item && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Doctor</Text>
          <TouchableOpacity 
            style={styles.doctorSelector}
            onPress={() => setShowDoctorList(!showDoctorList)}
          >
            <View style={styles.doctorAvatarContainer}>
              <User size={24} color={Colors.primary} />
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>
                {selectedDoctor && Array.isArray(selectedDoctor.name) ? selectedDoctor.name[0]?.text : ''}
              </Text>
              <Text style={styles.doctorSpecialty}>
                {selectedDoctor && Array.isArray(selectedDoctor.specialty) ? selectedDoctor.specialty[0] : ''}
              </Text>
            </View>
            <ChevronDown size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          {showDoctorList && (
            <View style={styles.doctorList}>
              {doctors.map((doctor) => (
                <TouchableOpacity
                  key={doctor.id}
                  style={[
                    styles.doctorItem,
                    selectedDoctor?.id === doctor.id && styles.doctorItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedDoctor(doctor);
                    setShowDoctorList(false);
                  }}
                >
                  <View style={styles.doctorItemAvatarContainer}>
                    <User size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.doctorItemInfo}>
                    <Text style={styles.doctorItemName}>
                      {Array.isArray(doctor.name) ? doctor.name[0]?.text : ''}
                    </Text>
                    <Text style={styles.doctorItemSpecialty}>
                      {Array.isArray(doctor.specialty) ? doctor.specialty[0] : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Date</Text>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity style={styles.calendarNavButton} onPress={goToPreviousMonth}>
                <ChevronLeft size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.calendarMonth}>{formatMonthYear(currentMonth)}</Text>
              <TouchableOpacity style={styles.calendarNavButton} onPress={goToNextMonth}>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarDays}>
              <Text style={styles.calendarDayHeader}>Mo</Text>
              <Text style={styles.calendarDayHeader}>Tu</Text>
              <Text style={styles.calendarDayHeader}>We</Text>
              <Text style={styles.calendarDayHeader}>Th</Text>
              <Text style={styles.calendarDayHeader}>Fr</Text>
              <Text style={styles.calendarDayHeader}>Sa</Text>
              <Text style={styles.calendarDayHeader}>Su</Text>
            </View>
            
            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Time Slot</Text>
          <View style={styles.timeSlotContainer}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.value}
                style={[
                  styles.timeSlot,
                  selectedTime === slot.value && styles.timeSlotSelected,
                ]}
                onPress={() => setSelectedTime(slot.value)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTime === slot.value && styles.timeSlotTextSelected,
                  ]}
                >
                  {slot.display}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Reason for Visit</Text>
          <View style={styles.reasonContainer}>
            <FileText size={20} color={Colors.textSecondary} style={styles.reasonIcon} />
            <TextInput
              style={styles.reasonInput}
              placeholder="Describe your symptoms or reason for visit"
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
            />
          </View>
        </View>
        
        {selectedDate && selectedTime && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Appointment Summary</Text>
            <Text style={styles.summaryText}>
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            <Text style={styles.summaryText}>
              at {selectedTime.split(':')[0]}:
              {selectedTime.split(':')[1]} 
              {parseInt(selectedTime.split(':')[0]) >= 12 ? ' PM' : ' AM'}
            </Text>
            <Text style={styles.summaryText}>
              with Dr. {selectedDoctor && Array.isArray(selectedDoctor.name) ? selectedDoctor.name[0]?.text : ''}
            </Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Book Appointment"
          onPress={handleBookAppointment}
          fullWidth
          loading={isLoading}
          disabled={!selectedDate || !selectedTime || !reason || !selectedDoctor}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    ...Typography.label,
    marginBottom: 8,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    ...Typography.body,
  },
  dropdownList: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  dropdownItemText: {
    ...Typography.body,
  },
  dropdownItemTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  doctorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
  },
  doctorAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  doctorSpecialty: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  doctorList: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  doctorItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  doctorItemAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorItemInfo: {
    flex: 1,
  },
  doctorItemName: {
    ...Typography.body,
    fontWeight: '500',
  },
  doctorItemSpecialty: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  calendarContainer: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNavButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarMonth: {
    ...Typography.body,
    fontWeight: '500',
  },
  calendarDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calendarDayHeader: {
    ...Typography.caption,
    color: Colors.textSecondary,
    width: 32,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDay: {
    width: '14.28%',
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  calendarDaySelected: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    ...Typography.body,
  },
  calendarDayTextSelected: {
    color: Colors.background,
    fontWeight: '500',
  },
  calendarDayTextDisabled: {
    color: Colors.textLight,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  timeSlot: {
    width: '25%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  timeSlotSelected: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  timeSlotText: {
    ...Typography.body,
    textAlign: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  timeSlotTextSelected: {
    color: Colors.background,
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    fontWeight: '500',
  },
  reasonContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'flex-start',
  },
  reasonIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  reasonInput: {
    flex: 1,
    ...Typography.body,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  summaryContainer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  summaryTitle: {
    ...Typography.h5,
    marginBottom: 8,
  },
  summaryText: {
    ...Typography.body,
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});