import { Slot } from "expo-router";
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import Colors from "@/constants/colors";

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Check if the user is authenticated
    if (!isAuthenticated) {
      // If not authenticated, redirect to the login page
      // Use setTimeout to ensure this happens after initial render
      const timer = setTimeout(() => {
        router.replace("/(auth)");
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router, segments]);

  // Important: Return a Slot to ensure the Root Layout component is rendering properly
  return <Slot />;
}