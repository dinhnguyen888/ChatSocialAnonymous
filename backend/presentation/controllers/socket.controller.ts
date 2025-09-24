import { Server, Socket } from 'socket.io';
import { messageController } from './message.controller';
import { roomController } from './room.controller';
import { friendController } from './friend.controller';
import jwt from 'jsonwebtoken';
import { config } from '../../shared/config';

export const socketController = (io: Server) => {
  io.use((socket, next) => {
    try {
      const token = (socket as any).handshake.auth?.token || (socket as any).handshake.headers['authorization']?.toString().replace('Bearer ', '');
      if (!token) return next(new Error('Unauthorized'));
      const payload = jwt.verify(token, config.jwtSecret);
      (socket as any).user = payload;
      return next();
    } catch (err) {
      return next(err as Error);
    }
  });

  io.on('connection', (socket: Socket) => {
    friendController(socket,io)
    messageController(socket,io)
    roomController(socket,io)
    socket.on('disconnect', () => {});
  });
};



