import React, { useEffect, useState } from "react";
import { View, Button, Image, Text, StyleSheet, TextInput } from 'react-native';
import { useCameraPermissions } from "expo-image-picker";
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { initialShelfLifeMap } from "./ProductDrpdown";
import { Picker } from "@react-native-picker/picker";

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

    const getFinalProduct = () => {
        return manualProductName.trim() !== "" ? manualProductName.trim() : selectedProduct;
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

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
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

            try {
                const res = await fetch(`${BACKEND_URL}/addItem/ocr`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                setOcrResult(data);

                // Estimate EXP Date if missing
                if (!data.expDate && data.mfgDate) {
                    const product = getFinalProduct();
                    const shelfDays = shelfLifeMap[product] || 30;

                    // Auto add to dropdown
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
                        text2: 'Your Item is added to the list 📩',
                    });
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Failed to add Item!',
                    });
                }

            } catch (err) {
                console.log('OCR Camera error :', err);
                Toast.show({
                    type: 'error',
                    text1: 'Failed to add Item!',
                });
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={{ fontWeight: 'bold' }}>Choose a product: </Text>

            <Picker
                selectedValue={selectedProduct}
                onValueChange={(itemValue) => setSelectedProduct(itemValue)}
                style={{ height: 50, width: '100%', marginBottom: 10 }}
            >
                {Object.keys(shelfLifeMap).map((product, index) => (
                    <Picker.Item key={index} label={product} value={product} />
                ))}
                <Picker.Item label="Other (Type Manually Below)" value="" />
            </Picker>

            <TextInput
                placeholder="Enter product name (if not in list)"
                value={manualProductName}
                onChangeText={setManualProductName}
                style={{ borderBottomWidth: 1, marginBottom: 15 }}
            />

            <Button title="Capture Product" onPress={captureImage} />

            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

            {ocrResult && (
                <View style={styles.result}>
                    <Text>📦 Product: {ocrResult.productName || getFinalProduct()}</Text>
                    <Text>📅 MFG Date: {ocrResult.mfgDate}</Text>
                    <Text>📅 EXP Date: {ocrResult.expDate || estimatedExpDate}</Text>
                    {!ocrResult.expDate && estimatedExpDate && (
                        <Text style={{ fontStyle: 'italic', color: 'gray' }}>
                            (Estimated based on product type)
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    image: { width: '100%', height: 300, marginVertical: 20 },
    result: { marginTop: 20 },
});
