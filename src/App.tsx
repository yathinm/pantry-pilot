import React from 'react';
import SignupPage from './components/SignupPage';

import { Box } from '@mui/material';

function App() {

  const handlePageChange = (page: string) => {
    console.log("Would switch to page:", page);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'white.100', 
      }}
    >
      <SignupPage setPage={handlePageChange} />
    </Box>
  );
}

export default App;