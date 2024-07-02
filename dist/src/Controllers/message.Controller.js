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
exports.messageController = void 0;
const message_Model_1 = __importDefault(require("../Models/message.Model"));
const messageController = (socket, io) => {
    socket.on('addMessage', (message) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const existingRoom = yield message_Model_1.default.findOne({ roomId: message.roomId });
            if (existingRoom) {
                existingRoom.message.push({
                    senderName: message.senderName,
                    senderId: message.senderId,
                    content: message.content,
                    timestamp: new Date()
                });
                yield existingRoom.save();
                io.to(message.roomId).emit('receiveMessage', existingRoom.message);
            }
            else {
                const newMessage = new message_Model_1.default({
                    roomId: message.roomId,
                    message: [{
                            senderName: message.senderName,
                            senderId: message.senderId,
                            content: message.content,
                            timestamp: new Date()
                        }]
                });
                yield newMessage.save();
                io.to(message.roomId).emit('receiveMessage', newMessage.message);
            }
        }
        catch (error) {
            socket.emit('error', 'An error occurred while adding the message');
        }
    }));
    socket.on('readMessage', (roomId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const messages = yield message_Model_1.default.findOne({ roomId }).exec();
            if (messages) {
                io.to(roomId).emit('receiveMessage', messages.message);
            }
            else {
                socket.emit('error', 'No messages found for this room');
            }
        }
        catch (error) {
            socket.emit('error', 'An error occurred while reading the messages');
        }
    }));
    socket.on('deleteMessage', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, messageId }) {
        try {
            const messageDoc = yield message_Model_1.default.findOne({ roomId });
            if (messageDoc) {
                const messageIndex = messageDoc.message.findIndex(msg => msg._id.toString() === messageId);
                if (messageIndex !== -1) {
                    messageDoc.message.splice(messageIndex, 1);
                    yield messageDoc.save();
                    socket.emit('deletedMessage', messageId);
                }
                else {
                    socket.emit('error', 'Message not found');
                }
            }
            else {
                socket.emit('error', 'Room not found');
            }
        }
        catch (error) {
            console.error('An error occurred while deleting the message:', error);
            socket.emit('error', 'An error occurred while deleting the message');
        }
    }));
};
exports.messageController = messageController;
