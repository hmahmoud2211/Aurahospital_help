import Constants from 'expo-constants';

export const ENV = {
  // Groq API configuration
  GROQ_API_KEY: Constants.expoConfig?.extra?.groqApiKey || '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',
  GROQ_API_URL: 'https://api.groq.com/openai/v1/audio/transcriptions',
  
  // Whisper model configuration
  WHISPER_MODEL: 'whisper-large-v3-turbo',
  WHISPER_TEMPERATURE: 0,
  WHISPER_RESPONSE_FORMAT: 'verbose_json',
  
  // Audio recording settings
  AUDIO_SAMPLE_RATE: 44100,
  AUDIO_BIT_RATE: 128000,
  AUDIO_CHANNELS: 2,
} as const;

export default ENV; 