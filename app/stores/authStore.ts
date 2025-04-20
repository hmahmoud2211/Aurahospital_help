import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  profilePicture?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  userId: string | null;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  userId: null,
  user: null,
  login: (user: User) => set({ isLoggedIn: true, userId: user.id, user }),
  logout: () => set({ isLoggedIn: false, userId: null, user: null }),
})); 