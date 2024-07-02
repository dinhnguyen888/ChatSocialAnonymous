"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const friendSchema = new Schema({
    ownerId: {
        type: String,
        required: true
    },
    friendId: [{
            type: Schema.Types.ObjectId,
            ref: "Account"
        }],
    friendIdRequest: [{
            type: Schema.Types.ObjectId,
            ref: 'Account'
        }]
});
const Friend = mongoose_1.default.model('Friend', friendSchema);
exports.default = Friend;
