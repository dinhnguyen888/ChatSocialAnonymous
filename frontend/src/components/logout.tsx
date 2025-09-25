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
      <DialogTitle>Xác nhận đăng xuất</DialogTitle>
      <DialogContent>
        <Typography>Bạn có chắc chắn muốn đăng xuất không?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Hủy
        </Button>
        <Button onClick={handleLogout} color="primary">
          Đăng xuất
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutConfirmation;
