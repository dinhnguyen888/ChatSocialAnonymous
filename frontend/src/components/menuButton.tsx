import React, { useEffect, useState } from 'react';
import { IconButton, Drawer, List, ListItem, ListItemText, Avatar, Box, Dialog, DialogTitle, DialogContent, Card, CardContent, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FriendRequest from './friendRequest';
import PersonalInfo from './personalInfo';
import LogoutConfirmation from './logout';
import socket from '../services/socket';
import { getUserByID } from '../services/apiAccount';
import {useUserStore} from '../stores/userStore';
import Friend from './Friend';

interface MenuButtonProps {
  onGuestLogout?: () => Promise<void>;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onGuestLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentComponent, setCurrentComponent] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false); // State để quản lý mở/đóng của hộp thoại đăng xuất
  const [user, setUser] = useState<any>(null);

  const getUserData = useUserStore((state) => state.getUserData);
  const userData = getUserData()
  useEffect(() => {
      
     
        try {
         
        setUser(userData)
        console.log(userData)
          console.log("check user using zustand >>>>>>>",userData);
        } catch (error) {
          console.log(error);
        }
      }


  , []);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuClick = (component: string) => {
    setCurrentComponent(component);
    if (component === 'Log out') {
      setLogoutDialogOpen(true); // Mở hộp thoại đăng xuất khi click vào Log out
    } else {
      setDialogOpen(true);
    }
    setIsOpen(false); 
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleCloseLogoutDialog = () => {
    setLogoutDialogOpen(false); // Đóng hộp thoại đăng xuất
  };

  const renderComponent = () => {
    switch (currentComponent) {
      case 'Personal Information':
        return <PersonalInfo />;
      case 'Friend Request':
        return <FriendRequest />;
      case 'Friend':
        return <Friend />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <IconButton onClick={toggleDrawer} aria-label="menu">
        <MenuIcon />
      </IconButton>
      <Drawer anchor="left" open={isOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 250, padding: 2 }}>
          <Card sx={{ alignItems: 'center', marginBottom: 2 }}>
            <Avatar src={'/avatar.jpg'} alt="User Avatar" sx={{ width: 56, height: 56, marginLeft: 2 }} />
            <CardContent>
              <Typography variant="subtitle1">{user?.name}</Typography>
              <Typography variant="body2" color="textSecondary">ID: {user?.id}</Typography>
            </CardContent>
          </Card>
          <List>
           
            <ListItem button onClick={() => handleMenuClick('Personal Information')}>
              <ListItemText primary="Thông tin cá nhân" />
            </ListItem>
            <ListItem button onClick={() => handleMenuClick('Friend Request')}>
              <ListItemText primary="Lời mời kết bạn" />
            </ListItem>
            <ListItem button onClick={() => handleMenuClick('Friend')}>
              <ListItemText primary="Bạn bè" />
            </ListItem>
            <ListItem button onClick={() => handleMenuClick('Log out')}>
              <ListItemText primary="Đăng xuất" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentComponent === 'Personal Information' ? 'Thông tin cá nhân' :
           currentComponent === 'Friend Request' ? 'Lời mời kết bạn' :
           currentComponent === 'Friend' ? 'Bạn bè' : currentComponent}
        </DialogTitle>
        <DialogContent>
          {renderComponent()}
        </DialogContent>
      </Dialog>
      <LogoutConfirmation 
        open={logoutDialogOpen} 
        onClose={handleCloseLogoutDialog} 
        onGuestLogout={onGuestLogout}
      />
    </Box>
  );
};

export default MenuButton;
