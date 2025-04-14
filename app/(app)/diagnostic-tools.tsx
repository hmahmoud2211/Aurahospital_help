import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stethoscope, Calculator, Pill, Search } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Tag from '@/components/Tag';

export default function DiagnosticToolsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title="Diagnostic Tools" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.toolsGrid}>
          <TouchableOpacity style={styles.toolCard}>
            <View style={[styles.toolIconContainer, { backgroundColor: Colors.primaryLight }]}>
              <Stethoscope size={24} color={Colors.primary} />
            </View>
            <Text style={styles.toolName}>Clinical Guidelines</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolCard}>
            <View style={[styles.toolIconContainer, { backgroundColor: Colors.primaryLight }]}>
              <Calculator size={24} color={Colors.primary} />
            </View>
            <Text style={styles.toolName}>Risk Calculators</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolCard}>
            <View style={[styles.toolIconContainer, { backgroundColor: Colors.primaryLight }]}>
              <Pill size={24} color={Colors.primary} />
            </View>
            <Text style={styles.toolName}>Drug Database</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolCard}>
            <View style={[styles.toolIconContainer, { backgroundColor: Colors.primaryLight }]}>
              <Search size={24} color={Colors.primary} />
            </View>
            <Text style={styles.toolName}>Differential Dx</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.riskAssessmentSection}>
          <Text style={styles.sectionTitle}>Risk Assessment</Text>
          
          <View style={styles.riskCard}>
            <Text style={styles.riskTitle}>ASCVD 10-Year Risk</Text>
            
            <View style={styles.riskScoreContainer}>
              <Text style={styles.riskScore}>7.8%</Text>
              <View style={styles.riskLevelContainer}>
                <Text style={styles.riskLevel}>Moderate</Text>
              </View>
            </View>
            
            <Text style={styles.patientInfo}>Sarah Johnson, 42y Female</Text>
            
            <View style={styles.riskComparisonContainer}>
              <View style={styles.riskComparisonItem}>
                <Text style={styles.riskComparisonLabel}>Current Risk</Text>
                <Text style={styles.riskComparisonValue}>7.8%</Text>
              </View>
              
              <View style={styles.riskComparisonItem}>
                <Text style={styles.riskComparisonLabel}>With Intervention</Text>
                <Text style={[styles.riskComparisonValue, { color: Colors.success }]}>5.2%</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.workupSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Diagnostic Workup</Text>
            <TouchableOpacity>
              <Text style={styles.addTestText}>Add Test</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.testItem}>
            <Text style={styles.testName}>Complete Blood Count</Text>
            <View style={styles.testStatusContainer}>
              <Text style={styles.testStatus}>Completed</Text>
            </View>
          </View>
          
          <View style={styles.testItem}>
            <Text style={styles.testName}>Lipid Panel</Text>
            <View style={[styles.testStatusContainer, styles.pendingStatus]}>
              <Text style={styles.testStatus}>Pending</Text>
            </View>
          </View>
          
          <View style={styles.testItem}>
            <Text style={styles.testName}>Hemoglobin A1c</Text>
            <View style={[styles.testStatusContainer, styles.orderedStatus]}>
              <Text style={styles.testStatus}>Ordered</Text>
            </View>
          </View>
          
          <View style={styles.testItem}>
            <Text style={styles.testName}>Thyroid Function Tests</Text>
            <Button
              title="Order"
              onPress={() => {}}
              variant="outline"
              size="small"
            />
          </View>
        </View>
        
        <View style={styles.diagnosisSection}>
          <Text style={styles.sectionTitle}>Differential Diagnosis</Text>
          
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} />
            <Text style={styles.searchPlaceholder}>Search conditions...</Text>
          </View>
          
          <View style={styles.tagsContainer}>
            <Tag label="Hypertension" color={Colors.danger} onRemove={() => {}} />
            <Tag label="Hyperlipidemia" color={Colors.primary} onRemove={() => {}} />
            <Tag label="Type 2 Diabetes" color={Colors.warning} onRemove={() => {}} />
            <Tag label="Add Condition" isAddButton onPress={() => {}} />
          </View>
          
          <View style={styles.diagnosisCard}>
            <Text style={styles.diagnosisTitle}>Primary Hypertension</Text>
            <Text style={styles.diagnosisDescription}>
              Patient has consistently elevated blood pressure readings over multiple visits.
              Currently on Lisinopril 10mg daily with good control.
            </Text>
            <View style={styles.diagnosisActions}>
              <Button
                title="View Guidelines"
                onPress={() => {}}
                variant="secondary"
                size="small"
              />
              <Button
                title="Add to Plan"
                onPress={() => {}}
                size="small"
              />
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
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  toolCard: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  toolIconContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolName: {
    ...Typography.body,
    textAlign: 'center',
  },
  riskAssessmentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: 16,
  },
  riskCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  riskTitle: {
    ...Typography.body,
    marginBottom: 12,
  },
  riskScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskScore: {
    ...Typography.h2,
    marginRight: 12,
  },
  riskLevelContainer: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  riskLevel: {
    ...Typography.caption,
    color: '#FF9800',
    fontWeight: '500',
  },
  patientInfo: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  riskComparisonContainer: {
    flexDirection: 'row',
  },
  riskComparisonItem: {
    flex: 1,
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  riskComparisonLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  riskComparisonValue: {
    ...Typography.h4,
    color: Colors.primary,
  },
  workupSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addTestText: {
    ...Typography.body,
    color: Colors.primary,
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  testName: {
    ...Typography.body,
  },
  testStatusContainer: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  pendingStatus: {
    backgroundColor: '#FFF3E0',
  },
  orderedStatus: {
    backgroundColor: Colors.primaryLight,
  },
  testStatus: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '500',
  },
  diagnosisSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchPlaceholder: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
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
  diagnosisTitle: {
    ...Typography.h5,
    marginBottom: 8,
  },
  diagnosisDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  diagnosisActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});