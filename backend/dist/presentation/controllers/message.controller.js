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
exports.messageController = void 0;
const message_service_1 = require("../../application/services/message.service");
const messageController = (socket, io) => {
    socket.on('addMessage', (message) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const messages = yield message_service_1.MessageService.addMessage(message);
            io.to(message.roomId).emit('receiveMessage', messages);
        }
        catch (error) {
            socket.emit('error', 'An error occurred while adding the message');
        }
    }));
    socket.on('readMessage', (roomId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const messages = yield message_service_1.MessageService.readMessage(roomId);
            io.to(roomId).emit('receiveMessage', messages);
        }
        catch (error) {
            socket.emit('error', 'An error occurred while reading the messages');
        }
    }));
    socket.on('deleteMessage', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, messageId }) {
        try {
            const result = yield message_service_1.MessageService.deleteMessage(roomId, messageId);
            if (result.ok)
                socket.emit('deletedMessage', messageId);
            else
                socket.emit('error', result.error);
        }
        catch (error) {
            socket.emit('error', 'An error occurred while deleting the message');
        }
    }));
};
exports.messageController = messageController;
