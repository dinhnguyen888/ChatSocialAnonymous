// routes/userRoutes.ts
import { Router } from 'express';
import { createAccount, getAccount } from '../Controllers/account.Controller'; // Import controller

const router = Router();

// Định nghĩa các route
router.post('/accounts', createAccount);
router.get('/accounts', getAccount);

export default router;
