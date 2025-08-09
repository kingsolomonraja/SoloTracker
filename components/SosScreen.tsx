// components/SosScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreService } from '@/services/FirestoreService';

export default function SosScreen() {
  const { user } = useAuth(); // access Firebase user
  const [name, setName] = useState<string>('Student');

  // ✅ Load user name from Firestore on mount
  useEffect(() => {
    const loadUserName = async () => {
      if (!user?.uid) return;
      try {
        const profile = await FirestoreService.getUserProfile(user.uid);
        if (profile?.name) {
          setName(profile.name);
        }
      } catch (e) {
        console.error('Failed to load user name:', e);
      }
    };

    loadUserName();
  }, [user?.uid]);

  const sendSosAlert = async () => {
    try {
      const response = await fetch("https://your-backend-url.onrender.com/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name, // ✅ dynamic user name
        }),
      });

      if (response.ok) {
        Alert.alert("SOS Sent!", "Your mentor has been notified via SMS.");
      } else {
        Alert.alert("Error", "Failed to send SOS. Please try again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not connect to SOS service.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.circleButton} onPress={sendSosAlert}>
        <Text style={styles.buttonText}>Send{'\n'}SOS Alert</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circleButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
  },
});
