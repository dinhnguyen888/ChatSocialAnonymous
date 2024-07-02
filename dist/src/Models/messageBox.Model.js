"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const messageBoxSchema = new mongoose_2.Schema({
    from: {
        type: String,
        required: true
    },
    to: { type: String,
        required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const MessageBox = mongoose_1.default.model('MessageBox', messageBoxSchema);
exports.default = MessageBox;
