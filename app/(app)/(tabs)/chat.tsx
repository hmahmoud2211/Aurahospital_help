import React from "react";
import { View, StyleSheet } from "react-native";
import MedicalAssistantScreen from "../../screens/MedicalAssistantScreen";
import Colors from "@/constants/colors";

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <MedicalAssistantScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
}); 