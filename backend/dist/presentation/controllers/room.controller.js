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
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomController = void 0;
const room_service_1 = require("../../application/services/room.service");
const roomController = (socket, io) => {
    socket.on('getAllRoomById', (_id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rooms = yield room_service_1.RoomService.listByUserId(_id);
            socket.emit('allRoomsById', rooms);
        }
        catch (error) {
            socket.emit('getAllRoomByIdError', 'Failed to get rooms');
        }
    }));
    socket.on("getAllMemberInRoom", (roomId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const participants = yield room_service_1.RoomService.getMembers(roomId);
            socket.emit('allMember', participants);
        }
        catch (error) {
            socket.emit("getMemberError", error);
        }
    }));
    socket.on('createRoom', (nameRoom, leaderId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const savedRoom = yield room_service_1.RoomService.createRoom(nameRoom, leaderId);
            if (savedRoom) {
                socket.join(leaderId);
                io.emit('roomCreated', savedRoom);
            }
            else {
                socket.emit('createRoomError', 'Failed to create room');
            }
        }
        catch (error) {
            socket.emit('createRoomError', 'Failed to create room');
        }
    }));
    socket.on('joinRoom', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, personId }) {
        try {
            const room = yield room_service_1.RoomService.joinRoom(roomId, personId);
            if (room) {
                socket.join(roomId);
                socket.emit('joinRoomSuccess', roomId);
            }
            else {
                socket.emit('joinRoomError', 'Room not found');
            }
        }
        catch (error) {
            socket.emit('joinRoomError', 'Failed to join room');
        }
    }));
    socket.on('addMemberToRoom', (roomId, friendId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield room_service_1.RoomService.addMember(roomId, friendId);
            if ('error' in result) {
                socket.emit('error', result.error);
                return;
            }
            socket.emit('memberAdded', `add member to ${result.room.roomName} success!!`);
        }
        catch (error) {
            socket.emit('error', 'An error occurred');
        }
    }));
    socket.on('leaveRoom', (roomId, personId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const room = yield room_service_1.RoomService.leaveRoom(roomId, personId);
            if (room) {
                socket.leave(roomId);
                socket.emit('leaveRoomSuccess', room.roomName);
            }
            else {
                socket.emit('leaveRoomError', 'Room not found');
            }
        }
        catch (error) {
            socket.emit('leaveRoomError', 'Failed to leave room');
        }
    }));
    socket.on('deleteRoom', (roomId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const deletedRoom = yield room_service_1.RoomService.deleteRoom(roomId);
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
            socket.emit('deleteRoomError', 'Failed to delete room');
        }
    }));
    socket.on('changeNameRoom', (roomId, nameRoom) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const updatedRoom = yield room_service_1.RoomService.rename(roomId, nameRoom);
            if (updatedRoom) {
                io.to(roomId).emit('roomNameChanged', updatedRoom);
                socket.emit('changeNameRoomSuccess', updatedRoom);
            }
            else {
                socket.emit('changeNameRoomError', 'Room not found');
            }
        }
        catch (error) {
            socket.emit('changeNameRoomError', 'Failed to change room name');
        }
    }));
    socket.on('join-room', ({ roomId, peerId }) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', { peerId, roomId });
    });
    socket.on('leave-room', ({ roomId }) => {
        socket.leave(roomId);
        socket.to(roomId).emit('user-left', { peerId: socket.id, roomId });
    });
};
exports.roomController = roomController;
