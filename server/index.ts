import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./logger";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    const { serveStatic } = await import("./static");
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Set up daily CQC audit reminder check (runs every hour but only executes at 9 AM)
    setInterval(async () => {
      try {
        const now = new Date();
        
        // Only run the check at 9 AM (adjust timezone as needed)
        if (now.getHours() === 9 && now.getMinutes() < 60) {
          console.log('Running daily CQC audit reminder check...');
          
          // Make internal API call to check reminders
          const response = await fetch(`http://localhost:${port}/api/cqc/check-reminders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Note: In production, you'd need proper authentication for this internal call
              // For now, this is an internal system call
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('Daily CQC reminder check completed:', result.message);
          } else {
            console.error('Daily CQC reminder check failed:', response.statusText);
          }
        }
      } catch (error) {
        console.error('Error in daily CQC reminder check:', error);
      }
    }, 60 * 60 * 1000); // Check every hour
    
    console.log('CQC audit reminder system initialized - will check daily at 9 AM');
  });
})();
