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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const account_entity_1 = __importDefault(require("../../domain/models/account.entity"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../shared/config");
const otp_util_1 = require("../../shared/utils/otp.util");
exports.AuthService = {
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield account_entity_1.default.findOne({ email });
            if (!account)
                return { error: 'Account not found', status: 404 };
            if (account.password !== password)
                return { error: 'Invalid password', status: 401 };
            const token = jsonwebtoken_1.default.sign({ username: email }, config_1.config.jwtSecret, { expiresIn: '1d' });
            return { token, id: account._id.toString(), status: 200 };
        });
    },
    sendLoginOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield account_entity_1.default.findOne({ email });
            if (!email || !account)
                return { error: 'Email is required', status: 400 };
            const ok = yield (0, otp_util_1.sendOtp)(email);
            return ok ? { ok: true, status: 200 } : { error: 'Failed', status: 500 };
        });
    },
    validateOtp(email, otp) {
        return new Promise((resolve) => {
            (0, otp_util_1.checkValidateOTP)(otp, (isValid, message) => {
                if (isValid) {
                    const token = jsonwebtoken_1.default.sign({ username: email }, config_1.config.jwtSecret, { expiresIn: '1d' });
                    resolve({ token, id: '', status: 200 });
                }
                else {
                    resolve({ error: message, status: 401 });
                }
            });
        });
    },
};
