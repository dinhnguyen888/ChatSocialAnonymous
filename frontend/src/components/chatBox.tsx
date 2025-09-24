import React, { useState, useRef, useEffect } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, TextField, List, ListItem, ListItemText, Avatar, ListItemAvatar, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from "@mui/icons-material/Add";
import socket from '../services/socket';
import { MessageData, useMessage } from '../stores/messageStore';
import { useUserStore } from '../stores/userStore';
import { useChatAppStore } from '../stores/countStateStore';
import { useFriendStore } from '../stores/friendStore';
import { Navigate, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../stores/roomStore';

const ChatBox: React.FC = () => {
  const { getMessage, setMessage, addMessage, deleteMessage } = useMessage();
  const { getRoomClicked, friendRoomClicked, room, triggerReload ,roomClick} = useChatAppStore();
  const { friends } = useFriendStore();
  const messages = getMessage();
  const roomId = getRoomClicked();
  const [newMessage, setNewMessage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFriendListToAddMember, setShowFriendListToAddMember] = useState(false);
  // const [members, setMembers] = useState<{ name: string,_id:string}[]>([]);
  const {setMembers,members} = useRoomStore()
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const { getUserData } = useUserStore();
  const currentUser = getUserData();
  const navigate = useNavigate()

  useEffect(() => {
    if (messages.length) setMessage([]);
    socket.emit('readMessage', roomId);

    const handleReceiveMessage = (message: MessageData[]) => {
      setMessage(message);
    };

    const handleDeleteMessage = (messageId: string) => {
      deleteMessage(messageId);
    };

    socket.on("memberAdded", (msg) => {
      alert(msg)
    });
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('deletedMessage', handleDeleteMessage);
    socket.on('allMember', (roomMember) =>{
        
        setMembers(roomMember);
        console.log("check member in members state", members);
    } )
    socket.on('leaveRoomSuccess', (roomName:string) => {
      alert(`You have left the room ${roomName}`);
      window.location.reload()
    })
    socket.on('getMemberError', (msg) =>{
      alert(msg)
    })
    return () => {
      socket.off('allMember');
      socket.off('memberAdded');
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('deletedMessage', handleDeleteMessage);
      socket.off('leaveRoomSuccess');
    };
  }, [roomId, setMessage, deleteMessage]);

  useEffect(() => {
    if (roomId) {
      socket.emit('readMessage', roomId, (error: any, messages: MessageData[]) => {
        if (error) {
          console.error('Error fetching messages:', error);
        } else {
          setMessage(messages);
        }
      });
    }
  }, [roomId, setMessage]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const newMessageObject: MessageData = {
      senderName: currentUser.name,
      senderId: currentUser.id!,
      timestamp: new Date().toISOString(),
      content: newMessage,
    };

    setNewMessage('');

    socket.emit('addMessage', { roomId, ...newMessageObject }, (error: any) => {
      if (error) {
        console.error('Error sending message:', error);
      } else {
        addMessage(newMessageObject);
      }
    });

    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  const handleDeleteMessageClick = (message: MessageData) => {
    socket.emit("deleteMessage", { roomId, messageId: message._id! });
    deleteMessage(message._id!);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAddMember = (friendId: string) => {
    socket.emit('addMemberToRoom', roomId, friendId);
    setShowFriendListToAddMember(false);
  };

  const handleOpenFriendToAddMember = () => {
    setShowFriendListToAddMember(true);
  };

  const handleCloseFriendsList = () => {
    setShowFriendListToAddMember(false);
  };

  const handleOpenMembersDialog = () => {
      socket.emit("getAllMemberInRoom", roomId)
      setShowMembersDialog(true);
  };

  const handleCloseMembersDialog = () => {
    setShowMembersDialog(false);
  };

  const handleLeaveRoom = () => {
    socket.emit('leaveRoom', roomId, currentUser.id, (error: any) => {
      if (error) {
        console.error('Error leaving room:', error);
      } else {
        navigate('/chat')
       triggerReload() // Reset page
  
      }
    });
    setIsMenuOpen(false);
  };

  const handleClickVideoCall = () =>{
    window.open('/video-call')
  }

  return (
    <>
    {roomClick.trim() !== '' ? (
      <div className="h-screen flex flex-col">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className="flex-grow">
              Chat App
            </Typography>
            <IconButton color="inherit" onClick={handleClickVideoCall}>
              <VideoCallIcon />
              
            </IconButton>
            {!friendRoomClicked ? (
              <IconButton color="inherit" onClick={toggleMenu}>
                <MenuIcon />
              </IconButton>
            ) : null}
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: 2, display: 'flex', flexDirection: 'column-reverse' }}>
          <List>
            {messages.map((message, index) => (
              <ListItem key={index} sx={{ justifyContent: 'flex-start' }}>
                <ListItemAvatar>
                  <Avatar alt={message.senderId} />
                </ListItemAvatar>
                <div>
                  <Typography variant="caption" sx={{ fontSize: 12, margin: 0.5, position: 'relative', bottom: 10 }}>
                    {message.senderName}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: message.senderId === currentUser.id ? 'primary.main' : 'grey.300',
                      color: message.senderId === currentUser.id ? 'white' : 'black',
                      borderRadius: 2,
                      padding: 0.5,
                      paddingLeft: 2,
                      paddingRight: 2,
                      maxWidth: '100%',
                      marginRight: 1.5,
                      position: 'relative',
                      top: -10,
                    }}
                  >
                    <ListItemText primary={message.content} />
                  </Box>
                </div>
                {message.senderId === currentUser.id && (
                  <IconButton
                    edge="start"
                    aria-label="delete"
                    onClick={() => handleDeleteMessageClick(message)}
                    sx={{ marginLeft: -1.5, padding: '5px', color: 'red' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
        <Box sx={{ display: 'flex', padding: 2 }}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            inputRef={messageInputRef}
          />
          <IconButton color="primary" sx={{ ml: 2 }} onClick={handleSendMessage}>
            <SendIcon />
          </IconButton>
        </Box>
        <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg transition-transform transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center p-4 border-b bg-gray-100">
            <Typography variant="h6" className="font-semibold text-gray-800">Menu</Typography>
            <IconButton onClick={toggleMenu}>
              <CloseIcon className="text-gray-600" />
            </IconButton>
          </div>
          <div className="p-4">
            <h1 className="flex items-center gap-2 p-2 text-lg font-bold text-gray-700">
              Room Name: {room.name}
            </h1>
            <h1 className="flex items-center gap-2 p-2 text-gray-400">
              ID: {room.id}
            </h1>
            <div className="mt-6">
              <MenuItem className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md" onClick={handleOpenFriendToAddMember}>
                Add Member
              </MenuItem>
              <MenuItem className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md" onClick={handleOpenMembersDialog}>
                All Member
              </MenuItem>
              <MenuItem className="flex items-center gap-2 p-2 hover:bg-red-100 rounded-md text-red-600" onClick={handleLeaveRoom}>
                Leave Room
              </MenuItem>
            </div>
          </div>
        </div>
        <Dialog open={showFriendListToAddMember} onClose={handleCloseFriendsList}>
          <DialogTitle>Add Members</DialogTitle>
          <DialogContent>
            <List>
              {friends.map((friend) => (
                <ListItem key={friend._id} sx={{ justifyContent: 'space-between' }}>
                  <ListItemText primary={friend.name} />
                  <Button variant="contained" startIcon={<AddIcon />} color="primary" style={{ width: "20%" }} onClick={() => handleAddMember(friend._id)}>
                    Add
                  </Button>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseFriendsList} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={showMembersDialog} onClose={handleCloseMembersDialog}>
          <DialogTitle>Room Members</DialogTitle>
          <DialogContent>
            <List>
              {members.map((member, index) => (
                <ListItem key={index}>
                  <ListItemText primary={member.name} style={currentUser.name === member.name ? {color:'blueviolet'} : {}} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMembersDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    ) : <div className='w-full'><h1 className='text-center mx-auto my-64 font-mono text-2xl font-bold text-blue-400'>Select Friend or Room to chat!!!</h1></div>}
  </>
  );
};

export default ChatBox;
