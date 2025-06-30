import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    Switch,
} from "react-native";
import { BACKEND_URL } from "../env";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

const AllItems = () => {
    const token = useSelector((state) => state.user.accessToken);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

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
            <View style={[
                styles.card,
                isExpired ? styles.expired : styles.valid,
                isDarkMode && styles.cardDark
            ]}>
                <Ionicons
                    name={isExpired ? "alert-circle" : "leaf-outline"}
                    size={24}
                    color={isExpired ? "#ff3b3b" : "#4CAF50"}
                    style={styles.icon}
                />
                <View style={styles.cardContent}>
                    <Text style={[styles.productName, isDarkMode && styles.textWhite]}>
                        {item.productName}
                    </Text>
                    <Text style={[styles.dateText, isDarkMode && styles.textGray]}>
                        📅 MFG: {mfgDate.toDateString()}
                    </Text>
                    <Text style={[styles.dateText, isDarkMode && styles.textGray]}>
                        ⏳ EXP: {expDate.toDateString()}
                    </Text>
                    <Text style={[styles.statusText, isDarkMode && styles.textGray]}>
                        Status: {isExpired ? "Expired ❌" : "Valid ✅"}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <View style={styles.headerRow}>
                <Text style={[styles.heading, isDarkMode && styles.textWhite]}>
                    📦 All Your Products
                </Text>
                <Switch
                    value={isDarkMode}
                    onValueChange={() => setIsDarkMode(!isDarkMode)}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FF6F61" style={{ marginTop: 20 }} />
            ) : items.length === 0 ? (
                <Text style={[styles.noData, isDarkMode && styles.textGray]}>No products found!</Text>
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
    darkContainer: {
        backgroundColor: "#121212",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    heading: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FF6F61",
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
    cardDark: {
        backgroundColor: "#1e1e1e",
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
    textWhite: {
        color: "#fff",
    },
    textGray: {
        color: "#ccc",
    },
});

export default AllItems;
