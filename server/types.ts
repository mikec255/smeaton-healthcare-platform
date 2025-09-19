import 'express-session';

// Extend express-session to include user property
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      username: string;
      role: string;
      isActive: boolean | null;
      createdAt: Date | null;
    };
  }
}

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: string;
        isActive: boolean | null;
        createdAt: Date | null;
      };
    }
  }
}