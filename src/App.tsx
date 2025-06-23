// src/App.tsx

import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';

import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import HomePage from './pages/HomePage';
import UserProfilePage from './pages/UserProfilePage';
import { AuthProvider, useAuth } from './auth/AuthContext';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('login'); 

  if (loading) {
    return <CircularProgress />;
  }
  if (user) {
    switch (page) {
      case 'UserProfilePage':
        return <UserProfilePage setPage={setPage} />; 
      
      case 'HomePage':
      default:
        return <HomePage setPage={setPage} />;
    }
  }
  switch (page) {
    case 'SignupPage':
      return <SignupPage setPage={setPage} />;
    
    case 'LoginPage':
    default:
      return <LoginPage setPage={setPage} />;
  }
  
}

function App() {
  return (
    <AuthProvider>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
        }}
      >
        <AppContent />
      </Box>
    </AuthProvider>
  );
}

export default App;