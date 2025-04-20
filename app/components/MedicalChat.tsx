import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { MedicalChatbot } from '../services/MedicalChatbot';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '../stores/chatStore';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import DoctorSelection from './DoctorSelection';
import DateSelection from './DateSelection';
import TimeSelection from './TimeSelection';
import ChatHistory from './ChatHistory';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  appointmentOptions?: any[];
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availableDays: string[];
  imageUrl?: string;
  description?: string;
}

interface AppointmentState {
  step: 'doctor' | 'date' | 'time';
  selectedDoctor: Doctor | null;
  selectedDate: Date | null;
}

const MedicalChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [appointmentState, setAppointmentState] = useState<AppointmentState>({
    step: 'doctor',
    selectedDoctor: null,
    selectedDate: null,
  });
  const [showAppointmentFlow, setShowAppointmentFlow] = useState(false);
  
  const router = useRouter();
  const { user } = useAuthStore();
  const chatbot = new MedicalChatbot();
  const { 
    sessions,
    currentSessionId,
    addMessage,
    createNewSession,
    getCurrentSession
  } = useChatStore();

  // Create a new session if there isn't one
  useEffect(() => {
    if (!currentSessionId) {
      createNewSession();
    }
  }, [currentSessionId, createNewSession]);

  const handleDoctorSelect = (doctor: Doctor) => {
    setAppointmentState(prev => ({
      ...prev,
      selectedDoctor: doctor,
      step: 'date'
    }));
  };

  const handleDateSelect = async (date: Date) => {
    setAppointmentState(prev => ({
      ...prev,
      selectedDate: date,
      step: 'time'
    }));
  };

  const handleTimeSelect = async (slot: any) => {
    if (!user || !appointmentState.selectedDoctor || !appointmentState.selectedDate) {
      addMessage({
        text: "Please log in and select a doctor and date first.",
        isUser: false,
        timestamp: new Date()
      });
      return;
    }

    const { selectedDoctor, selectedDate } = appointmentState;
    const slotId = `${selectedDoctor.id}-${selectedDate.toISOString().split('T')[0]}-${slot.time}`;

    try {
      const appointment = await chatbot.bookAppointment(
        user.id,
        slotId,
        'General consultation'
      );

      if (appointment) {
        addMessage({
          text: `Appointment booked successfully with ${selectedDoctor.name} on ${selectedDate.toLocaleDateString()} at ${slot.time}`,
          isUser: false,
          timestamp: new Date()
        });
        setShowAppointmentFlow(false);
        setAppointmentState({
          step: 'doctor',
          selectedDoctor: null,
          selectedDate: null,
        });
      } else {
        addMessage({
          text: "Sorry, there was an error booking the appointment. Please try again.",
          isUser: false,
          timestamp: new Date()
        });
      }
    } catch (error) {
      addMessage({
        text: "Sorry, there was an error booking the appointment. Please try again.",
        isUser: false,
        timestamp: new Date()
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      isUser: true,
      timestamp: new Date(),
      userId: user?.id,
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    // Check if the message is about booking appointments
    if (input.toLowerCase().includes('appointment') || 
        input.toLowerCase().includes('book') || 
        input.toLowerCase().includes('schedule')) {
      setShowAppointmentFlow(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await chatbot.getMedicalResponse(input);
      const botMessage = {
        text: response.response,
        isUser: false,
        timestamp: new Date(),
      };

      addMessage(botMessage);
    } catch (error) {
      console.error('Error getting response:', error);
      addMessage({
        text: "I'm sorry, I'm having trouble processing your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showAppointmentFlow) {
    switch (appointmentState.step) {
      case 'doctor':
        return (
          <DoctorSelection
            onSelectDoctor={handleDoctorSelect}
          />
        );
      case 'date':
        if (!appointmentState.selectedDoctor) return null;
        return (
          <DateSelection
            doctorId={appointmentState.selectedDoctor.id}
            doctorName={appointmentState.selectedDoctor.name}
            availableDays={appointmentState.selectedDoctor.availableDays}
            onSelectDate={handleDateSelect}
            onBack={() => setAppointmentState(prev => ({ ...prev, step: 'doctor' }))}
          />
        );
      case 'time':
        if (!appointmentState.selectedDoctor || !appointmentState.selectedDate) return null;
        return (
          <TimeSelection
            doctorName={appointmentState.selectedDoctor.name}
            selectedDate={appointmentState.selectedDate}
            timeSlots={[
              '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
              '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
            ].map(time => ({
              id: time,
              time,
              isAvailable: true
            }))}
            onSelectTime={handleTimeSelect}
            onBack={() => setAppointmentState(prev => ({ ...prev, step: 'date' }))}
          />
        );
    }
  }

  const currentSession = getCurrentSession();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => setShowHistoryModal(true)}
        >
          <Text style={styles.historyButtonText}>History</Text>
        </TouchableOpacity>
        <Text style={styles.sessionTitle}>
          {currentSession?.title || 'Medical Chat'}
        </Text>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {currentSession?.messages.map((message, index) => (
          <View key={index} style={[
            styles.messageContainer,
            message.isUser ? styles.userMessage : styles.botMessage
          ]}>
            <Text style={[
              styles.messageText,
              message.isUser ? styles.userMessageText : styles.botMessageText
            ]}>
              {message.text}
            </Text>
            {isLoading && index === currentSession.messages.length - 1 && (
              <Text style={styles.loadingText}>Typing...</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your medical question..."
          placeholderTextColor={Colors.textSecondary}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showHistoryModal}
        animationType="slide"
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <ChatHistory onClose={() => setShowHistoryModal(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  historyButtonText: {
    ...Typography.body,
    color: Colors.primary,
  },
  sessionTitle: {
    ...Typography.h2,
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // To center the title accounting for the history button
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
    borderRadius: 12,
    padding: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.card,
  },
  messageText: {
    ...Typography.body,
  },
  userMessageText: {
    color: Colors.background,
  },
  botMessageText: {
    color: Colors.text,
  },
  loadingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.primaryLight,
  },
  sendButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '500',
  },
});

export default MedicalChat; 