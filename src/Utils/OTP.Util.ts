import { Request,Response } from "express"
import { transporter } from "../Configs/mailOtpAuth.Config";
import nodemailer from 'nodemailer';


let OTP: number | null = null; // Biến toàn cục để lưu OTP tạm thời

const generateOtp = (): number => {
    return Math.floor(100000 + Math.random() * 900000);
};

export const  sendOtp  =  async (email:string) =>{
   const otp = generateOtp();
 

    const mailOptions = {
        from: 'your_email@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}` 
    };

    
   

    try{
        await transporter.sendMail(mailOptions);
        console.log('Email sent');
        console.log(otp)
        OTP = otp;

        return true;
    }
    catch(error)
    {
        console.log("an error occur!!" ,error)
        return false
    }

   
}

export const checkValidateOTP = ( otp: number, res: Response): void => {
    if (OTP === otp && OTP !== null) {
        console.log("OTP validated successfully");
        res.status(200).send({ message: 'Successfully logged in' });
        OTP = null; // Reset OTP after successful validation
    } else {
        res.status(401).send({ message: 'Invalid OTP' });
        console.log("Provided OTP:", otp, "Stored OTP:", OTP);
    }
};
