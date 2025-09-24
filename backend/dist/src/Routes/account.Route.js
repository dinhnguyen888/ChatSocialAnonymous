"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/userRoutes.ts
const express_1 = require("express");
const account_Controller_1 = require("../Controllers/account.Controller"); // Import controller
const login_Controller_1 = require("../Controllers/login.Controller");
const authen_Middleware_1 = require("../Middleware/authen.Middleware");
const router = (0, express_1.Router)();
// Định nghĩa các route
router.post('/accounts', account_Controller_1.createAccount);
router.get('/accounts', [authen_Middleware_1.authenticateJWT, account_Controller_1.getAccount]);
router.get('/accounts/:id', [account_Controller_1.getAccountByID]);
router.put('/accounts/change-password/:id', [account_Controller_1.changePasswordAccount]);
router.delete('/accounts/:id', [account_Controller_1.deleteAccount]);
router.post('/login', login_Controller_1.login);
router.post('/loginOTP', login_Controller_1.loginOTP);
router.post('/validateOTP', login_Controller_1.validateOTP);
exports.default = router;
