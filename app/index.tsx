// app/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button, Portal, Dialog } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo';
import { makeRedirectUri } from 'expo-auth-session';
import { useAuthContext } from '@/contexts/AuthContext';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // For missing fields flow
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [missingValues, setMissingValues] = useState<Record<string, string>>({});
  const [pendingSignUpObj, setPendingSignUpObj] = useState<any>(null);
  const [showMissingDialog, setShowMissingDialog] = useState(false);

  const { signInEmailPassword } = useAuthContext();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const handleEmailSignIn = async () => {
    setLoading(true);
    try {
      await signInEmailPassword(email, password);
      router.replace('/biometric');
    } catch (err: any) {
      Alert.alert('Sign-in Failed', err?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const randomPassword = (len = 16) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    let out = '';
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const redirectUri = makeRedirectUri({
  scheme: "studentpunch" // your app.json scheme
});

      console.log('Using redirectUri:', redirectUri);

      const result: any = await startOAuthFlow({ redirectUrl: redirectUri });
      console.log('startOAuthFlow result:', result);

      const { createdSessionId, setActive, signUp } = result || {};

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace('/biometric');
        return;
      }

      // If signup exists but missing required fields, prompt user
      if (signUp && signUp.status === 'missing_requirements') {
        const fields = signUp.missingFields || signUp.requiredFields || [];
        setMissingFields(fields);
        setPendingSignUpObj({ signUp, setActive });
        // init missingValues with empty strings
        const init: Record<string, string> = {};
        (fields || []).forEach((f: string) => {
          init[f] = '';
        });
        setMissingValues(init);
        setShowMissingDialog(true);
        return;
      }

      Alert.alert('Error', 'Google Sign-in failed: missing session data.');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      Alert.alert('Google Sign-In Failed', err?.message || JSON.stringify(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const updateMissingValue = (key: string, value: string) => {
    setMissingValues((p) => ({ ...p, [key]: value }));
  };

  const finishSignUpWithMissingFields = async () => {
    if (!pendingSignUpObj) {
      Alert.alert('Error', 'No pending sign-up to complete.');
      return;
    }
    setGoogleLoading(true);
    try {
      const { signUp, setActive } = pendingSignUpObj;
      const payload: Record<string, any> = {};

      // include only provided fields
      missingFields.forEach((f) => {
        const v = (missingValues[f] || '').trim();
        if (v) payload[f] = v;
      });

      // if password is required but user didn't type one, generate a random strong password
      const requiresPassword =
        (signUp.requiredFields && signUp.requiredFields.includes('password')) ||
        (signUp.missingFields && signUp.missingFields.includes('password'));

      if (requiresPassword && !payload.password) {
        payload.password = randomPassword(20);
      }

      // Try updating the signUp with the provided payload
      if (typeof signUp.update === 'function') {
        await signUp.update(payload);
      }

      // Attempt to finalize/create the sign up (some Clerk flows may need create)
      if (typeof signUp.create === 'function') {
        await signUp.create();
      }

      // After update/create, try to get createdSessionId from signUp
      const createdSessionId = signUp.createdSessionId || (signUp?.createdSessionId === '' ? null : signUp.createdSessionId);

      // If the SDK returned a session, activate it
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        setShowMissingDialog(false);
        router.replace('/biometric');
        return;
      }

      // As a fallback, ask user to try again or check dashboard settings
      Alert.alert(
        'Signup incomplete',
        'We updated your account details but could not automatically sign you in. Please try signing in again or contact support.'
      );
    } catch (err: any) {
      console.error('finishSignUpWithMissingFields error:', err);
      Alert.alert('Error', err?.message || JSON.stringify(err));
    } finally {
      setGoogleLoading(false);
      setShowMissingDialog(false);
      setPendingSignUpObj(null);
      setMissingFields([]);
      setMissingValues({});
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Student Check-In</Text>
        <Text style={styles.subtitle}>Welcome back! Please sign in to continue.</Text>

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
          onPress={handleEmailSignIn}
          loading={loading}
          disabled={loading || googleLoading}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          Sign In
        </Button>

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
      </View>

      {/* Missing fields dialog */}
      <Portal>
        <Dialog visible={showMissingDialog} onDismiss={() => setShowMissingDialog(false)}>
          <Dialog.Title>More details required</Dialog.Title>
          <Dialog.Content>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              {missingFields.map((field) => (
                <TextInput
                  key={field}
                  label={field.replace('_', ' ')}
                  value={missingValues[field] || ''}
                  onChangeText={(text) => updateMissingValue(field, text)}
                  style={{ marginBottom: 12 }}
                  mode="outlined"
                  autoCapitalize="none"
                />
              ))}
            </KeyboardAvoidingView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowMissingDialog(false)}>Cancel</Button>
            <Button onPress={finishSignUpWithMissingFields} loading={googleLoading}>
              Continue
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 48 },
  input: { backgroundColor: '#fff' },
  button: { marginTop: 16, borderColor: '#000', borderWidth: 2 },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '600' },
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
