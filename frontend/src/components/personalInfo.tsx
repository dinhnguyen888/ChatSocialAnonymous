import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Paper } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
// Removed change password functionality
import { useUserStore } from '../stores/userStore';

const PersonalInfo: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  // Removed password change functionality
  const getUserData = useUserStore((state) => state.getUserData)
  const setUserData = useUserStore((state) => state.setUserData)
  const userData = getUserData()
  useEffect(() => {
    
    setName(userData.name)
    setEmail(userData.email)
    
  }, [userData]);

  const handleNameEditToggle = () => {
    setIsEditingName(!isEditingName);
  };



  // Removed password change functionality

  return (
    <Paper elevation={3} style={{ padding: '40px', margin: '20px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
      <Box mb={3}>
        <Typography variant="body1">
          <strong>Họ và tên:</strong>
          {isEditingName ? (
            <TextField
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              size="small"
              autoFocus
            />
          ) : (
            <React.Fragment>{name}</React.Fragment>
          )}
       
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Email:</strong> {email}
        </Typography>
        {/* Removed password change functionality */}
      </Box>
    </Paper>
  );
};

export default PersonalInfo;
