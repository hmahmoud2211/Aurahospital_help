import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  MessageCircle,
  Send,
  Bot,
  TestTube,
  Scan,
  Calendar,
  FileText,
  Upload,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '../stores/chatStore';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

export default function LaboristChatComponent() {
  const { user, token } = useAuthStore();
  const { addMessage, getCurrentSession, createNewSession } = useChatStore();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const currentSession = getCurrentSession();

  useEffect(() => {
    if (!currentSession) {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    if (currentSession) {
      const messages = currentSession.messages.map(msg => ({
        ...msg,
        suggestions: undefined,
      }));
      setLocalMessages(messages);
    }
  }, [currentSession]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [localMessages]);

  const quickActions = [
    {
      id: 'lab_results',
      icon: TestTube,
      label: 'Lab Results Help',
      message: 'I need help interpreting lab results',
    },
    {
      id: 'scan_analysis',
      icon: Scan,
      label: 'Scan Analysis',
      message: 'Can you help me analyze scan results?',
    },
    {
      id: 'appointment',
      icon: Calendar,
      label: 'Schedule Appointment',
      message: 'I need to schedule an appointment for a patient',
    },
    {
      id: 'procedures',
      icon: FileText,
      label: 'Lab Procedures',
      message: 'What are the procedures for specific lab tests?',
    },
  ];

  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Enhanced AI responses for laborist-specific queries
    const labQueries = {
      'lab results': 'I can help you interpret lab results! Please provide the test name and values, and I\'ll explain what they mean and if they\'re within normal ranges.',
      'scan analysis': 'For scan analysis, I can help identify common findings. Please describe what you see in the scan or upload the image for detailed analysis.',
      'appointment': 'I can help you schedule appointments. Would you like to book for lab tests, scans, or consultation? Please provide the patient details.',
      'procedures': 'I can guide you through various lab procedures. Which specific test are you performing? I can provide step-by-step instructions.',
      'normal range': 'Normal ranges vary by test, age, and gender. Please specify which lab values you\'re asking about.',
      'quality control': 'Quality control is essential for accurate results. Are you asking about calibration, controls, or result validation?',
      'urgent': 'For urgent lab work, prioritize: 1) Critical values, 2) Stat orders, 3) Time-sensitive specimens. What specific urgent case do you need help with?',
      'specimen': 'Proper specimen handling is crucial. What type of specimen are you working with? I can provide collection and processing guidelines.',
    };

    const lowerMessage = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(labQueries)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // Generic helpful response for laborists
    return 'I\'m here to help with your laboratory work! I can assist with:\n\n• Interpreting lab results\n• Analyzing scan findings\n• Lab procedures and protocols\n• Quality control guidelines\n• Scheduling appointments\n• Emergency procedures\n\nWhat specific assistance do you need today?';
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (!textToSend || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setLocalMessages(prev => [...prev, userMessage]);
    addMessage({
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    });

    setMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(async () => {
      try {
        const aiResponse = await getAIResponse(textToSend);
        
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          text: aiResponse,
          isUser: false,
          timestamp: new Date(),
          suggestions: getSuggestions(textToSend),
        };

        setLocalMessages(prev => [...prev, aiMessage]);
        addMessage({
          text: aiResponse,
          isUser: false,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          text: 'I apologize, but I\'m having trouble responding right now. Please try again.',
          isUser: false,
          timestamp: new Date(),
        };
        setLocalMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const getSuggestions = (userMessage: string): string[] => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('lab') || lowerMessage.includes('test')) {
      return [
        'Show normal ranges',
        'Quality control steps',
        'Critical values',
        'Specimen requirements',
      ];
    }
    
    if (lowerMessage.includes('scan') || lowerMessage.includes('image')) {
      return [
        'Common findings',
        'Report template',
        'Upload image',
        'Schedule follow-up',
      ];
    }
    
    if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
      return [
        'Available slots',
        'Patient search',
        'Urgent booking',
        'Reschedule existing',
      ];
    }
    
    return [
      'Lab procedures',
      'Scan protocols',
      'Emergency guidelines',
      'Quality standards',
    ];
  };

  const handleSuggestionPress = (suggestion: string) => {
    setMessage(suggestion);
  };

  const renderMessage = (msg: ChatMessage) => (
    <View key={msg.id} style={[
      styles.messageContainer,
      msg.isUser ? styles.userMessage : styles.aiMessage,
    ]}>
      {!msg.isUser && (
        <View style={styles.aiAvatar}>
          <Bot size={16} color={Colors.background} />
        </View>
      )}
      
      <View style={[
        styles.messageBubble,
        msg.isUser ? styles.userBubble : styles.aiBubble,
      ]}>
        <Text style={[
          styles.messageText,
          msg.isUser ? styles.userText : styles.aiText,
        ]}>
          {msg.text}
        </Text>
        
        {msg.suggestions && msg.suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {msg.suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MessageCircle size={24} color={Colors.primary} />
        <Text style={styles.headerTitle}>Laboratory Assistant</Text>
      </View>

      {localMessages.length === 0 && (
        <View style={styles.welcomeContainer}>
          <Bot size={48} color={Colors.primary} />
          <Text style={styles.welcomeTitle}>Hello, Laboratory Professional!</Text>
          <Text style={styles.welcomeText}>
            I'm your AI assistant specialized in laboratory services. I can help you with:
          </Text>
          
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickAction}
                  onPress={() => sendMessage(action.message)}
                >
                  <Icon size={20} color={Colors.primary} />
                  <Text style={styles.quickActionText}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {localMessages.map(renderMessage)}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.aiAvatar}>
              <Bot size={16} color={Colors.background} />
            </View>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask about lab procedures, results, or schedule appointments..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
          onPress={() => sendMessage()}
          disabled={!message.trim() || isLoading}
        >
          <Send size={20} color={Colors.background} />
        </TouchableOpacity>
      </View>
    </View>
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
    backgroundColor: Colors.background,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginLeft: 12,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  welcomeTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  quickActionsContainer: {
    width: '100%',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    ...Typography.body,
    color: Colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    marginLeft: 'auto',
  },
  aiBubble: {
    backgroundColor: Colors.card,
  },
  messageText: {
    ...Typography.body,
  },
  userText: {
    color: Colors.background,
  },
  aiText: {
    color: Colors.text,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  suggestionChip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  suggestionText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  textInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
}); 