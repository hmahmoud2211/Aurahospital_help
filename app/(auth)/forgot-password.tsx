import { View, Text, Image, TextInput, TouchableOpacity, Dimensions, Alert } from 'react-native'
import React, { useState } from 'react'
import tw from 'twrnc';
import { StatusBar } from 'expo-status-bar'
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Change this to your backend URL

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const {width} = Dimensions.get('window');
    const [email, setEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [validationError, setValidationError] = useState('');
    
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        return phoneRegex.test(phone.replace(/\s+/g, ''));
    };

    const handleSendCode = async () => {
        // Clear previous errors
        setValidationError('');
        
        // Validate email
        if (!email.trim()) {
            setValidationError('Email is required');
            return;
        }
        
        if (!validateEmail(email)) {
            setValidationError('Please enter a valid email address');
            return;
        }

        // Validate mobile number
        if (!mobileNumber.trim()) {
            setValidationError('Mobile number is required');
            return;
        }
        
        if (!validatePhone(mobileNumber)) {
            setValidationError('Please enter a valid mobile number');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`${API_URL}/auth/send-reset-code`, {
                email,
                mobileNumber
            });
            // Navigate immediately to verify-code page
            router.push({
                pathname: '/(auth)/verify-code',
                params: { email, mobileNumber }
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Failed to send verification code';
            setValidationError(errorMessage);
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <View style={tw`bg-white h-full w-full`}>
            <StatusBar style="light" />
            <Image style={tw`h-full w-full absolute`} source={require('../assets/hospital.png')} />

            {/* Back button */}
            <TouchableOpacity 
                style={tw`absolute top-12 left-4 z-10 bg-white/20 p-2 rounded-full`}
                onPress={() => router.back()}
            >
                <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>

            {/* title and form */}
            <View style={tw`h-full w-full flex justify-center items-center px-8`}> 
                {/* Title */}
                <View style={tw`w-full flex items-center mb-10`}>
                    <Animated.Text entering={FadeInUp.duration(1000).springify()} style={tw`text-black font-bold tracking-wider text-5xl`}>
                        Find your account
                    </Animated.Text>
                </View>
                {/* form */}
                <View style={[tw`w-full`, { maxWidth: 400 }]}>
                    {validationError ? (
                        <Animated.View entering={FadeInDown.delay(100).duration(1000).springify()} style={tw`w-full mb-4`}>
                            <Text style={tw`text-red-500 text-center`}>{validationError}</Text>
                        </Animated.View>
                    ) : null}

                    <Animated.View entering={FadeInDown.duration(1000).springify()} 
                        style={[
                            tw`bg-white/80 rounded-2xl w-full mb-4 overflow-hidden`,
                            { height: 60 }
                        ]}>
                        <TextInput 
                            placeholder='Email address' 
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

                    <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} 
                        style={[
                            tw`bg-white/80 rounded-2xl w-full mb-6 overflow-hidden`,
                            { height: 60 }
                        ]}>
                        <TextInput 
                            placeholder='Mobile number' 
                            placeholderTextColor={'gray'} 
                            value={mobileNumber}
                            onChangeText={setMobileNumber}
                            keyboardType="phone-pad"
                            style={[
                                tw`text-lg px-5`,
                                { height: '100%' }
                            ]}
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={tw`w-full mb-6`}>
                        <TouchableOpacity 
                            onPress={handleSendCode}
                            disabled={isLoading || !email.trim() || !mobileNumber.trim()}
                            style={[
                                tw`w-full bg-sky-400 rounded-xl items-center justify-center`,
                                { height: 55 },
                                (isLoading || !email.trim() || !mobileNumber.trim()) && tw`opacity-50`
                            ]}>
                            <Text style={tw`text-xl font-bold text-white text-center`}>
                                {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
} 