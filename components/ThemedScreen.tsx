// components/ThemedScreen.tsx
import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { useThemeContext } from "@/contexts/ThemeContext";

export default function ThemedScreen({
  children,
  style,
  ...props
}: ViewProps & { children: React.ReactNode }) {
  const { theme } = useThemeContext();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
