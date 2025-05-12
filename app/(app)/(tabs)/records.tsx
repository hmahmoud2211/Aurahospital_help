import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Plus, Search, Calendar, ChevronDown, ChevronUp, Brain, Users, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import MedicalRecordCard from '@/components/MedicalRecordCard';
import { useAuthStore } from '@/store/auth-store';
import { useMedicalRecordsStore } from '@/store/medical-records-store';
import { MedicalRecord } from '@/types/medical';
import { dummyMedicalRecords } from '@/data/dummyMedicalRecords';

const VIEW_MODES = ['list', 'timeline'] as const;

const RECENTLY_SHARED_WITH = [
  { id: '1', name: 'Dr. Sarah Chen', initials: 'SC', color: '#4CAF50' },
  { id: '2', name: 'Dr. Michael Rodriguez', initials: 'MR', color: '#2196F3' },
  { id: '3', name: 'Dr. Emily Wong', initials: 'EW', color: '#9C27B0' },
  { id: '4', name: 'Dr. James Wilson', initials: 'JW', color: '#FF9800' },
];

// Mock patients for doctor view
const DOCTOR_PATIENTS = [
  { id: 'p1', name: 'Sarah Johnson', age: 42, lastVisit: '2023-11-15' },
  { id: 'p2', name: 'Robert Garcia', age: 65, lastVisit: '2023-11-10' },
  { id: 'p3', name: 'Emily Chen', age: 28, lastVisit: '2023-11-05' },
  { id: 'p4', name: 'Michael Wilson', age: 51, lastVisit: '2023-10-28' },
  { id: 'p5', name: 'Jessica Brown', age: 33, lastVisit: '2023-10-20' },
];

// Mock patient records
const PATIENT_RECORDS: Record<string, MedicalRecord[]> = {
  'p1': [
    {
      id: 'p1-record1',
      patientId: 'p1',
      type: 'lab',
      title: 'Complete Blood Count',
      date: '2023-11-15',
      provider: 'Memorial Hospital',
      content: 'Normal results',
    },
    {
      id: 'p1-record2',
      patientId: 'p1',
      type: 'imaging',
      title: 'Chest X-Ray',
      date: '2023-10-20',
      provider: 'Memorial Hospital',
      content: 'No abnormalities detected',
    },
  ],
  'p2': [
    {
      id: 'p2-record1',
      patientId: 'p2',
      type: 'lab',
      title: 'Lipid Panel',
      date: '2023-11-10',
      provider: 'Memorial Hospital',
      content: 'Elevated cholesterol',
    },
  ],
  'p3': [
    {
      id: 'p3-record1',
      patientId: 'p3',
      type: 'document',
      title: 'Allergy Test Results',
      date: '2023-11-05',
      provider: 'Allergy Specialists',
      content: 'Positive for pollen and dust mites',
    },
  ],
};

export default function RecordsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { records: serverRecords, fetchMedicalRecords, isLoading } = useMedicalRecordsStore();
  
  // For demo purposes, we'll combine server records with dummy records
  const records = [...(serverRecords || []), ...dummyMedicalRecords];
  
  const [filter, setFilter] = useState<'all' | 'lab' | 'imaging' | 'document' | 'vaccination'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<typeof VIEW_MODES[number]>('list');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  
  // States for doctor's patient view
  const [isViewingPatients, setIsViewingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientViewModalVisible, setPatientViewModalVisible] = useState(false);
  
  useEffect(() => {
    if (user) {
      // If doctor, fetch their own records
      // In a real app, you would have a separate endpoint for doctor's personal records
      fetchMedicalRecords(user.id);
    }
  }, [user]);
  
  const filteredRecords = () => {
    // If doctor is viewing a specific patient's records
    if (user?.role === 'doctor' && isViewingPatients && selectedPatient) {
      const patientRecords = PATIENT_RECORDS[selectedPatient] || [];
      return filterRecordsByQueryAndType(patientRecords);
    }
    
    // Otherwise show user's own records
    let filtered = records;
    return filterRecordsByQueryAndType(filtered);
  };
  
  const filterRecordsByQueryAndType = (recordsToFilter: MedicalRecord[]) => {
    let filtered = recordsToFilter;
    
    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(record => record.type === filter);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.title.toLowerCase().includes(query) ||
        record.type.toLowerCase().includes(query) ||
        record.provider.toLowerCase().includes(query) ||
        record.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= dateRange.start! && recordDate <= dateRange.end!;
      });
    }
    
    return filtered;
  };

  const handleViewRecord = (record: MedicalRecord) => {
    router.push(`/medical-records/${record.id}`);
  };
  
  const handleShareRecord = (record: MedicalRecord) => {
    // In a real app, this would open a share dialog
    console.log('Share record:', record);
  };
  
  const handleDownloadRecord = (record: MedicalRecord) => {
    // In a real app, this would download the file
    console.log('Download record:', record);
  };
  
  const handleViewPatientRecords = (patientId: string) => {
    setSelectedPatient(patientId);
    setIsViewingPatients(true);
    setPatientViewModalVisible(false);
  };
  
  const handleBackToOwnRecords = () => {
    setIsViewingPatients(false);
    setSelectedPatient(null);
  };

  const renderTimelineView = () => {
    const sortedRecords = filteredRecords().sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let currentMonth: string | null = null;

    return (
      <View style={styles.timelineContainer}>
        {sortedRecords.map((record) => {
          const date = new Date(record.date);
          const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
          const showMonthHeader = month !== currentMonth;
          currentMonth = month;

          return (
            <React.Fragment key={record.id}>
              {showMonthHeader && (
                <View style={styles.timelineMonthHeader}>
                  <Text style={styles.timelineMonthText}>{month}</Text>
                </View>
              )}
              <View style={styles.timelineItem}>
                <View style={styles.timelineLine} />
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <MedicalRecordCard
                    record={record}
                    onView={handleViewRecord}
                    onShare={handleShareRecord}
                    onDownload={handleDownloadRecord}
                  />
                </View>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  };
  
  // Get the selected patient name
  const getSelectedPatientName = () => {
    if (!selectedPatient) return '';
    const patient = DOCTOR_PATIENTS.find(p => p.id === selectedPatient);
    return patient ? patient.name : '';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header 
        title={isViewingPatients ? `Records: ${getSelectedPatientName()}` : "Medical Records"} 
        showBack={isViewingPatients}
        onBackPress={isViewingPatients ? handleBackToOwnRecords : undefined}
        rightComponent={
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/medical-records/upload')}
          >
            <Plus size={24} color={Colors.background} />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, type, or provider..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
      </View>
      
      {/* Doctor's patients view button */}
      {user?.role === 'doctor' && (
        <View style={styles.doctorActionsContainer}>
          {isViewingPatients ? (
            <TouchableOpacity 
              style={styles.doctorActionButton}
              onPress={handleBackToOwnRecords}
            >
              <Text style={styles.doctorActionButtonText}>View My Records</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.doctorActionButton}
              onPress={() => setPatientViewModalVisible(true)}
            >
              <Users size={16} color={Colors.primary} style={styles.doctorActionButtonIcon} />
              <Text style={styles.doctorActionButtonText}>View Patient Records</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Only show recently shared with for personal records */}
      {!isViewingPatients && (
        <View style={styles.recentlySharedContainer}>
          <Text style={styles.sectionTitle}>Recently Shared With</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {RECENTLY_SHARED_WITH.map((person) => (
              <View key={person.id} style={styles.personContainer}>
                <View style={[styles.initialsCircle, { backgroundColor: person.color }]}>
                  <Text style={styles.initials}>{person.initials}</Text>
                </View>
                <Text style={styles.personName} numberOfLines={1}>{person.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'all' && styles.filterTextActive,
              ]}
            >
              All Records
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'lab' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('lab')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'lab' && styles.filterTextActive,
              ]}
            >
              Lab Results
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'imaging' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('imaging')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'imaging' && styles.filterTextActive,
              ]}
            >
              Imaging
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'vaccination' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('vaccination')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'vaccination' && styles.filterTextActive,
              ]}
            >
              Vaccinations
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'document' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('document')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'document' && styles.filterTextActive,
              ]}
            >
              Documents
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <FileText size={20} color={viewMode === 'list' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.viewModeText, viewMode === 'list' && styles.viewModeTextActive]}>
            List View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'timeline' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('timeline')}
        >
          <Calendar size={20} color={viewMode === 'timeline' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.viewModeText, viewMode === 'timeline' && styles.viewModeTextActive]}>
            Timeline View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addDocumentButton}
          onPress={() => router.push('/medical-records/upload')}
        >
          <Plus size={16} color={Colors.background} />
          <Text style={styles.addDocumentText}>Upload Document</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading medical records...</Text>
          </View>
        ) : filteredRecords().length > 0 ? (
          viewMode === 'list' ? (
            filteredRecords()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((record) => (
                <MedicalRecordCard 
                  key={record.id}
                  record={record}
                  onView={handleViewRecord}
                  onShare={handleShareRecord}
                  onDownload={handleDownloadRecord}
                />
              ))
          ) : (
            renderTimelineView()
          )
        ) : (
          <View style={styles.noRecordsContainer}>
            <Brain size={64} color={Colors.textSecondary} />
            <Text style={styles.noRecordsTitle}>No Medical Records Found</Text>
            <Text style={styles.noRecordsText}>
              {isViewingPatients 
                ? "This patient doesn't have any medical records yet or none match your current filters."
                : "You haven't uploaded any medical records yet or none match your current filters."}
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => router.push('/medical-records/upload')}
            >
              <Text style={styles.uploadButtonText}>Upload Document</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Patient Selection Modal for Doctors */}
      <Modal
        visible={patientViewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPatientViewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Patient</Text>
              <TouchableOpacity
                onPress={() => setPatientViewModalVisible(false)}
                style={styles.modalCloseButton}
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
                  onPress={() => handleViewPatientRecords(item.id)}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    ...Typography.body,
    color: Colors.text,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.background,
  },
  viewModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  viewModeButtonActive: {
    backgroundColor: `${Colors.primary}15`,
  },
  viewModeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  viewModeTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  noRecordsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 32,
  },
  noRecordsTitle: {
    ...Typography.h3,
    marginBottom: 12,
    textAlign: 'center',
  },
  noRecordsText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  recentlySharedContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: 12,
  },
  personContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  initialsCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  initials: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: 'bold',
  },
  personName: {
    ...Typography.caption,
    textAlign: 'center',
  },
  addDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  addDocumentText: {
    ...Typography.caption,
    color: Colors.background,
    marginLeft: 8,
    fontWeight: '600',
  },
  timelineContainer: {
    paddingTop: 8,
  },
  timelineMonthHeader: {
    paddingVertical: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timelineMonthText: {
    ...Typography.h5,
    color: Colors.primary,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLine: {
    position: 'absolute',
    left: 12,
    top: 24,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.border,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 16,
  },
  doctorActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    justifyContent: 'flex-end',
  },
  doctorActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  doctorActionButtonIcon: {
    marginRight: 8,
  },
  doctorActionButtonText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h4,
  },
  modalCloseButton: {
    padding: 4,
  },
  patientList: {
    padding: 16,
  },
  patientItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  patientItemContent: {
    flex: 1,
  },
  patientName: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  patientDetails: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});