import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';
import { useAuthContext } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const { signInEmailPassword, signUpEmailPassword, signInWithGoogle } = useAuthContext();

  const safeErrorMessage = (err: any) => {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUpEmailPassword(email, password);
      } else {
        await signInEmailPassword(email, password);
      }
      router.replace('/biometric');
    } catch (err: any) {
      Alert.alert(isSignUp ? 'Sign-up Failed' : 'Sign-in Failed', safeErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/biometric');
    } catch (err: any) {
      Alert.alert('Google Sign-In Failed', safeErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>Student Check-In</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create your account to get started' : 'Welcome back! Please sign in to continue.'}
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />

        <Button
          mode="outlined"
          onPress={handleEmailAuth}
          loading={loading}
          disabled={loading || googleLoading}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>

        <TouchableOpacity 
          onPress={() => setIsSignUp(!isSignUp)}
          disabled={loading || googleLoading}
        >
          <Text style={styles.switchText}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, googleLoading && styles.disabledButton]}
          onPress={handleGoogleSignIn}
          disabled={loading || googleLoading}
        >
          <Mail size={20} color="#000000" />
          <Text style={styles.googleButtonText}>
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 48 },
  input: { backgroundColor: '#fff', marginBottom: 16 },
  button: { marginTop: 16, borderColor: '#000', borderWidth: 2 },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '600' },
  switchText: { 
    textAlign: 'center', 
    color: '#007bff', 
    marginTop: 16, 
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divider: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  dividerText: { marginHorizontal: 16, color: '#666', fontSize: 14 },
  googleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#000', borderRadius: 4,
    paddingVertical: 12, paddingHorizontal: 16, gap: 12,
  },
  disabledButton: { opacity: 0.6 },
  googleButtonText: { color: '#000', fontSize: 16, fontWeight: '600' },
});