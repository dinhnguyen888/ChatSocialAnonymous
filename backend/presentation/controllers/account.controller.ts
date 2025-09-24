import { Request, Response } from 'express';
import { AccountService } from '../../application/services/account.service';

export const createAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await AccountService.createAccount(req.body);
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
};

export const getAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await AccountService.getAccounts();
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getAccountByID = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const account = await AccountService.getAccountById(id);
        if (!account) {
            res.status(404).json({ error: 'Account not found' });
            return;
        }
        res.status(200).json(account);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const changePasswordAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const {password} = req.body;
        const account = await AccountService.changePassword(req.params.id, password);
        if (!account) {
            res.status(404).send({ error: 'Account not found' });
            return;
        }
        res.send(account);
    } catch (error) {
        res.status(400).send(error);
    }
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await AccountService.deleteAccount(req.params.id);
        if (!user) {
            res.status(404).send({ error: 'Account not found' });
            return;
        }
        res.send({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
};



