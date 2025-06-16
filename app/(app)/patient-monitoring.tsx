import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserIcon, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import { usePatientStore } from '@/store/patient-store';
import { useAppointmentStore } from '@/store/appointment-store';
import { useAuthStore } from '@/store/auth-store';
import HealthMetricCard from '@/components/HealthMetricCard';

export default function PatientMonitoringScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentPatient, vitalSigns, setCurrentPatient } = usePatientStore();
  const { appointments, fetchAppointments } = useAppointmentStore();
  const { patientId } = useLocalSearchParams();
  const [realPatientData, setRealPatientData] = useState<any>(null);
  
  useEffect(() => {
    // Fetch appointments to get real patient data
    if (user) {
      console.log('Fetching appointments to get patient data');
      fetchAppointments(String(user.id), user.role);
    }
  }, [user]);

  useEffect(() => {
    if (patientId) {
      setCurrentPatient(String(patientId));
      
      // Find the real patient data from appointments
      if (appointments && appointments.length > 0) {
        console.log('🔍 Looking for patient in appointments:', { patientId, appointments });
        
        // Try multiple matching strategies
        const patientAppointment = appointments.find(apt => {
          // Strategy 1: Direct patient_id match
          if (String(apt.patient_id) === String(patientId)) return true;
          
          // Strategy 2: patientDetails.id match
          if (apt.patientDetails?.id === String(patientId)) return true;
          
          // Strategy 3: patientDetails.id as number match
          if (apt.patientDetails?.id === Number(patientId)) return true;
          
          return false;
        });
        
        if (patientAppointment) {
          console.log('✅ Found patient appointment:', patientAppointment);
          console.log('📝 Patient details:', patientAppointment.patientDetails);
          setRealPatientData(patientAppointment);
        } else {
          console.log('❌ No appointment found for patientId:', patientId);
          console.log('📋 Available appointments:', appointments.map(apt => ({
            patient_id: apt.patient_id,
            patientDetailsId: apt.patientDetails?.id,
            patientName: apt.patientDetails?.name
          })));
        }
      } else {
        console.log('⏳ No appointments available yet');
      }
    } else if (!currentPatient) {
      setCurrentPatient('p1');
    }
  }, [patientId, currentPatient, setCurrentPatient, appointments]);

  const getPatientName = () => {
    console.log('🏷️ Getting patient name from:', realPatientData?.patientDetails?.name);
    console.log('🏷️ Full patientDetails:', realPatientData?.patientDetails);
    
    if (realPatientData?.patientDetails?.name) {
      const name = realPatientData.patientDetails.name;
      
      if (Array.isArray(name)) {
        const extractedName = name[0]?.text || name[0]?.family || name[0]?.given || 'Unknown Patient';
        console.log('🏷️ Extracted name from array:', extractedName);
        return extractedName;
      }
      
      if (typeof name === 'object') {
        const extractedName = name?.text || name?.family || name?.given || 'Unknown Patient';
        console.log('🏷️ Extracted name from object:', extractedName);
        return extractedName;
      }
      
      if (typeof name === 'string') {
        console.log('🏷️ Using string name:', name);
        return name;
      }
    }
    
    // If we have appointment data but no name, show more info
    if (realPatientData) {
      const fallbackName = `Patient ${realPatientData.patient_id || patientId}`;
      console.log('🏷️ Using fallback name:', fallbackName);
      return fallbackName;
    }
    
    // Last resort
    const lastResort = `Patient ${patientId}`;
    console.log('🏷️ Using last resort name:', lastResort);
    return lastResort;
  };

  const getPatientInfo = () => {
    // Use real appointment data if available, otherwise return minimal info
    if (realPatientData?.patientDetails) {
      return {
        name: getPatientName(),
        email: realPatientData.patientDetails.email || 'No email',
        gender: realPatientData.patientDetails.gender || 'Not specified',
        dateOfBirth: realPatientData.patientDetails.dateOfBirth || 'Not specified',
        allergies: realPatientData.patientDetails.allergies || [],
        conditions: realPatientData.patientDetails.conditions || []
      };
    }
    
    return {
      name: getPatientName(),
      email: 'No email available',
      gender: 'Not specified',
      dateOfBirth: 'Not specified',
      allergies: [],
      conditions: []
    };
  };

  const patientInfo = getPatientInfo();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
  };

  // Show loading state if appointments are still being fetched
  if (!appointments || appointments.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <Header title="Patient Monitoring" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading patient data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state if patient data is not yet loaded
  if (!currentPatient && !realPatientData) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <Header title="Patient Monitoring" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading patient information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Ensure vitalSigns and its properties are defined
  const currentVitals = vitalSigns?.current || {
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    glucose: 98
  };
  
  const vitalHistory = vitalSigns?.history || [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title="Patient Monitoring" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.patientHeader}>
          <View style={styles.patientIconContainer}>
            <UserIcon size={24} color={Colors.primary} />
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patientInfo.name}</Text>
            {realPatientData && (
              <Text style={styles.patientDemographics}>
                Latest Appointment: {realPatientData.reason} - {realPatientData.date} at {realPatientData.time}
              </Text>
            )}
            <Text style={styles.patientDemographics}>
              {patientInfo.gender && `Gender: ${patientInfo.gender}  `}
              {patientInfo.dateOfBirth && `DOB: ${patientInfo.dateOfBirth}`}
            </Text>
            {patientInfo.allergies && patientInfo.allergies.length > 0 && (
              <Text style={styles.patientDemographics}>
                Allergies: {patientInfo.allergies.join(', ')}
              </Text>
            )}
            {patientInfo.conditions && patientInfo.conditions.length > 0 && (
              <Text style={styles.patientDemographics}>
                Conditions: {patientInfo.conditions.join(', ')}
              </Text>
            )}
            <View style={styles.patientStatusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.patientStatus}>
                {realPatientData?.status === 'completed' ? 'Stable' : realPatientData?.status || 'Stable'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.vitalSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Blood Pressure Trends</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Last 30 Days</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartContainer}>
            <View style={styles.chartPlaceholder} />
            
            <View style={styles.chartDates}>
              {vitalHistory.slice(0, 5).map((record, index) => (
                <Text key={index} style={styles.chartDateText}>
                  {formatDate(record.date)}
                </Text>
              ))}
            </View>
            
            <View style={styles.bpReadings}>
              <View style={styles.bpReading}>
                <Text style={styles.bpLabel}>Current</Text>
                <Text style={styles.bpValue}>
                  {currentVitals.bloodPressure?.systolic || 120}/{currentVitals.bloodPressure?.diastolic || 80}
                </Text>
                <Text style={styles.bpUnit}>mmHg</Text>
              </View>
              
              <View style={styles.bpReading}>
                <Text style={styles.bpLabel}>Average</Text>
                <Text style={styles.bpValue}>131/84</Text>
                <Text style={styles.bpUnit}>mmHg</Text>
              </View>
              
              <View style={styles.bpReading}>
                <Text style={styles.bpLabel}>Target</Text>
                <Text style={styles.bpValue}>≤130/80</Text>
                <Text style={styles.bpUnit}>mmHg</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Glucose</Text>
            <View style={styles.metricStatusContainer}>
              <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.metricStatus}>Normal Range</Text>
            </View>
            <View style={styles.metricValueContainer}>
              <Text style={styles.metricValue}>{currentVitals.glucose || 98}</Text>
              <Text style={styles.metricUnit}>mg/dL</Text>
            </View>
            <Text style={styles.metricUpdate}>Last updated: Today</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Cholesterol</Text>
            <View style={styles.metricStatusContainer}>
              <Text style={styles.metricStatus}>Monitor</Text>
            </View>
            <View style={styles.metricValueContainer}>
              <Text style={styles.metricValue}>187</Text>
              <Text style={styles.metricUnit}>mg/dL</Text>
            </View>
            <Text style={styles.metricUpdate}>Last updated: 09/22/2023</Text>
          </View>
        </View>
        
        <View style={styles.adherenceSection}>
          <Text style={styles.sectionTitle}>Medication Adherence</Text>
          <View style={styles.adherenceCard}>
            <View style={styles.adherenceHeader}>
              <Text style={styles.adherenceTitle}>Lisinopril 10mg</Text>
              <View style={styles.adherencePercentContainer}>
                <Text style={styles.adherencePercent}>92%</Text>
              </View>
            </View>
            <View style={styles.adherenceBarContainer}>
              <View style={[styles.adherenceBar, { width: '92%' }]} />
            </View>
            <Text style={styles.adherenceText}>
              Patient has taken 23 out of 25 prescribed doses
            </Text>
          </View>
          
          <View style={styles.adherenceCard}>
            <View style={styles.adherenceHeader}>
              <Text style={styles.adherenceTitle}>Atorvastatin 20mg</Text>
              <View style={styles.adherencePercentContainer}>
                <Text style={styles.adherencePercent}>100%</Text>
              </View>
            </View>
            <View style={styles.adherenceBarContainer}>
              <View style={[styles.adherenceBar, { width: '100%' }]} />
            </View>
            <Text style={styles.adherenceText}>
              Patient has taken 25 out of 25 prescribed doses
            </Text>
          </View>
        </View>
        
        <View style={styles.notesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Clinical Notes</Text>
            <TouchableOpacity onPress={() => router.push('/clinical-notes/new')}>
              <Text style={styles.addNoteText}>+ Add Note</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.noteCard}
            onPress={() => router.push('/clinical-notes/cn1')}
          >
            <View style={styles.noteHeader}>
              <Text style={styles.noteDate}>October 11, 2023</Text>
              <ArrowRight size={16} color={Colors.textSecondary} />
            </View>
            <Text style={styles.noteTitle}>Follow-up Visit</Text>
            <Text style={styles.noteExcerpt}>
              Patient reports occasional headaches in the afternoon, describes them as a dull ache...
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.noteCard}
            onPress={() => router.push('/clinical-notes/cn2')}
          >
            <View style={styles.noteHeader}>
              <Text style={styles.noteDate}>September 15, 2023</Text>
              <ArrowRight size={16} color={Colors.textSecondary} />
            </View>
            <Text style={styles.noteTitle}>Initial Consultation</Text>
            <Text style={styles.noteExcerpt}>
              Patient presents with elevated blood pressure readings at home...
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  patientIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    ...Typography.h4,
    marginBottom: 4,
  },
  patientDemographics: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  patientStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  patientStatus: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '500',
  },
  vitalSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...Typography.h4,
  },
  sectionLink: {
    ...Typography.body,
    color: Colors.primary,
  },
  chartContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartPlaceholder: {
    height: 150,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    marginBottom: 12,
  },
  chartDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartDateText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  bpReadings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bpReading: {
    alignItems: 'center',
  },
  bpLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  bpValue: {
    ...Typography.h5,
    marginBottom: 2,
  },
  bpUnit: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  metricsContainer: {
    flexDirection: 'row',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricTitle: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 8,
  },
  metricStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricStatus: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  metricValue: {
    ...Typography.h3,
    marginRight: 4,
  },
  metricUnit: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  metricUpdate: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  adherenceSection: {
    marginBottom: 24,
  },
  adherenceCard: {
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
  adherenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adherenceTitle: {
    ...Typography.body,
    fontWeight: '500',
  },
  adherencePercentContainer: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  adherencePercent: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '500',
  },
  adherenceBarContainer: {
    height: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  adherenceBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  adherenceText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  notesSection: {
    marginBottom: 24,
  },
  addNoteText: {
    ...Typography.body,
    color: Colors.primary,
  },
  noteCard: {
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
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  noteTitle: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 8,
  },
  noteExcerpt: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});