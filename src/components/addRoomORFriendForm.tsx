import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const AddFriendOrRoom: React.FC = () => {
  const [friendId, setFriendId] = useState('');
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  const handleSendFriendRequest = () => {
    console.log(`Sending friend request to ID: ${friendId}`);
    // Implement socket emit or API call here
    setFriendId('');
  };

  const handleCreateRoom = () => {
    console.log(`Creating new room: ${roomName}`);
    // Implement socket emit or API call here
    setRoomName('');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Add Friend or Room
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6">Send Friend Request</Typography>
        <TextField
          margin="dense"
          label="Friend ID"
          fullWidth
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSendFriendRequest} sx={{ mt: 2 }}>
          Send Request
        </Button>
      </Box>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6">Create New Room</Typography>
        <TextField
          margin="dense"
          label="Room Name"
          fullWidth
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleCreateRoom} sx={{ mt: 2 }}>
          Create Room
        </Button>
      </Box>
    </Box>
  );
};

export default AddFriendOrRoom;
