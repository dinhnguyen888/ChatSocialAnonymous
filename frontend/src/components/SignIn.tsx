import * as React from 'react';
import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { getUserByID, guestQuickStart, loginWithOTP, validateOTP } from '../services/apiAccount';
import socket, { setSocketAuthToken } from '../services/socket';
import {useUserStore, User} from '../stores/userStore';

function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link to="https://mui.com/" style={{ color: 'inherit' }}>
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

export const Login = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUserData = useUserStore((state) => state.setUserData)
  
  useEffect(() => {
    if (!otpMode) {
      setOtpSent(false);
      setOtp('');
    }
  }, [otpMode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await guestQuickStart(name);
      const userAccount = await getUserByID(response.id);
      const userData: User = {
          id: userAccount._id!,
          email: userAccount.email || '',
          name: userAccount.name || name,
          token: response.token,
          role: 'Guest'
      };
      setUserData(userData);
      // refresh socket auth and reconnect using the new JWT
      localStorage.setItem('token', response.token);
      setSocketAuthToken(response.token);
      // reload friend-related data
      socket.emit('showAllFriends', userData.id);
      socket.emit('getAllRoomById', userData.id);
      socket.emit('showRequest', userData.id);
      console.log('Guest quickstart successful:', response);
      console.log('Check user account info:', userAccount);
      console.log('Check user data:', userData);
      alert('Welcome, Guest!');
      navigate('/chat');
    } catch (error) {
      console.error('Error during guest quickstart:', error);
      alert('Guest quickstart failed');
    } finally {
      setLoading(false);
    }
  };


  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await loginWithOTP({ email });
      console.log('OTP sent');
      alert(`OTP was sent to ${email}`);
      setOtpSent(true);
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert(error);
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
          name: userAccount.name!,
          token: response.token,
          role: 'User'
      };
      setUserData(userData);
      // refresh socket auth and reconnect using the new JWT
      localStorage.setItem('token', response.token);
      setSocketAuthToken(response.token);
      // reload friend-related data
      socket.emit('showAllFriends', userData.id);
      socket.emit('getAllRoomById', userData.id);
      socket.emit('showRequest', userData.id);
      console.log('OTP validation successful:', response);
      alert('OTP validation successful');
     window.location.href = '/chat';
    //  navigate('/chat')
    } catch (error) {
      console.error('Error validating OTP:', error);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithOtp = () => {
    setOtpMode(true);
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
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {!otpMode ? (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Your Name"
                  name="name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                  label="Remember me"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Quick Start as Guest'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleLoginWithOtp}
                  sx={{ mt: 1 }}
                >
                  Login with OTP
                </Button>
              </>
            ) : (
              <>
                {!otpSent ? (
                  <>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="name"
                      label="Your Name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSendOtp}
                      sx={{ mt: 3, mb: 2 }}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Send OTP'}
                    </Button>
                  </>
                ) : (
                  <>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="otp"
                      label="OTP"
                      type="text"
                      id="otp"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleValidateOtp}
                      sx={{ mt: 3, mb: 2 }}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Validate OTP'}
                    </Button>
                  </>
                )}
              </>
            )}
            <Grid container>
              <Grid item xs>
                {otpMode && (
                  <Link to="#" className='underline text-sm text-blue-500 hover:"' onClick={() => setOtpMode(false)}>
                    Back To Normal Login
                  </Link>
                )}
              </Grid>
              <Grid item>
                <Link to="/sign-up" className='underline text-sm text-blue-500 hover:"'>
                  {"Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
};
