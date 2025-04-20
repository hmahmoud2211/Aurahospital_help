import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useChatStore } from '../stores/chatStore';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';

interface ChatHistoryProps {
  onClose: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ onClose }) => {
  const { sessions, currentSessionId, switchSession, deleteSession } = useChatStore();

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSession(sessionId),
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat History</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.sessionList}>
        {sessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={[
              styles.sessionItem,
              session.id === currentSessionId && styles.activeSession,
            ]}
            onPress={() => {
              switchSession(session.id);
              onClose();
            }}
          >
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {session.lastMessage || 'No messages'}
              </Text>
            </View>
            <View style={styles.sessionActions}>
              <Text style={styles.timestamp}>
                {formatDate(session.timestamp)}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSession(session.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {sessions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No chat history</Text>
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    ...Typography.h1,
    color: Colors.textSecondary,
  },
  sessionList: {
    flex: 1,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activeSession: {
    backgroundColor: Colors.primaryLight,
  },
  sessionInfo: {
    flex: 1,
    marginRight: 16,
  },
  sessionTitle: {
    ...Typography.h2,
    marginBottom: 4,
  },
  lastMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  sessionActions: {
    alignItems: 'flex-end',
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    ...Typography.caption,
    color: Colors.danger,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});

export default ChatHistory; 