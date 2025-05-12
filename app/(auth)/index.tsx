import { View, Text, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import tw from 'twrnc';
import { StatusBar } from 'expo-status-bar'
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
    const {width} = Dimensions.get('window');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validationError, setValidationError] = useState('');
    
    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(app)/(tabs)');
        }
    }, [isAuthenticated, router]);
    
    const handleLogin = async () => {
        // Clear previous errors
        clearError();
        setValidationError('');
        
        // Validate inputs
        if (!email || !password) {
            setValidationError('Email and password are required');
            return;
        }
        
        try {
            await login(email, password);
            // Navigation will be handled by the useEffect above when isAuthenticated changes
        } catch (error) {
            console.error('Login failed:', error);
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
                        <View style={tw`flex-1 w-full justify-center items-center px-8`}> 
                            {/* Title */}
                            <View style={tw`w-full items-center mb-10`}>
                                <Animated.Text entering={FadeInUp.duration(1000).springify()} style={tw`text-black font-bold tracking-wider text-5xl`}>
                                    Login 
                                </Animated.Text>
                            </View>

                            {/* form */}
                            <View style={[tw`w-full`, { maxWidth: 400 }]}>
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
                                
                                <Animated.View entering={FadeInDown.duration(1000).springify()} 
                                    style={[
                                        tw`bg-white/90 rounded-2xl w-full mb-4 overflow-hidden`,
                                        { height: 60 }
                                    ]}>
                                    <TextInput 
                                        placeholder='Email' 
                                        placeholderTextColor={'gray'} 
                                        style={[
                                            tw`text-lg px-5`,
                                            { height: '100%' }
                                        ]}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} 
                                    style={[
                                        tw`bg-white/90 rounded-2xl w-full mb-6 overflow-hidden`,
                                        { height: 60 }
                                    ]}>
                                    <TextInput 
                                        placeholder='Password' 
                                        placeholderTextColor={'gray'} 
                                        secureTextEntry
                                        style={[
                                            tw`text-lg px-5`,
                                            { height: '100%' }
                                        ]}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={tw`w-full mb-6`}>
                                    <TouchableOpacity 
                                        onPress={handleLogin}
                                        disabled={isLoading}
                                        style={[
                                            tw`w-full bg-blue-500 rounded-xl items-center justify-center`,
                                            { height: 55 }
                                        ]}>
                                        <Text style={tw`text-xl font-bold text-white text-center`}>
                                            {isLoading ? 'Logging in...' : 'Login'}
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={tw`flex-row justify-center items-center space-x-2`}>
                                    <Text style={tw`text-base`}>Don't have an account?</Text>
                                    <TouchableOpacity onPress={() => router.push('/register')}>
                                        <Text style={tw`text-sky-600 font-semibold text-base`}> SignUP</Text>
                                    </TouchableOpacity>
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={tw`flex-row justify-center items-center space-x-2`}>
                                    <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                                        <Text style={tw`text-sky-600 font-semibold text-base`}>Forgot password?</Text>
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
