import React from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {useUserStore} from '../stores/userStore';
import { setSocketAuthToken } from '../services/socket';

interface LogoutConfirmationProps {
  open: boolean;
  onClose: () => void;
  onGuestLogout?: () => Promise<void>;
}

const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({ open, onClose, onGuestLogout }) => {
  const removeUserData = useUserStore((state) => state.removeUserData);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const user = useUserStore.getState().userData;
    
    if (user.role === 'Guest' && onGuestLogout) {
      // Đối với Guest, sử dụng callback để hiển thị loading dialog
      onClose(); // Đóng dialog xác nhận trước
      await onGuestLogout();
    } else {
      // Đối với User thường, logout bình thường
      removeUserData();
      setSocketAuthToken('');
      navigate('/');
      onClose();
    }
    
    console.log('User logged out');
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
