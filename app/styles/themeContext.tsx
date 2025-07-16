import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { lightTheme, darkTheme, Theme } from './themes';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Assuming AsyncStorage is available or will be installed

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  currentThemeName: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentThemeName, setCurrentThemeName] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('appTheme');
        if (storedTheme === 'dark') {
          setCurrentThemeName('dark');
        } else {
          setCurrentThemeName('light');
        }
      } catch (e) {
        console.error('Failed to load theme from AsyncStorage', e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = currentThemeName === 'light' ? 'dark' : 'light';
    setCurrentThemeName(newTheme);
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (e) {
      console.error('Failed to save theme to AsyncStorage', e);
    }
  };

  const theme = currentThemeName === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, currentThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
