import { Stack } from 'expo-router';

export default function ScheduleSearchLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Find Patient' }} />
    </Stack>
  );
} 