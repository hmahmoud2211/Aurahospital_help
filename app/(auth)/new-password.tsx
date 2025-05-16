import { View, Text, Image, TextInput, TouchableOpacity, Dimensions, Alert } from 'react-native';
import React, { useState } from 'react';
import tw from 'twrnc';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Change this to your backend URL

export default function NewPasswordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { width } = Dimensions.get('window');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const resetPassword = async (newPassword: string) => {
        try {
            const response = await axios.post(`${API_URL}/auth/reset-password`, {
                email: params.email,
                mobileNumber: params.mobileNumber,
                code: params.code,
                newPassword: newPassword
            });
            return response.data;
        } catch (error: any) {
            console.log('Reset password error:', error);
            let message = 'An error occurred. Please try again.';
            if (error && error.response && error.response.data && error.response.data.detail) {
                message = error.response.data.detail;
            } else if (typeof error === 'string') {
                message = error;
            } else if (error.message && typeof error.message === 'string') {
                message = error.message;
            }
            setValidationError(message);
            Alert.alert('Error', message);
        }
    };

    const handleContinue = async () => {
        setValidationError('');
        // Validate password
        if (!password) {
            setValidationError('Password is required');
            return;
        }
        if (password.length < 6) {
            setValidationError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }
        setIsLoading(true);
        try {
            await resetPassword(password);
            Alert.alert('Success', 'Your password has been reset successfully.');
            router.push('/(auth)'); // Immediately navigate to login
        } catch (error: any) {
            console.log('Reset password error:', error);
            let message = 'An error occurred. Please try again.';
            if (error && error.response && error.response.data && error.response.data.detail) {
                message = error.response.data.detail;
            } else if (typeof error === 'string') {
                message = error;
            } else if (error.message && typeof error.message === 'string') {
                message = error.message;
            }
            setValidationError(message);
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={tw`bg-white h-full w-full`}>
            <StatusBar style="light" />
            <Image style={tw`h-full w-full absolute`} source={require('../assets/hospital.png')} />
            <View style={tw`h-full w-full flex justify-center items-center px-8`}>
                <View style={tw`w-full flex items-center mb-6`}>
                    <Animated.Text entering={FadeInUp.duration(1000).springify()} style={tw`text-black font-bold tracking-wider text-5xl`}>
                        Create new password
                    </Animated.Text>
                </View>
                <View style={[tw`w-full`, { maxWidth: 400 }]}>                    
                    {validationError ? (
                        <Animated.View entering={FadeInDown.delay(100).duration(1000).springify()} style={tw`w-full mb-4`}>
                            <Text style={tw`text-red-500 text-center`}>{validationError}</Text>
                        </Animated.View>
                    ) : null}
                    <Animated.View entering={FadeInDown.duration(1000).springify()}
                        style={[
                            tw`bg-white/80 rounded-2xl w-full mb-4 overflow-hidden`,
                            { height: 60 },
                        ]}
                    >
                        <TextInput
                            placeholder="New password"
                            placeholderTextColor={'gray'}
                            style={[
                                tw`text-lg px-5`,
                                { height: '100%' },
                            ]}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}
                        style={[
                            tw`bg-white/80 rounded-2xl w-full mb-6 overflow-hidden`,
                            { height: 60 },
                        ]}
                    >
                        <TextInput
                            placeholder="Confirm password"
                            placeholderTextColor={'gray'}
                            secureTextEntry
                            style={[
                                tw`text-lg px-5`,
                                { height: '100%' },
                            ]}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={tw`w-full mb-6`}>
                        <TouchableOpacity 
                            onPress={handleContinue}
                            disabled={isLoading || !password.trim() || !confirmPassword.trim()}
                            style={[
                                tw`w-full bg-sky-400 rounded-xl items-center justify-center`,
                                { height: 55 },
                                (isLoading || !password.trim() || !confirmPassword.trim()) && tw`opacity-50`
                            ]}
                        >
                            <Text style={tw`text-xl font-bold text-white text-center`}>
                                {isLoading ? 'Resetting Password...' : 'Reset Password'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
} 