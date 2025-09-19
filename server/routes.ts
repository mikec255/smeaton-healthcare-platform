import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { storage } from "./storage";
import { insertJobSchema, insertApplicationSchema, insertContactSubmissionSchema, insertFeedbackSchema, insertNewsletterSchema, insertNewsletterBlockSchema, insertTemplateSchema, insertBlogCategorySchema, insertBlogPostSchema, insertUserSchema, loginUserSchema, updateUserSchema } from "@shared/schema";
import { ObjectStorageService } from "./objectStorage";
import { brevoService } from "./brevo-service";
import { z } from "zod";
import "./types"; // Import type declarations

// Secure session-based authentication for production
async function requireAdmin(req: any, res: any, next: any) {
  // In production, only use secure session-based auth
  if (process.env.NODE_ENV === 'production') {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }
    
    // Always verify user still exists and is active from database
    const dbUser = await storage.getUserById(req.session.user.userId);
    if (!dbUser || !dbUser.isActive) {
      // Clear invalid session
      req.session.destroy((err: any) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(401).json({ message: "User not found or inactive" });
    }
    
    // Use fresh database role, not session role
    if (!["admin", "superadmin"].includes(dbUser.role)) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    req.user = dbUser;
    next();
    return;
  }
  
  // Development only: Allow insecure token for testing
  let user = null;
  
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
        return res.status(401).json({ message: "Token expired" });
      }
      
      const dbUser = await storage.getUserById(decoded.userId);
      if (!dbUser || !dbUser.isActive) {
        return res.status(401).json({ message: "User not found or inactive" });
      }
      
      user = dbUser; // Use database user, not decoded token
    } catch (error) {
      console.error("Token verification error:", error);
    }
  }
  
  // Fallback to session
  if (!user && req.session?.user) {
    const dbUser = await storage.getUserById(req.session.user.userId);
    if (dbUser && dbUser.isActive) {
      user = dbUser;
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

// Superadmin only access with secure authentication
async function requireSuperAdmin(req: any, res: any, next: any) {
  // In production, only use secure session-based auth
  if (process.env.NODE_ENV === 'production') {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }
    
    // Always verify user still exists and is superadmin from database
    const dbUser = await storage.getUserById(req.session.user.userId);
    if (!dbUser || !dbUser.isActive || dbUser.role !== "superadmin") {
      req.session.destroy((err: any) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(403).json({ message: "Forbidden: Superadmin access required" });
    }
    
    req.user = dbUser;
    next();
    return;
  }
  
  // Development only: Allow insecure token for testing
  let user = null;
  
  if (req.session?.user) {
    const dbUser = await storage.getUserById(req.session.user.userId);
    if (dbUser && dbUser.isActive) {
      user = dbUser;
    }
  } else {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        
        // Verify token is not too old (24 hours)
        if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
          return res.status(401).json({ message: "Token expired" });
        }
        
        // Verify user still exists and is active
        const dbUser = await storage.getUserById(decoded.userId);
        if (!dbUser || !dbUser.isActive) {
          return res.status(401).json({ message: "User not found or inactive" });
        }
        
        user = decoded;
      } catch (error) {
        // Invalid token format
      }
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

// Optional admin authentication with secure role verification
async function optionalAdmin(req: any, res: any, next: any) {
  let user = null;
  
  // Production: Only use secure session-based auth
  if (process.env.NODE_ENV === 'production') {
    if (req.session?.user) {
      // Always verify user from database, never trust session role
      const dbUser = await storage.getUserById(req.session.user.userId);
      if (dbUser && dbUser.isActive) {
        user = dbUser; // Use fresh database user
      }
    }
  } else {
    // Development: Check session first
    if (req.session?.user) {
      const dbUser = await storage.getUserById(req.session.user.userId);
      if (dbUser && dbUser.isActive) {
        user = dbUser; // Use database user, not session cache
      }
    } else {
      // Development only: Fallback to token but always verify from database
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
          
          // Verify token is not too old (24 hours)
          if (Date.now() - decoded.timestamp <= 24 * 60 * 60 * 1000) {
            // Always verify user from database, never trust token role
            const dbUser = await storage.getUserById(decoded.userId);
            if (dbUser && dbUser.isActive) {
              user = dbUser; // Use DB user, not decoded token
            }
          }
        } catch (error) {
          // Invalid token format, continue without user
        }
      }
    }
  }
  
  req.user = user;
  // Always derive admin status from fresh database role, never from tokens/sessions
  req.isAdmin = user && ["admin", "superadmin"].includes(user.role);
  next();
}

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
      'https://your-app.azurewebsites.net',
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
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Cross-site for production
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
      // Store user info in session (excluding password) - simplified approach
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      };
      
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
        
        // Production: Only minimal logging
        if (process.env.NODE_ENV !== 'production') {
          console.log("Session saved successfully");
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

  // User management routes (superadmin only)
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

  const emailConfigSchema = z.object({
    apiKey: z.string().min(50, "API key must be at least 50 characters").regex(/^x(keys|smtps)ib-/, "Invalid Brevo API key format")
  });

  app.post("/api/admin/email-config", requireSuperAdmin, async (req, res) => {
    try {
      const { apiKey } = emailConfigSchema.parse(req.body);
      
      const success = brevoService.setApiKey(apiKey);
      if (success) {
        res.json({ configured: true, message: "Email service configured successfully" });
      } else {
        res.status(400).json({ message: "Failed to configure email service" });
      }
    } catch (error) {
      console.error("Error configuring email service:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid API key format", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to configure email service" });
    }
  });

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
      res.json(application);
    } catch (error) {
      console.error("Error updating application notes:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notes data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update application notes" });
    }
  });

  // Contact submissions API
  app.get("/api/contact-submissions", requireAdmin, async (req, res) => {
    try {
      const submissions = await storage.getAllContactSubmissions();
      
      // Filter by type if specified
      if (req.query.type) {
        const filteredSubmissions = submissions.filter(submission => submission.type === req.query.type);
        return res.json(filteredSubmissions);
      }
      
      res.json(submissions);
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

        // Validate required referral fields
        if (!referrerName || !referrerEmail || !referrerPhone || !relationship ||
            !clientName || !clientAge || !clientAddress || !serviceType || !urgency) {
          return res.status(400).json({ message: "All required referral fields must be provided" });
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
          firstName: referrerName.split(' ')[0] || referrerName,
          lastName: referrerName.split(' ').slice(1).join(' ') || '',
          email: referrerEmail,
          phone: referrerPhone,
          location: clientAddress,
          serviceRequired: serviceType,
          additionalRequirements: [
            `Client: ${clientName} (Age: ${clientAge})`,
            `Relationship: ${relationship}`,
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

  app.put("/api/feedback/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/feedback/:id", requireAdmin, async (req, res) => {
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

  // CV/File upload endpoints
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Admin-only blog image upload endpoint
  app.post("/api/blog-images/upload", requireAdmin, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting blog image upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
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

  const httpServer = createServer(app);
  return httpServer;
}
