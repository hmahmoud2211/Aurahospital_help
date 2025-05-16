import React, { useState } from "react";
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet 
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Ensure you install expo icons: npm install @expo/vector-icons

const ChatForm = ({ setChatHistory }) => {
  const [userMessage, setUserMessage] = useState("");

  const handleFormSubmit = () => {
    const trimmedMessage = userMessage.trim();
    if (!trimmedMessage) return;
    
    // Update Chat History With The user's Message
    setChatHistory(history => [...history, { role: "user", text: userMessage }]);
    setUserMessage(""); // Clear input

    // Add a "Thinking..." placeholder for the bot's response
    setTimeout(() => 
      setChatHistory(history => [...history, { role: "model", text: "Thinking..." }]), 
    600);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <View style={styles.chatForm}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          value={userMessage}
          onChangeText={setUserMessage}
          placeholderTextColor="#888"
        />
        {userMessage.trim().length > 0 && (
          <TouchableOpacity onPress={handleFormSubmit} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  chatForm: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  sendButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});

export default ChatForm;
