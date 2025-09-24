import Account from '../../domain/models/account.entity';
import jwt from 'jsonwebtoken';
import { config } from '../../shared/config';
import { checkValidateOTP, sendOtp } from '../../shared/utils/otp.util';

export const AuthService = {
  async login(email: string, password: string) {
    const account = await Account.findOne({ email });
    if (!account) return { error: 'Account not found', status: 404 } as const;
    if (account.password !== password) return { error: 'Invalid password', status: 401 } as const;
    const token = jwt.sign({ username: email }, config.jwtSecret, { expiresIn: '1d' });
    return { token, id: account._id.toString(), status: 200 } as const;
  },

  async sendLoginOtp(email: string) {
    const account = await Account.findOne({ email });
    if (!email || !account) return { error: 'Email is required', status: 400 } as const;
    const ok = await sendOtp(email);
    return ok ? { ok: true, status: 200 } as const : { error: 'Failed', status: 500 } as const;
  },

  validateOtp(email: string, otp: string) {
    return new Promise<{ token?: string; id?: string; error?: string; status: number }>((resolve) => {
      checkValidateOTP(otp, (isValid: boolean, message: string) => {
        if (isValid) {
          const token = jwt.sign({ username: email }, config.jwtSecret, { expiresIn: '1d' });
          resolve({ token, id: '', status: 200 });
        } else {
          resolve({ error: message, status: 401 });
        }
      });
    });
  },
};


