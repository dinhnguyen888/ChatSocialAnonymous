import React, { useEffect } from 'react';
import { useFriendStore } from '../stores/friendStore';
import { useUserStore } from '../stores/userStore';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import socket from '../services/socket';
const Friend: React.FC = () => {
    useEffect(() => {
        socket.on("roomDeleted", (msg) => {
            console.log(msg)
        })
        socket.on("friendDeleted", (obj) =>{
            console.log(obj)
        })
        socket.on('deleteFriendError', (msg) =>{
            console.log(msg)
        })

        return () =>{
            socket.off("roomDeleted");
            socket.off("friendDeleted");
            socket.off('deleteFriendError')
        }
    },[])

  const { friends, removeFriend } = useFriendStore();
  const {getUserData} =useUserStore()
  const userData = getUserData()

  const handleDeleteFriend = (friendId: string) => {
      // eslint-disable-next-line no-restricted-globals
    const confirmed = confirm('Bạn có chắc muốn xóa bạn bè không?');
    
    if (confirmed) {
        socket.emit('deleteFriend', { ownerId: userData.id, friendId });
        removeFriend(friendId);
    }
};


  return (
    <List>
      {friends.map((friend) => (
        <ListItem key={friend._id}>
          <ListItemAvatar>
            <Avatar alt={friend.name} src="/path/to/default/avatar.jpg" /> {/* Adjust the avatar source as needed */}
          </ListItemAvatar>
          <ListItemText primary={friend.name} />
          <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFriend(friend._id)}>
            <DeleteIcon />
          </IconButton>
        </ListItem>
      ))}
    </List>
  );
};

export default Friend;
