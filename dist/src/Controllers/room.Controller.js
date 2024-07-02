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
exports.roomController = void 0;
const communityRoom_Model_1 = __importDefault(require("../Models/communityRoom.Model"));
const mongoose_1 = __importDefault(require("mongoose"));
const account_Model_1 = __importDefault(require("../Models/account.Model"));
const roomController = (socket, io) => {
    console.log('Client connected to the server');
    socket.on('getAllRoomById', (_id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userObjectId = new mongoose_1.default.Types.ObjectId(_id);
            const rooms = yield communityRoom_Model_1.default.find({ participants: userObjectId }).exec();
            console.log('check number of Room', rooms);
            socket.emit('allRoomsById', rooms);
        }
        catch (error) {
            console.error('Error getting rooms by user ID:', error);
            socket.emit('getAllRoomByIdError', 'Failed to get rooms');
        }
    }));
    socket.on("getAllMemberInRoom", (roomId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const room = yield communityRoom_Model_1.default.findById(roomId).populate('participants', 'name');
            if (!room) {
                socket.emit("getMemberError", 'room not found');
            }
            console.log(room);
            socket.emit('allMember', room === null || room === void 0 ? void 0 : room.participants);
        }
        catch (error) {
            socket.emit("getMemberError", error);
        }
    }));
    socket.on('createRoom', (nameRoom, leaderId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const leaderObjectId = new mongoose_1.default.Types.ObjectId(leaderId);
            const newRoom = new communityRoom_Model_1.default({
                roomName: nameRoom,
                participants: [leaderObjectId],
                leader: leaderObjectId
            });
            const savedRoom = yield newRoom.save();
            if (savedRoom) {
                socket.join(leaderId);
                io.emit('roomCreated', savedRoom);
                console.log('room created', newRoom._id);
            }
            else {
                socket.emit('createRoomError', 'Failed to create room');
            }
        }
        catch (error) {
            console.error('Error creating room:', error);
            socket.emit('createRoomError', 'Failed to create room');
        }
    }));
    socket.on('joinRoom', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, personId }) {
        try {
            const personObjectId = new mongoose_1.default.Types.ObjectId(personId);
            const room = yield communityRoom_Model_1.default.findById(roomId);
            if (room) {
                if (!room.participants.includes(personObjectId)) {
                    room.participants.push(personObjectId);
                    yield room.save();
                }
                socket.join(roomId);
                console.log("you have joined>>>>>>>", roomId);
                socket.emit('joinRoomSuccess', roomId);
                io.to(roomId).emit('userJoined', personObjectId);
            }
            else {
                socket.emit('joinRoomError', 'Room not found');
            }
        }
        catch (error) {
            console.error('Error joining room:', error);
            socket.emit('joinRoomError', 'Failed to join room');
        }
    }));
    socket.on('addMemberToRoom', (roomId, friendId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Convert friendId and roomId to ObjectId
            const friendObjectId = new mongoose_1.default.Types.ObjectId(friendId);
            const roomObjectId = new mongoose_1.default.Types.ObjectId(roomId);
            // Check if friend exists
            const friend = yield account_Model_1.default.findById(friendObjectId);
            if (!friend) {
                return socket.emit('error', 'Friend not found');
            }
            // Check if room exists
            const room = yield communityRoom_Model_1.default.findById(roomObjectId);
            if (!room) {
                return socket.emit('error', 'Room not found');
            }
            // Add friend to the room's participants if not already present
            if (!room.participants.includes(friendObjectId)) {
                room.participants.push(friendObjectId);
                yield room.save();
                // Notify the current user about the successful addition
                socket.emit('memberAdded', `add member to ${room.roomName} success!!`);
                // Notify the newly added friend
                // Notify all other participants in the room about the new member
                room.participants.forEach(participantId => {
                    if (participantId.toString() !== friendId.toString()) {
                        io.to(participantId.toString()).emit('newMember', `${friend.name} has joined the room`);
                    }
                });
            }
            else {
                socket.emit('error', 'Friend is already a participant');
            }
        }
        catch (error) {
            console.error(error);
            socket.emit('error', 'An error occurred');
        }
    }));
    socket.on('leaveRoom', (roomId, personId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const personObjectId = new mongoose_1.default.Types.ObjectId(personId);
            const room = yield communityRoom_Model_1.default.findById(roomId);
            if (room) {
                const participantIndex = room.participants.findIndex(participant => participant.equals(personObjectId));
                if (participantIndex > -1) {
                    room.participants.splice(participantIndex, 1);
                    yield room.save();
                    socket.leave(roomId);
                    socket.emit('leaveRoomSuccess', room.roomName);
                }
                else {
                    socket.emit('leaveRoomError', 'Participant not found in room');
                }
            }
            else {
                socket.emit('leaveRoomError', 'Room not found');
            }
        }
        catch (error) {
            console.error('Error leaving room:', error);
            socket.emit('leaveRoomError', 'Failed to leave room');
        }
    }));
    socket.on('deleteRoom', (roomId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const deletedRoom = yield communityRoom_Model_1.default.findByIdAndDelete(roomId);
            if (deletedRoom) {
                const roomSockets = yield io.in(roomId).allSockets();
                roomSockets.forEach(socketId => {
                    var _a;
                    (_a = io.sockets.sockets.get(socketId)) === null || _a === void 0 ? void 0 : _a.leave(roomId);
                });
                io.emit('roomDeleted', deletedRoom);
            }
        }
        catch (error) {
            console.error('Error deleting room:', error);
            socket.emit('deleteRoomError', 'Failed to delete room');
        }
    }));
    socket.on('changeNameRoom', (roomId, nameRoom) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const updatedRoom = yield communityRoom_Model_1.default.findByIdAndUpdate(roomId, { roomName: nameRoom }, { new: true });
            if (updatedRoom) {
                io.to(roomId).emit('roomNameChanged', updatedRoom);
                socket.emit('changeNameRoomSuccess', updatedRoom);
            }
            else {
                socket.emit('changeNameRoomError', 'Room not found');
            }
        }
        catch (error) {
            console.error('Error changing room name:', error);
            socket.emit('changeNameRoomError', 'Failed to change room name');
        }
    }));
    socket.on('join-room', ({ roomId, peerId }) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', { peerId });
    });
    socket.on('leave-room', ({ roomId }) => {
        socket.leave(roomId);
        socket.to(roomId).emit('user-left', socket.id);
    });
};
exports.roomController = roomController;
