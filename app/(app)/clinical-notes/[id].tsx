import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
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
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

export default function ClinicalNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const patient = mockPatients[0];
  
  const [subjective, setSubjective] = useState(mockClinicalNote.subjective);
  const [objective, setObjective] = useState(mockClinicalNote.objective);
  const [assessment, setAssessment] = useState<string[]>(mockClinicalNote.assessment);
  const [plan, setPlan] = useState(mockClinicalNote.plan);
  const [newAssessment, setNewAssessment] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  // Function to toggle recording on/off
  const toggleRecording = async (field: 'subjective' | 'objective' | 'plan') => {
    if (isRecording) {
      // Stop recording
      await stopRecording(field);
    } else {
      // Start recording
      await startRecording(field);
    }
  };

  // Start recording audio
  const startRecording = async (field: 'subjective' | 'objective' | 'plan') => {
    try {
      // Request permissions
      console.log('Requesting permissions...');
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permission');
        return;
      }

      // Configure audio
      console.log('Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording
      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      setRecording(recording);
      setIsRecording(field);
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording Error', 'Could not start recording');
    }
  };

  // Stop recording and process audio
  const stopRecording = async (field: 'subjective' | 'objective' | 'plan') => {
    if (!recording) return;

    try {
      console.log('Stopping recording...');
      setIsProcessing(true);
      setIsRecording(null);
      
      // Stop the recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (!uri) {
        Alert.alert('Error', 'Recording failed - no audio file created');
        setIsProcessing(false);
        return;
      }
      
      console.log('Recording URI:', uri);
      
      // Create form data for API request
      const formData = new FormData();
      
      // Create file object
      const fileUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
      const fileName = 'audio.m4a';
      
      console.log('Creating file info:', { uri: fileUri, name: fileName, type: 'audio/m4a' });
      
      // Append file to form data
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: 'audio/m4a',
      } as any);
      
      // Append other required parameters
      formData.append('model', 'whisper-large-v3-turbo');
      formData.append('temperature', '0');
      formData.append('response_format', 'verbose_json');
      
      console.log('Sending request to Whisper API...');
      
      // Make API request
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
        },
        body: formData,
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      // Parse response
      const data = await response.json();
      console.log('Transcription data:', data);
      
      // Update text field with transcription
      if (data.text) {
        const transcribedText = data.text.trim();
        console.log('Transcribed text:', transcribedText);
        
        switch (field) {
          case 'subjective':
            setSubjective(prev => prev + (prev ? ' ' : '') + transcribedText);
            break;
          case 'objective':
            setObjective(prev => prev + (prev ? ' ' : '') + transcribedText);
            break;
          case 'plan':
            setPlan(prev => prev + (prev ? ' ' : '') + transcribedText);
            break;
        }
      } else {
        console.warn('No transcription text returned');
        Alert.alert('Transcription Failed', 'No text was recognized');
      }
      
      // Clean up temporary file
      try {
        await FileSystem.deleteAsync(uri);
        console.log('Temporary file deleted');
      } catch (deleteError) {
        console.warn('Error deleting file:', deleteError);
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process recording');
    } finally {
      setIsProcessing(false);
    }
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
            <TouchableOpacity 
              style={[
                styles.micButton, 
                isRecording === 'subjective' && styles.micButtonActive,
                isProcessing && styles.micButtonProcessing
              ]}
              onPress={() => toggleRecording('subjective')}
              disabled={isProcessing || (isRecording !== null && isRecording !== 'subjective')}
            >
              {isProcessing && isRecording === 'subjective' ? (
                <ActivityIndicator size="small" color={Colors.background} />
              ) : (
                <Mic size={20} color={isRecording === 'subjective' ? Colors.background : Colors.primary} />
              )}
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
            <TouchableOpacity 
              style={[
                styles.micButton, 
                isRecording === 'objective' && styles.micButtonActive,
                isProcessing && styles.micButtonProcessing
              ]}
              onPress={() => toggleRecording('objective')}
              disabled={isProcessing || (isRecording !== null && isRecording !== 'objective')}
            >
              {isProcessing && isRecording === 'objective' ? (
                <ActivityIndicator size="small" color={Colors.background} />
              ) : (
                <Mic size={20} color={isRecording === 'objective' ? Colors.background : Colors.primary} />
              )}
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
            <TouchableOpacity 
              style={[
                styles.micButton, 
                isRecording === 'plan' && styles.micButtonActive,
                isProcessing && styles.micButtonProcessing
              ]}
              onPress={() => toggleRecording('plan')}
              disabled={isProcessing || (isRecording !== null && isRecording !== 'plan')}
            >
              {isProcessing && isRecording === 'plan' ? (
                <ActivityIndicator size="small" color={Colors.background} />
              ) : (
                <Mic size={20} color={isRecording === 'plan' ? Colors.background : Colors.primary} />
              )}
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
  micButtonActive: {
    backgroundColor: Colors.primary,
  },
  micButtonProcessing: {
    backgroundColor: Colors.secondary,
    opacity: 0.7,
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