// controllers/userController.ts
import { Request, Response } from 'express';
import Account from '../Models/account.Model'; // Import model User

// Tạo mới một người dùng
export const createAccount = async (req: Request, res: Response): Promise<void> => {
    const user = new Account(req.body);
    try {
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Lấy danh sách người dùng
export const getAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await Account.find();
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
};

// export const postAccount = async (req:Request , res:Response): Promise<void> =>{
//     try{

//     }
// }