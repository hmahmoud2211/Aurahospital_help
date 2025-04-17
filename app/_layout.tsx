import React from "react";
import { Stack } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";

export default function RootLayout() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(app)/(tabs)");
    } else {
      router.replace("/(auth)");
    }
  }, [isAuthenticated]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(app)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}