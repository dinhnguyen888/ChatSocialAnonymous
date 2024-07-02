"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const chatboxSchema = new Schema({
    personInChatbox: {
        type: Schema.Types.ObjectId,
        ref: "Friend",
        required: true
    },
    chatboxName: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
const ChatBox = mongoose_1.default.model("ChatBox", chatboxSchema);
exports.default = ChatBox;
