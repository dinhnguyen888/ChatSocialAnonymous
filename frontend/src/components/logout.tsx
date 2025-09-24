import React from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {useUserStore} from '../stores/userStore';

interface LogoutConfirmationProps {
  open: boolean;
  onClose: () => void;
}

const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({ open, onClose }) => {
  const removeUserData = useUserStore((state) => state.removeUserData);
  const navigate = useNavigate();

  const handleLogout = () => {
    removeUserData();
    localStorage.clear();
    navigate('/');
    console.log('User logged out');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Logout Confirmation</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to logout?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleLogout} color="primary">
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutConfirmation;
