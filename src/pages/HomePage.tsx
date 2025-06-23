
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to Pantry Pilot!
      </Typography>
      <Typography variant="h6">
        You are logged in as: <strong>{user?.email}</strong>
      </Typography>
      <Button
        variant="contained"
        onClick={handleLogout}
        sx={{ mt: 4 }}
      >
        Log Out
      </Button>
    </Box>
  );
};

export default HomePage;