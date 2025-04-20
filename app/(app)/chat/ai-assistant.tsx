import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  TouchableWithoutFeedback
} from "react-native";
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, Calendar, Clock, User, X, Check, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';

// Enhanced response categories
type ResponseCategory = 'greetings' | 'appointments' | 'symptoms' | 'medications' | 'general' | 'doctor_specific' | 'appointment_confirmation' | 'medical_advice';

// Define types for doctor availability
interface TimeSlot {
  day: string;
  slots: string[];
}

interface DoctorInfo {
  specialties: string[];
  availability: TimeSlot[];
}

interface DoctorAvailability {
  [key: string]: DoctorInfo;
}

// Medical knowledge database with more comprehensive information
const MEDICAL_KNOWLEDGE: Record<string, string[]> = {
  'headache': [
    "Headaches can be caused by stress, dehydration, lack of sleep, or underlying medical conditions.",
    "For mild headaches, rest, hydration, and over-the-counter pain relievers may help.",
    "If you experience severe or persistent headaches, please consult a healthcare provider.",
    "Common headache types include tension headaches, migraines, and cluster headaches.",
    "Symptoms of a severe headache that require immediate medical attention include sudden onset, confusion, fever, or neck stiffness."
  ],
  'fever': [
    "A fever is often a sign that your body is fighting an infection.",
    "For adults, a fever is generally considered to be 100.4°F (38°C) or higher.",
    "Rest, fluids, and over-the-counter medications can help manage fever symptoms.",
    "Common causes of fever include viral infections, bacterial infections, and inflammatory conditions.",
    "Seek immediate medical attention if your fever is accompanied by severe headache, rash, difficulty breathing, or confusion."
  ],
  'cough': [
    "Coughs can be caused by colds, flu, allergies, or respiratory infections.",
    "Honey, warm tea, and over-the-counter cough medicines may provide relief.",
    "If your cough persists for more than a few weeks or is accompanied by other symptoms, see a doctor.",
    "Types of coughs include dry coughs, wet/productive coughs, and chronic coughs.",
    "A cough with blood, difficulty breathing, or chest pain requires immediate medical attention."
  ],
  'back pain': [
    "Back pain can be caused by poor posture, muscle strain, or underlying conditions.",
    "Rest, gentle stretching, and over-the-counter pain relievers may help.",
    "For persistent or severe back pain, consult a healthcare provider for evaluation.",
    "Common causes include muscle strain, herniated discs, arthritis, and poor posture.",
    "Back pain accompanied by numbness, weakness, or loss of bladder control requires immediate medical attention."
  ],
  'diabetes': [
    "Diabetes is a chronic condition that affects how your body turns food into energy.",
    "There are two main types: Type 1 (body doesn't produce insulin) and Type 2 (body doesn't use insulin well).",
    "Regular monitoring, medication, diet, and exercise are key to managing diabetes.",
    "Common symptoms include increased thirst, frequent urination, extreme hunger, unexplained weight loss, and fatigue.",
    "Long-term complications can include heart disease, kidney damage, nerve damage, and eye problems."
  ],
  'hypertension': [
    "Hypertension (high blood pressure) is a common condition that can lead to serious health problems.",
    "Lifestyle changes like reducing salt intake, regular exercise, and stress management can help.",
    "Medication may be prescribed to help control blood pressure levels.",
    "Hypertension often has no symptoms, earning it the nickname 'the silent killer'.",
    "Untreated high blood pressure can lead to heart attack, stroke, kidney problems, and vision loss."
  ],
  'asthma': [
    "Asthma is a condition where airways narrow and swell, producing extra mucus.",
    "Common symptoms include shortness of breath, chest tightness, wheezing, and coughing.",
    "Triggers can include allergens, exercise, cold air, and respiratory infections.",
    "Treatment typically involves inhaled medications to control symptoms and prevent attacks.",
    "Severe asthma attacks require immediate medical attention as they can be life-threatening."
  ],
  'arthritis': [
    "Arthritis is inflammation of one or more joints, causing pain and stiffness.",
    "The most common types are osteoarthritis (wear and tear) and rheumatoid arthritis (autoimmune).",
    "Symptoms include joint pain, stiffness, swelling, and reduced range of motion.",
    "Treatment may include medications, physical therapy, lifestyle changes, and sometimes surgery.",
    "Early diagnosis and treatment can help prevent joint damage and improve quality of life."
  ],
  'anxiety': [
    "Anxiety is a normal response to stress but can become excessive and interfere with daily life.",
    "Symptoms include excessive worry, restlessness, difficulty concentrating, and physical symptoms like rapid heartbeat.",
    "Treatment may include therapy, medication, and lifestyle changes like exercise and stress management.",
    "Anxiety disorders are among the most common mental health conditions.",
    "If anxiety is severe or persistent, consult a mental health professional for evaluation and treatment."
  ],
  'depression': [
    "Depression is a mood disorder that causes persistent feelings of sadness and loss of interest.",
    "Symptoms may include changes in sleep, appetite, energy level, concentration, and thoughts of worthlessness.",
    "Treatment typically involves therapy, medication, or a combination of both.",
    "Depression is a serious condition that can affect all aspects of life and should not be ignored.",
    "If you have thoughts of self-harm or suicide, seek immediate emergency help."
  ]
};

// Doctor availability database with proper typing
const DOCTOR_AVAILABILITY: DoctorAvailability = {
  'Dr. Mechiale': {
    specialties: ['General Medicine', 'Internal Medicine'],
    availability: [
      { day: 'Monday', slots: ['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM'] },
      { day: 'Wednesday', slots: ['9:00 AM', '11:00 AM', '1:00 PM', '4:00 PM'] },
      { day: 'Friday', slots: ['10:00 AM', '1:30 PM', '3:00 PM', '4:30 PM'] }
    ]
  },
  'Dr. Smith': {
    specialties: ['Cardiology', 'Internal Medicine'],
    availability: [
      { day: 'Tuesday', slots: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'] },
      { day: 'Thursday', slots: ['9:30 AM', '1:00 PM', '3:00 PM', '5:00 PM'] }
    ]
  },
  'Dr. Johnson': {
    specialties: ['Pediatrics', 'Family Medicine'],
    availability: [
      { day: 'Monday', slots: ['10:00 AM', '1:00 PM', '3:00 PM'] },
      { day: 'Wednesday', slots: ['9:00 AM', '11:00 AM', '2:00 PM'] },
      { day: 'Friday', slots: ['9:30 AM', '1:30 PM', '4:00 PM'] }
    ]
  }
};

// Enhanced response database
const RESPONSE_DATABASE: Record<ResponseCategory, string[]> = {
  greetings: [
    "Hello! How can I assist you with your healthcare needs today?",
    "Welcome! I'm here to help you with medical information and appointments.",
    "Hi! I'm your MediCare assistant. What health-related questions do you have?"
  ],
  appointments: [
    "I can help you schedule an appointment. Would you like to see available time slots?",
    "For appointments, I can show you the next available slots with our healthcare providers.",
    "I'll assist you with booking an appointment. Do you have a preferred doctor or time?"
  ],
  doctor_specific: [
    "Let me check the doctor's availability for you. Would you like to see their available appointment slots?",
    "I can help you book an appointment with this doctor. What time would work best for you?",
    "I'll check the doctor's schedule. Do you have a preferred day or time?"
  ],
  symptoms: [
    "While I can provide general information about symptoms, please consult a healthcare provider for specific medical advice.",
    "I understand you're experiencing symptoms. For accurate diagnosis, it's best to consult with a medical professional.",
    "Let me provide some general information about these symptoms, but remember to consult your doctor for proper diagnosis."
  ],
  medications: [
    "For medication-related questions, please consult your healthcare provider or pharmacist.",
    "While I can provide general information about medications, specific advice should come from your doctor.",
    "Medication questions are best addressed by your healthcare provider who knows your medical history."
  ],
  general: [
    "I can help you with general healthcare information and appointment scheduling.",
    "I'm here to assist with basic medical information and hospital services.",
    "Let me help you find the healthcare information you need."
  ],
  appointment_confirmation: [
    "Great! I've scheduled your appointment. You'll receive a confirmation email shortly.",
    "Your appointment has been booked successfully. A reminder will be sent to you before the appointment.",
    "I've confirmed your appointment. Please arrive 10 minutes before your scheduled time."
  ],
  medical_advice: [
    "Based on your symptoms, I recommend consulting with a healthcare provider for proper evaluation.",
    "While I can provide general information, a medical professional should evaluate your specific situation.",
    "For your symptoms, it's best to schedule an appointment with one of our doctors for a proper assessment."
  ]
};

// Doctor database with more details
const DOCTORS = {
  'mechiale': 'Dr. Mechiale',
  'dr mechiale': 'Dr. Mechiale',
  'dr. mechiale': 'Dr. Mechiale',
  'smith': 'Dr. Smith',
  'dr smith': 'Dr. Smith',
  'dr. smith': 'Dr. Smith',
  'johnson': 'Dr. Johnson',
  'dr johnson': 'Dr. Johnson',
  'dr. johnson': 'Dr. Johnson',
  'cardiology': 'Dr. Smith',
  'pediatrics': 'Dr. Johnson',
  'general': 'Dr. Mechiale'
};

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

// New appointment system interfaces
interface AppointmentDetails {
  doctor: string;
  date: string;
  time: string;
  patientName: string;
  reason: string;
  step: 'select_doctor' | 'select_date' | 'select_time' | 'patient_info' | 'confirmation' | null;
}

export default function AiAssistantScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Hello! I'm your MediCare AI assistant. I can help you with medical information, appointments, and general health questions. How can I assist you today?", 
      isBot: true 
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // New appointment system state
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails>({
    doctor: '',
    date: '',
    time: '',
    patientName: '',
    reason: '',
    step: null
  });

  // Handle appointment selection
  const handleAppointmentOption = (option: string, currentStep: string) => {
    switch(currentStep) {
      case 'select_doctor':
        const doctorInfo = DOCTOR_AVAILABILITY[option];
        if (doctorInfo) {
          setAppointmentDetails(prev => ({
            ...prev,
            doctor: option,
            step: 'select_date'
          }));
          
          // Add selection message and show available dates
          const dates = doctorInfo.availability.map(a => a.day);
          setMessages(prev => [
            ...prev,
            { id: Date.now(), text: `You selected ${option}. Please choose a preferred date:`, isBot: true },
            { id: Date.now() + 1, text: dates.join(', '), isBot: true }
          ]);
        }
        break;
        
      case 'select_date':
        const doctorDates = DOCTOR_AVAILABILITY[appointmentDetails.doctor].availability;
        const selectedDay = doctorDates.find(d => d.day === option);
        if (selectedDay) {
          setAppointmentDetails(prev => ({
            ...prev,
            date: option,
            step: 'select_time'
          }));
          
          // Add selection message and show available times
          setMessages(prev => [
            ...prev,
            { id: Date.now(), text: `You selected ${option}. Please choose a preferred time:`, isBot: true },
            { id: Date.now() + 1, text: selectedDay.slots.join(', '), isBot: true }
          ]);
        }
        break;
        
      case 'select_time':
        const doctorTimes = DOCTOR_AVAILABILITY[appointmentDetails.doctor].availability
          .find(d => d.day === appointmentDetails.date)?.slots || [];
        if (doctorTimes.includes(option)) {
          setAppointmentDetails(prev => ({
            ...prev,
            time: option,
            step: 'patient_info'
          }));
          
          // Add selection message and prompt for patient info
          setMessages(prev => [
            ...prev,
            { id: Date.now(), text: `You selected ${option}. Please provide your full name:`, isBot: true }
          ]);
        }
        break;
    }
    
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // Handle patient info input
  const handlePatientInfo = (text: string) => {
    if (appointmentDetails.step === 'patient_info') {
      if (!appointmentDetails.patientName) {
        setAppointmentDetails(prev => ({
          ...prev,
          patientName: text
        }));
        
        // Prompt for reason
        setMessages(prev => [
          ...prev,
          { id: Date.now(), text: `Thank you ${text}. Please provide the reason for your appointment:`, isBot: true }
        ]);
      } else {
        // Complete the appointment
        setAppointmentDetails(prev => ({
          ...prev,
          reason: text,
          step: 'confirmation'
        }));
        
        // Show confirmation
        const confirmationMessage = `Great! Here's your appointment details:\nDoctor: ${appointmentDetails.doctor}\nDate: ${appointmentDetails.date}\nTime: ${appointmentDetails.time}\nName: ${appointmentDetails.patientName}\nReason: ${text}\n\nWould you like to confirm this appointment? (Yes/No)`;
        setMessages(prev => [
          ...prev,
          { id: Date.now(), text: confirmationMessage, isBot: true }
        ]);
      }
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  // Handle appointment confirmation
  const handleConfirmation = (response: string) => {
    if (appointmentDetails.step === 'confirmation') {
      if (response.toLowerCase() === 'yes') {
        // Add confirmation message
        setMessages(prev => [
          ...prev,
          { id: Date.now(), text: "Perfect! Your appointment has been confirmed. You'll receive a confirmation email shortly. Is there anything else I can help you with?", isBot: true }
        ]);
        
        // Reset appointment state
        setAppointmentDetails({
          doctor: '',
          date: '',
          time: '',
          patientName: '',
          reason: '',
          step: null
        });
      } else if (response.toLowerCase() === 'no') {
        // Reset appointment state and allow restart
        setAppointmentDetails({
          doctor: '',
          date: '',
          time: '',
          patientName: '',
          reason: '',
          step: null
        });
        
        setMessages(prev => [
          ...prev,
          { id: Date.now(), text: "No problem. Would you like to schedule a different appointment?", isBot: true }
        ]);
      }
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  // Enhanced response generation
  const getResponse = (input: string): string => {
    const lowercaseInput = input.toLowerCase();
    
    // Handle appointment flow
    if (appointmentDetails.step === 'select_doctor') {
      for (const [key, value] of Object.entries(DOCTORS)) {
        if (lowercaseInput.includes(key.toLowerCase())) {
          handleAppointmentOption(value, 'select_doctor');
          return '';
        }
      }
    } else if (appointmentDetails.step === 'select_date') {
      const availableDates = DOCTOR_AVAILABILITY[appointmentDetails.doctor].availability.map(a => a.day);
      for (const date of availableDates) {
        if (lowercaseInput.includes(date.toLowerCase())) {
          handleAppointmentOption(date, 'select_date');
          return '';
        }
      }
    } else if (appointmentDetails.step === 'select_time') {
      const availableTimes = DOCTOR_AVAILABILITY[appointmentDetails.doctor].availability
        .find(d => d.day === appointmentDetails.date)?.slots || [];
      for (const time of availableTimes) {
        if (lowercaseInput.includes(time.toLowerCase())) {
          handleAppointmentOption(time, 'select_time');
          return '';
        }
      }
    } else if (appointmentDetails.step === 'patient_info') {
      handlePatientInfo(input);
      return '';
    } else if (appointmentDetails.step === 'confirmation') {
      handleConfirmation(input);
      return '';
    }
    
    // Start appointment booking
    if (lowercaseInput.includes('appointment') || lowercaseInput.includes('schedule') || lowercaseInput.includes('book')) {
      setAppointmentDetails(prev => ({...prev, step: 'select_doctor'}));
      const doctorList = Object.keys(DOCTOR_AVAILABILITY).join(', ');
      return `I'll help you schedule an appointment. Please select a doctor from the following list:\n${doctorList}`;
    }
    
    // Handle other queries as before
    const category = getCategoryFromInput(input);
    const medicalInfo = getMedicalInfo(input);
    if (medicalInfo) {
      return medicalInfo;
    }
    
    const responses = RESPONSE_DATABASE[category];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Enhanced category detection
  const getCategoryFromInput = (input: string): ResponseCategory => {
    const lowercaseInput = input.toLowerCase();
    
    // Check for doctor-specific queries first
    for (const [key, value] of Object.entries(DOCTORS)) {
      if (lowercaseInput.includes(key)) {
        return 'doctor_specific';
      }
    }
    
    // Check for medical conditions in the knowledge database
    for (const [condition, _] of Object.entries(MEDICAL_KNOWLEDGE)) {
      if (lowercaseInput.includes(condition)) {
        return 'medical_advice';
      }
    }
    
    if (lowercaseInput.includes('hi') || lowercaseInput.includes('hello') || lowercaseInput.includes('hey')) {
      return 'greetings';
    }
    if (lowercaseInput.includes('appointment') || lowercaseInput.includes('schedule') || lowercaseInput.includes('book')) {
      return 'appointments';
    }
    if (lowercaseInput.includes('symptom') || lowercaseInput.includes('pain') || lowercaseInput.includes('feel')) {
      return 'symptoms';
    }
    if (lowercaseInput.includes('medicine') || lowercaseInput.includes('medication') || lowercaseInput.includes('drug')) {
      return 'medications';
    }
    return 'general';
  };

  // Get medical information for specific conditions
  const getMedicalInfo = (input: string): string | null => {
    const lowercaseInput = input.toLowerCase();
    
    for (const [condition, info] of Object.entries(MEDICAL_KNOWLEDGE)) {
      if (lowercaseInput.includes(condition)) {
        return info[Math.floor(Math.random() * info.length)];
      }
    }
    
    return null;
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage.trim(),
      isBot: false
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Get response from enhanced system
      const botResponse = getResponse(userMessage.text);
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse,
        isBot: true
      };

      // Simulate network delay for natural feeling
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I'm here to help with your healthcare needs. What would you like to know?",
        isBot: true
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title="MediCare Assistant" showBack={true} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Animated.View
          style={[
            styles.chatbotPopup,
            {
              opacity: fadeAnim,
              height: isExpanded ? "80%" : "20%",
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [keyboardHeight, 0]
                })
              }]
            }
          ]}
        >
          <View style={styles.chatHeader}>
            <View style={styles.headerTitle}>
              <Bot size={30} color={Colors.primary} style={{ marginRight: 5 }} />
              <Text style={styles.headerText}>AI Chat Assistant</Text>
            </View>
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Send size={30} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.chatBody}
            contentContainerStyle={styles.chatBodyContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isBot ? styles.botMessage : styles.userMessage
                ]}
              >
                {message.isBot && <Bot size={20} color={Colors.primary} style={{ marginRight: 5 }} />}
                <Text style={[
                  styles.messageText,
                  message.isBot ? styles.botMessageText : styles.userMessageText
                ]}>{message.text}</Text>
              </View>
            ))}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            )}
          </ScrollView>

          <View style={styles.chatFooter}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type a message..."
                placeholderTextColor={Colors.textSecondary}
                value={inputMessage}
                onChangeText={setInputMessage}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                multiline={false}
                maxLength={200}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]} 
                onPress={handleSend} 
                disabled={!inputMessage.trim() || isLoading}
              >
                <Send size={24} color={Colors.background} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  chatbotPopup: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
    padding: 15,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    padding: 10,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    ...Typography.h5,
    color: Colors.primary,
    marginLeft: 8,
  },
  chatBody: {
    flex: 1,
  },
  chatBodyContent: {
    padding: 10,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "80%",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: Colors.secondary,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
  },
  messageText: {
    ...Typography.body,
    flexShrink: 1,
  },
  botMessageText: {
    color: Colors.text,
  },
  userMessageText: {
    color: Colors.background,
  },
  loadingContainer: {
    padding: 10,
    alignItems: "center",
  },
  chatFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary,
    borderRadius: 25,
    padding: 5,
    marginHorizontal: 10,
  },
  messageInput: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.background,
    borderRadius: 20,
    ...Typography.body,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
});