import mongoose from 'mongoose';
import Friend from '../../domain/models/friend.entity';
import FriendRoom from '../../domain/models/friendRoom.entity';

export const FriendService = {
  async sendRequest(to: string, from: string) {
    const requestUserId = new mongoose.Types.ObjectId(from);
    return await Friend.findOneAndUpdate(
      { ownerId: to },
      { $addToSet: { friendIdRequest: requestUserId } },
      { new: true, upsert: true }
    );
  },

  async addFriend(ownerId: string, friendId: string, ownerName: string, friendName: string) {
    const friendObjectId = new mongoose.Types.ObjectId(friendId);
    const owner = await Friend.findOneAndUpdate(
      { ownerId },
      { $addToSet: { friendId: friendObjectId }, $pull: { friendIdRequest: friendObjectId } },
      { new: true }
    );
    const friend = await Friend.findOneAndUpdate(
      { ownerId: friendId },
      { $addToSet: { friendId: new mongoose.Types.ObjectId(ownerId) } },
      { new: true, upsert: true }
    );
    const chatRoom = new FriendRoom({ friendRoomName: `${ownerName}${friendName}`, participants: [ownerId, friendId] });
    await chatRoom.save();
    return { owner, friend };
  },

  async deleteFriend(ownerId: string, friendId: string) {
    const friendObjectId = new mongoose.Types.ObjectId(friendId);
    const owner = await Friend.findOneAndUpdate(
      { ownerId },
      { $pull: { friendId: friendObjectId } },
      { new: true }
    );
    const friend = await Friend.findOneAndUpdate(
      { ownerId: friendId },
      { $pull: { friendId: new mongoose.Types.ObjectId(ownerId) } },
      { new: true }
    );
    const room = await FriendRoom.findOneAndDelete({ participants: { $all: [ownerId, friendId] } });
    return { owner, friend, room };
  },
};


