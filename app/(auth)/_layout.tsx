import { Stack } from "expo-router";
import Colors from "@/constants/colors";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          animation: 'fade',
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          headerShown: false,
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{ 
          headerShown: false,
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="mobile-number" 
        options={{ 
          headerShown: false,
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="new-password" 
        options={{ 
          headerShown: false,
          animation: 'slide_from_right',
        }} 
      />
    </Stack>
  );
}