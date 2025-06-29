import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ScrollView,
    KeyboardAvoidingView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from '../env';

const ManualForm = () => {
    const [productName, setProductName] = useState('');
    const [mfgDate, setMfgDate] = useState(new Date());
    const [expDate, setExpDate] = useState(new Date());
    const [showMfgPicker, setShowMfgPicker] = useState(false);
    const [showExpPicker, setShowExpPicker] = useState(false);
    const token = useSelector((state) => state.user.accessToken);
    const navigate = useNavigation();

    useEffect(() => {
        if (!token) {
            navigate.navigate('Home');
        }
    }, [token]);

    const handleSubmit = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/auth/addItem/manual`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productName,
                    mfgDate,
                    expDate,
                }),
            });

            const data = await res.json();

            console.log("Item Name:", productName);
            console.log("MFG Date:", mfgDate.toDateString());
            console.log("EXP Date:", expDate.toDateString());

            if (data.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Item Added!',
                    text2: 'Your item has been added to the list 📩',
                });
                setProductName('');
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Failed to add item!',
                });
            }
        } catch (err) {
            console.log('Error submitting data manually:', err);
            Toast.show({
                type: 'error',
                text1: 'Failed to add item!',
            });
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.label}>Product Name</Text>
                <TextInput
                    style={styles.input}
                    value={productName}
                    onChangeText={setProductName}
                    placeholder="e.g. Milk, Bread, etc."
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>Manufacturing Date</Text>
                <TouchableOpacity onPress={() => setShowMfgPicker(true)} style={styles.dateInput}>
                    <Ionicons name="calendar-outline" size={20} color="#666" style={{ marginRight: 8 }} />
                    <Text style={styles.dateText}>{mfgDate.toDateString()}</Text>
                </TouchableOpacity>
                {showMfgPicker && (
                    <DateTimePicker
                        value={mfgDate}
                        mode="date"
                        display="default"
                        onChange={(e, selectedDate) => {
                            setShowMfgPicker(false);
                            if (selectedDate) setMfgDate(selectedDate);
                        }}
                    />
                )}

                <Text style={styles.label}>Expiry Date</Text>
                <TouchableOpacity onPress={() => setShowExpPicker(true)} style={styles.dateInput}>
                    <Ionicons name="calendar-outline" size={20} color="#666" style={{ marginRight: 8 }} />
                    <Text style={styles.dateText}>{expDate.toDateString()}</Text>
                </TouchableOpacity>
                {showExpPicker && (
                    <DateTimePicker
                        value={expDate}
                        mode="date"
                        display="default"
                        onChange={(e, selectedDate) => {
                            setShowExpPicker(false);
                            if (selectedDate) setExpDate(selectedDate);
                        }}
                    />
                )}

                <TouchableOpacity onPress={handleSubmit}>
                    <LinearGradient
                        colors={['#FF6F61', '#FFD54F']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>➕ Add Item</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        marginTop: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 6,
        marginHorizontal: 10,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 15,
        marginTop: 10,
        marginBottom: 6,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 10,
        fontSize: 16,
        marginBottom: 12,
        color: '#333',
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    button: {
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonText: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
    },
});

export default ManualForm;
