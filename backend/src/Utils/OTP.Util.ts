import { Request, Response } from "express";
import { transporter } from "../Configs/mailOtpAuth.Config";
import otpGenerator from 'otp-generator';

interface OtpDetails {
    otp: string;
    expirationTime: Date;
}

let otpDetails: OtpDetails | null = null; // Local variable to save OTP and expiration time

// Helper function to add minutes to a date
const addMinutesToTime = (date: Date, minutes: number): Date => {
    return new Date(date.getTime() + minutes * 60000);
};

// Generate OTP using otp-generator
const generateOtp = (): string => {
    return otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
};

export const sendOtp = async (email: string): Promise<boolean> => {
    const otp = generateOtp();
    const expirationTime = addMinutesToTime(new Date(), 10); // OTP valid for 10 minutes

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent with OTP:', otp);

        otpDetails = { otp, expirationTime }; // Store OTP and expiration time

        return true;
    } catch (error) {
        console.error("An error occurred while sending the email:", error);
        return false;
    }
};

export const checkValidateOTP = (otp: string, callback: (isValid: boolean, message: string) => void): void => {
    if (otpDetails) {
        const now = new Date();

        if (otpDetails.otp === otp && otpDetails.expirationTime > now) {
            console.log("OTP validated successfully");
            otpDetails = null; // Reset OTP after successful validation
            callback(true, 'Successfully logged in');
        } else {
            console.log("Provided OTP:", otp, "Stored OTP:", otpDetails.otp, "Expiration Time:", otpDetails.expirationTime);
            callback(false, 'Invalid or expired OTP');
        }
    } else {
        console.log("No OTP generated or OTP expired");
        callback(false, 'No OTP generated');
    }
};
