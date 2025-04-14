import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User as UserIcon, Edit, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import Tag from '@/components/Tag';
import MedicationCard from '@/components/MedicationCard';
import { mockTreatmentPlan } from '@/mocks/medical-records';
import { mockPatients } from '@/mocks/users';

export default function TreatmentPlanScreen() {
  const router = useRouter();
  const patient = mockPatients[0];

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title="Treatment Plan" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.patientHeader}>
          <View style={styles.patientInfo}>
            <View style={styles.patientIconContainer}>
              <UserIcon size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientDetails}>42y Female • MRN: {patient.medicalRecordNumber}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editButton}>
            <Edit size={20} color={Colors.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnosis</Text>
          <View style={styles.diagnosisCard}>
            <View style={styles.diagnosisTags}>
              <Tag 
                label="Essential Hypertension (I10)" 
                color={Colors.danger} 
              />
              <Tag 
                label="Hyperlipidemia (E78.5)" 
                color={Colors.primary} 
              />
            </View>
            
            <View style={styles.diagnosisItem}>
              <Text style={styles.diagnosisLabel}>Primary:</Text>
              <Text style={styles.diagnosisValue}>Essential (primary) hypertension</Text>
            </View>
            
            <View style={styles.diagnosisItem}>
              <Text style={styles.diagnosisLabel}>Secondary:</Text>
              <Text style={styles.diagnosisValue}>Hyperlipidemia, unspecified</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Treatment Goals</Text>
          <View style={styles.goalsCard}>
            {mockTreatmentPlan.goals.map((goal) => (
              <View key={goal.id} style={styles.goalItem}>
                <View style={styles.checkboxContainer}>
                  {goal.isCompleted ? (
                    <View style={styles.checkboxChecked}>
                      <Check size={16} color={Colors.background} />
                    </View>
                  ) : (
                    <View style={styles.checkbox} />
                  )}
                </View>
                <Text style={styles.goalText}>{goal.description}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prescribed Medications</Text>
          {mockTreatmentPlan.medications.map((medication) => (
            <MedicationCard 
              key={medication.id} 
              medication={medication}
            />
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle Recommendations</Text>
          <View style={styles.recommendationsCard}>
            <View style={styles.recommendationItem}>
              <View style={styles.recommendationIconContainer}>
                <Text style={styles.recommendationIcon}>🥗</Text>
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>DASH Diet</Text>
                <Text style={styles.recommendationText}>
                  Follow the DASH diet to help lower blood pressure. Focus on fruits, vegetables, whole grains, and low-fat dairy.
                </Text>
              </View>
            </View>
            
            <View style={styles.recommendationItem}>
              <View style={styles.recommendationIconContainer}>
                <Text style={styles.recommendationIcon}>🏃</Text>
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>Regular Exercise</Text>
                <Text style={styles.recommendationText}>
                  Aim for at least 150 minutes of moderate-intensity aerobic activity per week.
                </Text>
              </View>
            </View>
            
            <View style={styles.recommendationItem}>
              <View style={styles.recommendationIconContainer}>
                <Text style={styles.recommendationIcon}>🧂</Text>
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>Sodium Restriction</Text>
                <Text style={styles.recommendationText}>
                  Limit sodium intake to less than 2,300 mg per day. Avoid processed foods and read food labels.
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow-up Plan</Text>
          <View style={styles.followUpCard}>
            <View style={styles.followUpItem}>
              <Text style={styles.followUpLabel}>Next Appointment:</Text>
              <Text style={styles.followUpValue}>January 15, 2024</Text>
            </View>
            
            <View style={styles.followUpItem}>
              <Text style={styles.followUpLabel}>Labs Due:</Text>
              <Text style={styles.followUpValue}>December 20, 2023</Text>
            </View>
            
            <View style={styles.followUpItem}>
              <Text style={styles.followUpLabel}>Special Instructions:</Text>
              <Text style={styles.followUpValue}>
                Monitor blood pressure at home twice weekly. Call if BP exceeds 140/90 mmHg or if experiencing headaches, dizziness, or chest pain.
              </Text>
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
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  patientName: {
    ...Typography.h4,
    marginBottom: 4,
  },
  patientDetails: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: 12,
  },
  diagnosisCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  diagnosisTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  diagnosisItem: {
    marginBottom: 8,
  },
  diagnosisLabel: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  diagnosisValue: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  goalsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  checkboxChecked: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalText: {
    ...Typography.body,
    flex: 1,
  },
  recommendationsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  recommendationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationIcon: {
    fontSize: 20,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  recommendationText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  followUpCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  followUpItem: {
    marginBottom: 12,
  },
  followUpLabel: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  followUpValue: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});