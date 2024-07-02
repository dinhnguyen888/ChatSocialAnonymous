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
exports.sendOtp = void 0;
const mailOtpAuth_Config_1 = require("../Configs/mailOtpAuth.Config");
const sendOtp = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = () => {
        const randomString = Math.floor(100000 + Math.random() * 900000); // Lấy 6 ký tự đầu tiên
        return randomString;
    };
    const mailOptions = {
        from: 'your_email@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp()}` // Gọi hàm otp() để lấy mã OTP thực tế
    };
    try {
        yield mailOtpAuth_Config_1.transporter.sendMail(mailOptions);
        console.log('Email sent');
        return true;
    }
    catch (error) {
        console.log("an error occur!!", error);
        return false;
    }
});
exports.sendOtp = sendOtp;
