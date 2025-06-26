import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Header } from './Header';
import ManualForm from '../components/ManualForm';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

export default function AddItemScreen() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [method, setMethod] = useState('manual'); // 'manual' | 'camera' | 'scanner'

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <View style={[styles.container, isDarkMode && styles.dark]}>
            <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 5 }}>
                <Text style={[styles.title, isDarkMode && styles.textDark]}>
                    Select Method to Add Item:
                </Text>
                <LottieView
                    source={require('../assets/3.json')}  // your JSON file path
                    autoPlay
                    loop
                    style={{ width: 90, height: 90, marginLeft: 1 }}
                />
            </View>


            <View style={styles.buttonGroup}>
                <TouchableOpacity
                    // style={[
                    //     styles.button,
                    //     method === 'manual' && styles.selectedButton,
                    // ]}
                    onPress={() => setMethod('manual')}
                >
                    <LinearGradient
                        colors={['#FF6F61', '#FFD54F']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.button,
                            method === 'manual' && styles.selectedButton,
                        ]}
                    >
                        <Text style={styles.buttonText}>Manual Form📋</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setMethod('camera')}
                >
                    <LinearGradient
                        colors={['#FF6F61', '#FFD54F']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.button,
                            method === 'manual' && styles.selectedButton,
                        ]}
                    >
                        <Text style={styles.buttonText}>Camera Scan📷</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setMethod('scanner')}
                >
                    <LinearGradient
                        colors={['#FF6F61', '#FFD54F']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.button,
                            method === 'manual' && styles.selectedButton,
                        ]}
                    > <Text style={styles.buttonText}>Barcode Scanner🔍</Text></LinearGradient>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {method === 'manual' && <ManualForm />}
                {method === 'camera' && <Text>📷 Camera OCR will appear here</Text>}
                {method === 'scanner' && <Text>🔍 Barcode Scanner will appear here</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    dark: { backgroundColor: '#222' },
    title: {
        fontSize: 22,
        fontWeight: '600',
        marginTop: 20,
        textAlign: 'center',
    },
    textDark: {
        color: 'white',
    },
    buttonGroup: {
        flexDirection: 'col',
        margin: 20,
        justifyContent: 'center',
        alignItems: 'stretch',
        marginTop: 20,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: '#FF6F61',
        margin: 8,
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    selectedButton: {
        backgroundColor: '#FFD54F',
        color: 'black',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
    content: {
        flex: 1,
        marginTop: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
