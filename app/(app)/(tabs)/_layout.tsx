import React from "react";
import { Tabs } from "expo-router";
import { Home, Calendar, FileText, User, Pill, MessageSquare, Package } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth-store";

export default function TabLayout() {
  const { user } = useAuthStore();
  const isPharmacist = user?.role === 'pharmacist';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      {/* Pharmacy management as first tab for pharmacists - this becomes the default */}
      <Tabs.Screen
        name="pharmacy-management"
        options={{
          title: isPharmacist ? "Dashboard" : "Pharmacy Mgmt",
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
          href: isPharmacist ? undefined : null, // Show for pharmacists, hide for others
        }}
      />
      
      {/* Regular home tab for non-pharmacists as first tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          href: !isPharmacist ? undefined : null, // Show for non-pharmacists, hide for pharmacists
        }}
      />
      
      {/* Other tabs for non-pharmacists */}
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Appointments",
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
          href: !isPharmacist ? undefined : null, // Hide for pharmacists
        }}
      />
      
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
          href: !isPharmacist ? undefined : null, // Hide for pharmacists
        }}
      />
      
      <Tabs.Screen
        name="records"
        options={{
          title: "Records",
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
          href: !isPharmacist ? undefined : null, // Hide for pharmacists
        }}
      />

      {/* Patient pharmacy tab - different for pharmacists vs others */}
      <Tabs.Screen
        name="pharmacy"
        options={{
          title: isPharmacist ? "Patient Meds" : "Pharmacy",
          tabBarIcon: ({ color, size }) => <Pill size={size} color={color} />,
        }}
        listeners={!isPharmacist ? ({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("pharmacy");
          }
        }) : undefined}
      />

      {/* Profile tab for everyone - always last */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}