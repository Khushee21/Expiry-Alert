import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Switch,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { logout } from '../store/UserSlice';

export const Header = ({ isDarkMode = false, toggleTheme = () => { } }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [menuVisible, setMenuVisible] = useState(false);

    const handleLogOut = () => {
        dispatch(logout());
        setMenuVisible(false);
    };

    return (
        <>
            <View style={[styles.header, isDarkMode && styles.headerDark]}>
                <Text style={styles.logo}>Expiry Alert</Text>
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                    <Icon name="menu-outline" size={28} color="white" />
                </TouchableOpacity>
            </View>

            <Modal visible={menuVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.menu, isDarkMode && styles.menuDark]}>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setMenuVisible(false)}>
                            <Icon name="close-circle-outline" size={28} color="#FF6F61" />
                        </TouchableOpacity>

                        <MenuItem
                            label="Add Items"
                            icon="add-circle-outline"
                            onPress={() => { navigation.navigate('AddItem'); setMenuVisible(false); }}
                            isDarkMode={isDarkMode}
                        />
                        <MenuItem
                            label="All Items"
                            icon="list-outline"
                            onPress={() => { navigation.navigate('AllItems'); setMenuVisible(false); }}
                            isDarkMode={isDarkMode}
                        />
                        <MenuItem
                            label="Notifications"
                            icon="notifications-outline"
                            onPress={() => { navigation.navigate('Notifications'); setMenuVisible(false); }}
                            isDarkMode={isDarkMode}
                        />
                        <MenuItem
                            label="Profile"
                            icon="person-outline"
                            onPress={() => { navigation.navigate('Profile'); setMenuVisible(false); }}
                            isDarkMode={isDarkMode}
                        />
                        <MenuItem
                            label="About"
                            icon="information-circle-outline"
                            onPress={() => { navigation.navigate('About'); setMenuVisible(false); }}
                            isDarkMode={isDarkMode}
                        />

                        <View style={styles.toggleRow}>
                            <Text style={[styles.menuLabel, isDarkMode && styles.textLight]}>Dark Mode</Text>
                            <Switch value={isDarkMode} onValueChange={toggleTheme} />
                        </View>

                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogOut}>
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const MenuItem = ({ label, icon, onPress, isDarkMode }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <Icon name={icon} size={20} color="#FF6F61" />
        <Text style={[styles.menuLabel, isDarkMode && styles.textLight]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#FF6F61',
        paddingVertical: 12,
        paddingHorizontal: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 4,
    },
    headerDark: {
        backgroundColor: '#333',
    },
    logo: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 22,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    menu: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    menuDark: {
        backgroundColor: '#1e1e1e',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    menuLabel: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    textLight: {
        color: '#fefefe',
    },
    closeBtn: {
        alignSelf: 'flex-end',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
    },
    logoutBtn: {
        backgroundColor: '#FF6F61',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
