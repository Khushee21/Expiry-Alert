import React, { useEffect, useState } from "react";
import { View, Button, Image, Text, StyleSheet, Alert } from 'react-native';
import { useCameraPermissions } from "expo-image-picker";
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";


export default function CameraOCR() {

    const [imageUri, setImageUri] = useState(null);
    const [ocrResult, setOrcResult] = useState(null);
    const [permission, requestPermission] = useCameraPermissions();
    const token = useSelector((state) => state.user.accessToken);
    const navigate = useNavigation();

    useEffect(() => {
        if (!token) {
            navigate.navigate('Home');
        }
    }, [token])

    //camera permission
    useEffect(() => {
        if (!permission || !permission.granted) {
            requestPermission();
        }
    }, []);

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
    return (<View style={styles.container}>
        < Button title="Capture Product" onPress={captureImage} />
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
        {ocrResult && (
            <View style={styles.result}>
                <Text>📦 Product: {ocrResult.productName}</Text>
                <Text>📅 MFG Date: {ocrResult.mfgDate}</Text>
                <Text>📅 EXP Date: {ocrResult.expDate}</Text>
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