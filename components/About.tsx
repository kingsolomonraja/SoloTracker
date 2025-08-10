import React from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView } from "react-native";
import Constants from "expo-constants";

export default function AboutScreen() {
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const developerEmail = "iamsolomonrajaj@gmail.com";
  const developerPhone = "7676744948";

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${developerEmail}?subject=Bug Report - SoloTracker&body=Describe the issue here...`);
  };

  const handleCallPress = () => {
    Linking.openURL(`tel:${developerPhone}`);
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL("https://docs.google.com/document/d/13simawP30mozPbh9ZKVSUO4n_pGuf0sxUe4RHPoHOaU/edit?usp=sharing");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>SoloTracker</Text>
      <Text style={styles.version}>Version {appVersion}</Text>

      <Text style={styles.description}>
        SoloTracker — Tracking students and managing check-ins seamlessly.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer</Text>
        <Text style={styles.text}>SolomonRJ</Text>

        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={styles.link}>📧 {developerEmail}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCallPress}>
          <Text style={styles.link}>📞 {developerPhone}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={handleEmailPress}>
          <Text style={styles.buttonText}>Report a Bug</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonOutline} onPress={handlePrivacyPolicy}>
          <Text style={styles.buttonOutlineText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  link: {
    fontSize: 16,
    color: "#007bff",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  buttonOutline: {
    borderColor: "#007bff",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  buttonOutlineText: {
    color: "#007bff",
    fontSize: 16,
    textAlign: "center",
  },
});
