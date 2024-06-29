import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401); // Nếu không có token, trả về lỗi 401 Unauthorized
    }


    jwt.verify(token, 'secretKey', (err, user) => {
        if (err) {
            return res.sendStatus(403).json({ message: 'Token is not valid' }); // Nếu token không hợp lệ, trả về lỗi 403 Forbidden
        }

        req.user = user; // Gán thông tin người dùng vào req.user
        console.log(req.user)
        next(); // Nếu token hợp lệ, chuyển đến middleware tiếp theo
    });
};
