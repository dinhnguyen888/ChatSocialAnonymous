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
    guestQuickStart(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const displayName = name && name.trim() ? name.trim() : `Guest-${Math.floor(Math.random() * 100000)}`;
            const guestEmail = `guest-${Date.now()}-${Math.floor(Math.random() * 100000)}@temp.local`;
            const account = yield account_entity_1.default.create({ name: displayName, role: 'Guest', email: guestEmail });
            const token = jsonwebtoken_1.default.sign({ username: displayName, id: account._id.toString(), role: 'Guest' }, config_1.config.jwtSecret, { expiresIn: '12h' });
            return { token, id: account._id.toString(), status: 200 };
        });
    },
    sendLoginOtp(email, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email)
                return { error: 'Email is required', status: 400 };
            let account = yield account_entity_1.default.findOne({ email });
            if (!account) {
                account = yield account_entity_1.default.create({ email, name: name || '', role: 'User' });
            }
            else if (name && !account.name) {
                account.name = name;
                yield account.save();
            }
            const ok = yield (0, otp_util_1.sendOtp)(email);
            return ok ? { ok: true, status: 200 } : { error: 'Failed', status: 500 };
        });
    },
    validateOtp(email, otp) {
        return new Promise((resolve) => {
            (0, otp_util_1.checkValidateOTP)(otp, (isValid, message) => {
                if (isValid) {
                    resolve(account_entity_1.default.findOne({ email }).then((acc) => {
                        if (!acc)
                            return { error: 'Account not found', status: 404 };
                        const token = jsonwebtoken_1.default.sign({ username: acc.email || acc.name, id: acc._id.toString(), role: acc.role || 'User' }, config_1.config.jwtSecret, { expiresIn: '1d' });
                        return { token, id: acc._id.toString(), status: 200 };
                    }));
                }
                else {
                    resolve({ error: message, status: 401 });
                }
            });
        });
    },
    deleteGuestAccount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const acc = yield account_entity_1.default.findById(id);
            if (!acc)
                return { error: 'Not found', status: 404 };
            if (acc.role !== 'Guest')
                return { error: 'Not a guest', status: 400 };
            yield account_entity_1.default.findByIdAndDelete(id);
            return { ok: true, status: 200 };
        });
    },
    linkEmailToGuest(guestId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const guest = yield account_entity_1.default.findById(guestId);
            if (!guest)
                return { error: 'Guest not found', status: 404 };
            if (guest.role !== 'Guest')
                return { error: 'Not a guest account', status: 400 };
            if (!email)
                return { error: 'Email is required', status: 400 };
            // Check if email is already taken
            const existingAccount = yield account_entity_1.default.findOne({ email });
            if (existingAccount)
                return { error: 'Email already exists', status: 400 };
            // Update guest account with email and change role to User
            guest.email = email;
            guest.role = 'User';
            yield guest.save();
            const ok = yield (0, otp_util_1.sendOtp)(email);
            return ok ? { ok: true, status: 200 } : { error: 'Failed to send OTP', status: 500 };
        });
    },
    verifyEmailLink(guestId, email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield account_entity_1.default.findById(guestId);
            if (!account)
                return { error: 'Account not found', status: 404 };
            if (account.email !== email)
                return { error: 'Email mismatch', status: 400 };
            return new Promise((resolve) => {
                (0, otp_util_1.checkValidateOTP)(otp, (isValid, message) => {
                    if (isValid) {
                        const token = jsonwebtoken_1.default.sign({ username: account.email || account.name, id: account._id.toString(), role: account.role || 'User' }, config_1.config.jwtSecret, { expiresIn: '1d' });
                        resolve({ token, id: account._id.toString(), status: 200 });
                    }
                    else {
                        resolve({ error: message, status: 401 });
                    }
                });
            });
        });
    }
};
