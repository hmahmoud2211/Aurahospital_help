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

export const GROQ_CONFIG = {
  API_KEY: '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',
  API_URL: 'https://api.groq.com/openai/v1/audio/transcriptions',
  MODEL: 'whisper-large-v3-turbo',
  TEMPERATURE: 0,
  RESPONSE_FORMAT: 'verbose_json',
} as const; 