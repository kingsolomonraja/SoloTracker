// app/_layout.tsx
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import PunchInScreen from './index';          // Student check-in (was index.tsx)
import HistoryScreen from './history';          // Student history
import ProfileScreen from './profile';          // Student profile
import SosScreen from '@/components/SosScreen';
import TodoScreen from '@/components/TodoScreen';
import SettingsScreen from '@/components/SettingsScreen';
import LoginScreen from './login';
import BiometricScreen from './biometric';
import NotFoundScreen from './+not-found';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="CheckIn"
      screenOptions={{
        headerShown: true,
        drawerPosition: 'left',
        drawerType: 'front',
        drawerActiveTintColor: '#000',
        drawerInactiveTintColor: '#666',
      }}
    >
      {/* List all features in the Drawer */}
      <Drawer.Screen name="CheckIn" component={PunchInScreen} options={{ title: 'Student Check-In' }} />
      <Drawer.Screen name="History" component={HistoryScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="SOS" component={SosScreen} />
      <Drawer.Screen name="To-do List" component={TodoScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

function RootNavigator() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="main" component={MainDrawer} />
      ) : (
        <>
          <Stack.Screen name="login" component={LoginScreen} />
          <Stack.Screen name="biometric" component={BiometricScreen} />
        </>
      )}
      <Stack.Screen name="+not-found" component={NotFoundScreen} />
    </Stack.Navigator>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <PaperProvider>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="dark" />
      </AuthProvider>
    </PaperProvider>
  );
}
