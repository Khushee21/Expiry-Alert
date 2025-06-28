import React, { useEffect, useState } from "react";
import {
    View,
    Button,
    Image,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { useCameraPermissions } from "expo-image-picker";
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { initialShelfLifeMap } from "./ProductDrpdown";
import { Picker } from "@react-native-picker/picker";
import { BACKEND_URL } from "../env";

export default function CameraOCR() {
    const [imageUri, setImageUri] = useState(null);
    const [ocrResult, setOcrResult] = useState(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [shelfLifeMap, setShelfLifeMap] = useState(initialShelfLifeMap);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [manualProductName, setManualProductName] = useState("");
    const [estimatedExpDate, setEstimateExpDate] = useState(null);

    const token = useSelector((state) => state.user.accessToken);
    const navigate = useNavigation();

    useEffect(() => {
        if (!token) {
            navigate.navigate('Home');
        }
    }, [token]);

    useEffect(() => {
        if (!permission || !permission.granted) {
            requestPermission();
        }
    }, []);

    const capitalize = str =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    const getFinalProduct = () => {
        const manual = manualProductName.trim();
        return manual !== "" ? capitalize(manual) : selectedProduct;
    };

    const captureImage = async () => {
        if (!permission?.granted) {
            Toast.show({
                type: 'error',
                text1: 'Permission Required',
                text2: "Camera permission is not granted."
            });
            return;
        }

        const product = getFinalProduct();
        if (!product) {
            Toast.show({
                type: 'error',
                text1: 'Product Required',
                text2: 'Please select or enter a product name before capturing.',
            });
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const image = result.assets[0];
            setImageUri(image.uri);

            const formData = new FormData();
            formData.append('image', {
                uri: image.uri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            });

            formData.append('productName', product);

            try {
                const res = await fetch(`${BACKEND_URL}/auth/addItem/ocr`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                setOcrResult(data);

                if (!data.expDate && data.mfgDate) {
                    const shelfDays = shelfLifeMap[product] || 30;

                    if (!shelfLifeMap[product]) {
                        setShelfLifeMap(prev => ({
                            ...prev,
                            [product]: shelfDays
                        }));
                    }

                    const mfg = new Date(data.mfgDate);
                    mfg.setDate(mfg.getDate() + shelfDays);
                    setEstimateExpDate(mfg.toISOString().split("T")[0]);
                } else {
                    setEstimateExpDate(null);
                }

                if (data.success) {
                    Toast.show({
                        type: 'success',
                        text1: 'Item Added!',
                        text2: 'Your item has been added to the list 📩',
                    });
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Failed to add item!',
                    });
                }

            } catch (err) {
                console.log('OCR Camera error :', err);
                Toast.show({
                    type: 'error',
                    text1: 'Failed to add item!',
                });
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Text style={styles.label}>Choose a product:</Text>

                    <Picker
                        selectedValue={selectedProduct}
                        onValueChange={(itemValue) => setSelectedProduct(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="-- Select Product --" value="" />
                        {Object.keys(shelfLifeMap).map((product, index) => (
                            <Picker.Item key={index} label={product} value={product} />
                        ))}
                        <Picker.Item label="Other (Type manually below)" value="" />
                    </Picker>

                    <TextInput
                        placeholder="Enter product name (if not in list)"
                        value={manualProductName}
                        onChangeText={setManualProductName}
                        style={styles.input}
                    />

                    <Button
                        title="Capture Product"
                        onPress={captureImage}
                        disabled={!getFinalProduct()}
                    />

                    {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

                    {ocrResult && (
                        <View style={styles.result}>
                            <Text>📦 Product: {getFinalProduct()}</Text>
                            <Text>📅 MFG Date: {ocrResult.mfgDate}</Text>
                            <Text>📅 EXP Date: {ocrResult.expDate || estimatedExpDate}</Text>
                            {!ocrResult.expDate && estimatedExpDate && (
                                <Text style={{ fontStyle: 'italic', color: 'gray' }}>
                                    (Estimated based on product type)
                                </Text>
                            )}
                        </View>
                    )}
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, justifyContent: 'flex-start' },
    label: { fontWeight: 'bold', marginBottom: 5 },
    picker: { height: 50, width: '100%', marginBottom: 10, backgroundColor: '#FF6F61' },
    input: { borderBottomWidth: 1, marginBottom: 15, padding: 8 },
    image: { width: '100%', height: 300, marginVertical: 20 },
    result: { marginTop: 20 },
});
