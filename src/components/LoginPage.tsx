// src/components/LoginPage.tsx

import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
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
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
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
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7fa' }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, width: '100%', borderRadius: 3 }}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1, letterSpacing: 1, fontFamily: 'Nunito, sans-serif' }}>
            Pantry Pilot
          </Typography>
          <Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2, fontFamily: 'Nunito, sans-serif' }}>
            Log in to your account
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
              background: '#fff',
              color: '#222',
              border: '1px solid #e0e0e0',
              boxShadow: 'none',
              fontFamily: 'Nunito, sans-serif',
              '&:hover': { transform: 'translateY(-2px)', background: '#f5f5f5' },
            }}
          >
            Log in with Google
          </Button>

          <Divider sx={{ my: 2, fontFamily: 'Nunito, sans-serif' }}>or</Divider>

          <Stack spacing={2} sx={{ fontFamily: 'Nunito, sans-serif' }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              InputLabelProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
              inputProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              InputLabelProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
              inputProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading || !email || !password}
            onClick={handleEmailSignIn}
            sx={{ py: 1.3, textTransform: 'none', mt: 1, fontWeight: 600, fontFamily: 'Nunito, sans-serif' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
          </Button>

          {errorMsg && (
            <Alert severity="error" sx={{ mt: 2, textAlign: 'center', fontFamily: 'Nunito, sans-serif' }}>
              {errorMsg}
            </Alert>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 4, gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.08rem', fontFamily: 'Nunito, sans-serif', color: 'text.primary' }}>
              Don't have an account?
            </Typography>
            <Button
              size="medium"
              variant="outlined"
              color="primary"
              onClick={() => setPage('SignupPage')}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontFamily: 'Nunito, sans-serif',
                borderWidth: 2,
                borderRadius: 2,
                ml: 1,
                px: 2.5,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  borderColor: 'primary.main',
                },
              }}
            >
              Sign Up
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;