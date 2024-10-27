// src/App.js

/**
 * s10-smartgrow-frontend License
 * 
 * Copyright © 2024, Justin Morris Albertyn
 * 
 * Use of this software is restricted to projects where the copyright holder or authorized developer is directly involved.
 * For more details, see the LICENSE file in the project root.
 */

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Login from './components/Login';
import DashboardContainer from './components/Dashboard/DashboardContainer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { BrandProvider } from './contexts/BrandContext'; // Import the BrandProvider
import GoogleMapsProvider from './components/Dashboard/GoogleMapsProvider';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh', 
      width: '100vw',
      overflow: 'hidden', 
    }}>
      <GoogleMapsProvider>
        <Routes>
          <Route path="/" element={<DashboardContainer />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </GoogleMapsProvider>
    </Box>
  );
}

function App() {
  return (
    <BrandProvider> {/* Wrap the entire app with BrandProvider */}
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </BrandProvider>
  );
}

export default App;