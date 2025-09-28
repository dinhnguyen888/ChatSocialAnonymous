// Ứng dụng trò chuyện.tsx

import React, { useEffect, useState } from 'react';
import { Box, Grid, Dialog, DialogContent, CircularProgress, Typography } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import FriendList from './friendList';
import ChatBox from './chatBox';
import MenuButton from './menuButton';
import { SignUp } from './SignUp';
import { Login } from './SignIn';

import { useChatAppStore } from '../stores/countStateStore'; // Điều chỉnh đường dẫn tới reloadStore
import socket, { setSocketAuthToken } from '../services/socket';
import { useUserStore } from '../stores/userStore';
import { deleteGuestAccount } from '../services/apiAccount';
import { appConfig } from '../services/config';
import GuestNotification from './GuestNotification.component';
import VideoCall from './VIdeoCall';
// Component để bảo vệ route yêu cầu authentication
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useUserStore((s) => s.userData);
  
  // Kiểm tra xem user có token và role hợp lệ không
  const isAuthenticated = user.token && (user.role === 'User' || user.role === 'Guest');
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const ChatApp: React.FC = () => {
  const { reload, checkStatus } = useChatAppStore();
  const user = useUserStore((s) => s.userData);
  const setUserData = useUserStore((s) => s.setUserData);
  const removeUserData = useUserStore((s) => s.removeUserData);
  const [isDeletingGuest, setIsDeletingGuest] = useState(false);
  
  // Khởi tạo socket authentication khi app load
  useEffect(() => {
    // Thiết lập socket authentication nếu có token hợp lệ
    if (user.token) {
      setSocketAuthToken(user.token);
    }
    
    // Debug: Log current user state
    console.log('Current user state:', user);
  }, [user.token]);

  // Debug: Theo dõi sự thay đổi của user state
  useEffect(() => {
    console.log('User state changed:', user);
    console.log('User role:', user.role);
    console.log('Is authenticated:', user.token && (user.role === 'User' || user.role === 'Guest'));
  }, [user]);

  // Ví dụ: Lắng nghe các thay đổi trong reload và thực hiện hành động
  useEffect(() => {
    socket.on('connect',() =>{
      checkStatus()
    })
    console.log('Reloaded:', reload);
  }, [reload, checkStatus]);

  // Hàm xóa tài khoản Guest với loading UI
  const deleteGuestAccountWithLoading = async () => {
    if (!user?.id) return;
    
    setIsDeletingGuest(true);
    
    try {
      // Xóa tài khoản trên server
      await deleteGuestAccount(user.id);
      
      // Xóa hoàn toàn dữ liệu local cho Guest
      removeUserData();
      
      // Xóa socket authentication
      setSocketAuthToken('');
      
      // Xóa tất cả localStorage và sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Xóa tất cả cookies (nếu có)
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      console.log('Guest account deleted successfully');
      
      // Chờ một chút để user thấy thông báo hoàn thành
      setTimeout(() => {
        setIsDeletingGuest(false);
        window.location.href = '/';
      }, 1500);
      
    } catch (error) {
      console.error('Error deleting guest account:', error);
      setIsDeletingGuest(false);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (user?.role === 'Guest' && user?.id && !isDeletingGuest) {
        const confirmationMessage = 'Bạn đang dùng tài khoản Guest. Rời trang sẽ xoá tài khoản tạm?';
        e.preventDefault();
        e.returnValue = confirmationMessage;
        return confirmationMessage;
      }
      return undefined as any;
    };

    const handleUnload = () => {
      if (user?.role === 'Guest' && user?.id && !isDeletingGuest) {
        // Hiển thị loading trước khi xóa
        setIsDeletingGuest(true);
        
        // Sử dụng sendBeacon để đảm bảo request được gửi ngay cả khi trang đóng
        const deleteUrl = `${appConfig.apiBaseUrl}/guest/${user.id}`;
        
        try {
          // Thử sendBeacon trước (reliable cho page unload)
          if (navigator.sendBeacon) {
            navigator.sendBeacon(deleteUrl, JSON.stringify({ method: 'DELETE' }));
          } else {
            // Fallback cho browsers không support sendBeacon
            fetch(deleteUrl, {
              method: 'DELETE',
              keepalive: true
            }).catch(() => {});
          }
          
          // Xóa hoàn toàn dữ liệu local cho Guest
          removeUserData();
          
          // Xóa socket authentication
          setSocketAuthToken('');
          
          // Xóa tất cả localStorage và sessionStorage
          localStorage.clear();
          sessionStorage.clear();
          
          // Xóa tất cả cookies (nếu có)
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
          
          console.log('Guest account deletion initiated and all local data cleared');
        } catch (error) {
          console.error('Error during guest cleanup:', error);
        }
      }
    };

    // Xử lý khi user đóng tab/window
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && user?.role === 'Guest' && user?.id && !isDeletingGuest) {
        // Khi tab bị ẩn (có thể đang đóng), thực hiện cleanup với loading
        deleteGuestAccountWithLoading();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.role, user?.id, isDeletingGuest]);

  // Component để chuyển hướng từ trang chính
  const HomeRedirect: React.FC = () => {
    const user = useUserStore((s) => s.userData);
    const isAuthenticated = user.token && (user.role === 'User' || user.role === 'Guest');
    
    if (isAuthenticated) {
      return <Navigate to="/chat" replace />;
    }
    
    return <Login />;
  };

  return (
    <>
      <Router>
        <Routes>
          <Route path="/video-call" element={<VideoCall />} />
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/sign-up" element={<SignUp />} />
         
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Box sx={{ height: '100vh' }}>
                  <GuestNotification onEmailLinked={() => window.location.reload()} />
                  <Grid container sx={{ height: '100%' }}>
                    <Grid item xs={3} sx={{ borderRight: '1px solid #ddd' }}>
                      <MenuButton onGuestLogout={deleteGuestAccountWithLoading} />
                      <FriendList />
                    </Grid>
                    <Grid item xs={9}>
                      <ChatBox />
                    </Grid>
                  </Grid>
                </Box>
              </ProtectedRoute>
            }
          />
          {/* Chuyển hướng đến trang chính nếu không tìm thấy route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {/* Dialog loading khi xóa tài khoản Guest */}
      <Dialog
        open={isDeletingGuest}
        disableEscapeKeyDown
        onClose={() => {}} // Prevent closing
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Đang xóa tài khoản Guest...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng đợi trong giây lát. Tài khoản tạm thời và dữ liệu của bạn đang được xóa khỏi hệ thống.
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatApp;
