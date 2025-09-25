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
const friend_service_1 = require("../../application/services/friend.service");
const friend_entity_1 = __importDefault(require("../../domain/models/friend.entity"));
const friendRoom_entity_1 = __importDefault(require("../../domain/models/friendRoom.entity"));
const friendController = (socket, io) => {
    const isGuest = socket.user && socket.user.role === 'Guest';
    socket.on('sendRequest', (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, from }) {
        if (isGuest)
            return socket.emit('sendRequestError', 'Guest is not allowed');
        try {
            const sendFriendRequest = yield friend_service_1.FriendService.sendRequest(to, from);
            socket.emit('requestSent', sendFriendRequest);
        }
        catch (error) {
            socket.emit('sendRequestError', `Failed to send friend request`);
        }
    }));
    socket.on('addFriend', (ownerId, friendId, ownerName, friendName) => __awaiter(void 0, void 0, void 0, function* () {
        if (isGuest)
            return socket.emit('addFriendError', 'Guest is not allowed');
        try {
            const { owner, friend } = yield friend_service_1.FriendService.addFriend(ownerId, friendId, ownerName, friendName);
            socket.emit('friendAdded', { owner, friend });
        }
        catch (error) {
            socket.emit('addFriendError', 'Failed to add friend');
        }
    }));
    socket.on('deleteFriend', (_b) => __awaiter(void 0, [_b], void 0, function* ({ ownerId, friendId }) {
        if (isGuest)
            return socket.emit('deleteFriendError', 'Guest is not allowed');
        try {
            const { owner, friend, room } = yield friend_service_1.FriendService.deleteFriend(ownerId, friendId);
            if (room)
                socket.emit('roomDeleted', room);
            socket.emit('friendDeleted', { owner, friend });
        }
        catch (error) {
            socket.emit('deleteFriendError', 'Failed to delete friend');
        }
    }));
    socket.on('showAllFriends', (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [friends, friendRooms] = yield Promise.all([
                friend_entity_1.default.findOne({ ownerId: userId }).populate('friendId', 'name'),
                friendRoom_entity_1.default.find({ participants: userId }).select('_id friendRoomName')
            ]);
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
        if (isGuest)
            return socket.emit('allRequests', []);
        try {
            const requests = yield friend_entity_1.default.findOne({ ownerId: userId }).populate('friendIdRequest', 'name');
            if (requests) {
                socket.emit('allRequests', requests.friendIdRequest);
            }
            else {
                socket.emit('allRequests', []);
            }
        }
        catch (error) {
            console.error('Error fetching friend requests:', error);
            socket.emit('showRequestError', 'Failed to fetch friend requests');
        }
    }));
    socket.on('deleteRequest', (userId, requestUserId) => __awaiter(void 0, void 0, void 0, function* () {
        if (isGuest)
            return socket.emit('deleteRequestError', 'Guest is not allowed');
        try {
            const requestObjectId = new mongoose_1.default.Types.ObjectId(requestUserId);
            const user = yield friend_entity_1.default.findOneAndUpdate({ ownerId: userId }, { $pull: { friendIdRequest: requestObjectId } }, { new: true });
            if (user) {
                socket.emit('requestDeleted', requestUserId);
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
            // Get friend room with participants
            const friendRoom = yield friendRoom_entity_1.default.findById(friendRoomId);
            if (friendRoom) {
                yield socket.join(friendRoomId);
                socket.emit('joinSuccess', {
                    roomId: friendRoomId,
                    participants: friendRoom.participants
                });
            }
            else {
                socket.emit('errorJoinFriendRoom', 'Friend room not found');
            }
        }
        catch (error) {
            socket.emit('errorJoinFriendRoom', error);
        }
    }));
};
exports.friendController = friendController;
