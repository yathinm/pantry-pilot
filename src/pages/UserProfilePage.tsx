// src/pages/UserProfilePage.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  ListItemIcon,
  Container,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; 
import { useAuth } from '../auth/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';

interface UserProfilePageProps {
  setPage: (page: string) => void;
}

interface SavedRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ setPage }) => {
  const { user } = useAuth();
  const [joinDate, setJoinDate] = useState('');
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<SavedRecipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const createdAtTimestamp = userData.createdAt as Timestamp;
          if (createdAtTimestamp) {
            const date = createdAtTimestamp.toDate();
            const formattedDate = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            setJoinDate(`Member since ${formattedDate}`);
          }
        }

        const recipesColRef = collection(db, 'users', user.uid, 'recipes');
        const q = query(recipesColRef, orderBy('savedAt', 'desc'));
        const recipesSnap = await getDocs(q);
        const recipesData = recipesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as SavedRecipe[];
        setSavedRecipes(recipesData);
        setFilteredRecipes(recipesData);

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecipes(savedRecipes);
    } else {
      const filtered = savedRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, savedRecipes]);

  const handleRecipeClick = (recipe: SavedRecipe) => {
    setSelectedRecipe(recipe);
  };
  const handleCloseDialog = () => {
    setSelectedRecipe(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

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
              <Button variant="outlined" onClick={() => setPage('ExplorePage')} sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, textTransform: 'none', px: 2 }}>
                Explore
              </Button>
              <Button variant="contained" onClick={handleLogout} sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, textTransform: 'none', px: 2 }}>
                Log Out
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 1, fontFamily: 'Nunito, sans-serif' }} />

          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1, fontFamily: 'Nunito, sans-serif' }}>
            {user?.displayName ? user.displayName.split(' ')[0] : 'My Profile'}
          </Typography>

          <Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2, fontFamily: 'Nunito, sans-serif' }}>
            {joinDate}
          </Typography>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Nunito, sans-serif' }}>{savedRecipes.length}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Nunito, sans-serif' }}>Recipes Saved</Typography>
          </Box>

          <Divider sx={{ mb: 3, fontFamily: 'Nunito, sans-serif' }} />

          <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Nunito, sans-serif' }}>My Saved Recipes</Typography>
          
          <TextField
            fullWidth
            label="Search recipes..."
            placeholder="Search by title, description, or ingredients"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
            inputProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
          />
          
          <List sx={{ width: '100%' }}>
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map(recipe => (
                <Card 
                  key={recipe.id}
                  variant="outlined" 
                  sx={{ 
                    width: '100%', 
                    mb: 1.5, 
                    cursor: 'pointer', 
                    '&:hover': { bgcolor: 'action.hover' },
                    fontFamily: 'Nunito, sans-serif'
                  }}
                  onClick={() => handleRecipeClick(recipe)}
                >
                  <CardContent>
                    <ListItemText
                      primary={<span style={{ fontFamily: 'Nunito, sans-serif' }}>{recipe.title}</span>}
                      secondary={<span style={{ fontFamily: 'Nunito, sans-serif' }}>{recipe.description}</span>}
                    />
                  </CardContent>
                </Card>
              ))
            ) : searchQuery.trim() !== '' ? (
              <Typography textAlign="center" color="text.secondary" sx={{ fontFamily: 'Nunito, sans-serif' }}>
                No recipes found matching "{searchQuery}".
              </Typography>
            ) : (
              <Typography textAlign="center" color="text.secondary" sx={{ fontFamily: 'Nunito, sans-serif' }}>
                You haven't saved any recipes yet.
              </Typography>
            )}
          </List>
        </Box>
      </Paper>

      <Dialog open={Boolean(selectedRecipe)} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontFamily: 'Nunito, sans-serif' }}>
          {selectedRecipe?.title}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
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

export default UserProfilePage;
