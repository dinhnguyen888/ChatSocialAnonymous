// App.tsx

import React, { useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import FriendList from './friendList';
import ChatBox from './chatBox';
import MenuButton from './menuButton';
import { SignUp } from './SignUp';
import { Login } from './SignIn';

import { useChatAppStore } from '../stores/countStateStore'; // Điều chỉnh đường dẫn tới reloadStore
import { useMessage } from '../stores/messageStore';
import socket from '../services/socket';
import VideoCall from './VIdeoCall';
const ChatApp: React.FC = () => {
  const { reload,status,checkStatus } = useChatAppStore();
 

  // Example: Listen to changes in reload and do something
  useEffect(() => {
    socket.on('connect',() =>{
      checkStatus()
    })
    console.log('Reloaded:', reload);
  }, [reload]);

  return (
    <Router>
      <Routes>
      <Route path="/video-call" element={<VideoCall />} />
        <Route path="/" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
       
        <Route
          path="/chat"
          element={
            <Box sx={{ height: '100vh' }}>
              <Grid container sx={{ height: '100%' }}>
                <Grid item xs={3} sx={{ borderRight: '1px solid #ddd' }}>
                  <MenuButton />
                  <FriendList />
                </Grid>
                <Grid item xs={9}>
                  <ChatBox />
                </Grid>
              </Grid>
            </Box>
          }
        />
        {/* Example: Redirect to login if route not found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default ChatApp;
