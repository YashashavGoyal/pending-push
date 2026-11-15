import { AuthPayload } from './index.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: AuthPayload;
      token?: string;
    }
  }
}
