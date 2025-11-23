import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { storage } from "./storage";
import { insertJobSchema, insertApplicationSchema, insertContactSubmissionSchema, insertFeedbackSchema, insertNewsletterSchema, insertNewsletterBlockSchema, insertTemplateSchema, insertBlogCategorySchema, insertBlogPostSchema, insertUserSchema, loginUserSchema, updateUserSchema, insertCqcAuditSchema, insertCqcAuditCategorySchema, insertCqcQualityStatementSchema, insertCqcEvidenceCategorySchema, insertCqcAuditEvidenceSchema, insertCqcQualityAssessmentSchema, insertCqcComplianceRecordSchema, insertCqcChecklistItemSchema, insertCqcAuditResponseSchema, insertKnowledgeQuestionnaireSchema, insertKnowledgeQuestionSchema, insertKnowledgeSessionSchema, insertKnowledgeResponseSchema, insertKnowledgeActionSchema, insertRecruitmentApplicationSchema, insertProfessionalReferenceSchema, insertClientSchema, insertVisitSchema, insertRunSchema, insertRunStopSchema, insertGeocodeSchema } from "@shared/schema";
import { GoogleMapsService } from "./google-maps-service";
import { ObjectStorageService } from "./objectStorage";
import { brevoService } from "./brevo-service";
import { AuditLogger } from "./audit";
import { z } from "zod";
import "./types"; // Import type declarations

// Unified authentication for development and production
async function requireAdmin(req: any, res: any, next: any) {
  // Development debug logging
  if (process.env.NODE_ENV !== 'production') {
    console.log("RequireAdmin debug - NODE_ENV:", process.env.NODE_ENV);
    console.log("RequireAdmin debug - Session exists:", !!req.session);
    console.log("RequireAdmin debug - Session.user exists:", !!req.session?.user);
    console.log("RequireAdmin debug - Session ID:", req.session?.id);
  }

  let user = null;
  
  // Try Bearer token first (works in both dev and prod)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
        return res.status(401).json({ message: "Token expired" });
      }
      
      const dbUser = await storage.getUserById(decoded.userId);
      if (dbUser && dbUser.isActive) {
        user = dbUser;
      }
    } catch (error) {
      console.error("Token verification error:", error);
    }
  }
  
  // Fallback to session if no valid token
  if (!user && req.session?.user) {
    const dbUser = await storage.getUserById(req.session.user.id);
    if (dbUser && dbUser.isActive) {
      user = dbUser;
    }
  }
  
  // Populate session from token for consistency
  if (user && !req.session?.user) {
    req.session.user = { id: user.id };
    if (process.env.NODE_ENV !== 'production') {
      console.log("FIXED: Populated session with user ID from token:", user.username);
    }
  }
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }
  
  if (!["admin", "superadmin"].includes(user.role)) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  req.user = user;
  next();
}

// Unified superadmin authentication for development and production
async function requireSuperAdmin(req: any, res: any, next: any) {
  let user = null;
  
  // Try Bearer token first (works in both dev and prod)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
        return res.status(401).json({ message: "Token expired" });
      }
      
      const dbUser = await storage.getUserById(decoded.userId);
      if (dbUser && dbUser.isActive) {
        user = dbUser;
      }
    } catch (error) {
      console.error("Token verification error:", error);
    }
  }
  
  // Fallback to session if no valid token
  if (!user && req.session?.user) {
    const dbUser = await storage.getUserById(req.session.user.id);
    if (dbUser && dbUser.isActive) {
      user = dbUser;
    }
  }
  
  // Populate session from token for consistency
  if (user && !req.session?.user) {
    req.session.user = { id: user.id };
    if (process.env.NODE_ENV !== 'production') {
      console.log("FIXED: Populated session with user ID from token:", user.username);
    }
  }

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }
  
  if (!user.isActive) {
    return res.status(401).json({ message: "Unauthorized: Account is inactive" });
  }
  
  if (user.role !== "superadmin") {
    return res.status(403).json({ message: "Forbidden: Super admin access required" });
  }
  
  req.user = user;
  next();
}

// Unified optional admin authentication for development and production
async function optionalAdmin(req: any, res: any, next: any) {
  let user = null;
  
  // Try Bearer token first (works in both dev and prod)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (Date.now() - decoded.timestamp <= 24 * 60 * 60 * 1000) {
        const dbUser = await storage.getUserById(decoded.userId);
        if (dbUser && dbUser.isActive) {
          user = dbUser;
        }
      }
    } catch (error) {
      // Invalid token format, continue without user
    }
  }
  
  // Fallback to session if no valid token
  if (!user && req.session?.user) {
    const dbUser = await storage.getUserById(req.session.user.id);
    if (dbUser && dbUser.isActive) {
      user = dbUser;
    }
  }
  
  req.user = user;
  // Always derive admin status from fresh database role, never from tokens/sessions
  req.isAdmin = user && ["admin", "superadmin"].includes(user.role);
  next();
}

// Permission-based middleware functions for granular access control
function requirePermission(permission: keyof {
  overview: boolean;
  recruitment: boolean;
  customerRelations: boolean;
  feedback: boolean;
  tools: boolean;
  resources: boolean;
  system: boolean;
}) {
  return async (req: any, res: any, next: any) => {
    // First check if user is authenticated
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ message: "Unauthorized: Account is inactive" });
    }
    
    // Superadmin always has access to everything
    if (user.role === "superadmin") {
      req.user = user;
      return next();
    }
    
    // Check if user has required permission
    const permissions = user.permissions;
    if (!permissions || !permissions[permission]) {
      return res.status(403).json({ 
        message: `Forbidden: ${permission} access required` 
      });
    }
    
    req.user = user;
    next();
  };
}

// Helper function to get authenticated user (reused logic from requireAdmin)
async function getAuthenticatedUser(req: any) {
  let user = null;
  
  // Production: Only use secure session-based auth
  if (process.env.NODE_ENV === 'production') {
    if (!req.session?.user) {
      return null;
    }
    
    // Always verify user still exists and is active from database
    const dbUser = await storage.getUserById(req.session.user.id);
    if (!dbUser || !dbUser.isActive) {
      return null;
    }
    
    return dbUser;
  }
  
  // Development: Support both session and token auth
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
        return null;
      }
      
      const dbUser = await storage.getUserById(decoded.userId);
      if (!dbUser || !dbUser.isActive) {
        return null;
      }
      
      return dbUser;
    } catch (error) {
      // Fall through to session check
    }
  }
  
  // Fallback to session
  if (req.session?.user) {
    const dbUser = await storage.getUserById(req.session.user.id);
    if (dbUser && dbUser.isActive) {
      return dbUser;
    }
  }
  
  return null;
}

// Convenience middleware for specific permissions
const requireOverview = requirePermission('overview');
const requireRecruitment = requirePermission('recruitment');
const requireCustomerRelations = requirePermission('customerRelations');
const requireFeedback = requirePermission('feedback');
const requireTools = requirePermission('tools');
const requireResources = requirePermission('resources');
const requireSystem = requirePermission('system');

export async function registerRoutes(app: Express): Promise<Server> {
  // Trust proxy for Azure deployment
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    
    // Require strong session secret in production
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'your-secret-key-here-replace-in-production') {
      console.error('CRITICAL: Strong SESSION_SECRET required in production!');
      console.error('Please set SESSION_SECRET environment variable to a strong, random value (minimum 32 characters)');
      process.exit(1);
    }
  }
  // CORS middleware for Replit and Azure environment
  app.use((req, res, next) => {
    // Strict allowlist of origins for production security
    const allowedOrigins = [
      process.env.AZURE_FRONTEND_URL,
      process.env.FRONTEND_URL,
      'https://smeatonwebsite-aqhgfwdhcef2f7fq.uksouth-01.azurewebsites.net',
      'https://your-app.azurestaticapps.net'
    ].filter(Boolean);
    
    const origin = req.headers.origin;
    
    if (process.env.NODE_ENV === 'development') {
      // Allow any origin in development
      res.header('Access-Control-Allow-Origin', origin || '*');
    } else if (origin && allowedOrigins.includes(origin)) {
      // Only allow explicitly configured origins in production
      res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Health check endpoint for Azure monitoring
  app.get('/health', (_req, res) => {
    res.status(200).json({ 
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'Smeaton Healthcare Platform',
      version: '1.0.0'
    });
  });

  // Alternative health check for Azure App Service
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  });

  // Azure-style ping endpoint
  app.get('/ping', (_req, res) => {
    res.status(200).send('pong');
  });

  // Session middleware setup with secure production settings
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here-replace-in-production',
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiry on each request
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // Prevent XSS access to cookies
      sameSite: 'lax', // More permissive for better compatibility
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginUserSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }
      
      // Check if user has set a password yet
      if (!user.password) {
        return res.status(401).json({ message: "Please use the password creation link sent to your email to set up your account" });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Create a simple token for Replit compatibility (base64 encoded user info)
      // Store minimal user info in session (ID only) for security
      req.session.user = { id: user.id };
      
      // Production: Only log successful login, never session details
      if (process.env.NODE_ENV === 'production') {
        console.log(`Login successful for user: ${user.username}`);
      } else {
        // Development only: Log session details for debugging
        console.log("Login successful - storing user in session:", {
          userId: user.id,
          username: user.username,
          role: user.role
        });
      }
      
      // Create insecure token only for development/testing
      let token = null;
      if (process.env.NODE_ENV !== 'production') {
        token = Buffer.from(JSON.stringify({
          userId: user.id,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          timestamp: Date.now()
        })).toString('base64');
      }
      
      // Force save session
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        
        // Development: Detailed session debugging
        if (process.env.NODE_ENV !== 'production') {
          console.log("Session saved successfully");
          console.log("Session ID after save:", req.session.id);
          console.log("Session contents after save:", req.session);
          console.log("Session.user after save:", req.session.user);
        }
        
        const response: any = { 
          success: true, 
          user: req.session.user
        };
        
        // Only include insecure token in development
        if (process.env.NODE_ENV !== 'production' && token) {
          response.token = token;
        }
        
        res.json(response);
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    // Production: Only use secure session-based auth
    if (process.env.NODE_ENV === 'production') {
      if (req.session?.user) {
        // Always verify user from database in production
        const dbUser = await storage.getUserById(req.session.user.id);
        if (!dbUser || !dbUser.isActive) {
          req.session.destroy((err: any) => {
            if (err) console.error('Session destroy error:', err);
          });
          return res.status(401).json({ message: "User not found or inactive" });
        }
        return res.json({ user: dbUser });
      }
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Development: Check session first
    if (req.session?.user) {
      return res.json({ user: req.session.user });
    }
    
    // Development only: Fallback to insecure token for testing
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        
        // Verify token is not too old (24 hours)
        if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
          return res.status(401).json({ message: "Token expired" });
        }
        
        // Always verify from database, never trust token data
        const dbUser = await storage.getUserById(decoded.userId);
        if (!dbUser || !dbUser.isActive) {
          return res.status(401).json({ message: "User not found or inactive" });
        }
        
        return res.json({ user: dbUser }); // Use DB user, not decoded token
      } catch (error) {
        // Invalid token format
      }
    }
    
    return res.status(401).json({ message: "Not authenticated" });
  });

  // Create initial superadmin (only if no users exist)
  app.post("/api/auth/setup-superadmin", async (req, res) => {
    try {
      // Check if any users already exist
      const existingUsers = await storage.getAllUsers();
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: "System already has users configured" });
      }
      
      const userData = insertUserSchema.parse(req.body);
      
      const user = await storage.createUser({
        ...userData,
        role: "superadmin",
        isActive: true,
      });
      
      res.status(201).json({ 
        success: true, 
        message: "Superadmin created successfully",
        userId: user.id 
      });
    } catch (error) {
      console.error("Error creating superadmin:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create superadmin" });
    }
  });

  // User management routes (superadmin only - critical security requirement)
  app.get("/api/users", requireSuperAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireSuperAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Generate secure token for password creation
      const passwordToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24); // 24 hours from now
      
      // Create user without password but with secure token
      const userToCreate = {
        ...userData,
        password: null, // No password yet
        passwordToken,
        tokenExpiresAt
      };
      
      const user = await storage.createUser(userToCreate);
      // Remove sensitive fields from response
      const { password, passwordToken: token, ...safeUser } = user;
      
      // Send welcome email with password creation link
      try {
        await brevoService.sendPasswordCreationEmail(
          user.username, 
          user.username, 
          passwordToken,
          user.role
        );
        console.log(`Password creation email sent to ${user.username}`);
      } catch (emailError) {
        console.error(`Failed to send password creation email to ${user.username}:`, emailError);
        // Don't fail user creation if email fails - just log the error
      }
      
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes('unique') && error.message.includes('username')) {
        return res.status(409).json({ message: "A user with this email already exists" });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", requireSuperAdmin, async (req, res) => {
    try {
      const userData = updateUserSchema.parse(req.body);
      
      const user = await storage.updateUser(req.params.id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireSuperAdmin, async (req, res) => {
    try {
      // Prevent superadmin from deleting themselves
      if (req.params.id === req.user?.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Password creation endpoint (public - uses secure token)
  const createPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

  app.post("/api/auth/create-password", async (req, res) => {
    try {
      const { token, password } = createPasswordSchema.parse(req.body);
      
      // Find user by password token
      const user = await storage.getUserByPasswordToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired password creation link" });
      }
      
      // Check if token has expired
      if (!user.tokenExpiresAt || new Date() > user.tokenExpiresAt) {
        return res.status(400).json({ message: "Password creation link has expired. Please contact your administrator." });
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Update user with new password and clear the token
      await storage.setUserPassword(user.id, hashedPassword);
      
      res.json({ message: "Password created successfully. You can now log in with your credentials." });
    } catch (error) {
      console.error("Error creating password:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid password creation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create password" });
    }
  });

  // Get user info for password creation page (public - uses secure token)
  app.get("/api/auth/password-creation-info/:token", async (req, res) => {
    try {
      const token = req.params.token;
      
      // Find user by password token
      const user = await storage.getUserByPasswordToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired password creation link" });
      }
      
      // Check if token has expired
      if (!user.tokenExpiresAt || new Date() > user.tokenExpiresAt) {
        return res.status(400).json({ message: "Password creation link has expired. Please contact your administrator." });
      }
      
      // Return safe user info for the password creation page
      res.json({
        username: user.username,
        role: user.role,
        isValid: true
      });
    } catch (error) {
      console.error("Error validating password creation token:", error);
      res.status(500).json({ message: "Failed to validate password creation link" });
    }
  });

  // Email configuration API (Superadmin only)
  app.get("/api/admin/email-config/status", requireSuperAdmin, async (req, res) => {
    try {
      const configured = brevoService.isEmailConfigured();
      res.json({ configured });
    } catch (error) {
      console.error("Error checking email configuration status:", error);
      res.status(500).json({ message: "Failed to check email configuration" });
    }
  });

  // SECURITY: API key configuration via UI removed - must be set via environment variables only

  // Jobs API
  app.get("/api/jobs", async (req, res) => {
    try {
      const { location, type, salaryRange } = req.query;
      const jobs = await storage.getAllJobs({
        location: location as string,
        type: type as string,
        salaryRange: salaryRange as string,
      });
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Admin endpoint that returns ALL jobs (both active and inactive) - requires recruitment permission
  app.get("/api/admin/jobs", requireRecruitment, async (req, res) => {
    try {
      const { location, type, salaryRange, status } = req.query;
      const jobs = await storage.getAllJobsForAdmin({
        location: location as string,
        type: type as string,
        salaryRange: salaryRange as string,
        status: status as string,
      });
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching admin jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.put("/api/jobs/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertJobSchema.partial().parse(req.body);
      const job = await storage.updateJob(req.params.id, validatedData);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error updating job:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", requireAdmin, async (req, res) => {
    try {
      // Check if job exists first
      const existingJob = await storage.getJob(req.params.id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Unpublish the job before deleting (only if it exists)
      await storage.updateJob(req.params.id, { isActive: false });
      
      const success = await storage.deleteJob(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Applications API
  app.get("/api/applications", requireAdmin, async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      
      // Log GDPR-relevant action: admin viewing personal data
      if (req.user) {
        await AuditLogger.logView(req, req.user, "application", "bulk", {
          action: "view_all_applications",
          recordCount: applications.length
        });
      }
      
      res.json(applications);
    } catch (error) {
      console.error("Error fetching all applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get("/api/jobs/:jobId/applications", async (req, res) => {
    try {
      const applications = await storage.getApplicationsByJobId(req.params.jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedData);
      
      // Get job details for email notification
      try {
        const job = await storage.getJob(validatedData.jobId);
        if (job) {
          // Send email notification to recruitment team
          await brevoService.sendPreScreenApplicationEmail({
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            email: validatedData.email,
            phone: validatedData.phone,
            location: validatedData.location,
            jobTitle: job.title,
            branch: job.branch || "Plymouth",
            experience: validatedData.experience || undefined,
            currentlyWorking: validatedData.currentlyWorking || undefined,
            currentEmployer: validatedData.currentEmployer || undefined,
            referralSource: validatedData.referralSource || undefined,
            shiftPreferences: Array.isArray(validatedData.shiftPreferences) ? validatedData.shiftPreferences as string[] : undefined,
            hasDBS: validatedData.hasDBS || undefined,
            hasMHCertificate: validatedData.hasMHCertificate || undefined,
            additionalInfo: validatedData.additionalInfo || undefined,
          });
        }
      } catch (emailError) {
        console.error("Error sending application notification email:", emailError);
        // Don't fail the application creation if email fails
      }
      
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.put("/api/applications/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const application = await storage.updateApplicationStatus(req.params.id, status);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Log GDPR-relevant action: admin modifying personal data
      if (req.user) {
        await AuditLogger.logUpdate(req, req.user, "application", req.params.id, {
          action: "update_application_status",
          newStatus: status,
          applicantEmail: application.email
        });
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  app.put("/api/applications/:id/notes", requireAdmin, async (req, res) => {
    try {
      // Validate request body
      const notesSchema = z.object({
        notes: z.string().max(5000, "Notes must be less than 5000 characters").optional()
      });
      
      const validatedData = notesSchema.parse(req.body);
      const application = await storage.updateApplicationNotes(req.params.id, validatedData.notes || "");
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Log GDPR-relevant action: admin adding/modifying notes about personal data
      if (req.user) {
        await AuditLogger.logUpdate(req, req.user, "application", req.params.id, {
          action: "update_application_notes",
          notesLength: validatedData.notes?.length || 0,
          applicantEmail: application.email
        });
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error updating application notes:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notes data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update application notes" });
    }
  });

  // Recruitment Applications API (Full Applications - separate from job pre-screening)
  app.get("/api/admin/recruitment-applications", requireAdmin, async (req, res) => {
    try {
      const applications = await storage.getAllRecruitmentApplications();
      
      // Log GDPR-relevant action: admin viewing personal data
      if (req.user) {
        await AuditLogger.logView(req, req.user, "recruitment_application", "bulk", {
          action: "view_all_recruitment_applications",
          recordCount: applications.length
        });
      }
      
      res.json(applications);
    } catch (error) {
      console.error("Error fetching recruitment applications:", error);
      res.status(500).json({ message: "Failed to fetch recruitment applications" });
    }
  });

  app.post("/api/recruitment-applications", async (req, res) => {
    try {
      const validatedData = insertRecruitmentApplicationSchema.parse(req.body);
      const application = await storage.createRecruitmentApplication(validatedData);
      
      // Send confirmation email to applicant
      if (brevoService) {
        try {
          await brevoService.sendRecruitmentApplicationConfirmation({
            to: application.email,
            applicantName: `${application.firstName} ${application.lastName}`,
            applicationId: application.id
          });
        } catch (emailError) {
          console.error("Failed to send recruitment application confirmation email:", emailError);
          // Don't fail the application submission if email fails
        }
      }

      res.json(application);
    } catch (error) {
      console.error("Error creating recruitment application:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit recruitment application" });
    }
  });

  app.put("/api/admin/recruitment-applications/:id/status", requireAdmin, async (req, res) => {
    try {
      // Validate status input with allowed enum values
      const statusUpdateSchema = z.object({
        status: z.enum(["pending", "under_review", "interview_scheduled", "hired", "rejected", "withdrawn"])
      });

      const validatedData = statusUpdateSchema.parse(req.body);
      const application = await storage.updateRecruitmentApplicationStatus(req.params.id, validatedData.status, req.user?.id);
      if (!application) {
        return res.status(404).json({ message: "Recruitment application not found" });
      }
      
      // Log GDPR-relevant action: admin updating application status
      if (req.user) {
        await AuditLogger.logUpdate(req, req.user, "recruitment_application", req.params.id, {
          action: "update_application_status",
          newStatus: validatedData.status,
          applicantEmail: application.email,
          reviewedBy: req.user.id
        });
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error updating recruitment application status:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recruitment application status" });
    }
  });

  app.put("/api/admin/recruitment-applications/:id/notes", requireAdmin, async (req, res) => {
    try {
      const notesSchema = z.object({
        adminNotes: z.string().max(5000, "Notes must be less than 5000 characters").optional()
      });
      
      const validatedData = notesSchema.parse(req.body);
      const application = await storage.updateRecruitmentApplicationNotes(req.params.id, validatedData.adminNotes || "");
      if (!application) {
        return res.status(404).json({ message: "Recruitment application not found" });
      }
      
      // Log GDPR-relevant action: admin adding/modifying notes about personal data
      if (req.user) {
        await AuditLogger.logUpdate(req, req.user, "recruitment_application", req.params.id, {
          action: "update_recruitment_application_notes",
          notesLength: validatedData.adminNotes?.length || 0,
          applicantEmail: application.email
        });
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error updating recruitment application notes:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notes data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recruitment application notes" });
    }
  });

  // Professional References API
  app.get("/api/admin/professional-references", requireAdmin, async (req, res) => {
    try {
      const references = await storage.getAllProfessionalReferences();
      
      // Log GDPR-relevant action: admin viewing personal data
      if (req.user) {
        await AuditLogger.logView(req, req.user, "professional_reference", "bulk", {
          action: "view_all_professional_references",
          recordCount: references.length
        });
      }
      
      res.json(references);
    } catch (error) {
      console.error("Error fetching professional references:", error);
      res.status(500).json({ message: "Failed to fetch professional references" });
    }
  });

  app.post("/api/professional-references", async (req, res) => {
    try {
      const validatedData = insertProfessionalReferenceSchema.parse(req.body);
      const reference = await storage.createProfessionalReference(validatedData);
      
      // Send confirmation email to reference provider
      if (brevoService) {
        try {
          await brevoService.sendProfessionalReferenceConfirmation({
            to: reference.referenceProviderEmail,
            referenceProviderName: reference.referenceProviderName,
            candidateName: reference.candidateName,
            referenceId: reference.id
          });
        } catch (emailError) {
          console.error("Failed to send professional reference confirmation email:", emailError);
          // Don't fail the reference submission if email fails
        }
      }

      res.json(reference);
    } catch (error) {
      console.error("Error creating professional reference:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reference data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit professional reference" });
    }
  });

  app.put("/api/admin/professional-references/:id/status", requireAdmin, async (req, res) => {
    try {
      // Validate status input with allowed enum values
      const statusUpdateSchema = z.object({
        status: z.enum(["pending", "reviewed", "verified", "flagged"])
      });

      const validatedData = statusUpdateSchema.parse(req.body);
      const reference = await storage.updateProfessionalReferenceStatus(req.params.id, validatedData.status, req.user?.id);
      if (!reference) {
        return res.status(404).json({ message: "Professional reference not found" });
      }
      
      // Log GDPR-relevant action: admin updating reference status
      if (req.user) {
        await AuditLogger.logUpdate(req, req.user, "professional_reference", req.params.id, {
          action: "update_reference_status",
          newStatus: validatedData.status,
          candidateEmail: reference.candidateEmail,
          referenceProviderEmail: reference.referenceProviderEmail,
          reviewedBy: req.user.id
        });
      }
      
      res.json(reference);
    } catch (error) {
      console.error("Error updating professional reference status:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update professional reference status" });
    }
  });

  app.put("/api/admin/professional-references/:id/notes", requireAdmin, async (req, res) => {
    try {
      const notesSchema = z.object({
        adminNotes: z.string().max(5000, "Notes must be less than 5000 characters").optional()
      });
      
      const validatedData = notesSchema.parse(req.body);
      const reference = await storage.updateProfessionalReferenceNotes(req.params.id, validatedData.adminNotes || "");
      if (!reference) {
        return res.status(404).json({ message: "Professional reference not found" });
      }
      
      // Log GDPR-relevant action: admin adding/modifying notes about personal data
      if (req.user) {
        await AuditLogger.logUpdate(req, req.user, "professional_reference", req.params.id, {
          action: "update_professional_reference_notes",
          notesLength: validatedData.adminNotes?.length || 0,
          candidateEmail: reference.candidateEmail,
          referenceProviderEmail: reference.referenceProviderEmail
        });
      }
      
      res.json(reference);
    } catch (error) {
      console.error("Error updating professional reference notes:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notes data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update professional reference notes" });
    }
  });

  // Contact submissions API
  app.get("/api/contact-submissions", requireAdmin, async (req, res) => {
    try {
      const submissions = await storage.getAllContactSubmissions();
      
      // Filter by type if specified
      let responseSubmissions = submissions;
      if (req.query.type) {
        responseSubmissions = submissions.filter(submission => submission.type === req.query.type);
      }
      
      // Log GDPR-relevant action: admin viewing personal data
      if (req.user) {
        await AuditLogger.logView(req, req.user, "contact_submission", "bulk", {
          action: "view_all_contact_submissions",
          recordCount: responseSubmissions.length,
          filterType: req.query.type || "all"
        });
      }
      
      res.json(responseSubmissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  app.put("/api/contact-submissions/:id", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      
      // Validate status is one of the allowed values
      const allowedStatuses = ["new", "contacted", "assessed", "closed"];
      if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ 
          message: "Status is required and must be one of: " + allowedStatuses.join(", ") 
        });
      }

      const submission = await storage.updateContactSubmissionStatus(req.params.id, status);
      if (!submission) {
        return res.status(404).json({ message: "Contact submission not found" });
      }
      
      // Log GDPR-relevant action: admin modifying personal data
      if (req.user) {
        await AuditLogger.logUpdate(req, req.user, "contact_submission", req.params.id, {
          action: "update_contact_submission_status",
          newStatus: status,
          submissionType: submission.type,
          submitterEmail: submission.email
        });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error updating contact submission:", error);
      res.status(500).json({ message: "Failed to update contact submission" });
    }
  });

  app.post("/api/contact-submissions", async (req, res) => {
    try {
      console.log('Contact submission received (type:', req.body.type + ')');
      
      // Handle general contact form (from contact page)
      if (req.body.type === "general-contact") {
        const { name, email, phone, reason, message } = req.body;
        
        // Validate simple contact form data
        if (!name || !email || !phone || !reason || !message) {
          return res.status(400).json({ message: "All fields are required" });
        }

        // Send email notification to hello@smeatonhealthcare.co.uk
        try {
          await brevoService.sendContactFormEmail({
            name,
            email, 
            phone,
            reason,
            message
          });
          console.log(`Contact form email sent for submission from ${email}`);
        } catch (emailError) {
          console.error('Failed to send contact form email:', emailError);
          // Continue with saving to database even if email fails
        }

        // Adapt data structure for database storage
        const submissionData = {
          type: "general-contact",
          firstName: name.split(' ')[0] || name,
          lastName: name.split(' ').slice(1).join(' ') || '',
          email,
          phone,
          location: '', // Not provided in general contact form
          serviceRequired: reason,
          additionalRequirements: message,
          status: "new"
        };

        const submission = await storage.createContactSubmission(submissionData);
        res.status(201).json(submission);
      } else if (req.body.type === "referral") {
        // Handle referral form submissions
        const {
          referrerName, referrerEmail, referrerPhone, relationship,
          clientName, clientAge, clientAddress, clientPhone,
          serviceType, urgency, startDate, currentSupport,
          medicalConditions, mobilityRequirements, communicationNeeds,
          behavioralSupport, additionalInfo
        } = req.body;

        // Validate required referral fields (referrer fields are optional for self-referrals)
        if (!clientName || !clientAge || !clientAddress || !serviceType || !urgency) {
          return res.status(400).json({ message: "Client name, age, address, service type, and urgency are required" });
        }

        // Send referral email notification to hello@smeatonhealthcare.co.uk
        try {
          await brevoService.sendReferralEmail(req.body);
          console.log(`Referral email sent for ${clientName} from ${referrerEmail}`);
        } catch (emailError) {
          console.error('Failed to send referral email:', emailError);
          // Continue with saving to database even if email fails
        }

        // Adapt referral data for database storage
        const submissionData = {
          type: "referral",
          firstName: referrerName ? (referrerName.split(' ')[0] || referrerName) : clientName.split(' ')[0] || clientName,
          lastName: referrerName ? (referrerName.split(' ').slice(1).join(' ') || '') : (clientName.split(' ').slice(1).join(' ') || ''),
          email: referrerEmail || 'no-email@provided.com',
          phone: referrerPhone || 'No phone provided',
          location: clientAddress,
          serviceRequired: serviceType,
          additionalRequirements: [
            `Client: ${clientName} (Age: ${clientAge})`,
            referrerName ? `Referrer: ${referrerName}` : 'Self-referral',
            relationship ? `Relationship: ${relationship}` : '',
            referrerEmail ? `Referrer Email: ${referrerEmail}` : '',
            referrerPhone ? `Referrer Phone: ${referrerPhone}` : '',
            clientPhone ? `Client Phone: ${clientPhone}` : '',
            `Urgency: ${urgency}`,
            startDate ? `Preferred Start: ${startDate}` : '',
            currentSupport ? `Current Support: ${currentSupport}` : '',
            medicalConditions ? `Medical Conditions: ${medicalConditions}` : '',
            mobilityRequirements ? `Mobility: ${mobilityRequirements}` : '',
            communicationNeeds ? `Communication: ${communicationNeeds}` : '',
            behavioralSupport ? `Behavioral Support: ${behavioralSupport}` : '',
            additionalInfo ? `Additional Info: ${additionalInfo}` : ''
          ].filter(Boolean).join('\n'),
          status: "new"
        };

        const submission = await storage.createContactSubmission(submissionData);
        res.status(201).json(submission);
      } else {
        // Handle other types of contact submissions (care requests, staff bookings, etc.)
        const validatedData = insertContactSubmissionSchema.parse(req.body);
        const submission = await storage.createContactSubmission(validatedData);
        res.status(201).json(submission);
      }
    } catch (error) {
      console.error("Error creating contact submission:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contact submission" });
    }
  });

  // Feedback API
  app.get("/api/feedback", async (req, res) => {
    try {
      const feedback = await storage.getAllFeedback();
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.get("/api/feedback/:id", async (req, res) => {
    try {
      const feedback = await storage.getFeedback(req.params.id);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const validatedData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(validatedData);
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  app.put("/api/feedback/:id", requireFeedback, async (req, res) => {
    try {
      const validatedData = insertFeedbackSchema.partial().parse(req.body);
      const feedback = await storage.updateFeedback(req.params.id, validatedData);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      res.json(feedback);
    } catch (error) {
      console.error("Error updating feedback:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update feedback" });
    }
  });

  app.delete("/api/feedback/:id", requireFeedback, async (req, res) => {
    try {
      const success = await storage.deleteFeedback(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      res.status(500).json({ message: "Failed to delete feedback" });
    }
  });

  // CV/File upload endpoints (admin only for security)
  app.post("/api/objects/upload", requireAdmin, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Admin-only blog image upload endpoint - SIMPLIFIED BASE64 STORAGE
  app.post("/api/blog-images/upload", requireAdmin, async (req, res) => {
    try {
      // Just return success - client will handle base64 directly
      res.json({ uploadURL: "base64", useBase64: true });
    } catch (error) {
      console.error("Error getting blog image upload URL:", error);
      res.status(500).json({ 
        message: "Failed to get upload URL",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Make blog image public (callable after upload) - NO-OP FOR BASE64
  app.post("/api/blog-images/make-public", requireAdmin, async (req, res) => {
    try {
      const { fileUrl } = req.body;
      res.json({ success: true, url: fileUrl });
    } catch (error) {
      console.error("Error making blog image public:", error);
      res.status(500).json({ error: "Failed to make image public" });
    }
  });

  app.put("/api/cv-uploads", async (req, res) => {
    try {
      if (!req.body.cvURL) {
        return res.status(400).json({ error: "cvURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(req.body.cvURL);

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error processing CV upload:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve uploaded files
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(404).json({ error: "File not found" });
    }
  });

  // Newsletter API
  app.get("/api/newsletters", async (req, res) => {
    try {
      const newsletters = await storage.getAllNewsletters();
      res.json(newsletters);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });

  app.get("/api/newsletters/:id", async (req, res) => {
    try {
      const newsletter = await storage.getNewsletter(req.params.id);
      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
      res.json(newsletter);
    } catch (error) {
      console.error("Error fetching newsletter:", error);
      res.status(500).json({ message: "Failed to fetch newsletter" });
    }
  });

  app.post("/api/newsletters", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertNewsletterSchema.parse(req.body);
      const newsletter = await storage.createNewsletter(validatedData);
      res.status(201).json(newsletter);
    } catch (error) {
      console.error("Error creating newsletter:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid newsletter data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create newsletter" });
    }
  });

  app.put("/api/newsletters/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertNewsletterSchema.partial().parse(req.body);
      const newsletter = await storage.updateNewsletter(req.params.id, validatedData);
      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
      res.json(newsletter);
    } catch (error) {
      console.error("Error updating newsletter:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid newsletter data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update newsletter" });
    }
  });

  app.delete("/api/newsletters/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteNewsletter(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting newsletter:", error);
      res.status(500).json({ message: "Failed to delete newsletter" });
    }
  });

  // Newsletter blocks API
  app.get("/api/newsletters/:id/blocks", async (req, res) => {
    try {
      const blocks = await storage.getNewsletterBlocks(req.params.id);
      res.json(blocks);
    } catch (error) {
      console.error("Error fetching newsletter blocks:", error);
      res.status(500).json({ message: "Failed to fetch newsletter blocks" });
    }
  });

  app.post("/api/newsletters/:id/blocks", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertNewsletterBlockSchema.parse({
        ...req.body,
        newsletterId: req.params.id
      });
      const block = await storage.createNewsletterBlock(validatedData);
      res.status(201).json(block);
    } catch (error) {
      console.error("Error creating newsletter block:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid block data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create newsletter block" });
    }
  });

  app.put("/api/newsletters/:id/blocks/:blockId", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertNewsletterBlockSchema.partial().parse(req.body);
      const block = await storage.updateNewsletterBlock(req.params.blockId, validatedData);
      if (!block) {
        return res.status(404).json({ message: "Newsletter block not found" });
      }
      res.json(block);
    } catch (error) {
      console.error("Error updating newsletter block:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid block data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update newsletter block" });
    }
  });

  app.delete("/api/newsletters/:id/blocks/:blockId", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteNewsletterBlock(req.params.blockId);
      if (!success) {
        return res.status(404).json({ message: "Newsletter block not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting newsletter block:", error);
      res.status(500).json({ message: "Failed to delete newsletter block" });
    }
  });

  app.patch("/api/newsletters/:id/blocks/reorder", requireAdmin, async (req, res) => {
    try {
      const { blocks } = req.body;
      if (!Array.isArray(blocks)) {
        return res.status(400).json({ message: "Blocks array is required" });
      }
      
      // Update positions for all blocks
      const updatedBlocks = [];
      for (const blockUpdate of blocks) {
        const block = await storage.updateNewsletterBlock(blockUpdate.id, { position: blockUpdate.position });
        if (block) {
          updatedBlocks.push(block);
        }
      }
      
      res.json(updatedBlocks);
    } catch (error) {
      console.error("Error reordering newsletter blocks:", error);
      res.status(500).json({ message: "Failed to reorder newsletter blocks" });
    }
  });

  // Templates API
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post("/api/templates", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.put("/api/templates/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.partial().parse(req.body);
      const template = await storage.updateTemplate(req.params.id, validatedData);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteTemplate(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // GDPR Audit Logs API
  app.get("/api/audit-logs", requireAdmin, async (req, res) => {
    try {
      const { userId, resourceType, action, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (userId) filters.userId = userId as string;
      if (resourceType) filters.resourceType = resourceType as string; 
      if (action) filters.action = action as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const logs = await storage.getAuditLogs(filters);
      
      // Log that admin is viewing audit logs (meta-logging)
      await AuditLogger.logView(req, req.user!, "audit_log", "bulk", {
        action: "view_audit_logs",
        recordCount: logs.length,
        filters
      });
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.get("/api/audit-logs/resource/:resourceId", requireAdmin, async (req, res) => {
    try {
      const logs = await storage.getAuditLogsByResourceId(req.params.resourceId);
      
      // Log that admin is viewing resource-specific audit logs
      await AuditLogger.logView(req, req.user!, "audit_log", "resource_specific", {
        action: "view_resource_audit_logs",
        resourceId: req.params.resourceId,
        recordCount: logs.length
      });
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching resource audit logs:", error);
      res.status(500).json({ message: "Failed to fetch resource audit logs" });
    }
  });

  // Blog Categories API
  app.get("/api/blog-categories", async (req, res) => {
    try {
      const categories = await storage.getAllBlogCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      res.status(500).json({ message: "Failed to fetch blog categories" });
    }
  });

  app.get("/api/blog-categories/:id", async (req, res) => {
    try {
      const category = await storage.getBlogCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Blog category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching blog category:", error);
      res.status(500).json({ message: "Failed to fetch blog category" });
    }
  });

  app.post("/api/blog-categories", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertBlogCategorySchema.parse(req.body);
      const category = await storage.createBlogCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating blog category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      // Handle unique constraint violations (e.g., duplicate category name)
      if (error instanceof Error && error.message.includes('unique') && error.message.includes('name')) {
        return res.status(409).json({ message: "A category with this name already exists" });
      }
      res.status(500).json({ message: "Failed to create blog category" });
    }
  });

  app.put("/api/blog-categories/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertBlogCategorySchema.partial().parse(req.body);
      const category = await storage.updateBlogCategory(req.params.id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "Blog category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating blog category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      // Handle unique constraint violations (e.g., duplicate category name)
      if (error instanceof Error && error.message.includes('unique') && error.message.includes('name')) {
        return res.status(409).json({ message: "A category with this name already exists" });
      }
      res.status(500).json({ message: "Failed to update blog category" });
    }
  });

  app.delete("/api/blog-categories/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteBlogCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Blog category not found or has associated posts" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blog category:", error);
      res.status(500).json({ message: "Failed to delete blog category" });
    }
  });

  // Blog Posts API
  app.get("/api/blog-posts", optionalAdmin, async (req, res) => {
    try {
      const { categoryId, isPublished } = req.query;
      
      // Non-admin users can only see published posts
      let publishedFilter = isPublished === 'true' ? true : isPublished === 'false' ? false : undefined;
      if (!(req as any).isAdmin) {
        publishedFilter = true; // Force published=true for non-admin users
      }
      
      const filters = {
        categoryId: categoryId as string,
        isPublished: publishedFilter,
      };
      const posts = await storage.getAllBlogPosts(filters);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog-posts/:id", optionalAdmin, async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Non-admin users can only see published posts
      if (!(req as any).isAdmin && !post.isPublished) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.get("/api/blog-posts/slug/:slug", optionalAdmin, async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Non-admin users can only see published posts
      if (!(req as any).isAdmin && !post.isPublished) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post by slug:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog-posts", requireAdmin, async (req, res) => {
    try {
      // Convert string boolean to actual boolean if provided
      const postData = {
        ...req.body,
        isPublished: req.body.isPublished === 'true' || req.body.isPublished === true,
      };

      const validatedData = insertBlogPostSchema.parse(postData);
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      // Handle unique constraint violations (e.g., duplicate slug)
      if (error instanceof Error && error.message.includes('unique') && error.message.includes('slug')) {
        return res.status(409).json({ message: "A blog post with this slug already exists" });
      }
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put("/api/blog-posts/:id", requireAdmin, async (req, res) => {
    try {
      let updateData = { ...req.body };

      // Convert string boolean to actual boolean
      if (updateData.isPublished !== undefined) {
        updateData.isPublished = updateData.isPublished === 'true' || updateData.isPublished === true;
      }

      const validatedData = insertBlogPostSchema.partial().parse(updateData);
      const post = await storage.updateBlogPost(req.params.id, validatedData);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      // Handle unique constraint violations (e.g., duplicate slug)
      if (error instanceof Error && error.message.includes('unique') && error.message.includes('slug')) {
        return res.status(409).json({ message: "A blog post with this slug already exists" });
      }
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/blog-posts/:id", requireAdmin, async (req, res) => {
    try {
      // Check if blog post exists first
      const existingPost = await storage.getBlogPost(req.params.id);
      if (!existingPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Unpublish the blog post before deleting (only if it exists)
      await storage.updateBlogPost(req.params.id, { isPublished: false });
      
      const success = await storage.deleteBlogPost(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  app.post("/api/blog-posts/:id/publish", requireAdmin, async (req, res) => {
    try {
      const post = await storage.publishBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error publishing blog post:", error);
      res.status(500).json({ message: "Failed to publish blog post" });
    }
  });

  // ========== CQC AUDIT API ROUTES ==========
  
  // CQC Audits
  app.get("/api/cqc/audits", requireAdmin, async (req, res) => {
    try {
      const { auditType, status, auditorId } = req.query;
      const audits = await storage.getAllCqcAudits({
        auditType: auditType as string,
        status: status as string,
        auditorId: auditorId as string,
      });
      res.json(audits);
    } catch (error) {
      console.error("Error fetching CQC audits:", error);
      res.status(500).json({ message: "Failed to fetch CQC audits" });
    }
  });

  app.get("/api/cqc/audits/:id", requireAdmin, async (req, res) => {
    try {
      const audit = await storage.getCqcAudit(req.params.id);
      if (!audit) {
        return res.status(404).json({ message: "CQC audit not found" });
      }
      res.json(audit);
    } catch (error) {
      console.error("Error fetching CQC audit:", error);
      res.status(500).json({ message: "Failed to fetch CQC audit" });
    }
  });

  app.post("/api/cqc/audits", requireAdmin, async (req, res) => {
    try {
      // Debug what's being sent
      console.log("CREATE AUDIT DEBUG - Original req.body:", JSON.stringify(req.body, null, 2));
      
      // Convert date string to Date object and ensure required fields
      const bodyWithDateFixed = {
        ...req.body,
        auditDate: new Date(req.body.auditDate),
        nextReviewDate: req.body.nextReviewDate ? new Date(req.body.nextReviewDate) : undefined,
        // Fix category mapping for insurance audits
        category: req.body.category || "insurance", // Default to "insurance" if not provided
        auditorName: req.user?.username || "System Admin",
        auditorId: req.user?.id
      };
      
      console.log("CREATE AUDIT DEBUG - Fixed body:", JSON.stringify(bodyWithDateFixed, null, 2));
      
      const validatedData = insertCqcAuditSchema.parse(bodyWithDateFixed);
      
      console.log("CREATE AUDIT DEBUG - Validated data:", JSON.stringify(validatedData, null, 2));
      const audit = await storage.createCqcAudit(validatedData);
      
      // Create audit log for compliance tracking
      await AuditLogger.logCreate(
        req,
        req.user!,
        'cqc_audit',
        audit.id,
        { auditType: audit.auditType, category: audit.category, title: audit.title }
      );
      
      res.status(201).json(audit);
    } catch (error) {
      console.error("Error creating CQC audit:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid audit data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create CQC audit" });
    }
  });

  app.put("/api/cqc/audits/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCqcAuditSchema.partial().parse(req.body);
      const audit = await storage.updateCqcAudit(req.params.id, validatedData);
      if (!audit) {
        return res.status(404).json({ message: "CQC audit not found" });
      }
      
      // Create audit log
      await AuditLogger.logUpdate(
        req,
        req.user!,
        'cqc_audit',
        audit.id,
        { ...validatedData, title: audit.title }
      );
      
      res.json(audit);
    } catch (error) {
      console.error("Error updating CQC audit:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid audit data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update CQC audit" });
    }
  });

  app.delete("/api/cqc/audits/:id", requireAdmin, async (req, res) => {
    try {
      // Get audit details before deletion for logging
      const existingAudit = await storage.getCqcAudit(req.params.id);
      if (!existingAudit) {
        return res.status(404).json({ message: "CQC audit not found" });
      }
      
      const success = await storage.deleteCqcAudit(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "CQC audit not found" });
      }
      
      // Create audit log
      await AuditLogger.logDelete(
        req,
        req.user!,
        'cqc_audit',
        req.params.id,
        { auditType: existingAudit.auditType, title: existingAudit.title }
      );
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting CQC audit:", error);
      res.status(500).json({ message: "Failed to delete CQC audit" });
    }
  });

  // CQC Audit Categories
  app.get("/api/cqc/audit-categories", requireAdmin, async (req, res) => {
    try {
      const { auditType } = req.query;
      const categories = await storage.getAllCqcAuditCategories(auditType as string);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching CQC audit categories:", error);
      res.status(500).json({ message: "Failed to fetch CQC audit categories" });
    }
  });

  app.post("/api/cqc/audit-categories", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCqcAuditCategorySchema.parse(req.body);
      const category = await storage.createCqcAuditCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating CQC audit category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create CQC audit category" });
    }
  });

  app.put("/api/cqc/audit-categories/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCqcAuditCategorySchema.partial().parse(req.body);
      const category = await storage.updateCqcAuditCategory(req.params.id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "CQC audit category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating CQC audit category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update CQC audit category" });
    }
  });

  // CQC Checklist Items
  app.get("/api/cqc/checklist-items", requireAdmin, async (req, res) => {
    try {
      const { categoryId } = req.query;
      const items = await storage.getCqcChecklistItems(categoryId as string);
      res.json(items);
    } catch (error) {
      console.error("Error fetching CQC checklist items:", error);
      res.status(500).json({ message: "Failed to fetch CQC checklist items" });
    }
  });

  app.post("/api/cqc/checklist-items", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCqcChecklistItemSchema.parse(req.body);
      const item = await storage.createCqcChecklistItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating CQC checklist item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid checklist item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create CQC checklist item" });
    }
  });

  app.put("/api/cqc/checklist-items/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCqcChecklistItemSchema.partial().parse(req.body);
      const item = await storage.updateCqcChecklistItem(req.params.id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "CQC checklist item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating CQC checklist item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid checklist item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update CQC checklist item" });
    }
  });

  // CQC Audit Responses
  app.get("/api/cqc/audits/:auditId/responses", requireAdmin, async (req, res) => {
    try {
      const responses = await storage.getCqcAuditResponses(req.params.auditId);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching CQC audit responses:", error);
      res.status(500).json({ message: "Failed to fetch CQC audit responses" });
    }
  });

  app.post("/api/cqc/audit-responses", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCqcAuditResponseSchema.parse(req.body);
      const response = await storage.createCqcAuditResponse(validatedData);
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating CQC audit response:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid audit response data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create CQC audit response" });
    }
  });

  app.put("/api/cqc/audit-responses/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCqcAuditResponseSchema.partial().parse(req.body);
      const response = await storage.updateCqcAuditResponse(req.params.id, validatedData);
      if (!response) {
        return res.status(404).json({ message: "CQC audit response not found" });
      }
      res.json(response);
    } catch (error) {
      console.error("Error updating CQC audit response:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid audit response data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update CQC audit response" });
    }
  });

  // CQC Compliance Records
  app.get("/api/cqc/compliance-records", requireAdmin, async (req, res) => {
    try {
      const { staffId, recordType, status } = req.query;
      const records = await storage.getAllCqcComplianceRecords({
        staffId: staffId as string,
        recordType: recordType as string,
        status: status as string,
      });
      res.json(records);
    } catch (error) {
      console.error("Error fetching CQC compliance records:", error);
      res.status(500).json({ message: "Failed to fetch CQC compliance records" });
    }
  });

  app.get("/api/cqc/compliance-records/:id", requireAdmin, async (req, res) => {
    try {
      const record = await storage.getCqcComplianceRecord(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "CQC compliance record not found" });
      }
      res.json(record);
    } catch (error) {
      console.error("Error fetching CQC compliance record:", error);
      res.status(500).json({ message: "Failed to fetch CQC compliance record" });
    }
  });

  app.post("/api/cqc/compliance-records", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCqcComplianceRecordSchema.parse(req.body);
      const record = await storage.createCqcComplianceRecord(validatedData);
      
      // Create audit log for compliance tracking
      await AuditLogger.logCreate(
        req,
        req.user!,
        'cqc_compliance_record',
        record.id,
        { recordType: record.recordType, staffId: record.staffId, title: record.title }
      );
      
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating CQC compliance record:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid compliance record data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create CQC compliance record" });
    }
  });

  app.put("/api/cqc/compliance-records/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCqcComplianceRecordSchema.partial().parse(req.body);
      const record = await storage.updateCqcComplianceRecord(req.params.id, validatedData);
      if (!record) {
        return res.status(404).json({ message: "CQC compliance record not found" });
      }
      
      // Create audit log
      await AuditLogger.logUpdate(
        req,
        req.user!,
        'cqc_compliance_record',
        record.id,
        { ...validatedData, title: record.title }
      );
      
      res.json(record);
    } catch (error) {
      console.error("Error updating CQC compliance record:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid compliance record data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update CQC compliance record" });
    }
  });

  app.delete("/api/cqc/compliance-records/:id", requireAdmin, async (req, res) => {
    try {
      // Get record details before deletion for logging
      const existingRecord = await storage.getCqcComplianceRecord(req.params.id);
      if (!existingRecord) {
        return res.status(404).json({ message: "CQC compliance record not found" });
      }
      
      const success = await storage.deleteCqcComplianceRecord(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "CQC compliance record not found" });
      }
      
      // Create audit log
      await AuditLogger.logDelete(
        req,
        req.user!,
        'cqc_compliance_record',
        req.params.id,
        { recordType: existingRecord.recordType, staffId: existingRecord.staffId, title: existingRecord.title }
      );
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting CQC compliance record:", error);
      res.status(500).json({ message: "Failed to delete CQC compliance record" });
    }
  });

  // ========== CQC 2024 SINGLE ASSESSMENT FRAMEWORK API ROUTES ==========
  
  // Quality Statements - Fetch the 34 CQC Quality Statements 
  app.get("/api/cqc/quality-statements", requireAdmin, async (req, res) => {
    try {
      const { keyQuestion } = req.query;
      const statements = await storage.getAllCqcQualityStatements(keyQuestion as string);
      res.json(statements);
    } catch (error) {
      console.error("Error fetching CQC quality statements:", error);
      res.status(500).json({ message: "Failed to fetch CQC quality statements" });
    }
  });

  app.post("/api/cqc/quality-statements", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCqcQualityStatementSchema.parse(req.body);
      const statement = await storage.createCqcQualityStatement(validatedData);
      res.status(201).json(statement);
    } catch (error) {
      console.error("Error creating CQC quality statement:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quality statement data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create CQC quality statement" });
    }
  });

  // Evidence Categories - Fetch the 6 CQC Evidence Categories
  app.get("/api/cqc/evidence-categories", requireAdmin, async (req, res) => {
    try {
      const categories = await storage.getAllCqcEvidenceCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching CQC evidence categories:", error);
      res.status(500).json({ message: "Failed to fetch CQC evidence categories" });
    }
  });

  app.post("/api/cqc/evidence-categories", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCqcEvidenceCategorySchema.parse(req.body);
      const category = await storage.createCqcEvidenceCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating CQC evidence category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid evidence category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create CQC evidence category" });
    }
  });

  // Audit Evidence - File uploads and evidence management
  app.get("/api/cqc/evidence", requireAdmin, async (req, res) => {
    try {
      const { auditId, evidenceCategoryId, qualityStatementId } = req.query;
      const evidence = await storage.getAllCqcAuditEvidence({
        auditId: auditId as string,
        evidenceCategoryId: evidenceCategoryId as string,
        qualityStatementId: qualityStatementId as string
      });
      res.json(evidence);
    } catch (error) {
      console.error("Error fetching CQC audit evidence:", error);
      res.status(500).json({ message: "Failed to fetch CQC audit evidence" });
    }
  });

  app.post("/api/cqc/evidence", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCqcAuditEvidenceSchema.parse({
        ...req.body,
        uploadedBy: req.user!.id
      });
      const evidence = await storage.createCqcAuditEvidence(validatedData);
      
      // Create audit log for evidence upload
      await AuditLogger.logCreate(
        req,
        req.user!,
        'cqc_audit_evidence',
        evidence.id,
        { 
          fileName: evidence.fileName,
          evidenceCategory: evidence.evidenceCategoryId,
          auditId: evidence.auditId 
        }
      );
      
      res.status(201).json(evidence);
    } catch (error) {
      console.error("Error creating CQC audit evidence:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid evidence data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create CQC audit evidence" });
    }
  });

  app.get("/api/cqc/evidence/:id", requireAdmin, async (req, res) => {
    try {
      const evidence = await storage.getCqcAuditEvidence(req.params.id);
      if (!evidence) {
        return res.status(404).json({ message: "CQC audit evidence not found" });
      }
      res.json(evidence);
    } catch (error) {
      console.error("Error fetching CQC audit evidence:", error);
      res.status(500).json({ message: "Failed to fetch CQC audit evidence" });
    }
  });

  app.delete("/api/cqc/evidence/:id", requireAdmin, async (req, res) => {
    try {
      const existingEvidence = await storage.getCqcAuditEvidence(req.params.id);
      if (!existingEvidence) {
        return res.status(404).json({ message: "CQC audit evidence not found" });
      }
      
      const success = await storage.deleteCqcAuditEvidence(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "CQC audit evidence not found" });
      }
      
      // Create audit log for evidence deletion
      await AuditLogger.logDelete(
        req,
        req.user!,
        'cqc_audit_evidence',
        req.params.id,
        { fileName: existingEvidence.fileName, evidenceCategory: existingEvidence.evidenceCategoryId }
      );
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting CQC audit evidence:", error);
      res.status(500).json({ message: "Failed to delete CQC audit evidence" });
    }
  });

  // Quality Assessments - Ratings and judgements for Quality Statements
  app.get("/api/cqc/assessments", requireAdmin, async (req, res) => {
    try {
      const { auditId, qualityStatementId, assessmentRating } = req.query;
      const assessments = await storage.getAllCqcQualityAssessments({
        auditId: auditId as string,
        qualityStatementId: qualityStatementId as string,
        assessmentRating: assessmentRating as string
      });
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching CQC quality assessments:", error);
      res.status(500).json({ message: "Failed to fetch CQC quality assessments" });
    }
  });

  app.post("/api/cqc/assessments", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCqcQualityAssessmentSchema.parse({
        ...req.body,
        assessorId: req.user!.id
      });
      const assessment = await storage.createCqcQualityAssessment(validatedData);
      
      // Create audit log for assessment
      await AuditLogger.logCreate(
        req,
        req.user!,
        'cqc_quality_assessment',
        assessment.id,
        { 
          qualityStatementId: assessment.qualityStatementId,
          rating: assessment.complianceLevel,
          auditId: assessment.auditId 
        }
      );
      
      res.status(201).json(assessment);
    } catch (error) {
      console.error("Error creating CQC quality assessment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create CQC quality assessment" });
    }
  });

  app.get("/api/cqc/assessments/:id", requireAdmin, async (req, res) => {
    try {
      const assessment = await storage.getCqcQualityAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "CQC quality assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      console.error("Error fetching CQC quality assessment:", error);
      res.status(500).json({ message: "Failed to fetch CQC quality assessment" });
    }
  });

  app.put("/api/cqc/assessments/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCqcQualityAssessmentSchema.partial().parse(req.body);
      const assessment = await storage.updateCqcQualityAssessment(req.params.id, validatedData);
      if (!assessment) {
        return res.status(404).json({ message: "CQC quality assessment not found" });
      }
      
      // Create audit log for assessment update
      await AuditLogger.logUpdate(
        req,
        req.user!,
        'cqc_quality_assessment',
        req.params.id,
        { rating: assessment.complianceLevel, qualityStatementId: assessment.qualityStatementId }
      );
      
      res.json(assessment);
    } catch (error) {
      console.error("Error updating CQC quality assessment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update CQC quality assessment" });
    }
  });

  // ========== STAFF KNOWLEDGE ASSESSMENT API ROUTES ==========
  
  // Knowledge Questionnaires
  app.get("/api/knowledge/questionnaires", requireAdmin, async (req, res) => {
    try {
      const { category, subcategory, isActive } = req.query;
      const questionnaires = await storage.getAllKnowledgeQuestionnaires({
        category: category as string,
        subcategory: subcategory as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
      });
      res.json(questionnaires);
    } catch (error) {
      console.error("Error fetching knowledge questionnaires:", error);
      res.status(500).json({ message: "Failed to fetch knowledge questionnaires" });
    }
  });

  app.get("/api/knowledge/questionnaires/:id", requireAdmin, async (req, res) => {
    try {
      const questionnaire = await storage.getKnowledgeQuestionnaire(req.params.id);
      if (!questionnaire) {
        return res.status(404).json({ message: "Knowledge questionnaire not found" });
      }
      res.json(questionnaire);
    } catch (error) {
      console.error("Error fetching knowledge questionnaire:", error);
      res.status(500).json({ message: "Failed to fetch knowledge questionnaire" });
    }
  });

  app.post("/api/knowledge/questionnaires", requireAdmin, async (req, res) => {
    try {
      // Generate shareable link
      const shareableLink = crypto.randomUUID();
      const validatedData = insertKnowledgeQuestionnaireSchema.parse({
        ...req.body,
        shareableLink,
        createdBy: req.user!.id
      });
      
      const questionnaire = await storage.createKnowledgeQuestionnaire(validatedData);
      
      // Create audit log
      await AuditLogger.logCreate(
        req,
        req.user!,
        'knowledge_questionnaire',
        questionnaire.id,
        { title: questionnaire.title, category: questionnaire.category }
      );
      
      res.status(201).json(questionnaire);
    } catch (error) {
      console.error("Error creating knowledge questionnaire:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid questionnaire data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create knowledge questionnaire" });
    }
  });

  app.put("/api/knowledge/questionnaires/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertKnowledgeQuestionnaireSchema.partial().parse(req.body);
      const questionnaire = await storage.updateKnowledgeQuestionnaire(req.params.id, validatedData);
      if (!questionnaire) {
        return res.status(404).json({ message: "Knowledge questionnaire not found" });
      }
      
      // Create audit log
      await AuditLogger.logUpdate(
        req,
        req.user!,
        'knowledge_questionnaire',
        questionnaire.id,
        { ...validatedData, title: questionnaire.title }
      );
      
      res.json(questionnaire);
    } catch (error) {
      console.error("Error updating knowledge questionnaire:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid questionnaire data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update knowledge questionnaire" });
    }
  });

  app.delete("/api/knowledge/questionnaires/:id", requireAdmin, async (req, res) => {
    try {
      const existingQuestionnaire = await storage.getKnowledgeQuestionnaire(req.params.id);
      if (!existingQuestionnaire) {
        return res.status(404).json({ message: "Knowledge questionnaire not found" });
      }
      
      const success = await storage.deleteKnowledgeQuestionnaire(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Knowledge questionnaire not found" });
      }
      
      // Create audit log
      await AuditLogger.logDelete(
        req,
        req.user!,
        'knowledge_questionnaire',
        req.params.id,
        { title: existingQuestionnaire.title, category: existingQuestionnaire.category }
      );
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting knowledge questionnaire:", error);
      res.status(500).json({ message: "Failed to delete knowledge questionnaire" });
    }
  });

  // Knowledge Questions
  app.get("/api/knowledge/questionnaires/:questionnaireId/questions", requireAdmin, async (req, res) => {
    try {
      const questions = await storage.getKnowledgeQuestions(req.params.questionnaireId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching knowledge questions:", error);
      res.status(500).json({ message: "Failed to fetch knowledge questions" });
    }
  });

  app.post("/api/knowledge/questions", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertKnowledgeQuestionSchema.parse(req.body);
      const question = await storage.createKnowledgeQuestion(validatedData);
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating knowledge question:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create knowledge question" });
    }
  });

  app.put("/api/knowledge/questions/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertKnowledgeQuestionSchema.partial().parse(req.body);
      const question = await storage.updateKnowledgeQuestion(req.params.id, validatedData);
      if (!question) {
        return res.status(404).json({ message: "Knowledge question not found" });
      }
      res.json(question);
    } catch (error) {
      console.error("Error updating knowledge question:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update knowledge question" });
    }
  });

  app.delete("/api/knowledge/questions/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteKnowledgeQuestion(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Knowledge question not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting knowledge question:", error);
      res.status(500).json({ message: "Failed to delete knowledge question" });
    }
  });

  // Knowledge Sessions (for admin viewing)
  app.get("/api/knowledge/sessions", requireAdmin, async (req, res) => {
    try {
      const { questionnaireId, staffEmail, status } = req.query;
      const sessions = await storage.getAllKnowledgeSessions({
        questionnaireId: questionnaireId as string,
        staffEmail: staffEmail as string,
        status: status as string
      });
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching knowledge sessions:", error);
      res.status(500).json({ message: "Failed to fetch knowledge sessions" });
    }
  });

  app.get("/api/knowledge/sessions/:id", requireAdmin, async (req, res) => {
    try {
      const session = await storage.getKnowledgeSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Knowledge session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching knowledge session:", error);
      res.status(500).json({ message: "Failed to fetch knowledge session" });
    }
  });

  // Knowledge Actions
  app.get("/api/knowledge/actions", requireAdmin, async (req, res) => {
    try {
      const { sessionId, assignedTo, status } = req.query;
      const actions = await storage.getAllKnowledgeActions({
        sessionId: sessionId as string,
        assignedTo: assignedTo as string,
        status: status as string
      });
      res.json(actions);
    } catch (error) {
      console.error("Error fetching knowledge actions:", error);
      res.status(500).json({ message: "Failed to fetch knowledge actions" });
    }
  });

  app.post("/api/knowledge/actions", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertKnowledgeActionSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      const action = await storage.createKnowledgeAction(validatedData);
      res.status(201).json(action);
    } catch (error) {
      console.error("Error creating knowledge action:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid action data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create knowledge action" });
    }
  });

  app.put("/api/knowledge/actions/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertKnowledgeActionSchema.partial().parse(req.body);
      const action = await storage.updateKnowledgeAction(req.params.id, validatedData);
      if (!action) {
        return res.status(404).json({ message: "Knowledge action not found" });
      }
      res.json(action);
    } catch (error) {
      console.error("Error updating knowledge action:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid action data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update knowledge action" });
    }
  });

  // Public Assessment Taking Routes (no auth required for staff to take assessments)
  app.get("/api/public/knowledge/assessment/:shareableLink", async (req, res) => {
    try {
      const questionnaire = await storage.getKnowledgeQuestionnaireByShareableLink(req.params.shareableLink);
      if (!questionnaire || !questionnaire.isActive) {
        return res.status(404).json({ message: "Assessment not found or inactive" });
      }
      
      const questions = await storage.getKnowledgeQuestions(questionnaire.id);
      res.json({
        questionnaire: {
          id: questionnaire.id,
          title: questionnaire.title,
          description: questionnaire.description,
          instructions: questionnaire.instructions,
          timeLimit: questionnaire.timeLimit,
          category: questionnaire.category,
          subcategory: questionnaire.subcategory
        },
        questions: questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          points: q.points,
          sortOrder: q.sortOrder,
          isRequired: q.isRequired
          // Note: correctAnswer and explanation are not included for security
        }))
      });
    } catch (error) {
      console.error("Error fetching public assessment:", error);
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  app.post("/api/public/knowledge/start-session", async (req, res) => {
    try {
      const { questionnaireId, staffEmail, staffName } = req.body;
      
      // Validate questionnaire exists and is active
      const questionnaire = await storage.getKnowledgeQuestionnaire(questionnaireId);
      if (!questionnaire || !questionnaire.isActive) {
        return res.status(404).json({ message: "Assessment not found or inactive" });
      }
      
      const sessionData = insertKnowledgeSessionSchema.parse({
        questionnaireId,
        staffEmail,
        staffName,
        status: 'in_progress',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      const session = await storage.createKnowledgeSession(sessionData);
      res.status(201).json({ sessionId: session.id });
    } catch (error) {
      console.error("Error starting knowledge session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to start assessment session" });
    }
  });

  app.post("/api/public/knowledge/submit-response", async (req, res) => {
    try {
      const responseData = insertKnowledgeResponseSchema.parse(req.body);
      
      // Get the question to check correct answer and calculate points
      const question = await storage.getKnowledgeQuestion(responseData.questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      // Calculate if answer is correct and award points
      let isCorrect = false;
      let pointsAwarded = 0;
      
      if (question.correctAnswer && question.correctAnswer === responseData.answer) {
        isCorrect = true;
        pointsAwarded = question.points || 1;
      }
      
      const response = await storage.createKnowledgeResponse({
        ...responseData,
        isCorrect,
        pointsAwarded,
        needsReview: question.questionType === 'short_answer' || question.questionType === 'scenario_based'
      });
      
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error submitting knowledge response:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit response" });
    }
  });

  app.post("/api/public/knowledge/complete-session/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      
      // Get all responses for this session to calculate final score
      const responses = await storage.getKnowledgeResponses(sessionId);
      const session = await storage.getKnowledgeSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const questionnaire = await storage.getKnowledgeQuestionnaire(session.questionnaireId);
      if (!questionnaire) {
        return res.status(404).json({ message: "Questionnaire not found" });
      }
      
      // Calculate scores
      const totalScore = responses.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0);
      const maxScore = responses.reduce((sum, r) => sum + (responses.find(resp => resp.questionId === r.questionId)?.pointsAwarded || 1), 0);
      const percentageScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
      const passed = percentageScore >= (questionnaire.passingScore || 70);
      
      // Update session
      await storage.updateKnowledgeSession(sessionId, {
        status: 'completed',
        completedAt: new Date(),
        totalScore,
        maxScore,
        percentageScore,
        passed,
        timeSpent: req.body.timeSpent || 0
      });
      
      res.json({ 
        totalScore, 
        maxScore, 
        percentageScore, 
        passed,
        passingScore: questionnaire.passingScore || 70
      });
    } catch (error) {
      console.error("Error completing knowledge session:", error);
      res.status(500).json({ message: "Failed to complete session" });
    }
  });

  // CQC Audit Reminder System
  app.post("/api/cqc/check-reminders", requireSuperAdmin, async (req, res) => {
    try {
      console.log('Checking for CQC audit reminders...');
      
      // Get all completed audits
      const allAudits = await storage.getAllCqcAudits({ status: 'completed' });
      
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      
      // Filter audits that need reminders (7 days before due date)
      const auditsNeedingReminders = allAudits.filter(audit => {
        if (!audit.nextAuditDue) return false;
        
        const dueDate = new Date(audit.nextAuditDue);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Send reminder exactly 7 days before (within 24 hour window)
        return diffDays >= 7 && diffDays <= 8;
      });
      
      console.log(`Found ${auditsNeedingReminders.length} audits needing reminders`);
      
      let emailsSent = 0;
      let emailErrors = 0;
      
      for (const audit of auditsNeedingReminders) {
        try {
          const dueDate = new Date(audit.nextAuditDue!);
          const diffTime = dueDate.getTime() - today.getTime();
          const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          await brevoService.sendAuditReviewReminderEmail({
            auditTitle: audit.title,
            auditType: audit.auditType,
            serviceType: audit.serviceType,
            completedDate: new Date(audit.auditDate).toLocaleDateString('en-GB'),
            nextReviewDate: dueDate.toLocaleDateString('en-GB'),
            daysUntilDue: daysUntilDue,
            auditorName: audit.auditorName,
            overallRating: audit.overallRating || undefined,
            areasForImprovement: audit.areasForImprovement || undefined
          });
          
          emailsSent++;
          console.log(`Reminder email sent for audit: ${audit.title}`);
          
        } catch (emailError) {
          console.error(`Failed to send reminder for audit ${audit.title}:`, emailError);
          emailErrors++;
        }
      }
      
      res.json({
        success: true,
        message: `Reminder check completed. Emails sent: ${emailsSent}, Errors: ${emailErrors}`,
        auditsChecked: allAudits.length,
        remindersNeeded: auditsNeedingReminders.length,
        emailsSent,
        emailErrors
      });
      
    } catch (error) {
      console.error('Error checking audit reminders:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to check audit reminders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Trigger reminder check when an audit is completed
  app.post("/api/cqc/audits/:id/complete", requireAdmin, async (req, res) => {
    try {
      const auditId = req.params.id;
      const { nextAuditDue } = req.body;
      
      // Update audit status to completed and set next audit due date
      const updatedAudit = await storage.updateCqcAudit(auditId, {
        status: 'completed',
        nextAuditDue: nextAuditDue ? new Date(nextAuditDue) : undefined,
        // updatedAt is automatically handled by the database
      });
      
      if (!updatedAudit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      
      console.log(`Audit ${auditId} marked as completed. Next review due: ${nextAuditDue}`);
      
      res.json({
        success: true,
        message: "Audit marked as completed",
        audit: updatedAudit
      });
      
    } catch (error) {
      console.error('Error completing audit:', error);
      res.status(500).json({ 
        message: "Failed to complete audit",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Finance Reports
  app.get("/api/finance-reports", requireAdmin, async (req, res) => {
    try {
      const reports = await storage.getAllFinanceReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching finance reports:", error);
      res.status(500).json({ error: "Failed to fetch finance reports" });
    }
  });

  app.get("/api/finance-reports/:id", requireAdmin, async (req, res) => {
    try {
      const report = await storage.getFinanceReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Finance report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching finance report:", error);
      res.status(500).json({ error: "Failed to fetch finance report" });
    }
  });

  app.get("/api/finance-reports/month/:month", requireAdmin, async (req, res) => {
    try {
      const report = await storage.getFinanceReportByMonth(req.params.month);
      if (!report) {
        return res.status(404).json({ error: "Finance report not found for this month" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching finance report by month:", error);
      res.status(500).json({ error: "Failed to fetch finance report" });
    }
  });

  app.post("/api/finance-reports", requireAdmin, async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      const reportData = {
        ...req.body,
        createdBy: userId,
        // Convert "YYYY-MM" format to "YYYY-MM-01" for proper date storage
        reportMonth: req.body.reportMonth.includes('-') && req.body.reportMonth.length === 7 
          ? `${req.body.reportMonth}-01` 
          : req.body.reportMonth
      };
      
      const report = await storage.createFinanceReport(reportData);
      res.json(report);
    } catch (error: any) {
      console.error("Error creating finance report:", error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: "A report for this month already exists" });
      }
      res.status(500).json({ error: "Failed to create finance report" });
    }
  });

  app.patch("/api/finance-reports/:id", requireAdmin, async (req, res) => {
    try {
      const updateData = { ...req.body };
      // Convert "YYYY-MM" format to "YYYY-MM-01" for proper date storage if present
      if (updateData.reportMonth && updateData.reportMonth.includes('-') && updateData.reportMonth.length === 7) {
        updateData.reportMonth = `${updateData.reportMonth}-01`;
      }
      
      const report = await storage.updateFinanceReport(req.params.id, updateData);
      if (!report) {
        return res.status(404).json({ error: "Finance report not found" });
      }
      res.json(report);
    } catch (error: any) {
      console.error("Error updating finance report:", error);
      if (error.code === '23505') {
        return res.status(400).json({ error: "A report for this month already exists" });
      }
      res.status(500).json({ error: "Failed to update finance report" });
    }
  });

  app.delete("/api/finance-reports/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteFinanceReport(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Finance report not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting finance report:", error);
      res.status(500).json({ error: "Failed to delete finance report" });
    }
  });

  // Route Planning and Optimization APIs
  const googleMapsService = new GoogleMapsService();

  // Geocoding API
  app.post("/api/route-planner/geocode", requireAdmin, async (req, res) => {
    try {
      const { addresses } = req.body;
      
      if (!Array.isArray(addresses) || addresses.length === 0) {
        return res.status(400).json({ message: "Please provide an array of addresses" });
      }

      const results = [];
      
      for (const address of addresses) {
        try {
          // Check cache first
          const cacheKey = GoogleMapsService.getCacheKey(address);
          const cached = await storage.getGeocode(cacheKey);
          
          if (cached) {
            results.push({
              address,
              latitude: cached.latitude,
              longitude: cached.longitude,
              formattedAddress: cached.formattedAddress,
              postcode: cached.postcode,
              fromCache: true
            });
          } else {
            // Geocode using Google Maps
            const geocoded = await googleMapsService.geocodeAddress(address);
            if (geocoded) {
              // Cache the result
              await storage.createGeocode({
                cacheKey,
                originalQuery: address,
                latitude: geocoded.latitude,
                longitude: geocoded.longitude,
                formattedAddress: geocoded.formattedAddress,
                postcode: geocoded.postcode,
                placeId: geocoded.placeId
              });
              
              results.push({
                address,
                latitude: geocoded.latitude,
                longitude: geocoded.longitude,
                formattedAddress: geocoded.formattedAddress,
                postcode: geocoded.postcode,
                fromCache: false
              });
            } else {
              results.push({
                address,
                error: "Could not geocode address"
              });
            }
          }
        } catch (error) {
          console.error(`Error geocoding ${address}:`, error);
          results.push({
            address,
            error: "Geocoding failed"
          });
        }
      }

      res.json({ results });
    } catch (error) {
      console.error('Geocoding API error:', error);
      res.status(500).json({ 
        message: "Failed to geocode addresses",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Distance Matrix API
  app.post("/api/route-planner/distance-matrix", requireAdmin, async (req, res) => {
    try {
      const { origins, destinations, mode = 'driving' } = req.body;
      
      if (!Array.isArray(origins) || !Array.isArray(destinations)) {
        return res.status(400).json({ message: "Please provide origins and destinations arrays" });
      }

      if (origins.length === 0 || destinations.length === 0) {
        return res.status(400).json({ message: "Origins and destinations cannot be empty" });
      }

      // Validate coordinate format
      const validateCoords = (coords: any[]) => {
        return coords.every(coord => 
          typeof coord.lat === 'number' && 
          typeof coord.lng === 'number' &&
          coord.lat >= -90 && coord.lat <= 90 &&
          coord.lng >= -180 && coord.lng <= 180
        );
      };

      if (!validateCoords(origins) || !validateCoords(destinations)) {
        return res.status(400).json({ message: "Invalid coordinate format" });
      }

      const matrix = await googleMapsService.getDistanceMatrix(origins, destinations, mode);
      
      if (!matrix) {
        return res.status(500).json({ message: "Failed to calculate distance matrix" });
      }

      res.json(matrix);
    } catch (error) {
      console.error('Distance Matrix API error:', error);
      res.status(500).json({ 
        message: "Failed to calculate distance matrix",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Advanced Route Optimization API
  // Update visit coordinates API for draggable pins
  app.patch("/api/route-planner/visit/:visitId/coordinates", requireAdmin, async (req, res) => {
    try {
      const { visitId } = req.params;
      const { latitude, longitude } = req.body;

      // Validate coordinates
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ 
          message: "Invalid coordinates. Latitude and longitude must be numbers." 
        });
      }

      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({ 
          message: "Invalid latitude. Must be between -90 and 90." 
        });
      }

      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({ 
          message: "Invalid longitude. Must be between -180 and 180." 
        });
      }

      // For route planner, we'll reverse geocode to get the address at the new coordinates
      try {
        const reverseGeocode = await googleMapsService.reverseGeocode(latitude, longitude);
        
        res.json({
          success: true,
          visitId,
          latitude,
          longitude,
          address: reverseGeocode?.formattedAddress || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          message: "Visit coordinates updated successfully"
        });
      } catch (error) {
        // If reverse geocoding fails, still return success with coordinates
        console.warn('Reverse geocoding failed for dragged pin:', error);
        res.json({
          success: true,
          visitId,
          latitude,
          longitude,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          message: "Visit coordinates updated successfully"
        });
      }
    } catch (error) {
      console.error('Update visit coordinates error:', error);
      res.status(500).json({ 
        message: "Failed to update visit coordinates",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/route-planner/optimize", requireAdmin, async (req, res) => {
    try {
      const { 
        visits, 
        mode = 'driving', // Default to driving for domiciliary care
        departureTime, // CRITICAL FIX: Remove hardcoded default - use actual user value
        runDate,
        runName,
        saveRun = false,
        optimizationStrategy = 'shortest_distance',
        maxRoutesPerDay = 3
      } = req.body;

      if (!Array.isArray(visits) || visits.length === 0) {
        return res.status(400).json({ message: "Please provide an array of visits" });
      }

      // Validate and provide fallback for departureTime
      const validDepartureTime = departureTime || '08:00';
      console.log(`FIXED: Using departure time: ${validDepartureTime} (from frontend: ${departureTime})`);

      // Import the advanced optimizer
      const { AdvancedRouteOptimizer } = await import('./advanced-route-optimizer');
      const optimizer = new AdvancedRouteOptimizer();

      console.log(`Starting advanced optimization for ${visits.length} visits`);

      // Convert timeSlot names to actual time windows before optimization
      const visitsWithTimeWindows = visits.map(visit => {
        let windowStart, windowEnd;
        
        // Convert common time slot names to time windows
        switch (visit.timeSlot?.toLowerCase()) {
          case 'morning':
            windowStart = '07:00';
            windowEnd = '11:00';
            break;
          case 'lunch':
            windowStart = '11:00';
            windowEnd = '15:00';
            break;
          case 'tea':
            windowStart = '15:00';
            windowEnd = '18:00';
            break;
          case 'bed':
            windowStart = '18:00';
            windowEnd = '23:00';
            break;
          default:
            // Use provided earliestTime/latestTime if available, or no constraints
            windowStart = visit.earliestTime;
            windowEnd = visit.latestTime;
        }

        return {
          ...visit,
          windowStart,
          windowEnd
        };
      });

      // Run advanced optimization with TSP solver and 2-opt improvement
      const optimizationResult = await optimizer.optimizeRoutes(visitsWithTimeWindows, {
        mode,
        optimizationStrategy,
        maxRoutesPerDay,
        considerTimeWindows: true,
        departureTime: validDepartureTime // CRITICAL FIX: Pass the actual user's shift start time
      });

      // Convert to legacy format for compatibility with frontend
      // Flatten all routes into a single optimized order - travel times already calculated by optimizer
      const allOptimizedVisits = optimizationResult.optimizedRoutes.flatMap(route => route.visits);
      
      // CRITICAL: Do NOT recalculate travel times here - they are already set by advanced-route-optimizer.ts
      // The optimizer has already calculated authoritative travel times using Google Maps API
      console.log(`Using authoritative travel times from optimizer for ${allOptimizedVisits.length} visits`);
      
      const result = {
        optimizedOrder: allOptimizedVisits.length > 0 ? allOptimizedVisits : visits,
        totalDistanceMeters: Math.round(optimizationResult.optimizedRoutes.reduce(
          (sum, route) => sum + route.totalDistanceMeters, 0
        )),
        totalTravelMinutes: Math.round(
          optimizationResult.optimizedRoutes.reduce(
            (sum, route) => sum + (route.metrics?.travelTimeHours || 0) * 60, 0
          )
        ),
        totalServiceMinutes: Math.round(
          optimizationResult.optimizedRoutes.reduce(
            (sum, route) => sum + (route.metrics?.serviceTimeHours || 0) * 60, 0
          )
        ),
        mode,
        
        // Enhanced metrics for cost analysis
        totalRoutes: optimizationResult.totalRoutes,
        costSavings: optimizationResult.costSavings,
        distanceSavedKm: optimizationResult.distanceSavedKm,
        optimizationStrategy: optimizationResult.optimizationStrategy,
        routes: optimizationResult.optimizedRoutes.map((route, index) => ({
          routeNumber: index + 1,
          visits: route.visits,
          distanceKm: route.metrics?.totalDistanceKm || 0,
          timeHours: route.metrics?.totalTimeHours || 0,
          cost: route.metrics?.totalCost || 0,
          visitCount: route.visits.length
        })),
        baseline: optimizationResult.baseline
      };

      // Save run if requested
      if (saveRun && runDate && runName) {
        try {
          const run = await storage.createRun({
            name: runName,
            runDate,
            travelMode: mode,
            totalDistanceMeters: result.totalDistanceMeters,
            totalTravelMinutes: result.totalTravelMinutes,
            totalServiceMinutes: result.totalServiceMinutes,
            departureTime,
            status: 'optimized',
            createdBy: req.user!.id
          });

          // Save run stops for all routes
          let stopOrder = 1;
          for (const route of optimizationResult.optimizedRoutes) {
            for (const visit of route.visits) {
              await storage.createRunStop({
                runId: run.id,
                visitId: visit.id || null,
                stopOrder: stopOrder++,
                adHocAddress: visit.id ? null : visit.address,
                adHocLatitude: visit.id ? null : visit.latitude,
                adHocLongitude: visit.id ? null : visit.longitude,
                adHocDuration: visit.id ? null : visit.durationMinutes
              });
            }
          }

          (result as any).runId = run.id;
        } catch (saveError) {
          console.error('Error saving run:', saveError);
          // Don't fail the optimization, just log the error
        }
      }

      res.json(result);
    } catch (error) {
      console.error('Route optimization error:', error);
      res.status(500).json({ 
        message: "Failed to optimize route",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Helper function to calculate distance between two coordinates (Haversine formula)
  function calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  }

  // CRUD APIs for Route Planning entities

  // Clients
  app.get("/api/clients", requireAdmin, async (req, res) => {
    try {
      const filters = {
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        postcode: req.query.postcode as string | undefined
      };
      const clients = await storage.getAllClients(filters);
      res.json(clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post("/api/clients", requireAdmin, async (req, res) => {
    try {
      const validation = insertClientSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid client data",
          errors: validation.error.errors
        });
      }

      // Normalize postcode
      const normalizedPostcode = validation.data.postcode?.replace(/\s+/g, '').toUpperCase();
      
      const client = await storage.createClient({
        ...validation.data,
        normalizedPostcode
      });
      
      res.status(201).json(client);
    } catch (error) {
      console.error('Error creating client:', error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  // Visits
  app.get("/api/visits", requireAdmin, async (req, res) => {
    try {
      const filters = {
        date: req.query.date as string | undefined,
        clientId: req.query.clientId as string | undefined,
        timeSlot: req.query.timeSlot as string | undefined,
        status: req.query.status as string | undefined
      };
      const visits = await storage.getAllVisits(filters);
      res.json(visits);
    } catch (error) {
      console.error('Error fetching visits:', error);
      res.status(500).json({ message: "Failed to fetch visits" });
    }
  });

  app.post("/api/visits", requireAdmin, async (req, res) => {
    try {
      const validation = insertVisitSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid visit data",
          errors: validation.error.errors
        });
      }

      const visit = await storage.createVisit(validation.data);
      res.status(201).json(visit);
    } catch (error) {
      console.error('Error creating visit:', error);
      res.status(500).json({ message: "Failed to create visit" });
    }
  });

  // Runs
  app.get("/api/runs", requireAdmin, async (req, res) => {
    try {
      const filters = {
        date: req.query.date as string | undefined,
        travelMode: req.query.travelMode as string | undefined,
        status: req.query.status as string | undefined,
        createdBy: req.query.createdBy as string | undefined
      };
      const runs = await storage.getAllRuns(filters);
      res.json(runs);
    } catch (error) {
      console.error('Error fetching runs:', error);
      res.status(500).json({ message: "Failed to fetch runs" });
    }
  });

  app.get("/api/runs/:id", requireAdmin, async (req, res) => {
    try {
      const run = await storage.getRun(req.params.id);
      if (!run) {
        return res.status(404).json({ message: "Run not found" });
      }
      
      const runStops = await storage.getRunStops(req.params.id);
      res.json({ ...run, stops: runStops });
    } catch (error) {
      console.error('Error fetching run:', error);
      res.status(500).json({ message: "Failed to fetch run" });
    }
  });

  app.delete("/api/runs/:id", requireAdmin, async (req, res) => {
    try {
      // Delete run stops first
      await storage.deleteRunStops(req.params.id);
      
      // Delete run
      const deleted = await storage.deleteRun(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Run not found" });
      }
      
      res.json({ message: "Run deleted successfully" });
    } catch (error) {
      console.error('Error deleting run:', error);
      res.status(500).json({ message: "Failed to delete run" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
