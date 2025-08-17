// app/index.tsx
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
import { TextInput, Button, Portal, Dialog } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { useAuthContext } from '@/contexts/AuthContext';

WebBrowser.maybeCompleteAuthSession();

/**
 * Debug helper: wrap global.fetch to log any non-JSON responses.
 * IMPORTANT: Keep this at top so it runs before other network calls.
 */
(function addFetchLogger() {
  try {
    // @ts-ignore
    const nativeFetch = global.fetch;
    // @ts-ignore
    if (!nativeFetch.__logged) {
      // @ts-ignore
      global.fetch = async (input: any, init?: any) => {
        const url = typeof input === 'string' ? input : input?.url ?? String(input);
        const res = await nativeFetch(input, init);
        try {
          const ct = res.headers?.get?.('content-type') || '';
          if (!ct.toLowerCase().includes('application/json')) {
            // clone and get text safely
            const txt = await (res.clone().text().catch(() => '<no-body-or-binary>'));
            console.warn('[fetch-logger] Non-JSON response from:', url, 'status:', res.status);
            console.warn('[fetch-logger] Body (first 1500 chars):\n', txt.slice(0, 1500));
          }
        } catch (e) {
          console.warn('[fetch-logger] error while inspecting response for', url, e);
        }
        return res;
      };
      // mark so we don't re-wrap
      // @ts-ignore
      global.fetch.__logged = true;
    }
  } catch (e) {
    console.warn('[fetch-logger] could not attach fetch logger', e);
  }
})();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Missing-fields flow
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [missingValues, setMissingValues] = useState<Record<string, string>>({});
  const [pendingSignUpObj, setPendingSignUpObj] = useState<any>(null);
  const [showMissingDialog, setShowMissingDialog] = useState(false);

  const { signInEmailPassword } = useAuthContext();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

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

  const handleEmailSignIn = async () => {
    setLoading(true);
    try {
      await signInEmailPassword(email, password);
      router.replace('/biometric');
    } catch (err: any) {
      Alert.alert('Sign-in Failed', safeErrorMessage(err));
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
      // <-- USE Linking.createURL to reliably create the app deep link
      const redirectUrl = Linking.createURL('/oauth-callback', { scheme: 'studentpunch' });
      console.log('[auth] Using redirectUrl:', redirectUrl);

      // Helpful debug: log environment & keys (remove in production)
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Constants = require('expo-constants').default;
        console.log('[auth] expoConfig extra (if set):', Constants.expoConfig?.extra ?? '<no-expoConfig.extra>');
      } catch (e) {
        // ignore
      }

      // call Clerk's startOAuthFlow
      const result: any = await startOAuthFlow({ redirectUrl });
      console.log('[auth] startOAuthFlow result:', result);

      const { createdSessionId, setActive, signUp } = result || {};

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        router.replace('/biometric');
        return;
      }

      if (signUp && signUp.status === 'missing_requirements') {
        console.log('[auth] signUp missing requirements:', signUp);
        const fields = signUp.missingFields || signUp.requiredFields || [];
        setMissingFields(fields);
        setPendingSignUpObj({ signUp, setActive });
        const init: Record<string, string> = {};
        fields.forEach((f: string) => (init[f] = ''));
        setMissingValues(init);
        setShowMissingDialog(true);
        return;
      }

      // log the whole result when something unexpected arrives
      console.warn('[auth] OAuth completed but no createdSessionId:', result);
      Alert.alert('Error', 'Google Sign-in failed: missing session data. Check the console for details.');
    } catch (err: any) {
      // Extra effort: if err contains a response-like object, try extract text
      console.error('[auth] Google sign-in raw error:', err);

      // If Clerk/SDK returned an object with `response` that has text(), show it
      try {
        if (err?.response && typeof err.response.text === 'function') {
          const text = await err.response.text();
          console.error('[auth] Error response body (text):', text.slice(0, 2000));
        }
      } catch (e) {
        // ignore
      }

      // show user-friendly message
      Alert.alert('Google Sign-In Failed', safeErrorMessage(err));
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

      missingFields.forEach((f) => {
        const v = (missingValues[f] || '').trim();
        if (v) payload[f] = v;
      });

      const requiresPassword =
        (signUp.requiredFields && signUp.requiredFields.includes('password')) ||
        (signUp.missingFields && signUp.missingFields.includes('password'));

      if (requiresPassword && !payload.password) {
        payload.password = randomPassword(20);
      }

      if (typeof signUp.update === 'function') await signUp.update(payload);
      if (typeof signUp.create === 'function') await signUp.create();

      const createdSessionId = signUp.createdSessionId;
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        setShowMissingDialog(false);
        router.replace('/biometric');
        return;
      }

      Alert.alert('Signup incomplete', 'Please try signing in again.');
    } catch (err: any) {
      console.error('finishSignUpWithMissingFields error:', err);
      Alert.alert('Error', safeErrorMessage(err));
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
