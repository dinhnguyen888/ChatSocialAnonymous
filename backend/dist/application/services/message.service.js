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
exports.MessageService = void 0;
const message_entity_1 = __importDefault(require("../../domain/models/message.entity"));
exports.MessageService = {
    addMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingRoom = yield message_entity_1.default.findOne({ roomId: message.roomId });
            if (existingRoom) {
                existingRoom.message.push({
                    senderName: message.senderName,
                    senderId: message.senderId,
                    content: message.content,
                    timestamp: new Date(),
                });
                yield existingRoom.save();
                return existingRoom.message;
            }
            else {
                const newMessage = new message_entity_1.default({
                    roomId: message.roomId,
                    message: [{
                            senderName: message.senderName,
                            senderId: message.senderId,
                            content: message.content,
                            timestamp: new Date(),
                        }],
                });
                yield newMessage.save();
                return newMessage.message;
            }
        });
    },
    readMessage(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const messages = yield message_entity_1.default.findOne({ roomId }).exec();
            return (_a = messages === null || messages === void 0 ? void 0 : messages.message) !== null && _a !== void 0 ? _a : [];
        });
    },
    deleteMessage(roomId, messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageDoc = yield message_entity_1.default.findOne({ roomId });
            if (!messageDoc)
                return { ok: false, error: 'Room not found' };
            const idx = messageDoc.message.findIndex((msg) => { var _a; return ((_a = msg._id) === null || _a === void 0 ? void 0 : _a.toString()) === messageId; });
            if (idx === -1)
                return { ok: false, error: 'Message not found' };
            messageDoc.message.splice(idx, 1);
            yield messageDoc.save();
            return { ok: true };
        });
    },
};
