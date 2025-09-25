import { Request, Response } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { RoomService } from '../../application/services/room.service';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    console.log('Guest quickstart attempt with name:', name);
    const result = await AuthService.guestQuickStart(name);
    console.log('Guest created successfully:', result.id);
    try { 
      await RoomService.autoJoinGeneral(result.id); 
      console.log('Auto-joined general room');
    } catch (roomError) {
      console.log('Auto-join general room failed:', roomError);
    }
    res.status(200).json({ message: 'Guest login successful', token: result.token, id: result.id });
  } catch (error) {
    console.error('Guest quickstart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginOTP = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
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

export const deleteGuest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const result = await AuthService.deleteGuestAccount(id);
    if ('error' in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const registerOTP = async (req: Request, res: Response): Promise<void> => {
  const { email, name } = req.body;
  const result = await AuthService.registerSendOtp(email, name);
  if ('error' in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.status(200).json('OK');
}

export const linkEmailToGuest = async (req: Request, res: Response) => {
  try {
    const { guestId, email } = req.body;
    const result = await AuthService.linkEmailToGuest(guestId, email);
    if ('error' in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const verifyEmailLink = async (req: Request, res: Response) => {
  try {
    const { guestId, email, otp } = req.body;
    const result = await AuthService.verifyEmailLink(guestId, email, otp);
    if ('error' in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.status(200).json({ message: 'Email linked successfully', token: result.token, id: result.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}


