import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useThemeContext } from "@/contexts/ThemeContext"



export default function SettingsScreen() {
  const { isDark, setIsDark } = useThemeContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationAccess, setLocationAccess] = useState(true);
  const [autoCheckIn, setAutoCheckIn] = useState(false);

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'This feature is coming soon!');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => console.log('User logged out') },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
      <Text style={[styles.header, { color: isDark ? "#fff" : "#000" }]}>Settings</Text>

      <View style={styles.item}>
        <Text style={[styles.label, { color: isDark ? "#ddd" : "#333" }]}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={setIsDark} />
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Location Access</Text>
        <Switch
          value={locationAccess}
          onValueChange={setLocationAccess}
        />
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Auto Check-In</Text>
        <Switch
          value={autoCheckIn}
          onValueChange={setAutoCheckIn}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={[styles.buttonText, { color: '#fff' }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, color: '#000' },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  label: { fontSize: 18, color: '#333' },
  button: {
    backgroundColor: '#eee',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#d9534f',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
});
