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
exports.checkValidateOTP = exports.sendOtp = void 0;
const mailOtpAuth_config_1 = require("../configs/mailOtpAuth.config");
const otp_generator_1 = __importDefault(require("otp-generator"));
let otpDetails = null;
const addMinutesToTime = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
};
const generateOtp = () => {
    return otp_generator_1.default.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
};
const sendOtp = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = generateOtp();
    const expirationTime = addMinutesToTime(new Date(), 10);
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };
    try {
        yield mailOtpAuth_config_1.transporter.sendMail(mailOptions);
        otpDetails = { otp, expirationTime };
        return true;
    }
    catch (error) {
        return false;
    }
});
exports.sendOtp = sendOtp;
const checkValidateOTP = (otp, callback) => {
    if (otpDetails) {
        const now = new Date();
        if (otpDetails.otp === otp && otpDetails.expirationTime > now) {
            otpDetails = null;
            callback(true, 'Successfully logged in');
        }
        else {
            callback(false, 'Invalid or expired OTP');
        }
    }
    else {
        callback(false, 'No OTP generated');
    }
};
exports.checkValidateOTP = checkValidateOTP;
