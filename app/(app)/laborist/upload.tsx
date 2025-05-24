import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Camera,
  X,
  Check,
  Search,
  ArrowLeft,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';

interface Patient {
  id: number;
  name: any[];
  email: string;
}

interface LabTest {
  id: number;
  test_name: string;
  test_type: string;
  patientDetails: {
    name: any[];
  };
}

interface Scan {
  id: number;
  scan_type: string;
  body_part: string;
  patientDetails: {
    name: any[];
  };
}

export default function LaboristUploadScreen() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedLabTest, setSelectedLabTest] = useState<LabTest | null>(null);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showPatientSearch, setShowPatientSearch] = useState(false);

  useEffect(() => {
    if (user?.role !== 'laborist') {
      Alert.alert('Access Denied', 'This screen is only for laborist users.');
      router.back();
      return;
    }
    loadLabTests();
    loadScans();
  }, []);

  const loadLabTests = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/laborist/lab-tests/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLabTests(data);
      }
    } catch (error) {
      console.error('Error loading lab tests:', error);
    }
  };

  const loadScans = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/laborist/scans/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setScans(data);
      }
    } catch (error) {
      console.error('Error loading scans:', error);
    }
  };

  const searchPatients = async (query: string) => {
    if (query.length < 2) {
      setPatients([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/laborist/patients/search/?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/dicom'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !selectedPatient) {
      Alert.alert('Validation Error', 'Please select a file and patient');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || 'application/octet-stream',
        name: selectedFile.name || 'upload.jpg',
      } as any);
      formData.append('patient_id', selectedPatient.id.toString());
      if (selectedLabTest) {
        formData.append('lab_test_id', selectedLabTest.id.toString());
      }
      if (selectedScan) {
        formData.append('scan_id', selectedScan.id.toString());
      }
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch('http://localhost:8000/api/laborist/upload/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Success', 'File uploaded successfully', [
          {
            text: 'OK',
            onPress: () => {
              setSelectedFile(null);
              setSelectedPatient(null);
              setSelectedLabTest(null);
              setSelectedScan(null);
              setDescription('');
              router.back();
            },
          },
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert('Upload Failed', errorData.detail || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const renderFilePreview = () => {
    if (!selectedFile) return null;

    const isImage = selectedFile.mimeType?.startsWith('image/');

    return (
      <View style={styles.filePreview}>
        <View style={styles.filePreviewHeader}>
          <Text style={styles.filePreviewTitle}>Selected File</Text>
          <TouchableOpacity
            style={styles.removeFileButton}
            onPress={() => setSelectedFile(null)}
          >
            <X size={16} color={Colors.danger} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.fileInfo}>
          {isImage ? (
            <Image source={{ uri: selectedFile.uri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.fileIcon}>
              <FileText size={32} color={Colors.primary} />
            </View>
          )}
          
          <View style={styles.fileDetails}>
            <Text style={styles.fileName}>{selectedFile.name}</Text>
            <Text style={styles.fileSize}>
              {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Medical File</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>File Selection</Text>
          <View style={styles.uploadOptions}>
            <TouchableOpacity style={styles.uploadOption} onPress={pickDocument}>
              <FileText size={32} color={Colors.primary} />
              <Text style={styles.uploadOptionText}>Choose Document</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.uploadOption} onPress={pickImage}>
              <ImageIcon size={32} color={Colors.primary} />
              <Text style={styles.uploadOptionText}>Choose Image</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.uploadOption} onPress={takePhoto}>
              <Camera size={32} color={Colors.primary} />
              <Text style={styles.uploadOptionText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
          
          {renderFilePreview()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search patient by email..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchPatients(text);
                setShowPatientSearch(text.length >= 2);
              }}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          {showPatientSearch && patients.length > 0 && (
            <View style={styles.searchResults}>
              {patients.map((patient) => {
                const patientName = patient.name?.[0]?.text || 'Unknown Patient';
                return (
                  <TouchableOpacity
                    key={patient.id}
                    style={styles.searchResultItem}
                    onPress={() => {
                      setSelectedPatient(patient);
                      setShowPatientSearch(false);
                      setSearchQuery(patientName);
                    }}
                  >
                    <Text style={styles.patientName}>{patientName}</Text>
                    <Text style={styles.patientEmail}>{patient.email}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {selectedPatient && (
            <View style={styles.selectedPatient}>
              <Check size={16} color={Colors.success} />
              <Text style={styles.selectedPatientText}>
                Selected: {selectedPatient.name?.[0]?.text || 'Unknown Patient'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Link to Test/Scan (Optional)</Text>
          
          <Text style={styles.subsectionTitle}>Lab Tests</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {labTests.map((test) => {
              const patientName = test.patientDetails.name?.[0]?.text || 'Unknown Patient';
              const isSelected = selectedLabTest?.id === test.id;
              
              return (
                <TouchableOpacity
                  key={test.id}
                  style={[styles.testCard, isSelected && styles.selectedTestCard]}
                  onPress={() => {
                    setSelectedLabTest(isSelected ? null : test);
                    if (!isSelected) setSelectedScan(null);
                  }}
                >
                  <Text style={[styles.testName, isSelected && styles.selectedTestText]}>
                    {test.test_name}
                  </Text>
                  <Text style={[styles.testType, isSelected && styles.selectedTestText]}>
                    {test.test_type}
                  </Text>
                  <Text style={[styles.testPatient, isSelected && styles.selectedTestText]}>
                    {patientName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.subsectionTitle}>Scans</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {scans.map((scan) => {
              const patientName = scan.patientDetails.name?.[0]?.text || 'Unknown Patient';
              const isSelected = selectedScan?.id === scan.id;
              
              return (
                <TouchableOpacity
                  key={scan.id}
                  style={[styles.testCard, isSelected && styles.selectedTestCard]}
                  onPress={() => {
                    setSelectedScan(isSelected ? null : scan);
                    if (!isSelected) setSelectedLabTest(null);
                  }}
                >
                  <Text style={[styles.testName, isSelected && styles.selectedTestText]}>
                    {scan.scan_type}
                  </Text>
                  <Text style={[styles.testType, isSelected && styles.selectedTestText]}>
                    {scan.body_part}
                  </Text>
                  <Text style={[styles.testPatient, isSelected && styles.selectedTestText]}>
                    {patientName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Add a description or notes about this file..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!selectedFile || !selectedPatient || uploading) && styles.uploadButtonDisabled,
          ]}
          onPress={uploadFile}
          disabled={!selectedFile || !selectedPatient || uploading}
        >
          {uploading ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <>
              <Upload size={20} color={Colors.background} />
              <Text style={styles.uploadButtonText}>Upload File</Text>
            </>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: 12,
  },
  subsectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  uploadOption: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    elevation: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '30%',
  },
  uploadOptionText: {
    ...Typography.caption,
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  filePreview: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filePreviewTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  removeFileButton: {
    padding: 4,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  fileIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileSize: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: 12,
  },
  searchResults: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    elevation: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 8,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  patientName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  patientEmail: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  selectedPatient: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    padding: 12,
    borderRadius: 8,
  },
  selectedPatientText: {
    ...Typography.body,
    color: Colors.success,
    marginLeft: 8,
    fontWeight: '600',
  },
  testCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 150,
    elevation: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedTestCard: {
    backgroundColor: Colors.primary,
  },
  testName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  testType: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  testPatient: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  selectedTestText: {
    color: Colors.background,
  },
  descriptionInput: {
    ...Typography.body,
    color: Colors.text,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  uploadButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  uploadButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 