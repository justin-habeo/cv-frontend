// src/contexts/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { themes, lightTheme } from '../theme';  // Import lightTheme as a fallback
import apiService from '../services/apiService';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');  // Start with light theme as default

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const theme = await apiService.getCompanyTheme();
        setCurrentTheme(theme);
      } catch (error) {
        console.error('Error fetching theme:', error);
      }
    };
    fetchTheme();
  }, []);

  const toggleTheme = async (themeName) => {
    try {
      const updatedTheme = await apiService.setCompanyTheme(themeName);
      setCurrentTheme(updatedTheme);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, toggleTheme }}>
      <MuiThemeProvider theme={themes[currentTheme] || lightTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};