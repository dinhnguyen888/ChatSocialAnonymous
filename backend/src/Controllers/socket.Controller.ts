import { Server, Socket } from 'socket.io';
import { messageController } from './message.Controller';
import { roomController } from './room.Controller';
import { friendController } from './friend.Controller';

export const socketController = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('a user connected');
    friendController(socket,io)
    messageController(socket,io)
    roomController(socket,io)

    // Disconnect event
    socket.on('disconnect', () => {
      console.log('a user disconnected!!!');
    });
  });
};


