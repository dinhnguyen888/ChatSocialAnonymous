import type { Account, ValidateForm } from "../entities/Account.entity";
import * as AccountApi from "../apis/Account.api";

export const AccountService = {
  getById: AccountApi.getAccount,
  create: (account: Account) => AccountApi.createAccount(account),
  remove: AccountApi.removeAccount,
  guestQuickStart: AccountApi.guestQuickStart,
  requestLoginOTP: AccountApi.requestLoginOTP,
  validateOTP: (payload: ValidateForm) => AccountApi.validateOTP(payload),
  changePassword: AccountApi.changePassword,
  deleteGuest: AccountApi.deleteGuest,
};
