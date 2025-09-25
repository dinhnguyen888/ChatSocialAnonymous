import Room from '../../domain/models/room.entity';
import mongoose from 'mongoose';
import Account from '../../domain/models/account.entity';

export const RoomService = {
  async ensureGeneralRoom() {
    const existing = await Room.findOne({ roomName: '/general' });
    if (existing) return existing;
    const newRoom = new Room({ roomName: '/general', participants: [] });
    return await newRoom.save();
  },
  async listByUserId(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await Room.find({ participants: userObjectId }).exec();
  },

  async getMembers(roomId: string) {
    const room = await Room.findById(roomId).populate('participants', 'name');
    return room?.participants ?? [];
  },

  async createRoom(name: string, leaderId: string) {
    const leaderObjectId = new mongoose.Types.ObjectId(leaderId);
    const newRoom = new Room({ roomName: name, participants: [leaderObjectId], leader: leaderObjectId });
    return await newRoom.save();
  },

  async joinRoom(roomId: string, personId: string) {
    const personObjectId = new mongoose.Types.ObjectId(personId);
    const room = await Room.findById(roomId);
    if (!room) return null;
    if (!room.participants.includes(personObjectId)) {
      room.participants.push(personObjectId);
      await room.save();
    }
    return room;
  },

  async autoJoinGeneral(personId: string) {
    const general = await this.ensureGeneralRoom();
    return await this.joinRoom((general as any)._id.toString(), personId);
  },

  async addMember(roomId: string, friendId: string) {
    const friendObjectId = new mongoose.Types.ObjectId(friendId);
    const room = await Room.findById(roomId);
    if (!room) return { error: 'Room not found' } as const;
    const friend = await Account.findById(friendObjectId);
    if (!friend) return { error: 'Friend not found' } as const;
    if (!room.participants.includes(friendObjectId)) {
      room.participants.push(friendObjectId);
      await room.save();
    }
    return { room, friend } as const;
  },

  async leaveRoom(roomId: string, personId: string) {
    const personObjectId = new mongoose.Types.ObjectId(personId);
    const room = await Room.findById(roomId);
    if (!room) return null;
    const idx = room.participants.findIndex((p) => p.equals(personObjectId));
    if (idx > -1) {
      room.participants.splice(idx, 1);
      await room.save();
    }
    return room;
  },

  async deleteRoom(roomId: string) {
    return await Room.findByIdAndDelete(roomId);
  },

  async rename(roomId: string, name: string) {
    return await Room.findByIdAndUpdate(roomId, { roomName: name }, { new: true });
  },
};


