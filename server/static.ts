import express, { type Express } from "express";
import path from "path";

export function serveStatic(app: Express) {
  // In production, the server is in the root and public folder is alongside it
  // Use process.cwd() which will be the deploy folder in Azure
  const publicPath = path.join(process.cwd(), "public");
  const indexPath = path.join(publicPath, "index.html");

  app.use(express.static(publicPath));

  app.use("*", (_req, res) => {
    res.sendFile(indexPath);
  });
}