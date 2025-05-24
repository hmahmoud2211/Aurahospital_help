import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Modal, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, FileText, Image as ImageIcon, Upload, X, ChevronDown, ChevronLeft, Eye, Search } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useMedicalRecordsStore } from '@/store/medical-records-store';
import { useAuthStore } from '@/store/auth-store';

// Define interfaces for test items and headers
interface TestItem {
  id: string;
  name: string;
  category: string;
  isHeader?: boolean;
}

// Common lab tests and imaging scans
const COMMON_TESTS: TestItem[] = [
  // Lab Tests
  { id: 'cbc', name: 'Complete Blood Count (CBC)', category: 'lab' },
  { id: 'lipid', name: 'Lipid Panel (Cholesterol)', category: 'lab' },
  { id: 'metabolic', name: 'Comprehensive Metabolic Panel (CMP)', category: 'lab' },
  { id: 'a1c', name: 'Hemoglobin A1C', category: 'lab' },
  { id: 'thyroid', name: 'Thyroid Function Tests (TSH, T3, T4)', category: 'lab' },
  { id: 'urinalysis', name: 'Urinalysis', category: 'lab' },
  { id: 'liver', name: 'Liver Function Tests (LFT)', category: 'lab' },
  { id: 'kidney', name: 'Kidney Function Panel', category: 'lab' },
  { id: 'vitamin_d', name: 'Vitamin D Level', category: 'lab' },
  { id: 'iron', name: 'Iron Panel', category: 'lab' },
  { id: 'blood_sugar', name: 'Blood Glucose Test', category: 'lab' },
  { id: 'coagulation', name: 'Coagulation Panel', category: 'lab' },
  { id: 'electrolytes', name: 'Electrolyte Panel', category: 'lab' },
  { id: 'crp', name: 'C-Reactive Protein (CRP)', category: 'lab' },
  { id: 'esr', name: 'Erythrocyte Sedimentation Rate (ESR)', category: 'lab' },
  { id: 'psa', name: 'Prostate-Specific Antigen (PSA)', category: 'lab' },
  { id: 'hba', name: 'Hepatitis B Antibody', category: 'lab' },
  { id: 'hca', name: 'Hepatitis C Antibody', category: 'lab' },
  { id: 'hiv', name: 'HIV Test', category: 'lab' },
  { id: 'ana', name: 'Antinuclear Antibody (ANA)', category: 'lab' },
  { id: 'troponin', name: 'Troponin Test', category: 'lab' },
  { id: 'bmp', name: 'Basic Metabolic Panel (BMP)', category: 'lab' },
  { id: 'folate', name: 'Folate (Vitamin B9)', category: 'lab' },
  { id: 'b12', name: 'Vitamin B12', category: 'lab' },
  { id: 'ferritin', name: 'Ferritin', category: 'lab' },
  { id: 'hcg', name: 'Human Chorionic Gonadotropin (hCG)', category: 'lab' },
  { id: 'ptt', name: 'Partial Thromboplastin Time (PTT)', category: 'lab' },
  { id: 'pt', name: 'Prothrombin Time (PT)', category: 'lab' },
  { id: 'inr', name: 'International Normalized Ratio (INR)', category: 'lab' },
  { id: 'tsh', name: 'Thyroid Stimulating Hormone (TSH)', category: 'lab' },
  { id: 'uric_acid', name: 'Uric Acid', category: 'lab' },
  { id: 'albumin', name: 'Albumin', category: 'lab' },
  { id: 'bun', name: 'Blood Urea Nitrogen (BUN)', category: 'lab' },
  { id: 'creatinine', name: 'Creatinine', category: 'lab' },
  { id: 'alt', name: 'Alanine Aminotransferase (ALT)', category: 'lab' },
  { id: 'ast', name: 'Aspartate Aminotransferase (AST)', category: 'lab' },
  
  // Imaging Scans
  { id: 'xray', name: 'X-Ray', category: 'imaging' },
  { id: 'ct', name: 'CT Scan', category: 'imaging' },
  { id: 'mri', name: 'MRI', category: 'imaging' },
  { id: 'ultrasound', name: 'Ultrasound', category: 'imaging' },
  { id: 'mammogram', name: 'Mammogram', category: 'imaging' },
  { id: 'dexa', name: 'DEXA Scan (Bone Density)', category: 'imaging' },
  { id: 'echocardiogram', name: 'Echocardiogram', category: 'imaging' },
  { id: 'pet', name: 'PET Scan', category: 'imaging' },
  { id: 'pet_ct', name: 'PET/CT Scan', category: 'imaging' },
  { id: 'mra', name: 'MRA (Magnetic Resonance Angiography)', category: 'imaging' },
  { id: 'angiogram', name: 'Angiogram', category: 'imaging' },
  { id: 'fluoroscopy', name: 'Fluoroscopy', category: 'imaging' },
  { id: 'nuclear', name: 'Nuclear Medicine Scan', category: 'imaging' },
  { id: 'stress_test', name: 'Cardiac Stress Test', category: 'imaging' },
  { id: 'ekg', name: 'Electrocardiogram (EKG/ECG)', category: 'imaging' },
  { id: 'abdominal_us', name: 'Abdominal Ultrasound', category: 'imaging' },
  { id: 'pelvic_us', name: 'Pelvic Ultrasound', category: 'imaging' },
  { id: 'thyroid_us', name: 'Thyroid Ultrasound', category: 'imaging' },
  { id: 'breast_us', name: 'Breast Ultrasound', category: 'imaging' },
  { id: 'cranial_ct', name: 'Cranial CT Scan', category: 'imaging' },
  { id: 'chest_ct', name: 'Chest CT Scan', category: 'imaging' },
  { id: 'abdominal_ct', name: 'Abdominal CT Scan', category: 'imaging' },
  { id: 'cranial_mri', name: 'Cranial MRI', category: 'imaging' },
  { id: 'spine_mri', name: 'Spine MRI', category: 'imaging' },
  { id: 'joint_mri', name: 'Joint MRI', category: 'imaging' },
  { id: 'chest_xray', name: 'Chest X-Ray', category: 'imaging' },
  { id: 'bone_xray', name: 'Bone X-Ray', category: 'imaging' },
  { id: 'dental_xray', name: 'Dental X-Ray', category: 'imaging' },
  
  // Documents
  { id: 'vaccination', name: 'Vaccination Record', category: 'document' },
  { id: 'prescription', name: 'Prescription', category: 'document' },
  { id: 'discharge', name: 'Hospital Discharge Summary', category: 'document' },
  { id: 'referral', name: 'Specialist Referral', category: 'document' },
  { id: 'insurance', name: 'Insurance Documentation', category: 'document' },
  { id: 'consultation', name: 'Consultation Report', category: 'document' },
  { id: 'surgical_report', name: 'Surgical Report', category: 'document' },
  { id: 'allergy_list', name: 'Allergy List', category: 'document' },
  { id: 'medication_list', name: 'Medication List', category: 'document' },
  { id: 'medical_history', name: 'Medical History', category: 'document' },
  
  // Other option for custom input
  { id: 'other_lab', name: 'Other Lab Test (Custom)', category: 'lab' },
  { id: 'other_imaging', name: 'Other Imaging (Custom)', category: 'imaging' },
  { id: 'other_document', name: 'Other Document (Custom)', category: 'document' },
];

export default function UploadMedicalRecordScreen() {
  const router = useRouter();
  const { source } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { uploadMedicalRecord, isLoading } = useMedicalRecordsStore();
  
  const [title, setTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [recordType, setRecordType] = useState<'lab' | 'imaging' | 'document'>('document');
  const [provider, setProvider] = useState('');
  const [fileSelected, setFileSelected] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [showDocumentPicker, setShowDocumentPicker] = useState(false);
  const [filteredTests, setFilteredTests] = useState(COMMON_TESTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // OCR-related state
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string>('');
  const [ocrSuggestions, setOcrSuggestions] = useState<{title?: string, provider?: string}>({});
  const [isTypeAutoDetected, setIsTypeAutoDetected] = useState(false);
  
  // Handle file selection based on source parameter if provided
  React.useEffect(() => {
    if (source === 'camera') {
      handleTakePhoto();
    } else if (source === 'file') {
      handleSelectFile();
    }
  }, [source]);
  
  // Filter the tests based on the selected record type and search query
  React.useEffect(() => {
    let filtered = COMMON_TESTS.filter(test => test.category === recordType);
    
    // Apply search filter if there's a query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(test => 
        test.name.toLowerCase().includes(query)
      );
    }
    
    // Always include the "Other" option for the current record type
    const otherOption = COMMON_TESTS.find(test => test.id === `other_${recordType}`);
    if (otherOption && !filtered.includes(otherOption)) {
      filtered.push(otherOption);
    }
    
    setFilteredTests(filtered);
  }, [recordType, searchQuery]);
  
  // OCR Processing Functions
  const processImageWithOCR = async (imageUri: string) => {
    setIsProcessingOCR(true);
    try {
      // Simulate OCR processing - In a real app, you would use a library like:
      // - @react-native-ml-kit/text-recognition
      // - expo-image-manipulator with text recognition
      // - Cloud OCR services like Google Vision API
      
      // For demonstration, we'll simulate OCR results
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      // Mock OCR results based on common medical document patterns
      const mockOCRResults = simulateOCRExtraction(fileName);
      
      setExtractedText(mockOCRResults.fullText);
      setOcrSuggestions({
        title: mockOCRResults.suggestedTitle,
        provider: mockOCRResults.suggestedProvider
      });
      
      // Auto-detect document type based on extracted text and suggested title
      const detectedType = determineDocumentType(mockOCRResults.fullText, mockOCRResults.suggestedTitle);
      
      // Always show auto-detection feedback
      if (detectedType !== recordType) {
        setRecordType(detectedType);
        setIsTypeAutoDetected(true);
        Alert.alert(
          '🎯 Document Type Auto-Detected!',
          `Smart Analysis Results:\n\n📋 Detected: ${getTypeDisplayName(detectedType)}\n📄 Title: ${mockOCRResults.suggestedTitle}\n🏥 Provider: ${mockOCRResults.suggestedProvider}\n\nThe document type has been automatically set based on the content analysis. You can change it manually if needed.`,
          [{ text: 'Perfect!', style: 'default' }]
        );
      } else {
        // Show confirmation that the type was verified correctly
        setIsTypeAutoDetected(true);
        Alert.alert(
          '✅ Document Type Verified!',
          `Smart Analysis Confirmed:\n\n📋 Type: ${getTypeDisplayName(detectedType)}\n📄 Title: ${mockOCRResults.suggestedTitle}\n\nThe system confirmed your document type selection is correct!`,
          [{ text: 'Great!', style: 'default' }]
        );
      }
      
      // Auto-fill suggestions if fields are empty
      if (!title && mockOCRResults.suggestedTitle) {
        setTitle(mockOCRResults.suggestedTitle);
      }
      if (!provider && mockOCRResults.suggestedProvider) {
        setProvider(mockOCRResults.suggestedProvider);
      }
      
      setShowExtractedText(true);
      
    } catch (error) {
      console.error('OCR processing error:', error);
      Alert.alert('OCR Error', 'Could not extract text from the image. Please enter the information manually.');
    } finally {
      setIsProcessingOCR(false);
    }
  };
  
  // Simulate OCR text extraction with common medical document patterns
  const simulateOCRExtraction = (filename: string) => {
    // Make OCR results more deterministic based on filename
    const lowerFilename = filename.toLowerCase();
    
    // Determine document type based on filename hints first
    if (lowerFilename.includes('lab') || lowerFilename.includes('blood') || lowerFilename.includes('test')) {
      return {
        fullText: "LABORATORY REPORT\nPatient: John Smith\nDOB: 01/15/1980\nTest: Complete Blood Count (CBC)\nDate: December 15, 2024\nProvider: City Medical Center\n\nRESULTS:\nWBC: 7.2 x 10^3/uL (Reference: 4.0-11.0)\nRBC: 4.8 x 10^6/uL (Reference: 4.2-5.8)\nHemoglobin: 14.5 g/dL (Reference: 12.0-16.0)\nHematocrit: 42.1% (Reference: 36.0-48.0)\nPlatelet Count: 285 x 10^3/uL (Reference: 150-450)\n\nSerum Glucose: 95 mg/dL (Reference: 70-100 mg/dL)\nTotal Cholesterol: 180 mg/dL (Reference: <200 mg/dL)\nLDL: 110 mg/dL (Reference: <130 mg/dL)\nHDL: 55 mg/dL (Reference: >40 mg/dL)\n\nSTATUS: Normal Range\nLab Director: Dr. Sarah Wilson, MD",
        suggestedTitle: "Complete Blood Count (CBC)",
        suggestedProvider: "City Medical Center"
      };
    }
    
    if (lowerFilename.includes('xray') || lowerFilename.includes('x-ray') || lowerFilename.includes('chest') || lowerFilename.includes('radiology')) {
      return {
        fullText: "RADIOLOGY REPORT\nPatient Name: Sarah Johnson\nExam: Chest X-Ray (PA and Lateral)\nDate of Service: 12/15/2024\nClinical Indication: Routine screening\nRadiology Associates\n\nTECHNIQUE: PA and lateral chest radiographs were obtained\n\nFINDINGS: \nThe heart size is within normal limits. The lungs are clear bilaterally with no evidence of consolidation, pneumothorax, or pleural effusion. The bony structures appear intact.\n\nIMPRESSION: Normal chest X-ray examination\n\nRadiologist: Dr. Michael Thompson, MD\nSigned: 12/15/2024 2:30 PM",
        suggestedTitle: "Chest X-Ray",
        suggestedProvider: "Radiology Associates"
      };
    }
    
    if (lowerFilename.includes('ct') || lowerFilename.includes('scan') || lowerFilename.includes('mri') || lowerFilename.includes('ultrasound')) {
      return {
        fullText: "CT ABDOMEN AND PELVIS REPORT\nPatient: Maria Garcia\nDate: 12/15/2024\nExam: Computed Tomography - Abdomen and Pelvis\nContrast: IV contrast administered\nUniversity Medical Imaging\n\nTECHNIQUE: Axial CT images of the abdomen and pelvis were obtained following administration of oral and intravenous contrast material.\n\nFINDINGS:\nLiver, gallbladder, pancreas, spleen, and kidneys appear normal. No masses or fluid collections identified. The bowel loops are unremarkable. No lymphadenopathy.\n\nIMPRESSION: Normal CT examination of abdomen and pelvis\n\nRadiologist: Dr. Patricia Lee, MD",
        suggestedTitle: "CT Scan",
        suggestedProvider: "University Medical Imaging"
      };
    }
    
    if (lowerFilename.includes('prescription') || lowerFilename.includes('rx') || lowerFilename.includes('medication')) {
      return {
        fullText: "PRESCRIPTION\nPatient: Michael Brown\nDOB: 05/22/1975\nDate: 12/15/2024\n\nRx: Lisinopril 10mg tablets\nQuantity: 30 tablets\nSig: Take one tablet by mouth daily for blood pressure\nRefills: 2\nGeneric substitution permitted\n\nPrescribing Physician: Dr. Emily Davis, MD\nHealthcare Clinic\nDEA#: BD1234567\nNPI: 1234567890",
        suggestedTitle: "Prescription",
        suggestedProvider: "Healthcare Clinic"
      };
    }
    
    // Default to a lab test if no specific indicators
    const mockTexts = [
      {
        fullText: "LABORATORY REPORT\nPatient: John Smith\nDOB: 01/15/1980\nTest: Complete Blood Count (CBC)\nDate: December 15, 2024\nProvider: City Medical Center\n\nRESULTS:\nWBC: 7.2 x 10^3/uL (Reference: 4.0-11.0)\nRBC: 4.8 x 10^6/uL (Reference: 4.2-5.8)\nHemoglobin: 14.5 g/dL (Reference: 12.0-16.0)\nHematocrit: 42.1% (Reference: 36.0-48.0)\nPlatelet Count: 285 x 10^3/uL (Reference: 150-450)\n\nSerum Glucose: 95 mg/dL (Reference: 70-100 mg/dL)\nTotal Cholesterol: 180 mg/dL (Reference: <200 mg/dL)\nLDL: 110 mg/dL (Reference: <130 mg/dL)\nHDL: 55 mg/dL (Reference: >40 mg/dL)\n\nSTATUS: Normal Range",
        suggestedTitle: "Complete Blood Count (CBC)",
        suggestedProvider: "City Medical Center"
      },
      {
        fullText: "RADIOLOGY REPORT\nPatient Name: Sarah Johnson\nExam: Chest X-Ray (PA and Lateral)\nDate of Service: 12/15/2024\nClinical Indication: Routine screening\nRadiology Associates\n\nTECHNIQUE: PA and lateral chest radiographs were obtained\n\nFINDINGS: \nThe heart size is within normal limits. The lungs are clear bilaterally with no evidence of consolidation, pneumothorax, or pleural effusion. The bony structures appear intact.\n\nIMPRESSION: Normal chest X-ray examination\n\nRadiologist: Dr. Michael Thompson, MD\nSigned: 12/15/2024 2:30 PM",
        suggestedTitle: "Chest X-Ray",
        suggestedProvider: "Radiology Associates"
      },
      {
        fullText: "LIPID PANEL RESULTS\nPatient: Robert Johnson\nDate of Collection: 12/15/2024\nLaboratory: Quest Diagnostics\n\nFasting Lipid Profile:\nTotal Cholesterol: 220 mg/dL (Reference: <200)\nLDL Cholesterol: 140 mg/dL (Reference: <130)\nHDL Cholesterol: 45 mg/dL (Reference: >40)\nTriglycerides: 150 mg/dL (Reference: <150)\nNon-HDL Cholesterol: 175 mg/dL\n\nThyroid Function Tests:\nTSH: 2.5 mIU/L (Reference: 0.4-4.0)\nFree T4: 1.2 ng/dL (Reference: 0.8-1.8)\n\nAll reference ranges provided\nPhlebotomist: Jane Doe\nLab Director: Dr. Smith",
        suggestedTitle: "Lipid Panel (Cholesterol)",
        suggestedProvider: "Quest Diagnostics Laboratory"
      }
    ];
    
    // Return first mock result as default
    return mockTexts[0];
  };
  
  const extractMedicalInfo = (text: string) => {
    const lines = text.split('\n');
    let suggestedTitle = '';
    let suggestedProvider = '';
    
    // Look for common medical document indicators
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Extract test/document type
      if (lowerLine.includes('blood count') || lowerLine.includes('cbc')) {
        suggestedTitle = 'Complete Blood Count (CBC)';
      } else if (lowerLine.includes('x-ray') || lowerLine.includes('radiograph')) {
        suggestedTitle = 'X-Ray';
      } else if (lowerLine.includes('mri')) {
        suggestedTitle = 'MRI';
      } else if (lowerLine.includes('ct scan') || lowerLine.includes('computed tomography')) {
        suggestedTitle = 'CT Scan';
      } else if (lowerLine.includes('ultrasound')) {
        suggestedTitle = 'Ultrasound';
      } else if (lowerLine.includes('prescription')) {
        suggestedTitle = 'Prescription';
      }
      
      // Extract provider/facility name
      if (lowerLine.includes('medical center') || lowerLine.includes('hospital') || 
          lowerLine.includes('clinic') || lowerLine.includes('healthcare') ||
          lowerLine.includes('associates') || lowerLine.includes('laboratory')) {
        suggestedProvider = line.trim();
      }
    }
    
    return { suggestedTitle, suggestedProvider };
  };
  
  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "You need to grant camera permissions to take a photo.");
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled) {
        const asset = result.assets[0];
        setFileSelected(true);
        setFileName(asset.fileName || 'camera_image.jpg');
        setFileType('image/jpeg');
        setSelectedImageUri(asset.uri);
        
        // Automatically process image with OCR for document type detection
        processImageWithOCR(asset.uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "There was an error taking a photo. Please try again.");
    }
  };
  
  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled === false) {
        const asset = result.assets[0];
        setFileSelected(true);
        setFileName(asset.name);
        setFileType(asset.mimeType || '');
        setSelectedImageUri(asset.uri);
        
        // Automatically process image files with OCR for document type detection
        if (asset.mimeType?.startsWith('image/')) {
          processImageWithOCR(asset.uri);
        }
      }
    } catch (error) {
      console.error("Error selecting file:", error);
      Alert.alert("Error", "There was an error selecting a file. Please try again.");
    }
  };
  
  const handleUpload = async () => {
    // If "Other" is selected, use the custom title, otherwise use the selected title
    const finalTitle = title.includes('Other') && title.includes('Custom') ? customTitle : title;
    
    if (!finalTitle) {
      Alert.alert("Missing Information", "Please provide a title for your document.");
      return;
    }
    
    if (!fileSelected) {
      Alert.alert("No File Selected", "Please select a file to upload.");
      return;
    }
    
    if (!user) {
      Alert.alert("Authentication Error", "You must be logged in to upload documents.");
      return;
    }
    
    const record = {
      patientId: user.id.toString(),
      type: recordType,
      title: finalTitle,
      date: new Date().toISOString(),
      provider: provider || 'Self-uploaded',
      fileType,
      id: `record-${Date.now()}`, // In a real app, this would be generated by the server
    };
    
    const success = await uploadMedicalRecord(record);
    
    if (success) {
      Alert.alert(
        "Upload Successful", 
        "Your medical record has been uploaded successfully.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } else {
      Alert.alert("Upload Failed", "There was an error uploading your document. Please try again.");
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'lab':
        return <FileText size={20} color={Colors.danger} />;
      case 'imaging':
        return <ImageIcon size={20} color={Colors.info} />;
      case 'document':
        return <FileText size={20} color={Colors.success} />;
      default:
        return <FileText size={20} color={Colors.textSecondary} />;
    }
  };

  const selectTest = (test: {id: string, name: string, category: string}) => {
    setTitle(test.name);
    setShowDocumentPicker(false);
    
    // If an "Other" option is selected, clear the custom title field
    if (test.id.startsWith('other_')) {
      setCustomTitle('');
    }
  };

  // Get modal title based on record type
  const getModalTitle = () => {
    switch (recordType) {
      case 'lab':
        return 'Select Lab Test';
      case 'imaging':
        return 'Select Imaging Test';
      case 'document':
        return 'Select Document Type';
      default:
        return 'Select Document Type';
    }
  };

  // Handle changing record type
  const handleRecordTypeChange = (type: 'lab' | 'imaging' | 'document') => {
    if (type !== recordType) {
      setRecordType(type);
      setTitle('');
      setCustomTitle('');
      setSearchQuery('');
      setIsTypeAutoDetected(false); // Reset auto-detection flag when manually changing type
    }
  };

  // Prepare data without section headers
  const getTestsWithSections = () => {
    // Get all tests for the current record type
    let filtered = filteredTests;
    
    // If searching, just return filtered results
    if (searchQuery.trim()) {
      return filtered;
    }
    
    // Make sure the "Other" option is at the end
    const otherOption = filtered.find(test => test.id.startsWith('other_'));
    if (otherOption) {
      filtered = filtered.filter(test => !test.id.startsWith('other_'));
      filtered.push(otherOption);
    }
    
    return filtered;
  };

  // Get page title based on record type
  const getPageTitle = () => {
    switch (recordType) {
      case 'lab':
        return 'Upload Lab Result';
      case 'imaging':
        return 'Upload Imaging';
      case 'document':
        return 'Upload Document';
      default:
        return 'Upload Document';
    }
  };

  // Determine document type based on extracted text and suggested title
  const determineDocumentType = (text: string, suggestedTitle?: string): 'lab' | 'imaging' | 'document' => {
    const lowerText = text.toLowerCase();
    const lowerTitle = suggestedTitle?.toLowerCase() || '';
    const combinedText = `${lowerText} ${lowerTitle}`;
    
    console.log('=== OCR Document Type Detection ===');
    console.log('Title:', suggestedTitle);
    console.log('Text sample:', text.substring(0, 300) + '...');
    
    // Enhanced detection with multiple strategies
    
    // Strategy 1: Check suggested title first (highest confidence)
    if (lowerTitle) {
      // Lab test titles
      const labTitles = ['complete blood count', 'cbc', 'lipid panel', 'cholesterol', 'urinalysis', 
                        'blood test', 'lab result', 'laboratory', 'metabolic panel', 'thyroid function',
                        'liver function', 'kidney function', 'glucose test', 'hemoglobin', 'vitamin'];
      
      // Imaging titles
      const imagingTitles = ['x-ray', 'xray', 'ct scan', 'mri', 'ultrasound', 'mammogram', 
                            'pet scan', 'chest x-ray', 'radiology', 'imaging', 'echocardiogram',
                            'bone scan', 'fluoroscopy', 'angiogram'];
      
      // Document titles
      const documentTitles = ['prescription', 'medication', 'discharge', 'vaccination', 
                             'referral', 'insurance', 'consultation'];
      
      for (const title of labTitles) {
        if (lowerTitle.includes(title)) {
          console.log(`✅ Lab detected from title: "${title}"`);
          return 'lab';
        }
      }
      
      for (const title of imagingTitles) {
        if (lowerTitle.includes(title)) {
          console.log(`✅ Imaging detected from title: "${title}"`);
          return 'imaging';
        }
      }
      
      for (const title of documentTitles) {
        if (lowerTitle.includes(title)) {
          console.log(`✅ Document detected from title: "${title}"`);
          return 'document';
        }
      }
    }
    
    // Strategy 2: Check document header/report type
    const labHeaders = ['laboratory report', 'lab report', 'lab result', 'laboratory result'];
    const imagingHeaders = ['radiology report', 'imaging report', 'x-ray report', 'ct report', 'mri report'];
    
    for (const header of labHeaders) {
      if (lowerText.includes(header)) {
        console.log(`✅ Lab detected from header: "${header}"`);
        return 'lab';
      }
    }
    
    for (const header of imagingHeaders) {
      if (lowerText.includes(header)) {
        console.log(`✅ Imaging detected from header: "${header}"`);
        return 'imaging';
      }
    }
    
    // Strategy 3: Look for specific test indicators
    const labIndicators = [
      'blood count', 'lipid profile', 'cholesterol test', 'glucose test', 'thyroid test',
      'liver function', 'kidney function', 'urinalysis', 'metabolic panel', 'hemoglobin',
      'wbc', 'rbc', 'platelet', 'creatinine', 'bun', 'glucose', 'cholesterol'
    ];
    
    const imagingIndicators = [
      'chest x-ray', 'computed tomography', 'magnetic resonance', 'ultrasound examination',
      'radiograph', 'ct scan', 'mri scan', 'pet scan', 'mammography', 'fluoroscopy'
    ];
    
    let labScore = 0;
    let imagingScore = 0;
    
    labIndicators.forEach(indicator => {
      if (combinedText.includes(indicator)) {
        labScore++;
        console.log(`Lab indicator found: "${indicator}"`);
      }
    });
    
    imagingIndicators.forEach(indicator => {
      if (combinedText.includes(indicator)) {
        imagingScore++;
        console.log(`Imaging indicator found: "${indicator}"`);
      }
    });
    
    // Strategy 4: Look for medical values and units (strong lab indicator)
    const labValuePatterns = [
      /\d+\.?\d*\s*(mg\/dl|g\/dl|mmol\/l|iu\/l|u\/l|ng\/ml|pg\/ml|pmol\/l|meq\/l)/gi,
      /reference:\s*\d+\.?\d*\s*-\s*\d+\.?\d*/gi,
      /normal range/gi,
      /\(reference[^)]*\)/gi
    ];
    
    labValuePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        labScore += matches.length;
        console.log(`Lab value pattern found: ${matches.length} matches`);
      }
    });
    
    // Strategy 5: Look for imaging-specific terminology
    const imagingPatterns = [
      /findings:/gi,
      /impression:/gi,
      /technique:/gi,
      /contrast/gi,
      /radiologist/gi,
      /no acute/gi,
      /normal study/gi
    ];
    
    imagingPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        imagingScore += matches.length;
        console.log(`Imaging pattern found: ${matches.length} matches`);
      }
    });
    
    // Strategy 6: Special document type detection
    if (lowerText.includes('prescription') || lowerText.includes('rx:') || 
        lowerText.includes('sig:') || lowerText.includes('refills:')) {
      console.log('✅ Prescription document detected');
      return 'document';
    }
    
    if (lowerText.includes('vaccination') || lowerText.includes('vaccine') || 
        lowerText.includes('immunization')) {
      console.log('✅ Vaccination document detected');
      return 'document';
    }
    
    if (lowerText.includes('discharge summary') || lowerText.includes('discharge instructions')) {
      console.log('✅ Discharge document detected');
      return 'document';
    }
    
    // Final decision
    console.log(`Final scores - Lab: ${labScore}, Imaging: ${imagingScore}`);
    
    if (labScore > imagingScore && labScore > 0) {
      console.log('✅ Final decision: LAB');
      return 'lab';
    } else if (imagingScore > labScore && imagingScore > 0) {
      console.log('✅ Final decision: IMAGING');
      return 'imaging';
    } else {
      console.log('✅ Final decision: DOCUMENT (default)');
      return 'document';
    }
  };
  
  // Get display name for document type
  const getTypeDisplayName = (type: 'lab' | 'imaging' | 'document'): string => {
    switch (type) {
      case 'lab':
        return 'Lab Result';
      case 'imaging':
        return 'Medical Imaging';
      case 'document':
        return 'Medical Document';
      default:
        return 'Document';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getPageTitle()}</Text>
        <View style={styles.rightPlaceholder} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Document Title*</Text>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDocumentPicker(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {title || "Select document type"}
            </Text>
            <ChevronDown size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          {/* Custom title input shown when any "Other" option is selected */}
          {title.includes('Other') && title.includes('Custom') && (
            <View style={styles.customTitleContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter custom document title"
                value={customTitle}
                onChangeText={setCustomTitle}
              />
            </View>
          )}
          
          {/* Modal for document type selection */}
          <Modal
            visible={showDocumentPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDocumentPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{getModalTitle()}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowDocumentPicker(false)}
                  >
                    <X size={24} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={Colors.textSecondary}
                    autoCapitalize="none"
                  />
                </View>
                
                <FlatList
                  data={getTestsWithSections()}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() => selectTest(item)}
                    >
                      <Text style={styles.optionText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.optionsList}
                  ListEmptyComponent={
                    <Text style={styles.noResultsText}>No matching tests found</Text>
                  }
                />
              </View>
            </View>
          </Modal>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Document Type</Text>
          {isTypeAutoDetected && (
            <View style={styles.autoDetectedBanner}>
              <Text style={styles.autoDetectedText}>🎯 Auto-detected from image</Text>
            </View>
          )}
          <View style={styles.recordTypeContainer}>
            <TouchableOpacity 
              style={[
                styles.recordTypeButton,
                recordType === 'document' && styles.recordTypeButtonActive,
              ]}
              onPress={() => handleRecordTypeChange('document')}
            >
              {getRecordTypeIcon('document')}
              <Text 
                style={[
                  styles.recordTypeText,
                  recordType === 'document' && styles.recordTypeTextActive,
                ]}
              >
                Document
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.recordTypeButton,
                recordType === 'lab' && styles.recordTypeButtonActive,
              ]}
              onPress={() => handleRecordTypeChange('lab')}
            >
              {getRecordTypeIcon('lab')}
              <Text 
                style={[
                  styles.recordTypeText,
                  recordType === 'lab' && styles.recordTypeTextActive,
                ]}
              >
                Lab Result
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.recordTypeButton,
                recordType === 'imaging' && styles.recordTypeButtonActive,
              ]}
              onPress={() => handleRecordTypeChange('imaging')}
            >
              {getRecordTypeIcon('imaging')}
              <Text 
                style={[
                  styles.recordTypeText,
                  recordType === 'imaging' && styles.recordTypeTextActive,
                ]}
              >
                Imaging
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Healthcare Provider (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter provider name"
            value={provider}
            onChangeText={setProvider}
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Upload File*</Text>
          
          {fileSelected ? (
            <View style={styles.selectedFileContainer}>
              <View style={styles.selectedFileInfo}>
                <FileText size={24} color={Colors.primary} />
                <View style={styles.fileNameContainer}>
                  <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                    {fileName}
                  </Text>
                  <Text style={styles.fileType}>{fileType}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.removeFileButton}
                onPress={() => {
                  setFileSelected(false);
                  setFileName('');
                  setFileType('');
                }}
              >
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadOptions}>
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={handleTakePhoto}
              >
                <View style={styles.uploadIconContainer}>
                  <Camera size={24} color={Colors.primary} />
                </View>
                <Text style={styles.uploadOptionText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={handleSelectFile}
              >
                <View style={styles.uploadIconContainer}>
                  <Upload size={24} color={Colors.primary} />
                </View>
                <Text style={styles.uploadOptionText}>Upload File</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* OCR Processing Status and Results */}
        {isProcessingOCR && (
          <View style={styles.ocrProcessingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.ocrProcessingText}>Extracting text from image...</Text>
          </View>
        )}
        
        {extractedText && !isProcessingOCR && (
          <View style={styles.ocrResultsContainer}>
            <View style={styles.ocrHeader}>
              <Text style={styles.ocrTitle}>Extracted Text</Text>
              <TouchableOpacity 
                style={styles.ocrToggleButton}
                onPress={() => setShowExtractedText(!showExtractedText)}
              >
                <Eye size={20} color={Colors.primary} />
                <Text style={styles.ocrToggleText}>
                  {showExtractedText ? 'Hide' : 'Show'} Text
                </Text>
              </TouchableOpacity>
            </View>
            
            {showExtractedText && (
              <View style={styles.extractedTextContainer}>
                <ScrollView style={styles.extractedTextScroll} nestedScrollEnabled>
                  <Text style={styles.extractedText}>{extractedText}</Text>
                </ScrollView>
              </View>
            )}
            
            {(ocrSuggestions.title || ocrSuggestions.provider || isTypeAutoDetected) && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Auto-detected Information:</Text>
                {isTypeAutoDetected && (
                  <View style={styles.suggestionItem}>
                    <Text style={styles.suggestionLabel}>Document Type:</Text>
                    <Text style={styles.suggestionValue}>{getTypeDisplayName(recordType)} ✅</Text>
                  </View>
                )}
                {ocrSuggestions.title && (
                  <TouchableOpacity 
                    style={styles.suggestionItem}
                    onPress={() => setTitle(ocrSuggestions.title || '')}
                  >
                    <Text style={styles.suggestionLabel}>Document Title:</Text>
                    <Text style={styles.suggestionValue}>{ocrSuggestions.title}</Text>
                  </TouchableOpacity>
                )}
                {ocrSuggestions.provider && (
                  <TouchableOpacity 
                    style={styles.suggestionItem}
                    onPress={() => setProvider(ocrSuggestions.provider || '')}
                  >
                    <Text style={styles.suggestionLabel}>Provider:</Text>
                    <Text style={styles.suggestionValue}>{ocrSuggestions.provider}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
        
        <View style={styles.submitButtonContainer}>
          <Button
            variant="secondary"
            onPress={() => router.back()}
            title="Cancel"
            style={styles.submitButton}
          />
          <Button
            variant="primary"
            onPress={handleUpload}
            title={`Upload ${recordType === 'lab' ? 'Lab Result' : recordType === 'imaging' ? 'Imaging' : 'Document'}`}
            style={styles.submitButton}
            disabled={isLoading}
            loading={isLoading}
          />
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
  formSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.text,
  },
  input: {
    ...Typography.body,
    height: 48,
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 8,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
  },
  dropdownButton: {
    ...Typography.body,
    height: 48,
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    ...Typography.body,
    color: Colors.text,
  },
  customTitleContainer: {
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    ...Typography.body,
    height: 48,
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 8,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
  },
  optionsList: {
    flexGrow: 0,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionText: {
    ...Typography.body,
    color: Colors.text,
  },
  recordTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordTypeButtonActive: {
    backgroundColor: `${Colors.primary}15`,
    borderColor: Colors.primary,
  },
  recordTypeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: 8,
  },
  recordTypeTextActive: {
    color: Colors.primary,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileNameContainer: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: 2,
  },
  fileType: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  removeFileButton: {
    padding: 8,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}15`,
    marginBottom: 8,
  },
  uploadOptionText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  submitButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
  submitButton: {
    width: 120,
    marginHorizontal: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginLeft: 16,
  },
  rightPlaceholder: {
    flex: 1,
  },
  noResultsText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  ocrProcessingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 8,
    marginBottom: 16,
  },
  ocrProcessingText: {
    ...Typography.body,
    color: Colors.text,
    marginLeft: 8,
  },
  ocrResultsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ocrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ocrTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  ocrToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  ocrToggleText: {
    ...Typography.body,
    color: Colors.primary,
    marginLeft: 8,
  },
  extractedTextContainer: {
    backgroundColor: Colors.background,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginBottom: 16,
  },
  extractedTextScroll: {
    maxHeight: 200,
  },
  extractedText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 20,
  },
  suggestionsContainer: {
    backgroundColor: `${Colors.primary}10`,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
  },
  suggestionsTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderRadius: 6,
    marginBottom: 8,
  },
  suggestionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  suggestionValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  autoDetectedBanner: {
    backgroundColor: `${Colors.primary}10`,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 6,
    marginBottom: 16,
  },
  autoDetectedText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});