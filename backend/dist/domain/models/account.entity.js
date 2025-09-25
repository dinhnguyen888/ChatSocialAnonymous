"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const accountSchema = new Schema({
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
        default: undefined
    },
    name: {
        type: String,
        require: false,
        default: ''
    },
    role: {
        type: String,
        enum: ['Guest', 'User'],
        default: 'Guest'
    }
}, {
    timestamps: true
});
const Account = mongoose_1.default.model('Account', accountSchema);
exports.default = Account;
