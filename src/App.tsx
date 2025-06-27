// src/App.tsx

import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';

import Welcome from './components/Welcome';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import HomePage from './pages/HomePage';
import UserProfilePage from './pages/UserProfilePage';
import ExplorePage from './pages/ExplorePage';
import { AuthProvider, useAuth } from './auth/AuthContext';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('welcome'); 

  if (loading) {
    return <CircularProgress />;
  }
  if (user) {
    switch (page) {
      case 'ExplorePage':
        return <ExplorePage setPage={setPage} />; 
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
      return <LoginPage setPage={setPage} />;
    case 'welcome':
    default:
      return <Welcome setPage={setPage} />;
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
          bgcolor: '#f7f7fa',
        }}
      >
        <AppContent />
      </Box>
    </AuthProvider>
  );
}

export default App;