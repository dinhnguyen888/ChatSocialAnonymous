// controllers/userController.ts
import { Request, Response } from 'express';
import Account from '../Models/account.Model'; // Import model User
import hashmapPassword from '../Utils/hashmapPassword.Util';
import mongoose from 'mongoose';

    // Tạo mới một tài khoản
    export const createAccount = async (req: Request, res: Response): Promise<void> => {
        const user = new Account(req.body);
        try {
            await user.save();
            res.status(201).send(user);
        } catch (error) {
            res.status(400).send(error);
        }
    };

    // Lấy danh sách tài khoản
    export const getAccount = async (req: Request, res: Response): Promise<void> => {
        try {
            const users = await Account.find();
            res.send(users);
        } catch (error) {
            res.status(500).send(error);
        }
    };
   

export const getAccountByID = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Kiểm tra xem id có phải là ObjectId hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid account ID' });
            return;
        }
        const account = await Account.findById(id);
        if (!account) {
            // Nếu không tìm thấy tài khoản, trả về lỗi 404 Not Found
            res.status(404).json({ error: 'Account not found' });
            return;
        }
        // Gửi phản hồi thành công kèm theo dữ liệu tài khoản
        res.status(200).json(account);
        console.log(account);
    } catch (error) {
        console.log("Error while getting account by ID:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
    // Cập nhật thông tin tài khoản
    export const changePasswordAccount = async (req: Request, res: Response): Promise<void> => {
        
        try {
            const {password} = req.body;

           
            const account = await Account.findByIdAndUpdate(req.params.id, { password: password }, { new: true, runValidators: true });
            if (!account) {
                res.status(404).send({ error: 'Account not found' });
            }
            res.send(account);
        } catch (error) {
            res.status(400).send(error);
        }
    };

    // export const changeNameAccount = async (req: Request, res: Response): Promise<void> => {
        
    //     try {
    //         const {name} = req.body;

           
    //         const account = await Account.findByIdAndUpdate(req.params.id, {name:name}, { new: true, runValidators: true });
    //         if (!account) {
    //             res.status(404).send({ error: 'Account not found' });
    //         }
            
    //         res.send(account);
    //     } catch (error) {
    //         res.status(400).send(error);
    //     }
    // };


    // Xóa một tài khoản
    export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await Account.findByIdAndDelete(req.params.id);
            if (!user) {
                res.status(404).send({ error: 'Account not found' });
            }
            res.send({ message: 'Account deleted successfully' });
        } catch (error) {
            res.status(500).send(error);
        }
    };


