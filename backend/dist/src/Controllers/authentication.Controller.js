"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const account_Model_1 = __importDefault(require("../Models/account.Model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authentication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { account, password } = req.body;
        // Tìm tài khoản trong cơ sở dữ liệu dựa trên account
        const accountInServer = yield account_Model_1.default.findOne({ account });
        if (!accountInServer) {
            // Nếu không tìm thấy tài khoản, trả về lỗi 404 Not Found
            res.status(404).json({ error: 'Account not found' });
        }
        // Kiểm tra mật khẩu
        if (accountInServer.password !== password) {
            // Nếu mật khẩu không khớp, trả về lỗi 401 Unauthorized
            res.status(401).json({ error: 'Invalid password' });
        }
        // Nếu tài khoản và mật khẩu đều hợp lệ, tạo JWT
        const token = jsonwebtoken_1.default.sign({ username: account }, 'secretKey', { expiresIn: '1d' });
        // Gửi phản hồi thành công kèm theo token
        res.status(200).json({ message: 'Authentication successful', token });
    }
    catch (error) {
        // Xử lý lỗi
        console.log("Error while authentication:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.authentication = authentication;
