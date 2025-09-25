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
exports.videoCallController = void 0;
const videoCallController = (socket, io) => {
    const user = socket.user;
    const isGuest = user && user.role === 'Guest';
    // Deprecated friend-checking for video calls: frontend and UX now use roomId
    socket.on('join-video-call', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, peerId }) {
        try {
            if (isGuest) {
                return socket.emit('video-call-error', 'Guests cannot make video calls');
            }
            // Join the video call room
            socket.join(roomId);
            socket.to(roomId).emit('user-joined-video-call', { peerId, roomId, userId: user.id });
            socket.emit('video-call-success', { roomId, message: 'Joined video call successfully' });
        }
        catch (error) {
            console.error('Video call join error:', error);
            socket.emit('video-call-error', 'Failed to join video call');
        }
    }));
    socket.on('leave-video-call', ({ roomId }) => {
        try {
            socket.leave(roomId);
            socket.to(roomId).emit('user-left-video-call', { peerId: socket.id, roomId, userId: user.id });
        }
        catch (error) {
            console.error('Video call leave error:', error);
            socket.emit('video-call-error', 'Failed to leave video call');
        }
    });
    socket.on('video-call-offer', (_b) => __awaiter(void 0, [_b], void 0, function* ({ roomId, offer }) {
        try {
            if (isGuest) {
                return socket.emit('video-call-error', 'Guests cannot make video calls');
            }
            socket.to(roomId).emit('video-call-offer', { offer, from: user.id });
        }
        catch (error) {
            console.error('Video call offer error:', error);
            socket.emit('video-call-error', 'Failed to send video call offer');
        }
    }));
    socket.on('video-call-answer', ({ roomId, answer }) => {
        try {
            socket.to(roomId).emit('video-call-answer', { answer, from: user.id });
        }
        catch (error) {
            console.error('Video call answer error:', error);
            socket.emit('video-call-error', 'Failed to send video call answer');
        }
    });
    socket.on('video-call-ice-candidate', ({ roomId, candidate }) => {
        try {
            socket.to(roomId).emit('video-call-ice-candidate', { candidate, from: user.id });
        }
        catch (error) {
            console.error('Video call ICE candidate error:', error);
            socket.emit('video-call-error', 'Failed to send ICE candidate');
        }
    });
    socket.on('end-video-call', ({ roomId }) => {
        try {
            socket.to(roomId).emit('video-call-ended', { from: user.id });
            socket.leave(roomId);
        }
        catch (error) {
            console.error('End video call error:', error);
            socket.emit('video-call-error', 'Failed to end video call');
        }
    });
};
exports.videoCallController = videoCallController;
