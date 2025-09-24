import 'express-session';
import type { User } from '@shared/schema';

// Session should only store minimal identity data
type SessionUser = {
  id: string;
};

// Extend express-session to include user property
declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User;  // Always full database user after authentication
    }
  }
}