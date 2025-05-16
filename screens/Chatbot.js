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
  TextInput
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey there!\nHow can I help today?", isBot: true }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);
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

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      isBot: false
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    setTimeout(() => {
      const botReply = {
        id: Date.now() + 1,
        text: "I'm here to help! What would you like to know?",
        isBot: true
      };
      setMessages((prev) => [...prev, botReply]);
      setIsLoading(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
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
            <Icon name="smart-toy" size={30} color="#3F6F95" style={{ marginRight: 5 }} />
            <Text style={styles.headerText}>Aura Hospital Assistant</Text>
          </View>
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Icon name={isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-up"} size={30} color="#3F6F95" />
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
              {message.isBot && <Icon name="smart-toy" size={20} color="#3F6F95" style={{ marginRight: 5 }} />}
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#3F6F95" />
            </View>
          )}
        </ScrollView>

        <View style={styles.chatFooter}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              placeholderTextColor="#3F6F95"
              value={inputMessage}
              onChangeText={setInputMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!inputMessage.trim() || isLoading}>
              <Icon name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>

        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#d7effb",
  },
  chatbotPopup: {
    backgroundColor: "#7BD2FF",
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
    borderBottomColor: "#d7effb",
    padding: 10,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20, // Increase the font size
    fontWeight: "bold", // Make it bold
    color: "#3F6F95", // Keep the color consistent with your theme
    marginLeft: 8, // Add some spacing from the icon if needed
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#d7effb",
    maxWidth: "80%",
  },
  botMessage: {
    alignSelf: "flex-start",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#D6EAF8",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5EA3D5",
    borderRadius: 25,
    padding: 5,
    marginHorizontal: 10,
  },

  messageInput: {
    flex: 1,
    padding: 10,
    backgroundColor: "#d7effb",
    borderRadius: 20,
    fontSize: 16,
    color: "#3F6F95",
  },

  sendButton: {
    backgroundColor: "#004e89",
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
    alignSelf: "flex-end",
  },
});

export default ChatbotScreen;
