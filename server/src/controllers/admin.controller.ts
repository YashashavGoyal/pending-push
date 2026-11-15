import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AdminService } from '../services/admin.service.js';

export class AdminController {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminService
  ) {}

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.adminLogin(req.body);
      res.status(200).json({
        success: true,
        message: 'Logged In',
        token: result.token,
        userId: result.userId,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.getAllUsers();
      res.status(200).json({
        success: true,
        message: 'Successfully Fetched Users',
        users: result.items,
        hasMore: result.hasMore,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.adminService.deleteUser(String(req.params.id));
      res.status(200).json({
        success: true,
        message: 'User Deleted',
      });
    } catch (error) {
      next(error);
    }
  };

  public getUserPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.getUserPosts(String(req.params.id));
      res.status(200).json({
        success: true,
        message: 'Post Fetched Succesfully',
        posts: result.items,
      });
    } catch (error) {
      next(error);
    }
  };

  public getPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.getAllPosts();
      res.status(200).json({
        success: true,
        message: 'Successfully Fetched Posts',
        posts: result.items,
        hasMore: result.hasMore,
      });
    } catch (error) {
      next(error);
    }
  };

  public getContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.getAllContacts();
      res.status(200).json({
        success: true,
        message: 'Successfully Fetched Contacts',
        contacts: result.items,
        messageList: result.items,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.adminService.deleteContact(String(req.params.id));
      res.status(200).json({
        success: true,
        message: 'Message Deleted',
      });
    } catch (error) {
      next(error);
    }
  };
}
