import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ChatbotIcon from '../../components/ChatbotIcon';

const ChatMessage = ({ chat }) => {
    if (!chat || !chat.text) return null; // Ensure chat object and text exist

    const role = chat.role || 'user'; // Fallback if role is undefined
    const isBot = role === 'model';

    return (
        <View style={[styles.message, isBot ? styles.botMessage : styles.userMessage]}>
            {isBot && <ChatbotIcon />}
            <Text style={[styles.messageText, isBot ? styles.botText : styles.userText]}>
                {chat.text}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    message: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        maxWidth: '80%',
    },
    botMessage: {
        backgroundColor: '#e0e0e0',
        alignSelf: 'flex-start',
    },
    userMessage: {
        backgroundColor: '#007AFF',
        alignSelf: 'flex-end',
    },
    messageText: {
        fontSize: 16,
        marginLeft: 8,
    },
    botText: {
        color: '#000', // Dark text for bot messages
    },
    userText: {
        color: '#fff', // White text for user messages
    },
});

export default ChatMessage;
