import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Clock, Pill } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import MedicationCard from '@/components/MedicationCard';
import { useAuthStore } from '@/store/auth-store';
import { useMedicalRecordsStore } from '@/store/medical-records-store';

export default function PharmacyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { medications, fetchMedications, requestMedicationRefill, isLoading } = useMedicalRecordsStore();
  
  useEffect(() => {
    if (user && user.role === 'patient') {
      fetchMedications(user.id);
    }
  }, [user]);
  
  const handleRefill = async (medicationId: string) => {
    await requestMedicationRefill(medicationId);
    // In a real app, we would show a success message or update the UI
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header 
        title="Pharmacy" 
        showBack={false}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.reminderCard}>
          <View style={styles.reminderIconContainer}>
            <Bell size={20} color={Colors.primary} />
          </View>
          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>Medication Reminder</Text>
            <Text style={styles.reminderText}>Take Lisinopril 10mg with water</Text>
          </View>
          <Text style={styles.reminderTime}>10:00 AM</Text>
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Prescriptions</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading medications...</Text>
          </View>
        ) : medications.length > 0 ? (
          medications.map((medication) => (
            <MedicationCard 
              key={medication.id} 
              medication={medication}
              onRefill={handleRefill}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Pill size={48} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>No medications found</Text>
            <Text style={styles.emptyText}>
              You don't have any active prescriptions.
            </Text>
          </View>
        )}
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pharmacy Options</Text>
        </View>
        
        <View style={styles.pharmacyOptionsContainer}>
          <TouchableOpacity style={styles.pharmacyOption}>
            <View style={styles.pharmacyOptionIcon}>
              <Pill size={24} color={Colors.primary} />
            </View>
            <View style={styles.pharmacyOptionContent}>
              <Text style={styles.pharmacyOptionTitle}>Memorial Pharmacy</Text>
              <Text style={styles.pharmacyOptionText}>Your default pharmacy</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.pharmacyOption}>
            <View style={styles.pharmacyOptionIcon}>
              <Clock size={24} color={Colors.primary} />
            </View>
            <View style={styles.pharmacyOptionContent}>
              <Text style={styles.pharmacyOptionTitle}>Delivery Options</Text>
              <Text style={styles.pharmacyOptionText}>Set up medication delivery</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.medicationHistorySection}>
          <Text style={styles.sectionTitle}>Medication History</Text>
          <View style={styles.medicationHistoryItem}>
            <View style={styles.medicationHistoryHeader}>
              <Text style={styles.medicationHistoryName}>Amoxicillin 500mg</Text>
              <Text style={styles.medicationHistoryDate}>09/15/2023</Text>
            </View>
            <Text style={styles.medicationHistoryDetails}>
              1 capsule 3 times daily for 10 days
            </Text>
            <View style={styles.medicationHistoryStatus}>
              <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>
          
          <View style={styles.medicationHistoryItem}>
            <View style={styles.medicationHistoryHeader}>
              <Text style={styles.medicationHistoryName}>Ibuprofen 400mg</Text>
              <Text style={styles.medicationHistoryDate}>08/22/2023</Text>
            </View>
            <Text style={styles.medicationHistoryDetails}>
              1 tablet every 6 hours as needed for pain
            </Text>
            <View style={styles.medicationHistoryStatus}>
              <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  reminderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  reminderText: {
    ...Typography.caption,
  },
  reminderTime: {
    ...Typography.body,
    fontWeight: '500',
    color: Colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.h4,
  },
  viewAllText: {
    ...Typography.body,
    color: Colors.primary,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginBottom: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...Typography.h4,
    marginBottom: 8,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  pharmacyOptionsContainer: {
    marginBottom: 24,
  },
  pharmacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
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
  pharmacyOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pharmacyOptionContent: {
    flex: 1,
  },
  pharmacyOptionTitle: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  pharmacyOptionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  medicationHistorySection: {
    marginBottom: 24,
  },
  medicationHistoryItem: {
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
  medicationHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  medicationHistoryName: {
    ...Typography.body,
    fontWeight: '500',
  },
  medicationHistoryDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  medicationHistoryDetails: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  medicationHistoryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '500',
  },
});