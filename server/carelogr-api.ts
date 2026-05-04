/**
 * CareLogr External API
 * ─────────────────────
 * Secure REST API for the CareLogr care management platform.
 * All endpoints require the header:  X-API-Key: <your key>
 *
 * Base path: /api/carelogr
 *
 * Resources
 * ─────────
 * GET    /health                         – API status + version
 *
 * Enquiries (contact submissions)
 * GET    /enquiries                      – list all (filter: ?status=new|contacted|quoted|closed&type=care-request|staff-booking)
 * GET    /enquiries/:id                  – single enquiry
 *
 * Blog Categories
 * GET    /blog/categories                – list all categories
 * POST   /blog/categories               – create category
 * PATCH  /blog/categories/:id           – update category
 * DELETE /blog/categories/:id           – delete category
 *
 * Blog Posts
 * GET    /blog/posts                    – list posts (filter: ?isPublished=true|false&categoryId=)
 * GET    /blog/posts/:id                – single post
 * GET    /blog/posts/slug/:slug         – post by slug
 * POST   /blog/posts                    – create post (draft)
 * PATCH  /blog/posts/:id                – update post fields
 * DELETE /blog/posts/:id                – delete post
 * POST   /blog/posts/:id/publish        – publish post (makes it live on site)
 * POST   /blog/posts/:id/unpublish      – unpublish post (hides from site)
 * POST   /blog/posts/:id/view           – record a page view (call this when a visitor reads the post)
 * PATCH  /enquiries/:id                  – update { status, notes }
 *
 * Jobs
 * GET    /jobs                           – list all (filter: ?isActive=true|false&location=&type=)
 * GET    /jobs/:id                       – single job
 * POST   /jobs                           – create job
 * PATCH  /jobs/:id                       – update job fields
 * DELETE /jobs/:id                       – delete job
 *
 * Applications
 * GET    /applications                   – list all (filter: ?jobId=&status=pending|reviewed|interview|hired|rejected)
 * GET    /applications/:id              – single application
 * PATCH  /applications/:id             – update { status, notes }
 */

import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { insertJobSchema } from "@shared/schema";
import { z } from "zod";

const API_VERSION = "1.0.0";

// ─── Authentication middleware ────────────────────────────────────────────────
function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key =
    req.headers["x-api-key"] ||
    req.query["api_key"];

  const expected = process.env.CARELOGR_API_KEY;

  if (!expected) {
    return res.status(503).json({
      error: "API_NOT_CONFIGURED",
      message: "The CARELOGR_API_KEY environment variable is not set on the server.",
    });
  }

  if (!key || key !== expected) {
    return res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Missing or invalid API key. Pass your key in the X-API-Key header.",
    });
  }

  next();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ok(res: Response, data: unknown, meta?: Record<string, unknown>) {
  res.json({ success: true, ...meta, data });
}

function notFound(res: Response, resource: string) {
  res.status(404).json({ success: false, error: "NOT_FOUND", message: `${resource} not found.` });
}

// ─── Route registration ───────────────────────────────────────────────────────
export function registerCarelogrRoutes(app: Express) {
  const r = app;
  const base = "/api/carelogr";

  // ── Diagnostic (no auth required — public) ────────────────────────────────
  r.get(`${base}/ping`, (_req, res) => {
    const key = process.env.CARELOGR_API_KEY;
    res.json({
      pong: true,
      keyConfigured: !!key,
      keyLength: key ? key.length : 0,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // Apply API key auth to every /api/carelogr/* route
  r.use(base, requireApiKey);

  // ── Health ─────────────────────────────────────────────────────────────────
  r.get(`${base}/health`, (_req, res) => {
    res.json({
      success: true,
      service: "Smeaton Healthcare API",
      version: API_VERSION,
      timestamp: new Date().toISOString(),
      resources: ["enquiries", "jobs", "applications", "blog"],
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // ENQUIRIES
  // ══════════════════════════════════════════════════════════════════════════

  // GET /enquiries
  r.get(`${base}/enquiries`, async (req, res) => {
    try {
      let enquiries = await storage.getAllContactSubmissions();

      // Optional filters
      const { status, type } = req.query as Record<string, string>;
      if (status) enquiries = enquiries.filter((e) => e.status === status);
      if (type) enquiries = enquiries.filter((e) => e.type === type);

      // Sort newest first
      enquiries = enquiries.sort(
        (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      );

      ok(res, enquiries, { total: enquiries.length });
    } catch (err) {
      console.error("[CareLogr API] GET /enquiries error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // GET /enquiries/:id
  r.get(`${base}/enquiries/:id`, async (req, res) => {
    try {
      const all = await storage.getAllContactSubmissions();
      const enquiry = all.find((e) => e.id === req.params.id);
      if (!enquiry) return notFound(res, "Enquiry");
      ok(res, enquiry);
    } catch (err) {
      console.error("[CareLogr API] GET /enquiries/:id error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // PATCH /enquiries/:id
  r.patch(`${base}/enquiries/:id`, async (req, res) => {
    try {
      const schema = z.object({
        status: z.enum(["new", "contacted", "quoted", "closed"]).optional(),
        notes: z.string().optional(),
      });

      const body = schema.parse(req.body);

      let updated;
      if (body.status) {
        updated = await storage.updateContactSubmissionStatus(req.params.id, body.status);
      }

      if (!updated) {
        const all = await storage.getAllContactSubmissions();
        updated = all.find((e) => e.id === req.params.id);
      }

      if (!updated) return notFound(res, "Enquiry");
      ok(res, updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: "VALIDATION_ERROR", details: err.errors });
      }
      console.error("[CareLogr API] PATCH /enquiries/:id error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // JOBS
  // ══════════════════════════════════════════════════════════════════════════

  // GET /jobs
  r.get(`${base}/jobs`, async (req, res) => {
    try {
      const { location, type, isActive } = req.query as Record<string, string>;

      const filters: { location?: string; type?: string } = {};
      if (location) filters.location = location;
      if (type) filters.type = type;

      let jobs = await storage.getAllJobs(filters);

      if (isActive !== undefined) {
        const active = isActive !== "false";
        jobs = jobs.filter((j) => j.isActive === active);
      }

      jobs = jobs.sort(
        (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      );

      ok(res, jobs, { total: jobs.length });
    } catch (err) {
      console.error("[CareLogr API] GET /jobs error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // GET /jobs/:id
  r.get(`${base}/jobs/:id`, async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) return notFound(res, "Job");
      ok(res, job);
    } catch (err) {
      console.error("[CareLogr API] GET /jobs/:id error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // POST /jobs
  r.post(`${base}/jobs`, async (req, res) => {
    try {
      const body = insertJobSchema.parse(req.body);
      const job = await storage.createJob(body);
      res.status(201).json({ success: true, data: job });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: "VALIDATION_ERROR", details: err.errors });
      }
      console.error("[CareLogr API] POST /jobs error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // PATCH /jobs/:id
  r.patch(`${base}/jobs/:id`, async (req, res) => {
    try {
      const body = insertJobSchema.partial().parse(req.body);
      const job = await storage.updateJob(req.params.id, body);
      if (!job) return notFound(res, "Job");
      ok(res, job);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: "VALIDATION_ERROR", details: err.errors });
      }
      console.error("[CareLogr API] PATCH /jobs/:id error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // DELETE /jobs/:id
  r.delete(`${base}/jobs/:id`, async (req, res) => {
    try {
      const deleted = await storage.deleteJob(req.params.id);
      if (!deleted) return notFound(res, "Job");
      res.json({ success: true, message: "Job deleted." });
    } catch (err) {
      console.error("[CareLogr API] DELETE /jobs/:id error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // APPLICATIONS
  // ══════════════════════════════════════════════════════════════════════════

  // GET /applications
  r.get(`${base}/applications`, async (req, res) => {
    try {
      const { jobId, status } = req.query as Record<string, string>;

      let applications;
      if (jobId) {
        applications = await storage.getApplicationsByJobId(jobId);
      } else {
        applications = await storage.getAllApplications();
      }

      if (status) {
        applications = applications.filter((a) => a.status === status);
      }

      applications = applications.sort(
        (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      );

      ok(res, applications, { total: applications.length });
    } catch (err) {
      console.error("[CareLogr API] GET /applications error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // GET /applications/:id
  r.get(`${base}/applications/:id`, async (req, res) => {
    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) return notFound(res, "Application");
      ok(res, application);
    } catch (err) {
      console.error("[CareLogr API] GET /applications/:id error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // PATCH /applications/:id  – update status and/or notes
  r.patch(`${base}/applications/:id`, async (req, res) => {
    try {
      const schema = z.object({
        status: z.enum(["pending", "reviewed", "interview", "hired", "rejected"]).optional(),
        notes: z.string().optional(),
      });

      const { status, notes } = schema.parse(req.body);

      let application = await storage.getApplication(req.params.id);
      if (!application) return notFound(res, "Application");

      if (status) {
        application = (await storage.updateApplicationStatus(req.params.id, status)) ?? application;
      }
      if (notes !== undefined) {
        application = (await storage.updateApplicationNotes(req.params.id, notes)) ?? application;
      }

      ok(res, application);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: "VALIDATION_ERROR", details: err.errors });
      }
      console.error("[CareLogr API] PATCH /applications/:id error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BLOG CATEGORIES
  // ══════════════════════════════════════════════════════════════════════════

  // GET /blog/categories
  r.get(`${base}/blog/categories`, async (_req, res) => {
    try {
      const categories = await storage.getAllBlogCategories();
      ok(res, categories, { total: categories.length });
    } catch (err) {
      console.error("[CareLogr API] GET /blog/categories error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // POST /blog/categories
  r.post(`${base}/blog/categories`, async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      });
      const body = schema.parse(req.body);
      const category = await storage.createBlogCategory(body);
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: "VALIDATION_ERROR", details: err.errors });
      }
      console.error("[CareLogr API] POST /blog/categories error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // PATCH /blog/categories/:id
  r.patch(`${base}/blog/categories/:id`, async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      });
      const body = schema.parse(req.body);
      const category = await storage.updateBlogCategory(req.params.id, body);
      if (!category) return notFound(res, "Category");
      ok(res, category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: "VALIDATION_ERROR", details: err.errors });
      }
      console.error("[CareLogr API] PATCH /blog/categories/:id error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // DELETE /blog/categories/:id
  r.delete(`${base}/blog/categories/:id`, async (req, res) => {
    try {
      const deleted = await storage.deleteBlogCategory(req.params.id);
      if (!deleted) {
        return res.status(400).json({
          success: false,
          error: "CANNOT_DELETE",
          message: "Category cannot be deleted — it still has blog posts assigned to it.",
        });
      }
      res.json({ success: true, message: "Category deleted." });
    } catch (err) {
      console.error("[CareLogr API] DELETE /blog/categories/:id error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BLOG POSTS
  // ══════════════════════════════════════════════════════════════════════════

  // GET /blog/posts/slug/:slug  — must be registered before /:id
  r.get(`${base}/blog/posts/slug/:slug`, async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) return notFound(res, "Blog post");
      ok(res, post);
    } catch (err) {
      console.error("[CareLogr API] GET /blog/posts/slug/:slug error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // GET /blog/posts
  r.get(`${base}/blog/posts`, async (req, res) => {
    try {
      const { isPublished, categoryId } = req.query as Record<string, string>;
      const filters: { isPublished?: boolean; categoryId?: string } = {};
      if (isPublished !== undefined) filters.isPublished = isPublished !== "false";
      if (categoryId) filters.categoryId = categoryId;

      const posts = await storage.getAllBlogPosts(filters);

      // Return summary stats alongside the list
      const total = posts.length;
      const published = posts.filter((p) => p.isPublished).length;
      const drafts = total - published;
      const totalViews = posts.reduce((sum, p) => sum + (p.viewCount ?? 0), 0);

      ok(res, posts, { total, published, drafts, totalViews });
    } catch (err) {
      console.error("[CareLogr API] GET /blog/posts error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // GET /blog/posts/:id
  r.get(`${base}/blog/posts/:id`, async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) return notFound(res, "Blog post");
      ok(res, post);
    } catch (err) {
      console.error("[CareLogr API] GET /blog/posts/:id error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // POST /blog/posts  — create a new draft post
  r.post(`${base}/blog/posts`, async (req, res) => {
    try {
      const { insertBlogPostSchema } = await import("@shared/schema");
      const body = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(body);
      res.status(201).json({ success: true, data: post });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: "VALIDATION_ERROR", details: err.errors });
      }
      console.error("[CareLogr API] POST /blog/posts error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // PATCH /blog/posts/:id  — update any post fields
  r.patch(`${base}/blog/posts/:id`, async (req, res) => {
    try {
      const { insertBlogPostSchema } = await import("@shared/schema");
      const body = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(req.params.id, body);
      if (!post) return notFound(res, "Blog post");
      ok(res, post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: "VALIDATION_ERROR", details: err.errors });
      }
      console.error("[CareLogr API] PATCH /blog/posts/:id error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // DELETE /blog/posts/:id
  r.delete(`${base}/blog/posts/:id`, async (req, res) => {
    try {
      const deleted = await storage.deleteBlogPost(req.params.id);
      if (!deleted) return notFound(res, "Blog post");
      res.json({ success: true, message: "Blog post deleted." });
    } catch (err) {
      console.error("[CareLogr API] DELETE /blog/posts/:id error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // POST /blog/posts/:id/publish  — make post live on the website
  r.post(`${base}/blog/posts/:id/publish`, async (req, res) => {
    try {
      const post = await storage.publishBlogPost(req.params.id);
      if (!post) return notFound(res, "Blog post");
      ok(res, post);
    } catch (err) {
      console.error("[CareLogr API] POST /blog/posts/:id/publish error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // POST /blog/posts/:id/unpublish  — hide post from website (back to draft)
  r.post(`${base}/blog/posts/:id/unpublish`, async (req, res) => {
    try {
      const post = await storage.unpublishBlogPost(req.params.id);
      if (!post) return notFound(res, "Blog post");
      ok(res, post);
    } catch (err) {
      console.error("[CareLogr API] POST /blog/posts/:id/unpublish error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });

  // POST /blog/posts/:id/view  — call this each time a visitor reads the post
  r.post(`${base}/blog/posts/:id/view`, async (req, res) => {
    try {
      const post = await storage.incrementBlogPostViews(req.params.id);
      if (!post) return notFound(res, "Blog post");
      res.json({ success: true, viewCount: post.viewCount });
    } catch (err) {
      console.error("[CareLogr API] POST /blog/posts/:id/view error:", err);
      res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  });
}
