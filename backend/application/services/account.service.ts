import Account from '../../domain/models/account.entity';
import mongoose from 'mongoose';

export const AccountService = {
  async createAccount(payload: any) {
    const user = new Account(payload);
    return await user.save();
  },

  async getAccounts() {
    return await Account.find();
  },

  async getAccountById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Account.findById(id);
  },

  async changePassword(id: string, password: string) {
    return await Account.findByIdAndUpdate(id, { password }, { new: true, runValidators: true });
  },

  async deleteAccount(id: string) {
    return await Account.findByIdAndDelete(id);
  },
};


