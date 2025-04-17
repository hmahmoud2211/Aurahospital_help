import { View, Text, Image, TextInput, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState } from 'react'
import tw from 'twrnc';
import { StatusBar } from 'expo-status-bar'
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function MobileNumberScreen() {
    const router = useRouter();
    const {width} = Dimensions.get('window');
    const [mobileNumber, setMobileNumber] = useState('');
    const [validationError, setValidationError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleContinue = () => {
        // Clear previous errors
        setValidationError('');
        
        // Validate mobile number
        if (!mobileNumber.trim()) {
            setValidationError('Mobile number is required');
            return;
        }
        
        // Basic validation for mobile number format
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        if (!phoneRegex.test(mobileNumber.replace(/\s+/g, ''))) {
            setValidationError('Please enter a valid mobile number');
            return;
        }
        
        // Simulate API call
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            router.push('/new-password');
        }, 1000);
    };
    
    return (
        <View style={tw`bg-white h-full w-full`}>
            <StatusBar style="light" />
            <Image 
                style={tw`h-full w-full absolute`} 
                source={require('../assets/hospital.png')} 
            />

            {/* title and form */}
            <View style={tw`h-full w-full flex justify-center items-center px-8`}> 
                {/* Title */}
                <View style={tw`w-full flex items-center mb-10`}>
                    <Animated.Text entering={FadeInUp.duration(1000).springify()} style={tw`text-black font-bold tracking-wider text-5xl`}>
                        Enter your mobile number
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
                            onPress={handleContinue}
                            disabled={isLoading || !mobileNumber.trim()}
                            style={[
                                tw`w-full bg-sky-400 rounded-xl items-center justify-center`,
                                { height: 55 },
                                (isLoading || !mobileNumber.trim()) && tw`opacity-50`
                            ]}>
                            <Text style={tw`text-xl font-bold text-white text-center`}>
                                {isLoading ? 'Sending code...' : 'Continue'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={tw`flex-row justify-center items-center space-x-2`}>
                        <Text style={tw`text-base`}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)')}>
                            <Text style={tw`text-sky-600 font-semibold text-base`}>Login</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
} 