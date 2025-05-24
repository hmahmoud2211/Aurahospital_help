import React from 'react';
import { Redirect, Slot, Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import Colors from "@/constants/colors";

export default function AppLayout() {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Redirect href="/" />;
    }

    // If the user is a nurse, redirect to the nurse dashboard
    if (user?.role === 'nurse') {
        return (
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="nurse" options={{ title: 'Nurse Dashboard' }} />
                <Stack.Screen name="appointment/new" options={{ presentation: 'modal' }} />
                <Stack.Screen name="appointment/[id]" options={{ presentation: 'card' }} />
                <Stack.Screen name="appointments" options={{ title: 'All Appointments' }} />
                <Stack.Screen name="schedule-search" options={{ title: 'Find Patient' }} />
                <Stack.Screen name="patient-search" options={{ title: 'Find Patient' }} />
            </Stack>
        );
    }

    // Otherwise, use the default tabs layout
    return <Slot />;
}