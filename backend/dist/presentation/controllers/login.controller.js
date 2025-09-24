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
exports.validateOTP = exports.loginOTP = exports.login = void 0;
const auth_service_1 = require("../../application/services/auth.service");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Account and password are required' });
            return;
        }
        const result = yield auth_service_1.AuthService.login(email, password);
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
exports.login = login;
const loginOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const result = yield auth_service_1.AuthService.sendLoginOtp(email);
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
