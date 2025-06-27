import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, provider } from '../firebase';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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
  const [showPassword, setShowPassword] = useState(false);

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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          fontFamily: 'Nunito, sans-serif',
          textAlign: 'center',
          width: '100%',
        }}
      >
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
          Create your account
        </Typography>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon sx={{ color: '#667eea' }} />}
          onClick={handleGoogleSignIn}
          sx={{
            py: 1.6,
            fontWeight: 700,
            textTransform: 'none',
            fontFamily: 'Nunito, sans-serif',
            mb: 1,
            borderWidth: 2,
            borderRadius: 2,
            boxShadow: 'none',
            color: '#667eea',
            border: '2px solid #667eea',
            background: '#f7f7fa',
            transition: 'all 0.2s ease',
            '& .MuiButton-label': {
              marginTop: '60px',
            },
            '&:hover': {
              background: '#f7f7fa',
              color: '#5a6fd8',
              border: '2px solid #5a6fd8',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
            },
          }}
        >
          Sign up with Google
        </Button>
        <Divider sx={{ my: 2, fontFamily: 'Nunito, sans-serif' }}>or</Divider>
        <Stack spacing={2} sx={{ fontFamily: 'Nunito, sans-serif', width: '100%', maxWidth: 350, mx: 'auto' }}>
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
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            InputLabelProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
            inputProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
            helperText="Password must be at least 6 characters."
            FormHelperTextProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
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
          disabled={loading || !firstName || !lastName || !email || password.length < 6}
          onClick={handleEmailSignup}
          sx={{ py: 1.3, textTransform: 'none', mt: 2, fontWeight: 600, fontFamily: 'Nunito, sans-serif', borderRadius: 2, background: '#667eea', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)', '&:hover': { background: '#5a6fd8', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)' } }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
        </Button>
        {errorMsg && (
          <Alert severity="error" sx={{ mt: 2, textAlign: 'center', fontFamily: 'Nunito, sans-serif' }}>
            {errorMsg}
          </Alert>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 4, gap: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.08rem', fontFamily: 'Nunito, sans-serif', color: 'text.primary' }}>
            Already have an account?
          </Typography>
          <Button
            size="medium"
            variant="outlined"
            onClick={() => setPage('LoginPage')}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontFamily: 'Nunito, sans-serif',
              borderWidth: 2,
              borderRadius: 2,
              ml: 1,
              px: 2.5,
              boxShadow: 'none',
              color: '#667eea',
              border: '2px solid #667eea',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'white',
                color: '#5a6fd8',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
              },
            }}
          >
            Log in
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SignupPage;
