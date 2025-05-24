import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import ENV from '../config/env';

export interface VoiceRecordingResult {
  success: boolean;
  text?: string;
  error?: string;
}

export class VoiceRecordingService {
  private recording: Audio.Recording | null = null;
  private isRecording: boolean = false;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  async startRecording(): Promise<boolean> {
    try {
      if (this.isRecording) {
        console.warn('Recording is already in progress');
        return false;
      }

      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('Audio recording permission not granted');
        return false;
      }

      // Create and configure recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: ENV.AUDIO_SAMPLE_RATE,
          numberOfChannels: ENV.AUDIO_CHANNELS,
          bitRate: ENV.AUDIO_BIT_RATE,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: ENV.AUDIO_SAMPLE_RATE,
          numberOfChannels: ENV.AUDIO_CHANNELS,
          bitRate: ENV.AUDIO_BIT_RATE,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm;codecs=opus',
          bitsPerSecond: ENV.AUDIO_BIT_RATE,
        },
      });

      await this.recording.startAsync();
      this.isRecording = true;
      console.log('Recording started');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.isRecording = false;
      return false;
    }
  }

  async stopRecording(): Promise<VoiceRecordingResult> {
    try {
      if (!this.isRecording || !this.recording) {
        return {
          success: false,
          error: 'No recording in progress'
        };
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.isRecording = false;

      if (!uri) {
        return {
          success: false,
          error: 'Failed to get recording URI'
        };
      }

      console.log('Recording stopped, URI:', uri);

      // Convert audio to text using Groq API
      const transcriptionResult = await this.transcribeAudio(uri);
      
      // Clean up the recording file (only on mobile, web handles cleanup automatically)
      if (Platform.OS !== 'web') {
        try {
          await FileSystem.deleteAsync(uri);
          console.log('🗑️ Mobile: Cleaned up audio file');
        } catch (cleanupError) {
          console.warn('⚠️ Failed to cleanup recording file:', cleanupError);
        }
      } else {
        console.log('🌐 Web: Blob URL cleanup handled by browser');
      }

      this.recording = null;
      return transcriptionResult;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.isRecording = false;
      this.recording = null;
      return {
        success: false,
        error: 'Failed to stop recording'
      };
    }
  }

  private async transcribeAudio(audioUri: string): Promise<VoiceRecordingResult> {
    try {
      let audioBlob: Blob;
      
      if (Platform.OS === 'web') {
        // On web, audioUri is a blob URL, fetch it directly
        console.log('🌐 Web platform: Converting blob URL to audio data');
        const response = await fetch(audioUri);
        audioBlob = await response.blob();
      } else {
        // On mobile, read the file and convert to blob
        console.log('📱 Mobile platform: Reading audio file');
        const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        audioBlob = this.base64ToBlob(audioBase64, 'audio/m4a');
      }

      console.log('🎵 Audio blob size:', audioBlob.size, 'bytes');

      // Create FormData
      const formData = new FormData();
      formData.append('file', audioBlob, Platform.OS === 'web' ? 'audio.webm' : 'audio.m4a');
      formData.append('model', ENV.WHISPER_MODEL);
      formData.append('temperature', ENV.WHISPER_TEMPERATURE.toString());
      formData.append('response_format', ENV.WHISPER_RESPONSE_FORMAT);
      formData.append('prompt', '');

      console.log('🚀 Sending transcription request to Groq API...');

      // Make API request to Groq
      const response = await fetch(ENV.GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ENV.GROQ_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Groq API error:', response.status, errorData);
        return {
          success: false,
          error: `Transcription failed: ${response.status} - ${errorData}`
        };
      }

      const data = await response.json();
      console.log('✅ Transcription response:', data);

      if (data.text) {
        return {
          success: true,
          text: data.text.trim()
        };
      } else {
        return {
          success: false,
          error: 'No transcription text received'
        };
      }
    } catch (error) {
      console.error('❌ Transcription error:', error);
      return {
        success: false,
        error: `Failed to transcribe audio: ${error}`
      };
    }
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  async cancelRecording(): Promise<void> {
    try {
      if (this.isRecording && this.recording) {
        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        
        // Only cleanup files on mobile platforms
        if (uri && Platform.OS !== 'web') {
          await FileSystem.deleteAsync(uri);
          console.log('🗑️ Mobile: Cancelled and cleaned up audio file');
        } else if (Platform.OS === 'web') {
          console.log('🌐 Web: Recording cancelled, blob cleanup handled by browser');
        }
      }
    } catch (error) {
      console.error('❌ Failed to cancel recording:', error);
    } finally {
      this.isRecording = false;
      this.recording = null;
    }
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }
}

export const voiceRecordingService = new VoiceRecordingService(); 