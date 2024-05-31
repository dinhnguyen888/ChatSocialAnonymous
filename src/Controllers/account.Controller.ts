// controllers/userController.ts
import { Request, Response } from 'express';
import Account from '../Models/account.Model'; // Import model User
import hashmapPassword from '../Utils/hashmapPassword.Util';

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

    // Cập nhật thông tin tài khoản
    export const updateAccount = async (req: Request, res: Response): Promise<void> => {
        
        try {
            const {password} = req.body;

            const newPassword = await hashmapPassword(password)
            const passwordHasHashed = {password:newPassword}

            const user = await Account.findByIdAndUpdate(req.params.id, passwordHasHashed, { new: true, runValidators: true });
            if (!user) {
                res.status(404).send({ error: 'Account not found' });
            }
            res.send(user);
        } catch (error) {
            res.status(400).send(error);
        }
    };

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


