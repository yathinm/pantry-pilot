// src/pages/UserProfilePage.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; 
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../auth/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';

interface UserProfilePageProps {
  setPage: (page: string) => void;
}

// Define a type for our saved recipe data, including its ID
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

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

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
    return <CircularProgress />;
  }

  return (
    <>
      <Box sx={{ textAlign: 'center' }}>
        
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          {user?.displayName || 'My Profile'}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {joinDate}
        </Typography>

        <Stack direction="row" spacing={4} sx={{ mb: 3, justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{savedRecipes.length}</Typography>
            <Typography variant="caption" color="text.secondary">Recipes Saved</Typography>
          </Box>
        </Stack>

        <Divider sx={{ width: '100%', mb: 3 }} />

        <Typography variant="h5" gutterBottom>My Saved Recipes</Typography>
        
        <List sx={{ width: '100%' }}>
          {savedRecipes.length > 0 ? (
            savedRecipes.map(recipe => (
              <Card 
                key={recipe.id}
                variant="outlined" 
                sx={{ width: '100%', mb: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => handleRecipeClick(recipe)}
              >
                <CardContent>
                  <ListItemText
                    primary={recipe.title}
                    secondary={recipe.description}
                  />
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography textAlign="center" color="text.secondary">You haven't saved any recipes yet.</Typography>
          )}
        </List>

        <Box sx={{ mt: 3, width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button variant="outlined" onClick={() => setPage('HomePage')}>Back to Home</Button>
          <Button variant="contained" onClick={handleLogout}>Log Out</Button>
        </Box>
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

export default UserProfilePage;
