import React from "react";
import { Stack } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import Colors from "@/constants/colors";

export default function AppLayout() {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return null;
    }

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
                name="(tabs)"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="laborist"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="laborist/upload"
                options={{
                    title: "Upload Medical File",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="laborist/chat"
                options={{
                    title: "Laboratory Assistant",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="appointment/[id]"
                options={{
                    title: "Appointment Details",
                }}
            />
            <Stack.Screen
                name="records/[id]"
                options={{
                    title: "Medical Record",
                }}
            />
            <Stack.Screen
                name="pharmacy/[id]"
                options={{
                    title: "Prescription Details",
                }}
            />
            <Stack.Screen
                name="profile/edit"
                options={{
                    title: "Edit Profile",
                }}
            />
            <Stack.Screen
                name="medical-records/upload"
                options={{
                    title: "Upload Document",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="medical-records/[id]"
                options={{
                    title: "Document Details",
                }}
            />
        </Stack>
    );
}