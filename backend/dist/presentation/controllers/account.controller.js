"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.changePasswordAccount = exports.getAccountByID = exports.getAccount = exports.createAccount = void 0;
const account_service_1 = require("../../application/services/account.service");
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield account_service_1.AccountService.createAccount(req.body);
        res.status(201).send(user);
    }
    catch (error) {
        res.status(400).send(error);
    }
});
exports.createAccount = createAccount;
const getAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield account_service_1.AccountService.getAccounts();
        res.send(users);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.getAccount = getAccount;
const getAccountByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const account = yield account_service_1.AccountService.getAccountById(id);
        if (!account) {
            res.status(404).json({ error: 'Account not found' });
            return;
        }
        res.status(200).json(account);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getAccountByID = getAccountByID;
const changePasswordAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password } = req.body;
        const account = yield account_service_1.AccountService.changePassword(req.params.id, password);
        if (!account) {
            res.status(404).send({ error: 'Account not found' });
            return;
        }
        res.send(account);
    }
    catch (error) {
        res.status(400).send(error);
    }
});
exports.changePasswordAccount = changePasswordAccount;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield account_service_1.AccountService.deleteAccount(req.params.id);
        if (!user) {
            res.status(404).send({ error: 'Account not found' });
            return;
        }
        res.send({ message: 'Account deleted successfully' });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.deleteAccount = deleteAccount;
