"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/userRoutes.ts
const express_1 = require("express");
const account_Controller_1 = require("../Controllers/account.Controller"); // Import controller
const router = (0, express_1.Router)();
// Định nghĩa các route
router.post('/accounts', account_Controller_1.createAccount);
router.get('/accounts', account_Controller_1.getAccount);
exports.default = router;
