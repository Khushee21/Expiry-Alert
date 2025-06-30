import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
} from "react-native";
import { BACKEND_URL } from "../env";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

const AllItems = () => {
    const token = useSelector((state) => state.user.accessToken);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getAllProducts = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/auth/allItems`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                if (data.success) {
                    setItems(data.data);
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Failed to fetch items",
                    });
                }
            } catch (error) {
                Toast.show({
                    type: "error",
                    text1: "Server Error",
                });
            } finally {
                setLoading(false);
            }
        };

        getAllProducts();
    }, [token]);

    const renderItem = ({ item }) => {
        const expDate = new Date(item.expDate);
        const mfgDate = new Date(item.mfgDate);
        const today = new Date();
        const isExpired = expDate < today;

        return (
            <View style={[styles.card, isExpired ? styles.expired : styles.valid]}>
                <Ionicons
                    name={isExpired ? "alert-circle" : "leaf-outline"}
                    size={24}
                    color={isExpired ? "#ff3b3b" : "#4CAF50"}
                    style={styles.icon}
                />
                <View style={styles.cardContent}>
                    <Text style={styles.productName}>{item.productName}</Text>
                    <Text style={styles.dateText}>📅 MFG: {mfgDate.toDateString()}</Text>
                    <Text style={styles.dateText}>⏳ EXP: {expDate.toDateString()}</Text>
                    <Text style={styles.statusText}>
                        Status: {isExpired ? "Expired ❌" : "Valid ✅"}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>📦 All Your Products</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#FF6F61" style={{ marginTop: 20 }} />
            ) : items.length === 0 ? (
                <Text style={styles.noData}>No products found!</Text>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fefefe",
        padding: 16,
    },
    heading: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#FF6F61",
        textAlign: "center",
    },
    card: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    cardContent: {
        flex: 1,
    },
    productName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 6,
        color: "#333",
    },
    dateText: {
        fontSize: 14,
        color: "#555",
    },
    statusText: {
        marginTop: 6,
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    icon: {
        marginRight: 12,
    },
    expired: {
        borderLeftWidth: 5,
        borderLeftColor: "#ff3b3b",
    },
    valid: {
        borderLeftWidth: 5,
        borderLeftColor: "#4CAF50",
    },
    noData: {
        textAlign: "center",
        fontSize: 16,
        color: "#777",
        marginTop: 40,
    },
});

export default AllItems;
