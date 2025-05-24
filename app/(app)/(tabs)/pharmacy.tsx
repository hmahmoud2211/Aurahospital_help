import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Button, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Clock, Pill, Plus, Search, X, User, Users, Truck } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import MedicationCard from '@/components/MedicationCard';
import { useAuthStore } from '@/store/auth-store';
import { useMedicalRecordsStore } from '@/store/medical-records-store';
import SOAPExamination, { SOAPData, PrescriptionItem } from '@/components/SOAPExamination';
import { Drug, drugsDatabase, searchMedications } from '@/data/drugsDatabase';
import { Medication } from '@/types/medical';

// Define a common interface for all medication types
interface DisplayMedication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  status?: string;
  refillsRemaining?: number;
  patientName?: string;
  isActive?: boolean;
  refills?: number;
}

// Mock data for doctor's patients prescriptions
const DOCTOR_PATIENTS = [
  { id: 'p1', name: 'Sarah Johnson', age: 42, lastVisit: '2023-11-15' },
  { id: 'p2', name: 'Robert Garcia', age: 65, lastVisit: '2023-11-10' },
  { id: 'p3', name: 'Emily Chen', age: 28, lastVisit: '2023-11-05' },
  { id: 'p4', name: 'Michael Wilson', age: 51, lastVisit: '2023-10-28' },
  { id: 'p5', name: 'Jessica Brown', age: 33, lastVisit: '2023-10-20' },
];

// Mock patient prescriptions
const PATIENT_PRESCRIPTIONS: DisplayMedication[] = [
  {
    id: 'med-p1-1',
    patientId: 'p1',
    patientName: 'Sarah Johnson',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    startDate: '2023-11-15',
    endDate: '2024-11-15',
    instructions: 'Take with water in the morning',
    status: 'active',
    refillsRemaining: 3,
  },
  {
    id: 'med-p1-2',
    patientId: 'p1',
    patientName: 'Sarah Johnson',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    startDate: '2023-10-20',
    endDate: '2024-10-20',
    instructions: 'Take with meals',
    status: 'active',
    refillsRemaining: 2, 
  },
  {
    id: 'med-p2-1',
    patientId: 'p2',
    patientName: 'Robert Garcia',
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily at bedtime',
    startDate: '2023-11-10',
    endDate: '2024-05-10',
    instructions: 'Take at night',
    status: 'active',
    refillsRemaining: 5,
  },
  {
    id: 'med-p3-1',
    patientId: 'p3',
    patientName: 'Emily Chen',
    name: 'Loratadine',
    dosage: '10mg',
    frequency: 'Once daily',
    startDate: '2023-11-05',
    endDate: '2023-12-05',
    instructions: 'Take for allergies as needed',
    status: 'active',
    refillsRemaining: 1,
  },
];

export default function PharmacyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { medications, fetchMedications, addPrescription, isLoading } = useMedicalRecordsStore();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSOAPModalVisible, setIsSOAPModalVisible] = useState(false);
  const [isViewAllModalVisible, setIsViewAllModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [selectedPatient, setSelectedPatient] = useState({
    id: 'p1',
    name: 'Sarah Johnson'
  });
  
  const [newPrescription, setNewPrescription] = useState({
    name: '',
    dosage: '',
    frequency: '',
    notes: ''
  });
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPatient, setFilterPatient] = useState('all');
  const [patientSelectModalVisible, setPatientSelectModalVisible] = useState(false);

  useEffect(() => {
    if (user && user.role === 'patient') {
      fetchMedications(user.id.toString());
    }
  }, [user]);
  
  useEffect(() => {
    if (searchQuery.length > 1) {
      setSearchResults(searchMedications(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);
  
  const handleAddPrescription = () => {
    console.log('New Prescription:', newPrescription);
    setNewPrescription({ name: '', dosage: '', frequency: '', notes: '' });
    setIsModalVisible(false);
  };
  
  const handleSelectMedication = (medication: Drug) => {
    setNewPrescription({
      name: medication.name,
      dosage: medication.dosageStrengths[0] || '',
      frequency: medication.commonDosages[0] || '',
      notes: `Used for: ${medication.usedFor.join(', ')}`
    });
    setSearchQuery('');
    setSearchResults([]);
  };
  
  const handleSOAPSubmit = async (soapData: SOAPData, prescriptions: PrescriptionItem[]) => {
    console.log('SOAP Data:', soapData);
    console.log('Prescriptions:', prescriptions);
    
    // In a real app, you would save the SOAP data and prescriptions to the backend
    // For now, we'll just add the prescriptions to the local state
    
    if (prescriptions.length > 0) {
      for (const prescription of prescriptions) {
        await addPrescription({
          id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          patientId: selectedPatient.id,
          name: prescription.medicationName,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          instructions: prescription.instructions,
          status: 'active',
          refillsRemaining: 2,
        });
      }
      
      // Refresh medications list
      fetchMedications(user?.role === 'patient' ? user.id.toString() : selectedPatient.id);
    }
    
    setIsSOAPModalVisible(false);
  };
  
  const handleSelectPatientForPrescription = (patient: typeof DOCTOR_PATIENTS[0]) => {
    setSelectedPatient({
      id: patient.id,
      name: patient.name
    });
    setPatientSelectModalVisible(false);
    setIsSOAPModalVisible(true);
  };

  const renderAddButton = () => {
    if (user?.role === 'practitioner') {
      return (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setPatientSelectModalVisible(true)}
        >
          <Plus size={20} color={Colors.background} style={styles.addButtonIcon} />
          <Text style={styles.addButtonText}>Add Prescription</Text>
        </TouchableOpacity>
      );
    }
    
    // Don't show add button for patients
    return null;
  };
  
  const getFilteredMedications = (): DisplayMedication[] => {
    // For doctor view, show all patient prescriptions
    if (user?.role === 'practitioner') {
      let filtered = PATIENT_PRESCRIPTIONS;
      
      // Filter by status
      if (filterStatus !== 'all') {
        filtered = filtered.filter(med => med.status === filterStatus);
      }
      
      // Filter by patient
      if (filterPatient !== 'all') {
        filtered = filtered.filter(med => med.patientId === filterPatient);
      }
      
      return filtered;
    }
    
    // For patient view, show their own medications
    // Convert Medication[] to DisplayMedication[]
    const userMedications: DisplayMedication[] = medications.map(med => ({
      ...med,
      patientName: user?.name || ''
    }));
    
    if (filterStatus === 'all') {
      return userMedications;
    }
    return userMedications.filter(med => med.status === filterStatus);
  };
  
  // Only show View All button for doctor roles
  const shouldShowViewAll = user?.role === 'practitioner';

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
            {shouldShowViewAll && (
              <TouchableOpacity onPress={() => setIsViewAllModalVisible(true)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
            {renderAddButton()}
          </View>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading medications...</Text>
          </View>
        ) : medications.length > 0 ? (
          medications.map((medication) => (
            <MedicationCard 
              key={medication.id} 
              medication={medication}
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
        
        <View style={styles.pharmacyOptionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pharmacy Options</Text>
          </View>
          <TouchableOpacity style={styles.pharmacyOption}>
            <View style={styles.pharmacyOptionIcon}>
              <Truck size={20} color={Colors.primary} />
            </View>
            <View style={styles.pharmacyOptionContent}>
              <Text style={styles.pharmacyOptionTitle}>Delivery Options</Text>
              <Text style={styles.pharmacyOptionText}>
                Set up home delivery for your medications
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Patient Modal for Adding Prescriptions */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Prescription</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <X size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.searchContainer}>
                <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search medications..."
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
              
              {searchResults.length > 0 && (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  style={styles.searchResults}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.searchResultItem}
                      onPress={() => handleSelectMedication(item)}
                    >
                      <Text style={styles.searchResultName}>{item.name}</Text>
                      <Text style={styles.searchResultDetails}>
                        {item.genericName} - {item.category}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              
              <Text style={styles.inputLabel}>Medication Name</Text>
              <TextInput 
                style={styles.input}
                value={newPrescription.name}
                onChangeText={(text) => setNewPrescription({...newPrescription, name: text})}
                placeholder="Enter medication name"
              />
              
              <Text style={styles.inputLabel}>Dosage</Text>
              <TextInput 
                style={styles.input}
                value={newPrescription.dosage}
                onChangeText={(text) => setNewPrescription({...newPrescription, dosage: text})}
                placeholder="e.g., 10mg"
              />
              
              <Text style={styles.inputLabel}>Frequency</Text>
              <TextInput 
                style={styles.input}
                value={newPrescription.frequency}
                onChangeText={(text) => setNewPrescription({...newPrescription, frequency: text})}
                placeholder="e.g., Once daily"
              />
              
              <Text style={styles.inputLabel}>Additional Notes</Text>
              <TextInput 
                style={[styles.input, styles.textArea]}
                value={newPrescription.notes}
                onChangeText={(text) => setNewPrescription({...newPrescription, notes: text})}
                placeholder="Enter any additional instructions or notes"
                multiline
              />
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleAddPrescription}
              >
                <Text style={styles.submitButtonText}>Add Prescription</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* View All Modal */}
        <Modal
          visible={isViewAllModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsViewAllModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>All Prescriptions</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsViewAllModalVisible(false)}
                >
                  <X size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
              
              {/* Patient filter for doctor view */}
              {(user?.role === 'practitioner') && (
                <View style={styles.patientFilterContainer}>
                  <Text style={styles.filterLabel}>Patient:</Text>
                  <View style={styles.patientFilterDropdown}>
                    <FlatList
                      data={[{id: 'all', name: 'All Patients'}, ...DOCTOR_PATIENTS]}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity 
                          style={[
                            styles.patientFilterButton, 
                            filterPatient === item.id && styles.patientFilterButtonActive
                          ]}
                          onPress={() => setFilterPatient(item.id)}
                        >
                          <Text style={[
                            styles.patientFilterButtonText,
                            filterPatient === item.id && styles.patientFilterButtonTextActive
                          ]}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              )}
              
              <View style={styles.filterContainer}>
                <TouchableOpacity 
                  style={[
                    styles.filterButton, 
                    filterStatus === 'all' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilterStatus('all')}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filterStatus === 'all' && styles.filterButtonTextActive
                  ]}>All</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.filterButton, 
                    filterStatus === 'active' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilterStatus('active')}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filterStatus === 'active' && styles.filterButtonTextActive
                  ]}>Active</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.filterButton, 
                    filterStatus === 'completed' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilterStatus('completed')}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filterStatus === 'completed' && styles.filterButtonTextActive
                  ]}>Completed</Text>
                </TouchableOpacity>
              </View>
              
              {getFilteredMedications().length > 0 ? (
                <FlatList
                  data={getFilteredMedications()}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.prescriptionListItem}>
                      <View style={styles.prescriptionListItemHeader}>
                        <Text style={styles.prescriptionListItemName}>{item.name}</Text>
                        <View style={[
                          styles.statusBadge,
                          item.status === 'active' ? styles.activeBadge : 
                          item.status === 'completed' ? styles.completedBadge : 
                          styles.pendingBadge
                        ]}>
                          <Text style={styles.statusBadgeText}>
                            {item.status === 'active' ? 'Active' : 
                             item.status === 'completed' ? 'Completed' : 
                             'Pending'}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Show patient name for doctor view */}
                      {(user?.role === 'practitioner') && item.patientName && (
                        <View style={styles.patientInfoContainer}>
                          <User size={14} color={Colors.textSecondary} />
                          <Text style={styles.patientInfoText}>{item.patientName}</Text>
                        </View>
                      )}
                      
                      <Text style={styles.prescriptionListItemDetails}>
                        {item.dosage}, {item.frequency}
                      </Text>
                      {item.instructions && (
                        <Text style={styles.prescriptionListItemInstructions}>
                          {item.instructions}
                        </Text>
                      )}
                      <View style={styles.prescriptionListItemFooter}>
                        <Text style={styles.prescriptionListItemDate}>
                          Started: {new Date(item.startDate).toLocaleDateString()}
                        </Text>
                        {item.status === 'active' && item.refillsRemaining !== undefined && (
                          <Text style={styles.prescriptionListItemRefills}>
                            Refills: {item.refillsRemaining}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                  contentContainerStyle={styles.prescriptionListContainer}
                />
              ) : (
                <View style={styles.emptyListContainer}>
                  <Pill size={40} color={Colors.textSecondary} />
                  <Text style={styles.emptyListText}>No prescriptions found</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
        
        {/* Patient Selection Modal for Doctors */}
        <Modal
          visible={patientSelectModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setPatientSelectModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Patient</Text>
                <TouchableOpacity
                  onPress={() => setPatientSelectModalVisible(false)}
                  style={styles.closeButton}
                >
                  <X size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={DOCTOR_PATIENTS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.patientItem}
                    onPress={() => handleSelectPatientForPrescription(item)}
                  >
                    <View style={styles.patientItemContent}>
                      <Text style={styles.patientName}>{item.name}</Text>
                      <Text style={styles.patientDetails}>Age: {item.age} • Last Visit: {item.lastVisit}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.patientList}
              />
            </View>
          </View>
        </Modal>
        
        {/* SOAP Examination Modal for Doctors */}
        {isSOAPModalVisible && (
          <SOAPExamination
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
            onClose={() => setIsSOAPModalVisible(false)}
            onSave={handleSOAPSubmit}
          />
        )}
        
        <View style={styles.medicationHistorySection}>
          <Text style={styles.sectionTitle}>Medication History</Text>
          <View style={styles.medicationHistoryItem}>
            <View style={styles.medicationHistoryHeader}>
              <Text style={styles.medicationHistoryName}>Amoxicillin 500mg</Text>
              <Text style={styles.medicationHistoryDate}>09/15/2023</Text>
            </View>
            <Text style={styles.medicationHistoryDetails}>3 times daily for 10 days</Text>
            <Text style={styles.medicationHistoryStatus}>Completed</Text>
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
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  reminderTime: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  viewAllText: {
    ...Typography.body,
    color: Colors.primary,
    marginRight: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonIcon: {
    marginRight: 4,
  },
  addButtonText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primary}15`,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pharmacyOptionContent: {
    flex: 1,
  },
  pharmacyOptionTitle: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  pharmacyOptionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h4,
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    ...Typography.body,
    flex: 1,
    paddingVertical: 12,
    color: Colors.text,
  },
  searchResults: {
    maxHeight: 200,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchResultName: {
    ...Typography.body,
    fontWeight: '500',
  },
  searchResultDetails: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  inputLabel: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: Colors.card,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    ...Typography.body,
    color: Colors.text,
  },
  filterButtonTextActive: {
    color: Colors.background,
  },
  prescriptionListContainer: {
    paddingBottom: 20,
  },
  prescriptionListItem: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prescriptionListItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prescriptionListItemName: {
    ...Typography.body,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: `${Colors.success}20`,
  },
  completedBadge: {
    backgroundColor: `${Colors.textSecondary}20`,
  },
  pendingBadge: {
    backgroundColor: `${Colors.warning}20`,
  },
  statusBadgeText: {
    ...Typography.caption,
    fontWeight: '500',
  },
  prescriptionListItemDetails: {
    ...Typography.body,
    marginBottom: 8,
  },
  prescriptionListItemInstructions: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  prescriptionListItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prescriptionListItemDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  prescriptionListItemRefills: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyListText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 16,
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
    fontWeight: '600',
  },
  medicationHistoryDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  medicationHistoryDetails: {
    ...Typography.caption,
    marginBottom: 8,
  },
  medicationHistoryStatus: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  patientFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterLabel: {
    ...Typography.body,
    color: Colors.text,
    marginRight: 8,
  },
  patientFilterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  patientFilterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  patientFilterButtonText: {
    ...Typography.body,
    color: Colors.text,
  },
  patientFilterButtonTextActive: {
    color: Colors.background,
  },
  patientItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  patientItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientName: {
    ...Typography.body,
    fontWeight: '600',
    marginRight: 8,
  },
  patientDetails: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  patientList: {
    paddingBottom: 20,
  },
  patientInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientInfoText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
});