import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserIcon, Search } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/auth-store';
import { useAppointmentStore } from '@/store/appointment-store';

export default function PatientsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { appointments, fetchAppointments, isLoading } = useAppointmentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);

  // Debug effect to show component is mounting
  useEffect(() => {
    console.log('🏥 PatientsScreen component mounted');
    console.log('👤 Current user:', user);
    console.log('📊 Initial state - patients:', appointments?.length || 0);
  }, []);

  useEffect(() => {
    // Fetch appointments using the same logic as appointments tab
    if (user) {
      console.log(`📅 Fetching appointments for ${user.role} with ID: ${user.id}`);
      fetchAppointments(String(user.id), user.role);
    }
  }, [user]);

  useEffect(() => {
    // Filter appointments based on search query (same as index.tsx logic)
    if (searchQuery.trim() === '') {
      setFilteredAppointments(appointments || []);
    } else {
      const filtered = (appointments || []).filter(appointment => {
        const patientDetails = appointment.patientDetails;
        let patientName = 'Unknown Patient';
        
        if (patientDetails?.name) {
          if (Array.isArray(patientDetails.name)) {
            patientName = patientDetails.name[0]?.text || 'Unknown Patient';
          } else if (typeof patientDetails.name === 'object') {
            patientName = patientDetails.name?.text || 'Unknown Patient';
          } else {
            patientName = patientDetails.name || 'Unknown Patient';
          }
        }
        
        return (
          patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(appointment.patient_id).includes(searchQuery)
        );
      });
      setFilteredAppointments(filtered);
    }
  }, [searchQuery, appointments]);

  // Debug effect to log current state
  useEffect(() => {
    console.log('📊 Current state update:');
    console.log(`  - Filtered appointments: ${filteredAppointments?.length || 0}`, filteredAppointments);
    console.log(`  - Total appointments: ${appointments?.length || 0}`, appointments);
    console.log(`  - Is loading: ${isLoading}`);
  }, [filteredAppointments, appointments, isLoading]);

  const renderPatientCard = (appointment: any) => {
    return (
      <View key={String(appointment.id)} style={styles.patientCard}>
        <View style={styles.patientCardHeader}>
          <View style={styles.patientIconContainer}>
            <UserIcon size={20} color={Colors.primary} />
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
            style={styles.viewRecordsButton}
            onPress={() => {
              const patientId = appointment.patientDetails?.id || appointment.patient_id;
              console.log('Navigating to patient-monitoring for patientId:', patientId);
              router.push(`/patient-monitoring?patientId=${patientId}`);
            }}
          >
            <Text style={styles.viewRecordsButtonText}>View Records</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sendMessageButton}
            onPress={() => router.push('/(app)/(tabs)/chat')}
          >
            <Text style={styles.sendMessageButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title="My Patients" />
      
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients by name, email, or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{filteredAppointments.length}</Text>
            <Text style={styles.statLabel}>Patients with Appointments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {appointments.filter(apt => {
                if (!apt || !apt.date || !apt.time) return false;
                const appointmentDate = new Date(`${apt.date}T${apt.time}`);
                return appointmentDate > new Date() && apt.status !== 'cancelled';
              }).length}
            </Text>
            <Text style={styles.statLabel}>Upcoming Appointments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Critical Status</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.patientsList}
          contentContainerStyle={styles.patientsListContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading patients with appointments...</Text>
            </View>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map(renderPatientCard)
          ) : (
            <View style={styles.emptyContainer}>
              <UserIcon size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No patients found' : 'No patients with appointments'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? 'Try adjusting your search criteria'
                  : 'Patients will appear here when they book appointments with you. Only patients who have booked appointments are shown in this list.'
                }
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    ...Typography.body,
    flex: 1,
    paddingVertical: 12,
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: -8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  patientsList: {
    flex: 1,
  },
  patientsListContent: {
    paddingBottom: 24,
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
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  patientReason: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 1,
  },
  appointmentTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  patientCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  viewRecordsButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewRecordsButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sendMessageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sendMessageButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
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
});