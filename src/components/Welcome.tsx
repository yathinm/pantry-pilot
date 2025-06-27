import React from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';

interface WelcomeProps {
  setPage: (page: string) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ setPage }) => {
  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#f7f7fa',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          fontFamily: 'Nunito, sans-serif',
          textAlign: 'center',
        }}
      >
        {/* App Title */}
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: 2, 
            fontFamily: 'Nunito, sans-serif',
            color: '#667eea',
            mb: 1,
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translateY(0px)',
              },
              '50%': {
                transform: 'translateY(-10px)',
              },
            },
          }}
        >
          Pantry Pilot
        </Typography>

        {/* Subtitle */}
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.secondary', 
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 400,
            mb: 4,
            opacity: 0.8,
          }}
        >
          Your culinary journey starts here
        </Typography>

        {/* Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 300 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setPage('LoginPage')}
            sx={{ 
              py: 2, 
              textTransform: 'none', 
              fontWeight: 600, 
              fontSize: '1rem',
              fontFamily: 'Nunito, sans-serif',
              borderRadius: 2,
              background: '#667eea',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: '#5a6fd8',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              },
            }}
          >
            Login
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => setPage('SignupPage')}
            sx={{ 
              py: 2, 
              textTransform: 'none', 
              fontWeight: 600, 
              fontSize: '1rem',
              fontFamily: 'Nunito, sans-serif',
              borderRadius: 2,
              border: '2px solid #667eea',
              color: '#667eea',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'white',
                color: '#5a6fd8',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
              },
            }}
          >
            Sign Up
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Welcome; 