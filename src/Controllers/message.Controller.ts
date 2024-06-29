import Message from '../Models/message.Model';
import { Server, Socket } from 'socket.io';

export const messageController = (socket: Socket, io: Server) => {
  
  socket.on('addMessage', async (message) => {
    try {
      const existingRoom = await Message.findOne({ roomId: message.roomId });
      if (existingRoom) {
        existingRoom.message.push({
          senderName:message.senderName,
          senderId: message.senderId,
          content: message.content,
          timestamp: new Date()
        });
        await existingRoom.save();
        io.to(message.roomId).emit('receiveMessage', existingRoom.message);
      } else {
        const newMessage = new Message({
          roomId: message.roomId,
          message: [{
            senderName:message.senderName,
            senderId: message.senderId,
            content: message.content,
            timestamp: new Date()
          }]
        });
        await newMessage.save();
        io.to(message.roomId).emit('receiveMessage', newMessage.message);
      }
    } catch (error) {
      socket.emit('error', 'An error occurred while adding the message');
    }
  });

  socket.on('readMessage', async (roomId) => {
    try {
      const messages = await Message.findOne({ roomId }).exec();
      if (messages) {
        io.to(roomId).emit('receiveMessage', messages.message);
      } else {
        socket.emit('error', 'No messages found for this room');
      }
    } catch (error) {
      socket.emit('error', 'An error occurred while reading the messages');
    }
  });

  socket.on('deleteMessage', async (message) => {
    try {
      const room = await Message.findOne({ roomId: message.roomId });
      if (room) {
        const messageIndex = room.message.findIndex(m => m._id!.toString() === message._id);
        if (messageIndex !== -1) {
          const deletedMessage = room.message.splice(messageIndex, 1);
          await room.save();
          io.to(message.roomId).emit('deletedMessage', message._id);
        } else {
          socket.emit('error', 'Message not found');
        }
      } else {
        socket.emit('error', 'Room not found');
      }
    } catch (error) {
      socket.emit('error', 'An error occurred while deleting the message');
    }
  });
};
