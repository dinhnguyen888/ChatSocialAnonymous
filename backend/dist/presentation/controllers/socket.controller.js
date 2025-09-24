"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketController = void 0;
const message_controller_1 = require("./message.controller");
const room_controller_1 = require("./room.controller");
const friend_controller_1 = require("./friend.controller");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../shared/config");
const socketController = (io) => {
    io.use((socket, next) => {
        var _a, _b;
        try {
            const token = ((_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token) || ((_b = socket.handshake.headers['authorization']) === null || _b === void 0 ? void 0 : _b.toString().replace('Bearer ', ''));
            if (!token)
                return next(new Error('Unauthorized'));
            const payload = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            socket.user = payload;
            return next();
        }
        catch (err) {
            return next(err);
        }
    });
    io.on('connection', (socket) => {
        (0, friend_controller_1.friendController)(socket, io);
        (0, message_controller_1.messageController)(socket, io);
        (0, room_controller_1.roomController)(socket, io);
        socket.on('disconnect', () => { });
    });
};
exports.socketController = socketController;
