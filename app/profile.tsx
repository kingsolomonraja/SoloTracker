// components/ProfileScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Button,
  Dialog,
  Portal,
  TextInput,
  Provider as PaperProvider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, LogOut, Mail } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { FirestoreService } from '@/services/FirestoreService';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState('Student User');
  const [showPrompt, setShowPrompt] = useState(false);
  const [tempName, setTempName] = useState('');

  // ✅ Load user's name from Firestore on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      try {
        const profile = await FirestoreService.getUserProfile(user.uid);
        if (profile?.name) {
          setName(profile.name);
        }
      } catch (e) {
        console.error('Failed to load user profile:', e);
      }
    };

    fetchUserProfile();
  }, [user?.uid]);

  // ✅ Prompt handling
  const openNamePrompt = () => {
    setTempName(name);
    setShowPrompt(true);
  };

  const confirmName = async () => {
    try {
      const trimmed = tempName.trim();
      if (trimmed) {
        setName(trimmed);
        if (user?.uid) {
          await FirestoreService.saveUserProfile(user.uid, {
            name: trimmed,
            email: user?.email || '',
          });
        }
      }
    } catch (e) {
      console.error('Failed to save user name:', e);
    } finally {
      setShowPrompt(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>
              Manage your account and app preferences
            </Text>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <User size={80} color="#000000" />
            </View>

            <View style={styles.userInfo}>
              <TouchableOpacity onPress={openNamePrompt}>
                <Text style={styles.userName}>{name}</Text>
              </TouchableOpacity>
              <View style={styles.emailContainer}>
                <Mail size={16} color="#666666" />
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Account Actions</Text>

            <Button
              mode="outlined"
              onPress={handleSignOut}
              style={styles.signOutButton}
              labelStyle={styles.signOutButtonText}
              icon={() => <LogOut size={16} color="#000000" />}
            >
              Sign Out
            </Button>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>App Information</Text>
            <Text style={styles.infoText}>
              • Version: 1.0.0{'\n'}
              • Built with React Native & Expo{'\n'}
              • Secure biometric authentication{'\n'}
              • GPS location tracking{'\n'}
              • Firebase cloud storage
            </Text>
          </View>
        </View>

        {/* 🔧 Name Update Dialog */}
        <Portal>
          <Dialog visible={showPrompt} onDismiss={() => setShowPrompt(false)}>
            <Dialog.Title>Enter Your Name</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Name"
                value={tempName}
                onChangeText={setTempName}
                mode="outlined"
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowPrompt(false)}>Cancel</Button>
              <Button onPress={confirmName}>Save</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 6,
  },
  actionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  signOutButton: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  signOutButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 'auto',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});
