import type { Request } from "express";
import { storage } from "./storage";
import type { User, InsertAuditLog } from "@shared/schema";

// GDPR Audit Logging Utility
export class AuditLogger {
  /**
   * Log a GDPR-relevant action performed by an admin user
   */
  static async logAction(
    req: Request,
    user: User,
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>
  ) {
    try {
      const auditLog: InsertAuditLog = {
        userId: user.id,
        username: user.username,
        action,
        resourceType,
        resourceId: resourceId || null,
        details: details || null,
        ipAddress: this.getClientIP(req),
        userAgent: req.get("User-Agent") || null,
      };

      await storage.createAuditLog(auditLog);
    } catch (error) {
      console.error("Failed to create audit log:", error);
      // Don't throw error - we don't want logging failures to break the main functionality
    }
  }

  /**
   * Extract client IP address from request, considering proxies
   */
  private static getClientIP(req: Request): string | null {
    const forwarded = req.get("X-Forwarded-For");
    if (forwarded) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      return forwarded.split(",")[0].trim();
    }
    
    return req.get("X-Real-IP") || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           null;
  }

  /**
   * Log viewing of personal data
   */
  static async logView(req: Request, user: User, resourceType: string, resourceId: string, details?: Record<string, any>) {
    return this.logAction(req, user, "view", resourceType, resourceId, details);
  }

  /**
   * Log creation of records containing personal data
   */
  static async logCreate(req: Request, user: User, resourceType: string, resourceId: string, details?: Record<string, any>) {
    return this.logAction(req, user, "create", resourceType, resourceId, details);
  }

  /**
   * Log updates to personal data
   */
  static async logUpdate(req: Request, user: User, resourceType: string, resourceId: string, details?: Record<string, any>) {
    return this.logAction(req, user, "update", resourceType, resourceId, details);
  }

  /**
   * Log deletion of personal data
   */
  static async logDelete(req: Request, user: User, resourceType: string, resourceId: string, details?: Record<string, any>) {
    return this.logAction(req, user, "delete", resourceType, resourceId, details);
  }

  /**
   * Log data export (GDPR data subject request)
   */
  static async logExport(req: Request, user: User, resourceType: string, resourceId?: string, details?: Record<string, any>) {
    return this.logAction(req, user, "export", resourceType, resourceId, details);
  }

  /**
   * Log bulk operations
   */
  static async logBulkAction(req: Request, user: User, action: string, resourceType: string, details?: Record<string, any>) {
    return this.logAction(req, user, `bulk_${action}`, resourceType, undefined, details);
  }
}