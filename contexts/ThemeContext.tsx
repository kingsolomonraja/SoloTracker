import React, { createContext, useContext, useState } from "react";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  const theme = isDark ? MD3DarkTheme : MD3LightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
