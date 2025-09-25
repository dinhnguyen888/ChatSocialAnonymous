import Account from '../../domain/models/account.entity';
import jwt from 'jsonwebtoken';
import { config } from '../../shared/config';
import { checkValidateOTP, sendOtp } from '../../shared/utils/otp.util';

export const AuthService = {
  async guestQuickStart(name?: string) {
    const displayName = name && name.trim() ? name.trim() : `Guest-${Math.floor(Math.random()*100000)}`;
    const guestEmail = `guest-${Date.now()}-${Math.floor(Math.random()*100000)}@temp.local`;
    const account = await Account.create({ name: displayName, role: 'Guest', email: guestEmail });
    const token = jwt.sign({ username: displayName, id: account._id.toString(), role: 'Guest' }, config.jwtSecret, { expiresIn: '12h' });
    return { token, id: account._id.toString(), status: 200 } as const;
  },

  async sendLoginOtp(email: string, name: string) {
    if (!email) return { error: 'Email is required', status: 400 } as const;
    let account = await Account.findOne({ email });
    if (!account) {
      account = await Account.create({ email, name: name || '', role: 'User' });
    } else if (name && !account.name) {
      account.name = name;
      await account.save();
    }
    const ok = await sendOtp(email);
    return ok ? { ok: true, status: 200 } as const : { error: 'Failed', status: 500 } as const;
  },

  validateOtp(email: string, otp: string) {
    return new Promise<{ token?: string; id?: string; error?: string; status: number }>((resolve) => {
      checkValidateOTP(otp, (isValid: boolean, message: string) => {
        if (isValid) {
          resolve(Account.findOne({ email }).then((acc) => {
            if (!acc) return { error: 'Account not found', status: 404 } as const;
            const token = jwt.sign({ username: acc.email || acc.name, id: acc._id.toString(), role: acc.role || 'User' }, config.jwtSecret, { expiresIn: '1d' });
            return { token, id: acc._id.toString(), status: 200 } as const;
          }));
        } else {
          resolve({ error: message, status: 401 });
        }
      });
    });
  },

  async deleteGuestAccount(id: string) {
    const acc = await Account.findById(id);
    if (!acc) return { error: 'Not found', status: 404 } as const;
    if (acc.role !== 'Guest') return { error: 'Not a guest', status: 400 } as const;
    await Account.findByIdAndDelete(id);
    return { ok: true, status: 200 } as const;
  }
};


