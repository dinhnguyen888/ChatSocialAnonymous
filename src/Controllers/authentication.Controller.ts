import { Request, Response } from 'express';
import Account from "../Models/account.Model";
import jwt from 'jsonwebtoken';

export const authentication = async (req: Request, res: Response): Promise<void> => {
    try {
        const { account, password } = req.body;

        // Tìm tài khoản trong cơ sở dữ liệu dựa trên account
        const accountInServer = await Account.findOne({ account });

        if (!accountInServer) {
            // Nếu không tìm thấy tài khoản, trả về lỗi 404 Not Found
            res.status(404).json({ error: 'Account not found' });
        }

        // Kiểm tra mật khẩu
        if (accountInServer!.password !== password) {
            // Nếu mật khẩu không khớp, trả về lỗi 401 Unauthorized
             res.status(401).json({ error: 'Invalid password' });
        }

        // Nếu tài khoản và mật khẩu đều hợp lệ, tạo JWT
        const token = jwt.sign({ username: account }, 'secretKey', { expiresIn: '1d' });

        // Gửi phản hồi thành công kèm theo token
        res.status(200).json({ message: 'Authentication successful', token });
    } catch (error) {
        // Xử lý lỗi
        console.log("Error while authentication:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
