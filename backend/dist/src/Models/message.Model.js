"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const messageSchema = new mongoose_2.Schema({
    roomId: {
        type: String,
        required: true,
    },
    message: [{
            senderName: {
                type: String,
                required: true
            },
            senderId: {
                type: String,
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }]
});
const Message = mongoose_1.default.model('Message', messageSchema);
exports.default = Message;
