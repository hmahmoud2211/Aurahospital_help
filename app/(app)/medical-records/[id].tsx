import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Share, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, FileText, Share2, Trash2, User } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useMedicalRecordsStore } from '@/store/medical-records-store';
import { MedicalRecord } from '@/types/medical';

export default function MedicalRecordDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { records, isLoading } = useMedicalRecordsStore();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  
  useEffect(() => {
    if (id && records.length > 0) {
      const foundRecord = records.find(r => r.id === id);
      if (foundRecord) {
        setRecord(foundRecord);
      } else {
        Alert.alert("Error", "Record not found", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    }
  }, [id, records]);
  
  const handleShare = async () => {
    if (!record) return;
    
    try {
      await Share.share({
        title: record.title,
        message: `Medical record: ${record.title} from ${record.provider} on ${formatDate(record.date)}`,
        // In a real app, you would include a URL to the file
      });
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "There was an error sharing this record.");
    }
  };
  
  const handleDownload = () => {
    // In a real app, this would download the file
    Alert.alert("Download", "Document download started.");
  };
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this record? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            // In a real app, this would delete the record
            Alert.alert("Success", "Record deleted successfully", [
              { text: "OK", onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const getRecordTypeColor = () => {
    if (!record) return Colors.textSecondary;
    
    switch (record.type) {
      case 'lab':
        return Colors.danger;
      case 'imaging':
        return Colors.info;
      case 'prescription':
        return Colors.primary;
      case 'document':
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };
  
  const getRecordTypeLabel = () => {
    if (!record) return 'Document';
    
    switch (record.type) {
      case 'lab':
        return 'Lab Result';
      case 'imaging':
        return 'Imaging';
      case 'prescription':
        return 'Prescription';
      case 'document':
        return 'Document';
      default:
        return 'Document';
    }
  };

  if (isLoading || !record) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <Header title="Medical Record" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading record...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header 
        title="Medical Record" 
        rightComponent={
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 size={20} color={Colors.background} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.recordHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${getRecordTypeColor()}20` }]}>
            <FileText size={32} color={getRecordTypeColor()} />
          </View>
          <View style={styles.recordInfo}>
            <Text style={styles.recordTitle}>{record.title}</Text>
            <Text style={styles.recordType}>{getRecordTypeLabel()}</Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(record.date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Provider</Text>
            <Text style={styles.detailValue}>{record.provider}</Text>
          </View>
          
          {record.fileType && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>File Type</Text>
              <Text style={styles.detailValue}>{record.fileType}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.previewContainer}>
          <View style={styles.filePreview}>
            <FileText size={64} color={Colors.textLight} />
            <Text style={styles.previewText}>Document Preview</Text>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <Button
            title="Download"
            onPress={handleDownload}
            icon={<Download size={20} color={Colors.background} />}
            fullWidth
          />
        </View>
        
        <View style={styles.sharedWithSection}>
          <Text style={styles.sectionTitle}>Shared With</Text>
          
          <View style={styles.sharedWithList}>
            <View style={styles.sharedWithItem}>
              <View style={styles.doctorAvatarContainer}>
                <User size={20} color={Colors.primary} />
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>Dr. Michael Chen</Text>
                <Text style={styles.doctorSpecialty}>Cardiologist</Text>
              </View>
              <Text style={styles.sharedDate}>Oct 15, 2023</Text>
            </View>
            
            <View style={styles.sharedWithItem}>
              <View style={styles.doctorAvatarContainer}>
                <User size={20} color={Colors.primary} />
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>Dr. Emily Rodriguez</Text>
                <Text style={styles.doctorSpecialty}>Primary Care</Text>
              </View>
              <Text style={styles.sharedDate}>Oct 10, 2023</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Trash2 size={20} color={Colors.danger} />
          <Text style={styles.deleteButtonText}>Delete Record</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    ...Typography.h3,
    marginBottom: 4,
  },
  recordType: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  detailsContainer: {
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.body,
    fontWeight: '500',
  },
  previewContainer: {
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
  filePreview: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 8,
  },
  previewText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  sharedWithSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: 16,
  },
  sharedWithList: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sharedWithItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  doctorAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 2,
  },
  doctorSpecialty: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  sharedDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: 8,
  },
  deleteButtonText: {
    ...Typography.body,
    color: Colors.danger,
    marginLeft: 8,
  },
});