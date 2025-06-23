
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface HomePageProps {
  setPage: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setPage }) => {
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
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        mb: 4,
      }}
      
    >
      <Typography variant="h6">

      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setPage('UserProfilePage')}
        >
          My Profile
        </Button>
        <Button
          variant="contained"
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </Box>

      
    </Box>

    <Typography variant="h4" gutterBottom>
      Welcome to Pantry Pilot <strong>{user?.displayName || user?.email}</strong>!
    </Typography>
    <Typography>
      (main recipe generator right here)
    </Typography>
  </Box>
);
};

export default HomePage;