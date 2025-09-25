import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import { FriendService } from '../../application/services/friend.service';
import Friend from '../../domain/models/friend.entity';
import FriendRoom from '../../domain/models/friendRoom.entity';

export const friendController = (socket: Socket, io: Server) => {
    const isGuest = (socket as any).user && ((socket as any).user as any).role === 'Guest';
    socket.on('sendRequest', async ({to, from}) => {
        if (isGuest) return socket.emit('sendRequestError', 'Guest is not allowed');
        try {
            const sendFriendRequest = await FriendService.sendRequest(to, from);
            socket.emit('requestSent', sendFriendRequest);
        } catch (error) {
            socket.emit('sendRequestError', `Failed to send friend request`);
        }
    });

    socket.on('addFriend', async (ownerId: string, friendId: string, ownerName: string, friendName: string) => {
        if (isGuest) return socket.emit('addFriendError', 'Guest is not allowed');
        try {
            const { owner, friend } = await FriendService.addFriend(ownerId, friendId, ownerName, friendName);
            socket.emit('friendAdded', { owner, friend });
        } catch (error) {
            socket.emit('addFriendError', 'Failed to add friend');
        }
    });

    socket.on('deleteFriend', async ({ownerId, friendId}) => {
        if (isGuest) return socket.emit('deleteFriendError', 'Guest is not allowed');
        try {
            const { owner, friend, room } = await FriendService.deleteFriend(ownerId, friendId);
            if (room) socket.emit('roomDeleted', room);
            socket.emit('friendDeleted', { owner, friend });
        } catch (error) {
            socket.emit('deleteFriendError', 'Failed to delete friend');
        }
    });

    socket.on('showAllFriends', async (userId) => {
        try {
            const [friends, friendRooms] = await Promise.all([
                Friend.findOne({ ownerId: userId }).populate('friendId', 'name'),
                FriendRoom.find({ participants: userId }).select('_id friendRoomName')
            ]);
            if (friends || friendRooms) {
                socket.emit('allFriends', {
                    friends: friends ? friends.friendId : [],
                    friendRooms: friendRooms ? friendRooms.map(room => ({ _id: room._id, friendRoomName: room.friendRoomName })) : []
                });
            } else {
                socket.emit('allFriends', { friends: [], friendRooms: [] });
            }
        } catch (error) {
            console.error('Error fetching friends and chat rooms:', error);
            socket.emit('showAllFriendsError', 'Failed to fetch friends and chat rooms');
        }
    });

    socket.on('showRequest', async (userId: string) => {
        if (isGuest) return socket.emit('allRequests', []);
        try {
            const requests = await Friend.findOne({ ownerId: userId }).populate('friendIdRequest', 'name');
            if (requests) {
                socket.emit('allRequests', requests.friendIdRequest);
            } else {
                socket.emit('allRequests', []);
            }
        } catch (error) {
            console.error('Error fetching friend requests:', error);
            socket.emit('showRequestError', 'Failed to fetch friend requests');
        }
    });

    socket.on('deleteRequest', async (userId: string, requestUserId: string) => {
        if (isGuest) return socket.emit('deleteRequestError', 'Guest is not allowed');
        try {
            const requestObjectId = new mongoose.Types.ObjectId(requestUserId);
            const user = await Friend.findOneAndUpdate(
                { ownerId: userId },
                { $pull: { friendIdRequest: requestObjectId } },
                { new: true }
            );
            if (user) {
                socket.emit('requestDeleted', requestUserId);
            } else {
                socket.emit('deleteRequestError', 'Failed to delete friend request');
            }
        } catch (error) {
            console.error('Error deleting friend request:', error);
            socket.emit('deleteRequestError', 'Failed to delete friend request');
        }
    });

    socket.on('joinFriendRoom', async (friendRoomId:string) =>{
       try{
        await socket.join(friendRoomId);
        socket.emit('joinSuccess', friendRoomId)
       }
       catch(error){
        socket.emit('errorJoinFriendRoom',error)
       }
    })
};



