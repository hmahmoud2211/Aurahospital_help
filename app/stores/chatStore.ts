import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  userId?: string;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: ChatMessage[];
}

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  addMessage: (message: Omit<ChatMessage, 'id'>) => void;
  createNewSession: () => void;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  getCurrentSession: () => ChatSession | null;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,

      addMessage: (message) => set((state) => {
        const currentSession = state.sessions.find(s => s.id === state.currentSessionId);
        if (!currentSession) return state;

        const newMessage = {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        const updatedSessions = state.sessions.map(session =>
          session.id === currentSession.id
            ? {
                ...session,
                lastMessage: message.text,
                timestamp: new Date(),
                messages: [...session.messages, newMessage],
              }
            : session
        );

        return { sessions: updatedSessions };
      }),

      createNewSession: () => set((state) => {
        const newSession: ChatSession = {
          id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: `Chat ${state.sessions.length + 1}`,
          lastMessage: '',
          timestamp: new Date(),
          messages: [],
        };

        return {
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        };
      }),

      switchSession: (sessionId) => set({ currentSessionId: sessionId }),

      deleteSession: (sessionId) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== sessionId),
        currentSessionId: state.currentSessionId === sessionId
          ? state.sessions[0]?.id ?? null
          : state.currentSessionId,
      })),

      getCurrentSession: () => {
        const state = get();
        return state.sessions.find(s => s.id === state.currentSessionId) ?? null;
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessions: state.sessions.map(session => ({
          ...session,
          messages: session.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString(),
          })),
          timestamp: session.timestamp.toISOString(),
        })),
        currentSessionId: state.currentSessionId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert ISO strings back to Date objects
          state.sessions = state.sessions.map(session => ({
            ...session,
            messages: session.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
            timestamp: new Date(session.timestamp),
          }));
        }
      },
    }
  )
); 