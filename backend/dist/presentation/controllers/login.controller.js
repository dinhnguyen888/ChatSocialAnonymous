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
exports.verifyEmailLink = exports.linkEmailToGuest = exports.deleteGuest = exports.validateOTP = exports.loginOTP = exports.login = void 0;
const auth_service_1 = require("../../application/services/auth.service");
const room_service_1 = require("../../application/services/room.service");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        console.log('Guest quickstart attempt with name:', name);
        const result = yield auth_service_1.AuthService.guestQuickStart(name);
        console.log('Guest created successfully:', result.id);
        try {
            yield room_service_1.RoomService.autoJoinGeneral(result.id);
            console.log('Auto-joined general room');
        }
        catch (roomError) {
            console.log('Auto-join general room failed:', roomError);
        }
        res.status(200).json({ message: 'Guest login successful', token: result.token, id: result.id });
    }
    catch (error) {
        console.error('Guest quickstart error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.login = login;
const loginOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name } = req.body;
    const result = yield auth_service_1.AuthService.sendLoginOtp(email, name);
    if ('error' in result) {
        res.status(result.status).json({ error: result.error });
        return;
    }
    res.status(200).json('OK');
});
exports.loginOTP = loginOTP;
const validateOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp, email } = req.body;
        const result = yield auth_service_1.AuthService.validateOtp(email, otp);
        if ('error' in result) {
            res.status(result.status).json({ error: result.error });
            return;
        }
        res.status(200).json({ message: 'Authentication successful', token: result.token, id: result.id });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.validateOTP = validateOTP;
const deleteGuest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield auth_service_1.AuthService.deleteGuestAccount(id);
        if ('error' in result) {
            res.status(result.status).json({ error: result.error });
            return;
        }
        res.status(200).json({ ok: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteGuest = deleteGuest;
const linkEmailToGuest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { guestId, email } = req.body;
        const result = yield auth_service_1.AuthService.linkEmailToGuest(guestId, email);
        if ('error' in result) {
            res.status(result.status).json({ error: result.error });
            return;
        }
        res.status(200).json({ message: 'OTP sent to email' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.linkEmailToGuest = linkEmailToGuest;
const verifyEmailLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { guestId, email, otp } = req.body;
        const result = yield auth_service_1.AuthService.verifyEmailLink(guestId, email, otp);
        if ('error' in result) {
            res.status(result.status).json({ error: result.error });
            return;
        }
        res.status(200).json({ message: 'Email linked successfully', token: result.token, id: result.id });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.verifyEmailLink = verifyEmailLink;
