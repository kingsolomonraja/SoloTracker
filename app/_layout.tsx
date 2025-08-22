import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useThemeContext, ThemeProvider } from "@/contexts/ThemeContext";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";

import PunchInScreen from "./dashboard";
import HistoryScreen from "./history";
import ProfileScreen from "./profile";
import SosScreen from "@/components/SosScreen";
import TodoScreen from "@/components/TodoScreen";
import SettingsScreen from "@/components/SettingsScreen";
import LoginScreen from "./index";
import BiometricScreen from "./biometric";
import NotFoundScreen from "./+not-found";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import About from "@/components/About";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawer() {
  const { theme } = useThemeContext();

  return (
    <Drawer.Navigator
      initialRouteName="CheckIn"
      screenOptions={{
        headerShown: true,
        drawerPosition: "left",
        drawerType: "front",
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onBackground,
        drawerStyle: { backgroundColor: theme.colors.background },
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.onBackground,
      }}
    >
      <Drawer.Screen
        name="CheckIn"
        component={PunchInScreen}
        options={{ title: "Student Check-In" }}
      />
      <Drawer.Screen name="History" component={HistoryScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="SOS" component={SosScreen} />
      <Drawer.Screen name="To-do List" component={TodoScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="About" component={About} />
    </Drawer.Navigator>
  );
}

function RootNavigator() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="main" component={MainDrawer} />
      ) : (
        <>
          <Stack.Screen name="index" component={LoginScreen} />
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
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </PaperProvider>
  );
}