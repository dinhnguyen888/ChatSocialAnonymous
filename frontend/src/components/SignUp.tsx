import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';

import { registerWithOTP, validateOTP, getUserByID } from '../services/apiAccount'
import socket, { setSocketAuthToken } from '../services/socket';
import { useUserStore, User } from '../stores/userStore';


const defaultTheme = createTheme();



export const SignUp = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const setUserData = useUserStore((s) => s.setUserData);

  const handleSendRegisterOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerWithOTP({ email, name });
      setOtpSent(true);
      alert(`OTP đã được gửi tới ${email}`);
    } catch (error) {
      console.error('Error sending register OTP:', error);
      alert('Gửi OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateOtp = async () => {
    setLoading(true);
    try {
      const response = await validateOTP({ email, otp });
      const userAccount = await getUserByID(response.id);
      const userData: User = {
        id: userAccount._id!,
        email: userAccount.email!,
        name: userAccount.name || name,
        token: response.token,
        role: 'User'
      };
      setUserData(userData);
      localStorage.setItem('token', response.token);
      setSocketAuthToken(response.token);
      socket.emit('showAllFriends', userData.id);
      socket.emit('getAllRoomById', userData.id);
      socket.emit('showRequest', userData.id);
      alert('Đăng ký và đăng nhập thành công');
      navigate('/chat');
    } catch (error) {
      console.error('Error validating OTP:', error);
      alert('Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Đăng ký
          </Typography>
          <Box component="form" noValidate onSubmit={handleSendRegisterOtp} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <TextField
                  autoComplete="given-name"
                  name="name"
                  required
                  fullWidth
                  id="name"
                  label="Họ và tên"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Địa chỉ Email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              {otpSent && (
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="otp"
                    label="Mã OTP"
                    type="text"
                    id="otp"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </Grid>
              )}
            </Grid>
            {!otpSent ? (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || !email || !name}
              >
                {loading ? <CircularProgress size={24} /> : 'Gửi OTP đăng ký'}
              </Button>
            ) : (
              <Button
                onClick={handleValidateOtp}
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || !otp}
              >
                {loading ? <CircularProgress size={24} /> : 'Xác thực OTP'}
              </Button>
            )}
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/" className='underline text-sm text-blue-500 hover:"'>
                  Đã có tài khoản? Đăng nhập
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
       <div className='mt-5'></div>
      </Container>
    </ThemeProvider>
  );
}
