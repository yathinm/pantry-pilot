// SignupPage.tsx
import React from 'react';
import { Box, Card, CardContent, Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';

interface SignupPageProps {
  setPage: (page: string) => void;
}

const handleGoogleSignIn = async () => {
  console.log('Attempting Google sign-in...');
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Signed-in user:', result.user);
  } catch (error) {
    console.error('Sign-in failed:', error);
  }
};

const SignupPage: React.FC<SignupPageProps> = ({ setPage }) => (
  <Box
    sx={{
      minHeight: '100vh',          
      width: '100%',
      display: 'flex',             
      alignItems: 'center',        
      justifyContent: 'center',    
      bgcolor: 'white',            
      px: 2,                       
    }}
  >

    <Card sx={{ width: 380, maxWidth: '100%' }}>
      <CardContent sx={{ p: 4 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<GoogleIcon />}
          sx={{ py: 1.5, mb: 2 }}
          onClick={handleGoogleSignIn}
        >
          Sign Up with Google
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Button size="small" onClick={() => setPage('LoginPage')}>
            Already have an account? Sign In
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Box>
);

export default SignupPage;
