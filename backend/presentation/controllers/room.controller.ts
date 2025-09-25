import { Server, Socket } from 'socket.io';
import { RoomService } from '../../application/services/room.service';
import { IRoom } from '../../domain/models/room.entity';

export const roomController = (socket: Socket, io: Server) => {
    const isGuest = (socket as any).user && ((socket as any).user as any).role === 'Guest';
    socket.on('getAllRoomById', async (_id: string) => {
        try {
            const rooms = await RoomService.listByUserId(_id);
            socket.emit('allRoomsById', rooms);
        } catch (error) {
            socket.emit('getAllRoomByIdError', 'Failed to get rooms');
        }
    });
    
    socket.on("getAllMemberInRoom", async (roomId) => {
      try {
        const participants = await RoomService.getMembers(roomId);
        socket.emit('allMember', participants)
      } catch (error) {
       socket.emit("getMemberError", error)
      }
    });

    socket.on('createRoom', async (nameRoom: string, leaderId: string) => {
        if (isGuest) return socket.emit('createRoomError', 'Guest is not allowed');
        try {
            const savedRoom = await RoomService.createRoom(nameRoom, leaderId);
            if (savedRoom) {
                socket.join(leaderId);
                io.emit('roomCreated', savedRoom);
            } else {
                socket.emit('createRoomError', 'Failed to create room');
            }
        } catch (error) {
            socket.emit('createRoomError', 'Failed to create room');
        }
    });

    socket.on('joinRoom', async ({ roomId, personId }) => {
        try {
            const room = await RoomService.joinRoom(roomId, personId);
            if (room) {
                socket.join(roomId);
                socket.emit('joinRoomSuccess', roomId);
            } else {
                socket.emit('joinRoomError', 'Room not found');
            }
        } catch (error) {
            socket.emit('joinRoomError', 'Failed to join room');
        }
    });

    socket.on('addMemberToRoom', async (roomId, friendId) => {
        if (isGuest) return socket.emit('error', 'Guest is not allowed');
        try {
          const result = await RoomService.addMember(roomId, friendId);
          if ('error' in result) {
            socket.emit('error', result.error);
            return;
          }
          socket.emit('memberAdded', `add member to ${result.room.roomName} success!!`);
        } catch (error) {
          socket.emit('error', 'An error occurred');
        }
      });

      socket.on('leaveRoom', async (roomId: string, personId: string) => {
        try {
            const room = await RoomService.leaveRoom(roomId, personId) as IRoom | null;
            if (room) {
                socket.leave(roomId);
                socket.emit('leaveRoomSuccess', room.roomName);
            } else {
                socket.emit('leaveRoomError', 'Room not found');
            }
        } catch (error) {
            socket.emit('leaveRoomError', 'Failed to leave room');
        }
    });

    socket.on('deleteRoom', async (roomId: string) => {
        if (isGuest) return socket.emit('deleteRoomError', 'Guest is not allowed');
        try {
            const deletedRoom = await RoomService.deleteRoom(roomId);
            if (deletedRoom) {
                const roomSockets = await io.in(roomId).allSockets();
                roomSockets.forEach(socketId => {
                    io.sockets.sockets.get(socketId)?.leave(roomId);
                });
                io.emit('roomDeleted', deletedRoom);
            }
        } catch (error) {
            socket.emit('deleteRoomError', 'Failed to delete room');
        }
    });

    socket.on('changeNameRoom', async (roomId: string, nameRoom: string) => {
        if (isGuest) return socket.emit('changeNameRoomError', 'Guest is not allowed');
        try {
            const updatedRoom = await RoomService.rename(roomId, nameRoom);
            if (updatedRoom) {
                io.to(roomId).emit('roomNameChanged', updatedRoom);
                socket.emit('changeNameRoomSuccess', updatedRoom);
            } else {
                socket.emit('changeNameRoomError', 'Room not found');
            }
        } catch (error) {
            socket.emit('changeNameRoomError', 'Failed to change room name');
        }
    });

    socket.on('join-room', ({ roomId, peerId }) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', { peerId, roomId });
    });

    socket.on('leave-room', ({ roomId }) => {
        socket.leave(roomId);
        socket.to(roomId).emit('user-left', { peerId: socket.id, roomId });
    });
};



