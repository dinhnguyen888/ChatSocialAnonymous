import { Server, Socket } from 'socket.io';

export const videoCallController = (socket: Socket, io: Server) => {
  const user = (socket as any).user;
  const isGuest = user && user.role === 'Guest';

  // Deprecated friend-checking for video calls: frontend and UX now use roomId

  socket.on('join-video-call', async ({ roomId, peerId }) => {
    try {
      if (isGuest) {
        return socket.emit('video-call-error', 'Guests cannot make video calls');
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

  socket.on('video-call-offer', async ({ roomId, offer }) => {
    try {
      if (isGuest) {
        return socket.emit('video-call-error', 'Guests cannot make video calls');
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
