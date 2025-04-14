import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/user';
import { mockUsers } from '@/mocks/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Find user in mock data
          const user = mockUsers.find(u => u.email === email);
          
          if (user && password === 'password') { // Simple mock password check
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            set({ error: 'Invalid email or password', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Login failed. Please try again.', isLoading: false });
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      register: async (userData, password) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if email already exists
          const existingUser = mockUsers.find(u => u.email === userData.email);
          
          if (existingUser) {
            set({ error: 'Email already in use', isLoading: false });
            return;
          }
          
          // In a real app, we would create a new user here
          // For now, just simulate success
          set({ isLoading: false });
        } catch (error) {
          set({ error: 'Registration failed. Please try again.', isLoading: false });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);