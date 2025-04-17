import { View, Text, Image, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import React, { useRef, useState } from 'react';
import tw from 'twrnc';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function NewPasswordScreen() {
    const router = useRouter();
    const { width } = Dimensions.get('window');
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const [otpValues, setOtpValues] = useState<string[]>(Array(4).fill('')); // Manage OTP values
    const [isOtpComplete, setIsOtpComplete] = useState(false); // Track if OTP is complete
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (text: string, index: number) => {
        const newOtpValues = [...otpValues];
        newOtpValues[index] = text;
        setOtpValues(newOtpValues);

        // Check if OTP is fully entered
        if (newOtpValues.every((value) => value.length === 1)) {
            setIsOtpComplete(true); // Mark OTP as complete
        } else {
            setIsOtpComplete(false); // Mark OTP as incomplete
        }

        // Move focus logic
        if (text.length === 1 && index < 3) {
            inputRefs.current[index + 1]?.focus();
        } else if (text.length === 0 && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleContinue = () => {
        // Clear previous errors
        setValidationError('');
        
        // Validate OTP
        if (!isOtpComplete) {
            setValidationError('Please enter the complete verification code');
            return;
        }
        
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
        
        // Simulate API call
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            router.push('/(auth)');
        }, 1000);
    };

    return (
        <View style={tw`bg-white h-full w-full`}>
            <StatusBar style="light" />
            <Image style={tw`h-full w-full absolute`} source={require('../assets/hospital.png')} />

            {/* Title and Form */}
            <View style={tw`h-full w-full flex justify-center items-center px-8`}>
                {/* Create New Password Title */}
                <View style={tw`w-full flex items-center mb-6`}>
                    <Animated.Text entering={FadeInUp.duration(1000).springify()} style={tw`text-black font-bold tracking-wider text-5xl`}>
                        Create new password
                    </Animated.Text>
                </View>

                {/* Enter Your Code Title */}
                <Text style={tw`text-black text-sm font-bold mb-4 self-start`}>Enter your code</Text>

                {/* OTP Inputs */}
                <View style={[tw`w-full mb-8 flex-row justify-center items-center`, { gap: 10 }]}>
                    {Array(4).fill(null).map((_, index) => (
                        <TextInput
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            maxLength={1}
                            keyboardType="numeric"
                            style={[
                                tw`bg-white border-2 border-gray-400 rounded-lg text-center text-lg`,
                                { width: 50, height: 50 },
                            ]}
                            onChangeText={(text) => handleInputChange(text, index)}
                        />
                    ))}
                    {/* Circular Check Mark */}
                    <View
                        style={[
                            tw`h-6 w-6 rounded-full border-2 justify-center items-center`,
                            { 
                                borderColor: isOtpComplete ? 'green' : 'gray', 
                                backgroundColor: isOtpComplete ? 'green' : 'white' 
                            },
                        ]}
                    >
                        <Text style={[
                            tw`text-white text-sm`,
                            { display: isOtpComplete ? 'flex' : 'none' },
                        ]}>
                            &#10003;
                        </Text>
                    </View>
                </View>

                {/* Password Inputs */}
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
                            disabled={isLoading}
                            style={[
                                tw`w-full bg-sky-400 rounded-xl items-center justify-center`,
                                { height: 55 },
                                isLoading && tw`opacity-50`
                            ]}
                        >
                            <Text style={tw`text-xl font-bold text-white text-center`}>
                                {isLoading ? 'Saving...' : 'Continue'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
} 