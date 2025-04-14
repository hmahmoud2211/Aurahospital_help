import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Calendar, MessageSquare, FileText, Pill, UserIcon } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';
import { usePatientStore } from '@/store/patient-store';
import { useAppointmentStore } from '@/store/appointment-store';
import HealthMetricCard from '@/components/HealthMetricCard';
import AppointmentCard from '@/components/AppointmentCard';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentPatient, vitalSigns, setCurrentPatient } = usePatientStore();
  const { upcomingAppointments, fetchAppointments } = useAppointmentStore();

  useEffect(() => {
    if (user) {
      if (user.role === 'patient') {
        setCurrentPatient(user.id);
        fetchAppointments(user.id, user.role);
      } else if (user.role === 'doctor') {
        fetchAppointments(user.id, user.role);
      }
    }
  }, [user]);

  // Default empty vital signs to prevent undefined errors
  const defaultVitalSigns = {
    heartRate: 72,
    bloodPressure: {
      systolic: 120,
      diastolic: 80,
    },
    glucose: 98,
  };

  // Use default values if vitalSigns or vitalSigns.current is undefined
  const currentVitals = vitalSigns?.current || defaultVitalSigns;

  const renderPatientDashboard = () => {
    return (
      <>
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Hello,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.healthSummarySection}>
          <Text style={styles.sectionTitle}>Quick Health Summary</Text>
          <View style={styles.healthMetricsContainer}>
            <View style={styles.healthMetricItem}>
              <HealthMetricCard
                title="Heart Rate"
                value={currentVitals.heartRate || 72}
                unit="BPM"
              />
            </View>
            <View style={styles.healthMetricItem}>
              <HealthMetricCard
                title="Blood Pressure"
                value={`${currentVitals.bloodPressure?.systolic || 120}/${currentVitals.bloodPressure?.diastolic || 80}`}
                unit="mmHg"
              />
            </View>
            <View style={styles.healthMetricItem}>
              <HealthMetricCard
                title="Glucose"
                value={currentVitals.glucose || 98}
                unit="mg/dL"
              />
            </View>
          </View>
        </View>

        <View style={styles.quickActionsSection}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/appointments/book')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: Colors.primaryLight }]}>
              <Calendar size={24} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>Appointments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/chat/ai-assistant')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <MessageSquare size={24} color={Colors.info} />
            </View>
            <Text style={styles.actionText}>Chat with AI</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/medical-records/upload')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <FileText size={24} color={Colors.success} />
            </View>
            <Text style={styles.actionText}>Upload Docs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/pharmacy')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Pill size={24} color="#FF9800" />
            </View>
            <Text style={styles.actionText}>Pharmacy</Text>
          </TouchableOpacity>
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
    return (
      <>
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={Colors.text} />
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

        <View style={styles.quickActionsSection}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/appointments')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: Colors.primaryLight }]}>
              <Calendar size={24} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>Schedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/patient-monitoring')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <FileText size={24} color={Colors.info} />
            </View>
            <Text style={styles.actionText}>Patients</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/diagnostic-tools')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <MessageSquare size={24} color={Colors.success} />
            </View>
            <Text style={styles.actionText}>Diagnostics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/pharmacy')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Pill size={24} color="#FF9800" />
            </View>
            <Text style={styles.actionText}>Prescribe</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.patientUpdatesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Patient Updates</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.patientCard}>
            <View style={styles.patientCardHeader}>
              <View style={styles.patientIconContainer}>
                <UserIcon size={20} color={Colors.primary} />
              </View>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>Sarah Johnson</Text>
                <Text style={styles.patientReason}>Reason: Follow-up on cardiogram results</Text>
              </View>
              <Text style={styles.appointmentTime}>2:30 PM</Text>
            </View>
            <View style={styles.patientCardActions}>
              <TouchableOpacity 
                style={styles.patientCardButton}
                onPress={() => router.push('/records')}
              >
                <Text style={styles.patientCardButtonText}>View Records</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.patientCardButton}
                onPress={() => router.push('/chat/p1')}
              >
                <Text style={styles.patientCardButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.patientCard}>
            <View style={styles.patientCardHeader}>
              <View style={styles.patientIconContainer}>
                <UserIcon size={20} color={Colors.primary} />
              </View>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>Robert Garcia</Text>
                <Text style={styles.patientReason}>Reason: Blood pressure monitoring</Text>
              </View>
              <Text style={styles.appointmentTime}>4:00 PM</Text>
            </View>
            <View style={styles.patientCardActions}>
              <TouchableOpacity 
                style={styles.patientCardButton}
                onPress={() => router.push('/records')}
              >
                <Text style={styles.patientCardButtonText}>View Records</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.patientCardButton}
                onPress={() => router.push('/chat/p2')}
              >
                <Text style={styles.patientCardButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {user?.role === 'patient' ? renderPatientDashboard() : renderDoctorDashboard()}
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
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  userName: {
    ...Typography.h2,
    color: Colors.text,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  healthSummarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: 16,
  },
  healthMetricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  healthMetricItem: {
    width: '33.33%',
    paddingHorizontal: 8,
  },
  quickActionsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    marginHorizontal: -8,
  },
  actionCard: {
    width: '25%',
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    ...Typography.caption,
    textAlign: 'center',
  },
  upcomingAppointmentsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    ...Typography.body,
    color: Colors.primary,
  },
  noAppointmentsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noAppointmentsText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  bookAppointmentButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookAppointmentText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '500',
  },
  todayScheduleSection: {
    marginBottom: 24,
  },
  scheduleContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeSlots: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  timeSlot: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  timeSlotActive: {
    backgroundColor: Colors.primaryLight,
  },
  timeSlotCurrent: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  timeSlotText: {
    ...Typography.body,
    color: Colors.primary,
    marginBottom: 4,
  },
  timeSlotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  nextPatientText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  patientUpdatesSection: {
    marginBottom: 24,
  },
  patientCard: {
    backgroundColor: Colors.card,
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
    backgroundColor: Colors.primaryLight,
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
    color: Colors.textSecondary,
  },
  appointmentTime: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
  },
  patientCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  patientCardButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  patientCardButtonText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '500',
  },
});