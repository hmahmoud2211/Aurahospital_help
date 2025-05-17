// API Configuration
export const API_URL = 'http://127.0.0.1:8000/api';

// Other configuration constants can be added here
export const APP_NAME = 'Aura Hospital';
export const APP_VERSION = '1.0.0';

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  PATIENTS: {
    BASE: '/patients',
    PROFILE: '/patients/profile',
  },
  DOCTORS: {
    BASE: '/practitioners',
    PROFILE: '/practitioners/profile',
  },
  APPOINTMENTS: {
    BASE: '/appointments',
  },
}; 