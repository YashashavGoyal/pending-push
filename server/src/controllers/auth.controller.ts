import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { UnauthorizedError } from '../errors/app-error.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Account Created Successfully',
        token: result.token,
        userId: result.userId,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Login Successfull',
        token: result.token,
        userId: result.userId,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Unauthorized');
      }
      const user = await this.authService.getUserProfile(userId);
      res.status(200).json({
        success: true,
        message: 'User Data Fetched Succesfully',
        user,
      });
    } catch (error) {
      next(error);
    }
  };
}
