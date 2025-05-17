import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, Mail, User, Calendar, Phone } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import tw from 'twrnc';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { User as UserType, UserRole } from '@/types/user';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SignupScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const { width } = Dimensions.get('window');
  const [role, setRole] = useState<UserRole>('patient');
  const [professionalRole, setProfessionalRole] = useState<'doctor' | 'nurse' | 'pharmacist' | 'laboratory'>('doctor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [specialty, setSpecialty] = useState('');
  const [hospital, setHospital] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(app)/(tabs)');
    }
  }, [isAuthenticated, router]);

  const handleRegister = async () => {
    // Clear previous errors
    clearError();
    setValidationError('');
    
    // Validate inputs
    if (!name || !email || !password || !confirmPassword || !nationalId || !phone || !dateOfBirth) {
      setValidationError('All fields are required');
      return;
    }
    
    if (role === 'doctor') {
      if (!licenseNumber || !specialty || !hospital) {
        setValidationError('All professional fields are required');
        return;
      }

      // Validate license number format based on professional role
      let isValid = false;
      let validPrefix = '';
      if (professionalRole === 'doctor') {
        validPrefix = 'dr';
        isValid = licenseNumber.substring(0, 2).toLowerCase() === validPrefix;
      } else if (professionalRole === 'nurse') {
        validPrefix = 'n';
        isValid = licenseNumber.substring(0, 1).toLowerCase() === validPrefix;
      } else if (professionalRole === 'pharmacist') {
        validPrefix = 'f';
        isValid = licenseNumber.substring(0, 1).toLowerCase() === validPrefix;
      } else if (professionalRole === 'laboratory') {
        validPrefix = 'l';
        isValid = licenseNumber.substring(0, 1).toLowerCase() === validPrefix;
      }
      if (!isValid) {
        setValidationError(`License number must start with '${validPrefix.toUpperCase()}' for ${professionalRole.charAt(0).toUpperCase() + professionalRole.slice(1)}`);
        return;
      }
    }
    
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    // Create user data based on role
    const userData: Partial<UserType> = {
      name,
      email,
      role,
      ...(role === 'patient' ? {
        medicalRecordNumber: nationalId,
        dateOfBirth,
        gender,
        phone,
      } : {
        licenseNumber,
        specialty,
        hospital,
        phone,
        professionalRole,
      })
    };
    
    try {
      await register(userData, password);
      // Navigation will be handled by the useEffect above when isAuthenticated changes
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setDateOfBirth(`${year}-${month}-${day}`);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView 
          contentContainerStyle={tw`flex-grow`}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={tw`flex-1 bg-white`}>
            <StatusBar style="light" />
            <Image 
              style={tw`absolute w-full h-full`} 
              source={require('../assets/hospital.png')} 
              resizeMode="cover"
            />

            {/* title and form */}
            <View style={tw`flex-1 w-full justify-center items-center px-8 py-10`}> 
              {/* Title */}
              <View style={tw`w-full items-center mb-10`}>
                <Animated.Text entering={FadeInUp.duration(1000).springify()} style={tw`text-black font-bold tracking-wider text-5xl`}>
                  Sign Up 
                </Animated.Text>
              </View>
              
              <Animated.View entering={FadeInDown.delay(100).duration(1000).springify()} style={tw`w-full mb-6 items-center`}>
                <View style={[tw`flex-row rounded-xl overflow-hidden bg-gray-100`, { maxWidth: 400 }]}>
                  <TouchableOpacity 
                    onPress={() => setRole('patient')} 
                    style={[
                      tw`py-3 px-10`,
                      role === 'patient' ? tw`bg-gray-100` : tw`bg-blue-500`
                    ]}
                  >
                    <Text 
                      style={[
                        tw`text-base font-medium`,
                        role === 'patient' ? tw`text-gray-800` : tw`text-white`
                      ]}
                    >
                      Patient
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setRole('doctor')} 
                    style={[
                      tw`py-3 px-10`,
                      role === 'doctor' ? tw`bg-gray-100` : tw`bg-blue-500`
                    ]}
                  >
                    <Text 
                      style={[
                        tw`text-base font-medium`,
                        role === 'doctor' ? tw`text-gray-800` : tw`text-white`
                      ]}
                    >
                      Other
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* form */}
              <View key={role} style={[tw`w-full`, { maxWidth: 400 }]}>
                {validationError ? (
                  <Animated.View entering={FadeInDown.delay(100).duration(1000).springify()} style={tw`w-full mb-4`}>
                    <Text style={tw`text-red-500 text-center`}>{validationError}</Text>
                  </Animated.View>
                ) : null}
                
                {error ? (
                  <Animated.View entering={FadeInDown.delay(100).duration(1000).springify()} style={tw`w-full mb-4`}>
                    <Text style={tw`text-red-500 text-center`}>{error}</Text>
                  </Animated.View>
                ) : null}

                <Animated.View entering={FadeInDown.delay(100).duration(1000).springify()} 
                  style={[
                    tw`bg-white/90 rounded-2xl w-full mb-4 overflow-hidden`,
                    { height: 60 }
                  ]}>
                  <TextInput 
                    placeholder='Name' 
                    placeholderTextColor={'gray'} 
                    value={name}
                    onChangeText={setName}
                    style={[
                      tw`text-lg px-5`,
                      { height: '100%' }
                    ]}
                  />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} 
                  style={[
                    tw`bg-white/90 rounded-2xl w-full mb-4 overflow-hidden`,
                    { height: 60 }
                  ]}>
                  <TextInput 
                    placeholder='Email' 
                    placeholderTextColor={'gray'} 
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[
                      tw`text-lg px-5`,
                      { height: '100%' }
                    ]}
                  />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).duration(1000).springify()} 
                  style={[
                    tw`bg-white/90 rounded-2xl w-full mb-4 overflow-hidden`,
                    { height: 60 }
                  ]}>
                  <TextInput 
                    placeholder={role === 'patient' ? 'Medical Record Number' : 'National ID'} 
                    placeholderTextColor={'gray'} 
                    value={nationalId}
                    onChangeText={setNationalId}
                    style={[
                      tw`text-lg px-5`,
                      { height: '100%' }
                    ]}
                  />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} 
                  style={[
                    tw`bg-white/90 rounded-2xl w-full mb-4 overflow-hidden`,
                    { height: 60 }
                  ]}>
                  <TextInput 
                    placeholder='Phone Number' 
                    placeholderTextColor={'gray'} 
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    style={[
                      tw`text-lg px-5`,
                      { height: '100%' }
                    ]}
                  />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(500).duration(1000).springify()} 
                  style={[
                    tw`bg-white/90 rounded-2xl w-full mb-4 overflow-hidden`,
                    { height: 60 }
                  ]}>
                  {Platform.OS === 'web' ? (
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      style={{ width: '100%', height: '100%', fontSize: 18, paddingLeft: 20, border: 'none', background: 'transparent' }}
                    />
                  ) : (
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[tw`flex-1 justify-center`, { height: '100%' }]}> 
                      <Text style={[tw`text-lg px-5`, { color: dateOfBirth ? 'black' : 'gray' }]}> 
                        {dateOfBirth || 'Date of Birth (YYYY-MM-DD)'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {showDatePicker && Platform.OS !== 'web' && (
                    <DateTimePicker
                      value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                    />
                  )}
                </Animated.View>

                {role === 'doctor' && (
                  <>
                    <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()}
                      style={[
                        tw`bg-white/90 rounded-2xl w-full mb-4 overflow-hidden`,
                        { height: 60 }
                      ]}>
                      <View style={tw`flex-row rounded-xl overflow-hidden bg-gray-100 mb-4`}>
                        <TouchableOpacity 
                          onPress={() => setProfessionalRole('doctor')} 
                          style={[
                            tw`py-3 px-4`,
                            professionalRole === 'doctor' ? tw`bg-gray-100` : tw`bg-blue-500`
                          ]}
                        >
                          <Text 
                            style={[
                              tw`text-base font-medium`,
                              professionalRole === 'doctor' ? tw`text-gray-800` : tw`text-white`
                            ]}
                          >
                            Doctor
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => setProfessionalRole('nurse')} 
                          style={[
                            tw`py-3 px-4`,
                            professionalRole === 'nurse' ? tw`bg-gray-100` : tw`bg-blue-500`
                          ]}
                        >
                          <Text 
                            style={[
                              tw`text-base font-medium`,
                              professionalRole === 'nurse' ? tw`text-gray-800` : tw`text-white`
                            ]}
                          >
                            Nurse
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => setProfessionalRole('pharmacist')} 
                          style={[
                            tw`py-3 px-4`,
                            professionalRole === 'pharmacist' ? tw`bg-gray-100` : tw`bg-blue-500`
                          ]}
                        >
                          <Text 
                            style={[
                              tw`text-base font-medium`,
                              professionalRole === 'pharmacist' ? tw`text-gray-800` : tw`text-white`
                            ]}
                          >
                            Pharmacist
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => setProfessionalRole('laboratory')} 
                          style={[
                            tw`py-3 px-4`,
                            professionalRole === 'laboratory' ? tw`bg-gray-100` : tw`bg-blue-500`
                          ]}
                        >
                          <Text 
                            style={[
                              tw`text-base font-medium`,
                              professionalRole === 'laboratory' ? tw`text-gray-800` : tw`text-white`
                            ]}
                          >
                            Lab
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(700).duration(1000).springify()}
                      style={[
                        tw`bg-white/90 rounded-2xl w-full mb-4 overflow-hidden`,
                        { height: 60 }
                      ]}>
                      <TextInput
                        placeholder={`License Number (starts with ${professionalRole === 'doctor' ? 'DR' : professionalRole === 'nurse' ? 'N' : professionalRole === 'pharmacist' ? 'F' : 'L'})`}
                        placeholderTextColor={'gray'}
                        value={licenseNumber}
                        onChangeText={setLicenseNumber}
                        style={[
                          tw`text-lg px-5`,
                          { height: '100%' }
                        ]}
                      />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()}
                      style={[
                        tw`bg-white/90 rounded-2xl w-full mb-4 overflow-hidden`,
                        { height: 60 }
                      ]}>
                      <TextInput
                        placeholder="Specialty"
                        placeholderTextColor={'gray'}
                        value={specialty}
                        onChangeText={setSpecialty}
                        style={[
                          tw`text-lg px-5`,
                          { height: '100%' }
                        ]}
                      />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(900).duration(1000).springify()}
                      style={[
                        tw`bg-white/90 rounded-2xl w-full mb-4 overflow-hidden`,
                        { height: 60 }
                      ]}>
                      <TextInput
                        placeholder="Hospital"
                        placeholderTextColor={'gray'}
                        value={hospital}
                        onChangeText={setHospital}
                        style={[
                          tw`text-lg px-5`,
                          { height: '100%' }
                        ]}
                      />
                    </Animated.View>
                  </>
                )}

                <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} 
                  style={[
                    tw`bg-white/90 rounded-2xl w-full mb-4 overflow-hidden`,
                    { height: 60 }
                  ]}>
                  <TextInput 
                    placeholder='Password' 
                    placeholderTextColor={'gray'} 
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={[
                      tw`text-lg px-5`,
                      { height: '100%' }
                    ]}
                  />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(1100).duration(1000).springify()} 
                  style={[
                    tw`bg-white/90 rounded-2xl w-full mb-6 overflow-hidden`,
                    { height: 60 }
                  ]}>
                  <TextInput 
                    placeholder='Confirm Password' 
                    placeholderTextColor={'gray'} 
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    style={[
                      tw`text-lg px-5`,
                      { height: '100%' }
                    ]}
                  />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(1200).duration(1000).springify()} style={tw`w-full mb-2`}>
                  <TouchableOpacity 
                    onPress={handleRegister}
                    disabled={isLoading}
                    style={[
                      tw`w-full bg-blue-500 rounded-xl items-center justify-center`,
                      { height: 55 }
                    ]}>
                    <Text style={tw`text-xl font-bold text-white text-center`}>
                      {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(1300).duration(1000).springify()} style={tw`flex-row justify-center items-center space-x-2 mt-2 mb-6`}>
                  <Text style={tw`text-base font-medium`}>Already have an account?</Text>
                  <TouchableOpacity onPress={() => router.push('/')}>
                    <Text style={tw`text-sky-600 font-semibold text-lg`}>Login</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
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