// src/pages/ExplorePage.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import { useAuth } from '../auth/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, query } from 'firebase/firestore';

interface ExplorePageProps {
  setPage: (page: string) => void;
}

interface RecommendedRecipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

const ExplorePage: React.FC<ExplorePageProps> = ({ setPage }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedRecipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<RecommendedRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [savedRecipeTitles, setSavedRecipeTitles] = useState<Set<string>>(new Set());
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) {
        setLoading(false);
        setError("You must be logged in.");
        return;
      }
      try {
        setLoading(true);
        setError('');

        const savedRecipesQuery = query(collection(db, 'users', user.uid, 'recipes'));
        const querySnapshot = await getDocs(savedRecipesQuery);
        const titles = new Set(querySnapshot.docs.map(doc => doc.data().title));
        setSavedRecipeTitles(titles);

        const functions = getFunctions(app, 'us-central1');
        const getRecommendedRecipesFn = httpsCallable(functions, 'getRecommendedRecipes');
        const result = await getRecommendedRecipesFn();
        setRecommendations(result.data as RecommendedRecipe[]);

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
    fetchInitialData();
  }, [user]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % recommendations.length);
  const handleBack = () => setCurrentIndex((prev) => (prev - 1 + recommendations.length) % recommendations.length);
  const handleRecipeClick = (recipe: RecommendedRecipe) => setSelectedRecipe(recipe);
  const handleCloseDialog = () => setSelectedRecipe(null);

  const handleSaveRecipe = async (recipeToSave: RecommendedRecipe) => {
    if (!user || !recipeToSave) return;
    try {
      const recipesCollectionRef = collection(db, 'users', user.uid, 'recipes');
      await addDoc(recipesCollectionRef, {
        ...recipeToSave,
        savedAt: serverTimestamp(),
      });
      setSavedRecipeTitles(prev => new Set(prev).add(recipeToSave.title));
    } catch {
      setError("Failed to save recipe.");
    }
  };

  const handleRefreshRecipes = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      
      const functions = getFunctions(app, 'us-central1');
      const getRecommendedRecipesFn = httpsCallable(functions, 'getRecommendedRecipes');
      const result = await getRecommendedRecipesFn();
      const newRecipes = result.data as RecommendedRecipe[];
      
      // Replace existing recommendations with new ones
      setRecommendations(newRecipes);
      setCurrentIndex(0); // Reset to first recipe
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

  const currentRecipe = recommendations[currentIndex];

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7fa' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: '6px solid #e0e0e0',
              borderTop: '6px solid #667eea',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography sx={{ fontFamily: 'Nunito, sans-serif', color: '#667eea', fontWeight: 700, mt: 2 }}>Loading recipes...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7fa' }}>
      <Box sx={{
        width: '100%',
        maxWidth: 800,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'Nunito, sans-serif',
        textAlign: 'center',
      }}>
        {/* Nav Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2, gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Nunito, sans-serif', letterSpacing: 1, color: '#667eea' }}>
            Pantry Pilot
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              onClick={() => setPage('HomePage')} 
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
              Home
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
          </Box>
        </Box>

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
          Explore Recipes
        </Typography>

        <Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 3, fontFamily: 'Nunito, sans-serif', opacity: 0.8 }}>
          Based on your most used ingredients, here are some new ideas you might like!
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleRefreshRecipes}
            disabled={loading}
            sx={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
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
            {loading ? <CircularProgress size={20} /> : 'Get More Recipes'}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2, textAlign: 'center', fontFamily: 'Nunito, sans-serif' }}>{error}</Alert>}

        {!loading && !error && currentRecipe && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, width: '100%' }}>
            <IconButton onClick={handleBack} disabled={recommendations.length <= 1} sx={{ fontFamily: 'Nunito, sans-serif' }}>
              <ArrowBackIosNewIcon />
            </IconButton>
            <Box
              sx={{
                flexGrow: 1,
                minHeight: 150,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                background: '#f7f7fa',
                border: '1.5px solid #e0e0e0',
                borderRadius: 3,
                p: 3,
                boxShadow: 'none',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 2px 12px rgba(102, 126, 234, 0.08)' },
                fontFamily: 'Nunito, sans-serif',
                width: '100%',
                maxWidth: 600,
                mx: 'auto',
                cursor: 'pointer',
              }}
              onClick={() => handleRecipeClick(currentRecipe)}
            >
              <Typography variant="h5" sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#667eea', mb: 1 }}>{currentRecipe.title}</Typography>
              <Typography sx={{ fontFamily: 'Nunito, sans-serif', color: 'text.secondary', mb: 2 }}>{currentRecipe.description}</Typography>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<BookmarkAddIcon />}
                  onClick={e => { e.stopPropagation(); handleSaveRecipe(currentRecipe); }}
                  disabled={savedRecipeTitles.has(currentRecipe.title)}
                  sx={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700,
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
                    },
                  }}
                >
                  {savedRecipeTitles.has(currentRecipe.title) ? 'Saved' : 'Save Recipe'}
                </Button>
              </Box>
            </Box>
            <IconButton onClick={handleNext} disabled={recommendations.length <= 1} sx={{ fontFamily: 'Nunito, sans-serif' }}>
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
        )}
        {!loading && !error && recommendations.length === 0 && (
          <Typography textAlign="center" color="text.secondary" sx={{ mt: 4, fontFamily: 'Nunito, sans-serif' }}>
            No recommendations yet.
          </Typography>
        )}
      </Box>

      <Dialog open={Boolean(selectedRecipe)} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Nunito, sans-serif', color: '#667eea' }}>
          {selectedRecipe?.title}
          <IconButton aria-label="close" onClick={handleCloseDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ fontFamily: 'Nunito, sans-serif', background: '#f7f7fa' }}>
          <Typography gutterBottom sx={{ fontFamily: 'Nunito, sans-serif', color: 'text.secondary', opacity: 0.8 }}>{selectedRecipe?.description}</Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#667eea' }}>Ingredients</Typography>
              <List dense>
                {selectedRecipe?.ingredients?.map((item, index) => (
                  <ListItem key={index} alignItems="flex-start">
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
            <Box sx={{ flex: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#667eea' }}>Instructions</Typography>
              <List>
                {selectedRecipe?.instructions?.map((step, index) => {
                  const cleanStep = step.replace(/^\s*\d+\.?\s*/, '');
                  return (
                    <ListItem key={index} alignItems="flex-start">
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
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ExplorePage;
