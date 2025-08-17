// app/profile.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Dialog,
  Portal,
  TextInput,
  Provider as PaperProvider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, LogOut, Mail } from "lucide-react-native";
import { router } from "expo-router";
import { FirestoreService } from "@/services/FirestoreService";
import { useAuth } from "@/contexts/AuthContext";
import ThemedScreen from "@/components/ThemedScreen";
import { useThemeContext } from "@/contexts/ThemeContext";
import { Text } from "react-native"; // keep only RN Text here

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { theme } = useThemeContext();

  const [name, setName] = useState("Student User");
  const [showPrompt, setShowPrompt] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      try {
        const profile = await FirestoreService.getUserProfile(user.uid);
        if (profile?.name) {
          setName(profile.name);
        } else if (user?.fullName) {
          setName(user.fullName);
        }
      } catch (e) {
        console.error("Failed to load user profile:", e);
      }
    };

    fetchUserProfile();
  }, [user?.uid]);

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
            email: user?.email || "",
          });
        }
      }
    } catch (e) {
      console.error("Failed to save user name:", e);
    } finally {
      setShowPrompt(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <ThemedScreen>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>
              Profile
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onBackground }]}>
              Manage your account and app preferences
            </Text>
          </View>

          <View style={styles.profileSection}>
            <View style={[styles.avatarContainer, { borderColor: theme.colors.onBackground }]}>
              <User size={80} color={theme.colors.onBackground} />
            </View>

            <View style={styles.userInfo}>
              <TouchableOpacity onPress={openNamePrompt}>
                <Text style={[styles.userName, { color: theme.colors.onBackground }]}>
                  {name}
                </Text>
              </TouchableOpacity>
              <View style={styles.emailContainer}>
                <Mail size={16} color={theme.colors.onBackground} />
                <Text style={[styles.userEmail, { color: theme.colors.onBackground }]}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Account Actions
            </Text>

            <Button
              mode="outlined"
              onPress={handleSignOut}
              style={[styles.signOutButton, { borderColor: theme.colors.onBackground }]}
              labelStyle={[styles.signOutButtonText, { color: theme.colors.onBackground }]}
              icon={() => <LogOut size={16} color={theme.colors.onBackground} />}
            >
              Sign Out
            </Button>
          </View>

          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              App Information
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.onBackground }]}>
              • Version: 1.0.0{"\n"}
              • Built with React Native & Expo{"\n"}
              • Secure biometric authentication{"\n"}
              • GPS location tracking{"\n"}
              • Firebase cloud storage
            </Text>
          </View>
        </View>

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
    </ThemedScreen>
  );
}

// styles (structural only, no colors hardcoded)
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  profileSection: { alignItems: "center", marginBottom: 48 },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  userInfo: { alignItems: "center" },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textDecorationLine: "underline",
  },
  emailContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  userEmail: { fontSize: 16, marginLeft: 6 },
  actionsSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  signOutButton: { borderWidth: 2 },
  signOutButtonText: { fontSize: 16, fontWeight: "600" },
  infoSection: { marginTop: "auto" },
  infoText: { fontSize: 14, lineHeight: 20 },
});
