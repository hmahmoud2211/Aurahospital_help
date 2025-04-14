import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useAppointmentStore } from '@/store/appointment-store';

export default function RescheduleAppointmentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { selectedAppointment, fetchAppointmentById, rescheduleAppointment, isLoading } = useAppointmentStore();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  useEffect(() => {
    if (id) {
      fetchAppointmentById(id as string);
    }
  }, [id]);
  
  useEffect(() => {
    if (selectedAppointment) {
      setSelectedDate(selectedAppointment.date);
      setSelectedTime(selectedAppointment.time);
      setCurrentMonth(new Date(selectedAppointment.date));
    }
  }, [selectedAppointment]);
  
  if (!selectedAppointment) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <Header title="Reschedule Appointment" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading appointment details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time for your appointment.');
      return;
    }
    
    const success = await rescheduleAppointment(selectedAppointment.id, selectedDate, selectedTime);
    
    if (success) {
      Alert.alert('Success', 'Your appointment has been rescheduled.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
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
      <Header title="Reschedule Appointment" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select New Date</Text>
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
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select New Time</Text>
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
        
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Appointment Summary</Text>
          <Text style={styles.summaryText}>
            {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
          </Text>
          <Text style={styles.summaryText}>
            {selectedTime ? `at ${selectedTime.split(':')[0]}:${selectedTime.split(':')[1]} ${parseInt(selectedTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}` : 'Select a time'}
          </Text>
          <Text style={styles.summaryText}>
            with Dr. {selectedAppointment.doctor?.name}
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Confirm Reschedule"
          onPress={handleReschedule}
          loading={isLoading}
          fullWidth
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.label,
    marginBottom: 8,
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
  summaryContainer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
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