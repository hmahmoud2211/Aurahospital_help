import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, User, FileText, Share2, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useAppointmentStore } from '@/store/appointment-store';

export default function AppointmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { fetchAppointmentById, selectedAppointment, cancelAppointment, isLoading } = useAppointmentStore();
  const [showRescheduleOptions, setShowRescheduleOptions] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchAppointmentById(id as string);
    }
  }, [id]);
  
  if (!selectedAppointment) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <Header title="Appointment Details" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading appointment details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  const getStatusColor = () => {
    switch (selectedAppointment.status) {
      case 'confirmed':
        return Colors.primary;
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.danger;
      case 'no-show':
        return Colors.warning;
      default:
        return Colors.info;
    }
  };
  
  const handleCancelAppointment = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelAppointment(selectedAppointment.id);
            if (success) {
              Alert.alert('Success', 'Your appointment has been cancelled.');
              router.back();
            }
          },
        },
      ]
    );
  };
  
  const handleReschedule = () => {
    router.push({
      pathname: '/appointments/reschedule',
      params: { id: selectedAppointment.id }
    });
  };
  
  const handleShare = () => {
    const message = `Appointment with ${selectedAppointment.doctor?.name} on ${formatDate(selectedAppointment.date)} at ${formatTime(selectedAppointment.time)}`;
    
    if (Platform.OS === 'web') {
      Alert.alert('Share', 'Sharing is not available on web.');
      return;
    }
    
    // In a real app, you would use the Share API
    Alert.alert('Share', 'Appointment details copied to clipboard.');
  };
  
  const isUpcoming = () => {
    const appointmentDate = new Date(`${selectedAppointment.date}T${selectedAppointment.time}`);
    return appointmentDate > new Date();
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title="Appointment Details" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.status}>{selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Doctor</Text>
            <View style={styles.doctorContainer}>
              <View style={styles.doctorAvatarContainer}>
                <User size={24} color={Colors.primary} />
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{selectedAppointment.doctor?.name}</Text>
                <Text style={styles.doctorSpecialty}>{selectedAppointment.doctor?.specialty}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date & Time</Text>
            <View style={styles.infoRow}>
              <Calendar size={20} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{formatDate(selectedAppointment.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Clock size={20} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{formatTime(selectedAppointment.time)} ({selectedAppointment.duration} min)</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.infoRow}>
              <MapPin size={20} color={Colors.textSecondary} />
              <Text style={styles.infoText}>Main Hospital, Floor 3, Room 302</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reason</Text>
            <View style={styles.reasonContainer}>
              <FileText size={20} color={Colors.textSecondary} />
              <Text style={styles.reasonText}>{selectedAppointment.reason}</Text>
            </View>
          </View>
          
          {selectedAppointment.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{selectedAppointment.notes}</Text>
            </View>
          )}
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Share2 size={20} color={Colors.primary} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            
            {isUpcoming() && selectedAppointment.status !== 'cancelled' && (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={handleReschedule}>
                  <Calendar size={20} color={Colors.primary} />
                  <Text style={styles.actionText}>Reschedule</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton} onPress={handleCancelAppointment}>
                  <AlertCircle size={20} color={Colors.danger} />
                  <Text style={[styles.actionText, { color: Colors.danger }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        
        {isUpcoming() && selectedAppointment.status !== 'cancelled' && (
          <View style={styles.reminderCard}>
            <Text style={styles.reminderTitle}>Appointment Reminder</Text>
            <Text style={styles.reminderText}>
              Please arrive 15 minutes before your scheduled appointment time. 
              Bring your insurance card and any relevant medical records.
            </Text>
          </View>
        )}
      </ScrollView>
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
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  status: {
    ...Typography.body,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...Typography.label,
    marginBottom: 8,
  },
  doctorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    ...Typography.body,
    marginLeft: 12,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reasonText: {
    ...Typography.body,
    marginLeft: 12,
    flex: 1,
  },
  notesText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    ...Typography.caption,
    color: Colors.primary,
    marginTop: 4,
  },
  reminderCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reminderTitle: {
    ...Typography.h5,
    color: Colors.primary,
    marginBottom: 8,
  },
  reminderText: {
    ...Typography.body,
    color: Colors.text,
  },
});