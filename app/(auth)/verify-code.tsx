import { View, Text, Image, TextInput, TouchableOpacity, Dimensions, Alert, Pressable } from 'react-native'
import React, { useRef, useState } from 'react'
import tw from 'twrnc';
import { StatusBar } from 'expo-status-bar'
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Change this to your backend URL

export default function VerifyCodeScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const {width} = Dimensions.get('window');
    const [verificationCode, setVerificationCode] = useState('');
    const [validationError, setValidationError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const verifyCode = async (code: string) => {
        try {
            const response = await axios.post(`${API_URL}/auth/verify-reset-code`, {
                email: params.email,
                mobileNumber: params.mobileNumber,
                code: code
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.detail || 'Failed to verify code');
            }
            throw new Error('Network error. Please try again.');
        }
    };
    
    const handleContinue = async () => {
        setValidationError('');
        if (verificationCode.length !== 6 || !/^\d{6}$/.test(verificationCode)) {
            setValidationError('Please enter a valid 6-digit code');
            return;
        }
        setIsLoading(true);
        try {
            await verifyCode(verificationCode);
            router.push({
                pathname: '/(auth)/new-password',
                params: { 
                    email: params.email,
                    mobileNumber: params.mobileNumber,
                    code: verificationCode
                }
            });
        } catch (error: any) {
            setValidationError(error.message);
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle input change for OTP
    const handleOtpChange = (text: string) => {
        // Only allow numbers and max 6 digits
        const sanitized = text.replace(/[^0-9]/g, '').slice(0, 6);
        setVerificationCode(sanitized);
    };

    // Render OTP boxes
    const renderOtpBoxes = () => {
        const boxes = [];
        for (let i = 0; i < 6; i++) {
            boxes.push(
                <Pressable
                    key={i}
                    onPress={() => inputRef.current?.focus()}
                    style={[
                        tw`border rounded-xl bg-white/80 mx-1 items-center justify-center`,
                        { width: 40, height: 55, borderColor: '#38bdf8', borderWidth: 2 },
                    ]}
                >
                    <Text style={tw`text-2xl font-bold text-black`}>
                        {verificationCode[i] ? verificationCode[i] : ''}
                    </Text>
                </Pressable>
            );
        }
        return (
            <View style={tw`flex-row justify-center mb-8`}>{boxes}</View>
        );
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
                        Enter verification code
                    </Animated.Text>
                </View>
                {/* form */}
                <View style={[tw`w-full`, { maxWidth: 400 }]}>                    
                    {validationError ? (
                        <Animated.View entering={FadeInDown.delay(100).duration(1000).springify()} style={tw`w-full mb-4`}>
                            <Text style={tw`text-red-500 text-center`}>{validationError}</Text>
                        </Animated.View>
                    ) : null}

                    {/* OTP Boxes */}
                    <Pressable onPress={() => inputRef.current?.focus()}>{renderOtpBoxes()}</Pressable>
                    {/* Hidden TextInput for OTP */}
                    <TextInput
                        ref={inputRef}
                        value={verificationCode}
                        onChangeText={handleOtpChange}
                        keyboardType="number-pad"
                        maxLength={6}
                        style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
                        autoFocus
                        importantForAutofill="no"
                    />

                    <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={tw`w-full mb-6`}>
                        <TouchableOpacity 
                            onPress={handleContinue}
                            disabled={isLoading || verificationCode.length !== 6}
                            style={[
                                tw`w-full bg-sky-400 rounded-xl items-center justify-center`,
                                { height: 55 },
                                (isLoading || verificationCode.length !== 6) && tw`opacity-50`
                            ]}>
                            <Text style={tw`text-xl font-bold text-white text-center`}>
                                {isLoading ? 'Verifying...' : 'Verify Code'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={tw`flex-row justify-center items-center space-x-2`}>
                        <Text style={tw`text-base`}>Didn't receive the code?</Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={tw`text-sky-600 font-semibold text-base`}>Try Again</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
} 