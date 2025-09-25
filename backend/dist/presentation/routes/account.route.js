"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const account_controller_1 = require("../controllers/account.controller");
const login_controller_1 = require("../controllers/login.controller");
const upload_controller_1 = require("../controllers/upload.controller");
const authen_middleware_1 = require("../middlewares/authen.middleware");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
router.post('/accounts', account_controller_1.createAccount);
router.get('/accounts', [authen_middleware_1.authenticateJWT, account_controller_1.getAccount]);
router.get('/accounts/:id', [account_controller_1.getAccountByID]);
router.delete('/accounts/:id', [account_controller_1.deleteAccount]);
router.post('/login', login_controller_1.login);
router.post('/loginOTP', login_controller_1.loginOTP);
router.post('/registerOTP', login_controller_1.registerOTP);
router.post('/validateOTP', login_controller_1.validateOTP);
router.delete('/guest/:id', login_controller_1.deleteGuest);
router.post('/link-email', login_controller_1.linkEmailToGuest);
router.post('/verify-email-link', login_controller_1.verifyEmailLink);
// Image upload
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
router.post('/upload-image', authen_middleware_1.authenticateJWT, upload.single('image'), upload_controller_1.uploadImage);
exports.default = router;
