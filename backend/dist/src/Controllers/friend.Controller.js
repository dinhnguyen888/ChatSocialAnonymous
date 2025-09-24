"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const friend_Model_1 = __importDefault(require("../Models/friend.Model")); // Đảm bảo đường dẫn đúng tới model Friend
const account_Model_1 = __importDefault(require("../Models/account.Model"));
const friendRoom_Model_1 = __importDefault(require("../Models/friendRoom.Model"));
const friendController = (socket, io) => {
    // Send friend request
    socket.on('sendRequest', (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, from }) {
        try {
            const requestUserId = new mongoose_1.default.Types.ObjectId(from);
            const checkUserAvailable = yield account_Model_1.default.findById(to);
            if (checkUserAvailable) {
                const sendFriendRequest = yield friend_Model_1.default.findOneAndUpdate({ ownerId: to }, { $addToSet: { friendIdRequest: requestUserId } }, { new: true, upsert: true });
                socket.emit('requestSent', sendFriendRequest);
            }
            else
                socket.emit("sendRequestError", `user have id: ${to} is already your friend`);
        }
        catch (error) {
            console.error('Error sending friend request:', error);
            socket.emit('sendRequestError', `Failed to send friend request: id ${to} not found`);
        }
    }));
    // Add friend
    socket.on('addFriend', (ownerId, friendId, ownerName, friendName) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const friendObjectId = new mongoose_1.default.Types.ObjectId(friendId);
            // Add to owner's friend list and remove from request list
            const owner = yield friend_Model_1.default.findOneAndUpdate({ ownerId }, {
                $addToSet: { friendId: friendObjectId },
                $pull: { friendIdRequest: friendObjectId }
            }, { new: true });
            // Add to friend's friend list
            const friend = yield friend_Model_1.default.findOneAndUpdate({ ownerId: friendId }, { $addToSet: { friendId: new mongoose_1.default.Types.ObjectId(ownerId) } }, { new: true, upsert: true });
            const chatRoom = new friendRoom_Model_1.default({
                friendRoomName: `${ownerName}${friendName}`,
                participants: [ownerId, friendId]
            });
            yield chatRoom.save();
            socket.emit('friendAdded', { owner, friend });
        }
        catch (error) {
            console.error('Error adding friend:', error);
            socket.emit('addFriendError', 'Failed to add friend');
        }
    }));
    // Delete friend and associated room
    socket.on('deleteFriend', (_b) => __awaiter(void 0, [_b], void 0, function* ({ ownerId, friendId }) {
        try {
            const friendObjectId = new mongoose_1.default.Types.ObjectId(friendId);
            // Remove from owner's friend list
            const owner = yield friend_Model_1.default.findOneAndUpdate({ ownerId }, { $pull: { friendId: friendObjectId } }, { new: true });
            // Remove from friend's friend list
            const friend = yield friend_Model_1.default.findOneAndUpdate({ ownerId: friendId }, { $pull: { friendId: new mongoose_1.default.Types.ObjectId(ownerId) } }, { new: true });
            // Find and delete the chat room containing both users
            const room = yield friendRoom_Model_1.default.findOneAndDelete({
                participants: { $all: [ownerId, friendId] }
            });
            if (room) {
                // Emit room deleted event if needed
                socket.emit('roomDeleted', room);
            }
            socket.emit('friendDeleted', { owner, friend });
        }
        catch (error) {
            console.error('Error deleting friend:', error);
            socket.emit('deleteFriendError', 'Failed to delete friend');
        }
    }));
    socket.on('showAllFriends', (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Fetching friends and chat rooms for user:", userId);
            const [friends, friendRooms] = yield Promise.all([
                friend_Model_1.default.findOne({ ownerId: userId }).populate('friendId', 'name'),
                friendRoom_Model_1.default.find({ participants: userId }).select('_id friendRoomName') // Fetch all rooms with participants
            ]);
            console.log('Friends data:', friends);
            if (friends || friendRooms) {
                socket.emit('allFriends', {
                    friends: friends ? friends.friendId : [],
                    friendRooms: friendRooms ? friendRooms.map(room => ({ _id: room._id, friendRoomName: room.friendRoomName })) : []
                });
            }
            else {
                socket.emit('allFriends', { friends: [], friendRooms: [] });
            }
        }
        catch (error) {
            console.error('Error fetching friends and chat rooms:', error);
            socket.emit('showAllFriendsError', 'Failed to fetch friends and chat rooms');
        }
    }));
    socket.on('showRequest', (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log(`Fetching friend requests for user: ${userId}`);
            const requests = yield friend_Model_1.default.findOne({ ownerId: userId }).populate('friendIdRequest', 'name');
            console.log('CHECK DATA >>>>>>>>> FROM SHOWREQUEST');
            if (requests) {
                console.log('Requests found:', requests.friendIdRequest);
                socket.emit('allRequests', requests.friendIdRequest);
            }
            else {
                console.log('No requests found');
                socket.emit('allRequests', []);
            }
        }
        catch (error) {
            console.error('Error fetching friend requests:', error);
            socket.emit('showRequestError', 'Failed to fetch friend requests');
        }
    }));
    socket.on('deleteRequest', (userId, requestUserId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const requestObjectId = new mongoose_1.default.Types.ObjectId(requestUserId);
            const user = yield friend_Model_1.default.findOneAndUpdate({ ownerId: userId }, { $pull: { friendIdRequest: requestObjectId } }, { new: true });
            if (user) {
                socket.emit('requestDeleted', requestUserId); // Gửi sự kiện về client để thông báo yêu cầu đã bị xóa
            }
            else {
                socket.emit('deleteRequestError', 'Failed to delete friend request');
            }
        }
        catch (error) {
            console.error('Error deleting friend request:', error);
            socket.emit('deleteRequestError', 'Failed to delete friend request');
        }
    }));
    socket.on('joinFriendRoom', (friendRoomId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield socket.join(friendRoomId);
            socket.emit('joinSuccess', friendRoomId);
            console.log('success join', friendRoomId);
        }
        catch (error) {
            console.log(error);
            socket.emit('errorJoinFriendRoom', error);
        }
    }));
};
exports.friendController = friendController;
