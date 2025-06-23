
import React, { useState } from 'react';
import { Box, Button, Typography, TextField, CircularProgress } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface HomePageProps {
  setPage: (page: string) => void;
}

interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

const HomePage: React.FC<HomePageProps> = ({ setPage }) => {
  const { user } = useAuth();

  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleGenerateRecipe = async () => {
    console.log('Generating recipe with:', ingredients);
    alert('Backend function not yet connected!');
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => setPage('UserProfilePage')}>
            My Profile
          </Button>
          <Button variant="contained" onClick={handleLogout}>
            Log Out
          </Button>
        </Box>
      </Box>

x         <Box>
        <Typography variant="h4" >
          Welcome to Pantry Pilot <strong>{user?.displayName || user?.email}</strong> !
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Enter the ingredients you have on hand, and we'll create a recipe for you!
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Your Ingredients"
          placeholder="e.g., chicken breast, rice, broccoli, soy sauce"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          disabled={loading}
        />
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleGenerateRecipe}
          disabled={loading || !ingredients}
          sx={{ mt: 2, py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Recipe'}
        </Button>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </Box>

      {recipe && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">Generated Recipe:</Typography>
          <pre>{JSON.stringify(recipe, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
};

export default HomePage;