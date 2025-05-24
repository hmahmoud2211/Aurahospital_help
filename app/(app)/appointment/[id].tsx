import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, ChevronLeft, User, FileText, MapPin, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import { useAppointmentStore } from '@/store/appointment-store';
import { AppointmentStatus } from '@/types/appointment';

export default function AppointmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    selectedAppointment, 
    fetchAppointmentById, 
    updateAppointmentStatus, 
    cancelAppointment,
    isLoading 
  } = useAppointmentStore();
  
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchAppointmentById(String(id));
    }
  }, [id]);
  
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
  
  const handleStatusChange = async (status: AppointmentStatus) => {
    if (!selectedAppointment) return;
    
    setUpdatingStatus(true);
    try {
      const success = await updateAppointmentStatus(String(selectedAppointment.id), status);
      if (!success) {
        Alert.alert('Error', 'Failed to update appointment status');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update appointment status');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await cancelAppointment(String(selectedAppointment.id));
              if (success) {
                router.back();
              } else {
                Alert.alert('Error', 'Failed to cancel appointment');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          }
        },
      ]
    );
  };
  
  if (isLoading || !selectedAppointment) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointment Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading appointment details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(selectedAppointment.status) }]} />
          <Text style={styles.statusText}>{formatStatus(selectedAppointment.status)}</Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{formatDate(selectedAppointment.date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>
              {formatTime(selectedAppointment.time)} ({selectedAppointment.duration} minutes)
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient</Text>
          <View style={styles.infoRow}>
            <User size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>
              {selectedAppointment.patientDetails?.name?.[0]?.text || 'Unknown'}
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctor</Text>
          <View style={styles.infoRow}>
            <User size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>
              Dr. {selectedAppointment.doctorDetails?.name?.[0]?.text || 'Unknown'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Specialty:</Text>
            <Text style={styles.infoValue}>
              {selectedAppointment.doctorDetails?.specialty?.[0] || 'General'}
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason</Text>
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonText}>{selectedAppointment.reason}</Text>
          </View>
        </View>
        
        {selectedAppointment.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonText}>{selectedAppointment.notes}</Text>
            </View>
          </View>
        )}
        
        {/* Status management for nurses */}
        {user?.role === 'nurse' && selectedAppointment.status !== 'cancelled' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manage Status</Text>
            <View style={styles.buttonsContainer}>
              {selectedAppointment.status !== 'confirmed' && (
                <Button
                  title="Confirm"
                  icon={<CheckCircle size={20} color="#FFF" />}
                  onPress={() => handleStatusChange('confirmed')}
                  style={[styles.actionButton, { backgroundColor: Colors.success }]}
                  loading={updatingStatus}
                />
              )}
              
              {selectedAppointment.status !== 'completed' && (
                <Button
                  title="Complete"
                  icon={<CheckCircle size={20} color="#FFF" />}
                  onPress={() => handleStatusChange('completed')}
                  style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                  loading={updatingStatus}
                />
              )}
              
              <Button
                title="Cancel"
                icon={<XCircle size={20} color="#FFF" />}
                onPress={handleCancelAppointment}
                style={[styles.actionButton, { backgroundColor: Colors.danger }]}
                loading={updatingStatus}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
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
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
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
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    ...Typography.h3,
    color: Colors.text,
  },
  section: {
    marginBottom: 24,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: 8,
    marginRight: 8,
    width: 70,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  reasonContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  reasonText: {
    ...Typography.body,
    color: Colors.text,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 8,
  },
}); 