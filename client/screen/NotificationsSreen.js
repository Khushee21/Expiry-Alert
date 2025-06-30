import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    useColorScheme,
} from 'react-native';
import { useSelector } from 'react-redux';
import { BACKEND_URL } from '../env';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const Notification = () => {
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const prevCountRef = useRef(0);
    const token = useSelector((state) => state.user.accessToken);
    const theme = useColorScheme(); // 'dark' or 'light'
    const isDark = theme === 'dark';

    const fetchNotification = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/auth/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                const reversed = data.notifications.reverse();
                if (prevCountRef.current && reversed.length > prevCountRef.current) {
                    Toast.show({
                        type: 'info',
                        text1: '🔔 New Notification',
                        text2: reversed[0].message
                    });
                }
                prevCountRef.current = reversed.length;
                setNotifications(reversed);
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
        const interval = setInterval(fetchNotification, 3000);
        return () => clearInterval(interval);
    }, []);

    const renderItem = ({ item }) => (
        <View style={[
            styles.card,
            item.type === 'expired' ? styles.expired : styles.reminder,
            isDark && styles.cardDark
        ]}>
            <Ionicons
                name={item.type === 'expired' ? "alert-circle" : "time-outline"}
                size={20}
                color={item.type === 'expired' ? "#ff3b3b" : "#ffaa00"}
                style={{ marginRight: 10 }}
            />
            <View>
                <Text style={[styles.message, isDark && styles.textLight]}>
                    {item.message}
                </Text>
                <Text style={[styles.date, isDark && styles.textLight]}>
                    {new Date(item.date).toDateString()}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <Text style={[styles.heading, isDark && styles.headingDark]}>
                🔔 Notifications
            </Text>
            {loading ? (
                <ActivityIndicator size="large" color="#FF6F61" style={{ marginTop: 20 }} />
            ) : notifications.length === 0 ? (
                <Text style={[styles.noData, isDark && styles.textLight]}>
                    No notifications yet!
                </Text>
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
    containerDark: {
        backgroundColor: "#121212",
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#FF6F61',
    },
    headingDark: {
        color: '#FFD54F',
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
    cardDark: {
        backgroundColor: '#1f1f1f',
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
    textLight: {
        color: '#eee',
    },
    noData: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
        fontSize: 16,
    },
});

export default Notification;
