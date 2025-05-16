import { View, Text, Image, TextInput, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import tw from 'twrnc';
import { StatusBar } from 'expo-status-bar'
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
    const navigation = useNavigation();
    const {width} = Dimensions.get('window');
    
    return (
        <View style={tw`bg-white h-full w-full`}>
            <StatusBar style="light" />
            <Image style={tw`h-full w-full absolute`} source={require('./assets/hospital.png')} />

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
                    <Animated.View entering={FadeInDown.duration(1000).springify()} 
                        style={[
                            tw`bg-white/80 rounded-2xl w-full mb-4 overflow-hidden`,
                            { height: 60 }
                        ]}>
                        <TextInput 
                            placeholder='Email or Username' 
                            placeholderTextColor={'gray'} 
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
                            secureTextEntry
                            style={[
                                tw`text-lg px-5`,
                                { height: '100%' }
                            ]}
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={tw`w-full mb-6`}>
                        <TouchableOpacity onPress={() => navigation.push('NewPassword')}
                            style={[
                                tw`w-full bg-sky-400 rounded-xl items-center justify-center`,
                                { height: 55 }
                            ]}>
                            <Text style={tw`text-xl font-bold text-white text-center`}>
                                Continue
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                </View>
            </View>
        </View>
    );
}
