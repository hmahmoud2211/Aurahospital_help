import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, Mail, User, Calendar, Phone } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [validationError, setValidationError] = useState('');

  const handleRegister = async () => {
    // Clear previous errors
    clearError();
    setValidationError('');
    
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      setValidationError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    // Create user data
    const userData = {
      name,
      email,
      role: userType,
      dateOfBirth,
    };
    
    // Register user
    await register(userData, password);
    
    // Navigate to login on success
    if (!error) {
      router.replace('/');
    }
  };

  const toggleUserType = () => {
    setUserType(userType === 'patient' ? 'doctor' : 'patient');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
          </View>
          
          <View style={styles.userTypeToggle}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'patient' && styles.activeUserType,
              ]}
              onPress={() => setUserType('patient')}
            >
              <User size={20} color={userType === 'patient' ? Colors.primary : Colors.textSecondary} />
              <Text
                style={[
                  styles.userTypeText,
                  userType === 'patient' && styles.activeUserTypeText,
                ]}
              >
                Patient
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'doctor' && styles.activeUserType,
              ]}
              onPress={() => setUserType('doctor')}
            >
              <User size={20} color={userType === 'doctor' ? Colors.primary : Colors.textSecondary} />
              <Text
                style={[
                  styles.userTypeText,
                  userType === 'doctor' && styles.activeUserTypeText,
                ]}
              >
                Doctor
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                onFocus={() => {
                  clearError();
                  setValidationError('');
                }}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => {
                  clearError();
                  setValidationError('');
                }}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Calendar size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Date of Birth (MM/DD/YYYY)"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                keyboardType="numbers-and-punctuation"
                onFocus={() => {
                  clearError();
                  setValidationError('');
                }}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                onFocus={() => {
                  clearError();
                  setValidationError('');
                }}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => {
                  clearError();
                  setValidationError('');
                }}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                onFocus={() => {
                  clearError();
                  setValidationError('');
                }}
              />
            </View>
            
            {(error || validationError) && (
              <Text style={styles.errorText}>{error || validationError}</Text>
            )}
            
            <Button
              title="Register"
              onPress={handleRegister}
              loading={isLoading}
              disabled={!name || !email || !password || !confirmPassword}
              fullWidth
              style={styles.registerButton}
            />
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    ...Typography.h2,
  },
  userTypeToggle: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
    padding: 4,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
  },
  activeUserType: {
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userTypeText: {
    ...Typography.body,
    marginLeft: 8,
    color: Colors.textSecondary,
  },
  activeUserTypeText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 50,
    backgroundColor: Colors.card,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    ...Typography.body,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  loginLink: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
  },
});