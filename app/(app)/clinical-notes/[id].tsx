import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Save } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Tag from '@/components/Tag';
import { mockClinicalNote } from '@/mocks/medical-records';
import { mockPatients } from '@/mocks/users';

export default function ClinicalNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const patient = mockPatients[0];
  
  const [subjective, setSubjective] = useState(mockClinicalNote.subjective);
  const [objective, setObjective] = useState(mockClinicalNote.objective);
  const [assessment, setAssessment] = useState<string[]>(mockClinicalNote.assessment);
  const [plan, setPlan] = useState(mockClinicalNote.plan);
  const [newAssessment, setNewAssessment] = useState('');
  
  const handleAddAssessment = () => {
    if (newAssessment.trim()) {
      setAssessment([...assessment, newAssessment.trim()]);
      setNewAssessment('');
    }
  };
  
  const handleRemoveAssessment = (index: number) => {
    setAssessment(assessment.filter((_, i) => i !== index));
  };
  
  const handleSave = () => {
    // In a real app, we would save the note to the backend
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title="Clinical Note" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.noteHeader}>
          <Text style={styles.noteType}>Progress Note</Text>
          <Text style={styles.noteInfo}>{patient.name} • {new Date().toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Subjective</Text>
            <TouchableOpacity style={styles.micButton}>
              <Mic size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            multiline
            value={subjective}
            onChangeText={setSubjective}
            placeholder="Enter patient's subjective information..."
          />
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Objective</Text>
            <TouchableOpacity style={styles.micButton}>
              <Mic size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            multiline
            value={objective}
            onChangeText={setObjective}
            placeholder="Enter objective findings..."
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assessment</Text>
          <View style={styles.tagsContainer}>
            {assessment.map((item, index) => (
              <Tag
                key={index}
                label={item}
                color={index === 0 ? Colors.danger : Colors.primary}
                onRemove={() => handleRemoveAssessment(index)}
              />
            ))}
          </View>
          
          <View style={styles.addAssessmentContainer}>
            <TextInput
              style={styles.addAssessmentInput}
              value={newAssessment}
              onChangeText={setNewAssessment}
              placeholder="Add assessment..."
            />
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddAssessment}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Plan</Text>
            <TouchableOpacity style={styles.micButton}>
              <Mic size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            multiline
            value={plan}
            onChangeText={setPlan}
            placeholder="Enter treatment plan..."
          />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Save Note"
          onPress={handleSave}
          fullWidth
          icon={<Save size={20} color={Colors.background} />}
        />
      </View>
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
  noteHeader: {
    marginBottom: 24,
  },
  noteType: {
    ...Typography.h4,
    marginBottom: 4,
  },
  noteInfo: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    ...Typography.h5,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    ...Typography.body,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  addAssessmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addAssessmentInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    ...Typography.body,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});