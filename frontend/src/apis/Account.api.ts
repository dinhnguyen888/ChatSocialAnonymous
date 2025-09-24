import type { Account, ValidateForm } from "../entities/Account.entity";
import {
  getUserByID as _getUserByID,
  deleteAccount as _deleteAccount,
  createAccount as _createAccount,
  login as _login,
  loginWithOTP as _loginWithOTP,
  validateOTP as _validateOTP,
  changePasswordAccount as _changePasswordAccount,
} from "../services/apiAccount";

export const getAccount = _getUserByID;
export const removeAccount = _deleteAccount;
export const createAccount = (account: Account) => _createAccount(account);
export const login = (email: string, password: string) => _login(email, password);
export const requestLoginOTP = (payload: { email: string }) => _loginWithOTP(payload);
export const validateOTP = (payload: ValidateForm) => _validateOTP(payload);
export const changePassword = (id: string, password: string) => _changePasswordAccount(id, password);



