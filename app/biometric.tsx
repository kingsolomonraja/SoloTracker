import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fingerprint, Shield } from 'lucide-react-native';

export default function BiometricScreen() {
  const [biometricType, setBiometricType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      Alert.alert(
        'Biometrics Not Supported',
        'Your device does not support biometric authentication. Proceeding to main app.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
      return;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      Alert.alert(
        'No Biometrics Enrolled',
        'Please set up biometric authentication in your device settings.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
      return;
    }

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      setBiometricType('Face ID');
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      setBiometricType('Fingerprint');
    } else {
      setBiometricType('Biometric');
    }
  };

  const authenticateWithBiometrics = async () => {
    setIsLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access the app',
        fallbackLabel: 'Use Password',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Authentication Failed', 'Please try again');
      }
    } catch (error) {
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const skipBiometric = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {biometricType === 'Face ID' ? (
            <Shield size={80} color="#000000" />
          ) : (
            <Fingerprint size={80} color="#000000" />
          )}
        </View>
        
        <Text style={styles.title}>Secure Access</Text>
        <Text style={styles.subtitle}>
          Use {biometricType || 'biometric authentication'} to securely access your check-in app.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={authenticateWithBiometrics}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            labelStyle={styles.buttonText}
          >
            Authenticate with {biometricType}
          </Button>
          
          <Button
            mode="text"
            onPress={skipBiometric}
            disabled={isLoading}
            style={styles.skipButton}
            labelStyle={styles.skipButtonText}
          >
            Skip for now
          </Button>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 48,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    marginTop: 8,
  },
  skipButtonText: {
    color: '#666666',
    fontSize: 14,
  },
});