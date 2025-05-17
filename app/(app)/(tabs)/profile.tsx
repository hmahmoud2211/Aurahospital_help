import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, User, Heart, Bell, Shield, HelpCircle, LogOut, DollarSign } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/auth-store';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Mock financial data (replace with real data from a store or API)
  const financialOverview = {
    totalExpenses: 1500.00,
    insuranceCoverage: 1200.00,
    outstandingBalance: 300.00,
    paymentStatus: 'Partially Paid',
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)');
  };

  const renderFinancialOverview = () => {
    console.log('Rendering Financial Overview Section');
    return (
      <View style={styles.financialOverviewSection}>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        {financialOverview ? (
          <View style={styles.financialContainer}>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Total Expenses</Text>
              <Text style={styles.financialValue}>${financialOverview.totalExpenses.toFixed(2)}</Text>
            </View>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Insurance Coverage</Text>
              <Text style={styles.financialValue}>${financialOverview.insuranceCoverage.toFixed(2)}</Text>
            </View>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Outstanding Balance</Text>
              <Text style={[styles.financialValue, financialOverview.outstandingBalance > 0 ? styles.warning : styles.success]}>
                ${financialOverview.outstandingBalance.toFixed(2)}
              </Text>
            </View>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Payment Status</Text>
              <Text style={[styles.financialValue, financialOverview.paymentStatus === 'Unpaid' ? styles.danger : styles.success]}>
                {financialOverview.paymentStatus}
              </Text>
            </View>
            <View style={styles.paymentButtonContainer}>
              <TouchableOpacity style={styles.paymentButton} onPress={() => router.push('/records')}>
                <DollarSign size={20} color={Colors.background || '#FFFFFF'} />
                <Text style={styles.paymentButtonText}>Manage Payments</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>No financial data available</Text>
        )}
      </View>
    );
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
            {user && (user as any).profileImage ? (
              <Image 
                source={{ uri: (user as any).profileImage }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <User size={40} color={Colors.primary} />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileRole}>
            {(() => {
              if (user && (user as any).licenseNumber) {
                const license = ((user as any).licenseNumber as string).toLowerCase();
                if (license.startsWith('dr')) return 'Doctor';
                if (license.startsWith('n')) return 'Nurse';
                if (license.startsWith('f')) return 'Pharmacist';
                if (license.startsWith('l')) return 'Laboratory';
              }
              return user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown';
            })()}
          </Text>
          <Text style={styles.profileRole}>{user?.email}</Text>
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* User Data Section */}
        <View style={styles.infoSection}>
          {(user && (user as any).medicalRecordNumber) && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Medical Record Number</Text>
              <Text style={styles.infoValue}>{(user as any).medicalRecordNumber}</Text>
            </View>
          )}
          {(user && (user as any).dateOfBirth) && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>{(user as any).dateOfBirth}</Text>
            </View>
          )}
          {(user && (user as any).gender) && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{(user as any).gender}</Text>
            </View>
          )}
          {(user && (user as any).bloodType) && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Blood Type</Text>
              <Text style={styles.infoValue}>{(user as any).bloodType}</Text>
            </View>
          )}
          {(user && (user as any).allergies && (user as any).allergies.length > 0) && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Allergies</Text>
              <Text style={styles.infoValue}>{(user as any).allergies.join(', ')}</Text>
            </View>
          )}
          {(user && (user as any).conditions && (user as any).conditions.length > 0) && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Conditions</Text>
              <Text style={styles.infoValue}>{(user as any).conditions.join(', ')}</Text>
            </View>
          )}
          {(user && (user as any).emergencyContact) && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Emergency Contact</Text>
              <Text style={styles.infoValue}>{(user as any).emergencyContact.name} ({(user as any).emergencyContact.relationship}) - {(user as any).emergencyContact.phone}</Text>
            </View>
          )}
          {(user && (user as any).specialty) && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Specialty</Text>
              <Text style={styles.infoValue}>{(user as any).specialty}</Text>
            </View>
          )}
          {(user && (user as any).hospital) && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hospital</Text>
              <Text style={styles.infoValue}>{(user as any).hospital}</Text>
            </View>
          )}
          {(user && (user as any).licenseNumber) && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>License Number</Text>
              <Text style={styles.infoValue}>{(user as any).licenseNumber}</Text>
            </View>
          )}
          {(user && (user as any).rating) && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Rating</Text>
              <Text style={styles.infoValue}>{(user as any).rating} ★</Text>
            </View>
          )}
          {/* Add more fields as needed for nurse, pharmacist, laboratory, etc. */}
        </View>
        
        {user?.role?.toLowerCase() === 'doctor' && (
          <>
            {renderFinancialOverview()}
          </>
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
  financialOverviewSection: {
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'white',
    padding: 10,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text || '#000000',
  },
  financialContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  financialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  financialLabel: {
    ...Typography.body,
    color: '#000000',
  },
  financialValue: {
    ...Typography.body,
    fontWeight: '500',
  },
  warning: {
    color: '#FFA500',
  },
  success: {
    color: '#008000',
  },
  danger: {
    color: '#FF0000',
  },
  paymentButtonContainer: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  paymentButton: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  paymentButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    marginLeft: 8,
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
  noDataText: {
    ...Typography.body,
    color: Colors.textSecondary || '#707070',
    textAlign: 'center',
    marginVertical: 16,
  },
});