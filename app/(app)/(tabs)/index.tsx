import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Calendar, MessageSquare, FileText, Pill, UserIcon, AlertTriangle, Phone, DollarSign } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';
import { usePatientStore } from '@/store/patient-store';
import { useAppointmentStore } from '@/store/appointment-store';
import HealthMetricCard from '@/components/HealthMetricCard';
import AppointmentCard from '@/components/AppointmentCard';

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
        setCurrentPatient(effectiveUser.id);
        fetchAppointments(effectiveUser.id, effectiveUser.role);
      } else if (effectiveUser.role === 'doctor') {
        fetchAppointments(effectiveUser.id, effectiveUser.role);
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

  // Mock financial data (replace with real data from a store or API)
  const financialOverview = {
    totalExpenses: 1500.00,
    insuranceCoverage: 1200.00,
    outstandingBalance: 300.00,
    paymentStatus: 'Partially Paid',
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

  const renderFinancialOverview = () => {
    console.log('Rendering Financial Overview Section');
    return (
      <View style={styles.financialOverviewSection}>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        {financialOverview ? (
          <View style={styles.financialContainer}>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Total Expenses</Text>
              <Text style={styles.financialValue}>${financialOverview.totalExpenses.toFixed(2)}</Text>
            </View>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Insurance Coverage</Text>
              <Text style={styles.financialValue}>${financialOverview.insuranceCoverage.toFixed(2)}</Text>
            </View>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Outstanding Balance</Text>
              <Text style={[styles.financialValue, financialOverview.outstandingBalance > 0 ? styles.warning : styles.success]}>
                ${financialOverview.outstandingBalance.toFixed(2)}
              </Text>
            </View>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Payment Status</Text>
              <Text style={[styles.financialValue, financialOverview.paymentStatus === 'Unpaid' ? styles.danger : styles.success]}>
                {financialOverview.paymentStatus}
              </Text>
            </View>
            <TouchableOpacity style={styles.paymentButton} onPress={() => router.push('/payments')}>
              <DollarSign size={20} color={ExtendedColors.background || '#FFFFFF'} />
              <Text style={styles.paymentButtonText}>Manage Payments</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.noDataText}>No financial data available</Text>
        )}
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

        <View style={styles.healthSummarySection}>
          <Text style={styles.sectionTitle}>Quick Health Summary</Text>
          <View style={styles.healthMetricsContainer}>
            <View style={styles.healthMetricItem}>
              <HealthMetricCard
                title="Heart Rate"
                value={currentVitals.heartRate}
                unit="BPM"
                isCritical={currentVitals.heartRate > 100 || currentVitals.heartRate < 60}
              />
            </View>
            <View style={styles.healthMetricItem}>
              <HealthMetricCard
                title="Blood Pressure"
                value={`${currentVitals.bloodPressure.systolic}/${currentVitals.bloodPressure.diastolic}`}
                unit="mmHg"
                isCritical={currentVitals.bloodPressure.systolic > 180 || currentVitals.bloodPressure.diastolic > 120}
              />
            </View>
            <View style={styles.healthMetricItem}>
              <HealthMetricCard
                title="Glucose"
                value={currentVitals.glucose}
                unit="mg/dL"
                isCritical={currentVitals.glucose > 250 || currentVitals.glucose < 70}
              />
            </View>
          </View>
        </View>

        {renderFinancialOverview()}

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

        {renderFinancialOverview()}

        <View style={styles.quickActionsSection}>
          <Link href="/(app)/(tabs)/appointments" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: ExtendedColors.primaryLight || '#E0F7FA' }]}>
                <Calendar size={24} color={ExtendedColors.primary || '#007BFF'} />
              </View>
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/patient-monitoring" asChild>
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
          
          <View style={styles.patientCard}>
            <View style={styles.patientCardHeader}>
              <View style={styles.patientIconContainer}>
                <UserIcon size={20} color={ExtendedColors.primary || '#007BFF'} />
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
                onPress={() => router.push('/(app)/(tabs)/chat')}
              >
                <Text style={styles.patientCardButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.patientCard}>
            <View style={styles.patientCardHeader}>
              <View style={styles.patientIconContainer}>
                <UserIcon size={20} color={ExtendedColors.primary || '#007BFF'} />
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
                onPress={() => router.push('/(app)/(tabs)/chat')}
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
    paddingBottom: 32,
  },
  emergencyBanner: {
    flexDirection: 'row',
    backgroundColor: ExtendedColors.errorLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyText: {
    ...Typography.body,
    color: ExtendedColors.error,
    flex: 1,
    marginHorizontal: 12,
  },
  emergencyCallButton: {
    backgroundColor: ExtendedColors.error,
    padding: 8,
    borderRadius: 8,
  },
  criticalCareSection: {
    marginBottom: 24,
  },
  criticalCareContainer: {
    backgroundColor: ExtendedColors.card || '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  criticalCareItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: ExtendedColors.border || '#e0e0e0',
  },
  criticalCareLabel: {
    ...Typography.body,
    color: ExtendedColors.text || '#000000',
  },
  criticalCareValue: {
    ...Typography.body,
    fontWeight: '500',
  },
  critical: {
    color: ExtendedColors.error,
  },
  normal: {
    color: ExtendedColors.success || '#008000',
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    ...Typography.body,
    color: ExtendedColors.textSecondary || '#808080',
  },
  userName: {
    ...Typography.h2,
    color: ExtendedColors.text || '#000000',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ExtendedColors.card || '#ffffff',
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
    color: ExtendedColors.text || '#000000',
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
  financialOverviewSection: {
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'white', // Changed from red to white
    padding: 10,
    backgroundColor: '#ffffff',
  },
  financialContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  financialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  financialLabel: {
    ...Typography.body,
    color: '#000000',
  },
  financialValue: {
    ...Typography.body,
    fontWeight: '500',
  },
  warning: {
    color: '#FFA500',
  },
  success: {
    color: '#008000',
  },
  danger: {
    color: '#FF0000',
  },
  paymentButton: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  paymentButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
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
    color: ExtendedColors.primary || '#007BFF',
  },
  noAppointmentsContainer: {
    backgroundColor: ExtendedColors.card || '#ffffff',
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
    color: ExtendedColors.textSecondary || '#808080',
    marginBottom: 16,
  },
  bookAppointmentButton: {
    backgroundColor: ExtendedColors.primary || '#007BFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookAppointmentText: {
    ...Typography.body,
    color: ExtendedColors.background || '#FFFFFF',
    fontWeight: '500',
  },
  todayScheduleSection: {
    marginBottom: 24,
  },
  scheduleContainer: {
    backgroundColor: ExtendedColors.card || '#ffffff',
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
    backgroundColor: ExtendedColors.primaryLight || '#E0F7FA',
  },
  timeSlotCurrent: {
    borderWidth: 1,
    borderColor: ExtendedColors.primary || '#007BFF',
  },
  timeSlotText: {
    ...Typography.body,
    color: ExtendedColors.primary || '#007BFF',
    marginBottom: 4,
  },
  timeSlotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ExtendedColors.primary || '#007BFF',
  },
  nextPatientText: {
    ...Typography.caption,
    color: ExtendedColors.textSecondary || '#808080',
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
  noDataText: {
    ...Typography.body,
    color: ExtendedColors.textSecondary || '#808080',
    textAlign: 'center',
  },
});