import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Clock, Pill, Plus } from 'lucide-react-native';
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
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    name: '',
    dosage: '',
    frequency: '',
    notes: ''
  });

  useEffect(() => {
    if (user && user.role === 'patient') {
      fetchMedications(user.id);
    }
  }, [user]);
  
  const handleRefill = async (medicationId: string) => {
    await requestMedicationRefill(medicationId);
  };

  const handleAddPrescription = () => {
    console.log('New Prescription:', newPrescription);
    setNewPrescription({ name: '', dosage: '', frequency: '', notes: '' });
    setIsModalVisible(false);
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
          <View style={styles.headerButtons}>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Plus size={20} color={Colors.background} style={styles.addButtonIcon} />
              <Text style={styles.addButtonText}>Add Prescription</Text>
            </TouchableOpacity>
          </View>
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
        
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Prescription</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Medication Name"
                value={newPrescription.name}
                onChangeText={(text) => setNewPrescription({...newPrescription, name: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Dosage (e.g., 10mg)"
                value={newPrescription.dosage}
                onChangeText={(text) => setNewPrescription({...newPrescription, dosage: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Frequency (e.g., Once daily)"
                value={newPrescription.frequency}
                onChangeText={(text) => setNewPrescription({...newPrescription, frequency: text})}
              />
              
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Additional Notes"
                value={newPrescription.notes}
                onChangeText={(text) => setNewPrescription({...newPrescription, notes: text})}
                multiline
              />
              
              <View style={styles.modalButtons}>
                <Button 
                  title="Cancel" 
                  onPress={() => setIsModalVisible(false)} 
                  color={Colors.textSecondary}
                />
                <Button 
                  title="Save" 
                  onPress={handleAddPrescription}
                  color={Colors.primary}
                />
              </View>
            </View>
          </View>
        </Modal>
        
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  viewAllText: {
    ...Typography.body,
    color: Colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
    fontSize: 16,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    ...Typography.h4,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    ...Typography.body,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
});