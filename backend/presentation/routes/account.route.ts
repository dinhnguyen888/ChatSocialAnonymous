import { Router } from 'express';
import {  changePasswordAccount, createAccount, deleteAccount, getAccount, getAccountByID } from '../controllers/account.controller';
import { login, loginOTP, validateOTP } from '../controllers/login.controller';
import { authenticateJWT } from '../middlewares/authen.middleware';

const router = Router();

router.post('/accounts', createAccount);
router.get('/accounts', [authenticateJWT,getAccount]);
router.get('/accounts/:id', [getAccountByID]);
router.put('/accounts/change-password/:id', [changePasswordAccount]);
router.delete('/accounts/:id', [deleteAccount]);
router.post('/login',login)
router.post('/loginOTP',loginOTP)
router.post('/validateOTP' ,validateOTP)

export default router;



