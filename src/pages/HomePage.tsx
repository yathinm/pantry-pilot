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
  Container,
  Paper,
  Alert,
} from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, app } from '../firebase'; 
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

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
  const [isSaved, setIsSaved] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleGenerateRecipe = async () => {
    if (!ingredients || !user) return; 
    setLoading(true);
    setError('');
    setRecipe(null);
    setIsSaved(false);
    try {
      const functions = getFunctions(app, 'us-central1');
      const generateRecipeFn = httpsCallable(functions, 'generateRecipe');
      const result = await generateRecipeFn({ ingredients });
      const newRecipe = result.data as Recipe;
      setRecipe(newRecipe);
    } catch (err: unknown) {
      let message = 'An error occurred.';
      if (typeof err === 'object' && err !== null && 'message' in err) {
        message = String((err as { message: string }).message);
      }
      setError(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!user || !recipe) {
      return;
    }
    try {
      const recipesCollectionRef = collection(db, 'users', user.uid, 'recipes');
      await addDoc(recipesCollectionRef, {
        ...recipe, 
        savedAt: serverTimestamp(),
      });
      setIsSaved(true);
    } catch (err) {
      setError("Sorry, we couldn't save your recipe right now.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7fa', fontFamily: 'Nunito, sans-serif' }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, width: '100%', borderRadius: 3 }}>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, fontFamily: 'Nunito, sans-serif' }}>
          {/* Nav Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 3, gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Nunito, sans-serif', letterSpacing: 1 }}>
              Pantry Pilot
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={() => setPage('ExplorePage')} sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, textTransform: 'none', px: 2 }}>
                Explore
              </Button>
              <Button variant="outlined" onClick={() => setPage('UserProfilePage')} sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, textTransform: 'none', px: 2 }}>
                My Profile
              </Button>
              <Button variant="contained" onClick={handleLogout} sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, textTransform: 'none', px: 2 }}>
                Log Out
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 1, fontFamily: 'Nunito, sans-serif' }} />

          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', mb: 1, fontFamily: 'Nunito, sans-serif' }}>
            Welcome, <span style={{ color: '#1976d2' }}>{user?.displayName ? user.displayName.split(' ')[0] : user?.email}</span>!
          </Typography>

          <Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2, fontFamily: 'Nunito, sans-serif' }}>
            Enter your ingredients, and we'll create a recipe for you!
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
            InputLabelProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
            inputProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleGenerateRecipe}
            disabled={loading || !ingredients}
            sx={{ mt: 2, py: 1.5, fontWeight: 600, fontFamily: 'Nunito, sans-serif', textTransform: 'none' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Recipe'}
          </Button>
          {error && <Alert severity="error" sx={{ mt: 2, textAlign: 'center', fontFamily: 'Nunito, sans-serif' }}>{error}</Alert>}

          {recipe && (
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 4, fontFamily: 'Nunito, sans-serif' }} />
              <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>{recipe.title}</Typography>
              <Typography sx={{ my: 2, fontFamily: 'Nunito, sans-serif' }} color="text.secondary">{recipe.description}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleSaveRecipe}
                  disabled={isSaved}
                  sx={{ fontWeight: 700, fontFamily: 'Nunito, sans-serif', textTransform: 'none', borderWidth: 2, borderRadius: 2, px: 3, boxShadow: 'none', '&:hover': { backgroundColor: 'primary.main', color: 'white', borderColor: 'primary.main' } }}
                >
                  {isSaved ? 'Recipe Saved!' : 'Save This Recipe'}
                </Button>
              </Box>
              {recipe.ingredients && recipe.instructions && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 3 }}>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Nunito, sans-serif' }}>Ingredients</Typography>
                    <List dense sx={{ width: '100%' }}>
                      {recipe.ingredients.map((item, index) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemText
                            primary={<span style={{ fontFamily: 'Nunito, sans-serif' }}>{`${index + 1}. ${item}`}</span>}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Nunito, sans-serif' }}>Instructions</Typography>
                    <List sx={{ width: '100%' }}>
                      {recipe.instructions.map((step, index) => {
                        const cleanStep = step.replace(/^\s*\d+\.?\s*/, '');
                        return (
                          <ListItem key={index} alignItems="flex-start" sx={{ pl: 0 }}>
                            <ListItemIcon sx={{ minWidth: '40px', mt: '4px' }}>
                              <Typography sx={{ fontWeight: 'bold', fontFamily: 'Nunito, sans-serif' }}>{index + 1}.</Typography>
                            </ListItemIcon>
                            <ListItemText primary={cleanStep} sx={{ fontFamily: 'Nunito, sans-serif' }} />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default HomePage;
