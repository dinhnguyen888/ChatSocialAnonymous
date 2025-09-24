import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Grid, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { changePasswordAccount, changeNameAccount } from '../services/apiAccount'; // Adjust the path as necessary
import { useUserStore } from '../stores/userStore';

const PersonalInfo: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
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



  const handlePasswordToggle = () => {
    setIsChangingPassword(!isChangingPassword);
  };

  const handlePasswordChange = async () => {
    // Validate new password and confirm password
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    } else {
      setConfirmPasswordError('');
    }

    try {
      const userId = userData.id!;
       // Assuming user id is stored in localStorage
      await changePasswordAccount(userId, newPassword);
      console.log('Password changed');
      // Reset password fields after change
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false); // Close password change form after change
    } catch (error) {
      console.error('Failed to change password', error);
    }
  };

  return (
    <Paper elevation={3} style={{ padding: '40px', margin: '20px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
      <Box mb={3}>
        <Typography variant="body1">
          <strong>Name:</strong>
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
        {!isEditingName && (
          <Grid container spacing={2} style={{ marginTop: '20px' }}>
            <Grid item xs={6}>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePasswordToggle}
                fullWidth
              >
                Change Password
              </Button>
            </Grid>
          </Grid>
        )}
        {isChangingPassword && (
          <Box component="form" noValidate autoComplete="off" mt={3}>
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              margin="normal"
              size="small"
            />
            <TextField
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              margin="normal"
              size="small"
            />
            <Grid container spacing={2} style={{ marginTop: '20px' }}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePasswordChange}
                  fullWidth
                >
                  Change Password
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handlePasswordToggle}
                  fullWidth
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default PersonalInfo;
