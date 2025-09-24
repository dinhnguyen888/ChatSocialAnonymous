import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../shared/config';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.sendStatus(401);
    }
    jwt.verify(token, config.jwtSecret, (err, user) => {
        if (err) {
            return res.sendStatus(403).json({ message: 'Token is not valid' });
        }
        req.user = user;
        next();
    });
};


