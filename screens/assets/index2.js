import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ChatbotIcon from "../components/ChatbotIcon";

const App = () => {
  return (
    <View style={styles.container}>
      <View style={styles.chatbotPopup}>
        {/* Chatbot Header */}
        <View style={styles.chatHeader}>
          <View style={styles.headerInfo}>
            <View style={styles.logoContainer}>
              <ChatbotIcon />
            </View>
            <Text style={styles.logoText}>Chatbot</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => console.log("Arrow clicked!")}>
            <Icon name="keyboard-arrow-down" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Chatbot Body */}
        <View style={styles.chatBody}>
          {/* Bot Message */}
          <View style={styles.botMessage}>
            <ChatbotIcon />
            <Text style={styles.messageText}>
              Hey there! {"\n"} How can I help today?
            </Text>
          </View>

          {/* User Message */}
          <View style={styles.userMessage}>
            <Text style={styles.messageText}>toz feik</Text>
          </View>
        </View>

        {/* Chatbot Footer */}
        <View style={styles.chatFooter}>
          <TextInput
            style={styles.messageInput}
            placeholder="Message..."
            placeholderTextColor="#759DC0"
          />
          <TouchableOpacity style={styles.iconButton} onPress={() => console.log("Send clicked!")}>
            <Icon name="keyboard-arrow-up" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d7effb",
  },
  chatbotPopup: {
    padding: 20,
    backgroundColor: "#7BD2FF",
    borderRadius: 10,
    elevation: 5,
    width: "90%",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#96AEBA",
    paddingBottom: 10,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3F6F95",
    marginLeft: 10,
  },
  iconButton: {
    backgroundColor: "#3F6F95",
    padding: 5,
    borderRadius: 5,
  },
  chatBody: {
    marginTop: 15,
    flexDirection: "column", // Must be inside quotes
    gap: 20, // No 'px' needed in React Native
    height: 460,
    marginBottom: 82,
    paddingVertical: 25,
    paddingHorizontal: 22,
  },
  
  botMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#96AEBA",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#759DC0",
    padding: 10,
    borderRadius: 8,
  },
  messageText: {
    fontSize: 16,
    color: "white",
    marginLeft: 10,
  },
  chatFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#96AEBA",
    paddingTop: 10,
  },
  messageInput: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    borderColor: "#759DC0",
    borderWidth: 1,
    marginRight: 10,
  },
});

export default App;