// App.tsx
import React from 'react';
import { Box } from '@mui/material';
import SignupPage from './components/SignupPage';

function App() {
  const handlePageChange = (page: string) => {
    console.log('Switch to page:', page);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',     
        width: '100%',
        display: 'flex',
        alignItems: 'center',   
        justifyContent: 'center', 
        bgcolor: 'white',       
      }}
    >
      <SignupPage setPage={handlePageChange} />
    </Box>
  );
}

export default App;
