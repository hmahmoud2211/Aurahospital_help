import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Plus, Search } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import MedicalRecordCard from '@/components/MedicalRecordCard';
import { useAuthStore } from '@/store/auth-store';
import { useMedicalRecordsStore } from '@/store/medical-records-store';
import { MedicalRecord } from '@/types/medical';

export default function RecordsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { records, fetchMedicalRecords, isLoading } = useMedicalRecordsStore();
  
  const [filter, setFilter] = useState<'all' | 'lab' | 'imaging' | 'document'>('all');
  
  useEffect(() => {
    if (user && user.role === 'patient') {
      fetchMedicalRecords(user.id);
    }
  }, [user]);
  
  const filteredRecords = () => {
    if (filter === 'all') {
      return records;
    }
    
    return records.filter(record => record.type === filter);
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header 
        title="Medical Records" 
        showBack={false}
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
          <Text style={styles.searchPlaceholder}>Search records...</Text>
        </View>
      </View>
      
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
              All
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
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Documents</Text>
          <TouchableOpacity onPress={() => router.push('/medical-records/upload')}>
            <Text style={styles.uploadText}>+ Upload New</Text>
          </TouchableOpacity>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading records...</Text>
          </View>
        ) : filteredRecords().length > 0 ? (
          filteredRecords().map((record) => (
            <MedicalRecordCard 
              key={record.id} 
              record={record}
              onView={handleViewRecord}
              onShare={handleShareRecord}
              onDownload={handleDownloadRecord}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <FileText size={48} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>No records found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? "You don't have any medical records yet."
                : `You don't have any ${filter} records yet.`}
            </Text>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => router.push('/medical-records/upload')}
            >
              <Text style={styles.uploadButtonText}>Upload New Document</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {filteredRecords().length > 0 && (
          <View style={styles.uploadSection}>
            <Text style={styles.uploadSectionTitle}>Upload New Document</Text>
            <Text style={styles.uploadSectionText}>
              Securely upload your medical records, lab results, and scans.
            </Text>
            <View style={styles.uploadButtons}>
              <TouchableOpacity 
                style={[styles.uploadOptionButton, styles.photoButton]}
                onPress={() => router.push('/medical-records/upload?source=camera')}
              >
                <Text style={styles.uploadOptionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.uploadOptionButton, styles.fileButton]}
                onPress={() => router.push('/medical-records/upload?source=file')}
              >
                <Text style={styles.uploadOptionText}>Select File</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently Shared With</Text>
        </View>
        
        <View style={styles.sharedWithContainer}>
          <View style={styles.doctorAvatarContainer}>
            <Text style={styles.doctorAvatarText}>MC</Text>
          </View>
          <View style={styles.doctorAvatarContainer}>
            <Text style={styles.doctorAvatarText}>ER</Text>
          </View>
          <View style={styles.doctorAvatarContainer}>
            <Text style={styles.doctorAvatarText}>JW</Text>
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
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchPlaceholder: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primaryLight,
  },
  filterText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  uploadText: {
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
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  uploadButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '500',
  },
  uploadSection: {
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
  uploadSectionTitle: {
    ...Typography.h5,
    marginBottom: 8,
  },
  uploadSectionText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadOptionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  photoButton: {
    backgroundColor: Colors.primary,
  },
  fileButton: {
    backgroundColor: Colors.info,
  },
  uploadOptionText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '500',
  },
  sharedWithContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  doctorAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorAvatarText: {
    ...Typography.body,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});