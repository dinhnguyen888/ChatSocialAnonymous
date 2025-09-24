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

 
socket.on('deleteMessage', async ({roomId,messageId}) => {
  try {
   
    const messageDoc = await Message.findOne({ roomId });

    if (messageDoc) {
      const messageIndex = messageDoc.message.findIndex(msg => msg._id!.toString() === messageId);

      if (messageIndex !== -1) {
        messageDoc.message.splice(messageIndex, 1);
        await messageDoc.save(); 
        socket.emit('deletedMessage', messageId); 
      } else {
        socket.emit('error', 'Message not found');
      }
    } else {
      socket.emit('error', 'Room not found');
    }
  } catch (error) {
    console.error('An error occurred while deleting the message:', error);
    socket.emit('error', 'An error occurred while deleting the message');
  }
});
};
