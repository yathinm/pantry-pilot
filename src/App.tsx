// src/App.tsx

import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Import all our pages and the Auth Context
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import HomePage from './pages/HomePage';
import { AuthProvider, useAuth } from './auth/AuthContext';

// This is our main application logic component.
// It can use the useAuth hook because it will be a child of AuthProvider.
function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('login'); // To toggle between login/signup

  // 1. Show a loading spinner while Firebase is checking the user's status.
  if (loading) {
    return <CircularProgress />;
  }

  // 2. If loading is done and there IS a user, show the HomePage.
  //    This takes priority over everything else.
  if (user) {
    return <HomePage />;
  }

  // 3. If loading is done and there is NO user, show the login or signup page.
  switch (page) {
    case 'login':
      return <LoginPage setPage={setPage} />;
    case 'signup':
      return <SignupPage setPage={setPage} />;
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