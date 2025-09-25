import type { Account, ValidateForm } from "../entities/Account.entity";
import {
  getUserByID as _getUserByID,
  deleteAccount as _deleteAccount,
  createAccount as _createAccount,
  guestQuickStart as _guestQuickStart,
  loginWithOTP as _loginWithOTP,
  validateOTP as _validateOTP,
  changePasswordAccount as _changePasswordAccount,
  deleteGuestAccount as _deleteGuestAccount,
} from "../services/apiAccount";

export const getAccount = _getUserByID;
export const removeAccount = _deleteAccount;
export const createAccount = (account: Account) => _createAccount(account);
export const guestQuickStart = (name?: string) => _guestQuickStart(name);
export const requestLoginOTP = (payload: { email: string; name: string }) => _loginWithOTP(payload);
export const validateOTP = (payload: ValidateForm) => _validateOTP(payload);
export const changePassword = (id: string, password: string) => _changePasswordAccount(id, password);
export const deleteGuest = (id: string) => _deleteGuestAccount(id);



