import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Modal,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser } from '../store/UserSlice';
import { BACKEND_URL } from '../env';
import Toast from 'react-native-toast-message';

export default function HomeScreen({ navigation }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const dispatch = useDispatch();
    const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
    const [otp, setOtp] = useState('');
    const inputsRef = useRef([]);
    const [otpSent, setOtpSent] = useState(false);

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otpArray];
        newOtp[index] = value;
        setOtpArray(newOtp);
        setOtp(newOtp.join(''));
        if (value && index < 5) inputsRef.current[index + 1]?.focus();
    };

    const handleBackSpace = (index, e) => {
        if (e.nativeEvent.key === 'Backspace' && !otpArray[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const requestOtp = async () => {
        if (!email) {
            Toast.show({ type: 'error', text1: 'Please enter Email' });
            return;
        }
        // console.log(email);
        try {
            const res = await fetch(`${BACKEND_URL}/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                Toast.show({
                    type: 'success',
                    text1: 'OTP Sent!',
                    text2: 'OTP has been sent to your email 📩',
                });
                setOtpSent(true);
            } else {
                Toast.show({ type: 'error', text1: 'Failed to send OTP!' });
            }
        } catch (error) {
            console.log(error);
            Toast.show({ type: 'error', text1: 'OTP Request Error' });
        }
    };

    const handleSignIn = async () => {
        // console.log(email);
        if (!email || !password) {
            Toast.show({ type: 'error', text1: 'Please enter Email and Password!' });
            return;
        }
        try {
            const response = await fetch(`${BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            //console.log("🟩 Login response:", data);
            if (response.ok && data.success) {
                if (!refreshToken) {
                    Toast.show({
                        type: 'error',
                        text1: 'error ',
                    });
                }
                const { accessToken, refreshToken, user } = data.data || {};
                //const { user, accessToken, refreshToken } = data;
                if (!refreshToken) console.log('referesh tkn')
                dispatch(setUser({ user, accessToken }));
                await AsyncStorage.setItem('refreshToken', refreshToken);
                Toast.show({ type: 'success', text1: 'Sign in successful!' });
                setModalVisible(false);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Sign in failed!',
                    text2: data?.message || 'Invalid credentials',
                });
            }
        } catch (error) {
            // console.error("🟥 Sign-in error:", error);
            Toast.show({
                type: 'error',
                text1: 'Sign in error!',
                text2: error.message,
            });
        }
    };


    const handleSignUp = async () => {
        if (otp.length !== 6) {
            Toast.show({ type: 'error', text1: 'Enter a valid 6-digit OTP!' });
            return;
        }
        if (!email || !password || !confirmPass) {
            Toast.show({ type: 'error', text1: 'Please fill all fields!' });
            return;
        }
        if (password !== confirmPass) {
            Toast.show({ type: 'error', text1: 'Passwords do not match!' });
            return;
        }
        try {
            const response = await fetch(`${BACKEND_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, code: otp }),
            });
            const data = await response.json();
            if (data.success) {
                Toast.show({ type: 'success', text1: 'Sign up successful!' });
                setModalVisible(false);
            } else {
                Toast.show({ type: 'error', text1: 'Sign up failed!' });
            }
            setEmail('');
            setPassword('');
            setConfirmPass('');
            setOtp('');
            setOtpArray(['', '', '', '', '', '']);
            setOtpSent(false);
        } catch (error) {
            console.log("Signup error", error);
            Toast.show({ type: 'error', text1: 'Sign up error!' });
        }
    };

    return (
        <ImageBackground
            source={{ uri: 'https://i.pinimg.com/736x/db/8b/52/db8b52840df082f9b3a6dbd9cc886069.jpg' }}
            style={styles.background}
        >
            <View style={styles.overlay}>
                <Text style={styles.title}>🛒 Expiry Alert</Text>
                <Text style={styles.subtitle}>Track your groceries before they expire</Text>

                <LottieView
                    source={require('../assets/glocry.json')}
                    autoPlay
                    loop
                    style={styles.lottie}
                />

                <Text style={styles.caption}>Start managing your kitchen smartly 🍅</Text>

                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.buttonWrapper}>
                    <LinearGradient colors={['#FF6F61', '#FFD54F']} style={styles.button}>
                        <Text style={styles.buttonText}>Let's Start</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={styles.signupText}>
                        Don&apos;t have an account?
                        <Text style={{ fontWeight: 'bold', color: '#FFD54F' }}> Sign up</Text>
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={modalVisible}
                animationType='slide'
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{isSignup ? "Create Account" : "Welcome Back!"}</Text>
                        <TextInput
                            placeholder='Email'
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            placeholderTextColor="#999"
                        />
                        <TextInput
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                            placeholderTextColor="#999"
                        />
                        {isSignup && (
                            <>
                                <TextInput
                                    placeholder="Confirm Password"
                                    value={confirmPass}
                                    onChangeText={setConfirmPass}
                                    secureTextEntry
                                    style={styles.input}
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity
                                    onPress={requestOtp}
                                    style={[styles.authButton, { backgroundColor: '#FFD54F' }]}
                                >
                                    <Text style={[styles.authButtonText, { color: '#000' }]}>Send OTP</Text>
                                </TouchableOpacity>

                                {otpSent && (
                                    <View style={{ flexDirection: 'row', gap: 5 }}>
                                        {[...Array(6)].map((_, index) => (
                                            <TextInput
                                                key={index}
                                                ref={(el) => (inputsRef.current[index] = el)}
                                                value={otpArray[index]}
                                                onChangeText={(value) => handleOtpChange(index, value)}
                                                onKeyPress={(e) => handleBackSpace(index, e)}
                                                keyboardType="numeric"
                                                style={[styles.input, { width: 35, textAlign: 'center' }]}
                                                maxLength={1}
                                            />
                                        ))}
                                    </View>
                                )}
                            </>
                        )}

                        <Pressable onPress={isSignup ? handleSignUp : handleSignIn}>
                            <LinearGradient colors={['#FF6F61', '#FFD54F']} style={styles.authButton}>
                                <Text style={styles.authButtonText}>
                                    {isSignup ? 'SIGN UP' : 'SIGN IN'}
                                </Text>
                            </LinearGradient>
                        </Pressable>

                        <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
                            <Text style={styles.switchText}>
                                {isSignup ? 'Already have an account? Sign In' : 'New user? Sign Up'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeText}>✖ Close</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ImageBackground>
    );
}
const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    title: {
        fontSize: 38,
        color: '#FFD54F',
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 18,
        color: '#CCCCCC',
        fontWeight: 'bold',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    lottie: {
        width: 280,
        height: 280,
        marginBottom: 25,
    },
    caption: {
        color: '#EAEAEA',
        fontSize: 18,
        marginBottom: 25,
        fontWeight: 'bold',
    },
    buttonWrapper: {
        width: '80%',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 8,
    },
    button: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 1,
    },
    signupText: {
        marginTop: 20,
        color: '#DDDDDD',
        fontSize: 14,
    },
    // MODAL STYLES
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 30,
        width: '85%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '100%',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        marginBottom: 15,
        paddingVertical: 8,
        fontSize: 16,
        color: '#333',
    },
    authButton: {
        paddingVertical: 12,
        paddingHorizontal: 50,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    authButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    switchText: {
        color: '#5B86E5',
        marginTop: 10,
        fontSize: 14,
    },
    closeText: {
        color: '#999',
        marginTop: 15,
        fontSize: 14,
    },
});
