import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
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
    } catch {
      setError("Sorry, we couldn't save your recipe right now.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7fa' }}>
      <Box sx={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 4, 
        fontFamily: 'Nunito, sans-serif',
        textAlign: 'center'
      }}>
        {/* Nav Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2, gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Nunito, sans-serif', letterSpacing: 1, color: '#667eea' }}>
            Pantry Pilot
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              onClick={() => setPage('ExplorePage')} 
              sx={{ 
                fontFamily: 'Nunito, sans-serif', 
                fontWeight: 700, 
                textTransform: 'none', 
                px: 2.5,
                borderWidth: 2,
                borderRadius: 2,
                boxShadow: 'none',
                color: '#667eea',
                border: '2px solid #667eea',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: '#f7f7fa',
                  color: '#5a6fd8',
                  border: '2px solid #5a6fd8',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
                },
              }}
            >
              Explore
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => setPage('UserProfilePage')} 
              sx={{ 
                fontFamily: 'Nunito, sans-serif', 
                fontWeight: 700, 
                textTransform: 'none', 
                px: 2.5,
                borderWidth: 2,
                borderRadius: 2,
                boxShadow: 'none',
                color: '#667eea',
                border: '2px solid #667eea',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: '#f7f7fa',
                  color: '#5a6fd8',
                  border: '2px solid #5a6fd8',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
                },
              }}
            >
              My Profile
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleLogout} 
              sx={{ 
                fontFamily: 'Nunito, sans-serif', 
                fontWeight: 700, 
                textTransform: 'none', 
                px: 2.5,
                borderWidth: 2,
                borderRadius: 2,
                boxShadow: 'none',
                color: '#667eea',
                border: '2px solid #667eea',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: '#f7f7fa',
                  color: '#5a6fd8',
                  border: '2px solid #5a6fd8',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
                },
              }}
            >
              Log Out
            </Button>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', mb: 1, fontFamily: 'Nunito, sans-serif', color: 'text.primary' }}>
          Welcome, <span style={{ color: '#667eea' }}>{user?.displayName ? user.displayName.split(' ')[0] : user?.email}</span>!
        </Typography>

        <Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 4, fontFamily: 'Nunito, sans-serif', opacity: 0.8 }}>
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
          sx={{ maxWidth: 500, mx: 'auto' }}
        />
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleGenerateRecipe}
          disabled={loading || !ingredients}
          sx={{ 
            mt: 2, 
            py: 1.3, 
            fontWeight: 600, 
            fontFamily: 'Nunito, sans-serif', 
            textTransform: 'none',
            maxWidth: 500,
            mx: 'auto',
            borderRadius: 2,
            background: '#667eea',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.15)',
            '&:hover': {
              background: '#5a6fd8',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.18)',
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: '3px solid #e0e0e0',
                  borderTop: '3px solid #fff',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
            </Box>
          ) : (
            'Generate Recipe'
          )}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2, textAlign: 'center', fontFamily: 'Nunito, sans-serif', maxWidth: 500, mx: 'auto' }}>{error}</Alert>}

        {recipe && (
          <Box sx={{ mt: 4, maxWidth: 800, mx: 'auto', width: '100%' }}>
            <Divider sx={{ mb: 4, fontFamily: 'Nunito, sans-serif' }} />
            <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mb: 2, fontFamily: 'Nunito, sans-serif', textAlign: 'center', color: '#667eea' }}>{recipe.title}</Typography>
            <Typography sx={{ my: 2, fontFamily: 'Nunito, sans-serif', color: 'text.secondary', opacity: 0.8 }}>{recipe.description}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Button
                variant="outlined"
                onClick={handleSaveRecipe}
                disabled={isSaved}
                sx={{ 
                  fontWeight: 700, 
                  fontFamily: 'Nunito, sans-serif', 
                  textTransform: 'none', 
                  borderWidth: 2, 
                  borderRadius: 2, 
                  px: 3, 
                  boxShadow: 'none',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: '#f7f7fa',
                    color: '#5a6fd8',
                    border: '2px solid #5a6fd8',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
                  }
                }}
              >
                {isSaved ? 'Recipe Saved!' : 'Save This Recipe'}
              </Button>
            </Box>
            {recipe.ingredients && recipe.instructions && (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 3 }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#667eea' }}>Ingredients</Typography>
                  <List dense sx={{ width: '100%' }}>
                    {recipe.ingredients.map((item, index) => (
                      <ListItem key={index} alignItems="flex-start" sx={{ pl: 0 }}>
                        <ListItemIcon sx={{ minWidth: '40px', mt: '4px' }}>
                          <Typography sx={{ fontWeight: 'bold', fontFamily: 'Nunito, sans-serif', color: '#667eea' }}>{index + 1}.</Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={item}
                          sx={{
                            fontFamily: 'Nunito, sans-serif',
                            '& .MuiListItemText-primary': {
                              fontFamily: 'Nunito, sans-serif',
                              fontWeight: 400,
                              lineHeight: 1.6,
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#667eea' }}>Instructions</Typography>
                  <List sx={{ width: '100%' }}>
                    {recipe.instructions.map((step, index) => {
                      const cleanStep = step.replace(/^\s*\d+\.?\s*/, '');
                      return (
                        <ListItem key={index} alignItems="flex-start" sx={{ pl: 0 }}>
                          <ListItemIcon sx={{ minWidth: '40px', mt: '4px' }}>
                            <Typography sx={{ fontWeight: 'bold', fontFamily: 'Nunito, sans-serif', color: '#667eea' }}>{index + 1}.</Typography>
                          </ListItemIcon>
                          <ListItemText 
                            primary={cleanStep} 
                            sx={{ 
                              fontFamily: 'Nunito, sans-serif',
                              '& .MuiListItemText-primary': {
                                fontFamily: 'Nunito, sans-serif',
                                fontWeight: 400,
                                lineHeight: 1.6,
                              }
                            }} 
                          />
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
    </Container>
  );
};

export default HomePage;
