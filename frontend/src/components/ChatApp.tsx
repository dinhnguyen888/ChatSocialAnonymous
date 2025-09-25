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
import { useUserStore } from '../stores/userStore';
import { deleteGuestAccount } from '../services/apiAccount';
import VideoCall from './VIdeoCall';
const ChatApp: React.FC = () => {
  const { reload,status,checkStatus } = useChatAppStore();
  const user = useUserStore((s) => s.userData);
 

  // Example: Listen to changes in reload and do something
  useEffect(() => {
    socket.on('connect',() =>{
      checkStatus()
    })
    console.log('Reloaded:', reload);
  }, [reload]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (user?.role === 'Guest' && user?.id) {
        const confirmationMessage = 'Bạn đang dùng tài khoản Guest. Rời trang sẽ xoá tài khoản tạm?';
        e.preventDefault();
        e.returnValue = confirmationMessage;
        return confirmationMessage;
      }
      return undefined as any;
    };

    const handleUnload = async () => {
      if (user?.role === 'Guest' && user?.id) {
        try { await deleteGuestAccount(user.id); } catch {}
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [user?.role, user?.id]);

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
