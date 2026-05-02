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

  // Apply API key auth to every /api/carelogr/* route
  r.use(base, requireApiKey);

  // ── Health ─────────────────────────────────────────────────────────────────
  r.get(`${base}/health`, (_req, res) => {
    res.json({
      success: true,
      service: "Smeaton Healthcare API",
      version: API_VERSION,
      timestamp: new Date().toISOString(),
      resources: ["enquiries", "jobs", "applications"],
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
}
