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
exports.deleteAccount = exports.changePasswordAccount = exports.getAccountByID = exports.getAccount = exports.createAccount = void 0;
const account_Model_1 = __importDefault(require("../Models/account.Model")); // Import model User
const mongoose_1 = __importDefault(require("mongoose"));
// Tạo mới một tài khoản
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = new account_Model_1.default(req.body);
    try {
        yield user.save();
        res.status(201).send(user);
    }
    catch (error) {
        res.status(400).send(error);
    }
});
exports.createAccount = createAccount;
// Lấy danh sách tài khoản
const getAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield account_Model_1.default.find();
        res.send(users);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.getAccount = getAccount;
const getAccountByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Kiểm tra xem id có phải là ObjectId hợp lệ không
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid account ID' });
            return;
        }
        const account = yield account_Model_1.default.findById(id);
        if (!account) {
            // Nếu không tìm thấy tài khoản, trả về lỗi 404 Not Found
            res.status(404).json({ error: 'Account not found' });
            return;
        }
        // Gửi phản hồi thành công kèm theo dữ liệu tài khoản
        res.status(200).json(account);
        console.log(account);
    }
    catch (error) {
        console.log("Error while getting account by ID:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getAccountByID = getAccountByID;
// Cập nhật thông tin tài khoản
const changePasswordAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password } = req.body;
        const account = yield account_Model_1.default.findByIdAndUpdate(req.params.id, { password: password }, { new: true, runValidators: true });
        if (!account) {
            res.status(404).send({ error: 'Account not found' });
        }
        res.send(account);
    }
    catch (error) {
        res.status(400).send(error);
    }
});
exports.changePasswordAccount = changePasswordAccount;
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
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield account_Model_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).send({ error: 'Account not found' });
        }
        res.send({ message: 'Account deleted successfully' });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.deleteAccount = deleteAccount;
