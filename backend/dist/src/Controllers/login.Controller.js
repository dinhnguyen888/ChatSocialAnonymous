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
exports.validateOTP = exports.loginOTP = exports.login = void 0;
const account_Model_1 = __importDefault(require("../Models/account.Model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const OTP_Util_1 = require("../Utils/OTP.Util");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log("Request body:", req.body); // Debug request to frontend
        if (!email || !password) {
            res.status(400).json({ error: 'Account and password are required' });
            return;
        }
        const accountInServer = yield account_Model_1.default.findOne({ email });
        console.log(accountInServer);
        if (!accountInServer) {
            console.log("Account not found:", email);
            res.status(404).json({ error: 'Account not found' });
            return;
        }
        if (accountInServer.password !== password) {
            res.status(401).json({ error: 'Invalid password' });
            return;
        }
        // create token with JWT
        const token = jsonwebtoken_1.default.sign({ username: email }, 'secretKey', { expiresIn: '1d' });
        // success
        res.status(200).json({
            message: 'Authentication successful',
            token: token,
            id: accountInServer._id.toString()
        });
    }
    catch (error) {
        // error 
        console.log("Error while authentication:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.login = login;
const loginOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const accountInServer = yield account_Model_1.default.findOne({ email });
    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }
    const successfullySendOTP = yield (0, OTP_Util_1.sendOtp)(email);
    if (!successfullySendOTP) {
        res.sendStatus(500);
    }
    else {
        res.status(200).json('OK');
    }
});
exports.loginOTP = loginOTP;
const validateOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp, email } = req.body;
        // Check if account exists
        const accountInServer = yield account_Model_1.default.findOne({ email });
        if (!accountInServer) {
            res.status(400).json({ error: 'Account not found' });
            return;
        }
        // Check if OTP is a number
        if (isNaN(otp)) {
            res.status(400).json({ error: 'A valid OTP is required' });
            return;
        }
        // Validate OTP
        (0, OTP_Util_1.checkValidateOTP)(otp, (isValid, message) => {
            if (isValid) {
                const token = jsonwebtoken_1.default.sign({ username: email }, 'secretKey', { expiresIn: '1d' });
                res.status(200).json({ message: 'Authentication successful', token: token, id: accountInServer._id.toString() });
            }
            else {
                res.status(401).json({ error: message });
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.validateOTP = validateOTP;
