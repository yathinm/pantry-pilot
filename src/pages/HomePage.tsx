import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../auth/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, app } from '../firebase'; 
import { getFunctions, httpsCallable } from 'firebase/functions';

interface HomePageProps {
  setPage: (page: string) => void;
}

interface Recipe {
  title: string;
  description: string;
  ingredients?: string[];
  instructions?: string[];
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
    if (!ingredients || !user) return; 

    setLoading(true);
    setError('');
    setRecipe(null);

    try {
      const functions = getFunctions(app, 'us-central1');
      const generateRecipeFn = httpsCallable(functions, 'generateRecipe');
      const result = await generateRecipeFn({ ingredients });
      const newRecipe = result.data as Recipe;
      setRecipe(newRecipe);
    } catch (err: any) {
      console.error("Error calling cloud function:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 4 }}>
        <Typography variant="h6">
          Welcome, <strong>{user?.displayName || user?.email}</strong>!
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => setPage('UserProfilePage')}>My Profile</Button>
          <Button variant="contained" onClick={handleLogout}>Log Out</Button>
        </Box>
      </Box>

      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Recipe Generator</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Enter your ingredients, and we'll create a recipe for you!</Typography>
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
          <Divider sx={{ mb: 4 }} />
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>{recipe.title}</Typography>
          <Typography sx={{ my: 2 }} color="text.secondary">{recipe.description}</Typography>
          
          {recipe.ingredients && recipe.instructions && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>Ingredients</Typography>
                <List dense>
                  {recipe.ingredients.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: '32px' }}><CheckCircleOutlineIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box sx={{ flex: 2 }}>
                <Typography variant="h6" gutterBottom>Instructions</Typography>
                <List>
                  {recipe.instructions.map((step, index) => (
                    <ListItem key={index} alignItems="flex-start">
                      <ListItemIcon sx={{ minWidth: '40px', mt: '4px' }}>
                        <Typography sx={{ fontWeight: 'bold' }}>{index + 1}.</Typography>
                      </ListItemIcon>
                      <ListItemText primary={step} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default HomePage;
