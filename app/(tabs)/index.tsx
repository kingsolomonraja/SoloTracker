import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, CircleCheck as CheckCircle } from 'lucide-react-native';

import {
  Camera,
  CameraView,
  CameraPictureOptions,
  CameraType,
  PermissionStatus,
} from 'expo-camera';

import { useAuth } from '@/contexts/AuthContext';
import { LocationService } from '@/services/LocationService';
import { FirestoreService } from '@/services/FirestoreService';

export default function PunchInScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const { user } = useAuth();

  const [cameraVisible, setCameraVisible] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const cameraRef = useRef<CameraView | null>(null);

  // Request camera permission on mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === PermissionStatus.GRANTED);
    })();
  }, []);

  // After capturing an image, perform location check-in
  useEffect(() => {
    if (!capturedImageUri) return;

    const savePunchIn = async () => {
      setIsLoading(true);
      try {

        if (!user) {
          Alert.alert('Error', 'User not authenticated');
          return;
        }

        const location = await LocationService.getCurrentLocation();
        if (!location) {
          Alert.alert('Location Error', 'Could not retrieve location');
          return;
        }

        const checkIn = {
          userId: user.uid,
          email: user.email,
          timestamp: new Date(),
          latitude: location.latitude,
          longitude: location.longitude,
          imageUri: capturedImageUri, // Optionally upload to Firebase Storage
        };

        await FirestoreService.saveCheckIn(checkIn);

        const time = new Date().toLocaleTimeString();
        setLastCheckIn(time);

        Alert.alert('Check-in Successful!', `Checked in at ${time}`);
      } catch (err: any) {
        console.error('Check-in error:', err);
        Alert.alert('Check-in Failed', err.message || 'Unknown error');
      } finally {
        setIsLoading(false);
        setCapturedImageUri(null);
      }
    };

    savePunchIn();
  }, [capturedImageUri]);

  // Camera control functions
  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = (await cameraRef.current.takePictureAsync({
        quality: 0.7,
      } as CameraPictureOptions)) as { uri: string };
      setCapturedImageUri(photo.uri);
      setCameraVisible(false);
    }
  };

  const toggleCameraType = () => {
    setCameraType(prev => (prev === 'front' ? 'back' : 'front'));
  };

  const handlePunchIn = () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }
    setCameraVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Student Check-In</Text>
          <Text style={styles.subtitle}>
            Tap below to punch in with location and photo
          </Text>
        </View>

        <View style={styles.punchInContainer}>
          <View style={styles.iconContainer}>
            <MapPin size={80} color="#000" />
          </View>

          <Button
            mode="outlined"
            onPress={handlePunchIn}
            loading={isLoading}
            disabled={isLoading}
            style={styles.punchInButton}
            labelStyle={styles.punchInButtonText}
          >
            {isLoading ? 'Processing...' : 'Punch In'}
          </Button>
        </View>

        {lastCheckIn && (
          <View style={styles.lastCheckInContainer}>
            <CheckCircle size={24} color="#000" />
            <Text style={styles.lastCheckInText}>
              Last check-in: {lastCheckIn}
            </Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            • Photo & location will be saved{'\n'}
            • Data is secure & private{'\n'}
            • See history in the "History" tab
          </Text>
        </View>
      </View>

      {/* CAMERA MODAL */}
      <Modal
  animationType="slide"
  visible={cameraVisible}
  onRequestClose={() => setCameraVisible(false)}
>
  <View style={styles.cameraContainer}>
    {hasCameraPermission === null ? (
      <Text>Requesting camera permission...</Text>
    ) : hasCameraPermission === false ? (
      <Text>No access to camera</Text>
    ) : (
      <View style={{ flex: 1 }}>
        <CameraView style={StyleSheet.absoluteFill} facing={cameraType} ref={cameraRef} />
        <View style={styles.overlayContainer}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <Text style={styles.text}>Flip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setCameraVisible(false)}>
            <Text style={styles.text}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    )}
  </View>
</Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { flex: 1, padding: 24 },
  header: { marginBottom: 48 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', lineHeight: 24 },
  punchInContainer: { alignItems: 'center', marginBottom: 48 },
  iconContainer: { marginBottom: 32 },
  punchInButton: {
    borderColor: '#000',
    borderWidth: 3,
    paddingVertical: 8,
    paddingHorizontal: 32,
  },
  punchInButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  lastCheckInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  lastCheckInText: { fontSize: 16, color: '#000', fontWeight: '500' },
  infoContainer: { marginTop: 'auto' },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 12 },
  infoText: { fontSize: 14, color: '#666', lineHeight: 20 },

  cameraContainer: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 50,
  },
  overlayContainer: {
  position: 'absolute',
  bottom: 50,
  left: 0,
  right: 0,
  flexDirection: 'row',
  justifyContent: 'space-around',
  paddingHorizontal: 20,
},

  button: { padding: 16, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8 },
  text: { fontSize: 18, color: 'white' },
});
