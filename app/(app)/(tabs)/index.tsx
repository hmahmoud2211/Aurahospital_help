import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Calendar, MessageSquare, FileText, Pill, UserIcon, AlertTriangle, Phone } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';
import { usePatientStore } from '@/store/patient-store';
import { useAppointmentStore } from '@/store/appointment-store';
import HealthMetricCard from '@/components/HealthMetricCard';
import AppointmentCard from '@/components/AppointmentCard';
import * as Notifications from 'expo-notifications';
import { NotificationTriggerInput } from 'expo-notifications';

// Define the Colors type
interface AppColors {
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  background: string;
  text: string;
  textSecondary: string;
  card: string;
  border: string;
  error: string;
  errorLight: string;
}

const ExtendedColors: AppColors = {
  ...Colors,
  error: '#FF3333',
  errorLight: '#FFEEEE',
};

// Define the HealthMetricCardProps interface
interface HealthMetricCardProps {
  title: string;
  value: number | string;
  unit: string;
  isCritical?: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentPatient, vitalSigns, setCurrentPatient } = usePatientStore();
  const { upcomingAppointments, fetchAppointments } = useAppointmentStore();
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);

  // Redirect pharmacists to pharmacy management dashboard
  useEffect(() => {
    if (user?.role === 'pharmacist') {
      router.replace('/(app)/(tabs)/pharmacy-management');
      return;
    }
  }, [user, router]);

  // Debug: Log user data
  console.log('User object:', user);
  console.log('User role:', user?.role);

  // Fallback user data for debugging
  const fallbackUser = {
    id: 'fallback-id',
    name: 'Test User',
    role: 'patient',
  };
  const effectiveUser = user || fallbackUser;

  useEffect(() => {
    if (effectiveUser) {
      if (effectiveUser.role === 'patient') {
        setCurrentPatient(String(effectiveUser.id));
        fetchAppointments(String(effectiveUser.id), effectiveUser.role);
      } else if (effectiveUser.role === 'doctor') {
        fetchAppointments(String(effectiveUser.id), effectiveUser.role);
      }
    }
  }, [effectiveUser]);

  const defaultVitalSigns = {
    heartRate: 72,
    bloodPressure: {
      systolic: 120,
      diastolic: 80,
    },
    glucose: 98,
  };

  const currentVitals = {
    heartRate: vitalSigns?.current?.heartRate ?? defaultVitalSigns.heartRate,
    bloodPressure: {
      systolic: vitalSigns?.current?.bloodPressure?.systolic ?? defaultVitalSigns.bloodPressure.systolic,
      diastolic: vitalSigns?.current?.bloodPressure?.diastolic ?? defaultVitalSigns.bloodPressure.diastolic,
    },
    glucose: vitalSigns?.current?.glucose ?? defaultVitalSigns.glucose,
  };

  useEffect(() => {
    const checkEmergencyConditions = () => {
      if (currentVitals.heartRate > 100 || currentVitals.heartRate < 60) {
        setEmergencyAlert('Heart rate critical: Immediate attention required');
      } else if (currentVitals.bloodPressure.systolic > 180 || currentVitals.bloodPressure.diastolic > 120) {
        setEmergencyAlert('Blood pressure critical: Immediate attention required');
      } else if (currentVitals.glucose > 250 || currentVitals.glucose < 70) {
        setEmergencyAlert('Glucose levels critical: Immediate attention required');
      } else {
        setEmergencyAlert(null);
      }
    };
    checkEmergencyConditions();
  }, [currentVitals]);

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Contact',
      'Call emergency services?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 911', onPress: () => console.log('Calling emergency services...') },
      ]
    );
  };

  const renderEmergencyBanner = () => {
    if (!emergencyAlert) return null;
    return (
      <View style={styles.emergencyBanner}>
        <AlertTriangle size={24} color={ExtendedColors.error} />
        <Text style={styles.emergencyText}>{emergencyAlert}</Text>
        <TouchableOpacity style={styles.emergencyCallButton} onPress={handleEmergencyCall}>
          <Phone size={20} color={ExtendedColors.background} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPatientDashboard = () => {
    console.log('Rendering Patient Dashboard');
    return (
      <>
        {renderEmergencyBanner()}
        
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Hello,</Text>
            <Text style={styles.userName}>{effectiveUser?.name || 'Patient'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={ExtendedColors.text || '#000000'} />
          </TouchableOpacity>
        </View>

        <View style={styles.criticalCareSection}>
          <Text style={styles.sectionTitle}>Critical Care Monitoring</Text>
          <View style={styles.criticalCareContainer}>
            <View style={styles.criticalCareItem}>
              <Text style={styles.criticalCareLabel}>Heart Rate Status</Text>
              <Text style={[
                styles.criticalCareValue,
                currentVitals.heartRate > 100 || currentVitals.heartRate < 60 ? styles.critical : styles.normal
              ]}>
                {currentVitals.heartRate > 100 || currentVitals.heartRate < 60 ? 'CRITICAL' : 'NORMAL'}
              </Text>
            </View>
            <View style={styles.criticalCareItem}>
              <Text style={styles.criticalCareLabel}>Blood Pressure Status</Text>
              <Text style={[
                styles.criticalCareValue,
                currentVitals.bloodPressure.systolic > 180 || currentVitals.bloodPressure.diastolic > 120 ? styles.critical : styles.normal
              ]}>
                {currentVitals.bloodPressure.systolic > 180 || currentVitals.bloodPressure.diastolic > 120 ? 'CRITICAL' : 'NORMAL'}
              </Text>
            </View>
            <View style={styles.criticalCareItem}>
              <Text style={styles.criticalCareLabel}>Glucose Status</Text>
              <Text style={[
                styles.criticalCareValue,
                currentVitals.glucose > 250 || currentVitals.glucose < 70 ? styles.critical : styles.normal
              ]}>
                {currentVitals.glucose > 250 || currentVitals.glucose < 70 ? 'CRITICAL' : 'NORMAL'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsSection}>
          <Link href="/(app)/(tabs)/appointments" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: ExtendedColors.primaryLight || '#E0F7FA' }]}>
                <Calendar size={24} color={ExtendedColors.primary || '#007BFF'} />
              </View>
              <Text style={styles.actionText}>Appointments</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/(app)/(tabs)/chat" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <MessageSquare size={24} color={ExtendedColors.info || '#2196F3'} />
              </View>
              <Text style={styles.actionText}>Chat with AI</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/(app)/(tabs)/records" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <FileText size={24} color={ExtendedColors.success || '#008000'} />
              </View>
              <Text style={styles.actionText}>Upload Docs</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/(app)/(tabs)/pharmacy" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Pill size={24} color="#FF9800" />
              </View>
              <Text style={styles.actionText}>Pharmacy</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.upcomingAppointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity onPress={() => router.push('/appointments')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.slice(0, 2).map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <View style={styles.noAppointmentsContainer}>
              <Text style={styles.noAppointmentsText}>No upcoming appointments</Text>
              <TouchableOpacity 
                style={styles.bookAppointmentButton}
                onPress={() => router.push('/appointments/book')}
              >
                <Text style={styles.bookAppointmentText}>Book Appointment</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </>
    );
  };

  const renderDoctorDashboard = () => {
    console.log('Rendering Doctor Dashboard');
    return (
      <>
        {renderEmergencyBanner()}
        
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{effectiveUser?.name || 'Doctor'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={ExtendedColors.text || '#000000'} />
          </TouchableOpacity>
        </View>

        <View style={styles.todayScheduleSection}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <View style={styles.scheduleContainer}>
            <View style={styles.timeSlots}>
              <View style={[styles.timeSlot, styles.timeSlotActive]}>
                <Text style={styles.timeSlotText}>8:00</Text>
                <View style={styles.timeSlotDot} />
              </View>
              <View style={[styles.timeSlot, styles.timeSlotActive]}>
                <Text style={styles.timeSlotText}>9:30</Text>
                <View style={styles.timeSlotDot} />
              </View>
              <View style={[styles.timeSlot, styles.timeSlotActive]}>
                <Text style={styles.timeSlotText}>11:00</Text>
                <View style={styles.timeSlotDot} />
              </View>
              <View style={[styles.timeSlot, styles.timeSlotActive, styles.timeSlotCurrent]}>
                <Text style={styles.timeSlotText}>2:30</Text>
                <View style={styles.timeSlotDot} />
              </View>
            </View>
            <Text style={styles.nextPatientText}>
              Next: Sarah Johnson at 2:30 PM
            </Text>
          </View>
        </View>

        <View style={styles.criticalCareSection}>
          <Text style={styles.sectionTitle}>Critical Patient Alerts</Text>
          <View style={styles.criticalCareContainer}>
            <View style={styles.criticalCareItem}>
              <Text style={styles.criticalCareLabel}>Sarah Johnson</Text>
              <Text style={[styles.criticalCareValue, styles.critical]}>High BP Alert</Text>
            </View>
            <View style={styles.criticalCareItem}>
              <Text style={styles.criticalCareLabel}>Robert Garcia</Text>
              <Text style={[styles.criticalCareValue, styles.normal]}>Stable</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsSection}>
          <Link href="/(app)/(tabs)/appointments" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: ExtendedColors.primaryLight || '#E0F7FA' }]}>
                <Calendar size={24} color={ExtendedColors.primary || '#007BFF'} />
              </View>
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/patients" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <FileText size={24} color={ExtendedColors.info || '#2196F3'} />
              </View>
              <Text style={styles.actionText}>Patients</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/diagnostic-tools" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <MessageSquare size={24} color={ExtendedColors.success || '#008000'} />
              </View>
              <Text style={styles.actionText}>Diagnostics</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/(app)/(tabs)/pharmacy" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Pill size={24} color="#FF9800" />
              </View>
              <Text style={styles.actionText}>Prescribe</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.patientUpdatesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Patient Updates</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.slice(0, 5).map((appointment) => (
              <View key={String(appointment.id)} style={styles.patientCard}>
                <View style={styles.patientCardHeader}>
                  <View style={styles.patientIconContainer}>
                    <UserIcon size={20} color={ExtendedColors.primary || '#007BFF'} />
                  </View>
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>
                      {(() => {
                        const patientDetails = appointment.patientDetails;
                        if (!patientDetails?.name) return 'Unknown Patient';
                        
                        if (Array.isArray(patientDetails.name)) {
                          return patientDetails.name[0]?.text || 'Unknown Patient';
                        }
                        
                        if (typeof patientDetails.name === 'object') {
                          return patientDetails.name?.text || 'Unknown Patient';
                        }
                        
                        return patientDetails.name || 'Unknown Patient';
                      })()}
                    </Text>
                    <Text style={styles.patientReason}>
                      Reason: {appointment.reason}
                    </Text>
                  </View>
                  <Text style={styles.appointmentTime}>{appointment.time}</Text>
                </View>
                <View style={styles.patientCardActions}>
                  <TouchableOpacity 
                    style={styles.patientCardButton}
                    onPress={() => {
                      const patientId = appointment.patientDetails?.id || appointment.patient_id;
                      console.log('Navigating to patient-monitoring for patientId:', patientId);
                      router.push(`/patient-monitoring?patientId=${patientId}`);
                    }}
                  >
                    <Text style={styles.patientCardButtonText}>View Records</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.patientCardButton}
                    onPress={() => router.push('/(app)/(tabs)/chat')}
                  >
                    <Text style={styles.patientCardButtonText}>Send Message</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noAppointmentsText}>No patient updates</Text>
          )}
        </View>
      </>
    );
  };

  // Schedule reminders for upcoming appointments
  useEffect(() => {
    async function scheduleReminders() {
      // Only schedule notifications on native platforms
      if (Platform.OS === 'web') {
        console.log('Notifications are not supported on web platform');
        return;
      }

      for (const appointment of upcomingAppointments) {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        const reminderTime = new Date(appointmentDate.getTime() - 30 * 60 * 1000); // 30 min before
        if (reminderTime > new Date()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Appointment Reminder',
              body: `You have an appointment at ${appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              data: { appointmentId: appointment.id },
            },
            trigger: {
              seconds: Math.floor((reminderTime.getTime() - Date.now()) / 1000),
            } as NotificationTriggerInput,
          });
        }
      }
    }
    if (upcomingAppointments && upcomingAppointments.length > 0) {
      scheduleReminders();
    }
  }, [upcomingAppointments]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {effectiveUser.role === 'patient' ? renderPatientDashboard() : renderDoctorDashboard()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ExtendedColors.background || '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: ExtendedColors.textSecondary || '#707070',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ExtendedColors.text || '#000000',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ExtendedColors.card || '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyBanner: {
    backgroundColor: ExtendedColors.errorLight || '#ffebee',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyText: {
    fontSize: 14,
    color: ExtendedColors.text || '#000000',
    marginBottom: 8,
  },
  emergencyCallButton: {
    backgroundColor: ExtendedColors.error || '#d32f2f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  criticalCareSection: {
    backgroundColor: ExtendedColors.card || '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: ExtendedColors.text || '#000000',
  },
  criticalCareContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  criticalCareItem: {
    width: '48%',
    marginBottom: 12,
  },
  criticalCareLabel: {
    fontSize: 14,
    color: ExtendedColors.textSecondary || '#707070',
    marginBottom: 4,
  },
  criticalCareValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  normal: {
    color: ExtendedColors.success || '#4caf50',
  },
  critical: {
    color: ExtendedColors.error || '#d32f2f',
  },
  quickActionsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    backgroundColor: ExtendedColors.card || '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: ExtendedColors.text || '#000000',
    fontWeight: '500',
  },
  upcomingAppointmentsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: ExtendedColors.primary || '#007BFF',
  },
  noAppointmentsContainer: {
    backgroundColor: ExtendedColors.card || '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noAppointmentsText: {
    fontSize: 14,
    color: ExtendedColors.textSecondary || '#707070',
    marginBottom: 12,
  },
  bookAppointmentButton: {
    backgroundColor: ExtendedColors.primary || '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bookAppointmentText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  todayScheduleSection: {
    backgroundColor: ExtendedColors.card || '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleContainer: {
    
  },
  timeSlots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeSlot: {
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 14,
    color: ExtendedColors.textSecondary || '#707070',
    marginBottom: 4,
  },
  timeSlotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ExtendedColors.primary || '#007BFF',
  },
  timeSlotActive: {
    
  },
  timeSlotCurrent: {
    
  },
  nextPatientText: {
    fontSize: 16,
    fontWeight: '500',
    color: ExtendedColors.text || '#000000',
  },
  patientUpdatesSection: {
    marginBottom: 24,
  },
  patientCard: {
    backgroundColor: ExtendedColors.card || '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  patientCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ExtendedColors.primaryLight || '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  patientReason: {
    ...Typography.caption,
    color: ExtendedColors.textSecondary || '#808080',
  },
  appointmentTime: {
    ...Typography.body,
    color: ExtendedColors.primary || '#007BFF',
    fontWeight: '500',
  },
  patientCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  patientCardButton: {
    flex: 1,
    backgroundColor: ExtendedColors.secondary || '#E0E0E0',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  patientCardButtonText: {
    ...Typography.caption,
    color: ExtendedColors.primary || '#007BFF',
    fontWeight: '500',
  },
});