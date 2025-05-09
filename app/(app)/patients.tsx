import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, User, Calendar, AlertCircle, Pill, CheckCircle2, XCircle, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';

const DUMMY_PATIENT_HISTORIES = [
  {
    patientId: 'p123',
    patientName: 'John Smith',
    dateOfBirth: '1985-06-15',
    prescriptions: [
      {
        id: 'rx1',
        medication: 'Amoxicillin 500mg',
        dosage: '1 capsule',
        frequency: '3 times daily',
        prescribedDate: '2024-03-20',
        endDate: '2024-03-27',
        status: 'active',
        prescribedBy: 'Dr. Sarah Chen'
      },
      {
        id: 'rx2',
        medication: 'Lisinopril 10mg',
        dosage: '1 tablet',
        frequency: 'once daily',
        prescribedDate: '2024-01-15',
        status: 'active',
        prescribedBy: 'Dr. Michael Rodriguez'
      }
    ],
    foodAllergies: ['Peanuts', 'Shellfish'],
    drugAllergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Hypertension'],
    personalHistory: ['Appendectomy (2010)', 'Smoker (2005-2015)'],
    familyHistory: ['Father: Heart Disease', 'Mother: Breast Cancer']
  },
  {
    patientId: 'p124',
    patientName: 'Emma Wilson',
    dateOfBirth: '1992-09-23',
    prescriptions: [
      {
        id: 'rx3',
        medication: 'Metformin 500mg',
        dosage: '1 tablet',
        frequency: 'twice daily',
        prescribedDate: '2024-02-01',
        status: 'active',
        prescribedBy: 'Dr. Emily Wong'
      }
    ],
    foodAllergies: ['None reported'],
    drugAllergies: ['None reported'],
    chronicConditions: ['Type 2 Diabetes'],
    personalHistory: ['Gestational Diabetes (2020)'],
    familyHistory: ['Father: Type 2 Diabetes', 'Grandmother: Hypertension']
  }
];

export default function PatientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<typeof DUMMY_PATIENT_HISTORIES[0] | null>(null);

  const filteredPatients = DUMMY_PATIENT_HISTORIES.filter(patient =>
    patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPatientCard = (patient: typeof DUMMY_PATIENT_HISTORIES[0]) => (
    <TouchableOpacity
      key={patient.patientId}
      style={[
        styles.patientCard,
        selectedPatient?.patientId === patient.patientId && styles.selectedCard
      ]}
      onPress={() => setSelectedPatient(patient)}
    >
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.patientName}</Text>
          <Text style={styles.patientId}>ID: {patient.patientId}</Text>
        </View>
        <View style={styles.ageInfo}>
          <Calendar size={16} color={Colors.textSecondary} />
          <Text style={styles.dateOfBirth}>DOB: {patient.dateOfBirth}</Text>
        </View>
      </View>

      <View style={styles.conditionsContainer}>
        {patient.chronicConditions.map((condition, index) => (
          <View key={index} style={styles.conditionBadge}>
            <AlertCircle size={12} color={Colors.warning} />
            <Text style={styles.conditionText}>{condition}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderPrescriptionCard = (prescription: typeof DUMMY_PATIENT_HISTORIES[0]['prescriptions'][0]) => (
    <View key={prescription.id} style={styles.prescriptionCard}>
      <View style={styles.prescriptionHeader}>
        <Pill size={16} color={Colors.primary} />
        <Text style={styles.medicationName}>{prescription.medication}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: prescription.status === 'active' ? `${Colors.success}30` : `${Colors.textSecondary}30` }
        ]}>
          <Text style={styles.statusText}>{prescription.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.prescriptionDetails}>
        <Text style={styles.dosageText}>
          {prescription.dosage} {prescription.frequency}
        </Text>
        <Text style={styles.prescriptionDate}>
          Prescribed: {prescription.prescribedDate}
          {prescription.endDate ? ` - ${prescription.endDate}` : ''}
        </Text>
        <Text style={styles.prescribedBy}>By: {prescription.prescribedBy}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title="Patient History" />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients by name or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.patientList}>
          <ScrollView>
            {filteredPatients.map(renderPatientCard)}
          </ScrollView>
        </View>

        {selectedPatient && (
          <View style={styles.patientDetails}>
            <ScrollView>
              <View style={styles.detailsHeader}>
                <Text style={styles.detailsTitle}>Patient Details</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Food Allergies</Text>
                <View style={styles.allergiesList}>
                  {selectedPatient.foodAllergies.map((allergy, index) => (
                    <View key={index} style={styles.allergyBadge}>
                      <AlertCircle size={12} color={Colors.danger} />
                      <Text style={styles.allergyText}>{allergy}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Drug/Medication Allergies</Text>
                <View style={styles.allergiesList}>
                  {selectedPatient.drugAllergies.map((allergy, index) => (
                    <View key={index} style={styles.allergyBadge}>
                      <AlertCircle size={12} color={Colors.danger} />
                      <Text style={styles.allergyText}>{allergy}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal History</Text>
                <View style={styles.historyList}>
                  {selectedPatient.personalHistory.map((history, index) => (
                    <View key={index} style={styles.historyItem}>
                      <CheckCircle2 size={12} color={Colors.success} />
                      <Text style={styles.historyText}>{history}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Family History</Text>
                <View style={styles.historyList}>
                  {selectedPatient.familyHistory.map((history, index) => (
                    <View key={index} style={styles.historyItem}>
                      <CheckCircle2 size={12} color={Colors.success} />
                      <Text style={styles.historyText}>{history}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Prescriptions</Text>
                {selectedPatient.prescriptions.map(renderPrescriptionCard)}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  patientList: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    padding: 16,
  },
  patientDetails: {
    flex: 1,
    padding: 16,
  },
  patientCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    ...Typography.h5,
    marginBottom: 4,
  },
  patientId: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  ageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateOfBirth: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.warning}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  conditionText: {
    ...Typography.caption,
    color: Colors.warning,
    marginLeft: 4,
  },
  detailsHeader: {
    marginBottom: 24,
  },
  detailsTitle: {
    ...Typography.h4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h5,
    marginBottom: 16,
  },
  allergiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  allergyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.danger}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  allergyText: {
    ...Typography.caption,
    color: Colors.danger,
    marginLeft: 4,
  },
  historyList: {
    flexDirection: 'column',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 8,
  },
  historyText: {
    ...Typography.body,
    color: Colors.text,
    marginLeft: 8,
  },
  prescriptionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationName: {
    ...Typography.body,
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  prescriptionDetails: {
    marginLeft: 24,
  },
  dosageText: {
    ...Typography.body,
    marginBottom: 4,
  },
  prescriptionDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  prescribedBy: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});