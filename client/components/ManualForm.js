import React, { useState } from 'react';
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

const ManualForm = () => {
    const [itemName, setItemName] = useState('');
    const [mfgDate, setMfgDate] = useState(new Date());
    const [expDate, setExpDate] = useState(new Date());
    const [showMfgPicker, setShowMfgPicker] = useState(false);
    const [showExpPicker, setShowExpPicker] = useState(false);

    const handleSubmit = () => {
        console.log("Item Name:", itemName);
        console.log("MFG Date:", mfgDate.toDateString());
        console.log("EXP Date:", expDate.toDateString());
        // handle backend call here
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled">

                <Text style={styles.label}>Item Name</Text>
                <TextInput
                    style={styles.input}
                    value={itemName}
                    onChangeText={setItemName}
                    placeholder="e.g. Milk, Bread, etc."
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>Manufacturing Date</Text>
                <TouchableOpacity
                    onPress={() => setShowMfgPicker(true)}
                    style={styles.dateInput}
                >
                    <Ionicons name="calendar-outline" size={20} color="#666" style={{ marginRight: 8 }} />
                    <Text style={styles.dateText}>{mfgDate.toDateString()}</Text>
                </TouchableOpacity>
                {showMfgPicker && (
                    <DateTimePicker
                        value={mfgDate}
                        mode="date"
                        display="default"
                        onChange={(e, selectedDate) => {
                            setShowMfgPicker(Platform.OS === 'ios');
                            if (selectedDate) setMfgDate(selectedDate);
                        }}
                    />
                )}

                <Text style={styles.label}>Expiry Date</Text>
                <TouchableOpacity
                    onPress={() => setShowExpPicker(true)}
                    style={styles.dateInput}
                >
                    <Ionicons name="calendar-outline" size={20} color="#666" style={{ marginRight: 8 }} />
                    <Text style={styles.dateText}>{expDate.toDateString()}</Text>
                </TouchableOpacity>
                {showExpPicker && (
                    <DateTimePicker
                        value={expDate}
                        mode="date"
                        display="default"
                        onChange={(e, selectedDate) => {
                            setShowExpPicker(Platform.OS === 'ios');
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
    heading: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 15,
        color: '#FF6F61',
        textAlign: 'center',
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
