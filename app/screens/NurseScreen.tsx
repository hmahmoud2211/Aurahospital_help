import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Users, MessageCircle, FileText, Pill, Plus, AlertCircle, Bell, Link } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';
import { useAppointmentStore } from '@/store/appointment-store';

export default function NurseScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { appointments, fetchAppointments, isLoading } = useAppointmentStore();
  
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchAppointments(String(user.id), 'nurse');
    }
  }, [user]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await fetchAppointments(String(user.id), 'nurse');
    }
    setRefreshing(false);
  };
  
  // Get today's appointments
  const todaysAppointments = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    return appointments
      .filter(appointment => {
        return appointment.date === todayStr && appointment.status !== 'cancelled';
      })
      .sort((a, b) => {
        return a.time.localeCompare(b.time);
      });
  };

  // Format time to AM/PM
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Get the next upcoming appointment
  const getNextAppointment = () => {
    const appointments = todaysAppointments();
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Find the first appointment that hasn't happened yet
    return appointments.find(apt => apt.time > currentTime);
  };

  const nextAppointment = getNextAppointment();

  // Sample critical patient data (in a real app, this would come from an API)
  const criticalPatients = [
    { id: 1, name: 'Sarah Johnson', status: 'High BP Alert', isAlert: true },
    { id: 2, name: 'Robert Garcia', status: 'Stable', isAlert: false }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nurseText}>nurse</Text>
        </View>
        <TouchableOpacity style={styles.notificationIcon}>
          <Bell size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Today's Schedule */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          
          <View style={styles.timelineContainer}>
            <View style={styles.timeMarker}>
              <View style={styles.timePoint} />
              <Text style={styles.timeText}>8:00</Text>
            </View>
            <View style={styles.timeMarker}>
              <View style={styles.timePoint} />
              <Text style={styles.timeText}>9:30</Text>
            </View>
            <View style={styles.timeMarker}>
              <View style={styles.timePoint} />
              <Text style={styles.timeText}>11:00</Text>
            </View>
            <View style={styles.timeMarker}>
              <View style={styles.timePoint} />
              <Text style={styles.timeText}>2:30</Text>
            </View>
          </View>
          
          <View style={styles.nextAppointment}>
            <Text style={styles.nextAppointmentText}>
              {nextAppointment 
                ? `Next: ${nextAppointment.patientDetails?.name?.[0]?.text || 'Patient'} at ${formatTime(nextAppointment.time)}`
                : 'No more appointments today'}
            </Text>
          </View>
        </View>
        
        {/* Critical Patient Alerts */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Critical Patient Alerts</Text>
          
          {criticalPatients.map(patient => (
            <View key={patient.id} style={styles.alertItem}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={[
                styles.patientStatus, 
                patient.isAlert ? styles.alertStatus : styles.stableStatus
              ]}>
                {patient.status}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.navigate("/patient-search")}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#EEF0FF' }]}>
              <Calendar size={24} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>Schedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Users size={24} color="#2196F3" />
            </View>
            <Text style={styles.actionText}>Patients</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <MessageCircle size={24} color="#4CAF50" />
            </View>
            <Text style={styles.actionText}>Diagnostics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#FFF8E1' }]}>
              <Link size={24} color="#FFC107" />
            </View>
            <Text style={styles.actionText}>Prescribe</Text>
          </TouchableOpacity>
        </View>
        
        {/* Patient Updates */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Patient Updates</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <Text style={styles.loadingText}>Loading updates...</Text>
          ) : todaysAppointments().length > 0 ? (
            todaysAppointments().slice(0, 3).map(appointment => (
              <TouchableOpacity 
                key={appointment.id} 
                style={styles.updateItem}
                onPress={() => router.push({
                  pathname: "/(app)/appointment/[id]",
                  params: { id: appointment.id ? String(appointment.id) : "" }
                })}
              >
                <View style={styles.appointmentDetails}>
                  <Text style={styles.appointmentPatient}>
                    {appointment.patientDetails?.name?.[0]?.text || 'Unknown Patient'}
                  </Text>
                  <Text style={styles.appointmentInfo}>
                    {formatTime(appointment.time)} • {appointment.reason.substring(0, 30)}
                    {appointment.reason.length > 30 ? '...' : ''}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  appointment.status === 'confirmed' ? styles.confirmedBadge :
                  appointment.status === 'completed' ? styles.completedBadge :
                  styles.scheduledBadge
                ]}>
                  <Text style={styles.statusText}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No patient updates today</Text>
          )}
        </View>
      </ScrollView>
      
      {/* Add appointment FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/(app)/appointment/new')}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  nurseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeMarker: {
    alignItems: 'center',
  },
  timePoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: Colors.text,
  },
  nextAppointment: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  nextAppointmentText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  patientName: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  patientStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  alertStatus: {
    color: Colors.danger,
  },
  stableStatus: {
    color: Colors.success,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  updateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentPatient: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  appointmentInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  confirmedBadge: {
    backgroundColor: Colors.primaryLight,
  },
  completedBadge: {
    backgroundColor: Colors.successLight,
  },
  scheduledBadge: {
    backgroundColor: Colors.secondary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
}); 