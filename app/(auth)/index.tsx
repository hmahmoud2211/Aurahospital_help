import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Mail, UserIcon } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');

  // Only redirect after component is mounted
  useEffect(() => {
    if (isAuthenticated) {
      // Use setTimeout to ensure this happens after initial render
      const timer = setTimeout(() => {
        router.replace('/(app)/(tabs)');
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    if (!email && !password) {
      // For demo purposes, use predefined emails
      let demoEmail = '';
      if (userType === 'patient') {
        demoEmail = 'sarah.johnson@example.com';
      } else {
        demoEmail = 'michael.chen@example.com';
      }
      
      await login(demoEmail, 'password');
    } else {
      await login(email, password);
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
            <Text style={styles.title}>MediCare Pro</Text>
            <Text style={styles.subtitle}>Healthcare at your fingertips</Text>
          </View>
          
          <View style={styles.userTypeToggle}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'patient' && styles.activeUserType,
              ]}
              onPress={() => setUserType('patient')}
            >
              <UserIcon size={20} color={userType === 'patient' ? Colors.primary : Colors.textSecondary} />
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
              <UserIcon size={20} color={userType === 'doctor' ? Colors.primary : Colors.textSecondary} />
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
              <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={clearError}
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
                onFocus={clearError}
              />
            </View>
            
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <Button
              title="Login"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
            />
            
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.demoNotice}>
            <Text style={styles.demoText}>Demo credentials are pre-filled. Just click Login.</Text>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...Typography.h1,
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    ...Typography.caption,
    color: Colors.primary,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  registerLink: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
  },
  demoNotice: {
    marginTop: 40,
    padding: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoText: {
    ...Typography.caption,
    color: Colors.primary,
    textAlign: 'center',
  },
});
