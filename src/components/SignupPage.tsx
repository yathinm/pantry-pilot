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
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth, provider } from '../firebase';

interface SignupPageProps {
  setPage: (page: string) => void;
}

const handleGoogleSignIn = async () => {
  try {
    const { user } = await signInWithPopup(auth, provider);
    console.log('Signed-in user:', user);
  } catch (err) {
    console.error('Google sign-in failed:', err);
  }
};

const SignupPage: React.FC<SignupPageProps> = ({ setPage }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailSignup = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      console.log('Created user:', user);
    } catch (err: any) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setErrorMsg('That email is already registered.');
          break;
        case 'auth/invalid-email':
          setErrorMsg('Enter a valid email address.');
          break;
        case 'auth/weak-password':
          setErrorMsg('Password should be at least 6 characters.');
          break;
        default:
          setErrorMsg('Could not create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

return (
  <Box
    sx={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
    }}
  >
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
        sx={{
          py: 1.6,
          fontWeight: 600,
          textTransform: 'none',
          transition: 'transform 0.15s',
          '&:hover': { transform: 'translateY(-2px)' },
        }}
      >
        Sign up with Google
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
        disabled={loading || !email || password.length < 6}
        onClick={handleEmailSignup}
        sx={{ py: 1.3, textTransform: 'none' }}
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </Button>

      {errorMsg && (
        <Typography color="error" variant="body2">
          {errorMsg}
        </Typography>
      )}

      <Typography variant="body2" textAlign="center">
        Already have an account?{' '}
        <Button size="small" onClick={() => setPage('LoginPage')}>
          Log in
        </Button>
      </Typography>
    </Box>
  </Box>
);
};

export default SignupPage;
