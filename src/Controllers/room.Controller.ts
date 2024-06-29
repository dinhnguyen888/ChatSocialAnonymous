import Room, { IRoom } from '../Models/communityRoom.Model';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';

export const roomController = (socket: Socket, io: Server) => {
    console.log('Client connected to the server');

    socket.on('getAllRoomById', async (_id: string) => {
        try {
            const userObjectId = new mongoose.Types.ObjectId(_id);
            const rooms = await Room.find({ participants: userObjectId }).exec();
            console.log('check number of Room', rooms)
            socket.emit('allRoomsById', rooms);

        } catch (error) {
            console.error('Error getting rooms by user ID:', error);
            socket.emit('getAllRoomByIdError', 'Failed to get rooms');
        }
    });
    

    socket.on('createRoom', async (nameRoom: string, leaderId: string) => {
        try {
            const leaderObjectId = new mongoose.Types.ObjectId(leaderId);

            const newRoom = new Room({
                roomName: nameRoom,
                participants: [leaderObjectId],
                leader: leaderObjectId
            });

            const savedRoom = await newRoom.save();

            if (savedRoom) {
                socket.join(leaderId);
                io.emit('roomCreated', savedRoom);
                console.log('room created',newRoom._id)
            } else {
                socket.emit('createRoomError', 'Failed to create room');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            socket.emit('createRoomError', 'Failed to create room');
        }
    });

    socket.on('joinRoom', async ({ roomId, personId }) => {
        try {
            const personObjectId = new mongoose.Types.ObjectId(personId);
    
            const room = await Room.findById(roomId);
            if (room) {
                if (!room.participants.includes(personObjectId)) {
                    room.participants.push(personObjectId);
                    await room.save();
                }
                socket.join(roomId);
                console.log("you have joined>>>>>>>", roomId)
                socket.emit('joinRoomSuccess', roomId);
                io.to(roomId).emit('userJoined', personObjectId);
            } else {
                socket.emit('joinRoomError', 'Room not found');
            }
        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('joinRoomError', 'Failed to join room');
        }
    });

    // socket.on('joinRoom', async ({roomId, personId}) => {
    //     try {
    //         const personObjectId = new mongoose.Types.ObjectId(personId);

    //         const room = await Room.findById(roomId) as IRoom;
    //         if (room) {
    //             if (!room.participants.includes(personObjectId)) {
    //                 room.participants.push(personObjectId);
    //                 await room.save();
    //             }
    //             socket.join(roomId);
    //             socket.emit('joinRoomSuccess', room);
    //             io.to(roomId).emit('userJoined', personObjectId);
    //         } else {
    //             socket.emit('joinRoomError', 'Room not found');
    //         }
    //     } catch (error) {
    //         console.error('Error joining room:', error);
    //         socket.emit('joinRoomError', 'Failed to join room');
    //     }
    // });

    socket.on('leaveRoom', async (roomId: string, personId: string) => {
        try {
            const personObjectId = new mongoose.Types.ObjectId(personId);

            const room = await Room.findById(roomId) as IRoom;
            if (room) {
                const participantIndex = room.participants.indexOf(personObjectId);
                if (participantIndex > -1) {
                    room.participants.splice(participantIndex, 1);
                    await room.save();
                }

                socket.leave(roomId);
                socket.emit('leaveRoomSuccess', room);
                io.to(roomId).emit('userLeft', personObjectId);
            } else {
                socket.emit('leaveRoomError', 'Room not found');
            }
        } catch (error) {
            console.error('Error leaving room:', error);
            socket.emit('leaveRoomError', 'Failed to leave room');
        }
    });

    socket.on('deleteRoom', async (roomId: string) => {
        try {
            const deletedRoom = await Room.findByIdAndDelete(roomId);
            if (deletedRoom) {
                const roomSockets = await io.in(roomId).allSockets();
                roomSockets.forEach(socketId => {
                    io.sockets.sockets.get(socketId)?.leave(roomId);
                });
                io.emit('roomDeleted', deletedRoom);
            }
        } catch (error) {
            console.error('Error deleting room:', error);
            socket.emit('deleteRoomError', 'Failed to delete room');
        }
    });

    socket.on('changeNameRoom', async (roomId: string, nameRoom: string) => {
        try {
            const updatedRoom = await Room.findByIdAndUpdate(
                roomId,
                { roomName: nameRoom },
                { new: true }
            );

            if (updatedRoom) {
                io.to(roomId).emit('roomNameChanged', updatedRoom);
                socket.emit('changeNameRoomSuccess', updatedRoom);
            } else {
                socket.emit('changeNameRoomError', 'Room not found');
            }
        } catch (error) {
            console.error('Error changing room name:', error);
            socket.emit('changeNameRoomError', 'Failed to change room name');
        }
    });

  
};
