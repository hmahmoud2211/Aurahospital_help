import { View, Text, Image, TextInput, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import tw from 'twrnc';
import { StatusBar } from 'expo-status-bar'
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth-store';

export default function LoginScreen() {
    const navigation = useNavigation();
    const {width} = Dimensions.get('window');
    
    // Local state for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Auth store
    const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
    
    // Navigate to home if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigation.replace('Home');
        }
    }, [isAuthenticated]);
    
    // Clear error when component mounts
    useEffect(() => {
        clearError();
    }, []);
    
    // Show error alert when error occurs
    useEffect(() => {
        if (error) {
            Alert.alert('Login Error', error, [
                { text: 'OK', onPress: clearError }
            ]);
        }
    }, [error]);
    
    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }
        
        console.log('🔐 Attempting login with:', email);
        
        try {
            await login(email.trim(), password);
            console.log('✅ Login successful, navigating to home');
            // Navigation will happen automatically due to useEffect above
        } catch (error) {
            console.error('❌ Login failed:', error);
            // Error will be shown by useEffect above
        }
    };
    
    return (
        <View style={tw`bg-white h-full w-full`}>
            <StatusBar style="light" />
            <Image style={tw`h-full w-full absolute`} source={require('./assets/hospital.png')} />

            {/* title and form */}
            <View style={tw`h-full w-full flex justify-center items-center px-8`}> 
                {/* Title */}
                <View style={tw`w-full flex items-center mb-10`}>
                    <Animated.Text entering={FadeInUp.duration(1000).springify()} style={tw`text-black font-bold tracking-wider text-5xl`}>
                        Login 
                    </Animated.Text>
                </View>
                {/* form */}
                <View style={[tw`w-full`, { maxWidth: 400 }]}>
                    <Animated.View entering={FadeInDown.duration(1000).springify()} 
                        style={[
                            tw`bg-white/80 rounded-2xl w-full mb-4 overflow-hidden`,
                            { height: 60 }
                        ]}>
                        <TextInput 
                            placeholder='Email' 
                            placeholderTextColor={'gray'} 
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                            style={[
                                tw`text-lg px-5`,
                                { height: '100%' }
                            ]}
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} 
                        style={[
                            tw`bg-white/80 rounded-2xl w-full mb-6 overflow-hidden`,
                            { height: 60 }
                        ]}>
                        <TextInput 
                            placeholder='Password' 
                            placeholderTextColor={'gray'} 
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!isLoading}
                            style={[
                                tw`text-lg px-5`,
                                { height: '100%' }
                            ]}
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={tw`w-full mb-6`}>
                        <TouchableOpacity 
                            onPress={handleLogin}
                            disabled={isLoading}
                            style={[
                                tw`w-full rounded-xl items-center justify-center`,
                                { 
                                    height: 55,
                                    backgroundColor: isLoading ? '#93C5FD' : '#38BDF8'
                                }
                            ]}>
                            {isLoading ? (
                                <View style={tw`flex-row items-center`}>
                                    <ActivityIndicator color="white" style={tw`mr-2`} />
                                    <Text style={tw`text-xl font-bold text-white text-center`}>
                                        Logging in...
                                    </Text>
                                </View>
                            ) : (
                                <Text style={tw`text-xl font-bold text-white text-center`}>
                                    Login
                                </Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Demo Credentials */}
                    <Animated.View entering={FadeInDown.delay(500).duration(1000).springify()} style={tw`mb-4 p-3 bg-black/10 rounded-xl`}>
                        <Text style={tw`text-center text-sm font-semibold mb-2`}>Demo Credentials:</Text>
                        <TouchableOpacity onPress={() => { setEmail('nurse@test.com'); setPassword('password123'); }}>
                            <Text style={tw`text-center text-blue-600`}>👩‍⚕️ Nurse: nurse@test.com / password123</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={tw`flex-row justify-center items-center space-x-2`}>
                        <Text style={tw`text-base`}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.push('SignUp')} disabled={isLoading}>
                            <Text style={tw`text-sky-600 font-semibold text-base`}> SignUP</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={tw`flex-row justify-center items-center space-x-2 mt-2`}>
                        <TouchableOpacity onPress={() => navigation.push('ForgotPassword')} disabled={isLoading}>
                            <Text style={tw`text-sky-600 font-semibold text-base`}>Forgot password?</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
}
