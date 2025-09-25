import { Server, Socket } from 'socket.io';
import Friend from '../../domain/models/friend.entity';
import mongoose from 'mongoose';

export const videoCallController = (socket: Socket, io: Server) => {
  const user = (socket as any).user;
  const isGuest = user && user.role === 'Guest';

  // Check if two users are friends
  const areFriends = async (userId1: string, userId2: string): Promise<boolean> => {
    if (isGuest) return false; // Guests cannot make video calls
    
    try {
      const friend1 = await Friend.findOne({ ownerId: userId1 });
      const friend2 = await Friend.findOne({ ownerId: userId2 });
      
      if (!friend1 || !friend2) return false;
      
      // Check if they are mutual friends
      const isFriend1To2 = friend1.friendId.includes(new mongoose.Types.ObjectId(userId2));
      const isFriend2To1 = friend2.friendId.includes(new mongoose.Types.ObjectId(userId1));
      
      return isFriend1To2 && isFriend2To1;
    } catch (error) {
      console.error('Error checking friendship:', error);
      return false;
    }
  };

  socket.on('join-video-call', async ({ roomId, peerId, targetUserId }) => {
    try {
      if (isGuest) {
        return socket.emit('video-call-error', 'Guests cannot make video calls');
      }

      if (!targetUserId) {
        return socket.emit('video-call-error', 'Target user is required');
      }

      // Check if users are friends
      const friends = await areFriends(user.id, targetUserId);
      if (!friends) {
        return socket.emit('video-call-error', 'You can only video call your friends');
      }

      // Join the video call room
      socket.join(roomId);
      socket.to(roomId).emit('user-joined-video-call', { peerId, roomId, userId: user.id });
      
      socket.emit('video-call-success', { roomId, message: 'Joined video call successfully' });
    } catch (error) {
      console.error('Video call join error:', error);
      socket.emit('video-call-error', 'Failed to join video call');
    }
  });

  socket.on('leave-video-call', ({ roomId }) => {
    try {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left-video-call', { peerId: socket.id, roomId, userId: user.id });
    } catch (error) {
      console.error('Video call leave error:', error);
      socket.emit('video-call-error', 'Failed to leave video call');
    }
  });

  socket.on('video-call-offer', async ({ roomId, offer, targetUserId }) => {
    try {
      if (isGuest) {
        return socket.emit('video-call-error', 'Guests cannot make video calls');
      }

      // Check if users are friends
      const friends = await areFriends(user.id, targetUserId);
      if (!friends) {
        return socket.emit('video-call-error', 'You can only video call your friends');
      }

      socket.to(roomId).emit('video-call-offer', { offer, from: user.id });
    } catch (error) {
      console.error('Video call offer error:', error);
      socket.emit('video-call-error', 'Failed to send video call offer');
    }
  });

  socket.on('video-call-answer', ({ roomId, answer }) => {
    try {
      socket.to(roomId).emit('video-call-answer', { answer, from: user.id });
    } catch (error) {
      console.error('Video call answer error:', error);
      socket.emit('video-call-error', 'Failed to send video call answer');
    }
  });

  socket.on('video-call-ice-candidate', ({ roomId, candidate }) => {
    try {
      socket.to(roomId).emit('video-call-ice-candidate', { candidate, from: user.id });
    } catch (error) {
      console.error('Video call ICE candidate error:', error);
      socket.emit('video-call-error', 'Failed to send ICE candidate');
    }
  });

  socket.on('end-video-call', ({ roomId }) => {
    try {
      socket.to(roomId).emit('video-call-ended', { from: user.id });
      socket.leave(roomId);
    } catch (error) {
      console.error('End video call error:', error);
      socket.emit('video-call-error', 'Failed to end video call');
    }
  });
};
