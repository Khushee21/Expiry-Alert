import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Header } from './Header';
import ManualForm from '../components/ManualForm';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import CameraOCR from '../components/CameraOCR';

export default function AddItemScreen() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [method, setMethod] = useState('manual');

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    const gradientColors = isDarkMode
        ? ['#444', '#222']
        : ['#FF6F61', '#FFD54F'];

    return (
        <View style={[styles.container, isDarkMode && styles.dark]}>
            <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

            <View style={styles.headingRow}>
                <Text style={[styles.title, isDarkMode && styles.textDark]}>
                    Select Method to Add Item:
                </Text>
                <LottieView
                    source={require('../assets/3.json')}
                    autoPlay
                    loop
                    style={{ width: 90, height: 90, marginLeft: 1 }}
                />
            </View>

            <View style={styles.buttonGroup}>
                {['manual', 'camera', 'scanner'].map((mode, i) => (
                    <TouchableOpacity key={i} onPress={() => setMethod(mode)}>
                        <LinearGradient
                            colors={gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                styles.button,
                                method === mode && styles.selectedButton,
                            ]}
                        >
                            <Text style={styles.buttonText}>
                                {mode === 'manual' && '📋 Manual Form'}
                                {mode === 'camera' && '📷 Camera Scan'}
                                {mode === 'scanner' && '🔍 Barcode Scanner'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.content}>
                {method === 'manual' && <ManualForm isDarkMode={isDarkMode} />}
                {method === 'camera' && <CameraOCR isDarkMode={isDarkMode} />}
                {method === 'scanner' && (
                    <Text style={[styles.text, isDarkMode && styles.textDark]}>
                        🔍 Barcode Scanner will appear here
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    dark: { backgroundColor: '#121212' },

    headingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        marginTop: 20,
        textAlign: 'center',
        color: '#333',
    },
    textDark: {
        color: '#fff',
    },
    text: {
        fontSize: 16,
        marginTop: 10,
        color: '#333',
    },
    buttonGroup: {
        margin: 20,
        justifyContent: 'center',
        alignItems: 'stretch',
        marginTop: 20,
        paddingHorizontal: 10,
    },
    button: {
        margin: 8,
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    selectedButton: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        marginTop: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
