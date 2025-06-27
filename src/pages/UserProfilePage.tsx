// src/pages/UserProfilePage.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
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
          {user?.displayName ? user.displayName.split(' ')[0] + "'s Profile" : 'My Profile'}
        </Typography>

        <Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2, fontFamily: 'Nunito, sans-serif', opacity: 0.8 }}>
          {joinDate}
        </Typography>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Nunito, sans-serif', color: '#667eea' }}>{savedRecipes.length}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Nunito, sans-serif' }}>Recipes Saved</Typography>
        </Box>

        <Divider sx={{ mb: 3, fontFamily: 'Nunito, sans-serif' }} />

        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#667eea' }}>My Saved Recipes</Typography>
        <TextField
          fullWidth
          label="Search recipes..."
          placeholder="Search by title, description, or ingredients"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}
          InputLabelProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
          inputProps={{ style: { fontFamily: 'Nunito, sans-serif' } }}
        />
        <List sx={{ width: '100%', maxWidth: 700, mx: 'auto' }}>
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map(recipe => (
              <Box
                key={recipe.id}
                sx={{
                  width: '100%',
                  mb: 2,
                  p: 2,
                  border: '1.5px solid #e0e0e0',
                  borderRadius: 3,
                  background: '#f7f7fa',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                  boxShadow: 'none',
                  '&:hover': { boxShadow: '0 2px 12px rgba(102, 126, 234, 0.08)' },
                  fontFamily: 'Nunito, sans-serif',
                }}
                onClick={() => handleRecipeClick(recipe)}
              >
                <Typography variant="h6" sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#667eea', textAlign: 'left' }}>{recipe.title}</Typography>
                <Typography sx={{ fontFamily: 'Nunito, sans-serif', color: 'text.secondary', textAlign: 'left', mb: 1 }}>{recipe.description}</Typography>
              </Box>
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
      {/* Recipe Dialog */}
      <Dialog open={Boolean(selectedRecipe)} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Nunito, sans-serif', color: '#667eea' }}>
          {selectedRecipe?.title}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
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

export default UserProfilePage;
