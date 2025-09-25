import { Router } from 'express';
import {  createAccount, deleteAccount, getAccount, getAccountByID } from '../controllers/account.controller';
import { login, loginOTP, validateOTP, deleteGuest, linkEmailToGuest, verifyEmailLink } from '../controllers/login.controller';
import { authenticateJWT } from '../middlewares/authen.middleware';

const router = Router();

router.post('/accounts', createAccount);
router.get('/accounts', [authenticateJWT,getAccount]);
router.get('/accounts/:id', [getAccountByID]);
router.delete('/accounts/:id', [deleteAccount]);
router.post('/login',login)
router.post('/loginOTP',loginOTP)
router.post('/validateOTP' ,validateOTP)
router.delete('/guest/:id', deleteGuest)
router.post('/link-email', linkEmailToGuest)
router.post('/verify-email-link', verifyEmailLink)

export default router;



