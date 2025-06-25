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
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, provider } from '../firebase';

interface SignupPageProps {
  setPage: (page: string) => void;
}

const handleGoogleSignIn = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error('Google sign-in failed:', err);
  }
};

const SignupPage: React.FC<SignupPageProps> = ({ setPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
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
      await updateProfile(user, {
        displayName: `${firstName.trim()} ${lastName.trim()}`, 
      });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err) {
        const errorCode = (err as { code: string }).code;
        switch (errorCode) {
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
      } else {
        setErrorMsg('Could not create account. Please try again.');
      }
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
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1, letterSpacing: 1, fontFamily: 'Nunito, sans-serif' }}>
            Pantry Pilot
          </Typography>
          <Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2, fontFamily: 'Nunito, sans-serif' }}>
            Create your account
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
            Sign up with Google
          </Button>

          <Divider sx={{ my: 2, fontFamily: 'Nunito, sans-serif' }}>or</Divider>

          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                InputLabelProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
                inputProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
              />
              <TextField
                label="Last Name"
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                InputLabelProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
                inputProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
              />
            </Stack>

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
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              InputLabelProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
              inputProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
            />
          </Stack>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading || !firstName || !lastName || !email || password.length < 6}
            onClick={handleEmailSignup}
            sx={{ py: 1.3, textTransform: 'none', mt: 1, fontWeight: 600, fontFamily: 'Nunito, sans-serif' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>

          {errorMsg && (
            <Alert severity="error" sx={{ mt: 2, textAlign: 'center', fontFamily: 'Nunito, sans-serif' }}>
              {errorMsg}
            </Alert>
          )}

          <Typography variant="body2" textAlign="center" sx={{ mt: 3, color: 'text.secondary', fontFamily: 'Nunito, sans-serif' }}>
            Already have an account?{' '}
            <Button size="small" onClick={() => setPage('login')} sx={{ textTransform: 'none', fontWeight: 500, fontFamily: 'Nunito, sans-serif' }}>
              Log in
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignupPage;
