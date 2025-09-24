import { transporter } from "../configs/mailOtpAuth.config";
import otpGenerator from 'otp-generator';

interface OtpDetails {
    otp: string;
    expirationTime: Date;
}

let otpDetails: OtpDetails | null = null;

const addMinutesToTime = (date: Date, minutes: number): Date => {
    return new Date(date.getTime() + minutes * 60000);
};

const generateOtp = (): string => {
    return otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
};

export const sendOtp = async (email: string): Promise<boolean> => {
    const otp = generateOtp();
    const expirationTime = addMinutesToTime(new Date(), 10);
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };
    try {
        await transporter.sendMail(mailOptions);
        otpDetails = { otp, expirationTime };
        return true;
    } catch (error) {
        return false;
    }
};

export const checkValidateOTP = (otp: string, callback: (isValid: boolean, message: string) => void): void => {
    if (otpDetails) {
        const now = new Date();
        if (otpDetails.otp === otp && otpDetails.expirationTime > now) {
            otpDetails = null;
            callback(true, 'Successfully logged in');
        } else {
            callback(false, 'Invalid or expired OTP');
        }
    } else {
        callback(false, 'No OTP generated');
    }
};



