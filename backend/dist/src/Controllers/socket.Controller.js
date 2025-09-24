"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketController = void 0;
const message_Controller_1 = require("./message.Controller");
const room_Controller_1 = require("./room.Controller");
const friend_Controller_1 = require("./friend.Controller");
const socketController = (io) => {
    io.on('connection', (socket) => {
        console.log('a user connected');
        (0, friend_Controller_1.friendController)(socket, io);
        (0, message_Controller_1.messageController)(socket, io);
        (0, room_Controller_1.roomController)(socket, io);
        // Disconnect event
        socket.on('disconnect', () => {
            console.log('a user disconnected!!!');
        });
    });
};
exports.socketController = socketController;
