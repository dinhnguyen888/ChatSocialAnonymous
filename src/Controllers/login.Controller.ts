import { Request, Response } from 'express';
import Account from "../Models/account.Model";
import jwt from 'jsonwebtoken';
import { transporter } from '../Configs/mailOtpAuth.Config';
import nodemailder from 'nodemailer'
import {checkValidateOTP, sendOtp}  from '../Utils/OTP.Util';
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { account, password } = req.body;

        console.log("Request body:", req.body);  // Debug request to frontend
        if (!account || !password) {
            res.status(400).json({ error: 'Account and password are required' });
            return;
        }

        const accountInServer = await Account.findOne({ account });

        console.log(accountInServer)
        if (!accountInServer) {
           
            console.log("Account not found:", account);  
            res.status(404).json({ error: 'Account not found' });
            return;
        }

        if (accountInServer.password !== password) {
      
            res.status(401).json({ error: 'Invalid password' });
            return;
        }

        // create token with JWT
        const token = jwt.sign({ username: account }, 'secretKey', { expiresIn: '1d' });

        // success
        res.status(200).json({ message: 'Authentication successful', token });
    } catch (error) {
        // error 
        console.log("Error while authentication:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const loginOTP = async (req: Request, res: Response): Promise<void> => {
    const email = req.body.account;
    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }

    const successfullySendOTP = await sendOtp(email)
    if(!successfullySendOTP){
        res.sendStatus(500)
    }
    else{
        res.send(200)
    }
    // const otp = () => {
    //     const  randomString  = Math.floor(100000 + Math.random() * 900000); // Lấy 6 ký tự đầu tiên
    //     return randomString;
    // }
    // const mailOptions = {
    //     from: 'your_email@gmail.com',
    //     to: email,
    //     subject: 'Your OTP Code',
    //     text: `Your OTP code is ${otp()}` // Gọi hàm otp() để lấy mã OTP thực tế
    // };
    // try {
    //     await transporter.sendMail(mailOptions);
    //     console.log('Email sent');
    //     res.status(200).json({ message: 'OTP sent successfully' }); // Trả về phản hồi cho client
    // } catch (error) {
    //     console.log('Error sending email:', error);
    //     res.status(500).json({ error: 'Failed to send OTP' }); // Trả về phản hồi cho client nếu gửi email thất bại
    // }
}

export const validateOTP = (req: Request, res: Response): void => {
    const otp = parseInt(req.body.otp, 10);
    if (isNaN(otp)) {
        res.status(400).json({ error: 'A valid OTP is required' });
        return;
    }

    checkValidateOTP(otp, res);
};