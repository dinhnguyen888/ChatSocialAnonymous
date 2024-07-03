import { Request, Response } from 'express';
import Account from "../Models/account.Model";
import jwt from 'jsonwebtoken';
import { transporter } from '../Configs/mailOtpAuth.Config';
import nodemailder from 'nodemailer'
import {checkValidateOTP, sendOtp}  from '../Utils/OTP.Util';
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        console.log("Request body:", req.body);  // Debug request to frontend
        if (!email || !password) {
            res.status(400).json({ error: 'Account and password are required' });
            return;
        }

        const accountInServer = await Account.findOne({ email });

        console.log(accountInServer)
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
        const token = jwt.sign({ username: email }, 'secretKey', { expiresIn: '1d' });

        // success
        res.status(200).json({ 
            message: 'Authentication successful', 
            token: token, 
            id: accountInServer._id.toString()
        });
      
    } catch (error) {
        // error 
        console.log("Error while authentication:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const loginOTP = async (req: Request, res: Response): Promise<void> => {
    const email = req.body.email;
    const accountInServer = await Account.findOne({ email });
  
    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }

    const successfullySendOTP = await sendOtp(email)
    if(!successfullySendOTP){
        res.sendStatus(500)
    }
    else{
        res.status(200).json('OK')
    }
 
}


export const validateOTP = async (req:Request, res:Response) => {
    try {
        const { otp, email } = req.body;
        
        // Check if account exists
        const accountInServer = await Account.findOne({ email });
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
        checkValidateOTP(otp, (isValid, message) => {
            if (isValid) {
                const token = jwt.sign({ username: email }, 'secretKey', { expiresIn: '1d' });
                res.status(200).json({ message: 'Authentication successful', token: token, id: accountInServer._id.toString() });
            } else {
                res.status(401).json({ error: message });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};