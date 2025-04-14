import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, User, Heart, Bell, Shield, HelpCircle, LogOut } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/auth-store';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
    router.replace('/(auth)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header 
        title="Profile" 
        showBack={false}
        rightComponent={
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Settings size={24} color={Colors.background} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {user?.profileImage ? (
              <Image 
                source={{ uri: user.profileImage }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <User size={40} color={Colors.primary} />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileRole}>{user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}</Text>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        {user?.role === 'patient' && (
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Medical Record Number</Text>
              <Text style={styles.infoValue}>293847</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>May 12, 1981</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Blood Type</Text>
              <Text style={styles.infoValue}>A+</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Emergency Contact</Text>
              <Text style={styles.infoValue}>John Johnson (Spouse)</Text>
            </View>
          </View>
        )}
        
        {user?.role === 'doctor' && (
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Specialty</Text>
              <Text style={styles.infoValue}>Cardiology</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hospital</Text>
              <Text style={styles.infoValue}>Memorial Hospital</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>License Number</Text>
              <Text style={styles.infoValue}>MD12345</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Rating</Text>
              <Text style={styles.infoValue}>4.9 ★</Text>
            </View>
          </View>
        )}
        
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Heart size={20} color={Colors.success} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Health Data</Text>
              <Text style={styles.menuDescription}>View and manage your health data</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Bell size={20} color={Colors.info} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Notifications</Text>
              <Text style={styles.menuDescription}>Manage your notification preferences</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Shield size={20} color="#FF9800" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Privacy & Security</Text>
              <Text style={styles.menuDescription}>Manage your privacy settings</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconContainer, { backgroundColor: Colors.primaryLight }]}>
              <HelpCircle size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Help & Support</Text>
              <Text style={styles.menuDescription}>Get help and contact support</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={Colors.danger} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>MediCare Pro v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    ...Typography.h3,
    marginBottom: 4,
  },
  profileRole: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  editProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
  },
  editProfileText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  infoValue: {
    ...Typography.body,
    fontWeight: '500',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  menuDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    ...Typography.body,
    color: Colors.danger,
    fontWeight: '500',
  },
  versionText: {
    ...Typography.caption,
    color: Colors.textLight,
    textAlign: 'center',
  },
});