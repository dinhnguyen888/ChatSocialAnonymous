import Room, { IRoom } from '../Models/communityRoom.Model';
import { Server, Socket } from 'socket.io';
import mongoose, { Mongoose } from 'mongoose';
import Friend from '../Models/friend.Model';
import Account from '../Models/account.Model';

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
    
  socket.on("getAllMemberInRoom", async (roomId) => {
  try {
    const room = await Room.findById(roomId).populate('participants', 'name');
    if (!room) {
        socket.emit("getMemberError", 'room not found')
    }
    console.log(room)
    socket.emit('allMember', room?.participants)
  } catch (error) {
   socket.emit("getMemberError", error)
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

    socket.on('addMemberToRoom', async (roomId, friendId) => {
        try {
          // Convert friendId and roomId to ObjectId
          const friendObjectId = new mongoose.Types.ObjectId(friendId);
          const roomObjectId = new mongoose.Types.ObjectId(roomId);
      
          // Check if friend exists
          const friend = await Account.findById(friendObjectId);
          if (!friend) {
            return socket.emit('error', 'Friend not found');
          }
      
          // Check if room exists
          const room = await Room.findById(roomObjectId);
          if (!room) {
            return socket.emit('error', 'Room not found');
          }
      
          // Add friend to the room's participants if not already present
          if (!room.participants.includes(friendObjectId)) {
            room.participants.push(friendObjectId);
            await room.save();
      
            // Notify the current user about the successful addition
            socket.emit('memberAdded', `add member to ${room.roomName} success!!`);
      
            // Notify the newly added friend
          
      
            // Notify all other participants in the room about the new member
            room.participants.forEach(participantId => {
              if (participantId.toString() !== friendId.toString()) {
                io.to(participantId.toString()).emit('newMember', `${friend.name} has joined the room`);
              }
            });
          } else {
            socket.emit('error', 'Friend is already a participant');
          }
        } catch (error) {
          console.error(error);
          socket.emit('error', 'An error occurred');
        }
      });
      

      socket.on('leaveRoom', async (roomId: string, personId: string) => {
        try {
            const personObjectId = new mongoose.Types.ObjectId(personId);
    
            const room = await Room.findById(roomId) as IRoom;
            if (room) {
                const participantIndex = room.participants.findIndex(participant => participant.equals(personObjectId));
                if (participantIndex > -1) {
                    room.participants.splice(participantIndex, 1);
                    await room.save();
    
                    socket.leave(roomId);
                    socket.emit('leaveRoomSuccess', room.roomName);
              
                } else {
                    socket.emit('leaveRoomError', 'Participant not found in room');
                }
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

    socket.on('join-room', ({ roomId, peerId }) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', { peerId });
      });
    
      socket.on('leave-room', ({ roomId }) => {
        socket.leave(roomId);
        socket.to(roomId).emit('user-left', socket.id);
      });
    
    
  
};
