"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../shared/config");
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.sendStatus(401); // Nếu không có token, trả về lỗi 401 Unauthorized
    }
    jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret, (err, user) => {
        if (err) {
            return res.sendStatus(403).json({ message: 'Token is not valid' }); // Nếu token không hợp lệ, trả về lỗi 403 Forbidden
        }
        req.user = user; // Gán thông tin người dùng vào req.user
        console.log(req.user);
        next(); // Nếu token hợp lệ, chuyển đến middleware tiếp theo
    });
};
exports.authenticateJWT = authenticateJWT;
