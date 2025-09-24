import { Request, Response } from 'express';
import { AuthService } from '../../application/services/auth.service';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Account and password are required' });
      return;
    }
    const result = await AuthService.login(email, password);
    if ('error' in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.status(200).json({ message: 'Authentication successful', token: result.token, id: result.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginOTP = async (req: Request, res: Response): Promise<void> => {
  const email = req.body.email;
  const result = await AuthService.sendLoginOtp(email);
  if ('error' in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.status(200).json('OK');
}

export const validateOTP = async (req:Request, res:Response) => {
  try {
    const { otp, email } = req.body;
    const result = await AuthService.validateOtp(email, otp);
    if ('error' in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.status(200).json({ message: 'Authentication successful', token: result.token, id: result.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


