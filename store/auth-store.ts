import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = 'http://localhost:8000';  // Change this to your backend URL

interface User {
  id: number;
  email: string;
  name: string;
  role: 'patient' | 'practitioner' | 'pharmacist' | 'laborist';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          formData.append('username', email);
          formData.append('password', password);

          const response = await axios.post(`${API_URL}/auth/token`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const { access_token, user } = response.data;
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Set default authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (userData: any, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/register`, {
            ...userData,
            password,
          });

          // After successful registration, log the user in
          await get().login(userData.email, password);
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        delete axios.defaults.headers.common['Authorization'];
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);