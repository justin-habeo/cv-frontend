// src/theme.js
import { createTheme } from '@mui/material/styles';

const baseTheme = {
  shape: {
    borderRadius: 12, // Rounded corners for most components
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          '&:last-child': {
            paddingBottom: '16px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0, // Remove rounded corners for sidebar
        },
      },
    },
  },
};

const createCustomTheme = (mode, colors) => createTheme({
  ...baseTheme,
  palette: {
    mode,
    primary: {
      main: colors.primary,
      contrastText: colors.primaryContrast,
    },
    secondary: {
      main: colors.secondary,
      contrastText: colors.secondaryContrast,
    },
    background: {
      default: colors.background,
      paper: colors.paper,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    action: {
      active: colors.active,
      hover: colors.hover,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 300,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 400,
      fontSize: '2rem',
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    ...baseTheme.components,
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.primary,
          color: colors.primaryContrast,
          borderRadius: 0, // Ensure no rounded corners for sidebar
        },
      },
    },
  },
});

const darkColors = {
  primary: '#2C7873',
  primaryContrast: '#FFFFFF',
  secondary: '#6FB98F',
  secondaryContrast: '#000000',
  background: '#121212',
  paper: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  active: '#4A90E2',
  hover: 'rgba(44, 120, 115, 0.08)',
};

const lightColors = {
  primary: '#2C7873',
  primaryContrast: '#FFFFFF',
  secondary: '#6FB98F',
  secondaryContrast: '#000000',
  background: '#0F766E',
  paper: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: 'rgba(0, 0, 0, 0.7)',
  active: '#4A90E2',
  hover: 'rgba(44, 120, 115, 0.08)',
};

const purpleColors = {
  primary: '#8E24AA',
  primaryContrast: '#FFFFFF',
  secondary: '#E91E63',
  secondaryContrast: '#FFFFFF',
  background: '#F3E5F5',
  paper: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: 'rgba(0, 0, 0, 0.7)',
  active: '#AB47BC',
  hover: 'rgba(142, 36, 170, 0.08)',
};

const ombriaColors = {
  primary: '#1F3A33',
  primaryContrast: '#FFFFFF',
  secondary: '#D2B48C',
  secondaryContrast: '#1F3A33',
  background: '#F5F5F5',
  paper: '#FFFFFF',
  textPrimary: '#1F3A33',
  textSecondary: '#4A4A4A',
  active: '#CD7F32',
  hover: 'rgba(31, 58, 51, 0.08)',
};

export const darkTheme = createCustomTheme('dark', darkColors);
export const lightTheme = createCustomTheme('light', lightColors);
export const purpleTheme = createCustomTheme('light', purpleColors);
export const ombriaTheme = createCustomTheme('light', ombriaColors);

export const themes = {
  dark: darkTheme,
  light: lightTheme,
  purple: purpleTheme,
  ombria: ombriaTheme,
};

export default darkTheme;