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
  Alert
} from "react-native";
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';

// Local response database for offline/fallback functionality
type ResponseCategory = 'greetings' | 'appointments' | 'symptoms' | 'medications' | 'general' | 'doctor_specific';

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
    "Let me check Dr. Mechiale's availability for you. Would you like to see their available appointment slots?",
    "Dr. Mechiale is one of our experienced physicians. Would you like to schedule an appointment with them?",
    "I can help you book an appointment with Dr. Mechiale. What time would work best for you?"
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
  ]
};

const DOCTORS = {
  'mechiale': 'Dr. Mechiale',
  'dr mechiale': 'Dr. Mechiale',
  'dr. mechiale': 'Dr. Mechiale',
  // Add other doctors here
};

interface Message {
  id: number;
  text: string;
  isBot: boolean;
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

  const getCategoryFromInput = (input: string): ResponseCategory => {
    const lowercaseInput = input.toLowerCase();
    
    // Check for doctor-specific queries first
    for (const [key, value] of Object.entries(DOCTORS)) {
      if (lowercaseInput.includes(key)) {
        return 'doctor_specific';
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

  const getResponse = (input: string): string => {
    const category = getCategoryFromInput(input);
    const responses = RESPONSE_DATABASE[category];
    
    // For doctor-specific queries, we'll navigate to appointment booking
    if (category === 'doctor_specific') {
      // You can add navigation logic here if needed
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
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
      // Get response from local database
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