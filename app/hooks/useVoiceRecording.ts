import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { voiceRecordingService, VoiceRecordingResult } from '../services/VoiceRecordingService';

interface VoiceRecordingHook {
  isRecording: boolean;
  isProcessing: boolean;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<VoiceRecordingResult>;
  cancelRecording: () => Promise<void>;
}

export const useVoiceRecording = (): VoiceRecordingHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      setIsRecording(true);
      const success = await voiceRecordingService.startRecording();
      
      if (!success) {
        setIsRecording(false);
        Alert.alert(
          "Recording Error", 
          "Failed to start recording. Please check microphone permissions."
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error starting voice recording:', error);
      setIsRecording(false);
      Alert.alert("Error", "Failed to start voice recording.");
      return false;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<VoiceRecordingResult> => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      const result = await voiceRecordingService.stopRecording();
      setIsProcessing(false);
      
      if (!result.success && result.error) {
        Alert.alert("Recording Failed", result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error stopping voice recording:', error);
      setIsRecording(false);
      setIsProcessing(false);
      
      const errorResult: VoiceRecordingResult = {
        success: false,
        error: 'Failed to process voice recording'
      };
      
      Alert.alert("Error", errorResult.error || "Unknown error");
      return errorResult;
    }
  }, []);

  const cancelRecording = useCallback(async (): Promise<void> => {
    try {
      await voiceRecordingService.cancelRecording();
      setIsRecording(false);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error cancelling voice recording:', error);
      setIsRecording(false);
      setIsProcessing(false);
    }
  }, []);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}; 