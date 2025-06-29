import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { useSelector } from 'react-redux';
import { BACKEND_URL } from '../env';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const Notification = () => {
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const token = useSelector((state) => state.user.accessToken);

    const fetchNotification = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/auth/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications.reverse());
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Failed to fetch notifications'
                });
            }
        } catch (err) {
            console.log("🔴 Error fetching notifications:", err);
            Toast.show({
                type: 'error',
                text1: 'Server Error',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotification();
    }, []);

    const renderItem = ({ item }) => (
        <View style={[styles.card, item.type === 'expired' ? styles.expired : styles.reminder]}>
            <Ionicons
                name={item.type === 'expired' ? "alert-circle" : "time-outline"}
                size={20}
                color={item.type === 'expired' ? "#ff3b3b" : "#ffaa00"}
                style={{ marginRight: 10 }}
            />
            <View>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>🔔 Notifications</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#FF6F61" style={{ marginTop: 20 }} />
            ) : notifications.length === 0 ? (
                <Text style={styles.noData}>No notifications yet!</Text>
            ) : (
                <FlatList
                    data={notifications}
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
        backgroundColor: "#fff",
        padding: 16,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#FF6F61',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    expired: {
        borderLeftWidth: 5,
        borderLeftColor: '#ff3b3b',
    },
    reminder: {
        borderLeftWidth: 5,
        borderLeftColor: '#ffaa00',
    },
    message: {
        fontSize: 15,
        color: '#333',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#777',
    },
    noData: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
        fontSize: 16,
    },
});

export default Notification;
