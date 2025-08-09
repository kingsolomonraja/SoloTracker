import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, LogOut, Mail } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          }
        }
      ]
    );
  };

  return (
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
            <Text style={styles.userName}>Student User</Text>
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
    </SafeAreaView>
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
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
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