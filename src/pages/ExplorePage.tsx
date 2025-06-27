// src/pages/ExplorePage.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardActionArea,
  CardContent,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CardActions,
  Container,
  Divider,
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
    } catch (err) {
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
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7fa', fontFamily: 'Nunito, sans-serif' }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, width: '100%', borderRadius: 3 }}>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, fontFamily: 'Nunito, sans-serif' }}>
          {/* Nav Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 3, gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Nunito, sans-serif', letterSpacing: 1 }}>
              Pantry Pilot
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={() => setPage('HomePage')} sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, textTransform: 'none', px: 2 }}>
                Home
              </Button>
              <Button variant="outlined" onClick={() => setPage('UserProfilePage')} sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, textTransform: 'none', px: 2 }}>
                My Profile
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 1, fontFamily: 'Nunito, sans-serif' }} />

          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1, fontFamily: 'Nunito, sans-serif' }}>
            Explore Recipes
          </Typography>

          <Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 3, fontFamily: 'Nunito, sans-serif' }}>
            Based on your most used ingredients, here are some new ideas you might like!
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              variant="outlined"
              onClick={handleRefreshRecipes}
              disabled={loading}
              sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, textTransform: 'none', px: 3 }}
            >
              {loading ? <CircularProgress size={20} /> : 'Get More Recipes'}
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mt: 2, textAlign: 'center', fontFamily: 'Nunito, sans-serif' }}>{error}</Alert>}

          {!loading && !error && currentRecipe && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <IconButton onClick={handleBack} disabled={recommendations.length <= 1} sx={{ fontFamily: 'Nunito, sans-serif' }}>
                <ArrowBackIosNewIcon />
              </IconButton>
              <Card variant="outlined" sx={{ flexGrow: 1, minHeight: 150, display: 'flex', flexDirection: 'column', fontFamily: 'Nunito, sans-serif' }}>
                <CardActionArea onClick={() => handleRecipeClick(currentRecipe)} sx={{ flexGrow: 1 }}>
                  <CardContent>
                    <Typography variant="h5" component="div" gutterBottom sx={{ fontFamily: 'Nunito, sans-serif' }}>
                      {currentRecipe.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Nunito, sans-serif' }}>
                      {currentRecipe.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<BookmarkAddIcon />}
                    onClick={() => handleSaveRecipe(currentRecipe)}
                    disabled={savedRecipeTitles.has(currentRecipe.title)}
                    sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, textTransform: 'none' }}
                  >
                    {savedRecipeTitles.has(currentRecipe.title) ? 'Saved' : 'Save Recipe'}
                  </Button>
                </CardActions>
              </Card>
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
      </Paper>

      <Dialog open={Boolean(selectedRecipe)} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontFamily: 'Nunito, sans-serif' }}>
          {selectedRecipe?.title}
          <IconButton aria-label="close" onClick={handleCloseDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ fontFamily: 'Nunito, sans-serif' }}>
          <Typography gutterBottom sx={{ fontFamily: 'Nunito, sans-serif' }}>{selectedRecipe?.description}</Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Nunito, sans-serif' }}>Ingredients</Typography>
              <List dense>
                {selectedRecipe?.ingredients?.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={<span style={{ fontFamily: 'Nunito, sans-serif' }}>{`${index + 1}. ${item}`}</span>}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box sx={{ flex: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Nunito, sans-serif' }}>Instructions</Typography>
              <List>
                {selectedRecipe?.instructions?.map((step, index) => {
                  const cleanStep = step.replace(/^\s*\d+\.?\s*/, '');
                  return (
                    <ListItem key={index} alignItems="flex-start">
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
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ExplorePage;
