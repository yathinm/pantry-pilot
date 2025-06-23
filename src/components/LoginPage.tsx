// src/components/LoginPage.tsx

import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';

interface LoginPageProps {
  setPage: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setErrorMsg('Could not sign in with Google. Please try again.');
    }
  };

  const handleEmailSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setErrorMsg('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: 420,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
        Pantry Pilot
      </Typography>

      <Button
        fullWidth
        variant="contained"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleSignIn}
        sx={{ py: 1.6, fontWeight: 600, textTransform: 'none' }}
      >
        Log in with Google
      </Button>

      <Divider>or</Divider>

      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Stack>

      <Button
        fullWidth
        variant="outlined"
        disabled={loading || !email || !password}
        onClick={handleEmailSignIn}
        sx={{ py: 1.3, textTransform: 'none' }}
      >
        {loading ? 'Logging in…' : 'Log In'}
      </Button>

      {errorMsg && (
        <Typography color="error" variant="body2" textAlign="center">
          {errorMsg}
        </Typography>
      )}

      <Typography variant="body2" textAlign="center">
        Don't have an account?{' '}
        <Button size="small" onClick={() => setPage('SignupPage')}>
          Sign Up
        </Button>
      </Typography>
    </Box>
  );
};

export default LoginPage;