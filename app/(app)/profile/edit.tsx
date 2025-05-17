import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User as UserIcon, Camera, Mail, Phone, Calendar, MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone((user as any).phone || '');
      setDateOfBirth((user as any).dateOfBirth || '');
      setAddress((user as any).address || '');
    }
  }, [user]);

  const handleSave = () => {
    // In a real app, we would update the user profile here
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title="Edit Profile" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            {user && (user as any).profileImage ? (
              <Image 
                source={{ uri: (user as any).profileImage }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <UserIcon size={40} color={Colors.primary} />
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={20} color={Colors.background} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputContainer}>
              <UserIcon size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>
          </View>
        </View>
        
        {user?.role === 'patient' && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Blood Type</Text>
              <View style={styles.selectContainer}>
                <Text style={styles.selectText}>A+</Text>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Allergies</Text>
              <View style={styles.tagsContainer}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Penicillin</Text>
                  <TouchableOpacity style={styles.tagRemove}>
                    <Text style={styles.tagRemoveText}>×</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Peanuts</Text>
                  <TouchableOpacity style={styles.tagRemove}>
                    <Text style={styles.tagRemoveText}>×</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addTag}>
                  <Text style={styles.addTagText}>+ Add</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Emergency Contact</Text>
              <View style={styles.inputContainer}>
                <UserIcon size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value="John Johnson (Spouse)"
                  placeholder="Name & Relationship"
                />
              </View>
              <View style={styles.inputContainer}>
                <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value="555-987-6543"
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
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
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...Typography.label,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    minHeight: 50,
    backgroundColor: Colors.card,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    ...Typography.body,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
  },
  selectText: {
    ...Typography.body,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.primary,
    marginRight: 4,
  },
  tagRemove: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagRemoveText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  addTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  addTagText: {
    ...Typography.caption,
    color: Colors.primary,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});