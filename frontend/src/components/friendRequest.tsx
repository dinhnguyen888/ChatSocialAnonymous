import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Button, Box, Grid } from '@mui/material';
import socket from '../services/socket'; // Đảm bảo đường dẫn đúng tới socket
import { useUserStore } from '../stores/userStore';

const FriendRequest: React.FC = () => {
  const [requests, setRequests] = useState<{ id: number; name: string }[]>([]);
  const getUserData = useUserStore((state) => state.getUserData)
  const userData = getUserData()
  useEffect(() => {
    const userId = userData.id
    if (userId) {
      socket.emit('showRequest', userId);
      socket.on('allRequests', (requests: { _id: number; name: string }[]) => {
        console.log('Received friend requests:', requests);
        setRequests(requests.map(request => ({ id: request._id, name: request.name })));
      });

      socket.on('showRequestError', (error: string) => {
        console.error('Error fetching friend requests:', error);
      });

      socket.on('requestDeleted', (requestUserId: string) => {
        setRequests(prevRequests => prevRequests.filter(request => request.id.toString() !== requestUserId));
      });

      socket.on('deleteRequestError', (error: string) => {
        console.error('Error deleting friend request:', error);
      });

      socket.on('friendAdded', () => {
        setRequests(prevRequests => prevRequests.filter(request => request.id !== parseInt(userId!)));
      });

      socket.on('addFriendError', (error: string) => {
        console.error('Error adding friend:', error);
      });

      return () => {
        socket.off('allRequests');
        socket.off('showRequestError');
        socket.off('requestDeleted');
        socket.off('deleteRequestError');
        socket.off('friendAdded');
        socket.off('addFriendError');
      };
    }
  }, []);

  const handleAccept = (id: number,name:string) => {
  const userName = userData.name;
  const userId = userData.id;
    if (userId) {
      console.log(id)
      const x = socket.emit('addFriend', userId, id.toString(), userName, name); // Thay thế "Owner Name" và "Friend Name" bằng tên thực
    if(x) window.location.reload()
    }
  };

  const handleDecline = (id: number) => {
    const userId = userData.id;
    if (userId) {
      socket.emit('deleteRequest', userId, id.toString());
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <List>
        {requests.map(request => (
          <ListItem key={request.id}>
            <ListItemText primary={request.name} />
            <Grid container spacing={2} justifyContent="flex-end">
              <Grid item>
                <Button variant="contained" color="primary" onClick={() => handleAccept(request.id,request.name)}>
                  Accept
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="secondary" onClick={() => handleDecline(request.id)}>
                  Decline
                </Button>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FriendRequest;
