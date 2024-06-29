// routes/userRoutes.ts
import { Router } from 'express';
import {  changePasswordAccount, createAccount, deleteAccount, getAccount, getAccountByID } from '../Controllers/account.Controller'; // Import controller
import { login, loginOTP, validateOTP } from '../Controllers/login.Controller';
import { authenticateJWT } from '../Middleware/authen.Middleware';


const router = Router();

// Định nghĩa các route
router.post('/accounts', createAccount);
router.get('/accounts', [authenticateJWT,getAccount]);
router.get('/accounts/:id', [getAccountByID]);
router.put('/accounts/change-password/:id', [changePasswordAccount]);


router.delete('/accounts/:id', [deleteAccount]);
router.post('/login',login)
router.post('/loginOTP',loginOTP)
router.post('/validateOTP' ,validateOTP)

export default router;
