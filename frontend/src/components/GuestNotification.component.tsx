import React, { useState } from 'react';
import { 
  Box, 
  Alert, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import { linkEmailToGuest, verifyEmailLink } from '../services/apiAccount';
import { useUserStore } from '../stores/userStore';
import socket, { setSocketAuthToken } from '../services/socket';

interface GuestNotificationProps {
  onEmailLinked: () => void;
}

const GuestNotification: React.FC<GuestNotificationProps> = ({ onEmailLinked }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const user = useUserStore((state) => state.userData);
  const setUserData = useUserStore((state) => state.setUserData);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setError('');
    setOtpSent(false);
    setOtp('');
    setEmail('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
    setOtpSent(false);
    setOtp('');
    setEmail('');
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await linkEmailToGuest(user.id!, email.trim());
      setOtpSent(true);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError('Vui lòng nhập mã OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await verifyEmailLink(user.id!, email.trim(), otp.trim());
      
      // Update user data with new token and role
      const updatedUser = {
        ...user,
        email: email.trim(),
        role: 'User' as const,
        token: response.token
      };
      setUserData(updatedUser);
      
      // Update localStorage and socket auth
      localStorage.setItem('token', response.token);
      setSocketAuthToken(response.token);
      
      // Reload socket data for new user role
      socket.emit('showAllFriends', user.id);
      socket.emit('getAllRoomById', user.id);
      socket.emit('showRequest', user.id);
      
      handleCloseDialog();
      onEmailLinked();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Mã OTP không đúng');
    } finally {
      setLoading(false);
    }
  };

  if (user.role !== 'Guest') {
    return null;
  }

  return (
    <>
      <Box sx={{ mb: 2 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <Alert 
          severity="warning" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<EmailIcon />}
              onClick={handleOpenDialog}
            >
              Liên kết email
            </Button>
          }
        >
          <Typography variant="body2">
            Bạn đang sử dụng tài khoản Guest. Tài khoản sẽ bị xóa khi thoát trình duyệt. 
            Liên kết email để bảo vệ tài khoản.
          </Typography>
        </Alert>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Liên kết email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Nhập email của bạn để liên kết với tài khoản Guest hiện tại.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!otpSent ? (
            <TextField
              autoFocus
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          ) : (
            <>
              <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                Mã OTP đã được gửi đến {email}
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Mã OTP"
                type="text"
                fullWidth
                variant="outlined"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
                placeholder="Nhập mã OTP 6 số"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Hủy
          </Button>
          {!otpSent ? (
            <Button 
              onClick={handleSendOTP} 
              variant="contained" 
              disabled={loading || !email.trim()}
            >
              {loading ? <CircularProgress size={20} /> : 'Gửi OTP'}
            </Button>
          ) : (
            <Button 
              onClick={handleVerifyOTP} 
              variant="contained" 
              disabled={loading || !otp.trim()}
            >
              {loading ? <CircularProgress size={20} /> : 'Xác thực'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GuestNotification;
