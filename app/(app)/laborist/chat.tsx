import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MedicalChat from '../../components/MedicalChat';
import Colors from '@/constants/colors';

export default function LaboristChatScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <MedicalChat />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
}); 