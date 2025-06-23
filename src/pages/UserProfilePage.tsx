// src/pages/UserProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Stack, Divider, CircularProgress } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs, Timestamp } from 'firebase/firestore';

interface UserProfilePageProps {
  setPage: (page: string) => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ setPage }) => {
  const { user } = useAuth();
  const [joinDate, setJoinDate] = useState('');
  const [recipeCount, setRecipeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const createdAtTimestamp = userData.createdAt as Timestamp;
          if (createdAtTimestamp) {
            const date = createdAtTimestamp.toDate();
            const formattedDate = date.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            });
            setJoinDate(`Member since ${formattedDate}`);
          }
        }

        const recipesColRef = collection(db, 'users', user.uid, 'recipes');
        const recipesSnap = await getDocs(recipesColRef);
        setRecipeCount(recipesSnap.size);

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]); 

  const handleLogout = async () => {
    await signOut(auth);
  };
  
  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
        {user?.displayName || 'My Profile'}
      </Typography>

      <Typography variant="body1" color="text.secondary">
        {user?.email}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {joinDate}
      </Typography>


      <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{recipeCount}</Typography>
          <Typography variant="caption" color="text.secondary">Recipes Saved</Typography>
        </Box>
      </Stack>

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button variant="outlined" onClick={() => setPage('home')}>Back to Home</Button>
        <Button variant="contained" onClick={handleLogout}>Log Out</Button>
      </Box>
      
    </Box>
  );
};

export default UserProfilePage;