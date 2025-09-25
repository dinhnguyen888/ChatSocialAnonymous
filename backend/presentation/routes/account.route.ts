import { Router } from 'express';
import {  createAccount, deleteAccount, getAccount, getAccountByID } from '../controllers/account.controller';
import { login, loginOTP, validateOTP, deleteGuest, linkEmailToGuest, verifyEmailLink, registerOTP } from '../controllers/login.controller';
import { uploadImage } from '../controllers/upload.controller';
import { authenticateJWT } from '../middlewares/authen.middleware';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const router = Router();

router.post('/accounts', createAccount);
router.get('/accounts', [authenticateJWT,getAccount]);
router.get('/accounts/:id', [getAccountByID]);
router.delete('/accounts/:id', [deleteAccount]);
router.post('/login',login)
router.post('/loginOTP',loginOTP)
router.post('/registerOTP',registerOTP)
router.post('/validateOTP' ,validateOTP)
router.delete('/guest/:id', deleteGuest)
router.post('/link-email', linkEmailToGuest)
router.post('/verify-email-link', verifyEmailLink)

// Image upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
router.post('/upload-image', authenticateJWT, upload.single('image'), uploadImage)

export default router;



