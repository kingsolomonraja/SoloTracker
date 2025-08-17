import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleCheck as CheckCircle } from 'lucide-react-native';
import {
  Camera,
  CameraView,
  CameraPictureOptions,
  CameraType,
  PermissionStatus,
} from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

import { useUser } from '@clerk/clerk-expo';

import { LocationService } from '@/services/LocationService';
import { FirestoreService } from '@/services/FirestoreService';

// Helper: Format UNIX timestamp to hh:mm AM/PM local time
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function PunchInScreen() {
  const { user, isLoaded } = useUser(); // Clerk user
  const [userName, setUserName] = useState('Student');
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);

  const [cameraVisible, setCameraVisible] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const cameraRef = useRef<CameraView | null>(null);

  const [weather, setWeather] = useState<{
    description: string;
    temp: number;
    humidity: number;
    windSpeed: number;
    sunrise: number;
    sunset: number;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchUserName = async () => {
      const profile = await FirestoreService.getUserProfile(user.id);
      if (profile?.name) {
        setUserName(profile.name);
      } else {
        // fallback to Clerk's name
        setUserName(user.fullName || 'Student');
      }
    };

    fetchUserName();
  }, [isLoaded, user]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === PermissionStatus.GRANTED);
    })();
  }, []);

  useEffect(() => {
    if (!capturedImageUri || !user) return;

    const savePunchIn = async () => {
      setIsLoading(true);
      try {
        const location = await LocationService.getCurrentLocation();
        if (!location) throw new Error('Could not retrieve location');

        await FirestoreService.saveCheckIn({
          userId: user.id, // Clerk's ID
          email: user.primaryEmailAddress?.emailAddress || '',
          timestamp: new Date(),
          latitude: location.latitude,
          longitude: location.longitude,
        });

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
  }, [capturedImageUri, user]);

  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const location = await LocationService.getCurrentLocation();
        if (!location) throw new Error('Could not get location for weather');

        const apiKey = '51cc033b7ef66b931ec6aba15e0b1792';
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch weather');
        }
        const data = await response.json();

        setWeather({
          description: data.weather[0].description,
          temp: data.main.temp,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          sunrise: data.sys.sunrise,
          sunset: data.sys.sunset,
        });
      } catch (error: any) {
        setWeatherError(error.message);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      } as CameraPictureOptions);
      setCapturedImageUri(photo.uri);
      setCameraVisible(false);
    }
  };

  const toggleCameraType = () => {
    setCameraType((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  const handlePunchIn = () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }
    setCameraVisible(true);
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading user...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <MaskedView maskElement={<Text style={[styles.title, { backgroundColor: 'transparent' }]}>Hello, {userName} 👋</Text>}>
            <LinearGradient
              colors={['#00bfff', '#00008b']} // Light blue to dark blue
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.title, { opacity: 0 }]}>Hello, {userName} 👋</Text>
            </LinearGradient>
          </MaskedView>

          <Text style={styles.subtitle}>Ready to check in?</Text>
        </View>

        <View style={styles.punchInContainer}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../assets/logo.png')}
              style={{ width: 120, height: 100 }}
              resizeMode="contain"
            />
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
            <Text style={styles.lastCheckInText}>Last check-in: {lastCheckIn}</Text>
          </View>
        )}

        {/* Weather Section */}
        <View style={styles.weatherBox}>
          <Text style={styles.weatherTitle}>Today's Weather</Text>
          {weatherLoading ? (
            <Text style={styles.weatherText}>Loading weather...</Text>
          ) : weatherError ? (
            <Text style={styles.weatherError}>Error: {weatherError}</Text>
          ) : weather ? (
            <>
              <View style={styles.weatherMainRow}>
                <MaterialCommunityIcons name="weather-partly-cloudy" size={48} color="#4a90e2" />
                <Text style={styles.weatherMainText}>
                  {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
                </Text>
                <Text style={styles.weatherTemp}>{Math.round(weather.temp)}°C</Text>
              </View>

              <View style={styles.weatherDetails}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="water-percent" size={24} color="#00aaff" />
                  <Text style={styles.detailText}>Humidity: {weather.humidity}%</Text>
                </View>

                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="weather-windy" size={24} color="#00cc88" />
                  <Text style={styles.detailText}>Wind: {weather.windSpeed} m/s</Text>
                </View>

                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="weather-sunset-up" size={24} color="#ffaa00" />
                  <Text style={styles.detailText}>Sunrise: {formatTime(weather.sunrise)}</Text>
                </View>

                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="weather-sunset-down" size={24} color="#ff4400" />
                  <Text style={styles.detailText}>Sunset: {formatTime(weather.sunset)}</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.weatherText}>No weather data available</Text>
          )}
        </View>
      </View>

      <Modal animationType="slide" visible={cameraVisible} onRequestClose={() => setCameraVisible(false)}>
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
  header: { marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', lineHeight: 24 },
  punchInContainer: { alignItems: 'center', marginBottom: 40 },
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
    marginBottom: 24,
    gap: 8,
  },
  lastCheckInText: { fontSize: 16, color: '#000', fontWeight: '500' },

  // Weather styles
  weatherBox: {
    backgroundColor: '#f0f8ff',
    padding: 24,
    borderRadius: 16,
    marginTop: 'auto',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  weatherTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 12,
  },
  weatherMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  weatherMainText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#004d99',
    flexShrink: 1,
  },
  weatherTemp: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#007acc',
  },
  weatherDetails: {
    width: '100%',
    gap: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#005577',
  },
  weatherText: {
    fontSize: 16,
    color: '#666',
  },
  weatherError: {
    fontSize: 16,
    color: 'red',
    fontWeight: '600',
  },

  cameraContainer: { flex: 1, backgroundColor: 'black' },
  overlayContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  button: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});

