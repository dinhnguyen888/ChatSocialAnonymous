
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import Friend from '../Models/friend.Model'; // Đảm bảo đường dẫn đúng tới model Friend
import Room from '../Models/communityRoom.Model';
import Account from '../Models/account.Model';
import FriendRoom from '../Models/friendRoom.Model';

export const friendController = (socket: Socket, io: Server) => {

    // Send friend request
    socket.on('sendRequest', async ({to, from}) => {
        try {
            const requestUserId = new mongoose.Types.ObjectId(from);
            const checkUserAvailable =  await Account.findById(to);
            if(checkUserAvailable){
                const sendFriendRequest = await Friend.findOneAndUpdate(
                    { ownerId:to },
                    { $addToSet: { friendIdRequest: requestUserId } },
                    { new: true, upsert: true }
                );
                socket.emit('requestSent', sendFriendRequest);
            }
            else socket.emit("sendRequestError", `user have id: ${to} is already your friend`)
          
            
        } catch (error) {
            console.error('Error sending friend request:', error);
            socket.emit('sendRequestError', `Failed to send friend request: id ${to} not found`);
        }
    });

    // Add friend
    socket.on('addFriend', async (ownerId: string, friendId: string, ownerName: string, friendName: string) => {
        try {
            const friendObjectId = new mongoose.Types.ObjectId(friendId);

            // Add to owner's friend list and remove from request list
            const owner = await Friend.findOneAndUpdate(
                { ownerId },
                {
                    $addToSet: { friendId: friendObjectId },
                    $pull: { friendIdRequest: friendObjectId }
                },
                { new: true }
            );

            // Add to friend's friend list
            const friend = await Friend.findOneAndUpdate(
                { ownerId: friendId },
                { $addToSet: { friendId: new mongoose.Types.ObjectId(ownerId) } },
                { new: true, upsert: true }
            );

            const chatRoom = new FriendRoom({
                friendRoomName: `${ownerName}${friendName}`, 
                participants: [ownerId, friendId]
            });
            await chatRoom.save();

            socket.emit('friendAdded', { owner, friend });

        } catch (error) {
            console.error('Error adding friend:', error);
            socket.emit('addFriendError', 'Failed to add friend');
        }
    });

    
    // Delete friend and associated room
    socket.on('deleteFriend', async ({ownerId, friendId}) => {
        try {
            const friendObjectId = new mongoose.Types.ObjectId(friendId);

            // Remove from owner's friend list
            const owner = await Friend.findOneAndUpdate(
                { ownerId },
                { $pull: { friendId: friendObjectId } },
                { new: true }
            );

            // Remove from friend's friend list
            const friend = await Friend.findOneAndUpdate(
                { ownerId: friendId },
                { $pull: { friendId: new mongoose.Types.ObjectId(ownerId) } },
                { new: true }
            );

            // Find and delete the chat room containing both users
            const room = await FriendRoom.findOneAndDelete({
                participants: { $all: [ownerId, friendId] }
            });

            if (room) {
                // Emit room deleted event if needed
                socket.emit('roomDeleted', room);
            }

            socket.emit('friendDeleted', { owner, friend });
        } catch (error) {
            console.error('Error deleting friend:', error);
            socket.emit('deleteFriendError', 'Failed to delete friend');
        }
    });

    socket.on('showAllFriends', async (userId) => {
        try {
            console.log("Fetching friends and chat rooms for user:", userId);
    
            const [friends, friendRooms] = await Promise.all([
                Friend.findOne({ ownerId: userId }).populate('friendId', 'name'),
                FriendRoom.find({ participants: userId }).select('_id friendRoomName') // Fetch all rooms with participants
            ]);
    
            console.log('Friends data:', friends);
    
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
        try {
            console.log(`Fetching friend requests for user: ${userId}`);
            const requests = await Friend.findOne({ ownerId: userId }).populate('friendIdRequest', 'name');
            console.log('CHECK DATA >>>>>>>>> FROM SHOWREQUEST')
            if (requests) {
                console.log('Requests found:', requests.friendIdRequest);
                socket.emit('allRequests', requests.friendIdRequest);
            } else {
                console.log('No requests found');
                socket.emit('allRequests', []);
            }
        } catch (error) {
            console.error('Error fetching friend requests:', error);
            socket.emit('showRequestError', 'Failed to fetch friend requests');
        }
    });

    socket.on('deleteRequest', async (userId: string, requestUserId: string) => {
        try {
            const requestObjectId = new mongoose.Types.ObjectId(requestUserId);

            const user = await Friend.findOneAndUpdate(
                { ownerId: userId },
                { $pull: { friendIdRequest: requestObjectId } },
                { new: true }
            );

            if (user) {
                socket.emit('requestDeleted', requestUserId); // Gửi sự kiện về client để thông báo yêu cầu đã bị xóa
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
        console.log('success join', friendRoomId)
       }
       catch(error){
        console.log(error)
        socket.emit('errorJoinFriendRoom',error)
       }
    })
};
