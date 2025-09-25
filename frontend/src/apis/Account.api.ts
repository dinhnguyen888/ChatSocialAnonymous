import type { Account, ValidateForm } from "../entities/Account.entity";
import {
  getUserByID as _getUserByID,
  deleteAccount as _deleteAccount,
  createAccount as _createAccount,
  guestQuickStart as _guestQuickStart,
  loginWithOTP as _loginWithOTP,
  validateOTP as _validateOTP,
  deleteGuestAccount as _deleteGuestAccount,
  linkEmailToGuest as _linkEmailToGuest,
  verifyEmailLink as _verifyEmailLink,
} from "../services/apiAccount";

export const getAccount = _getUserByID;
export const removeAccount = _deleteAccount;
export const createAccount = (account: Account) => _createAccount(account);
export const guestQuickStart = (name?: string) => _guestQuickStart(name);
export const requestLoginOTP = (payload: { email: string; name: string }) => _loginWithOTP(payload);
export const validateOTP = (payload: ValidateForm) => _validateOTP(payload);
export const deleteGuest = (id: string) => _deleteGuestAccount(id);
export const linkEmailToGuest = (guestId: string, email: string) => _linkEmailToGuest(guestId, email);
export const verifyEmailLink = (guestId: string, email: string, otp: string) => _verifyEmailLink(guestId, email, otp);



