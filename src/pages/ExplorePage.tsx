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
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../auth/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';

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

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) {
        setLoading(false);
        setError("You must be logged in to see recommendations.");
        return;
      }
      try {
        setLoading(true);
        setError('');
        const functions = getFunctions(app, 'us-central1');
        const getRecommendedRecipesFn = httpsCallable(functions, 'getRecommendedRecipes');
        const result = await getRecommendedRecipesFn();
        const recommendedData = result.data as RecommendedRecipe[];
        setRecommendations(recommendedData);
      } catch (err: any) {
        console.error("Error fetching recommendations:", err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [user]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % recommendations.length);
  };

  const handleBack = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + recommendations.length) % recommendations.length);
  };
  
  const handleRecipeClick = (recipe: RecommendedRecipe) => {
    setSelectedRecipe(recipe);
  };
  
  const handleCloseDialog = () => {
    setSelectedRecipe(null);
  };

  const currentRecipe = recommendations[currentIndex];

  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Explore Recipes
          </Typography>
          <Button variant="outlined" onClick={() => setPage('home')}>
            Back to Generator
          </Button>
        </Box>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Based on your most used ingredients, here are some new ideas you might like!
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}

        {!loading && !error && currentRecipe && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <IconButton onClick={handleBack} disabled={recommendations.length <= 1}>
              <ArrowBackIosNewIcon />
            </IconButton>
            <Card 
              variant="outlined" 
              sx={{ flexGrow: 1, minHeight: 150 }}
            >
              <CardActionArea onClick={() => handleRecipeClick(currentRecipe)} sx={{ height: '100%', p: 2 }}>
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>{currentRecipe.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{currentRecipe.description}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
            <IconButton onClick={handleNext} disabled={recommendations.length <= 1}>
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
        )}
         {!loading && !error && recommendations.length === 0 && (
            <Typography textAlign="center" color="text.secondary" sx={{mt: 4}}>
              No recommendations available yet. Try generating more recipes to build your taste profile!
            </Typography>
         )}
      </Box>

      <Dialog open={Boolean(selectedRecipe)} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {selectedRecipe?.title}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>{selectedRecipe?.description}</Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>Ingredients</Typography>
              <List dense>
                {selectedRecipe?.ingredients?.map((item, index) => (
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
                {selectedRecipe?.instructions?.map((step, index) => (
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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExplorePage;
