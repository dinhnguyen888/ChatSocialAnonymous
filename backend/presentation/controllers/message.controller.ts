import { Server, Socket } from 'socket.io';
import { MessageService } from '../../application/services/message.service';

export const messageController = (socket: Socket, io: Server) => {
  socket.on('addMessage', async (message) => {
    try {
      const messages = await MessageService.addMessage(message);
      io.to(message.roomId).emit('receiveMessage', messages);
    } catch (error) {
      socket.emit('error', 'An error occurred while adding the message');
    }
  });

  socket.on('readMessage', async (roomId) => {
    try {
      const messages = await MessageService.readMessage(roomId);
      io.to(roomId).emit('receiveMessage', messages);
    } catch (error) {
      socket.emit('error', 'An error occurred while reading the messages');
    }
  });

  socket.on('deleteMessage', async ({roomId,messageId}) => {
    try {
      const result = await MessageService.deleteMessage(roomId, messageId);
      if (result.ok) socket.emit('deletedMessage', messageId); 
      else socket.emit('error', result.error);
    } catch (error) {
      socket.emit('error', 'An error occurred while deleting the message');
    }
  });
};



